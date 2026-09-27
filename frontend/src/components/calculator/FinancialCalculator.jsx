import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, TrendingUp, AlertTriangle, ShieldCheck, 
  HelpCircle, ArrowRight, RefreshCw, CheckCircle2,
  DollarSign, BarChart3, Layers, Clock, AlertCircle, FileText,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { calculateFinancialMetrics, formatIndianCurrency } from '../../utils/calculations.js';
import { apiService } from '../../services/api.js';
import { Stepper, Step, StepActions } from '../ui/index.jsx';

export default function FinancialCalculator({ defaultWorkflow = 'project-cost', onSaveToProfile, onNavigate, user }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Determine sub-workflow from URL
  const getWorkflowFromPath = () => {
    const path = location.pathname;
    if (path.includes('/finance/profitability') || path.includes('/finance/cash-flow')) return 'profitability';
    if (path.includes('/finance/funding-gap')) return 'funding-gap';
    if (path.includes('/finance/emi-repayment') || path.includes('/finance/loan-ready')) return 'emi-repayment';
    if (path.includes('/finance/project-cost')) return 'project-cost';
    return defaultWorkflow || 'project-cost';
  };

  const [activeWorkflow, setActiveWorkflow] = useState(getWorkflowFromPath());

  const getStepIndexFromWorkflow = (wf) => {
    if (wf === 'project-cost') return 0;
    if (wf === 'funding-gap') return 1;
    if (wf === 'profitability' || wf === 'cash-flow') return 2;
    if (wf === 'emi-repayment' || wf === 'loan-ready') return 3;
    return 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(() => getStepIndexFromWorkflow(getWorkflowFromPath()));

  useEffect(() => {
    const wf = getWorkflowFromPath();
    setActiveWorkflow(wf);
    setCurrentStepIndex(getStepIndexFromWorkflow(wf));
  }, [location.pathname]);

  // Derive initial values from user profile if available
  const initialInv = Number(user?.investmentRequirement) || 600000;
  const initialRev = Number(user?.monthlyRevenue) || 135000;
  const initialExp = Number(user?.monthlyExpenses) || 82000;

  // Core Financial Inputs
  const [equipmentCost, setEquipmentCost] = useState(() => Math.round(initialInv * 0.60));
  const [shedSetupCost, setShedSetupCost] = useState(() => Math.round(initialInv * 0.25));
  const [rawMaterialBuffer, setRawMaterialBuffer] = useState(() => Math.round(initialInv * 0.15));
  const [ownContributionPct, setOwnContributionPct] = useState(20);

  // Profitability Inputs
  const [monthlyRevenue, setMonthlyRevenue] = useState(() => initialRev);
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => initialExp);
  const [existingDebt, setExistingDebt] = useState(() => Number(user?.existingDebt) || 30000);
  const [cashInHand, setCashInHand] = useState(() => Number(user?.cashInHand) || 45000);
  const [showCashFlow, setShowCashFlow] = useState(false);

  // Keep synced with user prop updates
  useEffect(() => {
    if (user) {
      if (user.investmentRequirement) {
        const inv = Number(user.investmentRequirement);
        setEquipmentCost(Math.round(inv * 0.60));
        setShedSetupCost(Math.round(inv * 0.25));
        setRawMaterialBuffer(Math.round(inv * 0.15));
      }
      if (user.monthlyRevenue) setMonthlyRevenue(Number(user.monthlyRevenue));
      if (user.monthlyExpenses) setMonthlyExpenses(Number(user.monthlyExpenses));
      if (user.existingDebt !== undefined && user.existingDebt !== null) setExistingDebt(Number(user.existingDebt));
      if (user.cashInHand !== undefined && user.cashInHand !== null) setCashInHand(Number(user.cashInHand));
    }
  }, [user]);

  // Keep synced with profile broadcast event
  useEffect(() => {
    const handleProfileSync = (e) => {
      const u = e.detail?.user || e.detail?.profile;
      const fin = e.detail?.financials;
      if (u) {
        if (u.investmentRequirement) {
          const inv = Number(u.investmentRequirement);
          setEquipmentCost(Math.round(inv * 0.60));
          setShedSetupCost(Math.round(inv * 0.25));
          setRawMaterialBuffer(Math.round(inv * 0.15));
        }
        if (u.monthlyRevenue) setMonthlyRevenue(Number(u.monthlyRevenue));
        if (u.monthlyExpenses) setMonthlyExpenses(Number(u.monthlyExpenses));
        if (u.existingDebt !== undefined && u.existingDebt !== null) setExistingDebt(Number(u.existingDebt));
        if (u.cashInHand !== undefined && u.cashInHand !== null) setCashInHand(Number(u.cashInHand));
      }
      if (fin) {
        if (fin.monthlyRevenue) setMonthlyRevenue(Number(fin.monthlyRevenue));
        if (fin.monthlyExpenses) setMonthlyExpenses(Number(fin.monthlyExpenses));
        if (fin.cashInHand !== undefined && fin.cashInHand !== null) setCashInHand(Number(fin.cashInHand));
      }
    };
    window.addEventListener('vyapar_profile_updated', handleProfileSync);
    return () => window.removeEventListener('vyapar_profile_updated', handleProfileSync);
  }, []);

  // Loan Repayment Inputs
  const [interestRate, setInterestRate] = useState(9.0);
  const [tenureYears, setTenureYears] = useState(5);

  // Derived Total Project Cost
  const totalProjectCost = equipmentCost + shedSetupCost + rawMaterialBuffer;
  const ownCapital = Math.round((totalProjectCost * ownContributionPct) / 100);

  // Deterministic calculation memo
  const results = useMemo(() => {
    return calculateFinancialMetrics({
      investmentRequirement: totalProjectCost,
      ownContribution: ownCapital,
      monthlyRevenue: monthlyRevenue,
      monthlyExpenses: monthlyExpenses,
      existingDebt: existingDebt,
      cashInHand: cashInHand,
      loanTenureMonths: tenureYears * 12,
      annualInterestRate: interestRate
    });
  }, [totalProjectCost, ownCapital, monthlyRevenue, monthlyExpenses, existingDebt, cashInHand, tenureYears, interestRate]);

  // Total Interest & Repayment
  const totalRepayment = results.estimatedMonthlyEMI * tenureYears * 12;
  const totalInterest = Math.max(0, totalRepayment - results.fundingGap);

  // DSCR (Debt Service Coverage Ratio)
  const monthlyNetOperatingProfit = Math.max(0, monthlyRevenue - monthlyExpenses);
  const dscrRatio = results.estimatedMonthlyEMI > 0 
    ? (monthlyNetOperatingProfit / results.estimatedMonthlyEMI).toFixed(2)
    : '0.00';

  // Live Baseline ML Profit Regressor State
  const [mlProfitData, setMlProfitData] = useState(null);
  const [mlProfitLoading, setMlProfitLoading] = useState(false);
  const [mlProfitStatus, setMlProfitStatus] = useState('idle'); // 'idle' | 'live' | 'unavailable'

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setMlProfitLoading(true);
      try {
        const res = await apiService.predictProfit({
          investment_requirement: totalProjectCost,
          monthly_revenue: monthlyRevenue,
          monthly_expenses: monthlyExpenses,
          loan_amount: results.fundingGap,
          tenure_months: tenureYears * 12
        });
        if (isMounted) {
          if (res && res.success && res.predicted_monthly_profit !== undefined) {
            setMlProfitData({
              predictedMonthlyProfit: res.predicted_monthly_profit,
              model: res.model || 'RandomForest Regressor',
              source: res.source || 'ml',
              provenance: 'ML Prediction'
            });
            setMlProfitStatus('live');
          } else {
            setMlProfitData(null);
            setMlProfitStatus('unavailable');
          }
        }
      } catch (err) {
        if (isMounted) {
          setMlProfitData(null);
          setMlProfitStatus('unavailable');
        }
      } finally {
        if (isMounted) setMlProfitLoading(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [totalProjectCost, monthlyRevenue, monthlyExpenses, results.fundingGap, tenureYears]);

  const STEP_WORKFLOWS = ['project-cost', 'funding-gap', 'profitability', 'emi-repayment'];

  const handleStepChange = (index) => {
    setCurrentStepIndex(index);
    const targetWf = STEP_WORKFLOWS[index] || 'project-cost';
    setActiveWorkflow(targetWf);
    if (onNavigate) {
      onNavigate(`/finance/${targetWf}`);
    }
  };

  const handleReset = () => {
    setEquipmentCost(0);
    setShedSetupCost(0);
    setRawMaterialBuffer(0);
    setMonthlyRevenue(0);
    setMonthlyExpenses(0);
    setExistingDebt(0);
    setCashInHand(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* 1. Header */}
      <div className="border-b border-stone-200 pb-3 flex justify-between items-center gap-3">
        <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
          {t('finance.page_title', { defaultValue: 'Financial Calculator' })}
        </h1>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw size={13} />
          <span>{t('finance.reset_values', { defaultValue: 'Reset' })}</span>
        </button>
      </div>

      {/* 2. GUIDED VERTICAL 4-STEP FINANCIAL STEPPER */}
      <Stepper
        orientation="vertical"
        activeStep={currentStepIndex}
        onStepChange={handleStepChange}
        className="pt-2"
      >
        {/* STEP 1: PROJECT SETUP COST */}
        <Step
          index={0}
          icon={Calculator}
          title={t('finance.step1_title', { defaultValue: 'Step 1: Project Setup Cost' })}
          description={t('finance.step1_desc', { defaultValue: 'Enter machinery outlay, shed construction, electrification, and initial working capital.' })}
          badge={t('finance.capital_outlay_badge', { defaultValue: 'Capital Outlay' })}
          completed={currentStepIndex > 0}
          summary={`Total Capital Outlay: ${formatIndianCurrency(totalProjectCost)} (Machinery: ${formatIndianCurrency(equipmentCost)}, Shed: ${formatIndianCurrency(shedSetupCost)}, Working Capital: ${formatIndianCurrency(rawMaterialBuffer)}).`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black text-stone-900 uppercase tracking-wide">
                    {t('finance.capex_components_title', { defaultValue: 'Capital Expenditure & Setup Components' })}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    {t('finance.capex_components_desc', { defaultValue: 'Enter capital expenditure and initial working capital required for setup.' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEquipmentCost(0);
                    setShedSetupCost(0);
                    setRawMaterialBuffer(0);
                  }}
                  className="text-[11px] font-bold text-stone-500 hover:text-[#0b2545] underline cursor-pointer shrink-0"
                  title={t('finance.clear_figures_title', { defaultValue: 'Clear default demonstration figures to enter your own numbers' })}
                >
                  {t('finance.clear_to_empty', { defaultValue: 'Clear to Empty' })}
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('finance.machinery_cost_label', { defaultValue: 'Machinery, Equipment & Implements (₹)' })}
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={equipmentCost === 0 ? '' : equipmentCost}
                    onChange={(e) => setEquipmentCost(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="Enter machinery cost (e.g. ₹3,50,000)"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-black text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                  <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">
                    {t('finance.machinery_cost_sub', { defaultValue: 'e.g. Milking machines, bulk milk cooler, silage shredder, pulse mill' })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('finance.shed_cost_label', { defaultValue: 'Shed Construction, Civil Work & Electrification (₹)' })}
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={shedSetupCost === 0 ? '' : shedSetupCost}
                    onChange={(e) => setShedSetupCost(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="Enter shed/civil work cost (e.g. ₹1,50,000)"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-black text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                  <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">
                    {t('finance.shed_cost_sub', { defaultValue: 'Cattle shed, boundary, solar water heating, 3-phase wiring' })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('finance.working_capital_label', { defaultValue: 'Initial Raw Material & Working Capital Buffer (₹)' })}
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={rawMaterialBuffer === 0 ? '' : rawMaterialBuffer}
                    onChange={(e) => setRawMaterialBuffer(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="Enter working capital buffer (e.g. ₹90,000)"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-black text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                  <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">
                    {t('finance.working_capital_sub', { defaultValue: 'First 30 days cattle feed, packaging bags, diesel/electricity deposit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-50/80 rounded-xl border border-stone-200 p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-stone-700 border-b border-stone-200 pb-2">
                  {t('finance.project_cost_summary', { defaultValue: 'Project Cost Summary' })}
                </h3>

                <div className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center">
                  <span className="text-xs text-stone-600 font-medium">{t('finance.total_project_outlay', { defaultValue: 'Total Capital Outlay' })}:</span>
                  <strong className="text-base font-black text-stone-900">{formatIndianCurrency(totalProjectCost)}</strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center">
                  <span className="text-xs text-stone-600 font-medium">{t('finance.promoter_equity', { pct: ownContributionPct, defaultValue: `Promoter Equity (${ownContributionPct}%):` })}</span>
                  <strong className="text-sm font-black text-emerald-700">{formatIndianCurrency(ownCapital)}</strong>
                </div>

                <div className="p-3.5 bg-[#0b2545] text-white rounded-xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                      {t('finance.estimated_bank_loan', { defaultValue: 'Estimated Bank Loan' })}
                    </span>
                    <span className="text-xs text-stone-300 font-medium">{t('finance.funding_gap_label', { defaultValue: 'Funding Gap' })}</span>
                  </div>
                  <strong className="text-lg font-black text-white">{formatIndianCurrency(results.fundingGap)}</strong>
                </div>
              </div>

              <StepActions
                onNext={() => handleStepChange(1)}
                nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
              />
            </div>
          </div>
        </Step>

        {/* STEP 2: OWN CONTRIBUTION & FUNDING GAP */}
        <Step
          index={1}
          icon={DollarSign}
          title={t('finance.step2_title', { defaultValue: 'Step 2: Own Contribution & Funding Gap' })}
          description={t('finance.step2_desc', { defaultValue: 'Promoter margin %, term loan borrowing requirement, and government capital subsidies.' })}
          badge={t('finance.equity_loan_badge', { defaultValue: 'Equity & Loan' })}
          completed={currentStepIndex > 1}
          summary={`Promoter Equity: ${formatIndianCurrency(ownCapital)} (${ownContributionPct}%) • Term Loan Gap: ${formatIndianCurrency(results.fundingGap)}.`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h2 className="text-xs font-black text-stone-900 uppercase tracking-wide">
                  {t('finance.promoter_equity_title', { defaultValue: 'Promoter Equity & Margin Outlay' })}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {t('finance.promoter_equity_desc', { defaultValue: 'Adjust promoter margin percentage to optimize debt-equity ratio for bank sanction.' })}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-700">
                      {t('finance.promoter_equity_slider', { pct: ownContributionPct, defaultValue: `Promoter Own Contribution (${ownContributionPct}%)` })}
                    </label>
                    <span className="text-xs font-black text-emerald-700">
                      {formatIndianCurrency(ownCapital)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={ownContributionPct}
                    onChange={(e) => setOwnContributionPct(Number(e.target.value))}
                    className="w-full accent-[#0b2545]"
                  />
                  <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">
                    {t('finance.subsidy_guideline_sub', { defaultValue: 'Typically 10-25% under CMEGP / PMEGP guidelines' })}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-600">{t('finance.total_project_outlay', { defaultValue: 'Total Project Outlay:' })}</span>
                    <strong className="text-stone-900 font-black">{formatIndianCurrency(totalProjectCost)}</strong>
                  </div>

                  <div className="flex justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-600">{t('finance.less_promoter_margin', { pct: ownContributionPct, defaultValue: `Less: Promoter Margin (${ownContributionPct}%):` })}</span>
                    <strong className="text-emerald-700 font-black">- {formatIndianCurrency(ownCapital)}</strong>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <strong className="block text-xs font-bold text-stone-600">{t('finance.net_term_loan', { defaultValue: 'Net Term Loan Required' })}</strong>
                      <span className="text-[10px] text-stone-400">{t('finance.bank_borrowing_limit', { defaultValue: 'Bank borrowing limit' })}</span>
                    </div>
                    <strong className="text-lg font-black text-stone-900">{formatIndianCurrency(results.fundingGap)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-end">
              <StepActions
                onBack={() => handleStepChange(0)}
                onNext={() => handleStepChange(2)}
                nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
              />
            </div>
          </div>
        </Step>

        {/* STEP 3: MONTHLY INCOME & EXPENSES */}
        <Step
          index={2}
          icon={TrendingUp}
          title={t('finance.step3_title', { defaultValue: 'Step 3: Monthly Income & Expenses' })}
          description={t('finance.step3_desc', { defaultValue: 'Expected gross revenues, recurring operational overheads, and 6-month cash flow trajectory.' })}
          badge={t('finance.cash_flow_badge', { defaultValue: 'Cash Flow' })}
          completed={currentStepIndex > 2}
          summary={`Monthly Sales: ${formatIndianCurrency(monthlyRevenue)} • Operating Costs: ${formatIndianCurrency(monthlyExpenses)} • Net Operating Margin: ${results.profitMarginPct}%.`}
        >
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h2 className="text-xs font-black text-stone-900 uppercase tracking-wide">
                    {t('finance.monthly_operating_title', { defaultValue: 'Monthly Operating Revenues & Costs' })}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    {t('finance.monthly_operating_desc', { defaultValue: 'Estimate expected monthly sales receipts against recurring overheads.' })}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('finance.monthly_gross_revenue_label', { defaultValue: 'Expected Monthly Gross Revenue (₹)' })}
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
                      placeholder={t('finance.revenue_placeholder', { defaultValue: 'e.g. 135000' })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-black text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('finance.monthly_operating_expenses_label', { defaultValue: 'Monthly Operating Expenses (₹)' })}
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value) || 0)}
                      placeholder={t('finance.expenses_placeholder', { defaultValue: 'e.g. 82000' })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-black text-stone-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                  <strong className="text-stone-900 block">{t('finance.expenses_included_title', { defaultValue: 'What is included in monthly expenses?' })}</strong>
                  <p>{t('finance.expenses_included_desc', { defaultValue: 'Raw materials, cattle feed, electricity, helper wages, packaging, and vehicle transport.' })}</p>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                {/* 1. BANKING CALCULATION (Deterministic, Authoritative) */}
                <div className="bg-stone-50 rounded-xl border border-stone-200 p-3.5 space-y-2.5">
                  <div className="border-b border-stone-200 pb-1.5">
                    <h3 className="text-xs font-black uppercase text-stone-800">
                      {t('finance.surplus_analysis_title', { defaultValue: 'Operating Surplus Analysis' })}
                    </h3>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-stone-200 flex justify-between items-center">
                    <span className="text-xs text-stone-600 font-medium">{t('finance.accounting_surplus_label', { defaultValue: 'Accounting Operating Surplus:' })}</span>
                    <strong className="text-sm font-black text-stone-900">{formatIndianCurrency(results.monthlyNetSurplus)} {t('finance.per_month', { defaultValue: '/ mo' })}</strong>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-500 block">{t('finance.net_profit_margin_label', { defaultValue: 'Net Profit Margin' })}</span>
                      <strong className="text-xs font-black text-[#0b2545]">{results.profitMarginPct}%</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-500 block">{t('finance.break_even_sales_label', { defaultValue: 'Break-Even Sales' })}</span>
                      <strong className="text-xs font-bold text-stone-800">{formatIndianCurrency(results.breakEvenMonthlyRevenue)} {t('finance.per_month', { defaultValue: '/ mo' })}</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {t('finance.deterministic_formula_desc', { defaultValue: 'Deterministic formula: Revenue minus Operating Debits. Primary benchmark for bank DSCR underwriting.' })}
                  </p>
                </div>
              </div>
            </div>

            {/* 6-Month Rolling Cash-Flow Projection (Collapsible) */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide">
                    {t('finance.cash_flow_proj_title', { defaultValue: '6-Month Cash Flow Projection' })}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {t('finance.cash_flow_proj_desc', { defaultValue: 'Demonstrates liquidity cushion and repayment capacity to bank appraisers.' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowCashFlow((prev) => !prev)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[#0b2545] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>
                      {showCashFlow 
                        ? t('finance.hide_projection', { defaultValue: 'Hide 6-Month Projection' }) 
                        : t('finance.view_projection', { defaultValue: 'View 6-Month Projection' })}
                    </span>
                    {showCashFlow ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {showCashFlow && (
                <div className="overflow-x-auto pt-1 animate-fadeIn">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">{t('finance.month_col', { defaultValue: 'Month' })}</th>
                        <th className="p-2.5">{t('finance.revenue_inflow_col', { defaultValue: 'Revenue Inflow' })}</th>
                        <th className="p-2.5">{t('finance.operating_outflow_col', { defaultValue: 'Operating Outflow' })}</th>
                        <th className="p-2.5">{t('finance.loan_emi_col', { defaultValue: 'Loan EMI' })}</th>
                        <th className="p-2.5">{t('finance.net_surplus_col', { defaultValue: 'Net Monthly Surplus' })}</th>
                        <th className="p-2.5">{t('finance.cumulative_buffer_col', { defaultValue: 'Cumulative Cash Buffer' })}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {[1, 2, 3, 4, 5, 6].map((m) => {
                        const inflow = monthlyRevenue;
                        const outflow = monthlyExpenses;
                        const emi = results.estimatedMonthlyEMI;
                        const surplus = inflow - outflow - emi;
                        const cumulative = cashInHand + (surplus * m);
                        return (
                          <tr key={m} className="hover:bg-stone-50/60">
                            <td className="p-2.5 font-bold">{t('finance.month_num', { m, defaultValue: `Month ${m}` })}</td>
                            <td className="p-2.5 text-stone-900">{formatIndianCurrency(inflow)}</td>
                            <td className="p-2.5 text-stone-600">{formatIndianCurrency(outflow)}</td>
                            <td className="p-2.5 text-[#0b2545] font-bold">{formatIndianCurrency(emi)}</td>
                            <td className="p-2.5 font-bold text-emerald-700">{formatIndianCurrency(surplus)}</td>
                            <td className="p-2.5 font-black text-stone-900">{formatIndianCurrency(cumulative)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <StepActions
              onBack={() => handleStepChange(1)}
              onNext={() => handleStepChange(3)}
              nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
            />
          </div>
        </Step>

        {/* STEP 4: PROFIT, EMI & DSCR */}
        <Step
          index={3}
          icon={Clock}
          title={t('finance.step4_title', { defaultValue: 'Step 4: Profit, EMI & DSCR' })}
          description={t('finance.step4_desc', { defaultValue: 'Deterministic monthly EMI, interest simulator, Debt Service Coverage Ratio (DSCR), and final summary.' })}
          badge={t('finance.repayment_dscr_badge', { defaultValue: 'Repayment & DSCR' })}
          completed={false}
          summary={`Monthly EMI: ${formatIndianCurrency(results.estimatedMonthlyEMI)} • DSCR: ${dscrRatio}x • Financial Health: ${results.healthScore}/100.`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h2 className="text-xs font-black text-stone-900 uppercase tracking-wide">
                  {t('finance.loan_tenure_sim_title', { defaultValue: 'Loan Tenure & Interest Simulator' })}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {t('finance.loan_tenure_sim_desc', { defaultValue: 'Simulate monthly installments based on bank interest and repayment tenure.' })}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('finance.annual_interest', { defaultValue: 'Annual Interest Rate (%)' })}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="25"
                      step="0.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="8.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('finance.tenure_years', { defaultValue: 'Repayment Tenure' })}
                  </label>
                  <select
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value={1}>1 Year (12 Months)</option>
                    <option value={2}>2 Years (24 Months)</option>
                    <option value={3}>3 Years (36 Months)</option>
                    <option value={5}>5 Years (60 Months)</option>
                    <option value={7}>7 Years (84 Months)</option>
                  </select>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <span className="text-stone-500 font-bold block uppercase text-[10px]">{t('finance.outflow_breakdown_title', { defaultValue: 'Total Outflow Breakdown:' })}</span>
                  <div className="flex justify-between">
                    <span>{t('finance.principal_borrowed_label', { defaultValue: 'Principal Borrowed:' })}</span>
                    <strong className="text-stone-900">{formatIndianCurrency(results.fundingGap)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('finance.total_interest_label', { years: tenureYears, defaultValue: `Total Interest Over ${tenureYears} Yrs:` })}</span>
                    <strong className="text-stone-900">{formatIndianCurrency(totalInterest)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-stone-700 border-b border-stone-200 pb-2">
                  {t('finance.monthly_repayment_obligation', { defaultValue: 'Monthly Repayment Obligation' })}
                </h3>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    {t('finance.monthly_emi_label', { defaultValue: 'Monthly Loan EMI' })}
                  </span>
                  <div className="text-2xl font-black text-stone-900">
                    {formatIndianCurrency(results.estimatedMonthlyEMI)}
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    {t('finance.emi_rate_sub', { rate: interestRate, years: tenureYears, defaultValue: `At ${interestRate}% over ${tenureYears} years` })}
                  </span>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-500 uppercase text-[10px]">
                    {t('finance.dscr_label', { defaultValue: 'DSCR Coverage Ratio' })}
                  </span>
                  <strong className="text-base font-black text-stone-900">{dscrRatio}x</strong>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-500 uppercase text-[10px]">
                    {t('finance.health_score_label', { defaultValue: 'Financial Health Score' })}
                  </span>
                  <strong className="text-xs font-black text-stone-900">
                    {results.healthScore}/100 ({results.healthStatus})
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <StepActions
                  onBack={() => handleStepChange(2)}
                  isLast={true}
                  nextLabel={t('finance.proceed_dpr', { defaultValue: 'Proceed to Loan Readiness & DPR' })}
                  onNext={() => onNavigate('/finance/loan-ready')}
                />
              </div>
            </div>
          </div>
        </Step>
      </Stepper>

    </div>
  );
}
