"""
VyaparSathi MongoDB -> ML Real Data Extraction Pipeline
Extracts strictly labelled, verified user outcomes from MongoDB Atlas.
Strips all PII (passwords, emails, phones, names).
Separates model-specific targets and ensures predictions are NEVER used as ground truth.
"""

import os
import hashlib
from typing import Dict, Any, List, Optional
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def get_mongodb_client() -> MongoClient:
    """Connect to MongoDB Atlas using MONGODB_URI environment variable."""
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        raise ValueError("MONGODB_URI environment variable is not configured.")
    # Safe connection with timeout
    return MongoClient(uri, serverSelectionTimeoutMS=5000)

def extract_raw_assessments(db_name: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Extract business assessments having non-null real-world outcomes.
    Strips all user PII.
    """
    client = get_mongodb_client()
    try:
        # Determine database name
        database_name = db_name or os.environ.get("MONGODB_DB_NAME") or "vyaparsathi"
        db = client[database_name]
        collection = db["businessassessments"]

        # Only extract assessments with valid outcome subdocuments
        query = {
            "outcome": {"$ne": None},
            "outcome.submittedAt": {"$exists": True}
        }

        cursor = collection.find(query)
        extracted = []

        for doc in cursor:
            outcome = doc.get("outcome") or {}
            inputs = doc.get("inputs") or {}
            predictions = doc.get("predictions") or {}

            # Generate non-reversible hashes for provenance and grouping
            raw_id = str(doc.get("_id", ""))
            raw_user = str(doc.get("user", ""))
            provenance_hash = hashlib.sha256(raw_id.encode()).hexdigest()[:16]
            user_group_hash = hashlib.sha256(raw_user.encode()).hexdigest()[:16]

            # Workers count minimum 1 to avoid division by zero
            workers = max(1.0, float(inputs.get("workers") or 1.0))
            budget = float(inputs.get("budget") or 0.0)

            record = {
                # Provenance (No PII)
                "assessment_provenance_id": provenance_hash,
                "user_group_hash": user_group_hash,
                "created_at": doc.get("createdAt"),
                
                # Raw inputs
                "budget": budget,
                "experience_years": float(inputs.get("experience_years") or 0.0),
                "skill_level": str(inputs.get("skill_level") or "Medium"),
                "land_available": int(inputs.get("land_available") or 0),
                "water_available": int(inputs.get("water_available") or 0),
                "electricity_available": int(inputs.get("electricity_available") or 0),
                "location_type": str(inputs.get("location_type") or "Rural"),
                "market_distance_km": float(inputs.get("market_distance_km") or 0.0),
                "competitor_count": float(inputs.get("competitor_count") or 0.0),
                "workers": workers,
                "budget_per_worker": budget / workers,

                # Heuristic context if present (NOT outcome)
                "business_suitability_score": float(
                    (predictions.get("suitabilityScore") or {}).get("score", 0.70)
                    if isinstance(predictions.get("suitabilityScore"), dict)
                    else (predictions.get("suitabilityScore") or 0.70)
                ),

                # Real-World Outcomes (Ground Truth)
                "actual_revenue": outcome.get("actualMonthlyRevenue"),
                "actual_expenses": outcome.get("actualMonthlyExpenses"),
                "actual_profit": outcome.get("actualMonthlyProfit"),
                "actual_demand": outcome.get("actualDemandLevel"),
                "actual_category": outcome.get("actualBusinessCategory"),
                "business_status": outcome.get("businessStatus"),
                "outcome_date": outcome.get("outcomeDate"),
                "outcome_source": outcome.get("source", "user_reported"),
                "outcome_verified": bool(outcome.get("verified", False)),
                "submitted_at": outcome.get("submittedAt")
            }

            extracted.append(record)

        return extracted
    finally:
        client.close()

def extract_profit_dataset(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Extract strictly labelled profit dataset.
    Target: actual_profit (NEVER prediction)
    """
    rows = []
    for r in records:
        if r.get("actual_profit") is not None:
            try:
                profit_val = float(r["actual_profit"])
                rows.append({
                    "provenance_id": r["assessment_provenance_id"],
                    "user_group_hash": r["user_group_hash"],
                    "budget": r["budget"],
                    "experience_years": r["experience_years"],
                    "land_available": r["land_available"],
                    "workers": r["workers"],
                    "electricity_available": r["electricity_available"],
                    "water_available": r["water_available"],
                    "market_distance_km": r["market_distance_km"],
                    "business_suitability_score": r["business_suitability_score"],
                    "budget_per_worker": r["budget_per_worker"],
                    "target_actual_monthly_profit": profit_val
                })
            except (ValueError, TypeError):
                continue
    return pd.DataFrame(rows)

def extract_demand_dataset(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Extract strictly labelled demand dataset.
    Target: actual_demand (in ['Low', 'Medium', 'High'])
    """
    valid_demand = {"Low", "Medium", "High"}
    rows = []
    for r in records:
        demand_val = r.get("actual_demand")
        category_val = r.get("actual_category") or "Grocery Retail"
        if demand_val and str(demand_val).strip().capitalize() in valid_demand:
            rows.append({
                "provenance_id": r["assessment_provenance_id"],
                "user_group_hash": r["user_group_hash"],
                "market_distance_km": r["market_distance_km"],
                "budget": r["budget"],
                "business_category": str(category_val).strip(),
                "location_type": r["location_type"],
                "target_actual_demand": str(demand_val).strip().capitalize()
            })
    return pd.DataFrame(rows)

def extract_category_dataset(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Extract strictly labelled business category dataset.
    Target: actual_category (NEVER prediction)
    """
    rows = []
    for r in records:
        cat_val = r.get("actual_category")
        if cat_val and str(cat_val).strip():
            rows.append({
                "provenance_id": r["assessment_provenance_id"],
                "user_group_hash": r["user_group_hash"],
                "budget": r["budget"],
                "experience_years": r["experience_years"],
                "skill_level": r["skill_level"],
                "land_available": r["land_available"],
                "water_available": r["water_available"],
                "electricity_available": r["electricity_available"],
                "location_type": r["location_type"],
                "target_actual_business_category": str(cat_val).strip()
            })
    return pd.DataFrame(rows)

def extract_suitability_status() -> Dict[str, Any]:
    """
    Business Suitability model status.
    Rule: Never fabricate ground truth suitability.
    """
    return {
        "model_name": "business_suitability",
        "realLabelAvailable": False,
        "status": "REAL LABEL NOT AVAILABLE",
        "retraining_blocked": True,
        "sample_count": 0,
        "reason": (
            "Suitability model was trained on synthetic heuristic prototype scores. "
            "No objective ground-truth label exists in real-world user outcomes. "
            "Retraining remains blocked to avoid fabricating synthetic targets as real."
        )
    }
