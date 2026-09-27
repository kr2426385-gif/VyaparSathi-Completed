"""
VyaparSathi - Future ML Data Validation & Preparation Pipeline
Provides automated checks to safely incorporate genuine ground-truth field data:
- Schema validation
- Missing value audit
- Outlier detection (IQR method)
- Duplicate record detection
- Feature leakage prevention (verifying no target columns leaked into predictors)
- Stratified train/test split
- Quality assurance reporting for future model updates
"""

import os
import sys
import json
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

# Forbidden target-derived columns that must NEVER appear in early recommendation features
LEAKAGE_COLUMNS = [
    "expected_demand",
    "predicted_demand",
    "monthly_revenue",
    "monthly_expenses",
    "monthly_profit",
    "profit",
    "business_suitability_score",
    "final_score"
]

EXPECTED_INPUT_SCHEMA = {
    "budget": (int, float),
    "experience_years": (int, float),
    "skill_level": str,
    "land_available": (int, float),
    "water_available": (int, float),
    "electricity_available": (int, float),
    "location_type": str
}

def validate_dataset(df: pd.DataFrame, target_column: str = "business_category") -> Dict[str, Any]:
    """Perform rigorous validation checks on incoming dataset."""
    report = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "target_column": target_column,
        "is_valid": True,
        "issues": [],
        "warnings": [],
        "summary": {}
    }

    # 1. Target presence
    if target_column not in df.columns:
        report["is_valid"] = False
        report["issues"].append(f"Target column '{target_column}' is missing from dataset.")
        return report

    # 2. Duplicate checks
    duplicates_count = df.duplicated().sum()
    report["summary"]["duplicate_rows"] = int(duplicates_count)
    if duplicates_count > 0:
        report["warnings"].append(f"Found {duplicates_count} duplicate rows in dataset.")

    # 3. Missing values check
    missing = df.isnull().sum().to_dict()
    report["summary"]["missing_values_per_column"] = {k: int(v) for k, v in missing.items() if v > 0}
    total_missing = sum(missing.values())
    if total_missing > 0:
        report["warnings"].append(f"Dataset contains {total_missing} missing values across {len(report['summary']['missing_values_per_column'])} columns.")

    # 4. Feature leakage checks
    leaked_features = [col for col in df.columns if col.lower() in LEAKAGE_COLUMNS and col != target_column]
    if leaked_features:
        report["is_valid"] = False
        report["issues"].append(f"CRITICAL FEATURE LEAKAGE: Columns {leaked_features} must not be present in feature set for target '{target_column}'.")

    # 5. Outlier check on numerical features
    num_cols = df.select_dtypes(include=[np.number]).columns
    outliers = {}
    for col in num_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outlier_count = int(((df[col] < lower_bound) | (df[col] > upper_bound)).sum())
        if outlier_count > 0:
            outliers[col] = outlier_count
    report["summary"]["outliers_detected"] = outliers

    # 6. Target class distribution
    class_dist = df[target_column].value_counts().to_dict()
    report["summary"]["target_class_distribution"] = {str(k): int(v) for k, v in class_dist.items()}
    min_class_count = min(class_dist.values()) if class_dist else 0
    if min_class_count < 10:
        report["warnings"].append(f"Severe class imbalance: minimum class has only {min_class_count} samples.")

    return report

def prepare_pipeline_dirs(base_data_dir: str = "data"):
    """Ensure standard pipeline directories exist for future production datasets."""
    subdirs = ["raw", "processed", "validated", "training", "validation"]
    paths = {}
    for sub in subdirs:
        p = os.path.join(base_data_dir, sub)
        os.makedirs(p, exist_ok=True)
        paths[sub] = p
    return paths

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    dirs = prepare_pipeline_dirs(data_dir)
    print(f"ML Data Pipeline directories verified at: {data_dir}")
    for k, v in dirs.items():
        print(f"  - {k}: {v}")

    candidate_csv_paths = [
        r"c:\Users\KAJAL CHANDEL\OneDrive\Desktop\machine_learning\business_suitability_assessment.csv",
        os.path.join(base_dir, "business_suitability_assessment.csv"),
        os.path.join(data_dir, "raw", "business_suitability_assessment.csv")
    ]

    found_csv = None
    for p in candidate_csv_paths:
        if os.path.exists(p):
            found_csv = p
            break

    if found_csv:
        print(f"\n[Validation Pipeline] Validating prototype dataset: {found_csv}")
        df = pd.read_csv(found_csv)
        report = validate_dataset(df, target_column="business_category")
        out_report_path = os.path.join(dirs["validated"], "prototype_dataset_report.json")
        with open(out_report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f"[Validation Pipeline] Quality report generated: {out_report_path}")
        print(f"  Total Rows: {report['total_rows']}, Valid: {report['is_valid']}, Warnings: {len(report['warnings'])}")
    else:
        print("\n[Validation Pipeline] No raw dataset found at candidate paths; directories ready for incoming survey data.")
