"""
VyaparSathi Machine Learning Model Training Script
Target: monthly_profit
Algorithm: RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
Pipeline: Complete Preprocessing (Scaling) + Random Forest Regressor Pipeline saved via Joblib.

NOTE: This prototype model is trained on a synthetic dataset representative of rural Maharashtra
micro-enterprises (Agri, Dairy, Food Processing, MSME). It is not claimed to be trained on
production real-world data. It can later be retrained on real MongoDB business performance data.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib

FEATURES = [
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

def generate_synthetic_prototype_data(n_samples=2500, random_seed=42):
    np.random.seed(random_seed)

    # Synthetic features representative of rural micro-enterprises
    budget = np.random.uniform(50000, 1500000, n_samples)
    experience_years = np.random.uniform(0, 18, n_samples)
    land_available = np.random.choice([0, 1], size=n_samples, p=[0.35, 0.65])
    workers = np.random.randint(1, 10, size=n_samples)
    electricity_available = np.random.choice([0, 1], size=n_samples, p=[0.2, 0.8])
    water_available = np.random.choice([0, 1], size=n_samples, p=[0.25, 0.75])
    market_distance_km = np.random.uniform(0.5, 35.0, n_samples)
    business_suitability_score = np.random.uniform(0.4, 0.98, n_samples)
    budget_per_worker = budget / workers

    # Realistic synthetic profit formula reflecting rural micro-business returns
    # No target leakage: monthly_profit, monthly_revenue, monthly_expenses, profit_margin NOT in features
    base_return = budget * 0.028 * business_suitability_score
    exp_boost = experience_years * 750
    infra_boost = (land_available * 4500) + (electricity_available * 3500) + (water_available * 4000)
    distance_penalty = market_distance_km * 220
    efficiency_boost = np.clip(budget_per_worker * 0.012, 0, 12000)
    noise = np.random.normal(0, 1800, n_samples)

    monthly_profit = np.maximum(
        4000,
        base_return + exp_boost + infra_boost - distance_penalty + efficiency_boost + noise
    )

    df = pd.DataFrame({
        "budget": budget,
        "experience_years": experience_years,
        "land_available": land_available,
        "workers": workers,
        "electricity_available": electricity_available,
        "water_available": water_available,
        "market_distance_km": market_distance_km,
        "business_suitability_score": business_suitability_score,
        "budget_per_worker": budget_per_worker,
        "monthly_profit": monthly_profit
    })

    return df

def train_and_save_model():
    print("[VyaparSathi ML] Generating synthetic training dataset...")
    data = generate_synthetic_prototype_data()

    X = data[FEATURES]
    y = data["monthly_profit"]

    print(f"[VyaparSathi ML] Training RandomForestRegressor with {len(FEATURES)} leakage-free features on {len(X)} samples...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        ))
    ])

    pipeline.fit(X, y)

    # Ensure output directory exists
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "vyaparsathi_profit_model.pkl")

    joblib.dump(pipeline, model_path)
    print(f"[VyaparSathi ML] Pipeline successfully trained and saved to: {model_path}")

    # Test single prediction
    sample_input = pd.DataFrame([{
        "budget": 100000.0,
        "experience_years": 5.0,
        "land_available": 1,
        "workers": 3.0,
        "electricity_available": 1,
        "water_available": 1,
        "market_distance_km": 4.0,
        "business_suitability_score": 0.85,
        "budget_per_worker": 33333.0
    }])[FEATURES]

    pred = pipeline.predict(sample_input)[0]
    print(f"[VyaparSathi ML] Test sample predicted monthly profit: Rs. {round(pred, 2)}")

if __name__ == "__main__":
    train_and_save_model()
