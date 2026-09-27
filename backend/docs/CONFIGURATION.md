# VyaparSathi — Configuration & External Integration Guide

This guide documents all environment variables, provider architectures, and external integration points for the VyaparSathi platform.

---

## 1. Core Mandatory Services

Only two environment variables are strictly required to start the production system:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas or replica set connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vyaparsathi` |
| `JWT_SECRET` | Cryptographic secret for signing entrepreneur session JWT tokens | `min_32_chars_random_string` |

---

## 2. Pluggable External Integrations (All Optional)

The platform is designed with a **Graceful Degradation Contract**: if an external provider's credentials are not configured, the platform safely uses an honest transparent fallback rather than crashing or inventing mock data.

### A. Live APMC & Mandi Market Data

* **Service File:** `backend/src/services/marketDataProvider.js`
* **Purpose:** Real-time spot prices and arrivals across Maharashtra APMC mandis (AGMARKNET / MSAMB).

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `MARKET_DATA_PROVIDER` | No | `unavailable` | Provider selector: `apmc`, `external`, or `unavailable`. |
| `APMC_API_KEY` | If provider=apmc | `null` | API key for government Open Data / AGMARKNET portal. |
| `APMC_API_URL` | If provider=apmc | `null` | API endpoint for Mandi commodity prices. |
| `MARKET_API_TIMEOUT_MS`| No | `4000` | HTTP request timeout in milliseconds before fallback. |

* **Fallback behavior:** Returns `price: null`, `verified: false`, `dataStatus: "unavailable"`.

---

### B. Local Enterprise & Competitor Intelligence

* **Service File:** `backend/src/services/competitorProvider.js`
* **Purpose:** Verified enterprise directory lookups (Udyam MSME registry / DIC).

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `COMPETITOR_DATA_PROVIDER` | No | `overpass` | Provider selector: `overpass`, `registry`, `local`, or `unavailable`. |
| `OVERPASS_API_URL` | If provider=overpass | `https://overpass-api.de/api/interpreter` | OpenStreetMap Overpass interpreter endpoint. |
| `OVERPASS_TIMEOUT_MS` | No | `15000` | HTTP request timeout in milliseconds before fallback. |
| `UDYAM_API_KEY` | If provider=registry | `null` | Authorized Ministry of MSME / Udyam GIS API key. |
| `UDYAM_API_URL` | If provider=registry | `null` | Registry query URL. |
| `LOCAL_BUSINESS_API_KEY` | If provider=local | `null` | Key for commercial places/business directory. |

* **Fallback behavior:** When Overpass public server is busy/504, automatically serves verified Maharashtra district MSME directory fallback or transparently reports `dataStatus: "unavailable"`.

---

### C. Speech-to-Text & Text-to-Speech (Voice Assistant)

* **Service File:** `ai-service/voice/voice_service.py` & `backend/src/routes/voice.js`
* **Supported Languages:** Marathi (`mr`), Hindi (`hi`), English (`en`).

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `VOICE_PROVIDER` | No | `unavailable` | Provider selector: `google`, `azure`, or `unavailable`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | If provider=google | `null` | Path to Google Cloud Service Account JSON file. |
| `GOOGLE_SPEECH_API_KEY` | If provider=google | `null` | Alternative Google Speech REST API Key. |
| `AZURE_SPEECH_KEY` | If provider=azure | `null` | Microsoft Azure Cognitive Services Speech Key. |
| `AZURE_SPEECH_REGION` | If provider=azure | `null` | Azure Service Region (e.g. `centralindia`). |

* **Fallback behavior:** Backend responds with `{ available: false, clientFallback: "browser_speech_api" }`. Frontend utilizes native Web Speech API and quick-select prompt pills.

---

### D. AI Advisor & LLM Summarization

* **Service File:** `ai-service/main.py` & `ai-service/rag/rag_service.py`

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `AI_SERVICE_URL` | No | `http://127.0.0.1:8000` | Address of the FastAPI ML/RAG daemon. |
| `GEMINI_API_KEY` | No | `null` | Google Gemini API Key for grounded LLM advisory. |

* **Fallback behavior:** High-precision deterministic RAG knowledge synthesis using official government documents (CMEGP, PMEGP, PMFME, MUDRA, SMART, CGTMSE).

---

## 3. Deployment Checklist

1. Verify `.env` is listed in `.gitignore`.
2. Confirm MongoDB Atlas connection via `GET /api/health`.
3. Verify all 4 ML models are loaded in FastAPI via `GET http://127.0.0.1:8000/health`.
4. Compile frontend bundle with `npm run build`.
