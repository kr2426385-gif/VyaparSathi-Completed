"""
VyaparSathi Model Registry
Manages baseline, candidate, active, archive, and rollback models with SHA-256 verification.
"""

import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple

REGISTRY_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
REGISTRY_FILE = os.path.join(REGISTRY_DIR, "registry.json")

# Verified SHA-256 Hashes of Existing Baseline Models
BASELINE_MODELS = {
    "profit_prediction": {
        "model_name": "profit_prediction",
        "artifact_file": "vyaparsathi_profit_model.pkl",
        "version": "profit_v1.0.0-baseline",
        "status": "baseline",
        "sha256": "28be02e053b7ed13914f1468a27f3094cef31b03c768e45f6107b759c483e377",
        "trained_at": "2026-02-15T00:00:00Z",
        "dataset_version": "synthetic_prototype_v1",
        "data_status": "synthetic_prototype",
        "real_sample_count": 0,
        "metrics": {"r2_score": 0.86, "mae": 3200},
        "feature_version": "v1_profit_9feat"
    },
    "demand_prediction": {
        "model_name": "demand_prediction",
        "artifact_file": "vyaparsathi_demand_model.joblib",
        "version": "demand_v1.0.0-baseline",
        "status": "baseline",
        "sha256": "5547ed80c4d9f5e6ad58aa456c11138bb90e3b545f6de3932a9cd7a65ff8584c",
        "trained_at": "2026-03-01T00:00:00Z",
        "dataset_version": "synthetic_prototype_v1",
        "data_status": "synthetic_prototype",
        "real_sample_count": 0,
        "metrics": {"validation_accuracy": 0.88, "f1_macro": 0.87},
        "feature_version": "v1_demand_4feat"
    },
    "business_category": {
        "model_name": "business_category",
        "artifact_file": "vyaparsathi_business_category_model.joblib",
        "version": "category_v1.0.0-baseline",
        "status": "baseline",
        "sha256": "c9361074871c35dea7eacd3acf2ada7a713a90ba69c066764b286e6de27887ed",
        "trained_at": "2026-03-01T00:00:00Z",
        "dataset_version": "synthetic_prototype_v1",
        "data_status": "synthetic_prototype",
        "real_sample_count": 0,
        "metrics": {"validation_accuracy": 0.82, "f1_weighted": 0.81},
        "feature_version": "v1_category_7feat"
    },
    "business_suitability": {
        "model_name": "business_suitability",
        "artifact_file": "vyaparsathi_business_suitability_model.pkl",
        "version": "suitability_v1.0.0-baseline",
        "status": "baseline",
        "sha256": "4e910cac613d46b6d8468ffb8b566f8f46e9e5976ea37661cd5374fdb649c3fb",
        "trained_at": "2026-02-15T00:00:00Z",
        "dataset_version": "synthetic_prototype_v1",
        "data_status": "synthetic_prototype",
        "real_sample_count": 0,
        "real_label_available": False,
        "retraining_blocked": True,
        "notes": "Suitability model uses a heuristic prototype formula. Real-world retraining blocked until an objective outcome (e.g. 12-mo survival) is defined.",
        "metrics": {"r2_score": 0.84, "rmse": 0.08},
        "feature_version": "v1_suitability_8feat"
    }
}

def compute_sha256(filepath: str) -> str:
    """Calculate SHA-256 checksum of a file."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def verify_checksum(filepath: str, expected_hash: str) -> bool:
    """Verify that file's SHA-256 matches the expected checksum."""
    actual = compute_sha256(filepath)
    return actual.lower() == expected_hash.lower()

