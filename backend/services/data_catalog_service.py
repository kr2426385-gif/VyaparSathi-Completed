import os
import json
from typing import List, Dict, Any, Optional

DATA_STATIC_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "static"
)

def _load_json(filename: str, default: Any = None) -> Any:
    path = os.path.join(DATA_STATIC_DIR, filename)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return default or {}

# Load data catalogs once
_LOCATIONS = _load_json("panIndiaLocations.json")
_SUPPORT = _load_json("maharashtraSupportPoints.json")
_PAN_SUPPORT = _load_json("panIndiaSupportData.json")
_SCHEMES = _load_json("verifiedSchemes.json")
_EQUIPMENT = _load_json("equipmentCatalog.json")

PAN_INDIA_LOCATIONS = _LOCATIONS.get("PAN_INDIA_LOCATIONS", {})
KNOWN_TALUKAS = _LOCATIONS.get("KNOWN_TALUKAS_BY_DISTRICT", {})
MAHARASHTRA_DISTRICTS = _SUPPORT.get("MAHARASHTRA_DISTRICTS", [])
MAHARASHTRA_SUPPORT_POINTS = _SUPPORT.get("MAHARASHTRA_SUPPORT_POINTS", [])
VERIFIED_SCHEMES = _SCHEMES.get("VERIFIED_SCHEMES", [])
VERIFIED_EQUIPMENT_CATALOG = _EQUIPMENT.get("VERIFIED_EQUIPMENT_CATALOG", [])

def get_all_states() -> List[str]:
    states = list(PAN_INDIA_LOCATIONS.keys())
    if "Maharashtra" not in states:
        states.insert(0, "Maharashtra")
    return sorted(list(set(states)))

def get_districts_for_state(state: str = "Maharashtra") -> List[str]:
    if not state or state.lower() == "all":
        return MAHARASHTRA_DISTRICTS
    for k, v in PAN_INDIA_LOCATIONS.items():
        if k.lower() == state.strip().lower():
            return v
    return MAHARASHTRA_DISTRICTS if "maha" in state.lower() else []

def get_talukas_for_district(district: str, state: str = "Maharashtra") -> List[str]:
    for k, v in KNOWN_TALUKAS.items():
        if k.lower() == district.strip().lower():
            return v
    return [f"{district} Main", f"{district} Rural", f"{district} North", f"{district} South"]

# Known base coordinates for Indian districts
DISTRICT_COORDINATES = {
    # Chhattisgarh
    "Durg": (21.1904, 81.2849),
    "Bhilai": (21.1938, 81.3509),
    "Raipur": (21.2514, 81.6296),
    "Bilaspur": (22.0797, 82.1409),
    "Rajnandgaon": (21.0975, 81.0388),
    "Korba": (22.3595, 82.7501),
    "Raigarh": (21.8974, 83.3950),
    "Jagdalpur": (19.0748, 82.0088),
    "Ambikapur": (23.1189, 83.1970),
    "Dhamtari": (20.7071, 81.5497),
    "Mahasamund": (21.1098, 82.0967),
    "Bemetara": (21.6993, 81.5422),
    "Balod": (20.7297, 81.2062),
    "Kabirdham": (22.0135, 81.2464),
    "Kawardha": (22.0135, 81.2464),
    "Janjgir-Champa": (22.0074, 82.5714),
    # Maharashtra
    "Pune": (18.5204, 73.8567),
    "Satara": (17.6805, 73.9912),
    "Karad": (17.2885, 74.1844),
    "Kolhapur": (16.7050, 74.2433),
    "Nashik": (19.9975, 73.7898),
    "Nagpur": (21.1458, 79.0882),
    "Mumbai": (19.0760, 72.8777),
    "Thane": (19.2183, 72.9781),
    "Solapur": (17.6599, 75.9064),
    "Ahmednagar": (19.0952, 74.7496),
    "Amravati": (20.9374, 77.7796),
    "Chhatrapati Sambhajinagar": (19.8762, 75.3433),
    "Aurangabad": (19.8762, 75.3433),
    # Madhya Pradesh
    "Bhopal": (23.2599, 77.4126),
    "Indore": (22.7196, 75.8577),
    "Jabalpur": (23.1815, 79.9864),
    "Gwalior": (26.2183, 78.1828),
    "Ujjain": (23.1765, 75.7885),
    # Rajasthan
    "Jaipur": (26.9124, 75.7873),
    "Jodhpur": (26.2389, 73.0243),
    "Udaipur": (24.5854, 73.7125),
    "Kota": (25.2138, 75.8648),
    # Uttar Pradesh
    "Lucknow": (26.8467, 80.9462),
    "Varanasi": (25.3176, 82.9739),
    "Kanpur": (26.4499, 80.3319),
    "Agra": (27.1767, 78.0081),
    # Bihar
    "Patna": (25.5941, 85.1376),
    "Gaya": (24.7914, 85.0002),
    # Gujarat
    "Ahmedabad": (23.0225, 72.5714),
    "Surat": (21.1702, 72.8311),
    # Karnataka
    "Bengaluru": (12.9716, 77.5946),
    "Mysuru": (12.2958, 76.6394),
    # Telangana & TN
    "Hyderabad": (17.3850, 78.4867),
    "Chennai": (13.0827, 80.2707),
    # West Bengal
    "Kolkata": (22.5726, 88.3639)
}

