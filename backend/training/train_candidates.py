"""
VyaparSathi Candidate Model Training
Trains candidate models using real user outcomes.
Writes ONLY to ai-service/models/candidates/ directory.
NEVER overwrites baseline models.
"""

import os
from datetime import datetime
from typing import Dict, Any, Tuple
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingClassifier
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from training.evaluate_models import evaluate_regression, evaluate_classification

CANDIDATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "candidates")
os.makedirs(CANDIDATES_DIR, exist_ok=True)

def train_profit_candidate(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    version_tag: str
) -> Tuple[str, Dict[str, Any]]:
    """
    Train a candidate Profit Prediction model (RandomForestRegressor).
    Target: actual_monthly_profit.
    """
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = evaluate_regression(y_test, y_pred)

    artifact_filename = f"vyaparsathi_profit_candidate_{version_tag}.pkl"
    artifact_path = os.path.join(CANDIDATES_DIR, artifact_filename)

    # Save candidate artifact
    joblib.dump(model, artifact_path)
    return artifact_path, metrics

def train_demand_candidate(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    version_tag: str
) -> Tuple[str, Dict[str, Any]]:
    """
    Train a candidate Demand Prediction model (Pipeline with OHE + RandomForestClassifier).
    Target: actual_demand.
    """
    numeric_features = ["market_distance_km", "budget"]
    categorical_features = ["business_category", "location_type"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
        ]
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    metrics = evaluate_classification(y_test, y_pred)

    artifact_filename = f"vyaparsathi_demand_candidate_{version_tag}.joblib"
    artifact_path = os.path.join(CANDIDATES_DIR, artifact_filename)

    joblib.dump(pipeline, artifact_path)
    return artifact_path, metrics

def train_category_candidate(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    version_tag: str
) -> Tuple[str, Dict[str, Any]]:
    """
    Train a candidate Business Category model (Pipeline with OHE + GradientBoostingClassifier).
    Target: actual_business_category.
    """
    numeric_features = ["budget", "experience_years", "land_available", "water_available", "electricity_available"]
    categorical_features = ["skill_level", "location_type"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
        ]
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(n_estimators=80, max_depth=5, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    metrics = evaluate_classification(y_test, y_pred)

    artifact_filename = f"vyaparsathi_category_candidate_{version_tag}.joblib"
    artifact_path = os.path.join(CANDIDATES_DIR, artifact_filename)

    joblib.dump(pipeline, artifact_path)
    return artifact_path, metrics

def train_suitability_candidate(*args, **kwargs):
    """Business suitability retraining is strictly prohibited without genuine objective label."""
    raise NotImplementedError(
        "Real-data retraining is BLOCKED for Business Suitability. "
        "No objective real-world ground truth label exists in user outcomes."
    )
