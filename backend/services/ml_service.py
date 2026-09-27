import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

PROFIT_FEATURES = [
    "budget",
    "experience_years",
    "land_available",
    "workers",
    "electricity_available",
    "water_available",
    "market_distance_km",
    "business_suitability_score",
    "budget_per_worker"
]

SUITABILITY_FEATURES = [
    "investment_budget",
    "experience_years",
    "land_available",
    "water_available",
    "electricity_available",
    "market_distance_km",
    "competitor_count",
    "workers"
]

BUSINESS_CATEGORY_FEATURES = [
    "budget",
    "experience_years",
    "skill_level",
    "land_available",
    "water_available",
    "electricity_available",
    "location_type"
]

DEMAND_FEATURES = [
    "market_distance_km",
    "budget",
    "business_category",
    "location_type"
]

MODEL_DISCLAIMER = "Prototype validation on synthetic data; not representative of real-world production accuracy."

class MLService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.profit_model_path = os.path.join(base_dir, "models", "vyaparsathi_profit_model.pkl")
        self.suitability_model_path = os.path.join(base_dir, "models", "vyaparsathi_business_suitability_model.pkl")
        self.business_category_model_path = os.path.join(base_dir, "models", "vyaparsathi_business_category_model.joblib")
        self.demand_model_path = os.path.join(base_dir, "models", "vyaparsathi_demand_model.joblib")

        self.profit_model = None
        self.suitability_model = None
        self.business_category_model = None
        self.demand_model = None

        self.model_metadata = {
            "profit_prediction": {"modelVersion": "1.0.0-baseline", "modelStatus": "active", "dataStatus": "synthetic_prototype"},
            "demand_prediction": {"modelVersion": "1.0.0-baseline", "modelStatus": "active", "dataStatus": "synthetic_prototype"},
            "business_category": {"modelVersion": "1.0.0-baseline", "modelStatus": "active", "dataStatus": "synthetic_prototype"},
            "business_suitability": {"modelVersion": "1.0.0-baseline", "modelStatus": "active", "dataStatus": "synthetic_prototype"}
        }

        self._load_profit_model()
        self._load_suitability_model()
        self._load_business_category_model()
        self._load_demand_model()

    def _load_model_safe(self, model_key: str, default_path: str):
        """
        Dynamically loads active registered model with checksum verification and smoke test.
        Falls back to baseline model if active is invalid or corrupted.
        """
        try:
            from training.model_registry import registry
            from training.quality_gate import verify_smoke_inference
            
            chosen_path, meta = registry.get_active_model_info(model_key)
            if chosen_path and os.path.exists(chosen_path):
                smoke_ok, msg = verify_smoke_inference(model_key, chosen_path)
                if smoke_ok:
                    loaded = joblib.load(chosen_path)
                    self.model_metadata[model_key] = {
                        "modelVersion": meta.get("version", "1.0.0"),
                        "modelStatus": meta.get("status", "active"),
                        "dataStatus": meta.get("data_status", "synthetic_prototype")
                    }
                    print(f"[MLService] Loaded active {model_key} ({meta.get('version')}) from {chosen_path}")
                    return loaded
                else:
                    print(f"[MLService] Smoke test failed for active {model_key}: {msg}. Falling back to baseline.")
        except Exception as e:
            print(f"[MLService] Registry loading error for {model_key}: {e}. Falling back to baseline path.")

        # Fallback to baseline default path
        if os.path.exists(default_path):
            try:
                loaded = joblib.load(default_path)
                self.model_metadata[model_key] = {
                    "modelVersion": "1.0.0-baseline",
                    "modelStatus": "baseline",
                    "dataStatus": "synthetic_prototype"
                }
                print(f"[MLService] Loaded baseline {model_key} from {default_path}")
                return loaded
            except Exception as ex:
                print(f"[MLService] Critical: Baseline loading failed for {model_key}: {ex}")
        return None

    def _load_profit_model(self):
        self.profit_model = self._load_model_safe("profit_prediction", self.profit_model_path)

    def _load_suitability_model(self):
        self.suitability_model = self._load_model_safe("business_suitability", self.suitability_model_path)

    def _load_business_category_model(self):
        self.business_category_model = self._load_model_safe("business_category", self.business_category_model_path)

    def _load_demand_model(self):
        self.demand_model = self._load_model_safe("demand_prediction", self.demand_model_path)

    def get_metadata(self, model_key: str) -> Dict[str, Any]:
        return self.model_metadata.get(model_key, {
            "modelVersion": "unknown",
            "modelStatus": "unavailable",
            "dataStatus": "unavailable"
        })

    def is_profit_available(self) -> bool:
        return self.profit_model is not None

    def is_suitability_available(self) -> bool:
        return self.suitability_model is not None

    def is_business_category_available(self) -> bool:
        return self.business_category_model is not None

    def is_demand_available(self) -> bool:
        return self.demand_model is not None

    def predict_profit(self, data: Dict[str, Any]) -> float:
        if self.profit_model is None:
            self._load_profit_model()
            if self.profit_model is None:
                raise RuntimeError("Profit Prediction ML model is currently unavailable.")

        row = {}
        for feature in PROFIT_FEATURES:
            if feature not in data:
                raise ValueError(f"Missing required feature for profit prediction: '{feature}'")
            try:
                row[feature] = float(data[feature])
            except (ValueError, TypeError):
                raise ValueError(f"Feature '{feature}' must be a numeric value, got: {data[feature]}")

        df = pd.DataFrame([row])[PROFIT_FEATURES]
        prediction = self.profit_model.predict(df)[0]
        return float(prediction)

    def predict_business_suitability(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if self.suitability_model is None:
            self._load_suitability_model()
            if self.suitability_model is None:
                raise RuntimeError("Business Suitability ML model is currently unavailable.")

        row = {}
        for feature in SUITABILITY_FEATURES:
            if feature not in data:
                raise ValueError(f"Missing required feature for business suitability prediction: '{feature}'")
            try:
                row[feature] = float(data[feature])
            except (ValueError, TypeError):
                raise ValueError(f"Feature '{feature}' must be a numeric value, got: {data[feature]}")

        df = pd.DataFrame([row])[SUITABILITY_FEATURES]
        score = float(self.suitability_model.predict(df)[0])
        # Bound score between 0.1 and 0.99
        score = max(0.1, min(0.99, score))

        if score >= 0.75:
            level = "High"
            recommendations = [
                "Strong foundational resources for enterprise setup in this taluka.",
                "Eligible for fast-track credit appraisal under CMEGP / PMEGP.",
                "Proceed to detailed financial gap assessment."
            ]
        elif score >= 0.50:
            level = "Moderate"
            recommendations = [
                "Adequate feasibility; consider securing reliable water or 3-phase electricity backup.",
                "Optimize distance to nearest weekly APMC haat to lower logistics overhead.",
                "Review MUDRA Kishore or PMFME subsidy scheme to bridge margin requirements."
            ]
        else:
            level = "Needs Infrastructure Optimization"
            recommendations = [
                "High logistical or infrastructural constraints identified.",
                "Explore village cooperative aggregation or partner with local Farmer Producer Company (FPC).",
                "Acquire additional local trade experience or conduct buyer validation before capital commitment."
            ]

        return {
            "business_suitability_score": round(score, 4),
            "suitability_level": level,
            "recommendations": recommendations,
            "model_type": "RandomForestRegressor (Synthetic Prototype)"
        }

    def predict_business_category(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if self.business_category_model is None:
            self._load_business_category_model()
            if self.business_category_model is None:
                raise RuntimeError("Business Category Recommendation ML model is currently unavailable.")

        row = {}
        for feature in BUSINESS_CATEGORY_FEATURES:
            if feature not in data:
                raise ValueError(f"Missing required feature for business category recommendation: '{feature}'")
            val = data[feature]
            if feature in ["budget", "experience_years"]:
                try:
                    row[feature] = float(val)
                except (ValueError, TypeError):
                    raise ValueError(f"Feature '{feature}' must be a numeric value, got: {val}")
            elif feature in ["land_available", "water_available", "electricity_available"]:
                try:
                    int_val = int(val)
                    if int_val not in (0, 1):
                        raise ValueError(f"Feature '{feature}' must be 0 or 1, got: {val}")
                    row[feature] = int_val
                except (ValueError, TypeError):
                    raise ValueError(f"Feature '{feature}' must be 0 or 1, got: {val}")
            else:
                row[feature] = str(val).strip()

        df = pd.DataFrame([row])[BUSINESS_CATEGORY_FEATURES]

        # Use predict_proba for probabilities and model.classes_ for correct labels
        probs = self.business_category_model.predict_proba(df)[0]
        classes = self.business_category_model.classes_

        sorted_indices = np.argsort(probs)[::-1]
        top_recommendations = []
        for idx in sorted_indices[:3]:
            top_recommendations.append({
                "business_category": str(classes[idx]),
                "probability": round(float(probs[idx]), 4)
            })

        best_category = top_recommendations[0]["business_category"] if top_recommendations else ""

        return {
            "success": True,
            "recommended_business": best_category,
            "recommendations": top_recommendations,
            "model_disclaimer": MODEL_DISCLAIMER
        }

    def predict_demand(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if self.demand_model is None:
            self._load_demand_model()
            if self.demand_model is None:
                raise RuntimeError("Expected Demand Prediction ML model is currently unavailable.")

        row = {}
        for feature in DEMAND_FEATURES:
            if feature not in data:
                raise ValueError(f"Missing required feature for expected demand prediction: '{feature}'")
            val = data[feature]
            if feature in ["market_distance_km", "budget"]:
                try:
                    row[feature] = float(val)
                except (ValueError, TypeError):
                    raise ValueError(f"Feature '{feature}' must be a numeric value, got: {val}")
            else:
                row[feature] = str(val).strip()

        df = pd.DataFrame([row])[DEMAND_FEATURES]

        predicted_class = str(self.demand_model.predict(df)[0])
        probs = self.demand_model.predict_proba(df)[0]
        classes = self.demand_model.classes_

        probabilities = {
            str(cls): round(float(prob), 4)
            for cls, prob in zip(classes, probs)
        }

        return {
            "success": True,
            "predicted_demand": predicted_class,
            "probabilities": probabilities,
            "model_disclaimer": MODEL_DISCLAIMER
        }

# Singleton instance
ml_service = MLService()
