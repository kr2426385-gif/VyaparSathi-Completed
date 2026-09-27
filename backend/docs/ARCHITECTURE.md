# VyaparSathi Architecture & System Design

**VyaparSathi** is an AI-powered business and financial advisory platform specifically engineered for rural and semi-urban entrepreneurs across Maharashtra, India.

---

## 1. High-Level System Architecture

```text
                               +---------------------------------------+
                               |           React + Vite UI             |
                               |    (Marathi, Hindi, English i18n)     |
                               +-------------------+-------------------+
                                                   | HTTP / REST (JWT Auth)
                                                   v
                               +---------------------------------------+
                               |     Express.js API Gateway (:5000)    |
                               +----+--------------+-------------------+
                                    |              |
                    Mongoose / Atlas|              | Internal REST / Proxies
                                    v              v
                  +-------------------+      +---------------------------------+
                  |   MongoDB Atlas   |      |   FastAPI AI Service (:8000)    |
                  |     Database      |      +----+------------+---------------+
                  +-------------------+           |            |
                                                  v            v
                                            +-----------+ +--------------------+
                                            | 4 ML Model| |  RAG Knowledge     |
                                            | Artifacts | | (BM25 + Guidelines)|
                                            +-----------+ +--------------------+
```

---

## 2. Component Taxonomy & Data Honesty Classification

To maintain absolute data integrity and regulatory compliance, all components adhere to strict operational labeling:

| Component | Status Classification | Underlying Technology | Operational Role |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | **LIVE** | MongoDB Atlas, Mongoose, JWT, bcrypt | User identity & tenancy isolation |
| **Business Assessment Persistence** | **LIVE** | MongoDB Atlas `BusinessAssessment` collection | Storing user inputs, predictions & scores |
| **Recommendation Engine** | **MODEL-PREDICTED** | GradientBoosting + RandomForest Ensemble | Ranks top 3 business categories |
| **Expected Demand Model** | **MODEL-PREDICTED** | Random Forest Classifier | Predicts High / Medium / Low demand |
| **Business Suitability Model** | **MODEL-PREDICTED** | Random Forest Regressor | Computes feasibility fit (0.1–0.99) |
| **Profit Prediction Model** | **MODEL-PREDICTED** | Random Forest Regressor | Estimates monthly operating surplus |
| **Financial Engine (EMI / Break-Even / Gap)** | **RULE-BASED (DETERMINISTIC)** | Financial Mathematics (`financialFormulas.js`) | Zero-hallucination exact metrics |
| **Government Scheme Matching** | **RULE-BASED** | Verified Government Schemes Criteria (`verifiedSchemes.js`) | CMEGP, PMEGP, PMFME, MUDRA, SMART, CGTMSE |
| **RAG Knowledge System** | **RAG-BASED** | BM25 Cross-Lingual Retriever + Official Govt Guidelines | Official eligibility & documentation query answering |
| **AI Advisor Query Gateway** | **RAG + RULE-BASED** | FastAPI Advisory + RAG Engine | Answers multi-lingual queries with citations |
| **Loan Readiness Engine** | **RULE-BASED** | Multi-factor weighted readiness score | Advisory readiness score (not credit bureau score) |
| **Business Feasibility Report** | **DETERMINISTIC AGGREGATION** | Backend Report Service | Bank-ready detailed project summary format |
| **Post-Loan Operational Guidance** | **RULE-BASED** | Operational guidance heuristics | Cash flow reserves & repayment scheduling |
| **Market Intelligence Indicators** | **ESTIMATED (PROTOTYPE)** | Demand Model + Location heuristic | Explicitly marked `prototype-estimate`, `verified: false` |
| **Local Spot Pricing Intelligence** | **NOT AVAILABLE** | Pluggable Connector Architecture | Explicitly returns `null` & `source: not-available` |
| **Local Competitor Analysis** | **NOT AVAILABLE** | Pluggable Registry Architecture | Explicitly returns `[]` & `source: not-available` |
| **Voice Interface (STT / TTS)** | **ESTIMATED / PLUGGABLE** | Provider-agnostic interface | Gracefully reports unconfigured without crash |

---

## 3. End-to-End Execution Flow

1. **User Profile & Registration**: User registers securely via Express (`/api/auth/register`), hashed with bcrypt and persisted in Atlas.
2. **Business Assessment Form**: User inputs budget, experience, utilities (land, water, power), and location constraints.
3. **Recommendation Engine (`POST /api/recommendations`)**:
   - Queries Business Category Model for Top 3 candidates.
   - For each candidate, queries Expected Demand Model, Suitability Model, and Profit Model.
   - Normalizes scores and computes weighted final score:
     $$Score = Category(30\%) + Demand(25\%) + Suitability(25\%) + Profit(20\%)$$
   - Ranks candidates descending and generates contextual explanation.
4. **Financial Structuring**: Computes exact Funding Gap, Own Contribution, Monthly EMI amortized at 9%, Break-even Revenue, and Working Capital Runway.
5. **Scheme Eligibility**: Matches 6 official government schemes (CMEGP, PMEGP, PMFME, MUDRA, SMART, CGTMSE).
6. **Assessment Persistence**: Saves full snapshot into `BusinessAssessment` collection in MongoDB Atlas.
7. **RAG Advisory Support**: Answering questions regarding schemes, required documents (7/12, Udyam, DPR), and eligibility citing official government sources.
8. **Bank Appraisal Dossier**: Compiles bank-ready feasibility report for branch submission.
