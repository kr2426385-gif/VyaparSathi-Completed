from fastapi import APIRouter, Depends
from typing import Dict, Any
from core.database import db_manager
from core.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(user: Dict[str, Any] = Depends(get_current_user)):
    user_id = user["id"]
    profile = db_manager.get_profile(user_id) or {}
    asms = db_manager.get_user_assessments(user_id)
    latest = asms[0] if asms else None

    suitability_score = 78
    if latest and latest.get("predictions", {}).get("suitabilityScore", {}).get("score"):
        suitability_score = int(latest["predictions"]["suitabilityScore"]["score"] * 100)

    return {
        "success": True,
        "entrepreneurName": user.get("name", "Entrepreneur"),
        "businessCategory": profile.get("businessCategory", "Agri & Dairy Products"),
        "totalAssessments": len(asms),
        "activeSuitabilityScore": suitability_score,
        "loanEligibilityStatus": "High Eligibility (MUDRA / CMEGP)",
        "nextMilestone": "Submit Detailed Project Report (DPR) to District Industries Centre",
        "recentAssessments": asms[:3]
    }
