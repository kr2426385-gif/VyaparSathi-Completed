import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Zap, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ExternalLink,
  HelpCircle,
  Landmark,
  FileSpreadsheet
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { formatIndianCurrency } from '../../utils/calculations.js';

export default function EquipmentPlanResult() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [planData, setPlanData] = useState(null);
  const [tcoData, setTcoData] = useState(null);
  const [roiData, setRoiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals and UI toggles
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [activeTab, setActiveTab] = useState('essential'); // 'essential' | 'recommended' | 'upgrade'

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      setError('');
      try {
        const storedInputs = sessionStorage.getItem('vyapar_equipment_plan_inputs');
        const inputs = storedInputs ? JSON.parse(storedInputs) : {
          businessType: 'Dairy & Cattle',
          location: 'Satara (Rural)',
          budget: 150000,
          productionRequirement: 'Small',
          equipmentPreference: 'any',
          electricityAvailability: 'single_phase'
        };

        const plan = await apiService.getEquipmentPlan(inputs);
        setPlanData(plan);

        // Calculate deterministic TCO & ROI for essential machinery
        const essentialCost = plan.investmentSummary?.estimatedEssentialEquipmentCost || 100000;
        const [tcoRes, roiRes] = await Promise.all([
          apiService.calculateTCO({
            equipmentCost: essentialCost,
            dailyOperatingHours: 6,
            powerKw: 2.2,
            unitPowerRate: 8.5,
            lifespanYears: 5
          }),
          apiService.calculateROI({
            totalInvestment: essentialCost,
            expectedMonthlyRevenueIncrease: Math.round(essentialCost * 0.22),
            monthlyOperatingCost: Math.round(essentialCost * 0.05)
          })
        ]);

        setTcoData(tcoRes);
        setRoiData(roiRes);
      } catch (err) {
        console.error('Failed to load equipment plan:', err);
        setError(err.message || 'Failed to generate plan. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b2545] mx-auto"></div>
        <h3 className="text-sm font-black text-stone-900">Structuring your Equipment & Investment Plan...</h3>
        <p className="text-xs text-stone-500 font-medium">{t('equipment.computing_tco', { defaultValue: 'Computing deterministic TCO, budget allocation, and KVK benchmarks.' })}</p>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <AlertTriangle size={32} className="mx-auto text-rose-600" />
        <h3 className="text-base font-black text-stone-900">{t('equipment.unable_plan', { defaultValue: 'Unable to generate equipment plan' })}</h3>
        <p className="text-xs text-stone-600">{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => navigate('/equipment-advisor/plan')}
          className="px-5 py-2.5 rounded-xl bg-[#0b2545] text-white text-xs font-bold min-h-[44px]"
        >
          Return to Form
        </button>
      </div>
    );
  }

  const { sections, investmentSummary, planMetadata } = planData;
  const budgetAllocation = investmentSummary?.budgetAllocation;
  const fundingGapAnalysis = investmentSummary?.fundingGapAnalysis;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 select-none">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/equipment-advisor/plan')}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#0b2545] transition-colors min-h-[44px]"
        >
          <ArrowLeft size={16} />
          <span>{t('equipment.edit_plan_inputs', { defaultValue: 'Edit Plan Inputs' })}</span>
        </button>
        <button
          onClick={() => navigate('/equipment-advisor/quotations')}
          className="px-3.5 py-1.5 rounded-xl border border-stone-300 hover:border-[#0b2545] text-[#0b2545] text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
        >
          <FileSpreadsheet size={14} />
          <span>{t('equipment.compare_quotations', { defaultValue: 'Compare Quotations' })}</span>
        </button>
      </div>

      {/* Plan Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#0b2545] tracking-wider">{t('equipment.verified_plan', { defaultValue: 'Verified Recommendation Plan' })}</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
              {t('equipment.your_equipment_plan', { defaultValue: 'Your Equipment Plan' })} • {planMetadata?.businessType}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-stone-400 block">{t('equipment.available_capital', { defaultValue: 'Available Capital' })}</span>
            <span className="text-lg font-black text-stone-900">{formatIndianCurrency(planMetadata?.availableBudget || 0)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium text-stone-600 pt-1">
          <span className="bg-stone-100 px-2.5 py-1 rounded-md text-[11px] font-bold text-stone-800">
            📍 {planMetadata?.location}
          </span>
          <span className="bg-stone-100 px-2.5 py-1 rounded-md text-[11px] font-bold text-stone-800">
            ⚡ {planMetadata?.electricityAvailability === 'three_phase' ? 'Three Phase (415V)' : 'Single Phase (230V)'}
          </span>
          <span className="bg-stone-100 px-2.5 py-1 rounded-md text-[11px] font-bold text-stone-800">
            ⚙️ {planMetadata?.productionRequirement}
          </span>
        </div>
      </div>

      {/* 1. FUNDING GAP NOTICE (If Capital Shortfall Exists) */}
      {fundingGapAnalysis && fundingGapAnalysis.hasGap && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-amber-950">
                Funding Gap Detected: Additional Capital Required
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Your estimated essential machinery requirement exceeds your available budget. You can bridge this shortfall through verified Maharashtra credit subsidies without turning to informal moneylenders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-stone-500 block uppercase">{t('equipment.equipment_investment', { defaultValue: 'Equipment Investment' })}</span>
              <strong className="text-base font-black text-stone-900">
                {formatIndianCurrency(fundingGapAnalysis.equipmentInvestment)}
              </strong>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-stone-500 block uppercase">{t('equipment.available_budget', { defaultValue: 'Available Budget' })}</span>
              <strong className="text-base font-black text-emerald-800">
                {formatIndianCurrency(fundingGapAnalysis.availableBudget)}
              </strong>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-300">
              <span className="text-[10px] font-black text-amber-900 block uppercase">Funding Gap (Deficit)</span>
              <strong className="text-base font-black text-rose-700">
                {formatIndianCurrency(fundingGapAnalysis.fundingGap)}
              </strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-amber-900">
              Eligible schemes: CMEGP (up to 35% subsidy), PMFME, MUDRA Kishore.
            </span>
            <button
              onClick={() => navigate('/schemes')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all min-h-[44px]"
            >
              <Landmark size={14} className="text-amber-300" />
              <span>{t('equipment.find_loan_scheme', { defaultValue: 'Find Loan / Scheme' })}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. EQUIPMENT CATALOG CARDS TABS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('essential')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all min-h-[44px] ${
                activeTab === 'essential'
                  ? 'bg-[#0b2545] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Essential ({sections.essentialEquipment?.count || 0})
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all min-h-[44px] ${
                activeTab === 'recommended'
                  ? 'bg-[#0b2545] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Recommended ({sections.recommendedEquipment?.count || 0})
            </button>
            <button
              onClick={() => setActiveTab('upgrade')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all min-h-[44px] ${
                activeTab === 'upgrade'
                  ? 'bg-[#0b2545] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Future Upgrade ({sections.futureUpgrade?.count || 0})
            </button>
          </div>
        </div>

        {/* Equipment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const currentSection = activeTab === 'essential' 
              ? sections.essentialEquipment 
              : (activeTab === 'recommended' ? sections.recommendedEquipment : sections.futureUpgrade);
            
            if (!currentSection?.items || currentSection.items.length === 0) {
              return (
                <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
                  No machinery currently categorized under this tier for {planMetadata?.businessType}.
                </div>
              );
            }

            return currentSection.items.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0b2545] border border-blue-200">
                      {card.category}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      {card.dataSourceLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-stone-900 leading-snug">
                      {card.name}
                    </h3>
                    {card.nameMr && (
                      <span className="text-[11px] text-stone-500 block">{card.nameMr}</span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    {card.purpose}
                  </p>

                  {/* Pricing / Verification Label */}
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-bold">Estimated Cost:</span>
                    <strong className={`font-black ${card.priceAvailable ? 'text-stone-900' : 'text-stone-400 italic'}`}>
                      {card.priceDisplay}
                    </strong>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-1 text-[11px] text-stone-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Zap size={13} className="text-amber-500 shrink-0" />
                      <span><strong>Power:</strong> {card.powerRequirement?.phase} ({card.powerRequirement?.hp || card.powerRequirement?.kw || 'Standard'} HP/kW)</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Building2 size={13} className="text-stone-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1"><strong>Installation:</strong> {card.installationRequirement}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-400">
                    {card.capacity?.amount ? `Capacity: ${card.capacity.amount} ${card.capacity.unit}` : 'Standard Capacity'}
                  </span>
                  <button
                    onClick={() => setSelectedItem(card)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold min-h-[44px]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 3. SMART BUDGET SCREEN */}
      {budgetAllocation && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-[10px] font-black uppercase text-[#0b2545] tracking-wider">{t('equipment.financial_engine', { defaultValue: 'Financial Engine' })}</span>
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                {t('equipment.investment_plan_title', { defaultValue: 'Your Investment Plan & Budget Allocation' })}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {t('equipment.investment_plan_desc', { defaultValue: 'Deterministic mathematical breakdown of your capital across machinery and working capital.' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('equipment.total_budget', { defaultValue: 'Total Budget' })}</span>
              <strong className="text-base font-black text-[#0b2545]">
                {formatIndianCurrency(budgetAllocation.totalBudget)}
              </strong>
            </div>
          </div>

          <div className="space-y-3">
            {budgetAllocation.breakdown.map((item) => (
              <div key={item.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-stone-800">{item.label}</span>
                  <div className="space-x-2">
                    <span className="text-stone-400 text-[11px]">{item.percentage}%</span>
                    <span className="text-stone-900 font-black">{formatIndianCurrency(item.amount)}</span>
                  </div>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0b2545] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-stone-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FINANCIAL VIABILITY SCREEN */}
      {tcoData && roiData && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <span className="text-[10px] font-black uppercase text-[#0b2545] tracking-wider">{t('equipment.viability_engine', { defaultValue: 'Viability Engine' })}</span>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              Is This Investment Viable?
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Multi-year operating viability, expected payback, and Total Cost of Ownership.
            </p>
          </div>

          {/* Three Primary Cards: TCO, ROI, Payback */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wide">
                Total Cost of Ownership (5-Yr)
              </span>
              <div className="text-xl font-black text-[#0b2545]">
                {formatIndianCurrency(tcoData.totalTCO)}
              </div>
              <p className="text-[11px] text-stone-600">
                CapEx ({formatIndianCurrency(tcoData.initialCapEx.total)}) + 5-yr Power & Maintenance
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-emerald-50/50 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wide">
                Expected Annual ROI
              </span>
              <div className="text-xl font-black text-emerald-700">
                {roiData.roiPercentage}%
              </div>
              <p className="text-[11px] text-emerald-900 font-semibold">
                Status: {roiData.viabilityStatus}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-blue-50/50 space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-800 tracking-wide">
                Estimated Payback Period
              </span>
              <div className="text-xl font-black text-blue-900">
                {roiData.paybackPeriodMonths} Months
              </div>
              <p className="text-[11px] text-stone-600">
                ~{(roiData.paybackPeriodMonths / 12).toFixed(1)} years to recover initial investment
              </p>
            </div>
          </div>

          {/* Secondary Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xl text-xs">
            <div>
              <span className="text-stone-400 block text-[10px]">Monthly Operating Cost:</span>
              <strong className="text-stone-900">{formatIndianCurrency(tcoData.annualOpEx.monthlyOperatingCost)}/mo</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Est. Monthly Net Benefit:</span>
              <strong className="text-emerald-700">{formatIndianCurrency(roiData.estimatedMonthlyNetBenefit)}/mo</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Initial Capital Outlay:</span>
              <strong className="text-stone-900">{formatIndianCurrency(tcoData.initialCapEx.total)}</strong>
            </div>
          </div>

          {/* Expandable Assumptions Accordion */}
          <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between font-bold text-stone-800 min-h-[44px]"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle size={15} className="text-stone-500" />
                <span>How was this calculated? (Assumptions & Engineering Basis)</span>
              </span>
              {showAssumptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAssumptions && (
              <div className="p-4 bg-white space-y-2.5 border-t border-stone-200 text-stone-600 text-[11px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><strong>Electricity Tariff:</strong> {tcoData.assumptions?.unitPowerRate}</div>
                  <div><strong>Maintenance Rate:</strong> {tcoData.assumptions?.maintenanceRate}</div>
                  <div><strong>Operating Schedule:</strong> {tcoData.assumptions?.dailyOperatingHours} hrs/day, {tcoData.assumptions?.annualOperatingDays} days/yr</div>
                  <div><strong>Lifespan Evaluation:</strong> {tcoData.assumptions?.lifespanYears} years</div>
                  <div><strong>Tax Depreciation:</strong> {roiData.assumptions?.taxDepreciationRef}</div>
                </div>
                <p className="pt-2 text-stone-400 border-t border-stone-100 text-[10px] leading-relaxed">
                  {tcoData.assumptions?.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Equipment Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-stone-400">{selectedItem.category}</span>
                <h3 className="text-base font-black text-stone-900">{selectedItem.name}</h3>
                {selectedItem.nameMr && <span className="text-xs text-stone-500">{selectedItem.nameMr}</span>}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-stone-400 hover:text-stone-700 font-black p-1 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div>
                <strong className="text-stone-900 block font-bold">Purpose & Operation:</strong>
                <p>{selectedItem.purpose}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Benchmark Price:</span>
                  <strong className="text-stone-900">{selectedItem.priceDisplay}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Power Phase:</span>
                  <span>{selectedItem.powerRequirement?.phase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Motor Power:</span>
                  <span>{selectedItem.powerRequirement?.hp || selectedItem.powerRequirement?.kw || 'Standard'} HP/kW</span>
                </div>
              </div>

              <div>
                <strong className="text-stone-900 block font-bold">Installation Requirements:</strong>
                <p className="text-stone-600">{selectedItem.installationRequirement}</p>
              </div>

              {selectedItem.eligibleSchemes?.length > 0 && (
                <div>
                  <strong className="text-stone-900 block font-bold">Eligible Government Subsidies:</strong>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedItem.eligibleSchemes.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-[#0b2545] text-white text-xs font-bold min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
