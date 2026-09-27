from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import time
from core.database import db_manager
from core.security import get_current_user, get_optional_current_user

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

# In-memory / temporary worksheet cache
_WORKSHEETS = {}

@router.get("/worksheet")
def get_market_worksheet(user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)):
    user_id = user.get("id") if user else "default"
    sheet = _WORKSHEETS.get(user_id) or {
        "businessCategory": "Dairy & Milk Chilling Unit",
        "location": "Satara",
        "targetMonthlyRevenue": 95000,
        "targetMonthlyExpenses": 60000,
        "estimatedMargin": 35000,
        "competitorsIdentified": 2,
        "primaryCustomerBase": "Local dairy cooperatives and village households",
        "keyStrengths": ["Low feedstock acquisition costs", "Reliable direct electricity connection"],
        "keyRisks": ["Seasonal fodder price fluctuation"],
        "mitigationPlan": "Grow on-farm Azolla and silage stockpiles"
    }
    return {
        "success": True,
        "worksheet": sheet
    }

@router.post("/worksheet")
def save_market_worksheet(data: Dict[str, Any], user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)):
    user_id = user.get("id") if user else "default"
    _WORKSHEETS[user_id] = data
    return {
        "success": True,
        "message": "Market worksheet saved successfully.",
        "worksheet": data
    }

@router.post("/loan-application")
def submit_loan_application(data: Dict[str, Any], user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)):
    app_id = f"app_loan_{int(time.time() * 1000)}"
    return {
        "success": True,
        "applicationId": app_id,
        "message": "Bank loan application dossier submitted successfully for appraisal.",
        "status": "Submitted"
    }

@router.post("")
def create_assessment(data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    inputs = data.get("inputs") or {}
    record = {
        "user": user["id"],
        "inputs": inputs,
        "predictions": data.get("predictions") or {},
        "financialSummary": data.get("financialSummary") or {},
        "matchedSchemes": data.get("matchedSchemes") or [],
        "recommendations": data.get("recommendations") or [],
        "status": "completed"
    }
    saved = db_manager.save_assessment(record)
    return {
        "success": True,
        "message": "Assessment recorded successfully.",
        "assessment": saved
    }

@router.get("/latest")
def get_latest(user: Dict[str, Any] = Depends(get_current_user)):
    latest = db_manager.get_latest_assessment(user["id"])
    return {
        "success": True,
        "assessment": latest
    }

@router.get("/my")
def get_my_assessments(user: Dict[str, Any] = Depends(get_current_user)):
    asms = db_manager.get_user_assessments(user["id"])
    return {
        "success": True,
        "total": len(asms),
        "assessments": asms
    }

@router.get("/{assessment_id}")
def get_assessment(assessment_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    asm = db_manager.get_assessment_by_id(assessment_id)
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment record not found.")
    return {
        "success": True,
        "assessment": asm
    }

@router.put("/{assessment_id}/outcome")
@router.post("/{assessment_id}/outcome")
def update_outcome(assessment_id: str, data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    updated = db_manager.update_assessment_outcome(assessment_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return {
        "success": True,
        "message": "Actual business outcome recorded successfully for model retraining.",
        "assessment": updated
    }
