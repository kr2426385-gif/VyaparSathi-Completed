"""
VyaparSathi Model Quality Gate
Enforces minimum sample thresholds, metrics bounds, smoke inference, and promotion criteria.
"""

import os
import joblib
import pandas as pd
from typing import Dict, Any, Tuple
from training.model_registry import compute_sha256

DEFAULT_MIN_SAMPLES = {
    "profit_prediction": int(os.environ.get("ML_MIN_REAL_SAMPLES_PROFIT", 100)),
    "demand_prediction": int(os.environ.get("ML_MIN_REAL_SAMPLES_DEMAND", 100)),
    "business_category": int(os.environ.get("ML_MIN_REAL_SAMPLES_CATEGORY", 100)),
    "business_suitability": int(os.environ.get("ML_MIN_REAL_SAMPLES_SUITABILITY", 1000))
}

# Smoke test feature payloads
SMOKE_TEST_SAMPLES = {
    "profit_prediction": pd.DataFrame([{
        "budget": 200000.0,
        "experience_years": 3.0,
        "land_available": 1,
        "workers": 2.0,
        "electricity_available": 1,
        "water_available": 1,
        "market_distance_km": 5.0,
        "business_suitability_score": 0.85,
        "budget_per_worker": 100000.0
    }]),
    "demand_prediction": pd.DataFrame([{
        "market_distance_km": 5.0,
        "budget": 150000.0,
        "business_category": "Grocery Retail",
        "location_type": "Rural"
    }]),
    "business_category": pd.DataFrame([{
        "budget": 150000.0,
        "experience_years": 2.0,
        "skill_level": "Medium",
        "land_available": 1,
        "water_available": 1,
        "electricity_available": 1,
        "location_type": "Rural"
    }]),
    "business_suitability": pd.DataFrame([{
        "investment_budget": 200000.0,
        "experience_years": 3.0,
        "land_available": 1,
        "water_available": 1,
        "electricity_available": 1,
        "market_distance_km": 5.0,
        "competitor_count": 2.0,
        "workers": 2.0
    }])
}

def verify_smoke_inference(model_name: str, artifact_path: str) -> Tuple[bool, str]:
    """Load model artifact and verify smoke inference produces valid output."""
    try:
        model = joblib.load(artifact_path)
        sample = SMOKE_TEST_SAMPLES.get(model_name)
        if sample is None:
            return False, f"No smoke test sample defined for {model_name}"

        pred = model.predict(sample)
        if pred is None or len(pred) == 0:
            return False, "Smoke test prediction returned empty result"

        val = pred[0]
        if model_name == "profit_prediction" and pd.isna(val):
            return False, "Profit prediction returned NaN"
        if model_name == "business_suitability" and (pd.isna(val) or val < 0 or val > 1):
            return False, f"Business suitability prediction returned out-of-bounds: {val}"
        if model_name == "demand_prediction" and str(val) not in {"Low", "Medium", "High"}:
            return False, f"Demand prediction returned invalid class: {val}"
        if model_name == "business_category" and not str(val).strip():
            return False, "Category prediction returned empty string"

        return True, "Smoke test passed successfully"
    except Exception as e:
        return False, f"Smoke test failed with exception: {str(e)}"

def evaluate_quality_gate(
    model_name: str,
    candidate_path: str,
    sample_count: int,
    metrics: Dict[str, Any],
    baseline_metrics: Dict[str, Any],
    min_samples_override: int = None
) -> Dict[str, Any]:
    """
    Run full 9-point Quality Gate verification.
    """
    threshold = min_samples_override if min_samples_override is not None else DEFAULT_MIN_SAMPLES.get(model_name, 100)

    checks = {
        "sufficient_real_samples": sample_count >= threshold,
        "checksum_generated": False,
        "smoke_inference_passed": False,
        "metrics_acceptable": False
    }

    # 1. Sample count check
    if sample_count < threshold:
        return {
            "passed": False,
            "status": "INSUFFICIENT_REAL_DATA",
            "reason": f"Real labelled sample count ({sample_count}) is below production threshold ({threshold}).",
            "threshold": threshold,
            "sample_count": sample_count,
            "checks": checks
        }

    # 2. Checksum check
    try:
        sha256 = compute_sha256(candidate_path)
        checks["checksum_generated"] = bool(sha256)
    except Exception as e:
        return {
            "passed": False,
            "status": "CHECKSUM_FAILED",
            "reason": f"Failed to compute candidate SHA-256: {e}",
            "checks": checks
        }

    # 3. Smoke inference check
    smoke_ok, smoke_msg = verify_smoke_inference(model_name, candidate_path)
    checks["smoke_inference_passed"] = smoke_ok
    if not smoke_ok:
        return {
            "passed": False,
            "status": "SMOKE_INFERENCE_FAILED",
            "reason": smoke_msg,
            "checks": checks
        }

    # 4. Metrics sanity gate
    if model_name == "profit_prediction":
        r2 = metrics.get("r2_score", -999)
        checks["metrics_acceptable"] = r2 > -0.5
    elif model_name in ("demand_prediction", "business_category"):
        acc = metrics.get("validation_accuracy", 0)
        checks["metrics_acceptable"] = acc >= 0.50

    if not checks["metrics_acceptable"]:
        return {
            "passed": False,
            "status": "METRICS_REJECTED",
            "reason": f"Candidate metrics {metrics} do not meet acceptable quality bounds.",
            "checks": checks
        }

    return {
        "passed": True,
        "status": "QUALITY_GATE_PASSED",
        "sha256": sha256,
        "sample_count": sample_count,
        "threshold": threshold,
        "checks": checks
    }
