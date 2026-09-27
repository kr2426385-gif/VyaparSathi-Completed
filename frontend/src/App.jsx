import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Core Pages & Workflows
import Home from './pages/Home.jsx';
import BusinessIdeas from './pages/BusinessIdeas.jsx';
import LocalMarket from './pages/LocalMarket.jsx';
import FinancialCalculator from './components/calculator/FinancialCalculator.jsx';
import SchemesExplorer from './components/home/SchemesExplorer.jsx';
import LoanReadiness from './pages/LoanReadiness.jsx';
import GrowthGuidance from './pages/GrowthGuidance.jsx';
import SupportCenter from './pages/SupportCenter.jsx';
import AIAdvisor from './pages/AIAdvisor.jsx';
import AdvisorDashboard from './components/dashboard/AdvisorDashboard.jsx';
import BankerDashboard from './components/dashboard/BankerDashboard.jsx';
import AdminDashboard from './components/dashboard/AdminDashboard.jsx';
import RoleGuard from './components/auth/RoleGuard.jsx';
import MeriPehchaan from './components/profile/MeriPehchaan.jsx';
import LoginPage from './pages/LoginPage.jsx';
import EnterpriseAuroraBackground from './components/common/EnterpriseAuroraBackground.jsx';

// Equipment & Testing Pages
import EquipmentPage from './pages/equipment/EquipmentPage.jsx';

// ONDC Integration Page
import ONDCCommerce from './pages/ONDCCommerce.jsx';

// Modals
import AuthModal from './components/auth/AuthModal.jsx';
import VoiceAssistantModal from './components/voice/VoiceAssistantModal.jsx';
import CopilotModal from './components/ai/CopilotModal.jsx';

