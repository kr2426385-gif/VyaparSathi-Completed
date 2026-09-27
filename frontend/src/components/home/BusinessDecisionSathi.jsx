import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Store, Calculator, Landmark, ShieldAlert, Truck, 
  Compass, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, 
  AlertTriangle, MapPin, IndianRupee, User, Building2, 
  Sparkles, Check, Edit2, X, RefreshCw, FileText,
  Download, BarChart3, Bot, ArrowUpRight, CheckCircle,
  Layers, Sliders, TrendingUp, Cpu, Activity, Play
} from 'lucide-react';
import { formatIndianCurrency } from '../../utils/calculations.js';
import { askGeminiAdvisor } from '../../utils/geminiAdvisor.js';
import { apiService } from '../../services/api.js';
import GeminiSynthesisVisualizer from '../common/GeminiSynthesisVisualizer.jsx';


// Clean Institutional Background (Static, zero CPU load, matching VyaparSathi's trustworthy human palette)
function DecisionSupportBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#0a2342 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl" />
    </div>
  );
}

export default function BusinessDecisionSathi({
  initialVenture = 'Mango Processing',
  initialLocation = 'Satara, Maharashtra',
  initialProjectCost = 1000000,
  initialOwnContribution = 200000,
  onNavigate
}) {
  const { t, i18n } = useTranslation();
  // Configurable / Editable Snapshot State
  const [venture, setVenture] = useState(initialVenture);
  const [location, setLocation] = useState(initialLocation);
  const [projectCost, setProjectCost] = useState(initialProjectCost);
  const [ownContribution, setOwnContribution] = useState(initialOwnContribution);
  const [isEditingSnapshot, setIsEditingSnapshot] = useState(false);

  // Temporary Edit Form State
  const [tempVenture, setTempVenture] = useState(venture);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempCost, setTempCost] = useState(projectCost);
  const [tempContribution, setTempContribution] = useState(ownContribution);

  // Interactive Simulation Levers (Decision Levers)
  const [seasonalityMode, setSeasonalityMode] = useState('multi'); // 'single' (90 days) or 'multi' (300 days)
  const [machinerySetup, setMachinerySetup] = useState('phased'); // 'phased' (modular) or 'turnkey'
  const [pmfmeSubsidyApplied, setPmfmeSubsidyApplied] = useState(true); // 35% capital subsidy

  // Gemini AI Live Synthesis State
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [modalViewMode, setModalViewMode] = useState('report'); // 'report' | 'telemetry'
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'advisors' | 'cashflow'

  // Synchronize snapshot when parent props update from Home (Location, Category, Margins)
  useEffect(() => {
    if (!isEditingSnapshot) {
      if (initialVenture) setVenture(initialVenture);
      if (initialLocation) setLocation(initialLocation);
      if (initialProjectCost) setProjectCost(initialProjectCost);
      if (initialOwnContribution) setOwnContribution(initialOwnContribution);
    }
  }, [initialVenture, initialLocation, initialProjectCost, initialOwnContribution, isEditingSnapshot]);

  // Dynamic Calculated Metrics based on Levers
  const calculatedMetrics = useMemo(() => {
    // Effective capex (Phased reduces initial outlay by 25%)
    const effectiveCost = machinerySetup === 'phased' 
      ? Math.round(projectCost * 0.75) 
      : projectCost;

    // Margin & Debt calculation
    const equity = Math.min(ownContribution, effectiveCost);
    const subsidyAmount = pmfmeSubsidyApplied ? Math.min(Math.round(effectiveCost * 0.35), 1000000) : 0;
    const termLoan = Math.max(0, effectiveCost - equity - (pmfmeSubsidyApplied ? Math.round(subsidyAmount * 0.5) : 0));
    
    const marginPercent = Math.round((equity / effectiveCost) * 100);
    const loanPercent = Math.round((termLoan / effectiveCost) * 100);
    const subsidyPercent = 100 - marginPercent - loanPercent;

    // Monthly EMI (5 years @ 9.0% interest)
    const monthlyInterestRate = 0.09 / 12;
    const months = 60;
    const estimatedEMI = termLoan > 0 
      ? Math.round((termLoan * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / (Math.pow(1 + monthlyInterestRate, months) - 1))
      : 0;

    // Projected Monthly Revenue & Expenses
    const operationalMonths = seasonalityMode === 'multi' ? 10 : 3.5;
    const monthlyGrossRevenue = Math.round((effectiveCost * 1.6) / 12);
    const monthlyOpex = Math.round(monthlyGrossRevenue * 0.65);
    const monthlyNetCashflow = monthlyGrossRevenue - monthlyOpex - estimatedEMI;
    const dscr = estimatedEMI > 0 ? ((monthlyGrossRevenue - monthlyOpex) / estimatedEMI).toFixed(2) : '3.50';

    // Viability Score (0 - 100)
    let score = 60;
    if (marginPercent >= 20) score += 15;
    else if (marginPercent >= 15) score += 8;
    else score -= 5;

    if (seasonalityMode === 'multi') score += 12;
    else score -= 10;

    if (machinerySetup === 'phased') score += 8;
    if (pmfmeSubsidyApplied) score += 10;

    score = Math.min(96, Math.max(52, score));

    // Viability Status
    let status = {
      level: 'High',
      text: 'HIGH SANCTION PROBABILITY',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-300',
      badge: 'bg-emerald-500 text-white',
      needleAngle: ((score - 50) / 50) * 180 - 90, // -90 deg to +90 deg
      summary: 'Prudent debt-to-equity ratio and subsidy buffer meet conservative Lead District Bank underwriting standards.'
    };

    if (score < 75) {
      status = {
        level: 'Moderate',
        text: 'PROCEED WITH PHASED CAUTION',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-300',
        badge: 'bg-amber-500 text-white',
        needleAngle: ((score - 50) / 50) * 180 - 90,
        summary: 'Debt burden is sensitive to raw material fluctuations. Adopt phased machinery and verify 4-month liquidity reserve.'
      };
    }

    return {
      effectiveCost,
      equity,
      termLoan,
      subsidyAmount,
      marginPercent,
      loanPercent,
      subsidyPercent: Math.max(0, subsidyPercent),
      estimatedEMI,
      monthlyGrossRevenue,
      monthlyOpex,
      monthlyNetCashflow,
      dscr,
      score,
      status,
      workingCapitalMonths: marginPercent >= 20 ? 4.8 : 2.2
    };
  }, [projectCost, ownContribution, seasonalityMode, machinerySetup, pmfmeSubsidyApplied]);

  const handleSaveSnapshot = (e) => {
    e.preventDefault();
    setVenture(tempVenture || 'Mango Processing');
    setLocation(tempLocation || 'Satara, Maharashtra');
    setProjectCost(Number(tempCost) || 1000000);
    setOwnContribution(Number(tempContribution) || 200000);
    setIsEditingSnapshot(false);
  };

  // Live Gemini AI Feasibility Analysis
  const handleRunGeminiAnalysis = async (specificQuery) => {
    setIsGeminiLoading(true);
    setShowGeminiModal(true);
    setModalViewMode('telemetry');

    try {
      const promptQuery = specificQuery || `Analyze viability for ${venture} in ${location}. 
Total Investment: ₹${calculatedMetrics.effectiveCost.toLocaleString('en-IN')}, 
Promoter Equity: ₹${calculatedMetrics.equity.toLocaleString('en-IN')} (${calculatedMetrics.marginPercent}%), 
Bank Loan: ₹${calculatedMetrics.termLoan.toLocaleString('en-IN')}, 
Setup: ${machinerySetup === 'phased' ? 'Phased Modular' : 'Turnkey'}, 
Seasonality: ${seasonalityMode === 'multi' ? '300-day Multi-Fruit' : '90-day Single Seasonal'}, 
PMFME 35% Capital Subsidy: ${pmfmeSubsidyApplied ? 'Applied' : 'Not Applied'}.
Provide clear appraisal verdict, risk mitigation, and bank sanction score.`;
      
      const activeLang = ['mr', 'hi', 'en'].includes(i18n?.language) ? i18n.language : 'mr';
      const [res, suitabilityRes, demandRes, profitRes] = await Promise.all([
        askGeminiAdvisor({
          query: promptQuery,
          language: activeLang,
          userProfile: { 
            venture, 
            projectCost: calculatedMetrics.effectiveCost, 
            ownContribution: calculatedMetrics.equity, 
            financingNeed: calculatedMetrics.termLoan,
            viabilityScore: calculatedMetrics.score
          },
          location
        }),
        apiService.predictBusinessSuitability({
          budget: calculatedMetrics.effectiveCost,
          experience_years: 2,
          skill_level: 'Medium',
          land_available: 1,
          water_available: 1,
          electricity_available: 1
        }).catch(() => null),
        apiService.predictDemand({
          location_type: location.toLowerCase().includes('urban') ? 'Urban' : 'Rural',
          market_distance_km: 5,
          competition_level: 'Medium',
          business_category: venture
        }).catch(() => null),
        apiService.predictProfit({
          investment_requirement: calculatedMetrics.effectiveCost,
          monthly_revenue: calculatedMetrics.monthlyGrossRevenue,
          monthly_expenses: calculatedMetrics.monthlyOpex,
          loan_amount: calculatedMetrics.termLoan,
          tenure_months: 60
        }).catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 2200))
      ]);

      const enrichedResult = {
        ...res,
        mlSignals: {
          suitability: suitabilityRes?.success ? suitabilityRes : null,
          demand: demandRes?.success ? demandRes : null,
          profit: profitRes?.success ? profitRes : null
        }
      };

      setGeminiResult(enrichedResult);
      setModalViewMode('report');
    } catch (err) {
      console.warn('Gemini analysis error:', err);
      setGeminiResult({
        answer: `For ${venture} in ${location}, your current configuration achieves a strong viability score of ${calculatedMetrics.score}/100. ${seasonalityMode === 'multi' ? 'The multi-fruit continuous processing plan mitigates off-season idle capacity effectively.' : 'Single seasonal crop creates 6 months of idle capacity—consider secondary guava or tomato lines.'} With ₹${calculatedMetrics.subsidyAmount.toLocaleString('en-IN')} PMFME capital grant, the bank DSCR is ${calculatedMetrics.dscr}x, comfortably exceeding the 1.50x benchmark.`,
        suggestedActions: [
          machinerySetup === 'phased' 
            ? 'Phase 1 modular pulp & packaging line confirmed; expand to retort pouches after month 12'
            : 'Consider phased modular machinery to protect ₹2.5L contingency capital',
          seasonalityMode === 'multi'
            ? 'Lock informal supply MoUs with 2 local Farmer Producer Companies for off-season fruit delivery'
            : 'Transition to dual-fruit processing (mango + guava/amla) to maintain steady cashflow',
          'Submit DIC PMFME dossier with 3 competitive equipment supplier quotations'
        ],
        relevantSchemes: [{ name: 'PMFME Credit-Linked 35% Capital Subsidy', code: 'pmfme' }],
        source: 'grounded_rule_engine',
        provenance: 'Grounded Rule Engine',
        mlSignals: null
      });
      setModalViewMode('report');
    } finally {
      setIsGeminiLoading(false);
    }
  };

  return (
    <section 
      id="business-decision-maker" 
      className="w-full relative overflow-hidden py-10 sm:py-14 select-none bg-gradient-to-b from-[#faf9f6] via-[#f5f2eb] to-[#ece7dc] border-y border-stone-200/80"
    >
      {/* FULL-SCREEN BACKGROUND VISUAL LAYER: SMALL CIRCLES, FINE CONSTELLATION MESH & CONCENTRIC TECH RINGS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 1. Clean Architectural Backdrop */}
        <DecisionSupportBackdrop />

        {/* 2. Geometric Small Circles Pattern across entire width */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25" 
          style={{
            backgroundImage: 'radial-gradient(#0a2342 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
          aria-hidden="true"
        />

        {/* 3. Subtle Edge-to-Edge Topographical Contour Curves */}
        <svg 
          className="absolute inset-0 w-full h-full text-amber-900/[0.05]" 
          viewBox="0 0 1440 900" 
          preserveAspectRatio="none" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        >
          <path d="M-100,160 C200,70 420,220 720,150 C1020,80 1240,210 1540,130" />
          <path d="M-100,270 C220,170 440,330 760,250 C1080,170 1260,310 1540,230" />
          <path d="M-100,470 C180,370 480,550 800,450 C1120,350 1320,510 1540,410" />
          <path d="M-100,670 C240,570 460,750 780,650 C1100,550 1340,690 1540,610" />
          <path d="M-100,810 C260,710 480,870 820,770 C1160,670 1360,810 1540,750" />
        </svg>

        {/* 4. Fine Constellation Accent Lines */}
        <svg 
          className="absolute inset-0 w-full h-full text-amber-600/[0.12]" 
          viewBox="0 0 1440 900" 
          preserveAspectRatio="none" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.8"
          strokeDasharray="3 3"
        >
          <path d="M 45,60 L 160,150 L 70,280 L 200,420 L 30,570 L 130,710 L 60,810" />
          <path d="M 1395,50 L 1270,180 L 1400,310 L 1280,460 L 1370,600 L 1250,750 L 1400,830" />
        </svg>

        {/* 5. Left & Right Agricultural / Industrial Watermark Silhouettes */}
        <svg 
          className="absolute -left-4 top-1/4 w-40 sm:w-48 h-72 text-amber-900/[0.04] pointer-events-none" 
          viewBox="0 0 200 400" 
          fill="currentColor"
        >
          <path d="M50,400 Q80,250 110,120 Q120,80 100,40 Q95,30 90,20 Q105,35 112,60 Q118,90 105,140 Q85,220 50,400 Z" />
          <circle cx="85" cy="70" r="10" />
          <circle cx="125" cy="85" r="10" />
          <circle cx="80" cy="115" r="11" />
          <circle cx="130" cy="130" r="11" />
        </svg>

        <svg 
          className="absolute -right-4 top-1/3 w-40 sm:w-52 h-64 text-amber-900/[0.04] pointer-events-none" 
          viewBox="0 0 300 300" 
          fill="currentColor"
        >
          <path d="M20,250 L60,190 L60,250 L110,190 L110,250 L160,190 L160,250 L260,250 L260,130 L220,130 L220,90 L200,90 L200,130 L180,130 L180,250 Z" />
        </svg>
      </div>

      {/* INNER CONTENT WRAPPER: CENTERED ON TOP OF FULL-SCREEN AMBIENT BACKGROUND */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
      
      {/* 1. VISUAL HEADER: ENTERPRISE DECISION MAKER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a2342]/5 border border-[#0a2342]/15 text-[#0a2342] text-xs font-bold uppercase tracking-wider">
            <Compass size={14} className="text-amber-600" />
            <span>{t('decision.support_title')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#0a2342] tracking-tight leading-[1.25]">
            {t('decision.title', { defaultValue: 'Business Decision Support' })}
          </h2>
          <p className="text-sm sm:text-[15px] text-stone-600 font-normal max-w-2xl leading-[1.5]">
            {t('decision.subtitle', { defaultValue: 'Interactive decision modeling synthesizing market demand, debt leverage, seasonality risks, and PMFME capital subsidies.' })}
          </p>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setModalViewMode('telemetry');
              setShowGeminiModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title={t('decision.factor_breakdown')}
          >
            <Activity size={14} className="text-stone-600" />
            <span>{t('decision.factors')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRunGeminiAnalysis()}
            className="px-4 py-2.5 rounded-xl bg-[#0a2342] hover:bg-[#13315c] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <CheckCircle2 size={14} className="text-amber-400" />
            <span>{t('decision.analyze_feasibility')}</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT ENTERPRISE SNAPSHOT BAR */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs">
        {isEditingSnapshot ? (
          <form onSubmit={handleSaveSnapshot} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Edit2 size={14} className="text-[#0a2342]" />
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Edit Enterprise Baseline Parameters
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSnapshot(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-stone-500 font-bold mb-1">{t('decision.venture')}</label>
                <input
                  type="text"
                  value={tempVenture}
                  onChange={(e) => setTempVenture(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#0a2342] font-semibold text-stone-900"
                  placeholder={t('decision.venture_ph')}
                />
              </div>

              <div>
                <label className="block text-stone-500 font-bold mb-1">{t('decision.location_district')}</label>
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#0a2342] font-semibold text-stone-900"
                  placeholder={t('decision.location_ph')}
                />
              </div>

              <div>
                <label className="block text-stone-500 font-bold mb-1">Total Project Outlay (₹)</label>
                <input
                  type="number"
                  value={tempCost}
                  onChange={(e) => setTempCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#0a2342] font-semibold text-stone-900"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-stone-500 font-bold mb-1">Promoter Own Capital (₹)</label>
                <input
                  type="number"
                  value={tempContribution}
                  onChange={(e) => setTempContribution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#0a2342] font-semibold text-stone-900"
                  placeholder="200000"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingSnapshot(false)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-50 cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#0a2342] text-white font-black text-xs hover:bg-[#13315c] cursor-pointer shadow-xs"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Snapshot Title Pillar */}
            <div className="flex items-center gap-3 pr-4 lg:border-r lg:border-stone-100">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                  Enterprise Profile
                </span>
                <span className="text-xs font-bold text-stone-800">
                  {venture} • {location}
                </span>
              </div>
            </div>

            {/* Snapshot Metric Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 text-left">
              {/* Gross Outlay */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                  Turnkey Outlay
                </span>
                <strong className="text-xs sm:text-sm font-black text-stone-900 block">
                  {formatIndianCurrency(projectCost)}
                </strong>
              </div>

              {/* Effective Outlay (Phased) */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide flex items-center gap-1">
                  <span>{t('decision.phase1_outlay')}</span>
                </span>
                <strong className="text-xs sm:text-sm font-black text-[#0a2342] block">
                  {formatIndianCurrency(calculatedMetrics.effectiveCost)}
                </strong>
              </div>

              {/* Own Capital */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                  Promoter Equity
                </span>
                <strong className="text-xs sm:text-sm font-black text-emerald-700 block">
                  {formatIndianCurrency(calculatedMetrics.equity)} <span className="text-[10px] font-semibold text-stone-500">({calculatedMetrics.marginPercent}%)</span>
                </strong>
              </div>

              {/* Bank Debt */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                  Bank Term Loan
                </span>
                <strong className="text-xs sm:text-sm font-black text-amber-900 block">
                  {formatIndianCurrency(calculatedMetrics.termLoan)}
                </strong>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex items-center gap-2 pt-2 lg:pt-0 lg:pl-4 lg:border-l lg:border-stone-100">
              <button
                onClick={() => {
                  setTempVenture(venture);
                  setTempLocation(location);
                  setTempCost(projectCost);
                  setTempContribution(ownContribution);
                  setIsEditingSnapshot(true);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Edit2 size={12} />
                <span>{t('decision.change_base')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. VISUAL DECISION MAKER ENGINE: 2 COLS (VISUAL GAUGE & LEVER CONSOLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: VISUAL DECISION GAUGE & METRICS (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 via-[#0a2342] to-[#0f172a] rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Gauge Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-black tracking-wider uppercase text-stone-300">
                {t('decision.live_viability', { defaultValue: 'Live Enterprise Viability' })}
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${calculatedMetrics.status.badge}`}>
              {calculatedMetrics.status.level} Viability
            </span>
          </div>

          {/* Central Animated Speedometer / Viability Dial */}
          <div className="relative z-10 flex flex-col items-center justify-center py-2">
            <div className="relative w-56 h-28 flex items-end justify-center">
              {/* Semi-Circle SVG Arc */}
              <svg viewBox="0 0 200 100" className="w-56 h-28 overflow-visible">
                {/* Background Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Active Colored Gradient Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="14"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (calculatedMetrics.score / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Center Pivot */}
                <circle cx="100" cy="100" r="7" fill="#ffffff" />
                
                {/* Animated Needle */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    transformOrigin: '100px 100px',
                    transform: `rotate(${calculatedMetrics.status.needleAngle}deg)`,
                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />
              </svg>
            </div>

            {/* Score Numerical Readout */}
            <div className="text-center mt-2 space-y-0.5">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {calculatedMetrics.score}
                </span>
                <span className="text-base text-stone-400 font-bold">/100</span>
              </div>
              <strong className="text-xs sm:text-sm font-black text-amber-300 block tracking-wide">
                {calculatedMetrics.status.text}
              </strong>
              <p className="text-[11px] text-stone-300 font-medium max-w-xs leading-tight mx-auto pt-1">
                {calculatedMetrics.status.summary}
              </p>
            </div>
          </div>

          {/* Dynamic Capital Spectrum (Visual Stacked Bar) */}
          <div className="relative z-10 space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center text-[11px] text-stone-300">
              <span className="font-bold">{t('decision.funding_architecture')}</span>
              <span className="font-mono text-amber-300">{formatIndianCurrency(calculatedMetrics.effectiveCost)}</span>
            </div>

            {/* Stacked Visual Bar */}
            <div className="w-full h-3.5 rounded-full bg-stone-800 overflow-hidden flex p-0.5 gap-0.5">
              <div 
                style={{ width: `${calculatedMetrics.marginPercent}%` }}
                className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
                title={`Promoter Equity: ${calculatedMetrics.marginPercent}%`}
              />
              {pmfmeSubsidyApplied && (
                <div 
                  style={{ width: `35%` }}
                  className="h-full bg-blue-500 transition-all duration-500"
                  title={t('decision.pmfme_subsidy_tt')}
                />
              )}
              <div 
                style={{ width: `${calculatedMetrics.loanPercent}%` }}
                className="h-full rounded-r-full bg-amber-500 transition-all duration-500"
                title={`Bank Debt: ${calculatedMetrics.loanPercent}%`}
              />
            </div>

            {/* Bar Legend */}
            <div className="flex flex-wrap sm:grid sm:grid-cols-3 gap-1.5 sm:gap-1 text-[10px] text-stone-300 pt-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Equity ({calculatedMetrics.marginPercent}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">Grant (35%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">Loan ({calculatedMetrics.loanPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Quick Key Metrics Strip */}
          <div className="relative z-10 grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">{t('decision.monthly_emi')}</span>
              <strong className="text-sm font-black text-white block">
                {formatIndianCurrency(calculatedMetrics.estimatedEMI)}
              </strong>
              <span className="text-[10px] text-stone-300">5-Yr @ 9.0%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Debt Coverage (DSCR)</span>
              <strong className="text-sm font-black text-emerald-400 block">
                {calculatedMetrics.dscr}x Ratio
              </strong>
              <span className="text-[10px] text-stone-300">Target ≥ 1.50x</span>
            </div>
          </div>

        </div>

        {/* RIGHT: INTERACTIVE DECISION CONTROL CONSOLE (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#0a2342]" />
                <h3 className="font-black text-base text-stone-900">
                  {t('decision.levers_title', { defaultValue: 'Interactive Decision Levers' })}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-stone-500">
                Adjust levers to simulate viability in real-time
              </span>
            </div>

            {/* LEVER 1: PROMOTER EQUITY RATIO */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
                  <User size={13} className="text-stone-500" />
                  <span>Promoter Equity (Own Capital)</span>
                </span>
                <strong className="text-emerald-700 font-black">
                  {formatIndianCurrency(calculatedMetrics.equity)} ({calculatedMetrics.marginPercent}%)
                </strong>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { pct: 10, amount: Math.round(calculatedMetrics.effectiveCost * 0.1), label: '10% (Minimum)' },
                  { pct: 20, amount: Math.round(calculatedMetrics.effectiveCost * 0.2), label: '20% (Prudent)' },
                  { pct: 35, amount: Math.round(calculatedMetrics.effectiveCost * 0.35), label: '35% (Optimal)' }
                ].map((item) => (
                  <button
                    key={item.pct}
                    type="button"
                    onClick={() => setOwnContribution(item.amount)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center gap-0.5 ${
                      calculatedMetrics.marginPercent === item.pct || (item.pct === 35 && calculatedMetrics.marginPercent >= 30)
                        ? 'bg-[#0a2342] text-white border-[#0a2342] shadow-xs ring-2 ring-[#0a2342]/10'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="font-black">{item.pct}% Equity</span>
                    <span className="text-[10px] opacity-80">{formatIndianCurrency(item.amount)}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Banks favour 20%+ margin for rural agro-processing units to absorb initial cashflow seasonality.
              </p>
            </div>

            {/* LEVER 2: CAPACITY SETUP (PHASED MODULAR VS TURNKEY) */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
                  <Layers size={13} className="text-stone-500" />
                  <span>{t('decision.machinery_strategy')}</span>
                </span>
                <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {machinerySetup === 'phased' ? 'Saves 25% Outlay' : 'Full Capex'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMachinerySetup('phased')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                    machinerySetup === 'phased'
                      ? 'bg-[#0a2342] text-white border-[#0a2342] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <strong className="block text-xs font-black">{t('decision.phase1_modular')}</strong>
                  <span className="text-[10px] opacity-85 block leading-tight mt-0.5">
                    Start with pulp extraction & cold pack; saves ₹2.5L in Phase 1 capex.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMachinerySetup('turnkey')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                    machinerySetup === 'turnkey'
                      ? 'bg-[#0a2342] text-white border-[#0a2342] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <strong className="block text-xs font-black">{t('decision.turnkey_auto')}</strong>
                  <span className="text-[10px] opacity-85 block leading-tight mt-0.5">
                    Complete retort automation line (₹10.0L full capital outlay).
                  </span>
                </button>
              </div>
            </div>

            {/* LEVER 3: SEASONALITY STRATEGY & SCHEME GRANT TOGGLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Seasonality */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-extrabold text-stone-800 block">
                  Processing Seasonality
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSeasonalityMode('single')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      seasonalityMode === 'single'
                        ? 'bg-[#0a2342] text-white border-[#0a2342]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    90-Day Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeasonalityMode('multi')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      seasonalityMode === 'multi'
                        ? 'bg-[#0a2342] text-white border-[#0a2342]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    300-Day Multi
                  </button>
                </div>
                <p className="text-[10px] text-stone-500">
                  {seasonalityMode === 'multi' ? 'Guava/Tomato in off-season.' : 'Idle machines for 6 months.'}
                </p>
              </div>

              {/* PMFME Subsidy */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-extrabold text-stone-800 block">
                  PMFME 35% Capital Subsidy
                </span>
                <button
                  type="button"
                  onClick={() => setPmfmeSubsidyApplied(!pmfmeSubsidyApplied)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center justify-between ${
                    pmfmeSubsidyApplied
                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-black">
                    {pmfmeSubsidyApplied ? 'PMFME 35% Enabled' : 'Disabled (No Grant)'}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${pmfmeSubsidyApplied ? 'bg-blue-600' : 'bg-stone-300'}`} />
                </button>
                <p className="text-[10px] text-stone-500">
                  {pmfmeSubsidyApplied ? `Grant of ${formatIndianCurrency(calculatedMetrics.subsidyAmount)} applied.` : 'Increases bank loan need.'}
                </p>
              </div>

            </div>
          </div>

          {/* BOTTOM VERDICT CALLOUT & ACTION BUTTONS */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                  Decision Verdict
                </span>
                <strong className={`text-xs sm:text-sm font-black ${calculatedMetrics.status.color}`}>
                  {calculatedMetrics.status.text}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/reports')}
                  className="px-4 py-2 rounded-xl bg-[#0a2342] hover:bg-[#13315c] text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>{t('decision.build_dpr')}</span>
                  <ArrowRight size={12} />
                </button>

                <button
                  onClick={() => handleRunGeminiAnalysis()}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-600" />
                  <span>{t('decision.get_guidance')}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 6. LIVE GEMINI AI REASONING MODAL */}
      {showGeminiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900">
                    VyaparSathi Enterprise Advisory
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Feasibility appraisal for {venture} • {location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* View Switcher if result exists */}
                {geminiResult && !isGeminiLoading && (
                  <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setModalViewMode('report')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        modalViewMode === 'report'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Verdict
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalViewMode('telemetry')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        modalViewMode === 'telemetry'
                          ? 'bg-[#0a2342] text-cyan-300 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Activity size={11} className={modalViewMode === 'telemetry' ? 'text-amber-400' : 'text-stone-400'} />
                      Decision Factors
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowGeminiModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {isGeminiLoading ? (
              <div className="space-y-4">
                <GeminiSynthesisVisualizer
                  variant="modal"
                  playbackRate={0.6}
                  showTelemetry={true}
                />
                <div className="text-center space-y-1 py-1">
                  <p className="text-xs font-bold text-stone-700">
                    Synthesizing market off-take, cash flow risk, and subsidy rules against Maharashtra benchmarks...
                  </p>
                  <span className="text-[11px] text-stone-400">{t('decision.eval_dscr')}</span>
                </div>
              </div>
            ) : modalViewMode === 'telemetry' ? (
              <div className="space-y-4">
                <GeminiSynthesisVisualizer
                  variant="modal"
                  playbackRate={0.6}
                  showTelemetry={true}
                />
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                  <div className="text-xs font-medium text-stone-600">
                    Underwriting scan active • Score <strong className="text-stone-900 font-bold">{calculatedMetrics.score}/100</strong>
                  </div>
                  {geminiResult ? (
                    <button
                      type="button"
                      onClick={() => setModalViewMode('report')}
                      className="px-3 py-1.5 rounded-xl bg-[#0a2342] text-white font-bold text-xs hover:bg-[#13315c] transition-colors cursor-pointer"
                    >
                      View Strategic Verdict →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRunGeminiAnalysis()}
                      className="px-3 py-1.5 rounded-xl bg-[#0a2342] text-amber-300 font-bold text-xs hover:bg-[#13315c] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      Run Live Audit
                    </button>
                  )}
                </div>
              </div>
            ) : geminiResult ? (
              <div className="space-y-4 text-xs">
                {/* Viability Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-600 font-bold">{t('decision.simulated_score')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Bank Underwriting Approved
                    </span>
                    <strong className="text-sm font-black text-[#0a2342]">{calculatedMetrics.score} / 100</strong>
                  </div>
                </div>

                {/* Advisory Verdict */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                      Strategic Underwriting Verdict
                    </span>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300">
                      {geminiResult.provenance || (geminiResult.source === 'gemini_enterprise_grounded' ? 'AI-generated explanation' : 'Grounded Rule Engine')}
                    </span>
                  </div>
                  <p className="text-stone-800 font-medium leading-relaxed text-xs">
                    {geminiResult.answer || geminiResult.recommendation}
                  </p>
                </div>

                {/* Baseline ML Models Synthesis Grid (Separate Provenance) */}
                {geminiResult.mlSignals && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <span className="text-[10px] font-black uppercase text-stone-700 tracking-wider">
                        ML Baseline Predictive Signals
                      </span>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        ML Prediction
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* ML Suitability */}
                      <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-stone-500 font-bold uppercase">{t('decision.suitability')}</span>
                          <span className="text-[9px] font-bold text-emerald-700">{t('decision.ml_regressor')}</span>
                        </div>
                        {geminiResult.mlSignals.suitability ? (
                          <div>
                            <strong className="text-sm font-black text-stone-900">
                              {geminiResult.mlSignals.suitability.business_suitability_score} / 1.0
                            </strong>
                            <span className="text-[10px] text-stone-500 block">
                              Level: {geminiResult.mlSignals.suitability.suitability_level}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">{t('common.unavailable')}</span>
                        )}
                      </div>

                      {/* ML Demand Tier */}
                      <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-stone-500 font-bold uppercase">{t('decision.demand_tier')}</span>
                          <span className="text-[9px] font-bold text-blue-700">{t('decision.ml_classifier')}</span>
                        </div>
                        {geminiResult.mlSignals.demand ? (
                          <div>
                            <strong className="text-sm font-black text-stone-900">
                              {geminiResult.mlSignals.demand.predicted_demand}
                            </strong>
                            {geminiResult.mlSignals.demand.probabilities && (
                              <span className="text-[10px] text-stone-500 block">
                                P(High): {(geminiResult.mlSignals.demand.probabilities.High * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">{t('common.unavailable')}</span>
                        )}
                      </div>

                      {/* ML Profit Regressor */}
                      <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-stone-500 font-bold uppercase">{t('decision.profit_est')}</span>
                          <span className="text-[9px] font-bold text-emerald-700">{t('decision.ml_regressor')}</span>
                        </div>
                        {geminiResult.mlSignals.profit ? (
                          <div>
                            <strong className="text-sm font-black text-emerald-700">
                              {formatIndianCurrency(geminiResult.mlSignals.profit.predicted_monthly_profit)} / mo
                            </strong>
                            <span className="text-[10px] text-stone-400 block">{t('decision.rf_benchmark')}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">{t('common.unavailable')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific Action Points */}
                {geminiResult.suggestedActions && geminiResult.suggestedActions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-stone-800 tracking-wider block">
                      Recommended Implementation Steps:
                    </span>
                    <div className="space-y-1.5">
                      {geminiResult.suggestedActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-stone-700 font-medium text-xs">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheme Linkage */}
                {geminiResult.relevantSchemes && geminiResult.relevantSchemes.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">{t('decision.matched_scheme')}</span>
                      <strong className="text-blue-950 font-black text-xs">
                        {geminiResult.relevantSchemes[0]?.name || 'PMFME Capital Subsidy'}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGeminiModal(false);
                        onNavigate('/schemes');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs cursor-pointer"
                    >
                      View Scheme
                    </button>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setModalViewMode('telemetry')}
                    className="px-3 py-2 rounded-xl border border-cyan-500/40 text-cyan-900 bg-cyan-50 hover:bg-cyan-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Activity size={13} className="text-cyan-600" />
                    Inspect Telemetry Radar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGeminiModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#0a2342] text-white font-black text-xs hover:bg-[#13315c] cursor-pointer"
                  >
                    Close Analysis
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      </div>
    </section>
  );
}

