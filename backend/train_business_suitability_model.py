"""
VyaparSathi Business Suitability Machine Learning Model Training Script
Target: business_suitability_score (0.0 to 1.0)
Algorithm: RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
Pipeline: StandardScaler + RandomForestRegressor saved as a complete Joblib pipeline.

DISCLAIMER / DATA AUDIT NOTE:
This prototype model is trained on a clearly labeled SYNTHETIC PROTOTYPE dataset
representing rural Maharashtra micro-enterprise resource constraints.
It is NOT claimed to be trained on real-world survey or census data.
Real production data will be gathered from District Industries Centre (DIC) applications
and verified Udyam assist registrations before production retraining.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

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

def generate_synthetic_suitability_data(n_samples=2500, random_seed=42):
    np.random.seed(random_seed)

    investment_budget = np.random.uniform(50000, 1500000, n_samples)
    experience_years = np.random.uniform(0, 20, n_samples)
    land_available = np.random.choice([0, 1], size=n_samples, p=[0.35, 0.65])
    water_available = np.random.choice([0, 1], size=n_samples, p=[0.25, 0.75])
    electricity_available = np.random.choice([0, 1], size=n_samples, p=[0.20, 0.80])
    market_distance_km = np.random.uniform(0.5, 40.0, n_samples)
    competitor_count = np.random.randint(0, 12, size=n_samples)
    workers = np.random.randint(1, 10, size=n_samples)

    # Grounded heuristic formula for prototype business suitability
    # High capital + infra + experience + low competition + close to market = high suitability
    budget_score = np.clip(investment_budget / 800000.0, 0.1, 0.3)
    exp_score = np.clip(experience_years / 20.0, 0.0, 0.2)
    infra_score = (land_available * 0.15) + (water_available * 0.12) + (electricity_available * 0.13)
    distance_penalty = np.clip(market_distance_km / 80.0, 0.0, 0.15)
    competition_penalty = np.clip(competitor_count * 0.015, 0.0, 0.12)
    workforce_bonus = np.clip(workers * 0.01, 0.0, 0.06)
    noise = np.random.normal(0, 0.03, n_samples)

    raw_score = budget_score + exp_score + infra_score - distance_penalty - competition_penalty + workforce_bonus + noise
    suitability_score = np.clip(raw_score, 0.15, 0.98)

    df = pd.DataFrame({
        "investment_budget": investment_budget,
        "experience_years": experience_years,
        "land_available": land_available,
        "water_available": water_available,
        "electricity_available": electricity_available,
        "market_distance_km": market_distance_km,
        "competitor_count": competitor_count,
        "workers": workers,
        "business_suitability_score": suitability_score
    })
    return df

def train_and_save_suitability_model():
    print("[VyaparSathi ML] Generating synthetic prototype suitability dataset...")
    data = generate_synthetic_suitability_data()

    X = data[SUITABILITY_FEATURES]
    y = data["business_suitability_score"]

    # Split for validation metrics
    split_idx = int(0.8 * len(X))
    X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_val = y.iloc[:split_idx], y.iloc[split_idx:]

    print(f"[VyaparSathi ML] Training Business Suitability RandomForest on {len(X_train)} samples...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)

    # Evaluate on synthetic validation split
    preds = pipeline.predict(X_val)
    mae = mean_absolute_error(y_val, preds)
    rmse = np.sqrt(mean_squared_error(y_val, preds))
    r2 = r2_score(y_val, preds)

    print(f"[VyaparSathi ML - Synthetic Prototype Validation]")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R²:   {r2:.4f}")

    # Retrain on full dataset
    pipeline.fit(X, y)

    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "vyaparsathi_business_suitability_model.pkl")

    joblib.dump(pipeline, model_path)
    print(f"[VyaparSathi ML] Pipeline successfully saved to: {model_path}")

if __name__ == "__main__":
    train_and_save_suitability_model()