// Icons
import { Mic, Home as HomeIcon, Search, Calculator, MapPin, User, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { apiService } from './services/api.js';

// Legacy Tab Name to Clean Route Path Map
const TAB_TO_PATH_MAP = {
  home: '/',
  journey: '/',
  market: '/market',
  planning: '/finance',
  finance: '/finance',
  schemes: '/schemes',
  loanready: '/finance/loan-ready',
  growth: '/journey/growth',
  advisor: '/advisor',
  banker: '/banker',
  admin: '/admin',
  aiadvisor: '/ai-assistant',
  helpnear: '/support/nearby',
  dashboard: '/profile',
  pehchaan: '/profile',
  profile: '/profile',
  faqs: '/support/faq',
  simulator: '/finance/profitability',
  reports: '/reports',
  equipment: '/equipment',
  equipmenttest: '/equipment/testing',
  ondc: '/ondc'
};

// Settings Component
function SettingsView({ onToggleContrast, isHighContrast, onNavigate }) {
  const { t, i18n } = useTranslation();

  const handleClearCache = () => {
    localStorage.removeItem('vyapar_saved_ideas');
    localStorage.removeItem('vyapar_saved_schemes');
    localStorage.removeItem('vyapar_escalations');
    alert(t('app.offline_cache_cleared', { defaultValue: 'Prototype offline cache cleared successfully.' }));
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none space-y-6">
      <div className="border-b border-stone-200 pb-3">
        <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
          {t('access.text_size_adjust', { defaultValue: 'Platform Settings & Accessibility' })}
        </h1>
        <p className="text-xs text-stone-500 font-medium mt-0.5">
          {t('app.preferred_lang_desc', { defaultValue: 'Manage language, visual display, and stored offline prototype data.' })}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <strong className="text-sm font-black text-stone-900 block">{t('app.high_contrast_mode', { defaultValue: 'High Contrast Mode' })}</strong>
            <span className="text-xs text-stone-500">{t('app.high_contrast_desc', { defaultValue: 'Enhance readability for outdoor sunlight conditions' })}</span>
          </div>
          <button
            onClick={onToggleContrast}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isHighContrast 
                ? 'bg-[#0b2545] text-white border-[#0b2545]' 
                : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
            }`}
          >
            {isHighContrast ? t('common.enabled', { defaultValue: 'Enabled' }) : t('common.disabled', { defaultValue: 'Disabled' })}
          </button>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <strong className="text-sm font-black text-stone-900 block">{t('nav.language', { defaultValue: 'Language Selection' })}</strong>
            <span className="text-xs text-stone-500">{t('app.preferred_lang_desc', { defaultValue: 'Preferred advisory language' })}</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { code: 'mr', label: 'मराठी' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'en', label: 'English' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  i18n.language === lang.code
                    ? 'bg-[#0b2545] text-white border-[#0b2545]'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <strong className="text-sm font-black text-stone-900 block">{t('app.reset_cache_title', { defaultValue: 'Reset Offline Demonstration Data' })}</strong>
            <span className="text-xs text-stone-500">{t('app.reset_cache_desc', { defaultValue: 'Clear locally bookmarked ideas and schemes' })}</span>
          </div>
          <button
            onClick={handleClearCache}
            className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition-all"
          >
            {t('app.clear_data_btn', { defaultValue: 'Clear Local Data' })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authTargetTab, setAuthTargetTab] = useState('dashboard');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Check saved session on mount and listen to real-time profile updates
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('vyapar_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('vyapar_user');
        }
      }
    };
    loadUser();

    const handleProfileSync = (e) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
      } else {
        loadUser();
      }
    };
    window.addEventListener('vyapar_profile_updated', handleProfileSync);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('vyapar_profile_updated', handleProfileSync);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    if (updatedUser) {
      setUser(prev => ({
        ...prev,
        ...updatedUser
      }));
    }
  };

  // Compute active navigation tab for Header & Mobile Menu
  const computeActiveTab = (pathname) => {
    if (pathname === '/' || pathname.startsWith('/journey')) return 'home';
    if (pathname.startsWith('/market')) return 'market';
    if (pathname.startsWith('/finance/loan-ready')) return 'loanready';
    if (pathname.startsWith('/finance')) return 'planning';
    if (pathname.startsWith('/schemes')) return 'schemes';
    if (pathname.startsWith('/equipment/testing') || pathname.startsWith('/equipment-test')) return 'equipmenttest';
    if (pathname.startsWith('/equipment')) return 'equipment';
    if (pathname.startsWith('/ondc')) return 'ondc';
    if (pathname.startsWith('/business-ideas')) return 'ideas';
    if (pathname.startsWith('/advisor')) return 'advisor';
    if (pathname.startsWith('/banker')) return 'banker';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/dashboard')) return 'pehchaan';
    if (pathname.startsWith('/profile')) return 'pehchaan';
    if (pathname.startsWith('/support')) return 'helpnear';
    if (pathname.startsWith('/ai-assistant')) return 'advisor';
    return 'home';
  };

  const currentTab = computeActiveTab(location.pathname);

  // Unified navigation handler: accepts URL path OR legacy tab ID
  const handleNavigate = (pathOrTab) => {
    let targetPath = pathOrTab;

    // Check if it's a legacy tab ID
    if (TAB_TO_PATH_MAP[pathOrTab]) {
      targetPath = TAB_TO_PATH_MAP[pathOrTab];
    }

    // Profile auth check
    if (targetPath.startsWith('/profile') && !user) {
      handleOpenAuth('login', targetPath);
      return;
    }

    navigate(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromHeader = (query) => {
    setSearchQuery(query);
    navigate('/schemes/discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode = 'login', targetDestination = '/profile') => {
    setAuthMode(mode);
    setAuthTargetTab(targetDestination);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser, targetDestination = '/profile') => {
    setUser(authenticatedUser);
    if (targetDestination) {
      handleNavigate(targetDestination);
    } else {
      if (authenticatedUser?.role === 'admin') navigate('/admin');
      else if (authenticatedUser?.role === 'banker') navigate('/banker');
      else if (authenticatedUser?.role === 'advisor') navigate('/advisor');
      else navigate('/profile');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    navigate('/');
  };

  // Quick Demo Enterprise loader (Authenticates with real backend JWT)
  const handleOpenDemo = async (role = 'entrepreneur') => {
    try {
      const res = await apiService.demoLogin(role);
      setUser(res.user);
      setAuthOpen(false);
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'banker') navigate('/banker');
      else if (res.user.role === 'advisor') navigate('/advisor');
      else navigate('/profile');
    } catch (err) {
      console.warn('Backend demo auth failed:', err);
      // Resilient fallback
      const fallbackUser = {
        id: 'usr_demo_' + role,
        name: role === 'advisor' ? 'Dr. Suresh Deshmukh' : role === 'banker' ? 'Priya Kulkarni' : role === 'admin' ? 'State Admin' : 'Ramesh Patil',
        email: `${role}@vyaparsathi.in`,
        district: 'Satara',
        role
      };
      localStorage.setItem('vyapar_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      setAuthOpen(false);
      navigate(role === 'admin' ? '/admin' : role === 'banker' ? '/banker' : role === 'advisor' ? '/advisor' : '/profile');
    }
  };

  const handleToggleContrast = () => {
    setIsHighContrast(!isHighContrast);
    if (!isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // Activate interactive professional background across all enterprise workflow pages (Home has its own video & hero canvas)
  const showInteractiveBackground = location.pathname !== '/' && location.pathname !== '/journey';

  return (
    <div className={`relative min-h-screen flex flex-col bg-transparent text-stone-900 ${isHighContrast ? 'contrast-125' : ''}`}>
      
      {/* PROFESSIONAL ENTERPRISE AURORA & SILK WAVE BACKGROUND (Zero dot matrix, active for all workflow pages) */}
      {showInteractiveBackground && (
        <EnterpriseAuroraBackground isHighContrast={isHighContrast} />
      )}

      {/* 1. TOP PUBLIC-SERVICE UTILITY BAR & BRAND NAVIGATION */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onToggleContrast={handleToggleContrast}
        isHighContrast={isHighContrast}
        onSearch={handleSearchFromHeader}
      />

      {/* 2. ROUTE-DRIVEN APPLICATION WORKFLOWS */}
      <main className="flex-1 pb-16 md:pb-8 relative z-10">
        <Routes>
          {/* Home & 6-Step Journey Landing */}
          <Route 
            path="/" 
            element={
              <Home
                user={user}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
                onTriggerVoice={() => setVoiceOpen(true)}
              />
            } 
          />
          <Route 
            path="/journey" 
            element={
              <Home
                user={user}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
                onTriggerVoice={() => setVoiceOpen(true)}
              />
            } 
          />

          {/* 6 Journey Stages Direct URLs */}
          <Route path="/journey/idea" element={<BusinessIdeas defaultView="discover" onNavigate={handleNavigate} user={user} />} />
          <Route path="/journey/market" element={<LocalMarket defaultWorkflow="local-demand" onNavigate={handleNavigate} user={user} />} />
          <Route path="/journey/finance" element={<FinancialCalculator defaultWorkflow="project-cost" onNavigate={handleNavigate} user={user} />} />
          <Route path="/journey/schemes" element={<SchemesExplorer defaultWorkflow="match" onNavigate={handleNavigate} user={user} />} />
          <Route path="/journey/loan-ready" element={<LoanReadiness defaultWorkflow="loan-ready" onNavigate={handleNavigate} userProfile={user} />} />
          <Route path="/journey/growth" element={<GrowthGuidance onNavigate={handleNavigate} user={user} />} />

          {/* Business Ideas Sub-routes */}
          <Route path="/business-ideas" element={<BusinessIdeas defaultView="discover" onNavigate={handleNavigate} user={user} />} />
          <Route path="/business-ideas/discover" element={<BusinessIdeas defaultView="discover" onNavigate={handleNavigate} user={user} />} />
          <Route path="/business-ideas/compare" element={<BusinessIdeas defaultView="compare" onNavigate={handleNavigate} user={user} />} />
          <Route path="/business-plan" element={<BusinessIdeas defaultView="plan" onNavigate={handleNavigate} user={user} />} />

          {/* Market Sub-routes */}
          <Route path="/market" element={<LocalMarket defaultWorkflow="local-demand" onNavigate={handleNavigate} user={user} />} />
          <Route path="/market/:subview" element={<LocalMarket onNavigate={handleNavigate} user={user} />} />

          {/* Finance Sub-routes */}
          <Route path="/finance" element={<FinancialCalculator defaultWorkflow="project-cost" onNavigate={handleNavigate} user={user} />} />
          <Route path="/finance/loan-ready" element={<LoanReadiness defaultWorkflow="loan-ready" onNavigate={handleNavigate} userProfile={user} />} />
          <Route path="/finance/:subview" element={<FinancialCalculator onNavigate={handleNavigate} user={user} />} />

          {/* Schemes Sub-routes */}
          <Route path="/schemes" element={<SchemesExplorer defaultWorkflow="discover" onNavigate={handleNavigate} initialSearch={searchQuery} user={user} />} />
          <Route path="/schemes/:subview" element={<SchemesExplorer onNavigate={handleNavigate} initialSearch={searchQuery} user={user} />} />

          {/* Support Sub-routes */}
          <Route path="/support" element={<SupportCenter defaultTab="nearby" onNavigate={handleNavigate} user={user} />} />
          <Route path="/support/:subview" element={<SupportCenter onNavigate={handleNavigate} user={user} />} />

          {/* AI Assistant */}
          <Route path="/ai-assistant" element={<AIAdvisor onNavigate={handleNavigate} user={user} />} />

          {/* Equipment & Equipment Testing Feature Routes */}
          <Route path="/equipment" element={<EquipmentPage user={user} onNavigate={handleNavigate} />} />
          <Route path="/equipment/testing" element={<EquipmentPage user={user} onNavigate={handleNavigate} initialTab="testing" />} />
          <Route path="/equipment/:subview" element={<EquipmentPage user={user} onNavigate={handleNavigate} />} />
          <Route path="/equipment-test" element={<Navigate to="/equipment/testing" replace />} />
          <Route path="/equipment-vision" element={<Navigate to="/equipment/testing" replace />} />
          <Route path="/equipment-advisor" element={<Navigate to="/equipment" replace />} />
          <Route path="/equipment-advisor/:subview" element={<EquipmentPage user={user} onNavigate={handleNavigate} />} />

          {/* ONDC Commerce Gateway Routes */}
          <Route path="/ondc" element={<ONDCCommerce onNavigate={handleNavigate} user={user} />} />
          <Route path="/ondc-commerce" element={<ONDCCommerce onNavigate={handleNavigate} user={user} />} />

          {/* Role-Aware Dashboard Router (Entrepreneurs redirected directly to consolidated Meri Pehchaan) */}
          <Route 
            path="/dashboard" 
            element={
              user?.role === 'admin' ? (
                <AdminDashboard user={user} onNavigate={handleNavigate} />
              ) : user?.role === 'banker' ? (
                <BankerDashboard user={user} onNavigate={handleNavigate} />
              ) : user?.role === 'advisor' ? (
                <AdvisorDashboard user={user} onNavigate={handleNavigate} />
              ) : (
                <Navigate to="/profile" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/:subview" 
            element={
              user?.role === 'admin' ? (
                <AdminDashboard user={user} onNavigate={handleNavigate} />
              ) : user?.role === 'banker' ? (
                <BankerDashboard user={user} onNavigate={handleNavigate} />
              ) : user?.role === 'advisor' ? (
                <AdvisorDashboard user={user} onNavigate={handleNavigate} />
              ) : (
                <Navigate to="/profile" replace />
              )
            } 
          />

          {/* Dedicated Protected Role Portals with RoleGuard */}
          <Route 
            path="/advisor" 
            element={
              <RoleGuard user={user} allowedRoles={['advisor', 'admin']} onOpenAuth={handleOpenAuth}>
                <AdvisorDashboard user={user} onNavigate={handleNavigate} />
              </RoleGuard>
            } 
          />
          <Route 
            path="/advisor/*" 
            element={
              <RoleGuard user={user} allowedRoles={['advisor', 'admin']} onOpenAuth={handleOpenAuth}>
                <AdvisorDashboard user={user} onNavigate={handleNavigate} />
              </RoleGuard>
            } 
          />

          <Route 
            path="/banker" 
            element={
              <RoleGuard user={user} allowedRoles={['banker', 'admin']} onOpenAuth={handleOpenAuth}>
                <BankerDashboard user={user} onNavigate={handleNavigate} />
              </RoleGuard>
            } 
          />
          <Route 
            path="/banker/*" 
            element={
              <RoleGuard user={user} allowedRoles={['banker', 'admin']} onOpenAuth={handleOpenAuth}>
                <BankerDashboard user={user} onNavigate={handleNavigate} />
              </RoleGuard>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <RoleGuard user={user} allowedRoles={['admin']} onOpenAuth={handleOpenAuth}>
                <AdminDashboard user={user} onNavigate={handleNavigate} />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <RoleGuard user={user} allowedRoles={['admin']} onOpenAuth={handleOpenAuth}>
                <AdminDashboard user={user} onNavigate={handleNavigate} />
              </RoleGuard>
            } 
          />

          {/* DPR Reports Full View */}
          <Route path="/reports" element={<LoanReadiness defaultWorkflow="reports" onNavigate={handleNavigate} userProfile={user} />} />

          {/* Business Profile (Meri Pehchaan) */}
          <Route 
            path="/profile" 
            element={
              <MeriPehchaan
                user={user}
                onOpenAuth={handleOpenAuth}
                onProfileUpdated={handleProfileUpdated}
              />
            } 
          />

          {/* Auth Direct Links */}
          <Route 
            path="/login" 
            element={
              <LoginPage onLoginSuccess={handleAuthSuccess} />
            } 
          />
          <Route 
            path="/register" 
            element={
              <LoginPage onLoginSuccess={handleAuthSuccess} />
            } 
          />

          {/* Platform Settings */}
          <Route 
            path="/settings" 
            element={
              <SettingsView 
                onToggleContrast={handleToggleContrast} 
                isHighContrast={isHighContrast} 
                onNavigate={handleNavigate} 
              />
            } 
          />

          {/* Catch-all: Home */}
          <Route 
            path="*" 
            element={
              <Home
                user={user}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
                onTriggerVoice={() => setVoiceOpen(true)}
              />
            } 
          />
        </Routes>
      </main>

      {/* 3. PUBLIC-SERVICE OFFICIAL FOOTER */}
      <Footer onNavigate={handleNavigate} />

      {/* 4. PERSISTENT FLOATING VOICE ASSISTANT BUTTON */}
      <button
        onClick={() => setVoiceOpen(true)}
        className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-40 p-3.5 md:p-4 rounded-full bg-[#0b2545] hover:bg-[#13315c] text-amber-400 shadow-2xl border-2 border-amber-400/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        aria-label={t('voice.voice_advisor', { defaultValue: 'Activate Voice Assistant' })}
        title={t('voice.modal_title', { defaultValue: 'Voice Assistant (मराठी • हिंदी • English)' })}
      >
        <Mic size={22} className="group-hover:animate-pulse" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-black text-white pl-0 group-hover:pl-2">
          {t('voice.ask_btn', { defaultValue: 'Ask' })}
        </span>
      </button>

      {/* 5. MOBILE BOTTOM PERSISTENT NAVIGATION BAR */}
      <nav 
        aria-label={t('nav.bottom_nav_aria', { defaultValue: 'Mobile Navigation Bar' })}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1 px-0.5 flex justify-around items-center shadow-lg"
      >
        <button
          onClick={() => handleNavigate('/')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[9px] xs:text-[10px] font-bold min-w-0 flex-1 ${
            currentTab === 'home' ? 'text-[#0b2545]' : 'text-stone-500'
          }`}
        >
          <HomeIcon size={16} />
          <span className="truncate max-w-[46px] xs:max-w-none">{t('journey.step_idea', { defaultValue: 'Journey' })}</span>
        </button>

        <button
          onClick={() => handleNavigate('/market')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[9px] xs:text-[10px] font-bold min-w-0 flex-1 ${
            currentTab === 'market' ? 'text-[#0b2545]' : 'text-stone-500'
          }`}
        >
          <Compass size={16} />
          <span className="truncate max-w-[46px] xs:max-w-none">{t('journey.step_market', { defaultValue: 'Market' })}</span>
        </button>

        <button
          onClick={() => handleNavigate('/finance')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[9px] xs:text-[10px] font-bold min-w-0 flex-1 ${
            currentTab === 'planning' ? 'text-[#0b2545]' : 'text-stone-500'
          }`}
        >
          <Calculator size={16} />
          <span className="truncate max-w-[46px] xs:max-w-none">{t('journey.step_finance', { defaultValue: 'Finance' })}</span>
        </button>

        <button
          onClick={() => handleNavigate('/schemes')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[9px] xs:text-[10px] font-bold min-w-0 flex-1 ${
            currentTab === 'schemes' ? 'text-[#0b2545]' : 'text-stone-500'
          }`}
        >
          <Search size={16} />
          <span className="truncate max-w-[46px] xs:max-w-none">{t('journey.step_schemes', { defaultValue: 'Schemes' })}</span>
        </button>

        <button
          onClick={() => handleNavigate('/finance/loan-ready')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[9px] xs:text-[10px] font-bold min-w-0 flex-1 ${
            location.pathname.includes('loan-ready') ? 'text-[#0b2545]' : 'text-stone-500'
          }`}
        >
          <ShieldCheck size={16} />
          <span className="truncate max-w-[46px] xs:max-w-none">{t('journey.step_loan', { defaultValue: 'Loan' })}</span>
        </button>

        <button
          onClick={() => handleNavigate('/profile')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[9px] xs:text-[10px] font-bold min-w-0 flex-1 ${
            currentTab === 'pehchaan' ? 'text-[#0b2545]' : 'text-stone-500'
          }`}
        >
          <User size={16} />
          <span className="truncate max-w-[46px] xs:max-w-none">{t('dashboard.profile', { defaultValue: 'Profile' })}</span>
        </button>
      </nav>

      {/* 6. MODALS */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        onOpenDemo={handleOpenDemo}
        initialMode={authMode}
        targetTab={authTargetTab}
      />

      <VoiceAssistantModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onNavigate={handleNavigate}
        userProfile={user}
      />

      {/* Enterprise AI Copilot Modal */}
      <CopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onNavigate={handleNavigate}
        userProfile={user}
      />



    </div>
  );
}
