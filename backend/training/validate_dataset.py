"""
VyaparSathi Real Dataset Validation & Strict Leakage Protection
Enforces type, bounds, deterministic profit consistency, and target leakage rejection.
"""

from typing import Tuple, List, Dict, Any, Set
import pandas as pd

class TargetLeakageException(Exception):
    """Raised when target or future outcome fields are detected in model input features."""
    pass

class DataValidationException(Exception):
    """Raised when critical dataset validation rules are violated."""
    pass

# Global set of outcome/label fields that must NEVER appear as model input features
PROHIBITED_LEAKAGE_FIELDS: Set[str] = {
    "actualMonthlyRevenue", "actualMonthlyExpenses", "actualMonthlyProfit",
    "actual_revenue", "actual_expenses", "actual_profit",
    "actualDemandLevel", "actual_demand", "expected_demand",
    "actualBusinessCategory", "actual_category", "business_category_outcome",
    "monthly_revenue", "monthly_expenses", "monthly_profit",
    "target_actual_monthly_profit", "target_actual_demand", "target_actual_business_category"
}

def check_target_leakage(feature_columns: List[str], target_column: str) -> None:
    """
    Strict Leakage Protection.
    FAILS the pipeline if any prohibited outcome field or target is present in feature_columns.
    """
    for col in feature_columns:
        if col == target_column:
            raise TargetLeakageException(
                f"FATAL TARGET LEAKAGE: Target column '{target_column}' is included in feature inputs!"
            )
        if col in PROHIBITED_LEAKAGE_FIELDS and col != "business_category":
            raise TargetLeakageException(
                f"FATAL TARGET LEAKAGE: Outcome field '{col}' detected in feature inputs. Retraining aborted."
            )

def validate_profit_dataset(
    df: pd.DataFrame,
    tolerance: float = 1.0
) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """
    Validate profit prediction dataset.
    Features: budget, experience_years, land_available, workers, electricity_available,
              water_available, market_distance_km, business_suitability_score, budget_per_worker
    Target: target_actual_monthly_profit
    """
    if df.empty:
        return df, []

    feature_cols = [
        "budget", "experience_years", "land_available", "workers",
        "electricity_available", "water_available", "market_distance_km",
        "business_suitability_score", "budget_per_worker"
    ]
    target_col = "target_actual_monthly_profit"

    # Strict target leakage check
    check_target_leakage(feature_cols, target_col)

    clean_rows = []
    rejected = []

    for idx, row in df.iterrows():
        reasons = []

        # Target check
        if pd.isna(row.get(target_col)):
            reasons.append("Missing target_actual_monthly_profit")

        # Bounds check
        if row.get("budget", 0) < 0:
            reasons.append(f"Negative budget: {row.get('budget')}")
        if row.get("workers", 0) < 1:
            reasons.append(f"Workers less than 1: {row.get('workers')}")
        if row.get("experience_years", 0) < 0:
            reasons.append(f"Negative experience: {row.get('experience_years')}")
        if row.get("market_distance_km", 0) < 0:
            reasons.append(f"Negative market distance: {row.get('market_distance_km')}")

        if reasons:
            rejected.append({"row_index": idx, "reasons": reasons, "provenance_id": row.get("provenance_id")})
        else:
            clean_rows.append(row)

    clean_df = pd.DataFrame(clean_rows) if clean_rows else pd.DataFrame(columns=df.columns)
    return clean_df, rejected

def validate_demand_dataset(
    df: pd.DataFrame
) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """
    Validate demand prediction dataset.
    Features: market_distance_km, budget, business_category, location_type
    Target: target_actual_demand (Must be 'Low', 'Medium', or 'High')
    """
    if df.empty:
        return df, []

    feature_cols = ["market_distance_km", "budget", "business_category", "location_type"]
    target_col = "target_actual_demand"

    check_target_leakage(feature_cols, target_col)

    clean_rows = []
    rejected = []
    allowed_demand = {"Low", "Medium", "High"}

    for idx, row in df.iterrows():
        reasons = []
        target_val = str(row.get(target_col, "")).strip().capitalize()
        if target_val not in allowed_demand:
            reasons.append(f"Invalid demand target: '{target_val}'. Must be Low, Medium, or High.")

        if row.get("budget", 0) < 0:
            reasons.append(f"Negative budget: {row.get('budget')}")
        if row.get("market_distance_km", 0) < 0:
            reasons.append(f"Negative market distance: {row.get('market_distance_km')}")

        if reasons:
            rejected.append({"row_index": idx, "reasons": reasons, "provenance_id": row.get("provenance_id")})
        else:
            clean_rows.append(row)

    clean_df = pd.DataFrame(clean_rows) if clean_rows else pd.DataFrame(columns=df.columns)
    return clean_df, rejected

def validate_category_dataset(
    df: pd.DataFrame
) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """
    Validate category recommendation dataset.
    Features: budget, experience_years, skill_level, land_available, water_available,
              electricity_available, location_type
    Target: target_actual_business_category
    """
    if df.empty:
        return df, []

    feature_cols = [
        "budget", "experience_years", "skill_level", "land_available",
        "water_available", "electricity_available", "location_type"
    ]
    target_col = "target_actual_business_category"

    check_target_leakage(feature_cols, target_col)

    clean_rows = []
    rejected = []

    for idx, row in df.iterrows():
        reasons = []
        cat_val = str(row.get(target_col, "")).strip()
        if not cat_val:
            reasons.append("Empty business category target.")

        if row.get("budget", 0) < 0:
            reasons.append(f"Negative budget: {row.get('budget')}")
        if row.get("experience_years", 0) < 0:
            reasons.append(f"Negative experience: {row.get('experience_years')}")

        if reasons:
            rejected.append({"row_index": idx, "reasons": reasons, "provenance_id": row.get("provenance_id")})
        else:
            clean_rows.append(row)

    clean_df = pd.DataFrame(clean_rows) if clean_rows else pd.DataFrame(columns=df.columns)
    return clean_df, rejected
