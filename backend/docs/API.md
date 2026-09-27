# VyaparSathi API Specification & Contracts

Base URL: `http://127.0.0.1:5000/api`  
AI Service URL: `http://127.0.0.1:8000`

---

## 1. Authentication & User Tenancy

### `POST /auth/register`
Creates new user account.
- **Payload**: `{ "name": "...", "email": "...", "password": "...", "phone": "...", "district": "..." }`
- **Response**: `201 Created` with `{ "token": "...", "user": { ... } }`

### `POST /auth/login`
Authenticates existing user.
- **Payload**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK` with `{ "token": "...", "user": { ... } }`

### `GET /auth/me`
Protected by JWT (`Authorization: Bearer <token>`).
- **Response**: `200 OK` with user details.

---

## 2. Recommendation Engine

### `POST /recommendations`
Protected by JWT. Orchestrates 4 ML models to output ranked Top 3 business recommendations.
- **Input**:
```json
{
  "budget": 150000,
  "experience_years": 3,
  "skill_level": "Medium",
  "land_available": 1,
  "water_available": 1,
  "electricity_available": 1,
  "location_type": "Rural",
  "market_distance_km": 5,
  "competitor_count": 0,
  "workers": 2
}
```
- **Response**: `200 OK`
```json
{
  "recommendations": [
    {
      "rank": 1,
      "businessCategory": "Dairy Processing",
      "finalScore": 71.9,
      "categoryScore": 40.4,
      "demandScore": 65,
      "suitabilityScore": 84.9,
      "profitScore": 100,
      "predictedMonthlyProfit": 13433,
      "demandLevel": "Medium",
      "suitability": 0.85,
      "confidence": 0.4,
      "reason": "Stable regular demand and high resource compatibility with your budget & infrastructure, offering healthy estimated monthly surplus of ₹13,433."
    }
  ]
}
```

---

## 3. Market Intelligence & Transparency APIs

### `GET /market-intelligence`
Protected by JWT.
- **Query Parameters**: `district`, `taluka`, `businessCategory`, `radius`
- **Response**: `200 OK`
```json
{
  "location": { "district": "Pune", "taluka": "Haveli", "radiusKm": 15 },
  "businessCategory": "Dairy Processing",
  "marketData": { "demandLevel": "Medium", "demandScore": 65, "averagePrice": null, "competitorCount": null },
  "source": "prototype-estimate",
  "dataStatus": "limited",
  "live": false,
  "verified": false
}
```

### `GET /pricing`
Protected by JWT.
- **Query Parameters**: `district`, `taluka`, `businessCategory`, `product`
- **Response**: `200 OK`
```json
{
  "product": "Milk",
  "businessCategory": "Dairy Processing",
  "location": "Haveli, Pune",
  "price": null,
  "priceRange": { "min": null, "max": null },
  "unit": "per litre",
  "source": "not-available",
  "verified": false,
  "message": "Local verified pricing data is currently unavailable."
}
```

### `GET /competitors`
Protected by JWT.
- **Query Parameters**: `district`, `taluka`, `businessCategory`, `radius`
- **Response**: `200 OK`
```json
{
  "businessCategory": "Bakery",
  "location": "Haveli, Pune",
  "competitors": [],
  "competitorCount": null,
  "source": "not-available",
  "verified": false,
  "message": "No verified competitor registry data available for this locality."
}
```

---

## 4. AI Advisory & RAG

### `POST /ai/advisory/query` (or `/advisory/query`)
Contextual multi-lingual Q&A answering official scheme, loan, and operational queries with source citations.
- **Input**: `{ "query": "...", "language": "mr|hi|en", "userProfile": null }`
- **Response**: `200 OK`
```json
{
  "answer": "...",
  "suggestedActions": ["..."],
  "relevantSchemes": [{ "name": "...", "code": "..." }],
  "language": "mr",
  "source": "rag_official_knowledge",
  "sources": [
    {
      "id": "cmegp",
      "title": "Chief Minister Employment Generation Programme (CMEGP) Maharashtra",
      "source": "Directorate of Industries, Government of Maharashtra (maha-cmegp.gov.in)",
      "documentType": "government",
      "officialPortal": "https://maha-cmegp.gov.in"
    }
  ]
}
```

---

## 5. Voice Interface

### `POST /voice/transcribe`
- **Input**: `{ "audioContent": "base64...", "language": "mr|hi|en" }`
- **Response**: `200 OK` `{ "available": false, "message": "Voice service is not configured." }`

### `POST /voice/speak`
- **Input**: `{ "text": "...", "language": "mr|hi|en" }`
- **Response**: `200 OK` `{ "available": false, "message": "Voice service is not configured." }`

---

## 6. Loan Readiness & Bank Report

### `POST /loan-readiness` or `GET /loan-readiness`
Protected by JWT. Returns transparent multi-factor readiness score.
- **Response**: `200 OK`
```json
{
  "scoreTitle": "VyaparSathi Loan Readiness Score",
  "score": 77,
  "status": "Good",
  "factors": [
    { "name": "Business Profile", "score": 85, "weightPct": 30 },
    { "name": "Financial Readiness", "score": 75, "weightPct": 40 },
    { "name": "Documentation", "score": 70, "weightPct": 30 }
  ],
  "missingDocuments": ["..."],
  "improvements": ["..."],
  "disclaimer": "This is an advisory readiness score and is not a bank credit score."
}
```

### `POST /reports/business-feasibility`
Protected by JWT.
- **Response**: `200 OK` Detailed bank feasibility dossier with deterministic financials, matched schemes, risks, and DPR format.

---

## 7. Business Assessments (History)

- `GET /assessments`: Lists historical assessments belonging strictly to authenticated user (paginated).
- `GET /assessments/:id`: Retrieves specific assessment with strict ownership verification (returns 403 on foreign user access).
- `POST /assessments`: Persists new assessment including inputs, predictions, financial summary, schemes, and ranked recommendations.
