import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, MapPin, FileText, CheckCircle2, ArrowRight, Mic, 
  Trash2, TrendingUp, Award, Bookmark, ArrowUpRight
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { formatIndianCurrency, calculateFinancialMetrics } from '../../utils/calculations.js';
import digilockerDemoService from '../../services/digilockerDemoService.js';

export default function MyDashboard({ user, onNavigate, onTriggerVoice }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [, setDashboardData] = useState(null);

  // Saved Items from LocalStorage
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [savedCategory, setSavedCategory] = useState('ideas'); // 'ideas' | 'schemes'

  // Load user profile, dashboard aggregation & saved items
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profRes, dashRes] = await Promise.allSettled([
          apiService.getProfile(),
          apiService.getDashboard()
        ]);

        const profileData = profRes.status === 'fulfilled' ? profRes.value : null;
        const dashData = dashRes.status === 'fulfilled' ? dashRes.value : null;
        setDashboardData(dashData);

        if (profileData?.exists && profileData.profile && (profileData.profile.monthlyRevenue > 0 || profileData.profile.investmentRequirement > 0 || profileData.profile.name)) {
          setProfile(profileData.profile);
          setFinancials(profileData.financials || calculateFinancialMetrics(profileData.profile));
        } else if (dashData && !dashData.isEmpty && dashData.financialSummary && (dashData.financialSummary.investmentRequirement > 0 || dashData.ownerName)) {
          setProfile({
            name: dashData.ownerName,
            businessType: dashData.businessType,
            district: dashData.district,
            state: dashData.state || 'Maharashtra',
            investmentRequirement: dashData.financialSummary.investmentRequirement,
            monthlyRevenue: dashData.financialSummary.monthlyRevenue,
            monthlyExpenses: dashData.financialSummary.monthlyExpenses,
            ownContribution: dashData.financialSummary.ownContribution
          });
          setFinancials(dashData.financialSummary);
        } else {
          setProfile(null);
          setFinancials(null);
        }
      } catch (e) {
        console.warn('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Load saved items
    try {
      const ideas = JSON.parse(localStorage.getItem('vyapar_saved_ideas') || '[]');
      setSavedIdeas(Array.isArray(ideas) ? ideas : []);
    } catch (e) {}

    try {
      const schemes = JSON.parse(localStorage.getItem('vyapar_saved_schemes') || '[]');
      setSavedSchemes(Array.isArray(schemes) ? schemes : []);
    } catch (e) {}
  }, [user]);

  // Remove saved item handlers
  const handleRemoveIdea = (ideaId, e) => {
    e.stopPropagation();
    const updated = savedIdeas.filter(item => (item.id || item.title) !== ideaId);
    setSavedIdeas(updated);
    localStorage.setItem('vyapar_saved_ideas', JSON.stringify(updated));
  };

  const handleRemoveScheme = (schemeId, e) => {
    e.stopPropagation();
    const updated = savedSchemes.filter(item => (item.id || item.name) !== schemeId);
    setSavedSchemes(updated);
    localStorage.setItem('vyapar_saved_schemes', JSON.stringify(updated));
  };

  // Check verified documents from shared digilocker service
  const dlState = digilockerDemoService.getConnectionState();
  const uploadedDocs = digilockerDemoService.getUserUploadedDocuments() || [];
  const allDocuments = [
    ...(dlState?.importedDocs || []),
    ...uploadedDocs
  ];

  // Calculate profile completion percentage based on actual fields
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const checks = [
      Boolean(profile.name || user?.name),
      Boolean(profile.businessType),
      Boolean(profile.district || user?.district),
      Boolean(profile.state || user?.state),
      Boolean(profile.monthlyRevenue && profile.monthlyRevenue > 0),
      Boolean(profile.investmentRequirement && profile.investmentRequirement > 0),
      Boolean(allDocuments.length > 0)
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  };

  const profilePercent = calculateProfileCompletion();
  const activeMetrics = financials || (profile ? calculateFinancialMetrics(profile) : null);
  const displayName = user?.name ? user.name.split(' ')[0] : (profile?.name ? profile.name.split(' ')[0] : 'Entrepreneur');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-3 select-none">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b2545] mx-auto"></div>
        <p className="text-xs font-bold text-stone-500">{t('dashboard.loading_workspace', 'Loading workspace...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none space-y-6 text-stone-900">
      
      {/* =========================================================================
          1. WELCOME / IDENTITY HEADER
          ========================================================================= */}
      <div className="border-b border-stone-200/80 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#0b2545] uppercase">
              MY DASHBOARD
            </span>
            <h1 className="text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-stone-900 tracking-tight leading-[1.2] mt-0.5">
              {t('dashboard.top_welcome', 'Welcome back')}, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              {t('dashboard.top_subtitle', 'Enterprise financial overview, saved bookmarks, and next milestones.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/profile')}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 text-xs font-bold bg-white transition-all shadow-2xs cursor-pointer"
            >
              {t('dashboard.edit_profile', 'View / Edit Profile →')}
            </button>

            {onTriggerVoice && (
              <button
                type="button"
                onClick={onTriggerVoice}
                className="px-3.5 py-1.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Mic size={14} className="text-amber-400" />
                <span>{t('voice.voice_advisor', 'Voice Advisor')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BUSINESS IDENTITY SUMMARY
          ========================================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                BUSINESS IDENTITY
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>{profilePercent}% Complete</span>
              </span>
            </div>

            {profile?.name || user?.businessName ? (
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>{profile?.name || user?.businessName}</span>
                </h2>
                <p className="text-xs text-stone-600 font-medium mt-0.5 flex items-center gap-1.5">
                  <Building2 size={13} className="text-stone-400 shrink-0" />
                  <span>{profile?.businessType || 'MSME Enterprise'}</span>
                  <span className="text-stone-300">•</span>
                  <MapPin size={13} className="text-stone-400 shrink-0" />
                  <span>{profile?.district || user?.district || 'Satara'}, {profile?.state || user?.state || 'Maharashtra'}</span>
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-base font-bold text-stone-700">
                  {t('dashboard.no_business_profile', 'No business profile registered yet.')}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Register enterprise details to compute eligible subsidies and financial health.
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/profile')}
              className="px-4 py-2 rounded-xl border border-stone-300 hover:border-stone-400 text-xs font-bold text-[#0b2545] hover:bg-stone-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{profile ? 'View / Edit Profile →' : 'Set Up Business Profile →'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FINANCIAL SNAPSHOT & 4. NEXT RECOMMENDED ACTION (Side-by-side grid)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 3. FINANCIAL SNAPSHOT (7 Cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
              {t('dashboard.financial_overview', 'FINANCIAL SNAPSHOT')}
            </span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/finance')}
              className="text-xs font-bold text-[#0b2545] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('dashboard.full_simulator', { defaultValue: 'Full Simulator' })}</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
            {activeMetrics && (activeMetrics.monthlyRevenue > 0 || activeMetrics.investmentRequirement > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-b sm:border-b-0 sm:border-r border-stone-100 pb-3 sm:pb-0 sm:pr-3 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    {t('dashboard.revenue_label', { defaultValue: 'Monthly Revenue' })}
                  </span>
                  <div className="text-lg sm:text-xl font-black text-stone-900">
                    {formatIndianCurrency(activeMetrics.monthlyRevenue || 0)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Annual: {formatIndianCurrency((activeMetrics.monthlyRevenue || 0) * 12)}
                  </span>
                </div>

                <div className="pb-3 sm:pb-0 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    {t('dashboard.expenses_label', { defaultValue: 'Monthly Expenses' })}
                  </span>
                  <div className="text-lg sm:text-xl font-black text-stone-900">
                    {formatIndianCurrency(activeMetrics.monthlyExpenses || 0)}
                  </div>
                  <span className="text-[10px] text-stone-500">{t('dashboard.operating_cost', { defaultValue: 'Operating Cost' })}</span>
                </div>

                <div className="border-t sm:border-r border-stone-100 pt-3 sm:pr-3 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    {t('dashboard.profit_label', 'Net Profit / Surplus')}
                  </span>
                  <div className="text-lg sm:text-xl font-black text-emerald-700">
                    {formatIndianCurrency(activeMetrics.monthlyProfit || 0)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Margin: {activeMetrics.netProfitMargin || 0}%
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-3 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    {t('dashboard.funding_gap_label', 'Bank Loan Gap')}
                  </span>
                  <div className="text-lg sm:text-xl font-black text-[#0b2545]">
                    {formatIndianCurrency(activeMetrics.fundingGap || 0)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Req: {formatIndianCurrency(activeMetrics.investmentRequirement || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2.5">
                <p className="text-xs text-stone-600 font-medium">
                  {t('dashboard.no_financial_data', 'No financial data recorded yet. Add your business numbers to compute profit margin & loan gap.')}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/finance')}
                  className="px-4 py-2 rounded-xl bg-[#0b2545] text-white text-xs font-bold hover:bg-[#13315c] transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Add Financial Estimates →</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4. NEXT RECOMMENDED ACTION (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
            {t('dashboard.next_step', 'NEXT RECOMMENDED ACTION')}
          </span>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 min-h-[190px]">
            <div className="space-y-1.5">
              {!profile ? (
                <>
                  <h4 className="text-sm font-black text-stone-900">
                    Complete Business Profile
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    Register your business entity name, location, and industry sector to unlock official CMEGP/PMEGP subsidy calculations.
                  </p>
                </>
              ) : allDocuments.length === 0 ? (
                <>
                  <h4 className="text-sm font-black text-stone-900">
                    Manage KYC & Documents
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    Connect DigiLocker or attach your business KYC documents in Meri Pehchaan for bank due diligence.
                  </p>
                </>
              ) : !activeMetrics || activeMetrics.monthlyRevenue === 0 ? (
                <>
                  <h4 className="text-sm font-black text-stone-900">
                    Enter Financial Estimates
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    Add your monthly sales and project cost to evaluate your debt-service coverage ratio (DSCR) and subsidy eligibility.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-black text-stone-900">
                    Generate Bank-Ready DPR Dossier
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    Your project cost of {formatIndianCurrency(activeMetrics.investmentRequirement || 600000)} is formatted. View and export your official Lead Bank project dossier.
                  </p>
                </>
              )}
            </div>

            <div>
              {!profile ? (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/profile')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Complete Profile →</span>
                </button>
              ) : allDocuments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/profile')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Manage KYC in Meri Pehchaan →</span>
                </button>
              ) : !activeMetrics || activeMetrics.monthlyRevenue === 0 ? (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/finance')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Enter Financials →</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/reports')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open DPR Dossier →</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          5. SAVED ITEMS (Compact section with Ideas | Schemes toggle)
          ========================================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              Saved Items
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Shortlisted business ideas and government schemes bookmarked for your enterprise.
            </p>
          </div>

          {/* Categories Toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSavedCategory('ideas')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                savedCategory === 'ideas'
                  ? 'bg-white text-[#0b2545] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark size={13} />
              <span>Business Ideas ({savedIdeas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSavedCategory('schemes')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                savedCategory === 'schemes'
                  ? 'bg-white text-[#0b2545] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award size={13} />
              <span>Schemes ({savedSchemes.length})</span>
            </button>
          </div>
        </div>

        {/* Content: Saved Business Ideas */}
        {savedCategory === 'ideas' && (
           <div>
             {savedIdeas.length === 0 ? (
               <div className="py-8 text-center space-y-2 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                 <Bookmark size={24} className="mx-auto text-stone-400" />
                 <p className="text-xs font-bold text-stone-700">{t('dashboard.no_saved_ideas', { defaultValue: 'No saved ideas bookmarked yet.' })}</p>
                 <p className="text-[11px] text-stone-500">{t('dashboard.no_saved_ideas_desc', { defaultValue: 'Discover viable rural business models and bookmark them for feasibility testing.' })}</p>
                 <button
                   type="button"
                   onClick={() => onNavigate && onNavigate('/business-ideas/discover')}
                   className="mt-1 text-xs font-bold text-[#0b2545] hover:underline cursor-pointer"
                 >
                   {t('dashboard.explore_ideas_btn', { defaultValue: 'Explore Business Ideas →' })}
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {savedIdeas.map((idea) => {
                   const ideaKey = idea.id || idea.title;
                   return (
                     <div
                       key={ideaKey}
                       className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 flex flex-col justify-between space-y-2 transition-all"
                     >
                       <div className="space-y-1">
                         <div className="flex items-start justify-between gap-2">
                           <h4 className="text-xs font-black text-stone-900 leading-snug">
                             {idea.title}
                           </h4>
                           <button
                             type="button"
                             onClick={(e) => handleRemoveIdea(ideaKey, e)}
                             className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                             title={t('dashboard.remove_bookmark', { defaultValue: 'Remove bookmark' })}
                           >
                             <Trash2 size={13} />
                           </button>
                         </div>
                         <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                           {idea.investmentRange || 'Budget: Moderate'}
                         </span>
                         <p className="text-[11px] text-stone-600 line-clamp-2 mt-1">
                           {idea.description || idea.shortDescription}
                         </p>
                       </div>

                       <div className="pt-2 border-t border-stone-200/60 flex justify-end">
                         <button
                           type="button"
                           onClick={() => onNavigate && onNavigate('/business-ideas/discover')}
                           className="text-[11px] font-bold text-[#0b2545] hover:underline flex items-center gap-1 cursor-pointer"
                         >
                           <span>{t('dashboard.explore_idea', { defaultValue: 'Explore Idea' })}</span>
                           <ArrowRight size={11} />
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
         )}

        {/* Content: Saved Government Schemes */}
        {savedCategory === 'schemes' && (
           <div>
             {savedSchemes.length === 0 ? (
               <div className="py-8 text-center space-y-2 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                 <Award size={24} className="mx-auto text-stone-400" />
                 <p className="text-xs font-bold text-stone-700">{t('dashboard.no_saved_schemes', { defaultValue: 'No saved schemes bookmarked yet.' })}</p>
                 <p className="text-[11px] text-stone-500">{t('dashboard.no_saved_schemes_desc', { defaultValue: 'Discover matching government subsidies and bookmark them for bank dossier preparation.' })}</p>
                 <button
                   type="button"
                   onClick={() => onNavigate && onNavigate('/schemes')}
                   className="mt-1 text-xs font-bold text-[#0b2545] hover:underline cursor-pointer"
                 >
                   {t('dashboard.discover_schemes_btn', { defaultValue: 'Discover Government Schemes →' })}
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {savedSchemes.map((scheme) => {
                   const schemeKey = scheme.id || scheme.name;
                   return (
                     <div
                       key={schemeKey}
                       className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 flex flex-col justify-between space-y-2 transition-all"
                     >
                       <div className="space-y-1">
                         <div className="flex items-start justify-between gap-2">
                           <h4 className="text-xs font-black text-stone-900 leading-snug">
                             {scheme.name}
                           </h4>
                           <button
                             type="button"
                             onClick={(e) => handleRemoveScheme(schemeKey, e)}
                             className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                             title={t('dashboard.remove_bookmark', { defaultValue: 'Remove bookmark' })}
                           >
                             <Trash2 size={13} />
                           </button>
                         </div>
                         <span className="inline-block text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                           {scheme.subsidyPercentage ? `${scheme.subsidyPercentage} Subsidy` : 'Direct Capital Subsidy'}
                         </span>
                         <p className="text-[11px] text-stone-600 line-clamp-2 mt-1">
                           {scheme.shortDescription || scheme.description}
                         </p>
                       </div>

                       <div className="pt-2 border-t border-stone-200/60 flex justify-end">
                         <button
                           type="button"
                           onClick={() => onNavigate && onNavigate('/schemes')}
                           className="text-[11px] font-bold text-[#0b2545] hover:underline flex items-center gap-1 cursor-pointer"
                         >
                           <span>{t('dashboard.explore_scheme', { defaultValue: 'Explore Scheme' })}</span>
                           <ArrowRight size={11} />
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
