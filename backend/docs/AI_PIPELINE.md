# VyaparSathi AI Pipeline & ML Model Architecture

The AI layer combines 4 pre-trained machine learning models with a multi-factor recommendation pipeline.

---

## 1. Machine Learning Model Artifacts

| Model Name | Artifact File | Algorithm | Input Features | Output Target |
| :--- | :--- | :--- | :--- | :--- |
| **Business Category Recommendation** | `vyaparsathi_business_category_model.joblib` | GradientBoostingClassifier (Pipeline) | `budget`, `experience_years`, `skill_level`, `land_available`, `water_available`, `electricity_available`, `location_type` | Probability distribution over 10 rural business categories |
| **Expected Demand Prediction** | `vyaparsathi_demand_model.joblib` | RandomForestClassifier (Pipeline) | `market_distance_km`, `budget`, `business_category`, `location_type` | Demand classification (`High`, `Medium`, `Low`) & class probabilities |
| **Business Suitability Model** | `vyaparsathi_business_suitability_model.pkl` | RandomForestRegressor | `investment_budget`, `experience_years`, `land_available`, `water_available`, `electricity_available`, `market_distance_km`, `competitor_count`, `workers` | Business suitability score ($0.10 - 0.99$) |
| **Monthly Profit Prediction** | `vyaparsathi_profit_model.pkl` | RandomForestRegressor | `budget`, `experience_years`, `land_available`, `workers`, `electricity_available`, `water_available`, `market_distance_km`, `business_suitability_score`, `budget_per_worker` | Estimated net monthly profit in INR |

> **IMPORTANT**: In strict adherence to project constraints, these artifacts have remained completely unchanged and have not been retrained.

---

## 2. Recommendation Engine Pipeline

```text
               User Input Profile (Budget, Land, Water, Power, Experience)
                                          │
                                          ▼
                         Business Category Recommendation ML
                                          │
                                          ▼
                             Top 3 Candidate Categories
                                          │
                   ┌──────────────────────┼──────────────────────┐
                   │                      │                      │
                   ▼                      ▼                      ▼
              Candidate 1            Candidate 2            Candidate 3
                   │                      │                      │
                   ├───────────► Demand ML (High/Med/Low) ◄──────┤
                   ├───────────► Suitability ML (0 - 100) ◄──────┤
                   └───────────► Profit ML (Monthly INR)  ◄──────┘
                                          │
                                          ▼
                                 Score Normalization
                                          │
                                          ▼
                               Multi-Factor Scoring
                                          │
                                          ▼
                             Descending Rank & Rationale
```

### Weighting & Scoring Formula

$$\text{FinalScore} = \text{CategoryScore} \times 0.30 + \text{DemandScore} \times 0.25 + \text{SuitabilityScore} \times 0.25 + \text{ProfitScore} \times 0.20$$

1. **Category Score**: $\text{Probability} \times 100$
2. **Demand Score**:
   - `High` = 100
   - `Medium` = 65
   - `Low` = 30
3. **Suitability Score**: $\text{Suitability (0-1)} \times 100$
4. **Profit Normalization**:
   - Normalized relative to the maximum positive predicted profit among all candidates:
     $$\text{ProfitScore} = \left(\frac{\text{CandidateProfit}}{\max(\text{PositiveProfits})}\right) \times 100$$
   - If all candidate profits are $\le 0$, $\text{ProfitScore} = 0$.

### Competitor Count Safeguard
- Never fabricated. Uses explicit user input or safe fallback of 0.
