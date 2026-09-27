from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from services.data_catalog_service import (
    get_schemes_list,
    match_schemes_for_profile,
    VERIFIED_SCHEMES
)

router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])

@router.get("")
def list_schemes(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    state: Optional[str] = Query(None)
):
    schemes = get_schemes_list(category=category, search=search, state=state)
    return {
        "disclaimer": "Final eligibility is decided by the concerned government authority.",
        "count": len(schemes),
        "schemes": schemes
    }

@router.post("/match")
def match_schemes(profile: Dict[str, Any]):
    matches = match_schemes_for_profile(profile)
    return {
        "disclaimer": "Final eligibility is decided by the concerned government authority.",
        "totalMatches": len(matches),
        "matches": matches
    }

@router.get("/{scheme_id}")
def get_scheme(scheme_id: str):
    for s in VERIFIED_SCHEMES:
        if s.get("id") == scheme_id:
            return {
                "disclaimer": "Final eligibility is decided by the concerned government authority.",
                "scheme": s
            }
    raise HTTPException(status_code=404, detail="Scheme not found.")
