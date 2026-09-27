# VyaparSathi — Production ML Real-Data Retraining Pipeline

## 1. Executive Summary & Architecture

The VyaparSathi Machine Learning system is designed to provide contextual business intelligence to rural micro-entrepreneurs across Maharashtra. Initial versions utilized supervised models trained on curated synthetic prototype survey distributions.

This document specifies the production real-data continuous learning architecture that extracts authentic user business outcomes from MongoDB Atlas, strictly separates ground-truth outcomes from model predictions, enforces target leakage protection, gates candidate promotion, and manages safe fallback and rollback.

```
+-----------------------------------------------------------------------------------+
|                            VYAPARSATHI LEARNING FLOW                             |
+-----------------------------------------------------------------------------------+
|  Rural User Assessment -> Express -> MongoDB Atlas (BusinessAssessment)           |
|                                         |                                         |
|  User Field Reporting -> POST /api/assessments/:id/outcome                        |
|                                         |                                         |
|  MongoDB Extractor (extract_mongodb.py) - Strips PII, extracts ground truth       |
|                                         |                                         |
|  Data Validator (validate_dataset.py)  - Strict Target Leakage Rejection          |
|                                         |                                         |
|  Data Preparer (prepare_dataset.py)   - User-isolated GroupShuffleSplit           |
|                                         |                                         |
|  Quality Gate (quality_gate.py)        - Min sample threshold check (>= 100)      |
|                                         |                                         |
|  Candidate Training (train_candidates) -> writes to models/candidates/           |
|                                         |                                         |
|  Model Evaluation (evaluate_models.py) - Held-out test split evaluation           |
|                                         |                                         |
|  Model Registry (model_registry.py)    - SHA-256 Checksum, Promotion, Rollback    |
|                                         |                                         |
|  Runtime ML Service (ml_service.py)   - Smoke inference + Baseline fallback       |
+-----------------------------------------------------------------------------------+
```

---

## 2. MongoDB Real User Outcome Schema

Actual business outcomes are persisted as an optional `outcome` subdocument inside `backend/src/models/BusinessAssessment.js`:

```javascript
outcome: {
  actualMonthlyRevenue: { type: Number, min: 0 },
  actualMonthlyExpenses: { type: Number, min: 0 },
  actualMonthlyProfit: { type: Number },
  actualDemandLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  actualBusinessCategory: { type: String, trim: true },
  businessStatus: { type: String, enum: ['planned', 'started', 'operating', 'closed'], default: 'operating' },
  outcomeDate: { type: Date, default: Date.now },
  source: { type: String, enum: ['user_reported'], default: 'user_reported' },
  verified: { type: Boolean, default: false },
  notes: { type: String, maxlength: 1000 },
  submittedAt: { type: Date }
}
```

### Deterministic Profit Calculation
When both `actualMonthlyRevenue` and `actualMonthlyExpenses` are provided by the user and `actualMonthlyProfit` is omitted, the system deterministically calculates:
$$\text{actualMonthlyProfit} = \text{actualMonthlyRevenue} - \text{actualMonthlyExpenses}$$

### Ground Truth vs Predictions Non-Contamination Rule
**Predictions are NEVER used as training labels.**
Under no circumstance does the backend copy:
- `predictions.profitPrediction` $\rightarrow$ `outcome.actualMonthlyProfit`
- `predictions.demandPrediction` $\rightarrow$ `outcome.actualDemandLevel`
- `predictions.categoryRecommendation` $\rightarrow$ `outcome.actualBusinessCategory`

Automated regression tests in `backend/test/test_ml_learning_pipeline.js` strictly enforce this separation.

---

## 3. MongoDB Data Extraction & PII Stripping

Implemented in `ai-service/training/extract_mongodb.py`:
- **Connection**: Uses `MONGODB_URI` environment variable with secure pooling and timeouts.
- **Collection**: Reads `businessassessments` collection where `outcome != null`.
- **Zero PII Leakage**: Explicitly excludes passwords, JWTs, emails, phone numbers, personal names, and physical street addresses.
- **Provenance**: Generates non-reversible SHA-256 hashes:
  - `assessment_provenance_id`: SHA-256 hash of assessment ObjectId (truncated to 16 characters).
  - `user_group_hash`: SHA-256 hash of user ObjectId for user-isolated train/test splitting without tracking personal identity.

---

## 4. Model-Specific Labels & Feature Definitions

### A. Profit Prediction Model (`profit_prediction`)
- **Target (Label)**: `outcome.actualMonthlyProfit` (Continuous numeric)
- **Input Features (9)**:
  1. `budget` (Float)
  2. `experience_years` (Float)
  3. `land_available` (0 or 1)
  4. `workers` (Float $\ge 1.0$)
  5. `electricity_available` (0 or 1)
  6. `water_available` (0 or 1)
  7. `market_distance_km` (Float)
  8. `business_suitability_score` (Float heuristic context)
  9. `budget_per_worker` (Computed as $\text{budget} / \max(1, \text{workers})$)

