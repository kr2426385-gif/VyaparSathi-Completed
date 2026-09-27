from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/api/recommendations", tags=["Business Recommendations"])

@router.post("")
@router.get("")
def get_recommendations(data: Dict[str, Any] = None):
    data = data or {}
    budget = float(data.get("budget") or 400000)
    land = int(data.get("landAvailable") or 1)
    water = int(data.get("waterAvailable") or 1)

    recs = []
    if budget >= 300000 and water:
        recs.append({
            "category": "Dairy & Milk Chilling Unit",
            "suitabilityScore": 92,
            "estimatedMonthlyProfit": 38000,
            "requiredInvestment": 450000,
            "subsidyAvailable": "35% under CMEGP",
            "justification": "High rural consumption demand and stable cooperative milk procurement prices."
        })
    if budget >= 150000:
        recs.append({
            "category": "Spice & Turmeric Grinding",
            "suitabilityScore": 88,
            "estimatedMonthlyProfit": 29000,
            "requiredInvestment": 220000,
            "subsidyAvailable": "35% under PMFME",
            "justification": "Low machinery depreciation, long shelf life, and strong weekly market (haat) sales."
        })
    if land and budget >= 100000:
        recs.append({
            "category": "Organic Bio-Fertilizer & Vermicompost",
            "suitabilityScore": 84,
            "estimatedMonthlyProfit": 21000,
            "requiredInvestment": 120000,
            "subsidyAvailable": "Paramparagat Krishi Vikas Yojana",
            "justification": "Zero raw material cost utilizing farm biomass and cattle dung."
        })

    return {
        "success": True,
        "totalRecommendations": len(recs),
        "recommendations": recs
    }
