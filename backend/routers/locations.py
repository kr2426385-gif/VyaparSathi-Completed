from fastapi import APIRouter, Query
from typing import Optional
from services.data_catalog_service import (
    get_all_states,
    get_districts_for_state,
    get_talukas_for_district,
    get_support_points
)

router = APIRouter(tags=["Locations & Support Points"])

@router.get("/api/locations/states")
def get_states():
    states = get_all_states()
    return {"totalStates": len(states), "states": states}

@router.get("/api/locations/districts")
def get_districts(state: str = Query("Maharashtra")):
    districts = get_districts_for_state(state)
    return {
        "state": state,
        "totalDistricts": len(districts),
        "districts": districts
    }

@router.get("/api/locations/talukas")
def get_talukas(district: str = Query("Satara"), state: str = Query("Maharashtra")):
    talukas = get_talukas_for_district(district, state)
    return {
        "state": state,
        "district": district,
        "totalTalukas": len(talukas),
        "talukas": talukas
    }

@router.get("/api/locations/support-points")
def get_points(
    filter: str = Query("all"),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    businessCategory: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(10.0)
):
    f_val = filter if isinstance(filter, str) else "all"
    d_val = district if isinstance(district, str) else None
    s_val = state if isinstance(state, str) else None
    b_val = businessCategory if isinstance(businessCategory, str) else None
    lat_val = float(lat) if isinstance(lat, (int, float)) else None
    lng_val = float(lng) if isinstance(lng, (int, float)) else None
    r_val = float(radius) if isinstance(radius, (int, float)) else 10.0

    markers = get_support_points(
        category_filter=f_val,
        district=d_val,
        state=s_val,
        business_category=b_val,
        lat=lat_val,
        lng=lng_val,
        radius=r_val
    )
    return {"total": len(markers), "markers": markers}

@router.get("/api/nearby")
def get_nearby(
    filter: str = Query("all"),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    businessCategory: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(10.0)
):
    f_val = filter if isinstance(filter, str) else "all"
    d_val = district if isinstance(district, str) else None
    s_val = state if isinstance(state, str) else None
    b_val = businessCategory if isinstance(businessCategory, str) else None
    lat_val = float(lat) if isinstance(lat, (int, float)) else None
    lng_val = float(lng) if isinstance(lng, (int, float)) else None
    r_val = float(radius) if isinstance(radius, (int, float)) else 10.0

    markers = get_support_points(
        category_filter=f_val,
        district=d_val,
        state=s_val,
        business_category=b_val,
        lat=lat_val,
        lng=lng_val,
        radius=r_val
    )
    return {"total": len(markers), "markers": markers}