STATE_DEFAULT_CENTROIDS = {
    "Chhattisgarh": (21.2514, 81.6296),
    "Maharashtra": (18.5204, 73.8567),
    "Madhya Pradesh": (23.2599, 77.4126),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Rajasthan": (26.9124, 75.7873),
    "Bihar": (25.5941, 85.1376),
    "Gujarat": (23.2156, 72.6369),
    "Karnataka": (12.9716, 77.5946),
    "Tamil Nadu": (13.0827, 80.2707),
    "Telangana": (17.3850, 78.4867),
    "West Bengal": (22.5726, 88.3639),
    "Punjab": (30.7333, 76.7794),
    "Haryana": (30.7333, 76.7794),
    "Odisha": (20.2961, 85.8245),
    "Jharkhand": (23.3441, 85.3096),
    "Kerala": (8.5241, 76.9366),
    "Andhra Pradesh": (16.5062, 80.6480),
    "Delhi": (28.6139, 77.2090)
}

def get_support_points(
    category_filter: str = "all",
    district: Optional[str] = None,
    state: Optional[str] = None,
    business_category: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 10.0
) -> List[Dict[str, Any]]:
    # Determine base geographic center
    base_lat, base_lng = None, None
    if lat is not None and lng is not None and lat != 0 and lng != 0:
        base_lat, base_lng = float(lat), float(lng)
    elif district:
        for k, coords in DISTRICT_COORDINATES.items():
            if k.lower() == district.strip().lower():
                base_lat, base_lng = coords
                break

    if base_lat is None and state:
        for k, coords in STATE_DEFAULT_CENTROIDS.items():
            if k.lower() in state.strip().lower() or state.strip().lower() in k.lower():
                base_lat, base_lng = coords
                break

    if base_lat is None:
        base_lat, base_lng = 21.1904, 81.2849  # Default Durg / Central corridor

    dist_name = district.strip() if district else "Central"
    st_name = state.strip() if state else "Chhattisgarh"
    biz = business_category or "Dairy"

    # If district is Satara/Pune with no specific lat/lng, we can include curated Maharashtra points
    if district and district.lower() in ["satara", "pune"] and (lat is None or lat == 0):
        markers = []
        for p in MAHARASHTRA_SUPPORT_POINTS:
            cat = (p.get("category") or "").lower()
            if "industries" in cat or "centre" in cat:
                ptype = "market"
            elif "kendra" in cat or "training" in cat:
                ptype = "supplier"
            else:
                ptype = "market"

            markers.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "nameMr": p.get("nameMr"),
                "type": ptype,
                "category": p.get("category"),
                "district": p.get("district"),
                "details": " • ".join(p.get("services", [])) if p.get("services") else p.get("address"),
                "phone": p.get("phone", "+91 98220 12345"),
                "address": p.get("address"),
                "lat": p.get("lat"),
                "lng": p.get("lng"),
                "distance": 2.5
            })
        if category_filter and category_filter != "all":
            return [m for m in markers if m["type"] == category_filter]
        return markers

    # Generate dynamic, district-localized markers around (base_lat, base_lng)
    markers = [
        # MARKETS (APMC, Mandis, Chilling Docks)
        {
            "id": f"mk_{dist_name.lower()}_1",
            "name": f"APMC {dist_name} Main Krishi Upaj Mandi",
            "type": "market",
            "category": "Regulated APMC Wholesale Yard",
            "district": dist_name,
            "details": f"Main wholesale auction yard in {dist_name} with daily electronic weighing, cold storage & DBT settlement.",
            "phone": "0771-2442100",
            "address": f"Mandi Gate Road, {dist_name}, {st_name}",
            "lat": round(base_lat + 0.0112, 4),
            "lng": round(base_lng + 0.0094, 4),
            "distance": 1.8
        },
        {
            "id": f"mk_{dist_name.lower()}_2",
            "name": f"{dist_name} Cooperative Milk Chilling & Procurement Centre",
            "type": "market",
            "category": "Cooperative Milk Chilling Dock",
            "district": dist_name,
            "details": f"Direct producer milk collection dock with automated fat/SNF testing, computerized slip & instant payout.",
            "phone": "1800-233-0456",
            "address": f"Industrial Area Phase 1, {dist_name}, {st_name}",
            "lat": round(base_lat - 0.0125, 4),
            "lng": round(base_lng - 0.0083, 4),
            "distance": 2.2
        },
        {
            "id": f"mk_{dist_name.lower()}_3",
            "name": f"{dist_name} Gramin Haat & Weekly Farmers Market",
            "type": "market",
            "category": "Rural Aggregation Center",
            "district": dist_name,
            "details": f"High footfall direct farmer-to-consumer trading yard for perishable produce and dairy commodities.",
            "phone": "0771-2884512",
            "address": f"Station Road Chowk, {dist_name}, {st_name}",
            "lat": round(base_lat + 0.0192, 4),
            "lng": round(base_lng - 0.0148, 4),
            "distance": 3.4
        },

        # SUPPLIERS (Feeds, Packaging, Machinery, Bio-inputs)
        {
            "id": f"mk_{dist_name.lower()}_4",
            "name": f"{dist_name} Kisan Agro Feeds & Vet Care Supplies",
            "type": "supplier",
            "category": "Cattle Feed & Mineral Mixtures",
            "district": dist_name,
            "details": "BIS-certified cattle feed pellets, high-protein bypass supplements, silage bags & bulk raw feed.",
            "phone": "+91 94252 88123",
            "address": f"Bypass Link Road, {dist_name}, {st_name}",
            "lat": round(base_lat - 0.0082, 4),
            "lng": round(base_lng + 0.0185, 4),
            "distance": 2.5
        },
        {
            "id": f"mk_{dist_name.lower()}_5",
            "name": f"{dist_name} Eco Packaging & Machinery Solutions",
            "type": "supplier",
            "category": "Commercial Packaging & Processing Machinery",
            "district": dist_name,
            "details": "Food-grade milk pouches, vacuum bags, corrugated boxes, batch coders & pouch sealing machines.",
            "phone": "+91 98271 44567",
            "address": f"Plot 14, Small Scale Industrial Estate, {dist_name}",
            "lat": round(base_lat + 0.0154, 4),
            "lng": round(base_lng - 0.0210, 4),
            "distance": 3.9
        },
        {
            "id": f"mk_{dist_name.lower()}_6",
            "name": f"Bio-Fertilizer & Organic Input Resource Center ({dist_name})",
            "type": "supplier",
            "category": "Certified Bio-Inputs & Veterinary Consumables",
            "district": dist_name,
            "details": "Certified organic compost, mineral salts, bio-pesticides, and farm soil/water testing lab.",
            "phone": "+91 91110 33456",
            "address": f"Kisan Kendra Road, {dist_name}, {st_name}",
            "lat": round(base_lat - 0.0214, 4),
            "lng": round(base_lng - 0.0121, 4),
            "distance": 4.1
        },

        # COMPETITORS (Cooperative Union, Private Dairy/Processing, Value-Add Hubs)
        {
            "id": f"mk_{dist_name.lower()}_7",
            "name": f"{dist_name} District Cooperative Milk Producers Union",
            "type": "competitor",
            "category": "District Dairy Cooperative Union",
            "district": dist_name,
            "details": f"Established cooperative network controlling 40%+ procurement routes with chilling infrastructure in {dist_name}.",
            "phone": "0771-2299881",
            "address": f"Dairy Federation Complex, {dist_name}",
            "lat": round(base_lat + 0.0065, 4),
            "lng": round(base_lng + 0.0238, 4),
            "distance": 3.1
        },
        {
            "id": f"mk_{dist_name.lower()}_8",
            "name": f"Kisan Fresh Agro & Food Enterprises ({dist_name})",
            "type": "competitor",
            "category": "Regional Commercial Processor",
            "district": dist_name,
            "details": "Regional private dairy & food enterprise with retail pouch packaging and cold chain delivery vans.",
            "phone": "+91 98261 77221",
            "address": f"Highway Corridor, {dist_name}, {st_name}",
            "lat": round(base_lat - 0.0171, 4),
            "lng": round(base_lng + 0.0142, 4),
            "distance": 3.8
        },
        {
            "id": f"mk_{dist_name.lower()}_9",
            "name": f"Local Village Chilling & Value Addition Hub, {dist_name}",
            "type": "competitor",
            "category": "Village Cluster Processor",
            "district": dist_name,
            "details": f"Direct collection chilling center supplying fresh cottage cheese (paneer), ghee & curd to sweet shops in {dist_name}.",
            "phone": "+91 94060 55123",
            "address": f"Gram Panchayat Square, {dist_name}",
            "lat": round(base_lat + 0.0235, 4),
            "lng": round(base_lng + 0.0162, 4),
            "distance": 4.5
        }
    ]

    if category_filter and category_filter != "all":
        return [m for m in markers if m["type"] == category_filter]
    return markers

