from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from core.database import db_manager
from core.security import get_current_user

router = APIRouter(tags=["Role-Specific Portals & Feedback"])

# --- ADVISOR PORTAL ---
@router.get("/api/advisor/dashboard")
def advisor_dashboard(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "assignedDistrict": user.get("district", "Satara"),
        "activeEntrepreneurs": 24,
        "pendingDprReviews": 5,
        "schemesFacilitated": 18
    }

@router.get("/api/advisor/entrepreneurs")
def advisor_entrepreneurs():
    return {
        "success": True,
        "entrepreneurs": [
            {"id": "usr_101", "name": "Vikas Deshmukh", "business": "Turmeric Processing", "stage": "DPR Review", "subsidyApplied": "PMFME"},
            {"id": "usr_102", "name": "Sunita Shinde", "business": "Goat Rearing & Dairy", "stage": "Bank Appraisal", "subsidyApplied": "CMEGP"}
        ]
    }

# --- BANKER PORTAL ---
@router.get("/api/banker/dashboard")
def banker_dashboard(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "bankBranch": "Bank of Maharashtra, Satara Main Branch",
        "pendingLoanApplications": 12,
        "totalSanctionedAmount": 14500000,
        "avgCibilScore": 724
    }

@router.get("/api/banker/applications")
def banker_applications():
    return {
        "success": True,
        "applications": [
            {"id": "app_501", "applicantName": "Ramesh Patil", "business": "Chaff Cutter & Dairy Farm", "loanAmount": 650000, "recommendedProduct": "MUDRA Kishore", "status": "Under Credit Review"},
            {"id": "app_502", "applicantName": "Anand Chavan", "business": "Cold Storage & Pre-cooling", "loanAmount": 1800000, "recommendedProduct": "CMEGP Term Loan", "status": "Pre-sanction Visit Done"}
        ]
    }

# --- ADMIN PORTAL ---
@router.get("/api/admin/stats")
def admin_stats():
    return {
        "success": True,
        "totalEntrepreneurs": 3480,
        "totalAssessments": 5890,
        "activeMlModels": 4,
        "avgSuitabilityIndex": 81.2,
        "systemHealth": "Operational (Safe Mode Active)"
    }

# --- FEEDBACK ---
@router.post("/api/feedback")
def submit_feedback(data: Dict[str, Any]):
    saved = db_manager.save_feedback(data)
    return {
        "success": True,
        "message": "Thank you! Your feedback helps rural entrepreneurs across Maharashtra.",
        "feedback": saved
    }