### B. Expected Demand Model (`demand_prediction`)
- **Target (Label)**: `outcome.actualDemandLevel` (Categorical: `Low`, `Medium`, `High`)
- **Input Features (4)**:
  1. `market_distance_km` (Float)
  2. `budget` (Float)
  3. `business_category` (Categorical)
  4. `location_type` (Categorical: `Rural`, `Semi-Urban`, `Urban`)

### C. Business Category Recommendation Model (`business_category`)
- **Target (Label)**: `outcome.actualBusinessCategory` (Categorical)
- **Input Features (7)**:
  1. `budget` (Float)
  2. `experience_years` (Float)
  3. `skill_level` (Categorical: `Low`, `Medium`, `High`)
  4. `land_available` (0 or 1)
  5. `water_available` (0 or 1)
  6. `electricity_available` (0 or 1)
  7. `location_type` (Categorical)

### D. Business Suitability Model (`business_suitability`) — Policy Limitation
- **Status**: `REAL LABEL NOT AVAILABLE`
- **Retraining**: `BLOCKED`
- **Rationale**: The baseline suitability model was trained on a synthetic heuristic formula. In real life, rural entrepreneurs report revenue, expenses, and survival—not an arbitrary floating-point "suitability score". Fabricating fake suitability scores or deriving them formulaically from features is strictly forbidden. Retraining remains blocked until objective outcome criteria (e.g. 12-month business survival or loan non-default) are formally defined.

---

## 5. Strict Target Leakage Protection

Implemented in `ai-service/training/validate_dataset.py`:
Any feature input containing any of the following fields immediately triggers a fatal `TargetLeakageException` and aborts pipeline execution:
- `monthly_revenue`, `monthly_expenses`, `monthly_profit`
- `actualMonthlyRevenue`, `actualMonthlyExpenses`, `actualMonthlyProfit`
- `actualDemandLevel`, `actual_demand`, `expected_demand`
- `actualBusinessCategory`, `actual_category`
- `target_actual_monthly_profit`, `target_actual_demand`, `target_actual_business_category`

---

## 6. User-Isolated Train/Test Splitting

Implemented in `ai-service/training/prepare_dataset.py`:
- Utilizes `GroupShuffleSplit` grouped by `user_group_hash`.
- Guarantees that all historical assessments from a given entrepreneur exist either entirely in the training split OR entirely in the test split.
- Prevents user-level correlation leakage between training and evaluation.

---

## 7. Quality Gate & Minimum Real Data Thresholds

Implemented in `ai-service/training/quality_gate.py`:
Retraining and candidate promotion require passing a rigorous 9-point Quality Gate:

| Check | Requirement |
|---|---|
| 1. Minimum Samples | $\ge 100$ real verified outcomes (`ML_MIN_REAL_SAMPLES_*`) |
| 2. Zero Target Leakage | Confirmed by feature audit |
| 3. Mathematical Consistency | Profit $\approx$ Revenue - Expenses |
| 4. Candidate Artifact | Saved in `models/candidates/` (Never overwrites baseline) |
| 5. Evaluation Metrics | Evaluated strictly on held-out test split |
| 6. Performance Sanity | Regression: $R^2 > -0.5$; Classification: Accuracy $\ge 50\%$ |
| 7. Checksum Integrity | SHA-256 generated and verified |
| 8. Smoke Inference | Sample payload executed with valid bounded output |
| 9. Promotion Policy | Dry-run mode prevents mutation; Auto-retrain requires opt-in |

If real labelled samples are below threshold, the pipeline logs:
```
PIPELINE READY — WAITING FOR SUFFICIENT REAL-WORLD LABELLED DATA
```
No models are retrained, no fake rows are synthesized, and baseline models remain active.

---

## 8. Model Registry & Runtime Resilience

Implemented in `ai-service/training/model_registry.py`:
- **Model Registry (`models/registry.json`)**: Tracks `baseline`, `candidate`, `active`, `archive`, and `rollback` statuses.
- **SHA-256 Verification**: Every model artifact is checksum-verified prior to loading.
- **Corrupted Model Fallback**: If an active model file is missing, checksum-mismatched, or fails smoke inference, `ml_service.py` automatically rolls back and activates the verified baseline model.
- **Admin APIs**:
  - `GET /api/ml/status` — Reports database outcome count and model health.
  - `GET /api/ml/models` — Returns active and candidate registry entries.
  - `GET /api/ml/training-runs` — Lists audit history from `MLTrainingRun`.
  - `POST /api/ml/retrain` — Admin-only authenticated endpoint supporting dry-run evaluation.
