import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lightbulb, ArrowRight, CheckCircle2, Sliders, 
  BarChart3, AlertCircle, 
  ExternalLink, Printer, Compass, Calculator,
  ChevronRight, RefreshCw, Layers,
  TrendingUp, Award, Clock, Users, Building2, HelpCircle
} from 'lucide-react';
import { getAllIndianStates, getDistrictsByState } from '../utils/panIndiaLocations.js';
import { formatIndianCurrency } from '../utils/calculations.js';
import { apiService } from '../services/api.js';
import DataStatusBadge from '../components/common/DataStatusBadge.jsx';
import { 
  translateMLCategory, 
  translateMLDemand, 
  translateMLSuitability, 
  translateMLProvenance, 
  translateMLTerm 
} from '../utils/mlLocalization.js';
import { localizeSWOTText } from '../utils/swotLocalization.js';

export const CURATED_RURAL_IDEAS = [
  {
    id: 'dairy-value-add',
    category: 'Dairy & Animal Husbandry',
    title: 'Value-Added Dairy Unit (Paneer, Ghee & Khoa)',
    titleHi: 'मूल्यवर्धित डेयरी इकाई (पनीर, घी एवं खोया)',
    titleMr: 'दुग्ध प्रक्रिया व उप-उत्पादने (पनीर, तूप, खवा)',
    shortDesc: 'Process raw milk into packaged high-margin dairy products instead of selling raw wholesale.',
    investmentMin: 350000,
    investmentMax: 700000,
    grossMargin: '28% - 36%',
    gestationPeriod: '1 - 2 months',
    skillLevel: 'Moderate (Basic hygiene & temperature control)',
    complexity: 'Low to Medium',
    resourceFit: 'High if village has 5+ dairy farmers or local milk surplus',
    whyFit: 'Raw milk earns ₹38-₹45/L; value addition produces ₹400/kg paneer and ₹650/kg ghee with 3x margin buffer.',
    validationQuestions: [
      'Are there at least 2 nearby weekly mandis or 10 retail sweet/grocery shops?',
      'Is 200–300 liters of clean daily milk procurable at predictable rates?',
      'Is reliable 3-phase electricity or solar backup available for chilling?'
    ],
    nextStep: 'Validate local shop demand across taluka before machinery purchase.',
    recommendedSchemes: ['PMFME (35% capital subsidy)', 'CMEGP Maharashtra', 'AHIDF']
  },
  {
    id: 'turmeric-agro-processing',
    category: 'Food Processing',
    title: 'Hygienic Turmeric & Spice Grinding Unit',
    titleHi: 'हल्दी एवं मसाला प्रसंस्करण इकाई',
    titleMr: 'हळद व मसाला प्रक्रिया उद्योग',
    shortDesc: 'Clean, polish, pulverize and nitrogen-seal locally grown spices for regional retailers.',
    investmentMin: 450000,
    investmentMax: 950000,
    grossMargin: '32% - 42%',
    gestationPeriod: '2 - 3 months',
    skillLevel: 'Low to Moderate',
    complexity: 'Medium',
    resourceFit: 'Ideal for Sangli, Satara, Hingoli, Nanded and Kolhapur belt',
    whyFit: 'Direct farm-gate raw turmeric sells for ₹70-₹90/kg; packaged pure grade powder retails at ₹220-₹280/kg.',
    validationQuestions: [
      'Do local farmers currently send raw unpolished rhizomes to distant APMCs?',
      'Can you partner with 15–20 retail grocery shops in your block for supply?',
      'Do you have dry storage space of at least 300 sq.ft for seasonal stock?'
    ],
    nextStep: 'Check machinery quotations for 50kg/hr pulverizer and pouch sealer.',
    recommendedSchemes: ['PMFME Micro Enterprises', 'PMEGP Subsidy', 'SMART Project']
  },
  {
    id: 'solar-custom-hiring',
    category: 'Agri Service & Farm Mechanization',
    title: 'Solar-Powered Cold Storage & Farm Implement Hiring',
    titleHi: 'सौर कोल्ड स्टोरेज एवं कृषि उपकरण किराया केंद्र',
    titleMr: 'सौर शीतगृह व कृषी अवजारे भाडेतत्त्व केंद्र',
    shortDesc: 'Provide pay-per-day micro cold storage for horticulture farmers and rent modern farm implements.',
    investmentMin: 600000,
    investmentMax: 1200000,
    grossMargin: '40% - 52%',
    gestationPeriod: '1 month',
    skillLevel: 'Basic mechanical understanding',
    complexity: 'Low',
    resourceFit: 'High impact in vegetable, flower and fruit producing villages',
    whyFit: 'Prevents distress harvest selling; farmers willingly pay daily crates rental during peak harvesting weeks.',
    validationQuestions: [
      'Do farmers in your cluster face price drops due to inability to hold perishables 3-5 days?',
      'Is there an accessible site near the main village road or cooperative collection point?',
      'Are power outages frequent enough to make solar chilling a strong differentiator?'
    ],
    nextStep: 'Map 30 surrounding vegetable/onion growers and estimate peak crate requirements.',
    recommendedSchemes: ['Agriculture Infrastructure Fund (AIF)', 'CMEGP', 'NABARD Cold Chain']
  },
  {
    id: 'rural-bio-inputs',
    category: 'Bio-Fertilizer & Organic Agro',
    title: 'Vermicompost & Liquid Jeevamrut Production',
    titleHi: 'वर्मीकम्पोस्ट एवं जैविक खाद उत्पादन इकाई',
    titleMr: 'गांडूळ खत व सेंद्रिय निविष्ठा उत्पादन',
    shortDesc: 'Convert local cattle dung, crop residues and biomass into lab-tested organic compost and bio-sprays.',
    investmentMin: 150000,
    investmentMax: 350000,
    grossMargin: '45% - 60%',
    gestationPeriod: '45 days',
    skillLevel: 'Low (Hands-on traditional farming knowledge)',
    complexity: 'Low',
    resourceFit: 'Extremely high for cattle owners and organic farmer clusters',
    whyFit: 'Chemical fertilizer costs are rising; organic bio-compost has rapid recurring local demand at ₹8-₹12/kg.',
    validationQuestions: [
      'Do you have steady access to cow dung and agricultural crop residues?',
      'Are nearby farmers adopting organic or residue-free practices?',
      'Can you set up 4–6 covered vermi-beds with protective shade nets?'
    ],
    nextStep: 'Start with 4 beds (₹40,000 trial setup) and test local farmer willingness to pay.',
    recommendedSchemes: ['Paramparagat Krishi Vikas Yojana (PKVY)', 'MUDRA Shishu Loan']
  }
];

