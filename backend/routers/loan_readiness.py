from fastapi import APIRouter
from typing import Dict, Any, List, Optional

router = APIRouter(prefix="/api/loan-readiness", tags=["Loan Readiness"])

@router.get("/checklist")
def get_checklist():
    return {
        "success": True,
        "checklist": [
            {"id": "doc_aadhaar", "title": "Aadhaar Card (Linked to Mobile)", "mandatory": True, "category": "KYC"},
            {"id": "doc_pan", "title": "PAN Card (Proprietorship / Entity)", "mandatory": True, "category": "KYC"},
            {"id": "doc_udyam", "title": "Udyam Registration Certificate", "mandatory": True, "category": "Registration"},
            {"id": "doc_bank", "title": "Bank Account Statements (Past 6 Months)", "mandatory": True, "category": "Financial"},
            {"id": "doc_quotation", "title": "Signed Machinery / Equipment Quotation", "mandatory": True, "category": "Machinery"},
            {"id": "doc_dpr", "title": "Detailed Project Report (DPR)", "mandatory": False, "category": "Project"},
            {"id": "doc_land", "title": "7/12 Land Record or Notarized Rent Agreement", "mandatory": False, "category": "Premises"}
        ]
    }

def _compute_readiness(data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    data = data or {}
    inputs = data.get("inputs") or data or {}
    financials = data.get("financials") or {}
    
    budget = float(inputs.get("budget") or financials.get("investmentRequirement") or 650000)
    own = float(inputs.get("ownContribution") or financials.get("ownContribution") or 150000)
    revenue = float(inputs.get("monthlyRevenue") or financials.get("monthlyRevenue") or 90000)
    expenses = float(inputs.get("monthlyExpenses") or financials.get("monthlyExpenses") or 55000)
    docs = data.get("documentsProvided") or data.get("documentsAvailable") or []

    funding_gap = max(0.0, budget - own)
    monthly_profit = max(0.0, revenue - expenses)
    est_emi = round(funding_gap * 0.021) if funding_gap > 0 else 0
    dscr = round(monthly_profit / est_emi, 2) if est_emi > 0 else 2.1

    own_pct = (own / budget * 100) if budget > 0 else 0
    margin_pct = (monthly_profit / revenue * 100) if revenue > 0 else 0

    # Multi-Factor Weighting
    profile_score = 75
    if int(inputs.get("experience_years") or 2) >= 3:
        profile_score += 10
    if inputs.get("skill_level") == "High":
        profile_score += 10
    profile_score = min(95, profile_score)

    fin_score = 65
    if own_pct >= 20: fin_score += 15
    elif own_pct >= 10: fin_score += 8
    if margin_pct >= 25: fin_score += 15
    elif margin_pct >= 15: fin_score += 8
    fin_score = min(95, fin_score)

    doc_count = len(docs)
    doc_score = min(95, max(50, 50 + (doc_count * 8)))

    # Weighted Overall Score (30% Profile, 40% Financial, 30% Documentation)
    overall_score = round((profile_score * 0.3) + (fin_score * 0.4) + (doc_score * 0.3))

    if overall_score >= 80:
        status = "Ready"
        readiness_level = "Bank Ready (High Sanction Probability)"
    elif overall_score >= 65:
        status = "Moderate"
        readiness_level = "Conditionally Eligible (CGTMSE Cover Advised)"
    else:
        status = "Low"
        readiness_level = "Needs Equity Support / Seed Margin"

    return {
        "success": True,
        "score": overall_score,
        "readinessScore": overall_score,
        "compositeScore": overall_score,
        "status": status,
        "readinessLevel": readiness_level,
        "factors": [
            {"name": "Business Profile", "score": profile_score, "weightPct": 30},
            {"name": "Financial Readiness", "score": fin_score, "weightPct": 40},
            {"name": "Documentation", "score": doc_score, "weightPct": 30}
        ],
        "fundingGap": funding_gap,
        "dscr": dscr,
        "dscrStatus": "Strong Repayment Feasibility" if dscr >= 1.5 else "Moderate Margin",
        "eligibleSchemes": [
            "MUDRA Kishore (Up to ₹5 Lakhs uncollateralized)",
            "CMEGP Maharashtra (Up to 35% Capital Subsidy)",
            "PMEGP Rural Scheme (Up to ₹50 Lakhs project cost)",
            "CGTMSE Collateral-Free Credit Guarantee Scheme"
        ],
        "recommendations": [
            "Promoter contribution satisfies the mandatory margin criteria for priority sector bank lending.",
            "Maintain verified current account turnover with consistent daily balances.",
            "Procure machinery quotations from GST-registered vendors with minimum 1-year warranty."
        ]
    }

@router.get("")
def get_loan_readiness():
    return _compute_readiness({})

@router.post("")
def post_loan_readiness(data: Optional[Dict[str, Any]] = None):
    return _compute_readiness(data)

@router.post("/assess")
def assess_endpoint(data: Optional[Dict[str, Any]] = None):
    return _compute_readiness(data)
