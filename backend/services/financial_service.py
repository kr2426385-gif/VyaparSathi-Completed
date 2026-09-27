import math
from typing import Dict, Any, List

def calculate_financial_metrics(inputs: Dict[str, Any]) -> Dict[str, Any]:
    invest = float(inputs.get("investmentRequirement") or 0)
    own = float(inputs.get("ownContribution") or 0)
    rev = float(inputs.get("monthlyRevenue") or 0)
    exp = float(inputs.get("monthlyExpenses") or 0)
    debt = float(inputs.get("existingDebt") or 0)
    cash = float(inputs.get("cashInHand") or 0)
    tenure = int(inputs.get("loanTenureMonths") or 60)
    interest_rate = float(inputs.get("annualInterestRate") or 9.0)

    # 1. Funding Gap
    funding_gap = max(0.0, invest - own)
    own_pct = round((own / invest) * 100) if invest > 0 else 0
    funding_gap_pct = round((funding_gap / invest) * 100) if invest > 0 else 0

    # 2. Net Monthly Profit & Margin
    monthly_profit = rev - exp
    net_profit_margin = round((monthly_profit / rev) * 1000) / 10 if rev > 0 else 0.0

    # 3. Annualized Projections
    annual_revenue = rev * 12
    annual_expenses = exp * 12
    annual_profit = monthly_profit * 12

    # 4. Deterministic Amortization (EMI)
    estimated_emi = 0
    if funding_gap > 0:
        monthly_rate = interest_rate / (12.0 * 100.0)
        factor = math.pow(1.0 + monthly_rate, tenure)
        if factor > 1.0:
            estimated_emi = round((funding_gap * monthly_rate * factor) / (factor - 1.0))

    # 5. Break-even Revenue Estimate
    fixed_expenses = exp * 0.35
    variable_ratio = (exp * 0.65) / rev if rev > 0 else 0.65
    if variable_ratio < 1.0 and fixed_expenses > 0:
        break_even_rev = round(fixed_expenses / (1.0 - min(variable_ratio, 0.85)))
    else:
        break_even_rev = round(exp * 1.15)

    # 6. Cash Buffer & Working Capital Runway
    cash_runway_months = round((cash / exp) * 10) / 10 if exp > 0 else 0.0

    # 7. Repayment Capacity (DSCR)
    total_monthly_debt = estimated_emi + (round(debt / 36) if debt > 0 else 0)
    if monthly_profit > (estimated_emi * 1.5):
        repayment_feasibility = "Feasible"
    elif monthly_profit > estimated_emi:
        repayment_feasibility = "Moderate Margin"
    else:
        repayment_feasibility = "Tight / High Risk"

    # 8. Financial Health Score (0 - 100 Scale)
    health_score = 50
    if net_profit_margin >= 25:
        health_score += 20
    elif net_profit_margin >= 15:
        health_score += 12
    elif net_profit_margin > 0:
        health_score += 5
    else:
        health_score -= 20

    if own_pct >= 25:
        health_score += 15
    elif own_pct >= 10:
        health_score += 8
    else:
        health_score -= 10

    if cash_runway_months >= 3:
        health_score += 15
    elif cash_runway_months >= 1:
        health_score += 8

    health_score = max(5, min(98, health_score))

    # 9. Credit Readiness Grade
    if health_score >= 75 and repayment_feasibility == "Feasible":
        credit_grade = "A (High Approval Probability)"
    elif health_score >= 55:
        credit_grade = "B (Eligible with Collateral / CGTMSE)"
    else:
        credit_grade = "C (Needs Promoter Equity Augmentation)"

    # 10. Recommended Loan Products
    loan_products = []
    if funding_gap <= 50000:
        loan_products.append("PM-SVANidhi (Micro-credit up to ₹50,000)")
        loan_products.append("MUDRA Shishu (No processing fee)")
    elif funding_gap <= 500000:
        loan_products.append("MUDRA Kishore (Uncollateralized term loan up to ₹5 Lakhs)")
        loan_products.append("PMEGP Service / Trading Category")
    elif funding_gap <= 1000000:
        loan_products.append("MUDRA Tarun (₹5 to ₹10 Lakhs)")
        loan_products.append("PMEGP Manufacturing Category (Up to ₹50 Lakhs)")
    else:
        loan_products.append("CMEGP Maharashtra (Up to ₹50 Lakhs with 15-35% subsidy)")
        loan_products.append("CGTMSE Supported MSME Priority Sector Term Loan")

    return {
        "fundingGap": funding_gap,
        "ownContributionPct": own_pct,
        "fundingGapPct": funding_gap_pct,
        "monthlyProfit": monthly_profit,
        "netProfitMargin": net_profit_margin,
        "annualRevenue": annual_revenue,
        "annualExpenses": annual_expenses,
        "annualProfit": annual_profit,
        "estimatedMonthlyEMI": estimated_emi,
        "totalMonthlyDebtService": total_monthly_debt,
        "breakEvenMonthlyRevenue": break_even_rev,
        "cashRunwayMonths": cash_runway_months,
        "repaymentFeasibility": repayment_feasibility,
        "financialHealthScore": health_score,
        "creditReadinessGrade": credit_grade,
        "recommendedLoanProducts": loan_products
    }
