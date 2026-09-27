"""
VyaparSathi Production ML Retraining Orchestrator
Executes: MongoDB Extraction -> Validation -> Split -> Leakage Check -> Quality Gate -> Promotion
Supports --dry-run and model-specific execution.
"""

import os
import sys
import argparse
from datetime import datetime, timezone
from typing import Dict, Any, List

from training.extract_mongodb import (
    extract_raw_assessments,
    extract_profit_dataset,
    extract_demand_dataset,
    extract_category_dataset,
    extract_suitability_status,
    get_mongodb_client
)
from training.validate_dataset import (
    validate_profit_dataset,
    validate_demand_dataset,
    validate_category_dataset
)
from training.prepare_dataset import prepare_train_test_split
from training.train_candidates import (
    train_profit_candidate,
    train_demand_candidate,
    train_category_candidate
)
from training.quality_gate import evaluate_quality_gate, DEFAULT_MIN_SAMPLES
from training.model_registry import registry, BASELINE_MODELS

def log_training_run_to_mongodb(run_data: Dict[str, Any]):
    """Optionally record the run log into MongoDB Atlas mltrainingruns collection."""
    try:
        client = get_mongodb_client()
        db_name = os.environ.get("MONGODB_DB_NAME") or "vyaparsathi"
        db = client[db_name]
        runs_coll = db["mltrainingruns"]
        runs_coll.insert_one(run_data)
        client.close()
    except Exception as e:
        print(f"[Orchestrator] Notice: Could not record training run to MongoDB: {e}")

def run_pipeline_for_model(
    model_name: str,
    raw_records: List[Dict[str, Any]],
    dry_run: bool = True,
    min_samples: int = None
) -> Dict[str, Any]:
    """Execute end-to-end pipeline for a specific model."""
    print(f"\n==========================================")
    print(f"Executing ML Pipeline for: {model_name.upper()}")
    print(f"Dry-run mode: {dry_run}")
    print(f"==========================================")

    now_utc = datetime.now(timezone.utc)
    timestamp = now_utc.strftime("%Y%m%d_%H%M%S")
    version_tag = f"v2_{timestamp}"

    run_record = {
        "modelName": model_name,
        "version": version_tag,
        "dryRun": dry_run,
        "status": "pending",
        "startedAt": now_utc.isoformat(),
        "realSampleCount": 0,
        "metrics": {},
        "promotionStatus": "rejected"
    }

    # Special handling for suitability model
    if model_name == "business_suitability":
        status_info = extract_suitability_status()
        print(f"[Orchestrator] {model_name}: {status_info['status']}")
        print(f"[Orchestrator] Reason: {status_info['reason']}")
        run_record.update({
            "status": "blocked",
            "promotionStatus": "blocked",
            "failureReason": status_info["reason"],
            "completedAt": datetime.now(timezone.utc).isoformat()
        })
        if not dry_run:
            log_training_run_to_mongodb(run_record)
        return status_info

    # 1. Extraction & Feature Preparation
    if model_name == "profit_prediction":
        raw_df = extract_profit_dataset(raw_records)
        clean_df, rejected = validate_profit_dataset(raw_df)
        feature_cols = [
            "budget", "experience_years", "land_available", "workers",
            "electricity_available", "water_available", "market_distance_km",
            "business_suitability_score", "budget_per_worker"
        ]
        target_col = "target_actual_monthly_profit"
        feature_version = "v1_profit_9feat"

    elif model_name == "demand_prediction":
        raw_df = extract_demand_dataset(raw_records)
        clean_df, rejected = validate_demand_dataset(raw_df)
        feature_cols = ["market_distance_km", "budget", "business_category", "location_type"]
        target_col = "target_actual_demand"
        feature_version = "v1_demand_4feat"

    elif model_name == "business_category":
        raw_df = extract_category_dataset(raw_records)
        clean_df, rejected = validate_category_dataset(raw_df)
        feature_cols = [
            "budget", "experience_years", "skill_level", "land_available",
            "water_available", "electricity_available", "location_type"
        ]
        target_col = "target_actual_business_category"
        feature_version = "v1_category_7feat"
    else:
        raise ValueError(f"Unknown model name: {model_name}")

    sample_count = len(clean_df)
    run_record["realSampleCount"] = sample_count
    threshold = min_samples if min_samples is not None else DEFAULT_MIN_SAMPLES.get(model_name, 100)

    print(f"[Orchestrator] Extracted real labelled samples: {sample_count} (Required threshold: {threshold})")

    # 2. Minimum Sample Check
    if sample_count < threshold:
        msg = f"INSUFFICIENT_REAL_DATA: {sample_count} real outcomes available, minimum {threshold} required."
        print(f"[Orchestrator] Gate stopped: {msg}")
        run_record.update({
            "status": "insufficient_data",
            "failureReason": msg,
            "promotionStatus": "rejected",
            "completedAt": datetime.now(timezone.utc).isoformat()
        })
        if not dry_run:
            log_training_run_to_mongodb(run_record)
        return {
            "model_name": model_name,
            "status": "PIPELINE READY — WAITING FOR SUFFICIENT REAL-WORLD LABELLED DATA",
            "sample_count": sample_count,
            "threshold": threshold,
            "dry_run": dry_run
        }

    # 3. Train/Test Split
    X_train, X_test, y_train, y_test, split_meta = prepare_train_test_split(
        clean_df, feature_cols, target_col
    )
    print(f"[Orchestrator] Train split: {len(X_train)} samples, Test split: {len(X_test)} samples")

    # 4. Train Candidate
    if model_name == "profit_prediction":
        candidate_path, metrics = train_profit_candidate(X_train, y_train, X_test, y_test, version_tag)
    elif model_name == "demand_prediction":
        candidate_path, metrics = train_demand_candidate(X_train, y_train, X_test, y_test, version_tag)
    elif model_name == "business_category":
        candidate_path, metrics = train_category_candidate(X_train, y_train, X_test, y_test, version_tag)

    print(f"[Orchestrator] Candidate trained at: {candidate_path}")
    print(f"[Orchestrator] Evaluation metrics: {metrics}")
    run_record["metrics"] = metrics

    # 5. Quality Gate
    baseline_meta = BASELINE_MODELS.get(model_name, {})
    gate_result = evaluate_quality_gate(
        model_name=model_name,
        candidate_path=candidate_path,
        sample_count=sample_count,
        metrics=metrics,
        baseline_metrics=baseline_meta.get("metrics", {}),
        min_samples_override=threshold
    )

    print(f"[Orchestrator] Quality Gate Result: {gate_result['status']}")

    # 6. Model Registry & Promotion
    if gate_result["passed"]:
        candidate_meta = registry.register_candidate(
            model_name=model_name,
            artifact_path=candidate_path,
            version=version_tag,
            metrics=metrics,
            real_sample_count=sample_count,
            dataset_version=f"mongodb_outcomes_{timestamp}",
            feature_version=feature_version
        )
        run_record["modelChecksum"] = candidate_meta["sha256"]

        auto_retrain = os.environ.get("ML_AUTO_RETRAIN_ENABLED", "false").lower() == "true"
        if not dry_run and auto_retrain:
            registry.promote_candidate(model_name, version_tag)
            print(f"[Orchestrator] Candidate {version_tag} PROMOTED to active status.")
            run_record["promotionStatus"] = "promoted"
        else:
            print(f"[Orchestrator] Dry-run or auto-retrain disabled: Candidate registered but NOT promoted.")
            run_record["promotionStatus"] = "registered_as_candidate"

        run_record["status"] = "success"
    else:
        run_record["status"] = "failed"
        run_record["failureReason"] = gate_result.get("reason")
        run_record["promotionStatus"] = "rejected"

    run_record["completedAt"] = datetime.now(timezone.utc).isoformat()
    if not dry_run:
        log_training_run_to_mongodb(run_record)

    return {
        "model_name": model_name,
        "status": "QUALITY_GATE_PASSED" if gate_result["passed"] else gate_result["status"],
        "version": version_tag,
        "metrics": metrics,
        "dry_run": dry_run,
        "gate_result": gate_result
    }