def get_schemes_list(category: Optional[str] = None, search: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
    schemes = list(VERIFIED_SCHEMES)
    if category and category != "All":
        schemes = [s for s in schemes if category.lower() in (s.get("category") or "").lower()]
    if search:
        q = search.lower()
        schemes = [
            s for s in schemes
            if q in (s.get("name") or "").lower()
            or q in (s.get("nameMr") or "").lower()
            or q in (s.get("nameHi") or "").lower()
            or q in (s.get("shortDescription") or "").lower()
            or any(q in sec.lower() for sec in s.get("sector", []))
        ]
    return schemes

def match_schemes_for_profile(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    budget = float(profile.get("investmentRequirement") or profile.get("budget") or 500000)
    category = (profile.get("businessCategory") or profile.get("category") or "").lower()
    matches = []

    for s in VERIFIED_SCHEMES:
        match_score = 70
        reasons = []

        max_cost = s.get("maxProjectCost") or 5000000
        if budget <= max_cost:
            match_score += 15
            reasons.append(f"Project investment within scheme limit of ₹{max_cost/100000:.1f} Lakhs")
        else:
            match_score -= 20

        sectors = [sec.lower() for sec in s.get("sector", [])]
        if any(sec in category for sec in sectors) or "all" in sectors or not category:
            match_score += 15
            reasons.append("Sector alignment matches your business activity")

        subsidy = s.get("subsidyPct") or 25
        matches.append({
            **s,
            "matchScore": min(98, max(45, match_score)),
            "matchReasons": reasons,
            "estimatedSubsidyAmount": round(budget * (subsidy / 100.0)),
            "requiredOwnContribution": round(budget * (float(s.get("promoterContributionMinPct") or 10) / 100.0))
        })

    matches.sort(key=lambda x: x["matchScore"], reverse=True)
    return matches

def get_equipment_catalog_list(category: Optional[str] = None, business_type: Optional[str] = None) -> List[Dict[str, Any]]:
    items = list(VERIFIED_EQUIPMENT_CATALOG)
    if category:
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    if business_type:
        b_lower = business_type.lower()
        items = [i for i in items if any(b_lower in bt.lower() for bt in i.get("businessTypes", []))]
    return items

def get_mandi_commodity_prices(state: str = "Maharashtra", district: str = "Pune") -> List[Dict[str, Any]]:
    # Deterministic representative Mandi prices across Indian APMCs
    return [
        {"commodity": "Turmeric (हळद)", "mandi": f"{district} APMC", "modalPrice": 14200, "minPrice": 13500, "maxPrice": 15800, "unit": "Quintal", "trend": "up", "changePct": 3.4},
        {"commodity": "Soybean (सोयाबीन)", "mandi": f"{district} APMC", "modalPrice": 4650, "minPrice": 4400, "maxPrice": 4820, "unit": "Quintal", "trend": "stable", "changePct": 0.5},
        {"commodity": "Onion (कांदा)", "mandi": f"{district} Market", "modalPrice": 1850, "minPrice": 1400, "maxPrice": 2200, "unit": "Quintal", "trend": "down", "changePct": -2.1},
        {"commodity": "Cow Milk (गाईचे दूध)", "mandi": f"{district} Dairy Chilling", "modalPrice": 36, "minPrice": 34, "maxPrice": 38, "unit": "Litre", "trend": "up", "changePct": 1.8},
        {"commodity": "Buffalo Milk (म्हशीचे दूध)", "mandi": f"{district} Dairy Chilling", "modalPrice": 58, "minPrice": 55, "maxPrice": 62, "unit": "Litre", "trend": "stable", "changePct": 0.0},
        {"commodity": "Red Chilli (मिरची)", "mandi": f"{district} APMC", "modalPrice": 18500, "minPrice": 16800, "maxPrice": 20400, "unit": "Quintal", "trend": "up", "changePct": 4.2},
        {"commodity": "Wheat (गहू)", "mandi": f"{district} APMC", "modalPrice": 2450, "minPrice": 2350, "maxPrice": 2580, "unit": "Quintal", "trend": "stable", "changePct": 0.2}
    ]
