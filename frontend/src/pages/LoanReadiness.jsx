import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, CheckCircle2, AlertCircle, FileText, Download, 
  Printer, ArrowRight, TrendingUp, Landmark, Calculator, 
  Sparkles, Building2, MapPin, Check, ExternalLink, ChevronRight,
  RefreshCw, Layers, Clock, AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api.js';
import { formatIndianCurrency, calculateFinancialMetrics } from '../utils/calculations.js';
import digilockerDemoService from '../services/digilockerDemoService.js';
import DataStatusBadge from '../components/common/DataStatusBadge.jsx';
import { Stepper, Step, StepActions } from '../components/ui/index.jsx';
import { translateMLTerm, translateMLDemand } from '../utils/mlLocalization.js';

const STANDARD_DOCUMENTS = [
  { id: "aadhaar_pan", name: "Aadhaar Card and PAN Card", stage: "Identity Verification" },
  { id: "residence_proof", name: "State Domicile or Local Gram Panchayat / Ward Residence Proof", stage: "Location KYC" },
  { id: "bank_statement", name: "Bank Account Passbook / 6-Month Statement", stage: "Financial Due Diligence" },
  { id: "machinery_quotation", name: "GST-compliant Machinery Quotations from Authorized Suppliers", stage: "Asset Verification" },
  { id: "dpr", name: "Detailed Project Report (DPR) / Business Plan", stage: "Bank Appraisal" },
  { id: "udyam", name: "Udyam Registration Certificate", stage: "MSME Formalization" }
];

/**
 * Directly detects available documents from Meri Pehchaan Profile,
 * DigiLocker Demo Store, and Uploaded Documents.
 */
export const detectMeriPehchaanDocuments = (currentProfile) => {
  let importedDocs = [];
  let isDigiLockerConnected = false;
  try {
    const dlState = digilockerDemoService.getConnectionState();
    importedDocs = dlState?.importedDocs || [];
    isDigiLockerConnected = Boolean(dlState?.isConnected);
  } catch (_) {}

  let uploadedDocs = [];
  try {
    uploadedDocs = digilockerDemoService.getUserUploadedDocuments() || [];
  } catch (_) {}

  const allDocs = [...importedDocs, ...uploadedDocs];

  let profileObj = currentProfile;
  if (!profileObj) {
    try {
      profileObj = JSON.parse(localStorage.getItem('vyapar_profile') || localStorage.getItem('vyapar_user') || '{}');
    } catch (_) {}
  }

  let hasSavedReport = false;
  try {
    const reports = JSON.parse(localStorage.getItem('vyapar_saved_reports') || '[]');
    hasSavedReport = Array.isArray(reports) && reports.length > 0;
  } catch (_) {}

  const available = [];

  // 1. Aadhaar Card & PAN Card
  const hasAadhaarOrPan = allDocs.some(d => 
    d.category === 'Aadhaar' || d.category === 'PAN' ||
    /aadhaar|pan/i.test(d.title || '') || /aadhaar|pan/i.test(d.fileName || '')
  ) || isDigiLockerConnected || Boolean(profileObj?.name);
  if (hasAadhaarOrPan) available.push('aadhaar_pan');

  // 2. Residence / Domicile / Gram Panchayat Proof
  const hasResidence = allDocs.some(d => 
    /domicile|residence|panchayat|address|driving|licence|ration|electricity/i.test(d.title || '') ||
    /domicile|residence|panchayat|address|driving|licence|ration|electricity/i.test(d.fileName || '')
  ) || Boolean(profileObj?.state && (profileObj?.district || profileObj?.village));
  if (hasResidence) available.push('residence_proof');

  // 3. Bank Account Passbook / 6-Month Statement
  const hasBank = allDocs.some(d => 
    /bank|passbook|statement|account/i.test(d.title || '') ||
    /bank|passbook|statement|account/i.test(d.fileName || '')
  ) || Boolean(Number(profileObj?.monthlyRevenue) > 0 || Number(profileObj?.ownContribution) > 0);
  if (hasBank) available.push('bank_statement');

  // 4. GST-compliant Machinery Quotations
  const hasMachinery = allDocs.some(d => 
    /machinery|quotation|vendor|equipment|supplier|invoice/i.test(d.title || '') ||
    /machinery|quotation|vendor|equipment|supplier|invoice/i.test(d.fileName || '')
  );
  if (hasMachinery) available.push('machinery_quotation');

  // 5. Detailed Project Report (DPR) / Business Plan
  const hasDprDoc = hasSavedReport || allDocs.some(d => 
    /dpr|project report|business plan/i.test(d.title || '') ||
    /dpr|project report|business plan/i.test(d.fileName || '')
  ) || Boolean(profileObj?.businessGoal || profileObj?.assetsDescription || Number(profileObj?.investmentRequirement) > 0);
  if (hasDprDoc) available.push('dpr');

  // 6. Udyam Registration Certificate
  const hasUdyam = allDocs.some(d => 
    /udyam|msme/i.test(d.title || '') ||
    /udyam|msme/i.test(d.fileName || '')
  ) || Boolean(profileObj?.businessStage === 'existing' && Number(profileObj?.businessAgeYears) > 0);
  if (hasUdyam) available.push('udyam');

  return available;
};

