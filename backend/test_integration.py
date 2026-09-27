"""
VyaparSathi Comprehensive End-to-End Integration Test Suite
Tests:
- Model artifacts existence & pipeline structure
- Standalone inference
- FastAPI endpoints (health, category, demand, profit, suitability)
- Express gateway routes (category, demand, profit)
- Input validation boundaries (negative values, invalid binary, missing fields)
- Existing models preservation & regression check
"""

import os
import json
import urllib.request
import urllib.error
import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

CATEGORY_MODEL_PATH = os.path.join(MODELS_DIR, "vyaparsathi_business_category_model.joblib")
DEMAND_MODEL_PATH = os.path.join(MODELS_DIR, "vyaparsathi_demand_model.joblib")
PROFIT_MODEL_PATH = os.path.join(MODELS_DIR, "vyaparsathi_profit_model.pkl")
SUITABILITY_MODEL_PATH = os.path.join(MODELS_DIR, "vyaparsathi_business_suitability_model.pkl")

FASTAPI_URL = "http://127.0.0.1:8000"
EXPRESS_URL = "http://127.0.0.1:5000"

def http_post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": body}
    except Exception as e:
        return 0, {"error": str(e)}

def http_get(url):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": body}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("="*80)
    print("VYAPARSATHI END-TO-END ML INTEGRATION TEST SUITE")
    print("="*80)

    # 1. Verify Model Files Exist
    print("\n--- Test 1: Verify All Model Files Exist ---")
    assert os.path.exists(CATEGORY_MODEL_PATH), f"Missing {CATEGORY_MODEL_PATH}"
    assert os.path.exists(DEMAND_MODEL_PATH), f"Missing {DEMAND_MODEL_PATH}"
    assert os.path.exists(PROFIT_MODEL_PATH), f"Missing {PROFIT_MODEL_PATH}"
    assert os.path.exists(SUITABILITY_MODEL_PATH), f"Missing {SUITABILITY_MODEL_PATH}"
    print("PASS: All 4 model artifacts exist on disk.")

    # 2 & 3. Load Joblib Artifacts and Inspect Pipeline Structure
    print("\n--- Test 2 & 3: Load Joblib Pipelines & Verify Estimators ---")
    cat_pipe = joblib.load(CATEGORY_MODEL_PATH)
    dem_pipe = joblib.load(DEMAND_MODEL_PATH)

    assert isinstance(cat_pipe, Pipeline), "Category model is not a sklearn Pipeline"
    assert hasattr(cat_pipe, "predict_proba"), "Category model lacks predict_proba"
    print(f"Category Pipeline steps: {[name for name, _ in cat_pipe.steps]}")
    print(f"Category Classifier: {type(cat_pipe.named_steps['classifier']).__name__}")
    print(f"Category Classes ({len(cat_pipe.classes_)}): {list(cat_pipe.classes_)}")

    assert isinstance(dem_pipe, Pipeline), "Demand model is not a sklearn Pipeline"
    assert hasattr(dem_pipe, "predict_proba"), "Demand model lacks predict_proba"
    print(f"Demand Pipeline steps: {[name for name, _ in dem_pipe.steps]}")
    print(f"Demand Classifier: {type(dem_pipe.named_steps['classifier']).__name__}")
    print(f"Demand Classes ({len(dem_pipe.classes_)}): {list(dem_pipe.classes_)}")
    print("PASS: Both artifacts are valid complete preprocessing + classifier pipelines.")

    # 4. Standalone Inference Test
    print("\n--- Test 4: Standalone Raw Data Inference ---")
    sample_cat_df = pd.DataFrame([{
        "budget": 250000,
        "experience_years": 5,
        "skill_level": "Medium",
        "land_available": 1,
        "water_available": 1,
        "electricity_available": 1,
        "location_type": "Rural"
    }])
    cat_raw_probs = cat_pipe.predict_proba(sample_cat_df)[0]
    print(f"Category standalone probabilities sum: {np.sum(cat_raw_probs):.4f}")
    assert abs(np.sum(cat_raw_probs) - 1.0) < 1e-4

    sample_dem_df = pd.DataFrame([{
        "market_distance_km": 4.5,
        "budget": 280000,
        "business_category": "Dairy Processing",
        "location_type": "Rural"
    }])
    dem_raw_probs = dem_pipe.predict_proba(sample_dem_df)[0]
    print(f"Demand standalone probabilities sum: {np.sum(dem_raw_probs):.4f}")
    assert abs(np.sum(dem_raw_probs) - 1.0) < 1e-4
    print("PASS: Standalone inference executed flawlessly.")

    # 5 & 6. FastAPI Health Check
    print("\n--- Test 5 & 6: FastAPI Health Check ---")
    status, health_body = http_get(f"{FASTAPI_URL}/health")
    print(f"FastAPI /health (Status {status}):\n{json.dumps(health_body, indent=2)}")
    assert status == 200
    assert health_body["profitModelLoaded"] is True
    assert health_body["suitabilityModelLoaded"] is True
    assert health_body["businessCategoryModelLoaded"] is True
    assert health_body["demandModelLoaded"] is True
    print("PASS: FastAPI reports all four models successfully loaded.")

    # 7. FastAPI Business Category Prediction
    print("\n--- Test 7: FastAPI POST /api/ml/predict-business-category ---")
    cat_payload = {
        "budget": 120000,
        "experience_years": 3,
        "skill_level": "Medium",
        "land_available": 1,
        "water_available": 1,
        "electricity_available": 1,
        "location_type": "Rural"
    }
    status, cat_res = http_post(f"{FASTAPI_URL}/api/ml/predict-business-category", cat_payload)
    print(f"Request: {json.dumps(cat_payload)}")
    print(f"Response (Status {status}):\n{json.dumps(cat_res, indent=2)}")
    assert status == 200
    assert cat_res["success"] is True
    assert len(cat_res["recommendations"]) == 3
    assert cat_res["recommended_business"] == cat_res["recommendations"][0]["business_category"]
    assert "Prototype validation on synthetic data" in cat_res["model_disclaimer"]
    print("PASS: FastAPI business category prediction returned valid Top 3 recommendations.")

    # 8. FastAPI Expected Demand Prediction
    print("\n--- Test 8: FastAPI POST /api/ml/predict-demand ---")
    dem_payload = {
        "market_distance_km": 3.0,
        "budget": 350000,
        "business_category": "Food Processing",
        "location_type": "Semi-Urban"
    }
    status, dem_res = http_post(f"{FASTAPI_URL}/api/ml/predict-demand", dem_payload)
    print(f"Request: {json.dumps(dem_payload)}")
    print(f"Response (Status {status}):\n{json.dumps(dem_res, indent=2)}")
    assert status == 200
    assert dem_res["success"] is True
    assert dem_res["predicted_demand"] in ["High", "Medium", "Low"]
    assert set(dem_res["probabilities"].keys()) == {"High", "Medium", "Low"}
    assert "Prototype validation on synthetic data" in dem_res["model_disclaimer"]
    print("PASS: FastAPI expected demand prediction returned valid class probabilities.")

    # 9. FastAPI Existing Profit Prediction Regression Test
    print("\n--- Test 9: FastAPI POST /api/ml/predict-profit (Existing Model Regression) ---")
    prof_payload = {
        "budget": 450000,
        "experience_years": 6,
        "land_available": 1,
        "workers": 3,
        "electricity_available": 1,
        "water_available": 1,
        "market_distance_km": 4.2,
        "business_suitability_score": 0.82,
        "budget_per_worker": 150000
    }
    status, prof_res = http_post(f"{FASTAPI_URL}/api/ml/predict-profit", prof_payload)
    print(f"Request: {json.dumps(prof_payload)}")
    print(f"Response (Status {status}):\n{json.dumps(prof_res, indent=2)}")
    assert status == 200
    assert prof_res["success"] is True
    assert prof_res["predicted_monthly_profit"] > 0
    print("PASS: Existing Profit Prediction model operational.")

    # 10. FastAPI Existing Business Suitability Regression Test
    print("\n--- Test 10: FastAPI POST /api/ml/predict-business-suitability (Existing Model Regression) ---")
    suit_payload = {
        "investment_budget": 500000,
        "experience_years": 5,
        "land_available": 1,
        "water_available": 1,
        "electricity_available": 1,
        "market_distance_km": 3.5,
        "competitor_count": 2,
        "workers": 3
    }
    status, suit_res = http_post(f"{FASTAPI_URL}/api/ml/predict-business-suitability", suit_payload)
    print(f"Request: {json.dumps(suit_payload)}")
    print(f"Response (Status {status}):\n{json.dumps(suit_res, indent=2)}")
    assert status == 200
    assert suit_res["success"] is True
    assert 0.0 <= suit_res["business_suitability_score"] <= 1.0
    print("PASS: Existing Business Suitability model operational.")

    # 11. Express Gateway Health
    print("\n--- Test 11: Express Gateway Health Check ---")
    status, exp_health = http_get(f"{EXPRESS_URL}/api/ai/health")
    print(f"Express /api/ai/health (Status {status}):\n{json.dumps(exp_health, indent=2)}")
    assert status == 200
    assert exp_health["status"] == "online"
    print("PASS: Express gateway connectivity to FastAPI verified.")

    # 12. Express Gateway Business Category
    print("\n--- Test 12: Express Gateway POST /api/ai/predict-business-category ---")
    status, exp_cat = http_post(f"{EXPRESS_URL}/api/ai/predict-business-category", cat_payload)
    print(f"Express Response (Status {status}):\n{json.dumps(exp_cat, indent=2)}")
    assert status == 200
    assert exp_cat["success"] is True
    assert len(exp_cat["recommendations"]) == 3
    print("PASS: Express gateway forward to Business Category model successful.")

    # 13. Express Gateway Expected Demand
    print("\n--- Test 13: Express Gateway POST /api/ai/predict-demand ---")
    status, exp_dem = http_post(f"{EXPRESS_URL}/api/ai/predict-demand", dem_payload)
    print(f"Express Response (Status {status}):\n{json.dumps(exp_dem, indent=2)}")
    assert status == 200
    assert exp_dem["success"] is True
    assert exp_dem["predicted_demand"] in ["High", "Medium", "Low"]
    print("PASS: Express gateway forward to Expected Demand model successful.")

    # 14. Express Gateway Existing Profit
    print("\n--- Test 14: Express Gateway POST /api/ai/predict-profit ---")
    status, exp_prof = http_post(f"{EXPRESS_URL}/api/ai/predict-profit", prof_payload)
    print(f"Express Response (Status {status}):\n{json.dumps(exp_prof, indent=2)}")
    assert status == 200
    assert exp_prof["success"] is True
    assert exp_prof["predicted_monthly_profit"] > 0
    print("PASS: Express gateway forward to Profit model successful.")

    # 15 & 16. Input Validation & Bounds Checking
    print("\n--- Test 15 & 16: Input Validation & Boundary Errors ---")
    # Negative budget for Category
    bad_cat_1 = dict(cat_payload, budget=-5000)
    status, res = http_post(f"{FASTAPI_URL}/api/ml/predict-business-category", bad_cat_1)
    print(f"Negative Budget (Status {status}): {res}")
    assert status == 400

    # Negative experience for Category
    bad_cat_2 = dict(cat_payload, experience_years=-2)
    status, res = http_post(f"{FASTAPI_URL}/api/ml/predict-business-category", bad_cat_2)
    print(f"Negative Experience (Status {status}): {res}")
    assert status == 400

    # Invalid binary field for Category (land_available = 5)
    bad_cat_3 = dict(cat_payload, land_available=5)
    status, res = http_post(f"{FASTAPI_URL}/api/ml/predict-business-category", bad_cat_3)
    print(f"Invalid Binary land_available=5 (Status {status}): {res}")
    assert status == 400

    # Negative market distance for Demand
    bad_dem_1 = dict(dem_payload, market_distance_km=-10)
    status, res = http_post(f"{FASTAPI_URL}/api/ml/predict-demand", bad_dem_1)
    print(f"Negative Market Distance (Status {status}): {res}")
    assert status == 400

    # Missing required field for Category
    bad_cat_missing = {"budget": 100000}
    status, res = http_post(f"{FASTAPI_URL}/api/ml/predict-business-category", bad_cat_missing)
    print(f"Missing Fields (Status {status}): {res.get('detail', res)}")
    assert status in (400, 422)

    print("PASS: Malformed and boundary-violating inputs correctly rejected with 400/422; zero fake predictions produced.")

    print("\n" + "="*80)
    print("ALL 18 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!")
    print("="*80)

if __name__ == "__main__":
    run_tests()
