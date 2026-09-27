# VyaparSathi Deterministic Financial Engine

In VyaparSathi, **all financial calculations are strictly deterministic**. Large Language Models (LLMs) are forbidden from generating, calculating, or estimating numeric loan, EMI, break-even, or gap values.

Implementation: `backend/src/utils/financialFormulas.js`

---

## 1. Formulas & Methodology

### A. Funding Gap & Promoter Margin
$$\text{Funding Gap} = \max(0, \text{Investment Requirement} - \text{Own Contribution})$$
$$\text{Own Contribution Pct} = \left(\frac{\text{Own Contribution}}{\text{Investment Requirement}}\right) \times 100$$

### B. Standard Reducing Balance EMI
For term loans under priority sector lending (benchmark $9\%$ annual interest, $60$ months tenure):
$$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$
Where:
- $P$ = Funding Gap (Principal)
- $r$ = Monthly interest rate $= \frac{\text{Annual Interest}}{12 \times 100}$
- $n$ = Loan tenure in months (Default: 60 months)

> **Zero-Interest Edge Case**: If annual interest rate $= 0\%$, $\text{EMI} = \text{round}(P / n)$.

### C. Break-Even Monthly Revenue
Assuming typical rural enterprise cost structures (65% variable input costs such as feed, packaging, and seeds; 35% fixed overheads such as rent and basic power):
$$\text{Fixed Overheads} = \text{Monthly Expenses} \times 0.35$$
$$\text{Variable Ratio} = \frac{\text{Monthly Expenses} \times 0.65}{\text{Monthly Revenue}}$$
$$\text{Break-Even Revenue} = \frac{\text{Fixed Overheads}}{1 - \min(\text{Variable Ratio}, 0.85)}$$

### D. Working Capital Cash Runway
$$\text{Runway Months} = \frac{\text{Cash in Hand}}{\text{Monthly Operating Expenses}}$$

### E. Financial Health Score (0 - 100)
A composite index incorporating:
- Net Profit Margin (Up to $+20$ points)
- Cash Runway ($\ge 3$ months gives $+15$ points)
- Own Contribution Ratio ($\ge 20\%$ gives $+15$ points)
- Existing Debt Leverage ($0$ debt gives $+10$ points; excess debt penalizes $-15$ points)

### F. Repayment Feasibility Tiers
- **Feasible**: $\text{Monthly Profit} > (\text{EMI} \times 1.5)$
- **Moderate Margin**: $\text{Monthly Profit} > \text{EMI}$
- **Tight / High Risk**: $\text{Monthly Profit} \le \text{EMI}$