def main():
    parser = argparse.ArgumentParser(description="VyaparSathi ML Retraining Pipeline")
    parser.add_argument("--model", choices=["profit", "demand", "category", "suitability", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Execute dry-run without promotion")
    parser.add_argument("--no-dry-run", action="store_false", dest="dry_run", help="Enable production mutation")
    parser.add_argument("--min-samples", type=int, default=None, help="Override minimum real sample threshold")

    args = parser.parse_args()

    print(f"=== Starting VyaparSathi ML Pipeline ===")
    print(f"Target: {args.model}, Dry Run: {args.dry_run}")

    try:
        raw_records = extract_raw_assessments()
        print(f"Total raw assessments with outcome subdocument: {len(raw_records)}")
    except Exception as e:
        print(f"[Extraction Warning] MongoDB extraction failed or unconfigured: {e}")
        raw_records = []

    model_map = {
        "profit": ["profit_prediction"],
        "demand": ["demand_prediction"],
        "category": ["business_category"],
        "suitability": ["business_suitability"],
        "all": ["profit_prediction", "demand_prediction", "business_category", "business_suitability"]
    }

    targets = model_map.get(args.model, [])
    results = {}
    for m in targets:
        results[m] = run_pipeline_for_model(m, raw_records, dry_run=args.dry_run, min_samples=args.min_samples)

    print("\n==========================================")
    print("FINAL SUMMARY OF ML RETRAINING PIPELINE:")
    for m, res in results.items():
        print(f"  {m}: {res.get('status')}")
    print("==========================================\n")

if __name__ == "__main__":
    main()
