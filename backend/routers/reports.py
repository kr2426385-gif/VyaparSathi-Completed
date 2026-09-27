from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/generate")
def generate_report(data: Dict[str, Any]):
    title = data.get("title") or "Detailed Project Report (DPR)"
    budget = data.get("investmentRequirement") or 500000
    category = data.get("businessCategory") or "Micro-Enterprise"

    return {
        "success": True,
        "reportId": f"rep_{abs(int(hash(title))) % 100000}",
        "reportTitle": title,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "summary": {
            "businessCategory": category,
            "totalProjectCost": budget,
            "promoterEquity": round(budget * 0.2),
            "bankTermLoan": round(budget * 0.55),
            "governmentSubsidy": round(budget * 0.25),
            "breakEvenPeriodMonths": 14,
            "projectedIRR": "24.5%"
        },
        "status": "Ready for DIC / Bank Submission"
    }

from typing import Dict, Any, Optional

@router.post("/business-feasibility")
@router.get("/business-feasibility")
def get_business_feasibility_report(payload: Optional[Dict[str, Any]] = None):
    if not payload:
        payload = {}
    fin = payload.get("financialSummary") or {}
    inp = payload.get("inputs") or {}
    ent = payload.get("entrepreneur") or {}

    def safe_float(val, default):
        try:
            return float(val) if val is not None else float(default)
        except (ValueError, TypeError):
            return float(default)

    def safe_int(val, default):
        try:
            return int(val) if val is not None else int(default)
        except (ValueError, TypeError):
            return int(default)

    inv = safe_float(fin.get("investmentRequirement") or inp.get("budget"), 650000.0)
    own = safe_float(fin.get("ownContribution"), round(inv * 0.23))
    gap = safe_float(fin.get("fundingGap"), max(0.0, inv - own))
    
    own_pct = round((own / inv) * 100, 1) if inv > 0 else 23.0
    gap_pct = round((gap / inv) * 100, 1) if inv > 0 else 77.0

    monthly_rev = safe_float(fin.get("monthlyRevenue"), round(inv * 0.16))
    monthly_exp = safe_float(fin.get("monthlyExpenses"), round(inv * 0.095))
    monthly_profit = safe_float(fin.get("monthlyProfit"), max(0.0, monthly_rev - monthly_exp))
    emi = safe_float(fin.get("estimatedMonthlyEMI"), round(gap * 0.021))
    break_even = safe_float(fin.get("breakEvenMonthlyRevenue"), round(monthly_exp * 1.15))

    moratorium_months = safe_int(fin.get("moratoriumMonths") or inp.get("moratoriumMonths"), 0)
    moratorium_type = str(fin.get("interestDuringMoratorium") or inp.get("interestDuringMoratorium") or "pay_monthly")

    return {
        "success": True,
        "reportTitle": "Bank Feasibility & Credit Appraisal Dossier (DPR)",
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "entrepreneur": {
            "name": ent.get("name") or "Rural Entrepreneur",
            "experienceYears": ent.get("experienceYears") or inp.get("experience_years") or 2
        },
        "business": {
            "category": payload.get("businessCategory") or inp.get("businessCategory") or "Dairy & Rural Processing",
            "district": payload.get("district") or inp.get("district") or "Durg",
            "state": payload.get("state") or inp.get("state") or "Chhattisgarh"
        },
        "market": {
            "marketReach": "5 km (Local Village Cluster)",
            "demandStatus": "High",
            "competitorLandscape": "3 local competitor(s) identified in cluster area"
        },
        "opportunityIndex": {
            "score": 78,
            "level": "High",
            "components": {
                "demand": 78,
                "competition": 62,
                "marketReach": 85,
                "pricing": 70
            },
            "explanation": "Strong market demand with favorable local pricing corridors and manageable competitor density."
        },
        "threats": [
            {
                "title": "Seasonal Raw Material Fluctuation",
                "severity": "medium",
                "reason": "Harvest cycle variations in local wholesale mandi",
                "mitigation": "Annual forward procurement contracts and buffer raw material storage."
            },
            {
                "title": "Rural Grid Power Downtime",
                "severity": "low",
                "reason": "Rural grid voltage fluctuations during peak hours",
                "mitigation": "Solar hybrid backup unit eligible for 30% state subsidy."
            },
            {
                "title": "Working Capital Lag",
                "severity": "low",
                "reason": "Institutional buyer 15-day payment cycle",
                "mitigation": "Dedicated CC (Cash Credit) working capital limit under CGTMSE."
            }
        ],
        "financials": {
            "investmentRequirement": inv,
            "ownContribution": own,
            "ownContributionPct": own_pct,
            "fundingGap": gap,
            "fundingGapPct": gap_pct,
            "monthlyRevenue": monthly_rev,
            "monthlyExpenses": monthly_exp,
            "monthlyProfit": monthly_profit,
            "projectedMonthlyProfit": monthly_profit,
            "estimatedMonthlyEMI": emi,
            "breakEvenMonthlyRevenue": break_even,
            "totalRepayment": emi * 60,
            "moratorium": {
                "months": moratorium_months,
                "interestDuringMoratorium": moratorium_type,
                "postMoratoriumEMI": emi,
                "interestDuringMoratoriumAmount": 0,
                "principalAfterMoratorium": gap,
                "postMoratoriumTenureMonths": 60
            }
        },
        "schemes": [
            {
                "name": "PMEGP (Prime Minister Employment Generation Programme)",
                "matchPercentage": 92,
                "subsidyPercentage": 35
            },
            {
                "name": "PM Mudra Yojana (Tarun Category)",
                "matchPercentage": 85,
                "subsidyPercentage": 20
            },
            {
                "name": "Agriculture Infrastructure Fund (AIF 3% Subvention)",
                "matchPercentage": 78,
                "subsidyPercentage": 15
            }
        ],
        "loanReadiness": {
            "score": 82,
            "status": "Ready",
            "pslEligible": True
        },
        "bankAppraisal": {
            "pslEligible": True,
            "cgtmseCover": True,
            "recommendedTenorMonths": 60,
            "indicativeInterestRate": "9.15% p.a."
        },
        "disclaimer": "This report is generated for advisory and bank credit feasibility preparation in accordance with RBI Priority Sector Lending guidelines."
    }

