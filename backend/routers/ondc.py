from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api/ondc", tags=["ONDC Integration"])

@router.post("/check-readiness")
def check_ondc_readiness(data: Dict[str, Any]):
    has_gst = bool(data.get("hasGst", False))
    has_catalog = bool(data.get("hasDigitalCatalog", True))
    has_bank = bool(data.get("hasCurrentAccount", True))

    score = 40
    if has_gst: score += 30
    if has_catalog: score += 20
    if has_bank: score += 10

    return {
        "success": True,
        "ondcReadinessScore": score,
        "isReadyToOnboard": score >= 70,
        "checklist": [
            {"item": "Udyam Registration", "status": "Verified", "completed": True},
            {"item": "GSTIN / Composition Registration", "status": "Required for inter-state" if not has_gst else "Verified", "completed": has_gst},
            {"item": "Digital Product Catalog with Barcodes", "status": "Ready" if has_catalog else "Pending", "completed": has_catalog},
            {"item": "Bank Account for Settlements", "status": "Ready" if has_bank else "Pending", "completed": has_bank}
        ],
        "suggestedSellerApps": ["Mystore", "Plotch.ai", "Spice Money ONDC"]
    }
