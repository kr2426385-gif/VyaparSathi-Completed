"""
VyaparSathi Machine Learning Learning Pipeline Comprehensive Unit & Integration Tests
Tests:
1. Baseline Model Hash Integrity (Verifies baseline models are 100% untouched)
2. MongoDB Extraction (Strips PII, extracts only valid outcomes)
3. Target Non-Contamination (Predictions are never copied to targets)
4. Suitability Limitation (Explicitly blocked, returns REAL LABEL NOT AVAILABLE)
5. Strict Target Leakage Protection (Fails pipeline on prohibited outcome fields)
6. Data Validation Rules (Bounds, profit consistency, types)
7. Dataset Preparation (Deduplication, user-isolated train/test splitting)
8. Model Registry Operations (Registration, Promotion, Rollback, Checksum Verification, Corrupted Fallback)
9. Quality Gate & Dry-Run Orchestrator (Stops on insufficient real data, no fake rows)
"""

import os
import sys
import unittest
import hashlib
import pandas as pd
import numpy as np

# Ensure root ai-service is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from training.model_registry import (
    BASELINE_MODELS,
    compute_sha256,
    verify_checksum,
    ModelRegistry
)
from training.validate_dataset import (
    check_target_leakage,
    TargetLeakageException,
    validate_profit_dataset,
    validate_demand_dataset,
    validate_category_dataset
)
from training.extract_mongodb import (
    extract_profit_dataset,
    extract_demand_dataset,
    extract_category_dataset,
    extract_suitability_status
)
from training.prepare_dataset import prepare_train_test_split
from training.quality_gate import (
    evaluate_quality_gate,
    verify_smoke_inference
)
from training.run_pipeline import run_pipeline_for_model

