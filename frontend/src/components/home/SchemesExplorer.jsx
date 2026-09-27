import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Filter, CheckCircle2, FileText, ExternalLink, 
  ChevronDown, ChevronUp, Info, Sparkles,
  Bookmark, BookmarkCheck, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { VERIFIED_SCHEMES, matchSchemesClient } from '../../utils/verifiedSchemesData.js';
import { formatIndianCurrency } from '../../utils/calculations.js';
import { getAllIndianStates } from '../../utils/panIndiaLocations.js';

export default function SchemesExplorer({ 
  defaultWorkflow = 'discover', 
  initialCategory = 'All', 
  initialSearch = '', 
  onNavigate,
  user 
}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const params = useParams();

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [expandedSchemeId, setExpandedSchemeId] = useState(params?.schemeId || null);
  const [savedSchemes, setSavedSchemes] = useState([]);

  // Match Input Drawer State (Synchronized with user profile)
  const [state, setState] = useState(() => user?.state || 'Maharashtra');
  const [bizType, setBizType] = useState(() => user?.businessType || 'Dairy');
  const [investment, setInvestment] = useState(() => user?.investmentRequirement || 500000);
  const [stage, setStage] = useState(() => user?.businessStage || 'new');
  const [isRural, setIsRural] = useState(true);

  const availableStates = getAllIndianStates();

  // Sync when user prop updates
  useEffect(() => {
    if (user) {
      if (user.state) setState(user.state);
      if (user.businessType) setBizType(user.businessType);
      if (user.investmentRequirement) setInvestment(Number(user.investmentRequirement));
      if (user.businessStage) setStage(user.businessStage);
    }
  }, [user]);

  // Listen to profile broadcast
  useEffect(() => {
    const handleProfileSync = (e) => {
      const u = e.detail?.user || e.detail?.profile;
      if (u) {
        if (u.state) setState(u.state);
        if (u.businessType) setBizType(u.businessType);
        if (u.investmentRequirement) setInvestment(Number(u.investmentRequirement));
        if (u.businessStage) setStage(u.businessStage);
      }
    };
    window.addEventListener('vyapar_profile_updated', handleProfileSync);
    return () => window.removeEventListener('vyapar_profile_updated', handleProfileSync);
  }, []);


  // Load saved schemes from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vyapar_saved_schemes') || '[]');
      setSavedSchemes(saved);
    } catch (e) {
      console.warn('Saved schemes load error:', e);
    }
  }, []);

  const toggleSaveScheme = (scheme) => {
    try {
      const isSaved = savedSchemes.some(s => s.id === scheme.id);
      let updated;
      if (isSaved) {
        updated = savedSchemes.filter(s => s.id !== scheme.id);
      } else {
        updated = [...savedSchemes, scheme];
      }
      setSavedSchemes(updated);
      localStorage.setItem('vyapar_saved_schemes', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving scheme:', e);
    }
  };

  const categories = [
    { id: 'All', label: t('schemes.cat_all', 'All Schemes') },
    { id: 'Central Government Support', label: t('schemes.cat_central', 'Pan-India Central Support') },
    { id: 'Food Processing', label: t('schemes.cat_food', 'Food Processing') },
    { id: 'MSME Support', label: t('schemes.cat_msme', 'MSME & Village Industry') },
    { id: 'Agriculture', label: t('schemes.cat_agri', 'Agriculture & Allied') }
  ];

  // Run deterministic matching
  const matchedList = matchSchemesClient({
    state: state,
    businessType: bizType,
    investmentRequirement: Number(investment) || 0,
    businessStage: stage,
    isRural: isRural
  });

  const filteredSchemes = matchedList.filter(s => {
    const matchesCat = activeCategory === 'All' || 
      s.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (activeCategory === 'Agriculture' && s.sector.some(sec => sec.toLowerCase().includes('agri') || sec.toLowerCase().includes('dairy')));
    const matchesSearch = !searchQuery || (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameMr && s.nameMr.includes(searchQuery)) ||
      (s.nameHi && s.nameHi.includes(searchQuery)) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCat && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };


  return (
    <section id="schemes-section" className="max-w-7xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* 1. Header */}
      <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
            {t('schemes.title', 'Government Schemes')}
          </h1>
        </div>

        <button
          onClick={() => onNavigate('/finance/loan-ready')}
          className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
        >
          <span>{t('schemes.loan_readiness_btn', 'Loan Readiness & DPR')}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 2. Main Schemes Section */}
      <div className="space-y-5">
          
          {/* Match Criteria Controller */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-stone-700">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-[#0b2545]" />
                <span>{t('schemes.filter_title', 'Eligibility Criteria Filter')}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInvestment('')}
                  className="text-[11px] font-bold text-stone-500 hover:text-[#0b2545] normal-case underline cursor-pointer"
                  title={t('schemes.clear_investment_title', { defaultValue: 'Clear default investment to type your own amount' })}
                >
                  {t('schemes.clear_investment', 'Clear Investment')}
                </button>
                <span className="text-[10px] text-stone-400 font-semibold">{t('schemes.deterministic_match', 'Deterministic Matching')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  {t('schemes.state_label', 'State / UT')}
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  {t('schemes.sector_label', 'Business Sector')}
                </label>
                <select
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800"
                >
                  <option value="Dairy">{t('schemes.sec_dairy', 'Dairy & Animal Husbandry')}</option>
                  <option value="Food Processing">{t('schemes.sec_food', 'Food Processing (Spices/Flour/Jaggery)')}</option>
                  <option value="Agri Products">{t('schemes.sec_agri', 'Agri Products & Nursery')}</option>
                  <option value="Retail / Shop">{t('schemes.sec_retail', 'Rural Retail / Kirana Store')}</option>
                  <option value="Service Enterprise">{t('schemes.sec_service', 'Rural Service & Fabrication')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  {t('schemes.investment_label', 'Investment Required (₹)')}
                </label>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  step="50000"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800"
                  placeholder={t('schemes.investment_placeholder', { defaultValue: 'e.g. 500000' })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  {t('schemes.stage_label', 'Business Stage')}
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800"
                >
                  <option value="new">{t('schemes.stage_new', 'New Enterprise (Greenfield)')}</option>
                  <option value="existing">{t('schemes.stage_existing', 'Existing Enterprise (Expansion)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  {t('schemes.area_label', 'Area Classification')}
                </label>
                <select
                  value={isRural ? 'rural' : 'urban'}
                  onChange={(e) => setIsRural(e.target.value === 'rural')}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800"
                >
                  <option value="rural">{t('schemes.area_rural', 'Rural (Gram Panchayat)')}</option>
                  <option value="urban">{t('schemes.area_urban', 'Semi-Urban / Municipal')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-[#0b2545] text-white border-[#0b2545] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('schemes.search_placeholder', 'Search scheme name or subsidy...')}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-medium"
              />
            </div>
          </div>

          {/* Scheme Cards List */}
          <div className="space-y-4">
            {filteredSchemes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
                <Info size={36} className="text-stone-400 mx-auto" />
                <p className="text-stone-800 font-bold text-base">{t('schemes.no_schemes', 'No schemes found matching the filter.')}</p>
                <button
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className="text-xs font-bold text-[#0b2545] underline"
                >
                  {t('schemes.reset_filters', 'Reset filters')}
                </button>
              </div>
            ) : (
              filteredSchemes.map((scheme, index) => {
                const isExpanded = expandedSchemeId === scheme.id;
                const isSaved = savedSchemes.some(s => s.id === scheme.id);
                const matchPct = typeof scheme.matchPercentage === 'number' ? scheme.matchPercentage : 70;

                return (
                  <div 
                    key={scheme.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:border-stone-300"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {scheme.category}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              matchPct >= 60 
                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200' 
                                : matchPct > 0 
                                ? 'text-blue-800 bg-blue-50 border-blue-200' 
                                : 'text-stone-500 bg-stone-100 border-stone-200'
                            }`}>
                              {matchPct > 0 ? `${matchPct}% ${t('schemes.match_badge', 'Match')}` : t('schemes.ineligible_badge', 'State Ineligible (0%)')}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-stone-900 leading-snug">
                            {i18n.language === 'mr' && scheme.nameMr ? scheme.nameMr : i18n.language === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
                          </h3>
                          <p className="text-xs text-stone-600 font-medium leading-relaxed">
                            {scheme.shortDescription}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-stone-400 uppercase block">{t('schemes.max_capital_subsidy', 'Max Capital Subsidy')}</span>
                            <strong className="text-sm font-black text-[#0b2545]">{scheme.subsidyPercentage}</strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleSaveScheme(scheme)}
                            className={`btn-save-animated px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                              isSaved 
                                ? 'btn-save-saved bg-[#13714C] border-[#13714C] text-[#E9EBED]' 
                                : 'border-stone-200 text-stone-600 hover:text-[#13714C] hover:border-[#3AB67D] hover:bg-[#E9EBED]/50'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save scheme to dashboard'}
                          >
                            {isSaved ? <BookmarkCheck size={14} className="text-[#A2E494]" /> : <Bookmark size={14} />}
                            <span className="text-[11px]">{isSaved ? t('schemes.saved', 'Saved') : t('schemes.save', 'Save')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-stone-100 space-y-3 text-xs animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                            <div>
                              <strong className="text-stone-900 block font-bold mb-1">{t('schemes.eligibility_highlights', 'Eligibility Highlights:')}</strong>
                              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                                {scheme.eligibility && scheme.eligibility.length > 0 ? (
                                  scheme.eligibility.slice(0, 4).map((el, idx) => (
                                    <li key={idx}>{el}</li>
                                  ))
                                ) : (
                                  <>
                                    <li>Minimum age: 18 years</li>
                                    <li>Educational criteria: 8th pass for projects above ₹10L</li>
                                    <li>Promoter margin: 5% - 10% own equity depending on category</li>
                                  </>
                                )}
                              </ul>
                            </div>

                            <div>
                              <strong className="text-stone-900 block font-bold mb-1">{t('schemes.required_docs_title', 'Required Documents:')}</strong>
                              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                                {scheme.documents && scheme.documents.length > 0 ? (
                                  scheme.documents.slice(0, 4).map((doc, idx) => (
                                    <li key={idx}>{doc}</li>
                                  ))
                                ) : (
                                  <>
                                    <li>Aadhaar & PAN Card</li>
                                    <li>Detailed Project Report (DPR)</li>
                                    <li>Land records (7/12) or Registered Lease Agreement</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                            {(() => {
                              const targetPortalUrl = scheme.officialPortal || scheme.officialPortalUrl || (
                                scheme.id === 'pmegp' ? 'https://pmegp.msme.gov.in' :
                                scheme.id === 'cmegp' ? 'https://maha-cmegp.gov.in' :
                                scheme.id === 'pmfme' ? 'https://pmfme.mofpi.gov.in' :
                                scheme.id === 'mudra' ? 'https://www.mudra.org.in' :
                                scheme.id === 'cgtmse' ? 'https://www.cgtmse.in' :
                                scheme.id === 'smart_project' ? 'https://www.smart-mh.org' :
                                'https://www.myscheme.gov.in'
                              );

                              return (
                                <div className="flex flex-col">
                                  <a
                                    href={targetPortalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-extrabold text-[#0b2545] hover:text-amber-700 flex items-center gap-1.5 underline decoration-2 underline-offset-2 transition-colors cursor-pointer"
                                    title={`Visit official government portal (${targetPortalUrl})`}
                                  >
                                    <span>{t('schemes.official_portal_link', 'Official Ministry Portal')}</span>
                                    <ExternalLink size={13} className="text-amber-600 shrink-0" />
                                  </a>
                                  {scheme.officialSource && (
                                    <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                                      {scheme.officialSource}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            <button
                              onClick={() => onNavigate('/finance/loan-ready')}
                              className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer transition-all"
                            >
                              <span>{t('schemes.prepare_dpr_btn', 'Prepare DPR for this Scheme')}</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pt-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(scheme.id)}
                          className="text-xs font-bold text-stone-600 hover:text-[#0b2545] flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? t('schemes.hide_details', 'Hide Details') : t('schemes.view_details', 'View Scheme Details & Procedures')}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      {/* 3. Required Documents Checklist */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              {t('schemes.doc_dossier_title', 'Standard Government Scheme Document Dossier')}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {t('schemes.doc_dossier_desc', 'Keep these scanned self-attested documents ready before logging onto official state/central portals.')}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            {t('schemes.checklist_badge', 'Checklist')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <strong className="text-xs font-black text-stone-900 block">{t('schemes.doc_sec1_title', '1. Identity & Residence Proof')}</strong>
            <ul className="text-xs text-stone-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec1_p1', 'Aadhaar Card (linked with active mobile number for OTP)')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec1_p2', 'PAN Card of the applicant / enterprise entity')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec1_p3', 'Maharashtra Domicile Certificate (mandatory for CMEGP)')}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <strong className="text-xs font-black text-stone-900 block">{t('schemes.doc_sec2_title', '2. Land & Business Premises Proof')}</strong>
            <ul className="text-xs text-stone-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec2_p1', '7/12 and 8-A land extracts if owned agricultural premises')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec2_p2', 'Registered Lease Agreement (minimum 3 years) if rented')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec2_p3', 'Gram Panchayat NOC / Property Tax paid receipt')}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <strong className="text-xs font-black text-stone-900 block">{t('schemes.doc_sec3_title', '3. Project & Financial Records')}</strong>
            <ul className="text-xs text-stone-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec3_p1', 'Detailed Project Report (DPR) with machine quotations')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec3_p2', 'Past 6 months bank statement of promoter savings/current account')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec3_p3', 'Competitive machinery quotations from registered suppliers')}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <strong className="text-xs font-black text-stone-900 block">{t('schemes.doc_sec4_title', '4. Registrations & Special Category')}</strong>
            <ul className="text-xs text-stone-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec4_p1', 'Udyam MSME Registration Certificate (100% free)')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec4_p2', 'Caste Certificate (SC/ST/OBC/Women) for higher subsidy tier')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{t('schemes.doc_sec4_p3', 'EDP Training Certificate (can be completed online after sanction)')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigate('/reports')}
            className="px-5 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('schemes.generate_dpr_btn', 'Generate Bank-Ready DPR Report')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. Step-by-Step Application Guide */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-stone-100 pb-3">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
            {t('schemes.lifecycle_title', 'Official Application Lifecycle (How Back-Ended Subsidies Work)')}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {t('schemes.lifecycle_desc', 'Understand the standard 5 stages from online portal submission to bank subsidy credit.')}
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              step: '01',
              title: t('schemes.guide_step1_title', 'Online Application on Official Portal'),
              desc: t('schemes.guide_step1_desc', 'Fill personal details, upload Aadhaar, PAN, land records and DPR on maha-cmegp.gov.in or kviconline.gov.in. No fee is charged for submission.'),
              badge: t('schemes.guide_step1_badge', 'Agency: DIC / KVIB / KVIC')
            },
            {
              step: '02',
              title: t('schemes.guide_step2_title', 'District Task Force Committee (DTFC) Scrutiny'),
              desc: t('schemes.guide_step2_desc', 'The General Manager (DIC) verifies feasibility and forwards your dossier to your preferred Lead Bank branch within 15 working days.'),
              badge: t('schemes.guide_step2_badge', 'Timeline: ~2 Weeks')
            },
            {
              step: '03',
              title: t('schemes.guide_step3_title', 'Bank Loan Appraisal & In-Principle Sanction'),
              desc: t('schemes.guide_step3_desc', 'Branch manager assesses creditworthiness, inspects site premises, and issues a formal Loan Sanction Letter with EMI terms.'),
              badge: t('schemes.guide_step3_badge', 'Appraisal: Branch Manager')
            },
            {
              step: '04',
              title: t('schemes.guide_step4_title', 'Promoter Margin Deposit & Loan Disbursement'),
              desc: t('schemes.guide_step4_desc', 'You deposit 5-10% own equity margin into the enterprise loan account. Bank releases loan tranches directly to equipment vendors against invoices.'),
              badge: t('schemes.guide_step4_badge', 'Disbursement: In Vendor Name')
            },
            {
              step: '05',
              title: t('schemes.guide_step5_title', 'Subsidy Claim & TDR Lock-in (Back-Ended)'),
              desc: t('schemes.guide_step5_desc', 'Bank claims subsidy grant from the nodal ministry. The capital subsidy (e.g. 35%) is deposited in a Term Deposit Receipt (TDR) in your name for 3 years, then credited against the loan principal upon physical unit verification.'),
              badge: t('schemes.guide_step5_badge', 'Lock-in: 3 Years')
            }
          ].map((st) => (
            <div key={st.step} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-black text-xs shrink-0">
                  {st.step}
                </div>
                <div>
                  <strong className="text-xs font-black text-stone-900 block leading-snug">{st.title}</strong>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                {st.badge}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs font-bold text-stone-800">
            {t('schemes.dpr_cta_prompt', 'Ready to generate your formal project report for bank submission?')}
          </span>
          <button
            onClick={() => onNavigate('/reports')}
            className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            {t('schemes.dpr_cta_btn', 'Open DPR Report Builder →')}
          </button>
        </div>
      </div>

    </section>
  );
}
