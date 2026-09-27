from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from core.database import db_manager
from core.security import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("")
def get_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    profile = db_manager.get_profile(user["id"])
    if not profile:
        profile = {
            "userId": user["id"],
            "businessName": user.get("name", "") + " Enterprises",
            "businessCategory": "Agri & Dairy Products",
            "state": user.get("state", "Maharashtra"),
            "district": user.get("district", "Satara"),
            "investmentRequirement": 650000,
            "ownContribution": 150000,
            "monthlyRevenue": 95000,
            "monthlyExpenses": 60000,
            "experienceYears": 3,
            "landAvailable": 1,
            "waterAvailable": 1,
            "electricityAvailable": 1,
            "workers": 3
        }
    return {"success": True, "profile": profile}

@router.put("")
def update_user_profile(profile_data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    saved = db_manager.save_profile(user["id"], profile_data)
    return {"success": True, "profile": saved}

@router.post("/business-type")
def update_business_type(data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    category = data.get("businessCategory") or data.get("businessType") or "General Micro-Enterprise"
    saved = db_manager.save_profile(user["id"], {"businessCategory": category})
    return {"success": True, "businessCategory": category, "profile": saved}

@router.post("/financials")
def update_financials(data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    allowed = ["investmentRequirement", "ownContribution", "monthlyRevenue", "monthlyExpenses", "existingDebt", "cashInHand"]
    fin_data = {k: float(v) for k, v in data.items() if k in allowed and v is not None}
    saved = db_manager.save_profile(user["id"], fin_data)
    return {"success": True, "financials": fin_data, "profile": saved}