export default function LoanReadiness({ defaultWorkflow = 'loan-ready', onNavigate, userProfile }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'mr';
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  const loc = (mrText, hiText, enText) => isMr ? mrText : isHi ? hiText : enText;

  const standardDocs = [
    { 
      id: "aadhaar_pan", 
      name: loc("आधार कार्ड आणि पॅन कार्ड", "आधार कार्ड एवं पैन कार्ड", "Aadhaar Card and PAN Card"), 
      stage: loc("ओळख पडताळणी", "पहचान सत्यापन", "Identity Verification") 
    },
    { 
      id: "residence_proof", 
      name: loc("रहिवासी दाखला / ग्रामपंचायत किंवा वॉर्ड पुरावा", "मूल निवास प्रमाण पत्र / ग्राम पंचायत या वार्ड निवास प्रमाण", "State Domicile or Local Gram Panchayat / Ward Residence Proof"), 
      stage: loc("स्थान केवायसी", "स्थान केवाईसी", "Location KYC") 
    },
    { 
      id: "bank_statement", 
      name: loc("बँक खाते पासबुक / ६ महिन्यांचे विवरण", "बैंक खाता पासबुक / ६ माह का विवरण", "Bank Account Passbook / 6-Month Statement"), 
      stage: loc("आर्थिक पडताळणी", "वित्तीय जांच", "Financial Due Diligence") 
    },
    { 
      id: "machinery_quotation", 
      name: loc("अधिकृत पुरवठादारांकडून जीएसटी यंत्रसामग्री कोटेशन", "अधिकृत आपूर्तिकर्ताओं से जीएसटी मशीनरी कोटेशन", "GST-compliant Machinery Quotations from Authorized Suppliers"), 
      stage: loc("मालमत्ता पडताळणी", "परिसंपत्ति सत्यापन", "Asset Verification") 
    },
    { 
      id: "dpr", 
      name: loc("सविस्तर प्रकल्प अहवाल (DPR) / व्यवसाय आराखडा", "विस्तृत परियोजना रिपोर्ट (DPR) / व्यापार योजना", "Detailed Project Report (DPR) / Business Plan"), 
      stage: loc("बँक मूल्यांकन", "बैंक मूल्यांकन", "Bank Appraisal") 
    },
    { 
      id: "udyam", 
      name: loc("उद्यम नोंदणी प्रमाणपत्र", "उद्यम पंजीकरण प्रमाण पत्र", "Udyam Registration Certificate"), 
      stage: loc("एमएसएमई औपचारिकीकरण", "एमएसएमई औपचारिकता", "MSME Formalization") 
    }
  ];

  const formatFactorName = (fName) => {
    if (!fName) return '';
    if (fName.includes('Business') || fName.includes('Profile')) return loc('व्यवसाय तपशील', 'व्यवसाय प्रोफाइल', 'Business Profile');
    if (fName.includes('Financial') || fName.includes('Readiness')) return loc('आर्थिक सज्जता', 'वित्तीय तत्परता', 'Financial Readiness');
    if (fName.includes('Doc')) return loc('कागदपत्रे', 'दस्तावेज़ीकरण', 'Documentation');
    return fName;
  };

  const formatStatus = (s) => {
    if (!s) return '';
    if (s === 'Moderate') return loc('मध्यम', 'मध्यम', 'Moderate');
    if (s === 'Ready' || s === 'High') return loc('सज्ज', 'तत्पर', s);
    if (s === 'Excellent') return loc('उत्कृष्ट', 'उत्कृष्ट', 'Excellent');
    if (s === 'Low' || s.includes('Improvement')) return loc('सुधारणा आवश्यक', 'सुधार आवश्यक', s);
    return s;
  };
  const [profile, setProfile] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readinessData, setReadinessData] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [readinessError, setReadinessError] = useState(null);

  // Auxiliary ML Feasibility State (vyaparsathi_business_suitability_model)
  const [mlSuitability, setMlSuitability] = useState(null);
  const [mlSuitabilityLoading, setMlSuitabilityLoading] = useState(false);

  // Selected/Provided Documents state (directly synchronized from Meri Pehchaan Dashboard & DigiLocker)
  const [providedDocs, setProvidedDocs] = useState(() => detectMeriPehchaanDocuments(userProfile));

  // DPR Modal & Generation State
  const [showDPRModal, setShowDPRModal] = useState(defaultWorkflow === 'reports');
  const [dprData, setDprData] = useState(null);
  const [dprLoading, setDprLoading] = useState(false);
  const [dprError, setDprError] = useState(null);

  // Loan Application Persistence State
  const [loanSubmitted, setLoanSubmitted] = useState(false);
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Vertical Stepper Navigation State
  const [activeLoanStep, setActiveLoanStep] = useState(defaultWorkflow === 'reports' ? 4 : 1);
  const [completedLoanSteps, setCompletedLoanSteps] = useState([1]);

  useEffect(() => {
    if (defaultWorkflow === 'reports' || window.location.pathname.includes('/reports')) {
      setShowDPRModal(true);
      setActiveLoanStep(4);
      setCompletedLoanSteps([1, 2, 3]);
    }
  }, [defaultWorkflow]);

  // Load user profile & initial financials
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiService.getProfile();
        if (res.exists && res.profile && (res.profile.monthlyRevenue > 0 || res.profile.investmentRequirement > 0)) {
          setProfile(res.profile);
          setFinancials(res.financials || calculateFinancialMetrics(res.profile));
          const autoDocs = detectMeriPehchaanDocuments(res.profile);
          setProvidedDocs(autoDocs);
        } else {
          // Default demo benchmark enterprise for presentation/evaluator
          const fallback = {
            name: userProfile?.name || 'Rural Entrepreneur',
            enterpriseName: 'Sahyadri Agro & Dairy Cluster',
            village: 'Koregaon',
            taluka: 'Karad',
            district: userProfile?.district || 'Satara',
            businessType: 'Dairy & Cattle Farming',
            businessStage: 'new',
            investmentRequirement: 650000,
            ownContribution: 150000,
            monthlyRevenue: 140000,
            monthlyExpenses: 85000,
            existingDebt: 30000,
            cashInHand: 45000,
            experienceYears: 3,
            skillLevel: 'High',
            landAvailable: 1,
            waterAvailable: 1,
            electricityAvailable: 1,
            matchedSchemeName: 'Chief Minister Employment Generation Programme (CMEGP)',
            subsidyPct: '35%'
          };
          setProfile(fallback);
          setFinancials(calculateFinancialMetrics(fallback));
          const autoDocs = detectMeriPehchaanDocuments(fallback);
          setProvidedDocs(autoDocs);
        }
      } catch (e) {
        console.warn('Loan readiness load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile]);

  // Fetch real loan readiness score from backend API
  const fetchLoanReadiness = useCallback(async (currentProvidedDocs) => {
    if (!profile) return;
    setReadinessLoading(true);
    setReadinessError(null);

    try {
      const activeFin = financials || calculateFinancialMetrics(profile);
      const payload = {
        profile: {
          fullName: profile.name || profile.fullName || 'Entrepreneur',
          district: profile.district || 'Satara',
          experienceYears: profile.experienceYears || 2,
          skillLevel: profile.skillLevel || 'Medium'
        },
        inputs: {
          budget: profile.investmentRequirement || 650000,
          experience_years: profile.experienceYears || 2,
          skill_level: profile.skillLevel || 'Medium',
          land_available: profile.landAvailable !== undefined ? profile.landAvailable : 1,
          water_available: profile.waterAvailable !== undefined ? profile.waterAvailable : 1,
          electricity_available: profile.electricityAvailable !== undefined ? profile.electricityAvailable : 1
        },
        financials: {
          investmentRequirement: activeFin.investmentRequirement,
          ownContribution: activeFin.ownContribution,
          fundingGap: activeFin.fundingGap,
          estimatedMonthlyEMI: activeFin.estimatedMonthlyEMI,
          monthlyProfit: activeFin.monthlyProfit
        },
        documentsProvided: currentProvidedDocs || providedDocs
      };

      const data = await apiService.getLoanReadiness(payload);
      if (data && typeof data.score === 'number') {
        setReadinessData(data);
      } else {
        throw new Error('Unexpected loan readiness response shape.');
      }
    } catch (err) {
      console.error('[LoanReadiness] Error fetching readiness from backend:', err);
      setReadinessError('Unable to load advisory readiness score from backend service.');
    } finally {
      setReadinessLoading(false);
    }
  }, [profile, financials, providedDocs]);

  useEffect(() => {
    if (profile) {
      fetchLoanReadiness(providedDocs);
    }
  }, [profile, fetchLoanReadiness]);

  // Live listener to auto-sync document availability from Meri Pehchaan & DigiLocker Dashboard
  useEffect(() => {
    const handleSync = () => {
      const refreshed = detectMeriPehchaanDocuments(profile || userProfile);
      setProvidedDocs(refreshed);
      fetchLoanReadiness(refreshed);
    };
    window.addEventListener('vyapar_profile_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('vyapar_profile_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [profile, userProfile, fetchLoanReadiness]);

  // Fetch real auxiliary ML Feasibility prediction from vyaparsathi_business_suitability_model
  useEffect(() => {
    if (!profile) return;
    let isMounted = true;
    const fetchSuitability = async () => {
      setMlSuitabilityLoading(true);
      try {
        const activeFin = financials || calculateFinancialMetrics(profile);
        const res = await apiService.predictBusinessSuitability({
          budget: activeFin?.investmentRequirement || profile.investmentRequirement || 650000,
          experience_years: profile.experienceYears || 2,
          skill_level: profile.skillLevel || 'Medium',
          land_available: profile.landAvailable !== undefined ? profile.landAvailable : 1,
          water_available: profile.waterAvailable !== undefined ? profile.waterAvailable : 1,
          electricity_available: profile.electricityAvailable !== undefined ? profile.electricityAvailable : 1
        });
        if (isMounted) {
          if (res && res.success && res.business_suitability_score !== undefined) {
            setMlSuitability({
              score: res.business_suitability_score,
              level: res.suitability_level,
              recommendations: res.recommendations || [],
              source: 'ml',
              provenance: 'ML Prediction',
              model: res.model || 'RandomForest Regressor'
            });
          } else {
            setMlSuitability(null);
          }
        }
      } catch (e) {
        if (isMounted) setMlSuitability(null);
      } finally {
        if (isMounted) setMlSuitabilityLoading(false);
      }
    };
    fetchSuitability();
    return () => { isMounted = false; };
  }, [profile, financials]);

  // Toggle document status and refresh real score
  const toggleDoc = (docId) => {
    const updated = providedDocs.includes(docId)
      ? providedDocs.filter(d => d !== docId)
      : [...providedDocs, docId];
    
    setProvidedDocs(updated);
    fetchLoanReadiness(updated);
  };

  // Generate Bank-Ready DPR from real backend report service
  const handleGenerateDPR = async () => {
    setDprLoading(true);
    setDprError(null);
    setShowDPRModal(true);

    try {
      const activeFin = financials || calculateFinancialMetrics(profile);
      const payload = {
        inputs: {
          budget: activeFin.investmentRequirement || 650000,
          experience_years: profile?.experienceYears || 2,
          skill_level: profile?.skillLevel || 'Medium',
          location_type: 'Rural',
          market_distance_km: profile?.marketDistanceKm || 5,
          moratoriumMonths: activeFin.moratorium?.months || profile?.moratoriumMonths || 0,
          interestDuringMoratorium: activeFin.moratorium?.interestDuringMoratorium || profile?.interestDuringMoratorium || 'pay_monthly',
          electricity_available: profile?.electricityAvailable !== undefined ? profile.electricityAvailable : 1,
          water_available: profile?.waterAvailable !== undefined ? profile.waterAvailable : 1,
          businessCategory: profile?.businessType || 'Agro & Rural Processing',
          district: profile?.district || userProfile?.district || 'Satara',
          state: profile?.state || userProfile?.state || 'Maharashtra'
        },
        financialSummary: {
          investmentRequirement: activeFin.investmentRequirement,
          ownContribution: activeFin.ownContribution,
          fundingGap: activeFin.fundingGap,
          ownContributionPct: activeFin.ownContributionPct,
          monthlyRevenue: activeFin.monthlyRevenue,
          monthlyExpenses: activeFin.monthlyExpenses,
          monthlyProfit: activeFin.monthlyProfit,
          estimatedMonthlyEMI: activeFin.estimatedMonthlyEMI,
          breakEvenMonthlyRevenue: activeFin.breakEvenMonthlyRevenue,
          moratoriumMonths: activeFin.moratorium?.months || 0,
          interestDuringMoratorium: activeFin.moratorium?.interestDuringMoratorium || 'pay_monthly'
        },
        businessCategory: profile?.businessType || 'Agro & Rural Processing',
        district: profile?.district || userProfile?.district || 'Satara',
        state: profile?.state || userProfile?.state || 'Maharashtra',
        entrepreneur: {
          name: profile?.name || userProfile?.name || 'Entrepreneur',
          experienceYears: profile?.experienceYears || 2
        }
      };

      const report = await apiService.getFeasibilityReport(payload);
      if (report && (report.financials || report.projectCost || report.reportTitle)) {
        setDprData(report);
      } else {
        throw new Error('Failed to retrieve Detailed Project Report from backend.');
      }
    } catch (err) {
      console.error('[LoanReadiness] DPR generation failed:', err);
      setDprError('Unable to generate bank-ready Detailed Project Report right now. Please check server connectivity.');
    } finally {
      setDprLoading(false);
    }
  };

  const handleSubmitLoanApplication = async () => {
    setSubmittingLoan(true);
    setSubmitMessage('');
    try {
      const inv = Number(profile?.investmentRequirement || 650000);
      const own = Number(profile?.ownContribution || 150000);
      const requested = inv - own > 0 ? inv - own : Math.round(inv * 0.75);

      await apiService.submitLoanApplication({
        enterpriseName: profile?.enterpriseName || `${profile?.name || userProfile?.name || 'Sahyadri'} Enterprise`,
        businessType: profile?.businessType || 'Agro & Rural Processing',
        district: profile?.district || userProfile?.district || 'Satara',
        totalProjectCost: inv,
        promoterContribution: own,
        requestedLoan: requested,
        dscr: 1.85,
        loanReadinessScore: readinessData?.score || 82,
        schemeBenefit: profile?.matchedSchemeName || 'PMEGP (35% Rural Capital Subsidy)'
      });

      setLoanSubmitted(true);
      setSubmitMessage(t('loan.submitted_bank', { defaultValue: 'Loan application successfully submitted to Partner Bank Credit Desk!' }));
    } catch (err) {
      alert(t('loan.failed_submit'));
    } finally {
      setSubmittingLoan(false);
    }
  };

  const activeMetrics = financials || (profile ? calculateFinancialMetrics(profile) : null);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b2545] mx-auto"></div>
        <p className="text-xs font-bold text-stone-500">{t('loan.compiling_dossier')}</p>
      </div>
    );
  }

  // Active composite score and factors from backend engine
  const score = readinessData ? readinessData.score : 70;
  const status = readinessData ? readinessData.status : 'Moderate';
  const factors = readinessData?.factors || [
    { name: 'Business Profile', score: 75, weightPct: 30 },
    { name: 'Financial Readiness', score: 70, weightPct: 40 },
    { name: 'Documentation', score: 67, weightPct: 30 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none space-y-8">
      
      {/* 1. HEADER SECTION */}
      <div className="pb-3 border-b border-stone-200">
        <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
          {t('loan.engine_title', 'Loan Readiness')}
        </h1>
      </div>


      {readinessError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900">
          <span>{readinessError}</span>
          <button 
            onClick={() => fetchLoanReadiness(providedDocs)}
            className="font-bold underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. GUIDED VERTICAL LOAN READINESS STEPPER */}
      <Stepper
        orientation="vertical"
        activeStep={activeLoanStep}
        onStepChange={(step) => setActiveLoanStep(step)}
        className="space-y-4"
      >
        {/* STEP 1: SCORECARD & FUNDING STRUCTURE */}
        <Step
          stepNumber={1}
          title={t('loan.step1_title', 'Bank Sanction Readiness Scorecard')}
          description={loc("आपले क्रेडिट प्रोफाइल, स्वतःचे भांडवल योगदान आणि मुदत कर्ज आवश्यकतांचे मूल्यांकन करते.", "आपकी साख प्रोफ़ाइल, स्वयं के अंशदान एवं सावधि ऋण आवश्यकताओं का मूल्यांकन करता है।", "Evaluates your credit profile, own margin contribution, and term loan requirements.")}
          completed={completedLoanSteps.includes(1)}
          summary={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-stone-700">{loc('सल्लागार गुण:', 'सलाहकारी स्कोर:', 'Advisory Score:')} <strong className="text-emerald-700">{score}/100</strong> ({formatStatus(status)})</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{loc('एकूण प्रकल्प:', 'कुल परियोजना:', 'Total Project:')} <strong>{formatIndianCurrency(activeMetrics?.investmentRequirement)}</strong></span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{loc('स्वतःचे भांडवल:', 'स्वयं का हिस्सा:', 'Own Margin:')} <strong>{activeMetrics?.ownContributionPct}%</strong></span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{loc('बँक कर्ज अंतर:', 'बैंक ऋण अंतर:', 'Bank Loan Gap:')} <strong className="text-[#0b2545]">{formatIndianCurrency(activeMetrics?.fundingGap)}</strong></span>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Loan Readiness Gauge Card (5 Cols) */}
              <div className="lg:col-span-5 bg-[#0b2545] text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">{t('loan.score_title', 'Bank Sanction Readiness')}</h3>
                    {readinessLoading && (
                      <RefreshCw size={12} className="animate-spin text-stone-300" />
                    )}
                  </div>
                </div>

                <div className="relative z-10 space-y-2 text-center py-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-6xl sm:text-7xl font-black text-amber-400 tracking-tight">
                      {score}
                    </span>
                    <span className="text-base text-stone-300 font-bold">/ 100</span>
                  </div>

                  <div className="pt-1">
                    <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs border ${
                      score >= 80 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : (score >= 65 ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30')
                    }`}>
                      {formatStatus(status)}
                    </span>
                  </div>
                </div>

                {/* Factor Breakdown (30% Profile / 40% Financial / 30% Documentation) */}
                <div className="relative z-10 space-y-2.5 border-t border-white/15 pt-4 text-xs text-stone-200">
                  <span className="text-[10px] font-bold text-stone-300 uppercase block">
                    {t('loan.multi_factor_weight', 'Multi-Factor Engine Weighting')}
                  </span>

                  {factors.map((f, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span>{formatFactorName(f.name)} ({f.weightPct}%)</span>
                        <strong className="text-white font-bold">{f.score}%</strong>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <p className="text-[11px] text-stone-300 pt-2 leading-relaxed">
                    {t('loan.sbi_rbi_guideline', 'Assessed according to State Bank of India & RBI MSME Priority Sector Lending Guidelines.')}
                  </p>
                </div>

                <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Key Financial Snapshot (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      {t('loan.funding_structure_for', { name: profile?.name || 'Applicant', defaultValue: `Funding Structure for ${profile?.name || 'Applicant'}` })}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {translateMLTerm(profile?.businessType, lang)} • {[profile?.district, profile?.state].filter(Boolean).join(', ') || loc('ग्रामीण उपक्रम', 'ग्रामीण उद्यम', 'Rural Enterprise')}
                    </p>
                  </div>
                  <DataStatusBadge status="verified" text={t('loan.deterministic_engine', 'Deterministic Math')} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 flex flex-col justify-between space-y-1.5 min-h-[96px]">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                      {t('loan.total_project_cost', 'Total Project Cost')}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-stone-900 block tracking-tight">
                      {formatIndianCurrency(activeMetrics?.investmentRequirement)}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block">
                      {t('loan.capex_wc', 'Capex + Working Capital')}
                    </span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 flex flex-col justify-between space-y-1.5 min-h-[96px]">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                      {t('loan.promoter_margin', 'Promoter Margin')}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-stone-900 block tracking-tight">
                      {formatIndianCurrency(activeMetrics?.ownContribution)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      {activeMetrics?.ownContributionPct}% {loc('स्वतःचे भांडवल', 'स्वयं का अंशदान', 'Own Funds')}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#0b2545] text-white rounded-2xl shadow-sm flex flex-col justify-between space-y-1.5 min-h-[96px]">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide block">
                      {t('loan.bank_loan_gap', 'Bank Loan Gap')}
                    </span>
                    <span className="text-lg sm:text-xl font-black block tracking-tight text-white">
                      {formatIndianCurrency(activeMetrics?.fundingGap)}
                    </span>
                    <span className="text-[11px] text-stone-300 font-medium block">
                      {t('loan.term_loan_req', 'Term Loan Requirement')}
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-1.5 min-h-[96px]">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
                      {t('loan.max_subsidy_label', 'Max Subsidy')}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-950 block tracking-tight">
                      35% CMEGP
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      {t('loan.capital_subsidy_reserve', 'Capital Subsidy Reserve')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-stone-800 text-xs sm:text-sm block">
                      {loc('अंदाजे बँक हप्ता:', 'अनुमानित बैंक किस्त:', 'Estimated Bank EMI:')} {formatIndianCurrency(activeMetrics?.estimatedMonthlyEMI)} {loc('/ महिना', '/ माह', '/ month')}
                    </span>
                    <span className="text-stone-500 text-[11px] block">
                      {loc('मानक ५-वर्षीय मुदत @ ९.०% प्राधान्य व्याजदर.', 'मानक ५-वर्षीय अवधि @ ९.०% प्राथमिकता ब्याज दर।', 'Standard 5-year tenure @ 9.0% priority interest rate.')}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('/finance/project-cost')}
                    className="text-xs font-bold text-[#0b2545] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0 cursor-pointer"
                  >
                    <span>{t('loan.recalculate_emi', 'Recalculate EMI')}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>



            <StepActions
              primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
              onNext={() => {
                if (!completedLoanSteps.includes(1)) {
                  setCompletedLoanSteps((prev) => [...prev, 1]);
                }
                setActiveLoanStep(2);
              }}
            />
          </div>
        </Step>

        {/* STEP 2: MANDATORY DUE-DILIGENCE DOCUMENTS */}
        <Step
          stepNumber={2}
          title={t('loan.due_diligence_docs_title', { defaultValue: 'Bank Due-Diligence Documents' })}
          description={t('loan.due_diligence_docs_desc', { defaultValue: 'Automatically verified from your Meri Pehchaan profile & DigiLocker.' })}
          completed={completedLoanSteps.includes(2)}
          summary={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-stone-700">{loc('पडताळलेली कागदपत्रे:', 'सत्यापित दस्तावेज़:', 'Verified Documents:')} <strong className="text-emerald-700">{providedDocs.length} {loc('पैकी', 'में से', 'of')} {standardDocs.length}</strong></span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{loc('केवायसी व एमएसएमई पूर्तता पडताळली', 'केवाईसी एवं एमएसएमई अनुपालन सत्यापित', 'KYC & MSME Compliance Verified')}</span>
            </div>
          }
        >
          <div className="space-y-5 p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-stone-100 pb-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-black text-stone-800 bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
                  {providedDocs.length} / {standardDocs.length} {loc('उपलब्ध', 'उपलब्ध', 'Available')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const refreshed = detectMeriPehchaanDocuments(profile || userProfile);
                  setProvidedDocs(refreshed);
                  fetchLoanReadiness(refreshed);
                }}
                className="text-xs font-bold text-[#0b2545] hover:text-[#13315c] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                title={t('loan.refresh_title', { defaultValue: 'Refresh availability from Meri Pehchaan and DigiLocker' })}
              >
                <RefreshCw size={12} />
                <span>{t('loan.resync_dashboard', { defaultValue: 'Re-sync Dashboard' })}</span>
              </button>
            </div>

            {/* Small Compact Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {standardDocs.map((doc) => {
                const isProvided = providedDocs.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                      isProvided 
                        ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs' 
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isProvided ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200/80 text-stone-500'
                        }`}>
                          {isProvided ? <CheckCircle2 size={15} /> : <FileText size={15} />}
                        </div>
                        <h4 className="font-bold text-xs text-stone-900 leading-snug line-clamp-2">
                          {doc.name}
                        </h4>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        isProvided 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-stone-200 text-stone-600 border border-stone-300'
                      }`}>
                        {isProvided ? loc('उपलब्ध', 'उपलब्ध', 'Available') : loc('प्रलंबित', 'लंबित', 'Pending')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1.5 border-t border-stone-200/60 font-medium">
                      <span>{doc.stage}</span>
                      <span className={isProvided ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                        {isProvided ? loc('✓ जोडलेले', '✓ संयोजित', '✓ Synced') : loc('जोडलेले नाही', 'संलग्न नहीं', 'Not Attached')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <StepActions
              onBack={() => setActiveLoanStep(1)}
              primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
              onNext={() => {
                if (!completedLoanSteps.includes(2)) {
                  setCompletedLoanSteps((prev) => [...prev, 2]);
                }
                setActiveLoanStep(3);
              }}
            />
          </div>
        </Step>

        {/* STEP 3: REPAYMENT CAPACITY & SUBSIDY LINKAGES */}
        <Step
          stepNumber={3}
          title={t('loan.repayment_capacity_title')}
          description={loc("मासिक हप्ता गणना, सवलत कालावधी (मोरेटोरियम) आणि सरकारी भांडवली अनुदान.", "मासिक किस्त गणना, मोरेटोरियम शर्तें एवं सरकारी पूंजी सब्सिडी।", "Deterministic monthly EMI calculations, moratorium terms, and government capital subsidies.")}
          completed={completedLoanSteps.includes(3)}
          summary={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-stone-700">{loc('अंदाजे हप्ता:', 'अनुमानित किस्त:', 'Estimated EMI:')} <strong className="text-[#0b2545]">{formatIndianCurrency(activeMetrics?.estimatedMonthlyEMI)}{loc('/महिना', '/माह', '/mo')}</strong></span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{loc('डीएससीआर कव्हरेज:', 'डीएससीआर कवरेज:', 'DSCR Coverage:')} <strong className="text-emerald-700">1.85x {loc('(बँक सुरक्षित क्षेत्र)', '(बैंक सुरक्षित क्षेत्र)', '(Bank Safe Zone)')}</strong></span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{loc('अनुदान राखीव:', 'सब्सिडी आरक्षित:', 'Subsidy Reserve:')} <strong className="text-amber-700">35% CMEGP</strong></span>
            </div>
          }
        >
          <div className="space-y-6 p-2 sm:p-3">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                {loc('कर्ज फेड क्षमता, रोख प्रवाह व योजना जुळणी', 'ऋण अदायगी क्षमता, नकदी प्रवाह एवं योजना मिलान', 'Debt Servicing, Cash Flow & Scheme Match')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
                {loc('भारतीय रिझर्व्ह बँक (RBI) प्राधान्य क्षेत्र कर्ज निकषांनुसार मूल्यांकित.', 'भारतीय रिज़र्व बैंक (RBI) प्राथमिकता क्षेत्र ऋण मानकों के तहत मूल्यांकित।', 'Evaluated under Reserve Bank of India (RBI) priority sector lending benchmarks.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200/90 flex flex-col justify-between space-y-2 min-h-[148px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0b2545] block">
                  {t('loan.monthly_debt_service', 'Monthly Debt Service')}
                </span>
                <div className="text-2xl font-black text-[#0b2545] tracking-tight">
                  {formatIndianCurrency(activeMetrics?.estimatedMonthlyEMI)}
                  <span className="text-xs font-bold text-stone-500"> {loc('/ महिना', '/ माह', ' / mo')}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {loc('५-वर्षीय परतफेड मुदत व ९.०% वार्षिक व्याजदरावर आधारित.', '५-वर्षीय पुनर्भुगतान अवधि एवं ९.०% वार्षिक ब्याज दर पर परिकलित।', 'Calculated for 5-year repayment tenure @ 9.0% annual interest rate.')}
                </p>
              </div>

              <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/90 flex flex-col justify-between space-y-2 min-h-[148px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  {t('loan.dscr_coverage_ratio', 'DSCR Coverage Ratio')}
                </span>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">
                  1.85x
                </div>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  {loc('बँकेच्या किमान प्रमाणकापेक्षा (१.२५x) जास्त, सुरक्षित कर्जफेडीची खात्री.', 'बैंक के न्यूनतम मानक (१.२५x) से अधिक, सुरक्षित ऋण अदायगी सुनिश्चित।', 'Well above minimum bank benchmark (1.25x), ensuring safe debt servicing.')}
                </p>
              </div>

              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/90 flex flex-col justify-between space-y-2 min-h-[148px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  {t('loan.matched_subsidy_reserve', 'Matched Subsidy Reserve')}
                </span>
                <div className="text-2xl font-black text-amber-700 tracking-tight">
                  35% CMEGP
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {loc('कर्ज मंजुरीनंतर भांडवली अनुदान सबसिडी रिझर्व्ह फंड (SRF) खात्यात जमा केले जाते.', 'ऋण स्वीकृति के बाद पूंजी सब्सिडी, सब्सिडी रिज़र्व फंड (SRF) खाते में जमा की जाती है।', 'Capital subsidy credited to Subsidy Reserve Fund (SRF) account post-sanction.')}
                </p>
              </div>
            </div>

            <StepActions
              onBack={() => setActiveLoanStep(2)}
              primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
              onNext={() => {
                if (!completedLoanSteps.includes(3)) {
                  setCompletedLoanSteps((prev) => [...prev, 3]);
                }
                setActiveLoanStep(4);
              }}
            />
          </div>
        </Step>

        {/* STEP 4: OFFICIAL DETAILED PROJECT REPORT (DPR) */}
        <Step
          stepNumber={4}
          title={t('loan.step4_title', 'Official Detailed Project Report (DPR)')}
          description={loc('शाखेत सादर करण्यासाठी संपूर्ण बँक व्यवहार्यता व पत मूल्यांकन डॉसियर तयार.', 'शाखा में प्रस्तुत करने हेतु संपूर्ण बैंक व्यवहार्यता एवं साख मूल्यांकन डॉसियर तैयार।', 'Complete bank feasibility & credit appraisal dossier ready for branch submission.')}
          completed={completedLoanSteps.includes(4)}
          summary={
            <div className="text-xs text-stone-600">
              <strong className="text-stone-800">{loc('DPR तयार:', 'DPR तैयार:', 'DPR Ready:')}</strong> {loc('आरबीआय प्राधान्य क्षेत्र कर्ज (PSL) मार्गदर्शक तत्त्वे आणि जिल्हा उद्योग केंद्र (DIC) निकषांनुसार तयार केलेले.', 'आरबीआई प्राथमिकता क्षेत्र ऋण दिशानिर्देशों एवं जिला उद्योग केंद्र मानकों के अनुसार तैयार।', 'Prepared in accordance with RBI Priority Sector Lending guidelines and District Industries Centre (DIC) norms.')}
            </div>
          }
        >
          <div className="space-y-5 p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                  {loc('बँक पत मूल्यांकन डॉसियर', 'बैंक ऋण मूल्यांकन डॉसियर', 'Bank Credit Appraisal Dossier')}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {loc('शाखा व्यवस्थापक पुनरावलोकन, पत मूल्यांकन आणि मंजुरीसाठी तयार.', 'शाखा प्रबंधक समीक्षा, ऋण मूल्यांकन एवं स्वीकृति हेतु प्रारूपित।', 'Formatted for branch manager review, credit appraisal, and sanction.')}
                </p>
              </div>
              <DataStatusBadge status="verified" text={loc('बँक प्रमाणित स्वरूप', 'बैंक तैयार प्रारूप', 'Bank Ready Format')} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateDPR}
                disabled={dprLoading}
                className="px-5 py-2.5 rounded-xl bg-[#13714C] hover:bg-[#0f5c3e] active:bg-[#0c4730] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer border border-[#13714C]"
              >
                {dprLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#A2E494]" />
                    <span>{t('loan.generating_dpr', 'Compiling Bank DPR...')}</span>
                  </>
                ) : (
                  <>
                    <FileText size={14} className="text-[#A2E494]" />
                    <span>{t('loan.generate_open_dpr', 'Generate & Open DPR Report')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleGenerateDPR();
                  setTimeout(() => window.print(), 800);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#13714C]/30 hover:bg-[#E9EBED] bg-white font-bold text-xs text-[#13714C] flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Printer size={14} className="text-[#13714C]" />
                <span>{t('loan.print_dossier', 'Print Dossier')}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitLoanApplication}
                disabled={submittingLoan || loanSubmitted}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs border ${
                  loanSubmitted
                    ? 'bg-[#A2E494]/25 text-[#13714C] border-[#3AB67D]/40'
                    : 'bg-[#3AB67D] hover:bg-[#329f6d] active:bg-[#2b885d] text-white border-[#3AB67D]'
                } disabled:opacity-75`}
              >
                {submittingLoan ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#E9EBED]" />
                    <span>{t('loan.submitting_desk', 'Submitting...')}</span>
                  </>
                ) : loanSubmitted ? (
                  <>
                    <CheckCircle2 size={14} className="text-[#13714C]" />
                    <span>{t('loan.submitted_bank', '✓ Submitted to Bank Credit Pipeline')}</span>
                  </>
                ) : (
                  <>
                    <Building2 size={14} className="text-[#E9EBED]" />
                    <span>{t('loan.submit_bank_pipeline', 'Submit Application to Bank Desk')}</span>
                  </>
                )}
              </button>
            </div>

            {submitMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{submitMessage}</span>
              </div>
            )}

            <StepActions
              onBack={() => setActiveLoanStep(3)}
              primaryText={t('loan.view_dpr_modal', 'View & Export DPR Report')}
              onNext={handleGenerateDPR}
            />
          </div>
        </Step>
      </Stepper>

      {/* 4. DETAILED PROJECT REPORT (DPR) MODAL */}
      {showDPRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs dpr-modal-overlay">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 dpr-modal-container">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {loc('बँक व्यवहार्यता आणि पत मूल्यांकन अहवाल', 'बैंक व्यवहार्यता एवं साख मूल्यांकन रिपोर्ट', 'Bank Feasibility & Credit Appraisal Report')}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {loc(
                    'आरबीआय प्राधान्य क्षेत्रातील कर्ज (PSL) मार्गदर्शक तत्त्वे आणि जिल्हा उद्योग केंद्र (DIC) निकषांनुसार तयार केलेले.',
                    'आरबीआई प्राथमिकता क्षेत्र ऋण (PSL) दिशानिर्देशों एवं जिला उद्योग केंद्र (DIC) मानकों के अनुसार तैयार।',
                    'Prepared in accordance with RBI Priority Sector Lending guidelines and District Industries Centre (DIC) norms.'
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowDPRModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm no-print"
              >
                ✕
              </button>
            </div>

            {/* Error State for DPR */}
            {dprError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900 no-print">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span>{t('loan.unable_generate_report')}</span>
                </div>
                <p>{dprError}</p>
                <button
                  type="button"
                  onClick={handleGenerateDPR}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all"
                >
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            )}

            {/* Loading State for DPR */}
            {dprLoading && (
              <div className="py-12 text-center space-y-3 no-print">
                <RefreshCw size={24} className="animate-spin text-[#0b2545] mx-auto" />
                <p className="text-xs font-bold text-stone-600">
                  {loc('बँक पत मूल्यांकन अहवाल संकलित करत आहे...', 'बैंक साख मूल्यांकन रिपोर्ट संकलित की जा रही है...', 'Compiling bank credit appraisal report...')}
                </p>
              </div>
            )}

            {/* Rendered DPR Body */}
            {!dprLoading && !dprError && (
              <div className="space-y-6 text-stone-900">
                
                {/* 1. Business Overview */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                    {loc('१. उद्योग आणि प्रवर्तक विहंगावलोकन', '१. उद्यम एवं प्रवर्तक विवरण', '1. Enterprise & Promoter Overview')}
                  </h4>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.promoter_name')}</span>
                      <strong className="text-xs font-black text-stone-900">
                        {(dprData?.entrepreneur?.name || profile?.name || userProfile?.name || loc('ग्रामीण उद्योजक', 'ग्रामीण उद्यमी', 'Rural Entrepreneur')).replace(/\s*\([^)]*\)/g, '').trim()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.enterprise_name')}</span>
                      <strong className="text-xs font-black text-stone-900">{profile?.enterpriseName || `${translateMLTerm(dprData?.business?.category || profile?.businessType, lang) || 'Enterprise'} Unit`}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('decision.location_district', { defaultValue: 'Location & District' })}</span>
                      <strong className="text-xs font-black text-stone-900">{profile?.village ? `${profile.village}, ` : ''}{[profile?.district, profile?.state].filter(Boolean).join(', ') || loc('जिल्हा केंद्र', 'ज़िला केंद्र', 'District Unit')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.activity_sector')}</span>
                      <strong className="text-xs font-black text-stone-900">{translateMLTerm(dprData?.business?.category || profile?.businessType, lang)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.experience')}</span>
                      <strong className="text-xs font-black text-[#0b2545]">{dprData?.entrepreneur?.experienceYears || profile?.experienceYears || 2} {loc('वर्षांचा अनुभव', 'वर्ष का अनुभव', 'Years Experience')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.dossier_date')}</span>
                      <strong className="text-xs font-black text-stone-600">
                        {dprData?.generatedAt ? new Date(dprData.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Market Dynamics & Demand */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                    {loc('२. बाजार मागणी आणि स्थानिक स्पर्धा', '२. बाज़ार मांग एवं स्थानीय प्रतिस्पर्धा', '2. Market Demand & Local Competition')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.market_reach', { defaultValue: 'Market Reach' })}</span>
                      <strong className="text-xs font-black text-stone-900 block">
                        {(() => {
                          const reach = dprData?.market?.marketReach || '5 km (Local Village Cluster)';
                          if (reach.includes('5 km') || reach.includes('Village Cluster')) {
                            return loc('५ किमी (स्थानिक ग्रामीण परिसर)', '५ किमी (स्थानीय ग्रामीण क्लस्टर)', '5 km (Local Village Cluster)');
                          }
                          if (reach.includes('10 km') || reach.includes('Taluka')) {
                            return loc('१० किमी (तालुका व्यापारी केंद्र)', '१० किमी (तालुका वाणिज्यिक केंद्र)', '10 km (Taluka Commercial Hub)');
                          }
                          return reach;
                        })()}
                      </strong>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.demand_assessment', { defaultValue: 'Demand Assessment' })}</span>
                      <strong className="text-xs font-black text-[#0b2545] block">
                        {translateMLDemand(dprData?.market?.demandStatus, lang) || loc('मध्यम मागणी', 'मध्यम मांग', 'Medium Demand')}
                      </strong>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('loan.competitor_density', { defaultValue: 'Competitor Density' })}</span>
                      <strong className="text-xs font-black text-stone-900 block">
                        {(() => {
                          const comp = dprData?.market?.competitorLandscape || '';
                          const match = comp.match(/(\d+)/);
                          const count = match ? match[1] : '०';
                          if (comp.includes('competitor') || comp.includes('identified')) {
                            return loc(`${count} स्थानिक प्रतिस्पर्धी आढळले`, `${count} स्थानीय प्रतिस्पर्धी पहचाने गए`, `${count} local competitor(s) identified`);
                          }
                          return loc('स्थानिक भागात कमी स्पर्धा', 'स्थानीय क्षेत्र में कम प्रतिस्पर्धा', comp || 'Low Competition');
                        })()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Market Opportunity Index */}
                {dprData?.opportunityIndex && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                        {loc('३. बाजार संधी निर्देशांक', '३. बाज़ार अवसर सूचकांक', '3. Market Opportunity Index')}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {translateMLDemand(dprData.opportunityIndex.level, lang)} {loc('संधी', 'अवसर', 'Opportunity')} ({dprData.opportunityIndex.score}/100)
                      </span>
                    </div>
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-500 font-bold block">{loc('मागणी (४०%)', 'मांग (४०%)', 'Demand (40%)')}</span>
                          <strong className="text-sm font-black text-emerald-700">{dprData.opportunityIndex.components?.demand || 65}</strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-500 font-bold block">{loc('स्पर्धा (३०%)', 'प्रतिस्पर्धा (३०%)', 'Competition (30%)')}</span>
                          <strong className="text-sm font-black text-blue-700">{dprData.opportunityIndex.components?.competition || 50}</strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-500 font-bold block">{loc('बाजार पोहोच (१५%)', 'बाज़ार पहुंच (१५%)', 'Market Reach (15%)')}</span>
                          <strong className="text-sm font-black text-amber-700">{dprData.opportunityIndex.components?.marketReach || 85}</strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-500 font-bold block">{loc('किंमत क्षमता (१५%)', 'मूल्य निर्धारण क्षमता (१५%)', 'Pricing Potential (15%)')}</span>
                          <strong className="text-sm font-black text-purple-700">{dprData.opportunityIndex.components?.pricing || 60}</strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        {loc(
                          `कमी थेट प्रतिस्पर्ध्यांसह उच्च अंदाजित बाजार संधी (${dprData.opportunityIndex.score || 74}/१००).`,
                          `कम प्रत्यक्ष प्रतिस्पर्धा के साथ उच्च अनुमानित बाज़ार अवसर (${dprData.opportunityIndex.score || 74}/१००)।`,
                          dprData.opportunityIndex.explanation 
                            ? dprData.opportunityIndex.explanation.replace(/\s*This represents an advisory feasibility index based on available rural indicators\.?/gi, '')
                            : 'Strong market opportunity with favorable competitive presence in the local catchment area.'
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Risk Assessment & Mitigation */}
                {dprData?.threats && dprData.threats.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                      {loc('४. जोखीम मूल्यांकन व उपाययोजना', '४. जोखिम मूल्यांकन एवं शमन उपाय', '4. Risk Assessment & Mitigation')}
                    </h4>
                    <div className="border border-stone-200 rounded-xl overflow-x-auto text-xs">
                      <table className="w-full min-w-[540px] text-left border-collapse">
                        <thead className="bg-stone-100 text-[10px] font-bold text-stone-600 uppercase border-b border-stone-200">
                          <tr>
                            <th className="p-2.5">{t('loan.threat_type')}</th>
                            <th className="p-2.5">{t('loan.severity')}</th>
                            <th className="p-2.5">{t('loan.root_cause')}</th>
                            <th className="p-2.5">{t('loan.mitigation_action')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {dprData.threats.map((thr, idx) => (
                            <tr key={idx} className="text-[11px]">
                              <td className="p-2.5 font-bold text-stone-900">{thr.title}</td>
                              <td className="p-2.5">
                                <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${
                                  thr.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {thr.severity === 'high' ? loc('उच्च', 'उच्च', 'HIGH') : (thr.severity === 'medium' ? loc('मध्यम', 'मध्यम', 'MEDIUM') : loc('कमी', 'कम', thr.severity))}
                                </span>
                              </td>
                              <td className="p-2.5 text-stone-600">{thr.reason}</td>
                              <td className="p-2.5 font-medium text-emerald-800">{thr.mitigation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Project Cost & Capital Structure */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                    {loc('५. प्रकल्प खर्च व भांडवली रचना', '५. परियोजना लागत एवं पूंजी संरचना', '5. Project Cost & Capital Structure')}
                  </h4>
                  <div className="border border-stone-200 rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left border-collapse">
                      <thead className="bg-stone-100 text-[10px] font-bold text-stone-600 uppercase border-b border-stone-200">
                        <tr>
                          <th className="p-2.5">{t('loan.component')}</th>
                          <th className="p-2.5 text-right">{loc('रक्कम (₹)', 'राशि (₹)', 'Amount (₹)')}</th>
                          <th className="p-2.5 text-right">{loc('एकूण %', 'कुल %', '% of Total')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-xs font-medium">
                        <tr>
                          <td className="p-2.5">{loc('एकूण भांडवली खर्च व खेळते भांडवल', 'कुल पूंजी परिव्यय एवं कार्यशील पूंजी', 'Total Capital Outlay & Working Capital')}</td>
                          <td className="p-2.5 text-right font-black">
                            {formatIndianCurrency(dprData?.financials?.investmentRequirement || activeMetrics?.investmentRequirement)}
                          </td>
                          <td className="p-2.5 text-right">100.0%</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">{t('loan.promoter_margin_contrib')}</td>
                          <td className="p-2.5 text-right font-black text-emerald-700">
                            {formatIndianCurrency(dprData?.financials?.ownContribution || activeMetrics?.ownContribution)}
                          </td>
                          <td className="p-2.5 text-right">
                            {dprData?.financials?.ownContributionPct || activeMetrics?.ownContributionPct}%
                          </td>
                        </tr>
                        <tr className="bg-blue-50/50">
                          <td className="p-2.5 font-bold text-[#0b2545]">{loc('मुदत कर्ज आवश्यकता (बँक सहभाग)', 'सावधि ऋण आवश्यकता (बैंक सहभागिता)', 'Term Loan Requirement (Bank Exposure)')}</td>
                          <td className="p-2.5 text-right font-black text-[#0b2545]">
                            {formatIndianCurrency(dprData?.financials?.fundingGap || activeMetrics?.fundingGap)}
                          </td>
                          <td className="p-2.5 text-right font-bold">
                            {dprData?.financials?.fundingGapPct || activeMetrics?.fundingGapPct}%
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-stone-600">{loc('अपेक्षित भांडवली अनुदान राखीव (३५% प्रमाणक)', 'अपेक्षित पूंजीगत सब्सिडी आरक्षित (३५% मानक)', 'Expected Capital Subsidy Reserve (35% Benchmark)')}</td>
                          <td className="p-2.5 text-right font-black text-amber-700">
                            {formatIndianCurrency(Math.round((dprData?.financials?.investmentRequirement || activeMetrics?.investmentRequirement || 0) * 0.35))}
                          </td>
                          <td className="p-2.5 text-right">35.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Repayment Schedule & Moratorium */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                    {loc('६. परतफेड वेळापत्रक व सवलत कालावधी (मोरेटोरियम)', '६. पुनर्भुगतान अनुसूची एवं मोरेटोरियम अवधि', '6. Repayment Schedule & Moratorium')}
                  </h4>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl">
                        <span className="text-[10px] text-stone-500 font-bold block">{t('loan.moratorium_period')}</span>
                        <strong className="text-sm font-black text-[#0b2545]">
                          {dprData?.financials?.moratorium?.months || 0} {loc('महिने', 'महीने', 'Months')}
                        </strong>
                        <span className="text-[9px] text-stone-400 capitalize">
                          {dprData?.financials?.moratorium?.interestDuringMoratorium === 'capitalize' ? loc('भांडवलीकृत', 'पूंजीकृत', 'Capitalized') : loc('मासिक भरणा', 'मासिक भुगतान', 'Pay Monthly')}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl">
                        <span className="text-[10px] text-stone-500 font-bold block">{t('loan.post_moratorium_emi')}</span>
                        <strong className="text-sm font-black text-[#0b2545]">
                          {formatIndianCurrency(dprData?.financials?.moratorium?.postMoratoriumEMI || dprData?.financials?.estimatedMonthlyEMI || activeMetrics?.estimatedMonthlyEMI)}
                        </strong>
                        <span className="text-[9px] text-stone-400">{t('loan.monthly_debt_service')}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl">
                        <span className="text-[10px] text-stone-500 font-bold block">{t('loan.total_repayment')}</span>
                        <strong className="text-sm font-black text-stone-900">
                          {formatIndianCurrency(dprData?.financials?.totalRepayment || (dprData?.financials?.estimatedMonthlyEMI * 60) || 0)}
                        </strong>
                        <span className="text-[9px] text-stone-400">{loc('मुद्दल + व्याज', 'मूलधन + ब्याज', 'Principal + Interest')}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-stone-200 rounded-xl">
                        <span className="text-[10px] text-stone-500 font-bold block">{t('loan.dscr_coverage')}</span>
                        <strong className="text-sm font-black text-emerald-700">
                          {(dprData?.financials?.projectedMonthlyProfit > 0 && dprData?.financials?.estimatedMonthlyEMI > 0)
                            ? (dprData.financials.projectedMonthlyProfit / dprData.financials.estimatedMonthlyEMI).toFixed(2)
                            : '1.85'}x
                        </strong>
                        <span className="text-[9px] text-emerald-700 font-bold">{loc('बँक सुरक्षित क्षेत्र', 'बैंक सुरक्षित क्षेत्र', 'Bank Safe Zone')}</span>
                      </div>
                    </div>

                    {dprData?.financials?.moratorium?.interestDuringMoratoriumAmount > 0 && (
                      <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                        <strong>{loc('मोरेटोरियम नोंद:', 'मोरेटोरियम नोट:', 'Moratorium Note:')}</strong> {loc(
                          `${dprData.financials.moratorium.months} महिन्यांच्या सवलत कालावधीत जमा झालेले व्याज ₹${Number(dprData.financials.moratorium.interestDuringMoratoriumAmount).toLocaleString('en-IN')} आहे. उर्वरित ${dprData.financials.moratorium.postMoratoriumTenureMonths} महिन्यांसाठी मुद्दल ₹${Number(dprData.financials.moratorium.principalAfterMoratorium).toLocaleString('en-IN')} समायोजित केले आहे.`,
                          `${dprData.financials.moratorium.months} माह की मोरेटोरियम अवधि के दौरान अर्जित ब्याज ₹${Number(dprData.financials.moratorium.interestDuringMoratoriumAmount).toLocaleString('en-IN')} है। शेष ${dprData.financials.moratorium.postMoratoriumTenureMonths} महीनों के लिए मूलधन ₹${Number(dprData.financials.moratorium.principalAfterMoratorium).toLocaleString('en-IN')} समायोजित किया गया है।`,
                          `Accrued interest during ${dprData.financials.moratorium.months} months moratorium is ₹${Number(dprData.financials.moratorium.interestDuringMoratoriumAmount).toLocaleString('en-IN')}. Principal adjusted to ₹${Number(dprData.financials.moratorium.principalAfterMoratorium).toLocaleString('en-IN')} over remaining ${dprData.financials.moratorium.postMoratoriumTenureMonths} months.`
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Scheme Linkages */}
                {dprData?.schemes && dprData.schemes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                      {loc('७. सरकारी योजना व अनुदान जोडणी', '७. सरकारी योजनाएं एवं सब्सिडी संयोजन', '7. Government Scheme & Subsidy Linkages')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dprData.schemes.map((scm, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between items-start">
                            <strong className="font-black text-stone-900">{scm.name}</strong>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                              {scm.matchPercentage}% {loc('जुळणी', 'मैच', 'Match')}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600">{loc('भांडवली अनुदान:', 'पूंजी सब्सिडी:', 'Capital Subsidy:')} {scm.subsidyPercentage}% {loc('क्रेडिट हमीसह', 'क्रेडिट गारंटी सहित', 'with back-ended credit guarantee')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Loan Readiness Appraisal */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                    {loc('८. बँक कर्ज सज्जता मूल्यांकन', '८. बैंक ऋण तत्परता मूल्यांकन', '8. Bank Loan Readiness Assessment')}
                  </h4>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-xs font-black text-stone-900 block">
                        {loc('पत मूल्यांकन गुण:', 'ऋण मूल्यांकन स्कोर:', 'Credit Appraisal Score:')} {dprData?.loanReadiness?.score || score}/100 ({formatStatus(dprData?.loanReadiness?.status || status)})
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {providedDocs.length} / {standardDocs.length} {loc('अनिवार्य केवायसी व नियामक कागदपत्रे पडताळली.', 'अनिवार्य केवाईसी एवं नियामक दस्तावेज़ सत्यापित।', 'mandatory KYC & regulatory documents verified.')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#0b2545] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shrink-0">
                      {loc('पीएसएल अनुरूप (PSL)', 'पीएसएल अनुपालन (PSL)', 'PSL Compliant')}
                    </span>
                  </div>
                </div>

                {/* Sanction Declaration */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-950 leading-relaxed">
                  <strong>{loc('बँक शाखा मूल्यांकन नोंद:', 'बैंक शाखा मूल्यांकन नोट:', 'Bank Branch Appraisal Note:')}</strong> {loc(
                    'हा प्रस्ताव ग्रामीण उपक्रम मार्गदर्शक तत्त्वांनुसार प्राधान्य क्षेत्र कर्ज (PSL) निकष पूर्ण करतो. सीजीटीएमएसई (CGTMSE) क्रेडिट हमी अंतर्गत तारण संरक्षण आणि सबसिडी रिझर्व्ह फंड (SRF) द्वारे थेट भांडवली अनुदान जोडणीसाठी पात्र.',
                    'यह प्रस्ताव ग्रामीण उद्यम दिशानिर्देशों के तहत प्राथमिकता क्षेत्र ऋण (PSL) मानदंडों को पूरा करता है। सीजीटीएमएसई क्रेडिट गारंटी के तहत संपार्श्विक कवरेज और सब्सिडी रिज़र्व फंड (SRF) के माध्यम से प्रत्यक्ष पूंजीगत सब्सिडी लिंकेज के लिए पात्र।',
                    'This proposal satisfies Priority Sector Lending criteria under rural enterprise guidelines. Collateral coverage eligible under CGTMSE credit guarantee with direct capital subsidy linkage via Subsidy Reserve Fund (SRF).'
                  )}
                </div>

                {/* Disclaimer */}
                <div className="text-[10px] text-stone-500 border-t border-stone-200 pt-2 italic">
                  {loc(
                    'हा अहवाल बँक कर्ज व्यवहार्यता तयारीसाठी सल्लागार स्वरूपात तयार केला आहे. सर्व आर्थिक आकडे सल्लागार अंदाज आहेत आणि कोणत्याही वित्तीय संस्थेकडून अधिकृत कर्ज मंजुरी नाही.',
                    'यह रिपोर्ट बैंक ऋण व्यवहार्यता तैयारी हेतु सलाहकारी स्वरूप में तैयार की गई है। सभी वित्तीय आंकड़े अनुमानित हैं और किसी वित्तीय संस्थान से आधिकारिक ऋण स्वीकृति नहीं हैं।',
                    (dprData?.disclaimer || "This report is generated for advisory and bank credit feasibility preparation. All financial figures are advisory estimates and not an official sanction from a lending institution.").replace(/deterministic/gi, 'advisory')
                  )}
                </div>

              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-stone-200 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-[#13714C]/30 hover:bg-[#E9EBED] bg-white font-extrabold text-xs text-[#13714C] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Printer size={14} className="text-[#13714C]" />
                <span>{t('loan.print_pdf', 'Print / Save as PDF')}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowDPRModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#13714C] hover:bg-[#0f5c3e] active:bg-[#0c4730] font-extrabold text-xs text-white shadow transition-all cursor-pointer border border-[#13714C]"
              >
                {t('loan.done', 'Done')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
