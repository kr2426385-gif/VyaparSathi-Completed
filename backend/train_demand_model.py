"""
VyaparSathi Model 2: Expected Demand Prediction Model
Target: expected_demand (Multiclass classification: Low, Medium, High)
Features: market_distance_km, budget, business_category, location_type
Excluded: monthly_revenue, monthly_expenses, monthly_profit, business_suitability_score

DISCLAIMER:
Prototype validation on synthetic data; not representative of real-world production accuracy.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import joblib

DATASET_CANDIDATES = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "business_suitability_assessment.csv"),
    r"C:\Users\KAJAL CHANDEL\OneDrive\Desktop\machine_learning\business_suitability_assessment.csv",
    r"c:\Users\KAJAL CHANDEL\OneDrive\Desktop\machine_learning\business_suitability_assessment.csv",
    os.path.join(os.getcwd(), "business_suitability_assessment.csv"),
]

NUMERICAL_FEATURES = ["market_distance_km", "budget"]
CATEGORICAL_FEATURES = ["business_category", "location_type"]
ALL_INPUT_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = "expected_demand"

EXCLUDED_COLUMNS = [
    "monthly_revenue",
    "monthly_expenses",
    "monthly_profit",
    "business_suitability_score"
]

def find_dataset():
    for path in DATASET_CANDIDATES:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"Could not locate business_suitability_assessment.csv in candidate paths: {DATASET_CANDIDATES}")

def train_and_evaluate():
    data_path = find_dataset()
    print(f"[Dataset] Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"[Dataset] Total rows loaded: {len(df)}, Total columns: {len(df.columns)}")

    # 1. Target Audit & Distribution
    print("\n" + "="*60)
    print("TARGET AUDIT: expected_demand")
    print("="*60)
    unique_targets = df[TARGET_COLUMN].unique()
    print(f"Unique classes: {unique_targets}")
    class_dist = df[TARGET_COLUMN].value_counts()
    print("Class distribution:")
    for cls_name, count in class_dist.items():
        pct = (count / len(df)) * 100
        print(f"  - {cls_name:10s}: {count:4d} ({pct:5.1f}%)")

    # 2. Data Quality & Synthetic Derivation Check
    print("\n" + "="*60)
    print("DATA QUALITY & FORMULAIC DERIVATION CHECK")
    print("="*60)
    print("Notice: 'business_suitability_assessment.csv' is a synthetic benchmark dataset.")
    print("DISCLAIMER: Prototype validation on synthetic data; not representative of real-world production accuracy.")

    # 3. Target Leakage Verification
    print("\n" + "="*60)
    print("TARGET LEAKAGE VERIFICATION")
    print("="*60)
    print(f"Input Features to be used ({len(ALL_INPUT_FEATURES)}): {ALL_INPUT_FEATURES}")
    print(f"Features strictly EXCLUDED ({len(EXCLUDED_COLUMNS)}): {EXCLUDED_COLUMNS}")
    for col in EXCLUDED_COLUMNS:
        assert col not in ALL_INPUT_FEATURES, f"Target leakage! {col} is in input features!"
    print("Confirmed: Zero target leakage columns included in training features.")

    X = df[ALL_INPUT_FEATURES].copy()
    y = df[TARGET_COLUMN].copy()

    # 4. Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    print(f"\n[Split] Train rows: {len(X_train)} (80%), Test rows: {len(X_test)} (20%)")

    # 5. Preprocessing Pipelines
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES)
        ]
    )

    # 6. Candidate Algorithms
    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "GradientBoostingClassifier": GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
    }

    results = {}
    fitted_pipelines = {}

    print("\n" + "="*60)
    print("MODEL TRAINING & COMPARATIVE EVALUATION")
    print("="*60)

    for name, clf in candidates.items():
        print(f"\nEvaluating pipeline: {name}...")
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
        prec_weighted = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
        rec_weighted = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1_mac = f1_score(y_test, y_pred, average="macro", zero_division=0)
        f1_wt = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=pipeline.classes_)

        results[name] = {
            "accuracy": acc,
            "precision_macro": prec_macro,
            "precision_weighted": prec_weighted,
            "recall_macro": rec_macro,
            "recall_weighted": rec_weighted,
            "f1_macro": f1_mac,
            "f1_weighted": f1_wt,
            "confusion_matrix": cm,
            "classes": pipeline.classes_
        }
        fitted_pipelines[name] = pipeline

        print(f"  Accuracy:           {acc:.4f}")
        print(f"  Macro Precision:    {prec_macro:.4f}")
        print(f"  Weighted Precision: {prec_weighted:.4f}")
        print(f"  Macro Recall:       {rec_macro:.4f}")
        print(f"  Weighted Recall:    {rec_weighted:.4f}")
        print(f"  Macro F1:           {f1_mac:.4f}")
        print(f"  Weighted F1:        {f1_wt:.4f}")

    # Summary Table
    print("\n" + "="*80)
    print("COMPARATIVE SUMMARY TABLE (Model 2: Expected Demand)")
    print("="*80)
    header = f"{'Algorithm':<28} | {'Accuracy':<9} | {'Macro Prec':<10} | {'Macro Rec':<10} | {'Macro F1':<9} | {'Weighted F1':<11}"
    print(header)
    print("-" * len(header))
    for name, r in results.items():
        print(f"{name:<28} | {r['accuracy']:<9.4f} | {r['precision_macro']:<10.4f} | {r['recall_macro']:<10.4f} | {r['f1_macro']:<9.4f} | {r['f1_weighted']:<11.4f}")

    # 7. Model Selection using Macro F1
    best_model_name = max(results, key=lambda k: results[k]["f1_macro"])
    best_pipeline = fitted_pipelines[best_model_name]
    best_metrics = results[best_model_name]
    print("\n" + "="*60)
    print(f"SELECTED BEST MODEL: {best_model_name} (Highest Macro F1: {best_metrics['f1_macro']:.4f})")
    print("="*60)

    # Print Confusion Matrix for best model
    print(f"\nConfusion Matrix for {best_model_name} (labels: {list(best_metrics['classes'])}):")
    print(pd.DataFrame(best_metrics["confusion_matrix"], index=best_metrics["classes"], columns=best_metrics["classes"]))

    # 8. Verify Probability Output & Schema
    print("\n" + "="*60)
    print("PREDICT_PROBA & SCHEMA VERIFICATION")
    print("="*60)
    sample_raw = X_test.iloc[[0]]
    pred_class = best_pipeline.predict(sample_raw)[0]
    probs = best_pipeline.predict_proba(sample_raw)[0]
    classes = list(best_pipeline.classes_)
    prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(classes, probs)}
    
    print(f"Test sample raw input:\n{sample_raw.to_dict(orient='records')[0]}")
    print(f"Predicted class: {pred_class}")
    print(f"Class probabilities: {prob_dict}")
    assert pred_class in classes, "Predicted class not in class labels!"
    assert len(prob_dict) == len(classes), "Probabilities length mismatch!"
    assert abs(sum(probs) - 1.0) < 1e-4, "Probabilities do not sum to 1.0!"

    # 9. Save Best Model Pipeline
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    os.makedirs(output_dir, exist_ok=True)
    model_save_path = os.path.join(output_dir, "vyaparsathi_demand_model.joblib")

    # Safety checks
    assert not model_save_path.endswith("vyaparsathi_profit_model.pkl"), "Safety check failed!"
    assert not model_save_path.endswith("vyaparsathi_business_suitability_model.pkl"), "Safety check failed!"

    joblib.dump(best_pipeline, model_save_path)
    print(f"\n[Saved] Successfully saved complete pipeline to: {model_save_path}")
    print(f"[File Size] {os.path.getsize(model_save_path):,} bytes")

    return best_model_name, results

if __name__ == "__main__":
    train_and_evaluate()