export default function BusinessIdeas({ subView = 'ai-recommendations', onNavigate, user }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language && ['mr', 'hi', 'en'].includes(i18n.language)) ? i18n.language : 'mr';

  // Active view: 'ai-recommendations', 'curated', 'compare', 'business-plan'
  const [activeTab, setActiveTab] = useState(
    subView === 'discover' ? 'ai-recommendations' : (subView || 'ai-recommendations')
  );

  // Pan-India Location & Enterprise Inputs (Synchronized with user profile, placeholders instead of accidental defaults)
  const [state, setState] = useState(() => user?.state || 'Maharashtra');
  const [district, setDistrict] = useState(() => user?.district || 'Satara');
  const [budget, setBudget] = useState(() => (user?.investmentRequirement ? Number(user.investmentRequirement) : ''));
  const [experienceYears, setExperienceYears] = useState(2);
  const [skillLevel, setSkillLevel] = useState('Medium');
  const [landAvailable, setLandAvailable] = useState(1);
  const [waterAvailable, setWaterAvailable] = useState(1);
  const [electricityAvailable, setElectricityAvailable] = useState(1);
  const [locationType, setLocationType] = useState('Rural');
  const [marketDistanceKm, setMarketDistanceKm] = useState(5);
  const [workers, setWorkers] = useState(2);


  // Sync when user prop updates
  useEffect(() => {
    if (user) {
      if (user.state) setState(user.state);
      if (user.district) setDistrict(user.district);
      if (user.investmentRequirement) setBudget(Number(user.investmentRequirement));
    }
  }, [user]);

  // Sync when profile update event fires
  useEffect(() => {
    const handleProfileSync = (e) => {
      const u = e.detail?.user || e.detail?.profile;
      if (u) {
        if (u.state) setState(u.state);
        if (u.district) setDistrict(u.district);
        if (u.investmentRequirement) setBudget(Number(u.investmentRequirement));
      }
    };
    window.addEventListener('vyapar_profile_updated', handleProfileSync);
    return () => window.removeEventListener('vyapar_profile_updated', handleProfileSync);
  }, []);

  // ML Recommendations State
  const [mlRecommendations, setMlRecommendations] = useState([]);
  const [mlDirectInsights, setMlDirectInsights] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState(null);
  const [hasQueriedMl, setHasQueriedMl] = useState(false);
  const [opportunityData, setOpportunityData] = useState(null);
  const [swotData, setSwotData] = useState(null);
  const [selectedRecIndex, setSelectedRecIndex] = useState(0);

  // Curated ideas filter state
  const [curatedCategory, setCuratedCategory] = useState('All');
  const [selectedForCompare, setSelectedForCompare] = useState(['dairy-value-add', 'turmeric-agro-processing']);
  const [selectedPlanIdeaId, setSelectedPlanIdeaId] = useState('dairy-value-add');
  const [customCanvasIdea, setCustomCanvasIdea] = useState(null);

  // Saved ideas in local storage
  const [savedIdeas, setSavedIdeas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vyapar_saved_ideas') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (subView) {
      setActiveTab(subView === 'discover' ? 'ai-recommendations' : subView);
    }
  }, [subView]);

  // Handle calling the real ML Recommendation Engine and all 4 baseline models
  const handleFetchRecommendations = async () => {
    if (!state || !district || !budget || Number(budget) <= 0) {
      setMlError(
        i18n.language === 'mr'
          ? "कृपया आपले राज्य, जिल्हा निवडा आणि नियोजित भांडवल प्रविष्ट करा."
          : (i18n.language === 'hi'
              ? "कृपया अपना राज्य, जिला चुनें और अनुमानित पूंजी दर्ज करें।"
              : "Please select your state, district, and enter your planned investment budget.")
      );
      return;
    }

    setMlLoading(true);
    setMlError(null);
    setHasQueriedMl(true);

    try {
      const numBudget = Number(budget);
      const numExp = Number(experienceYears);
      const numLand = Number(landAvailable);
      const numWater = Number(waterAvailable);
      const numElec = Number(electricityAvailable);
      const numDist = Number(marketDistanceKm);
      const numWorkers = Math.max(1, Number(workers));

      const payload = {
        state,
        district,
        budget: numBudget,
        experience_years: numExp,
        skill_level: skillLevel,
        land_available: numLand,
        water_available: numWater,
        electricity_available: numElec,
        location_type: locationType,
        market_distance_km: numDist,
        workers: numWorkers
      };

      // Call recommendation engine and all 4 ML models concurrently
      const [result, catML, suitML, demandML, profitML] = await Promise.all([
        apiService.getRecommendations(payload).catch(() => null),
        apiService.predictBusinessCategory({
          budget: numBudget,
          experience_years: numExp,
          skill_level: skillLevel,
          land_available: numLand,
          water_available: numWater,
          electricity_available: numElec,
          location_type: locationType
        }).catch(() => null),
        apiService.predictBusinessSuitability({
          investment_budget: numBudget,
          experience_years: numExp,
          land_available: numLand,
          water_available: numWater,
          electricity_available: numElec,
          market_distance_km: numDist,
          competitor_count: 0,
          workers: numWorkers
        }).catch(() => null),
        apiService.predictDemand({
          market_distance_km: numDist,
          budget: numBudget,
          business_category: 'Dairy Processing',
          location_type: locationType
        }).catch(() => null),
        apiService.predictProfit({
          budget: numBudget,
          experience_years: numExp,
          land_available: numLand,
          workers: numWorkers,
          electricity_available: numElec,
          water_available: numWater,
          market_distance_km: numDist,
          business_suitability_score: 0.80,
          budget_per_worker: numBudget / numWorkers
        }).catch(() => null)
      ]);

      const isLive = Boolean(
        (catML?.success && catML?.source === 'ml') ||
        (suitML?.success && suitML?.source === 'ml') ||
        (demandML?.success && demandML?.source === 'ml') ||
        (profitML?.success && profitML?.source === 'ml')
      );

      setMlDirectInsights({
        category: catML?.success ? catML : null,
        suitability: suitML?.success ? suitML : null,
        demand: demandML?.success ? demandML : null,
        profit: profitML?.success ? profitML : null,
        isLiveML: isLive,
        provenance: isLive ? 'ML Prediction' : 'Verified Benchmark Data'
      });

      if (result && Array.isArray(result.recommendations) && result.recommendations.length > 0) {
        setMlRecommendations(result.recommendations);
        setSelectedRecIndex(0);
        try {
          const mkt = await apiService.getMarketIntelligence({
            state,
            district,
            businessCategory: result.recommendations[0].businessCategory,
            radius: Number(marketDistanceKm) <= 5 ? 5 : 10
          });
          if (mkt) {
            setOpportunityData(mkt.opportunityIndex || null);
            setSwotData(mkt.swot || null);
          }
        } catch (mktErr) {
          console.warn('[BusinessIdeas] Market intelligence fetch skipped:', mktErr.message);
        }
      } else {
        setMlRecommendations([]);
        setOpportunityData(null);
        setSwotData(null);
        setMlError(
          i18n.language === 'mr'
            ? "सध्या या निकषांनुसार थेट शिफारसी उपलब्ध नाहीत. कृपया भांडवल किंवा निकष बदलून पहा."
            : (i18n.language === 'hi'
                ? "वर्तमान में इन मानदंडों के अनुसार सिफारिशें उपलब्ध नहीं हैं। कृपया पूंजी या विवरण बदलकर देखें।"
                : "No matching recommendations found for the entered parameters. Please adjust your budget or criteria.")
        );
      }
    } catch (err) {
      console.error('[BusinessIdeas] Failed to fetch ML recommendations:', err);
      const friendlyMsg = i18n.language === 'mr'
        ? "सध्या व्यवसाय अनुकूलता मोजता आली नाही. कृपया पुन्हा प्रयत्न करा."
        : (i18n.language === 'hi'
            ? "व्यवसाय उपयुक्तता की गणना अभी नहीं हो सकी। कृपया पुन: प्रयास करें।"
            : "Business feasibility could not be calculated right now. Please try again.");
      setMlError(friendlyMsg);
    } finally {
      setMlLoading(false);
    }
  };


  const handleSelectRecommendation = async (rec, index) => {
    setSelectedRecIndex(index);
    try {
      const mkt = await apiService.getMarketIntelligence({
        state: state,
        district: district,
        businessCategory: rec.businessCategory,
        radius: Number(marketDistanceKm) <= 5 ? 5 : 10
      });
      if (mkt) {
        setOpportunityData(mkt.opportunityIndex || null);
        setSwotData(mkt.swot || null);
      }
    } catch (e) {
      console.warn('[BusinessIdeas] Opportunity fetch error:', e.message);
    }
  };

  // Transfer an AI recommendation to the Business Canvas
  const handleUseInCanvas = (rec) => {
    const canvasObj = {
      id: `ai-${(rec.businessCategory || 'venture').toLowerCase().replace(/\s+/g, '-')}`,
      title: rec.businessCategory || 'Recommended Enterprise',
      titleMr: '',
      shortDesc: rec.reason || `AI-ranked rural enterprise with ${rec.demandLevel || 'steady'} market demand and estimated monthly profit of ₹${Math.round(rec.predictedMonthlyProfit || 0).toLocaleString('en-IN')}.`,
      investmentMin: Math.round(budget * 0.85),
      investmentMax: Math.round(budget * 1.15),
      grossMargin: rec.suitabilityScore ? `${Math.round(rec.suitabilityScore * 0.35)}% - ${Math.round(rec.suitabilityScore * 0.45)}%` : '25% - 35%',
      gestationPeriod: '1 - 2 months',
      complexity: rec.suitabilityScore >= 75 ? 'Low' : (rec.suitabilityScore >= 50 ? 'Medium' : 'High'),
      demandLevel: rec.demandLevel || 'Medium',
      predictedProfit: rec.predictedMonthlyProfit || 0,
      source: 'ai_ml_engine',
      recommendedSchemes: ['Maha-CMEGP (Up to 35% Subsidy)', 'PMEGP (Rural)', 'MUDRA Kishore']
    };

    setCustomCanvasIdea(canvasObj);
    setActiveTab('business-plan');
    if (onNavigate) onNavigate('/business-plan');
  };

  const toggleSaveIdea = (idea) => {
    let updated;
    if (savedIdeas.some(i => i.id === idea.id)) {
      updated = savedIdeas.filter(i => i.id !== idea.id);
    } else {
      updated = [...savedIdeas, { ...idea, savedAt: new Date().toISOString() }];
    }
    setSavedIdeas(updated);
    localStorage.setItem('vyapar_saved_ideas', JSON.stringify(updated));
  };

  const isSaved = (id) => savedIdeas.some(i => i.id === id);

  const toggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter(item => item !== id));
      }
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        setSelectedForCompare([selectedForCompare[1], selectedForCompare[2], id]);
      }
    }
  };

  const filteredCuratedIdeas = CURATED_RURAL_IDEAS.filter(idea => {
    if (curatedCategory !== 'All' && !idea.category.toLowerCase().includes(curatedCategory.toLowerCase())) {
      return false;
    }
    return true;
  });

  const selectedPlanIdea = customCanvasIdea || CURATED_RURAL_IDEAS.find(i => i.id === selectedPlanIdeaId) || CURATED_RURAL_IDEAS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none space-y-8">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0b2545] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {t('business.step_1_badge', { defaultValue: 'Step 1 of Business Journey' })}
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {t('business.discovery_feasibility', { defaultValue: 'Discovery & Feasibility' })}
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
            {t('business.page_title', { defaultValue: 'Business Opportunities' })}
          </h1>
          <p className="text-sm sm:text-[15px] text-stone-600 font-normal leading-[1.5] mt-1 max-w-2xl">
            {t('business.page_desc', { defaultValue: 'Evaluates market demand, capital requirements, local resource availability, and profitability across micro-enterprises.' })}
          </p>
        </div>

        {/* Workflow View Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-stone-100 p-1.5 rounded-xl border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ai-recommendations')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ai-recommendations' 
                ? 'bg-[#0b2545] text-white shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>{t('business.tab_tailored', { defaultValue: 'Recommendations' })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curated')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'curated' 
                ? 'bg-white text-[#0b2545] shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('business.tab_curated', { defaultValue: 'Curated Library' })} ({CURATED_RURAL_IDEAS.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'compare' 
                ? 'bg-white text-[#0b2545] shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('business.tab_compare', { defaultValue: 'Compare' })} ({selectedForCompare.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business-plan')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'business-plan' 
                ? 'bg-white text-[#0b2545] shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('business.tab_canvas', { defaultValue: '1-Page Canvas' })}
          </button>
        </div>
      </div>

      {/* TAB 1: REAL AI RANKED RECOMMENDATIONS */}
      {activeTab === 'ai-recommendations' && (
        <div className="space-y-6">
          
          {/* Discovery Input Form */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0b2545] flex items-center justify-center font-black">
                  <Sliders size={16} />
                </div>
                <h3 className="text-sm font-black text-stone-900">
                  {t('business.inputs_title', { defaultValue: 'Entrepreneur Resource & Background Inputs' })}
                </h3>
              </div>
            </div>

            {/* Target Location Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('business.target_state', { defaultValue: 'Target State / UT' })}</label>
                <select
                  value={state}
                  onChange={(e) => {
                    const s = e.target.value;
                    setState(s);
                    const dists = getDistrictsByState(s);
                    setDistrict(dists[0] || '');
                  }}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  {getAllIndianStates().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('business.target_district', { defaultValue: 'Target District' })}</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  {getDistrictsByState(state).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Budget */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.capital_avail', { defaultValue: '1. Available Capital (₹)' })}
                </label>
                <input
                  type="number"
                  step="25000"
                  min="25000"
                  max="5000000"
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-black text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {formatIndianCurrency(budget)}
                </span>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.exp_sector', { defaultValue: '2. Experience in Sector' })}
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value={0}>{t('business.exp_0', { defaultValue: '0 Years (Complete beginner)' })}</option>
                  <option value={1}>{t('business.exp_1', { defaultValue: '1 Year (Basic familiarity)' })}</option>
                  <option value={2}>{t('business.exp_2', { defaultValue: '2 Years (Working knowledge)' })}</option>
                  <option value={3}>{t('business.exp_3', { defaultValue: '3-5 Years (Skilled / Experienced)' })}</option>
                  <option value={6}>{t('business.exp_6', { defaultValue: '6+ Years (Master artisan / veteran)' })}</option>
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.skill_title', { defaultValue: '3. Skill Level' })}
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value="Low">{t('business.skill_low', { defaultValue: 'Low (Requires initial training)' })}</option>
                  <option value="Medium">{t('business.skill_med', { defaultValue: 'Medium (Semi-skilled)' })}</option>
                  <option value="High">{t('business.skill_high', { defaultValue: 'High (Certified / Vocational)' })}</option>
                </select>
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.location_type', { defaultValue: '4. Location Type' })}
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value="Rural">{t('business.loc_rural', { defaultValue: 'Rural (Village cluster)' })}</option>
                  <option value="Semi-Urban">{t('business.loc_semi', { defaultValue: 'Semi-Urban (Market town)' })}</option>
                  <option value="Urban">{t('business.loc_urban', { defaultValue: 'Urban (District HQ)' })}</option>
                </select>
              </div>

              {/* Land Availability */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.land_title', { defaultValue: '5. Land Availability' })}
                </label>
                <select
                  value={landAvailable}
                  onChange={(e) => setLandAvailable(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value={1}>{t('business.land_yes', { defaultValue: 'Available' })}</option>
                  <option value={0}>{t('business.land_no', { defaultValue: 'Not Available' })}</option>
                </select>
              </div>

              {/* Water Supply */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.water_title', { defaultValue: '6. Water Supply' })}
                </label>
                <select
                  value={waterAvailable}
                  onChange={(e) => setWaterAvailable(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value={1}>{t('business.water_yes', { defaultValue: 'Adequate water' })}</option>
                  <option value={0}>{t('business.water_no', { defaultValue: 'Limited water' })}</option>
                </select>
              </div>

              {/* 3-Phase Electricity */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.elec_title', { defaultValue: '7. Electricity Connection' })}
                </label>
                <select
                  value={electricityAvailable}
                  onChange={(e) => setElectricityAvailable(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value={1}>{t('business.elec_yes', { defaultValue: 'Reliable 3-Phase or Solar' })}</option>
                  <option value={0}>{t('business.elec_no', { defaultValue: 'Single phase only' })}</option>
                </select>
              </div>

              {/* Market Distance */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('business.dist_mandi', { defaultValue: '8. Distance to Mandi / Town (km)' })}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marketDistanceKm}
                  onChange={(e) => setMarketDistanceKm(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-black text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

            </div>

            {/* Primary Action Button */}
            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={handleFetchRecommendations}
                disabled={mlLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {mlLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-amber-300" />
                    <span>{t('business.analyzing_models', { defaultValue: 'Evaluating recommendations...' })}</span>
                  </>
                ) : (
                  <span>{t('business.discover_btn', { defaultValue: 'Discover Recommended Businesses' })}</span>
                )}
              </button>
            </div>
          </div>

          {/* Error State */}
          {mlError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-rose-900">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{mlError}</span>
              </div>
              <button
                type="button"
                onClick={handleFetchRecommendations}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shrink-0"
              >
                {t('business.retry', { defaultValue: 'Retry Request' })}
              </button>
            </div>
          )}

          {/* Initial Prompt State (Before User has clicked button) */}
          {!hasQueriedMl && !mlLoading && mlRecommendations.length === 0 && (
            <div className="p-10 bg-white rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
                <Lightbulb size={24} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-stone-900">
                  {t('business.ready_title', { defaultValue: 'Ready to Discover Business Recommendations' })}
                </h3>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  {t('business.ready_desc', { defaultValue: 'Review your available capital and infrastructure inputs above, then click "Discover Recommended Businesses" to evaluate the highest-potential businesses for your location.' })}
                </p>
              </div>
              <button
                type="button"
                onClick={handleFetchRecommendations}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center"
              >
                <span>{t('business.discover_btn', { defaultValue: 'Discover Recommended Businesses' })}</span>
              </button>
            </div>
          )}

          {/* ML Recommendations Grid (When Results Exist) */}
          {mlRecommendations.length > 0 && (
            <div className="space-y-6">
              {/* DEDICATED ML PREDICTIVE SIGNALS PANEL */}
              {mlDirectInsights && (
                <div className="bg-[#0b2545] text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        mlDirectInsights.isLiveML 
                          ? 'bg-amber-400 text-stone-950' 
                          : 'bg-stone-700 text-stone-200'
                      }`}>
                        {translateMLProvenance(mlDirectInsights.provenance, lang)}
                      </span>
                      <span className="text-xs font-semibold text-stone-200">
                        {mlDirectInsights.isLiveML ? t('business.ml_panel_provenance', { defaultValue: '4 Analytical Models Evaluated on Your Input' }) : t('business.standards_notice', { defaultValue: 'Verified Maharashtra Benchmark Rules' })}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-300 font-mono">
                      Budget: ₹{Number(budget).toLocaleString('en-IN')} • {experienceYears} yr(s) exp • {locationType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Business Category Prediction */}
                    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-300">{t('business.cat_pred_title', { defaultValue: 'Business Category Prediction' })}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                          {mlDirectInsights.category ? 'Active' : 'Benchmark'}
                        </span>
                      </div>
                      <strong className="text-sm font-bold text-white block truncate">
                        {translateMLCategory(mlDirectInsights.category?.recommended_business || mlRecommendations[0]?.businessCategory || 'Dairy Processing', lang)}
                      </strong>
                      {mlDirectInsights.category?.recommendations?.[0]?.probability ? (
                        <span className="text-[10px] text-emerald-400 font-medium block">
                          {t('business.confidence', { pct: Math.round(mlDirectInsights.category.recommendations[0].probability * 100), defaultValue: `Confidence: ${Math.round(mlDirectInsights.category.recommendations[0].probability * 100)}%` })}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 block">{t('business.top_rec', { defaultValue: 'Top recommendation' })}</span>
                      )}
                    </div>

                    {/* 2. Demand Estimate */}
                    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-stone-200">{t('business.demand_est_title', { defaultValue: 'Demand Estimate' })}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                          {mlDirectInsights.demand ? 'Active' : 'Benchmark'}
                        </span>
                      </div>
                      <strong className="text-sm font-bold text-white block">
                        {translateMLDemand(mlDirectInsights.demand?.predicted_demand ? `${mlDirectInsights.demand.predicted_demand} Demand` : `${mlRecommendations[0]?.demandLevel || 'High'} Demand`, lang)}
                      </strong>
                      {mlDirectInsights.demand?.probabilities ? (
                        <span className="text-[10px] text-stone-300 font-mono block">
                          P(High): {Math.round((mlDirectInsights.demand.probabilities.High || 0) * 100)}% • P(Med): {Math.round((mlDirectInsights.demand.probabilities.Medium || 0) * 100)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 block">{t('business.local_mandi_est', { defaultValue: 'Local mandi estimate' })}</span>
                      )}
                    </div>

                    {/* 3. Feasibility Signal */}
                    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-300">{t('business.feasibility_title', { defaultValue: 'Feasibility Signal' })}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                          {mlDirectInsights.suitability ? 'Active' : 'Benchmark'}
                        </span>
                      </div>
                      <strong className="text-sm font-bold text-white block">
                        {mlDirectInsights.suitability?.business_suitability_score 
                          ? `${Math.round(mlDirectInsights.suitability.business_suitability_score * 100)}%` 
                          : `${Math.round(mlRecommendations[0]?.suitabilityScore || 80)}%`}
                      </strong>
                      <span className="text-[10px] text-stone-300 block font-medium truncate">
                        {translateMLSuitability(mlDirectInsights.suitability?.suitability_level || 'High', lang)}
                      </span>
                    </div>

                    {/* 4. Estimated Monthly Profit */}
                    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-300">{t('business.profit_est_title', { defaultValue: 'Estimated Monthly Profit' })}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                          {mlDirectInsights.profit ? 'Active' : 'Benchmark'}
                        </span>
                      </div>
                      <strong className="text-sm font-bold text-amber-300 block">
                        ₹{Math.round(mlDirectInsights.profit?.predicted_monthly_profit || mlRecommendations[0]?.predictedMonthlyProfit || 25000).toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-300">{t('business.per_month', { defaultValue: '/ mo' })}</span>
                      </strong>
                      <span className="text-[10px] text-stone-400 block">
                        {t('business.stat_est', { defaultValue: 'Statistical model estimate' })}
                      </span>
                    </div>
                  </div>

                  {/* Explanatory footer */}
                  <div className="pt-2 border-t border-white/10 text-[11px] text-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>{t('business.based_on_inputs', { defaultValue: 'Based on the information you entered.' })}</span>
                    <span className="text-stone-400">{t('business.model_caveat', { defaultValue: 'Model-generated estimate; actual results may vary based on local conditions.' })}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {t('business.top_rec_heading', { count: mlRecommendations.length, defaultValue: `Top ${mlRecommendations.length} Tailored Enterprise Recommendations` })}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {t('business.composite_score_desc', { defaultValue: 'Sorted by composite weighted score: Category (30%) + Demand (25%) + Suitability (25%) + Profit (20%)' })}
                  </p>
                </div>
                <span className="text-xs font-black text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                  {t('business.ranked_by_score', { defaultValue: 'Ranked by Feasibility Score' })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {mlRecommendations.map((rec, index) => {
                  const rank = rec.rank || index + 1;
                  const isTop = rank === 1;

                  return (
                    <div
                      key={rec.businessCategory || index}
                      className={`rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                        isTop 
                          ? 'bg-gradient-to-b from-white to-blue-50/40 border-blue-300 shadow-md ring-1 ring-blue-200' 
                          : 'bg-white border-stone-200 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      {/* Top Rank Badge & Decision */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isTop 
                                ? 'bg-[#0b2545] text-amber-300' 
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}>
                              {t('business.rank_prefix', { rank, defaultValue: `Rank #${rank}` })} {isTop ? `• ${t('business.top_match', { defaultValue: 'Top Match' })}` : ''}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                              {rec.provenance ? translateMLProvenance(rec.provenance, lang) : (mlDirectInsights?.isLiveML ? translateMLProvenance('ML Prediction', lang) : translateMLProvenance('Verified Benchmark', lang))}
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#0b2545]">
                            {t('business.score_label', { defaultValue: 'Score' })}: {rec.finalScore ? Math.round(rec.finalScore) : 'N/A'}/100
                          </span>
                        </div>

                        <h4 className="text-lg font-black text-stone-900 leading-snug pt-1">
                          {translateMLCategory(rec.businessCategory, lang)}
                        </h4>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200">
                            {i18n.language === 'mr' ? (rec.decisionMr || rec.decision) : (i18n.language === 'hi' ? (rec.decisionHi || rec.decision) : (rec.decision || 'Business looks suitable'))}
                          </div>
                          {rec.confidence ? (
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-bold border border-blue-200">
                              {t('business.confidence', { pct: Math.round(rec.confidence * 100), defaultValue: `Confidence: ${Math.round(rec.confidence * 100)}%` })}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed font-medium">
                          <strong className="text-stone-900 font-bold block mb-0.5">
                            {t('business.why_matches', { defaultValue: 'Why it matches:' })}
                          </strong>
                          {i18n.language === 'mr' ? (rec.reasonsMr?.[0] || rec.reason) : (i18n.language === 'hi' ? (rec.reasonsHi?.[0] || rec.reason) : (rec.reasons?.[0] || rec.reason))}
                        </p>
                      </div>

                      {/* Business Attributes Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                          <span className="text-[10px] font-bold text-stone-400 uppercase block">
                            {t('business.approx_investment', { defaultValue: 'Approx Investment' })}
                          </span>
                          <strong className="text-xs font-black text-stone-900 block">
                            {rec.approxInvestment || formatIndianCurrency(budget || 200000)}
                          </strong>
                        </div>

                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                          <span className="text-[10px] font-bold text-stone-400 uppercase block">
                            {t('business.demand_tier', { defaultValue: 'Demand Tier' })}
                          </span>
                          <strong className="text-xs font-black text-emerald-700 block">
                            {rec.demandLevel ? translateMLDemand(`${rec.demandLevel} Demand`, lang) : t('business.verified', { defaultValue: 'Verified' })}
                          </strong>
                        </div>

                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                          <span className="text-[10px] font-bold text-stone-400 uppercase block">
                            {t('business.ml_suitability', { defaultValue: 'ML Suitability' })}
                          </span>
                          <strong className="text-xs font-black text-stone-900 block">
                            {rec.suitabilityScore ? `${Math.round(rec.suitabilityScore)}%` : '75%'}
                          </strong>
                        </div>

                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                          <span className="text-[10px] font-bold text-stone-400 uppercase block">
                            {t('business.ml_profit_est', { defaultValue: 'ML Profit Est.' })}
                          </span>
                          <strong className="text-xs font-black text-amber-700 block">
                            ₹{Math.round(rec.predictedMonthlyProfit || 20000).toLocaleString('en-IN')}{t('business.per_month', { defaultValue: '/mo' })}
                          </strong>
                        </div>

                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 col-span-2">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">
                            {t('business.things_to_check', { defaultValue: 'Things to Check' })}
                          </span>
                          <span className="text-xs text-amber-950 font-medium block">
                            {i18n.language === 'mr' ? (rec.risksMr?.[0] || 'कच्च्या मालाचे हंगामी दर व वाहतूक खर्च') : (i18n.language === 'hi' ? (rec.risksHi?.[0] || 'कच्चे माल के मौसमी भाव') : (rec.risks?.[0] || 'Raw material seasonal price variations'))}
                          </span>
                        </div>

                        <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 col-span-2">
                          <span className="text-[10px] font-bold text-blue-800 uppercase block">
                            {t('business.next_step', { defaultValue: 'Recommended Next Step' })}
                          </span>
                          <span className="text-xs text-blue-950 font-bold block">
                            {i18n.language === 'mr' ? (rec.nextStepMr || 'नजीकच्या बाजार समितीत दर पडताळून पहा') : (i18n.language === 'hi' ? (rec.nextStepHi || 'निकटतम मंडी में भाव की पड़ताल करें') : (rec.nextStep || 'Check local market prices'))}
                          </span>
                        </div>
                      </div>


                      {/* Card Action: Use in Business Canvas */}
                      <button
                        type="button"
                        onClick={() => handleUseInCanvas(rec)}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center transition-all shadow-xs ${
                          isTop
                            ? 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                            : 'bg-[#0b2545] hover:bg-[#13315c] text-white'
                        }`}
                      >
                        <span>{t('business.use_in_canvas', { defaultValue: 'Use in Business Canvas' })}</span>
                      </button>

                    </div>
                  );
                })}
              </div>

              {/* ESTIMATED MARKET OPPORTUNITY & DETERMINISTIC SWOT ANALYSIS */}
              {opportunityData && (
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                    <div>

                      <h3 className="text-lg font-black text-stone-900">
                        {t('business.market_opp_title', { defaultValue: 'Estimated Market Opportunity' })}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-black text-[#0b2545]">
                          {opportunityData.score} <span className="text-sm font-bold text-stone-400">/ 100</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          opportunityData.level === 'High' ? 'bg-emerald-100 text-emerald-800' :
                          opportunityData.level === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {translateMLSuitability(opportunityData.level, lang)} {t('business.opportunity_word', { defaultValue: 'Opportunity' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Normalized Component Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">{t('business.demand_weight', { defaultValue: 'Demand (40%)' })}</span>
                      <div className="text-lg font-black text-stone-900">{opportunityData.components.demand}</div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#0b2545] h-1.5 rounded-full" style={{ width: `${opportunityData.components.demand}%` }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">{t('business.comp_weight', { defaultValue: 'Competition (30%)' })}</span>
                      <div className="text-lg font-black text-stone-900">{opportunityData.components.competition}</div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${opportunityData.components.competition}%` }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">{t('business.reach_weight', { defaultValue: 'Market Reach (15%)' })}</span>
                      <div className="text-lg font-black text-stone-900">{opportunityData.components.marketReach}</div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${opportunityData.components.marketReach}%` }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">{t('business.pricing_weight', { defaultValue: 'Pricing Potential (15%)' })}</span>
                      <div className="text-lg font-black text-stone-900">{opportunityData.components.pricing}</div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${opportunityData.components.pricing}%` }}></div>
                      </div>
                    </div>
                  </div>


                  {/* Deterministic SWOT Analysis 4-Quadrant Grid */}
                  {swotData && (
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                          {t('market.swot_analysis', { defaultValue: 'Deterministic SWOT Analysis' })}
                        </h4>
                        <span className="text-[10px] font-bold text-stone-500">
                          {t('business.swot_grounded', { defaultValue: 'Grounded on Financial Engine & Operational Inputs' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Strengths */}
                        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                          <strong className="text-xs font-black text-emerald-900 uppercase tracking-wide block">
                            {t('business.swot_strengths', { defaultValue: '💪 Strengths' })}
                          </strong>
                          <ul className="space-y-1 text-emerald-950 font-medium list-disc list-inside">
                            {swotData.strengths.map((s, idx) => (
                              <li key={idx} className="leading-relaxed">{localizeSWOTText(s, lang)}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                          <strong className="text-xs font-black text-amber-900 uppercase tracking-wide block">
                            {t('business.swot_weaknesses', { defaultValue: '⚠️ Weaknesses' })}
                          </strong>
                          <ul className="space-y-1 text-amber-950 font-medium list-disc list-inside">
                            {swotData.weaknesses.map((w, idx) => (
                              <li key={idx} className="leading-relaxed">{localizeSWOTText(w, lang)}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                          <strong className="text-xs font-black text-blue-900 uppercase tracking-wide block">
                            {t('business.swot_opportunities', { defaultValue: '🚀 Opportunities' })}
                          </strong>
                          <ul className="space-y-1 text-blue-950 font-medium list-disc list-inside">
                            {swotData.opportunities.map((o, idx) => (
                              <li key={idx} className="leading-relaxed">{localizeSWOTText(o, lang)}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                          <strong className="text-xs font-black text-rose-900 uppercase tracking-wide block">
                            {t('business.swot_threats', { defaultValue: '🛡️ Threats & Risks' })}
                          </strong>
                          <ul className="space-y-1 text-rose-950 font-medium list-disc list-inside">
                            {swotData.threats.map((t, idx) => (
                              <li key={idx} className="leading-relaxed">{localizeSWOTText(t, lang)}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CURATED OPPORTUNITY LIBRARY */}
      {activeTab === 'curated' && (
        <div className="space-y-6">
          
          {/* Mandatory Library Disclaimer Banner */}
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950 leading-relaxed font-medium">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>{t('business.curated_lib_title', { defaultValue: 'Curated Opportunity Library:' })}</strong> {t('business.curated_lib_desc', { defaultValue: 'These are curated opportunities for general exploration and rural cluster benchmarking. Personalized feasibility assessments can be generated in the Tailored Recommendations tab.' })}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600">{t('business.filter_sector', { defaultValue: 'Filter by Sector:' })}</span>
              <select
                value={curatedCategory}
                onChange={(e) => setCuratedCategory(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900"
              >
                <option value="All">{t('business.sector_all', { defaultValue: 'All Rural Sectors' })}</option>
                <option value="Dairy">{t('business.sector_dairy', { defaultValue: 'Dairy & Animal Husbandry' })}</option>
                <option value="Food Processing">{t('business.sector_food', { defaultValue: 'Food Processing' })}</option>
                <option value="Agri Service">{t('business.sector_agri', { defaultValue: 'Agri Service & Hiring' })}</option>
                <option value="Organic">{t('business.sector_organic', { defaultValue: 'Organic & Bio-Inputs' })}</option>
              </select>
            </div>

            <span className="text-xs text-stone-500 font-medium">
              {t('business.showing_curated', { count: filteredCuratedIdeas.length, defaultValue: `Showing ${filteredCuratedIdeas.length} curated opportunities` })}
            </span>
          </div>

          {/* Curated Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCuratedIdeas.map((idea) => {
              const saved = isSaved(idea.id);
              const compared = selectedForCompare.includes(idea.id);

              return (
                <div 
                  key={idea.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                      {lang === 'mr' ? (idea.titleMr || idea.title) : (lang === 'hi' ? (idea.titleHi || idea.title) : idea.title)}
                    </h3>
                    {lang === 'en' && idea.titleMr && (
                      <p className="text-xs text-amber-800/90 font-bold">
                        {idea.titleMr}
                      </p>
                    )}
                    {lang === 'hi' && idea.title && (
                      <p className="text-xs text-amber-800/90 font-bold">
                        {idea.title}
                      </p>
                    )}
                    {lang === 'mr' && idea.title && (
                      <p className="text-xs text-amber-800/90 font-bold">
                        {idea.title}
                      </p>
                    )}
                    <p className="text-xs text-stone-600 font-medium leading-relaxed mt-1.5">
                      {idea.shortDesc}
                    </p>
                  </div>

                  {/* Benchmark Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('business.outlay_range', { defaultValue: 'Outlay Range' })}</span>
                      <strong className="text-stone-900 font-black text-xs block">
                        {formatIndianCurrency(idea.investmentMin)} - {formatIndianCurrency(idea.investmentMax)}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('business.benchmark_margin', { defaultValue: 'Benchmark Margin' })}</span>
                      <strong className="text-emerald-700 font-black text-xs block">
                        {idea.grossMargin}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanIdeaId(idea.id);
                      setCustomCanvasIdea(null);
                      setActiveTab('business-plan');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs flex items-center justify-center transition-all"
                  >
                    <span>{t('business.view_canvas', { defaultValue: 'View in Business Canvas' })}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMPARE IDEAS */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                {t('business.side_by_side', { defaultValue: 'Side-by-Side Idea Comparison' })}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {t('business.evaluating_ventures', { count: selectedForCompare.length, defaultValue: `Evaluating ${selectedForCompare.length} ventures for local feasibility.` })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('curated')}
              className="text-xs font-bold text-[#0b2545] hover:underline"
            >
              {t('business.add_more_compare', { defaultValue: '+ Add more to compare' })}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm overflow-x-auto">
            <div className="min-w-[600px] space-y-4">
              
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-stone-200 text-xs font-black uppercase text-stone-400">
                <div>{t('business.parameter', { defaultValue: 'Parameter' })}</div>
                {selectedForCompare.map(id => {
                  const idea = CURATED_RURAL_IDEAS.find(i => i.id === id);
                  return (
                    <div key={id} className="text-stone-900 font-black text-sm">
                      {lang === 'mr' ? (idea?.titleMr || idea?.title) : idea?.title}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 py-2 border-b border-stone-100 text-xs">
                <div className="font-bold text-stone-500">{t('business.investment_range', { defaultValue: 'Investment Range' })}</div>
                {selectedForCompare.map(id => {
                  const idea = CURATED_RURAL_IDEAS.find(i => i.id === id);
                  return (
                    <div key={id} className="font-black text-[#0b2545]">
                      {formatIndianCurrency(idea?.investmentMin)} - {formatIndianCurrency(idea?.investmentMax)}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 py-2 border-b border-stone-100 text-xs">
                <div className="font-bold text-stone-500">{t('business.benchmark_margin', { defaultValue: 'Benchmark Margin' })}</div>
                {selectedForCompare.map(id => {
                  const idea = CURATED_RURAL_IDEAS.find(i => i.id === id);
                  return (
                    <div key={id} className="font-black text-emerald-700">
                      {idea?.grossMargin}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 py-2 border-b border-stone-100 text-xs">
                <div className="font-bold text-stone-500">{t('business.gestation', { defaultValue: 'Time to First Sale' })}</div>
                {selectedForCompare.map(id => {
                  const idea = CURATED_RURAL_IDEAS.find(i => i.id === id);
                  return (
                    <div key={id} className="font-semibold text-stone-800">
                      {idea?.gestationPeriod}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 py-2 border-b border-stone-100 text-xs">
                <div className="font-bold text-stone-500">{t('business.complexity', { defaultValue: 'Operational Complexity' })}</div>
                {selectedForCompare.map(id => {
                  const idea = CURATED_RURAL_IDEAS.find(i => i.id === id);
                  return (
                    <div key={id} className="font-semibold text-stone-800">
                      {idea?.complexity}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 py-2 border-b border-stone-100 text-xs">
                <div className="font-bold text-stone-500">{t('business.matched_schemes', { defaultValue: 'Matched Schemes' })}</div>
                {selectedForCompare.map(id => {
                  const idea = CURATED_RURAL_IDEAS.find(i => i.id === id);
                  return (
                    <div key={id} className="space-y-0.5">
                      {idea?.recommendedSchemes.map((s, idx) => (
                        <span key={idx} className="block text-[11px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 pt-2 text-xs">
                <div></div>
                {selectedForCompare.map(id => (
                  <div key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanIdeaId(id);
                        setCustomCanvasIdea(null);
                        setActiveTab('business-plan');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all shadow-xs"
                    >
                      {t('business.select_and_plan', { defaultValue: 'Select & Plan →' })}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 1-PAGE BUSINESS PLAN CANVAS */}
      {activeTab === 'business-plan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                {t('business.canvas_title', { title: (lang === 'mr' && selectedPlanIdea.titleMr) ? selectedPlanIdea.titleMr : selectedPlanIdea.title, defaultValue: `1-Page Rural Business Canvas: ${selectedPlanIdea.title}` })}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {selectedPlanIdea.source === 'ai_ml_engine' ? t('business.tailored_blueprint_desc', { defaultValue: 'Tailored Blueprint evaluated against Maharashtra district benchmarks.' }) : t('business.curated_blueprint_desc', { defaultValue: 'Curated MSME Blueprint for local bank manager and DIC review.' })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Printer size={14} />
                <span>{t('business.print_pdf', { defaultValue: 'Print / Save PDF' })}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('/market/local-demand');
                }}
                className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>{t('business.proceed_market_btn', { defaultValue: 'Proceed to Step 2: Market' })}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Top Overview */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  {t('business.target_overview', { defaultValue: 'Target Enterprise Overview' })} {selectedPlanIdea.source === 'ai_ml_engine' ? `• ${t('business.tailored_plan', { defaultValue: 'Tailored Plan' })}` : ''}
                </span>
                <h3 className="text-lg font-black text-stone-900">{(lang === 'mr' && selectedPlanIdea.titleMr) ? selectedPlanIdea.titleMr : selectedPlanIdea.title}</h3>
                <p className="text-xs text-stone-600 font-medium">{selectedPlanIdea.shortDesc}</p>
              </div>
              <div className="flex items-center gap-4 text-xs shrink-0">
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold uppercase">{t('business.estimated_outlay', { defaultValue: 'Estimated Outlay' })}</span>
                  <strong className="text-stone-900 font-black text-sm">
                    {formatIndianCurrency(selectedPlanIdea.investmentMin || budget)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold uppercase">{t('business.target_location', { defaultValue: 'Target Location' })}</span>
                  <strong className="text-stone-900 font-black text-sm">{district}, MH</strong>
                </div>
              </div>
            </div>

            {/* 6 Canvas Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">{t('business.canvas_prop_title', { defaultValue: '1. Value Proposition' })}</span>
                <strong className="text-stone-900 font-bold block">{t('business.canvas_prop_head', { defaultValue: 'Direct value-addition at farm gate' })}</strong>
                <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                  {t('business.canvas_prop_body', { defaultValue: 'Eliminates wholesale intermediaries and retains 25%-35% manufacturing margin inside village.' })}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">{t('business.canvas_cust_title', { defaultValue: '2. Target Customers' })}</span>
                <strong className="text-stone-900 font-bold block">{t('business.canvas_cust_head', { defaultValue: 'Local sweet marts & weekly mandis' })}</strong>
                <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                  {t('business.canvas_cust_body', { defaultValue: 'Semi-urban retailers within a 25km radius requiring fresh daily dispatch without stockouts.' })}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">{t('business.canvas_cap_title', { defaultValue: '3. Capital Requirement' })}</span>
                <strong className="text-stone-900 font-bold block">
                  {formatIndianCurrency(selectedPlanIdea.investmentMin || budget)} {t('business.initial_outlay', { defaultValue: 'Initial Outlay' })}
                </strong>
                <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                  {t('business.canvas_cap_body', { defaultValue: 'Machinery (60%), working capital buffer (25%), shed electrification & licensing (15%).' })}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">{t('business.canvas_mat_title', { defaultValue: '4. Key Raw Materials' })}</span>
                <strong className="text-stone-900 font-bold block">{t('business.canvas_mat_head', { defaultValue: 'Locally aggregated village produce' })}</strong>
                <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                  {t('business.canvas_mat_body', { defaultValue: 'Farmer cooperative contracts ensuring stable supply and moisture/quality standards.' })}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">{t('business.canvas_gov_title', { defaultValue: '5. Government Support' })}</span>
                <strong className="text-stone-900 font-bold block">{t('business.canvas_gov_head', { defaultValue: 'CMEGP / PMFME Subsidy' })}</strong>
                <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                  {t('business.canvas_gov_body', { defaultValue: 'Eligible for 35% capital incentive up to ₹10 Lakhs, reducing bank loan exposure.' })}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-stone-400 block">{t('business.canvas_next_title', { defaultValue: '6. Key Next Milestone' })}</span>
                <strong className="text-stone-900 font-bold block">{t('business.canvas_next_head', { defaultValue: 'Market validation checklist' })}</strong>
                <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                  {t('business.canvas_next_body', { defaultValue: 'Confirm prices with 5 local vendors and inspect nearby competitor capacity in Step 2.' })}
                </p>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-stone-500 font-medium">
                {t('business.next_stage_desc', { district, defaultValue: `Next Stage: Verify local customer demand and competitor price points in ${district}.` })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('/finance/project-cost');
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-800 hover:bg-stone-50 font-bold text-xs"
                >
                  {t('business.structure_finances_btn', { defaultValue: 'Structure Finances' })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('/market/local-demand');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>{t('business.validate_market_btn', { defaultValue: 'Validate Market (Step 2)' })}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
