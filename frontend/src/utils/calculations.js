/**
 * Deterministic Financial Calculations for Rural Entrepreneurs
 * Pure equations matching backend/src/utils/financialFormulas.js
 */

export function calculateFinancialMetrics({
  investmentRequirement = 0,
  ownContribution = 0,
  monthlyRevenue = 0,
  monthlyExpenses = 0,
  existingDebt = 0,
  cashInHand = 0,
  loanTenureMonths = 60,
  annualInterestRate = 9.0
}) {
  const invest = Number(investmentRequirement) || 0;
  const own = Number(ownContribution) || 0;
  const rev = Number(monthlyRevenue) || 0;
  const exp = Number(monthlyExpenses) || 0;
  const debt = Number(existingDebt) || 0;
  const cash = Number(cashInHand) || 0;

  // 1. Funding Gap
  const fundingGap = Math.max(0, invest - own);
  const ownContributionPct = invest > 0 ? Math.round((own / invest) * 100) : 0;
  const fundingGapPct = invest > 0 ? Math.round((fundingGap / invest) * 100) : 0;

  // 2. Net Monthly Profit and Margins
  const monthlyProfit = rev - exp;
  const netProfitMargin = rev > 0 ? Math.round((monthlyProfit / rev) * 1000) / 10 : 0;

  // 3. Annualized Projections
  const annualRevenue = rev * 12;
  const annualExpenses = exp * 12;
  const annualProfit = monthlyProfit * 12;

  // 4. Deterministic Amortization for Funding Gap (EMI)
  let estimatedMonthlyEMI = 0;
  if (fundingGap > 0) {
    const monthlyRate = annualInterestRate / (12 * 100);
    const n = Number(loanTenureMonths) || 60;
    const factor = Math.pow(1 + monthlyRate, n);
    estimatedMonthlyEMI = Math.round((fundingGap * monthlyRate * factor) / (factor - 1));
  }

  // 5. Break-even Revenue Estimate
  const fixedExpenses = exp * 0.35;
  const variableRatio = rev > 0 ? (exp * 0.65) / rev : 0.65;
  const breakEvenMonthlyRevenue = variableRatio < 1 && fixedExpenses > 0
    ? Math.round(fixedExpenses / (1 - Math.min(variableRatio, 0.85)))
    : Math.round(exp * 1.15);

  // 6. Cash Buffer & Working Capital Runway
  const cashRunwayMonths = exp > 0 ? Math.round((cash / exp) * 10) / 10 : 0;

  // 7. Repayment capacity
  const repaymentFeasibility = monthlyProfit > (estimatedMonthlyEMI * 1.5)
    ? 'Feasible'
    : monthlyProfit > estimatedMonthlyEMI
    ? 'Moderate Margin'
    : 'Tight / High Risk';

  // 8. Financial Health Score (0 - 100 Scale)
  let healthScore = 50;
  if (netProfitMargin >= 25) healthScore += 20;
  else if (netProfitMargin >= 15) healthScore += 12;
  else if (netProfitMargin > 0) healthScore += 5;
  else if (rev > 0 && monthlyProfit < 0) healthScore -= 20;

  if (cashRunwayMonths >= 3) healthScore += 15;
  else if (cashRunwayMonths >= 1.5) healthScore += 10;
  else if (cashRunwayMonths >= 0.8) healthScore += 5;

  if (ownContributionPct >= 20) healthScore += 15;
  else if (ownContributionPct >= 10) healthScore += 8;

  if (debt === 0 && rev > 0) healthScore += 10;
  else if (debt > 0 && debt <= (annualRevenue * 0.2)) healthScore += 5;
  else if (debt > annualRevenue && annualRevenue > 0) healthScore -= 15;

  healthScore = Math.max(10, Math.min(99, Math.round(healthScore)));

  let healthStatus = 'Good';
  if (healthScore >= 80) healthStatus = 'Excellent';
  else if (healthScore >= 65) healthStatus = 'Healthy';
  else if (healthScore >= 45) healthStatus = 'Fair - Needs Optimization';
  else healthStatus = 'High Risk - Low Working Capital';

  return {
    investmentRequirement: invest,
    ownContribution: own,
    ownContributionPct,
    fundingGap,
    fundingGapPct,
    monthlyRevenue: rev,
    monthlyExpenses: exp,
    monthlyProfit,
    monthlyNetSurplus: monthlyProfit,
    netProfitMargin,
    profitMarginPct: netProfitMargin,
    annualRevenue,
    annualExpenses,
    annualProfit,
    estimatedMonthlyEMI,
    loanTenureMonths,
    annualInterestRate,
    breakEvenMonthlyRevenue,
    cashRunwayMonths,
    repaymentFeasibility,
    healthScore,
    healthStatus,
    assumptions: {
      interestRateRef: `${annualInterestRate}% p.a. (NABARD Priority Rural Lending benchmark)`,
      tenureRef: `${loanTenureMonths / 12} Years Standard Repayment Schedule`,
      disclaimer: 'Final eligibility, interest rates, and loan sanctioning are subject to formal verification by the concerned financial institution / government authority.'
    }
  };
}

export function formatIndianCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}