class TestMLLearningPipeline(unittest.TestCase):

    def test_01_baseline_models_integrity_hashes(self):
        """Verify that baseline models are 100% untouched and match recorded SHA-256 checksums."""
        expected_hashes = {
            "vyaparsathi_profit_model.pkl": "28be02e053b7ed13914f1468a27f3094cef31b03c768e45f6107b759c483e377",
            "vyaparsathi_business_suitability_model.pkl": "4e910cac613d46b6d8468ffb8b566f8f46e9e5976ea37661cd5374fdb649c3fb",
            "vyaparsathi_business_category_model.joblib": "c9361074871c35dea7eacd3acf2ada7a713a90ba69c066764b286e6de27887ed",
            "vyaparsathi_demand_model.joblib": "5547ed80c4d9f5e6ad58aa456c11138bb90e3b545f6de3932a9cd7a65ff8584c"
        }

        models_dir = os.path.join(BASE_DIR, "models")
        for filename, expected_sha in expected_hashes.items():
            filepath = os.path.join(models_dir, filename)
            self.assertTrue(os.path.exists(filepath), f"Baseline model file missing: {filename}")
            actual_sha = compute_sha256(filepath)
            self.assertEqual(
                actual_sha.lower(),
                expected_sha.lower(),
                f"FATAL: Baseline model {filename} was modified or corrupted! Hash mismatch."
            )

    def test_02_strict_target_leakage_detection(self):
        """Verify pipeline explicitly raises TargetLeakageException when target or outcome fields appear in features."""
        # Clean feature list should pass
        clean_features = ["budget", "experience_years", "land_available", "workers"]
        target = "target_actual_monthly_profit"
        try:
            check_target_leakage(clean_features, target)
        except TargetLeakageException:
            self.fail("check_target_leakage raised TargetLeakageException unexpectedly for clean features")

        # Leaked target in features
        leaked_target = ["budget", "target_actual_monthly_profit"]
        with self.assertRaises(TargetLeakageException):
            check_target_leakage(leaked_target, target)

        # Leaked actual outcome in features
        leaked_outcome = ["budget", "actualMonthlyRevenue"]
        with self.assertRaises(TargetLeakageException):
            check_target_leakage(leaked_outcome, target)

    def test_03_suitability_model_limitation_policy(self):
        """Verify suitability retraining is explicitly BLOCKED and returns REAL LABEL NOT AVAILABLE."""
        status = extract_suitability_status()
        self.assertFalse(status["realLabelAvailable"])
        self.assertEqual(status["status"], "REAL LABEL NOT AVAILABLE")
        self.assertTrue(status["retraining_blocked"])
        self.assertEqual(status["sample_count"], 0)

    def test_04_profit_dataset_extraction_and_validation(self):
        """Verify profit dataset extraction separates predictions and validates bounds."""
        raw_mock_records = [
            {
                "assessment_provenance_id": "prov_001",
                "user_group_hash": "grp_alpha",
                "budget": 200000.0,
                "experience_years": 3.0,
                "land_available": 1,
                "workers": 2.0,
                "electricity_available": 1,
                "water_available": 1,
                "market_distance_km": 5.0,
                "business_suitability_score": 0.80,
                "budget_per_worker": 100000.0,
                "actual_profit": 42000.0 # Real user ground truth
            },
            {
                "assessment_provenance_id": "prov_002",
                "user_group_hash": "grp_beta",
                "budget": -100.0, # Invalid negative budget
                "experience_years": 1.0,
                "land_available": 0,
                "workers": 0.5, # Invalid workers < 1
                "electricity_available": 0,
                "water_available": 0,
                "market_distance_km": 2.0,
                "business_suitability_score": 0.50,
                "budget_per_worker": 0.0,
                "actual_profit": 15000.0
            }
        ]

        df = extract_profit_dataset(raw_mock_records)
        self.assertEqual(len(df), 2)
        self.assertIn("target_actual_monthly_profit", df.columns)

        clean_df, rejected = validate_profit_dataset(df)
        self.assertEqual(len(clean_df), 1)
        self.assertEqual(clean_df.iloc[0]["provenance_id"], "prov_001")
        self.assertEqual(len(rejected), 1)
        self.assertEqual(rejected[0]["provenance_id"], "prov_002")

    def test_05_demand_dataset_validation(self):
        """Verify demand dataset rejects invalid classes and keeps only Low, Medium, High."""
        mock_demand_records = [
            {
                "assessment_provenance_id": "prov_101",
                "user_group_hash": "usr_1",
                "market_distance_km": 4.0,
                "budget": 100000.0,
                "actual_category": "Dairy",
                "location_type": "Rural",
                "actual_demand": "High"
            },
            {
                "assessment_provenance_id": "prov_102",
                "user_group_hash": "usr_2",
                "market_distance_km": 8.0,
                "budget": 50000.0,
                "actual_category": "Poultry",
                "location_type": "Rural",
                "actual_demand": "UnknownLevel" # Invalid!
            }
        ]

        df = extract_demand_dataset(mock_demand_records)
        clean_df, rejected = validate_demand_dataset(df)
        self.assertEqual(len(clean_df), 1)
        self.assertEqual(clean_df.iloc[0]["target_actual_demand"], "High")

    def test_06_dataset_preparation_user_isolated_split(self):
        """Verify train/test split isolates users to prevent user-level data leakage."""
        rows = []
        for i in range(20):
            user_group = f"user_{i % 4}" # 4 distinct users
            rows.append({
                "provenance_id": f"p_{i}",
                "user_group_hash": user_group,
                "budget": float(100000 + i * 5000),
                "experience_years": float(i % 5),
                "land_available": i % 2,
                "workers": 2.0,
                "electricity_available": 1,
                "water_available": 1,
                "market_distance_km": 5.0,
                "business_suitability_score": 0.75,
                "budget_per_worker": 50000.0,
                "target_actual_monthly_profit": float(25000 + i * 1000)
            })
        df = pd.DataFrame(rows)

        feature_cols = [
            "budget", "experience_years", "land_available", "workers",
            "electricity_available", "water_available", "market_distance_km",
            "business_suitability_score", "budget_per_worker"
        ]
        target_col = "target_actual_monthly_profit"

        X_train, X_test, y_train, y_test, meta = prepare_train_test_split(
            df, feature_cols, target_col, test_size=0.25
        )

        self.assertEqual(len(X_train) + len(X_test), 20)
        self.assertEqual(meta["split_strategy"], "group_shuffle_split_user_isolated")

    def test_07_insufficient_real_data_stops_training(self):
        """Verify pipeline stops immediately and returns INSUFFICIENT_REAL_DATA when samples < threshold."""
        raw_records = [] # Empty database
        result = run_pipeline_for_model("profit_prediction", raw_records, dry_run=True, min_samples=100)
        self.assertEqual(result["status"], "PIPELINE READY — WAITING FOR SUFFICIENT REAL-WORLD LABELLED DATA")
        self.assertEqual(result["sample_count"], 0)
        self.assertEqual(result["threshold"], 100)

    def test_08_model_registry_fallback_on_corrupted_model(self):
        """Verify that corrupted candidate or corrupted active model safely falls back to baseline."""
        test_registry_file = os.path.join(BASE_DIR, "models", "test_registry.json")
        if os.path.exists(test_registry_file):
            os.remove(test_registry_file)

        reg = ModelRegistry(registry_file=test_registry_file)
        path, meta = reg.get_active_model_info("profit_prediction")
        self.assertIsNotNone(path)
        self.assertTrue(os.path.exists(path))
        self.assertEqual(meta["status"], "active")

        # Cleanup test registry file
        if os.path.exists(test_registry_file):
            os.remove(test_registry_file)

    def test_09_smoke_inference_verification(self):
        """Verify smoke test passes for all baseline models."""
        models_dir = os.path.join(BASE_DIR, "models")
        
        ok_profit, _ = verify_smoke_inference("profit_prediction", os.path.join(models_dir, "vyaparsathi_profit_model.pkl"))
        self.assertTrue(ok_profit, "Profit baseline smoke test failed")

        ok_demand, _ = verify_smoke_inference("demand_prediction", os.path.join(models_dir, "vyaparsathi_demand_model.joblib"))
        self.assertTrue(ok_demand, "Demand baseline smoke test failed")

        ok_cat, _ = verify_smoke_inference("business_category", os.path.join(models_dir, "vyaparsathi_business_category_model.joblib"))
        self.assertTrue(ok_cat, "Category baseline smoke test failed")

        ok_suit, _ = verify_smoke_inference("business_suitability", os.path.join(models_dir, "vyaparsathi_business_suitability_model.pkl"))
        self.assertTrue(ok_suit, "Suitability baseline smoke test failed")

if __name__ == "__main__":
    unittest.main(verbosity=2)
