from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.financial_service import calculate_financial_metrics

router = APIRouter(prefix="/api/calculate", tags=["Calculator"])

class CalculatorRequest(BaseModel):
    investmentRequirement: Optional[float] = 0
    ownContribution: Optional[float] = 0
    monthlyRevenue: Optional[float] = 0
    monthlyExpenses: Optional[float] = 0
    existingDebt: Optional[float] = 0
    cashInHand: Optional[float] = 0
    loanTenureMonths: Optional[int] = 60
    annualInterestRate: Optional[float] = 9.0

@router.post("")
def calculate(req: CalculatorRequest):
    results = calculate_financial_metrics(req.dict())
    return {
        "success": True,
        "data": results
    }