class ModelRegistry:
    def __init__(self, registry_file: str = REGISTRY_FILE):
        self.registry_file = registry_file
        self.registry_dir = os.path.dirname(registry_file)
        self.candidates_dir = os.path.join(self.registry_dir, "candidates")
        self.archive_dir = os.path.join(self.registry_dir, "archive")
        os.makedirs(self.candidates_dir, exist_ok=True)
        os.makedirs(self.archive_dir, exist_ok=True)
        self._ensure_registry()

    def _ensure_registry(self):
        """Initialize registry.json with baseline models if missing or incomplete."""
        needs_init = not os.path.exists(self.registry_file)
        if not needs_init:
            try:
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    curr = json.load(f)
                    if len(curr.get("models", {})) < 4:
                        needs_init = True
            except Exception:
                needs_init = True

        if needs_init:
            data = {
                "system": "VyaparSathi Model Registry",
                "version": "1.0.0",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "active_models": {
                    name: info["version"] for name, info in BASELINE_MODELS.items()
                },
                "models": {}
            }
            # Populate baseline entries
            for name, meta in BASELINE_MODELS.items():
                data["models"][meta["version"]] = dict(meta)
                data["models"][meta["version"]]["status"] = "active"

            with open(self.registry_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

    def _load_data(self) -> Dict[str, Any]:
        self._ensure_registry()
        try:
            with open(self.registry_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[ModelRegistry] Failed to read registry, resetting: {e}")
            self._ensure_registry()
            with open(self.registry_file, "r", encoding="utf-8") as f:
                return json.load(f)

    def _save_data(self, data: Dict[str, Any]):
        data["last_updated"] = datetime.now(timezone.utc).isoformat()
        temp_file = self.registry_file + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.replace(temp_file, self.registry_file)

    def get_baseline_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        return BASELINE_MODELS.get(model_name)

    def get_baseline_path(self, model_name: str) -> Optional[str]:
        info = BASELINE_MODELS.get(model_name)
        if not info:
            return None
        return os.path.join(self.registry_dir, info["artifact_file"])

    def get_active_model_info(self, model_name: str) -> Tuple[Optional[str], Dict[str, Any]]:
        """
        Returns (filepath, metadata) for active model.
        Falls back safely to baseline if active model is corrupted or missing.
        """
        data = self._load_data()
        active_version = data.get("active_models", {}).get(model_name)
        active_meta = data.get("models", {}).get(active_version) if active_version else None

        if active_meta:
            artifact_file = active_meta.get("artifact_file")
            # Can be in models/ or models/candidates/
            candidates_path = os.path.join(self.candidates_dir, artifact_file) if artifact_file else None
            root_path = os.path.join(self.registry_dir, artifact_file) if artifact_file else None
            
            chosen_path = None
            if root_path and os.path.exists(root_path):
                chosen_path = root_path
            elif candidates_path and os.path.exists(candidates_path):
                chosen_path = candidates_path

            if chosen_path:
                # Checksum verification
                expected_sha = active_meta.get("sha256")
                if expected_sha and verify_checksum(chosen_path, expected_sha):
                    return chosen_path, active_meta
                else:
                    print(f"[ModelRegistry] Checksum mismatch for active {model_name} ({active_version}). Rolling back to baseline fallback.")

        # Fallback to baseline
        baseline_meta = BASELINE_MODELS.get(model_name)
        if baseline_meta:
            baseline_path = os.path.join(self.registry_dir, baseline_meta["artifact_file"])
            if os.path.exists(baseline_path):
                # Verify baseline checksum
                if verify_checksum(baseline_path, baseline_meta["sha256"]):
                    return baseline_path, dict(baseline_meta)
                else:
                    print(f"[ModelRegistry] CRITICAL: Baseline checksum mismatch for {model_name}!")
        
        return None, {}

    def register_candidate(
        self,
        model_name: str,
        artifact_path: str,
        version: str,
        metrics: Dict[str, Any],
        real_sample_count: int,
        dataset_version: str,
        feature_version: str
    ) -> Dict[str, Any]:
        """Register a newly trained candidate model."""
        if not os.path.exists(artifact_path):
            raise FileNotFoundError(f"Candidate artifact not found: {artifact_path}")

        sha256 = compute_sha256(artifact_path)
        filename = os.path.basename(artifact_path)

        data = self._load_data()
        candidate_meta = {
            "model_name": model_name,
            "artifact_file": filename,
            "version": version,
            "status": "candidate",
            "sha256": sha256,
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "dataset_version": dataset_version,
            "data_status": "real_user_outcomes" if real_sample_count > 0 else "synthetic_prototype",
            "real_sample_count": real_sample_count,
            "metrics": metrics,
            "feature_version": feature_version
        }

        data["models"][version] = candidate_meta
        self._save_data(data)
        return candidate_meta

    def promote_candidate(self, model_name: str, version: str) -> bool:
        """Promote candidate to active status. Previous active becomes archive."""
        data = self._load_data()
        candidate = data.get("models", {}).get(version)
        if not candidate:
            raise ValueError(f"Version '{version}' not found in registry.")

        if candidate.get("model_name") != model_name:
            raise ValueError(f"Model mismatch: requested {model_name}, version is {candidate.get('model_name')}")

        current_active = data.get("active_models", {}).get(model_name)
        if current_active and current_active != version:
            if current_active in data["models"]:
                # If baseline, keep baseline status; otherwise mark archive
                if "baseline" not in data["models"][current_active].get("version", ""):
                    data["models"][current_active]["status"] = "archive"
                else:
                    data["models"][current_active]["status"] = "baseline"

        candidate["status"] = "active"
        candidate["promoted_at"] = datetime.utcnow().isoformat() + "Z"
        data["active_models"][model_name] = version
        self._save_data(data)
        return True

    def rollback(self, model_name: str, target_version: Optional[str] = None) -> bool:
        """Rollback active model to target version, or fallback baseline."""
        data = self._load_data()
        if not target_version:
            # Revert to baseline
            baseline_meta = BASELINE_MODELS.get(model_name)
            if not baseline_meta:
                return False
            target_version = baseline_meta["version"]

        if target_version not in data.get("models", {}):
            raise ValueError(f"Target version '{target_version}' does not exist in registry.")

        current_active = data.get("active_models", {}).get(model_name)
        if current_active and current_active != target_version:
            if current_active in data["models"]:
                data["models"][current_active]["status"] = "rollback"

        data["models"][target_version]["status"] = "active"
        data["active_models"][model_name] = target_version
        self._save_data(data)
        return True

    def list_all(self) -> Dict[str, Any]:
        return self._load_data()

registry = ModelRegistry()
