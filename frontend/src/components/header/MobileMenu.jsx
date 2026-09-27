import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, HelpCircle, User, LogOut, CheckCircle2, 
  MapPin, ArrowRight, ShieldCheck, FileText, MessageSquareHeart 
} from 'lucide-react';

import AccessibilityControls from './AccessibilityControls.jsx';
import LanguageSelector from './LanguageSelector.jsx';

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  currentTab, 
  onNavigate, 
  user, 
  onOpenAuth, 
  onLogout,
  onOpenHelp,
  onToggleContrast,
  isHighContrast,
  onOpenAccessibility
}) {
  const { t, i18n } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navTranslations = {
    en: {
      journey: 'Journey',
      market: 'Market Feasibility',
      finance: 'Finance & Planning',
      schemes: 'Schemes & Subsidies',
      equipment: 'Equipment Advisor',
      equipmenttest: 'Equipment Testing',
      ondc: 'ONDC Digital Commerce',
      loanReady: 'Loan Readiness & DPR',
      ideas: 'Business Ideas & ML',
      dashboard: 'Dashboard',
      help: 'Feedback & Ratings',
      login: 'Login / Register',
      logout: 'Logout',
      account: 'My Profile (Meri Pehchaan)'
    },
    mr: {
      journey: 'उद्योग प्रवास (मार्गदर्शन व कल्पना)',
      market: 'स्थानिक बाजार संधी',
      finance: 'भांडवल व कर्ज नियोजन',
      schemes: 'शासकीय योजना व अनुदान',
      equipment: 'यंत्रसामग्री व उपकरणे',
      equipmenttest: 'यंत्र तपासणी (Equipment Testing)',
      ondc: 'ओएनडीसी डिजिटल बाजारपेठ',
      loanReady: 'कर्ज पात्रता व डीपीआर',
      ideas: 'व्यवसाय कल्पना व एमएल',
      dashboard: 'माझा डॅशबोर्ड',
      help: 'अभिप्राय व रेटिंग',
      login: 'लॉगिन / नोंदणी',
      logout: 'लॉगआउट',
      account: 'माझे प्रोफाईल'
    },
    hi: {
      journey: 'उद्यम यात्रा (रोडमैप व विचार)',
      market: 'स्थानीय बाजार अवसर',
      finance: 'वित्तीय योजना व ऋण',
      schemes: 'सरकारी योजनाएं व सब्सिडी',
      equipment: 'उपकरण व मशीनरी सलाहकार',
      equipmenttest: 'उपकरण परीक्षण (Equipment Testing)',
      ondc: 'ओएनडीसी डिजिटल कॉमर्स',
      loanReady: 'ऋण तैयारी व डीपीआर',
      ideas: 'व्यापार विचार व एआई',
      dashboard: 'मेरा डैशबोर्ड',
      help: 'फीडबैक एवं रेटिंग',
      login: 'लॉगिन / पंजीकरण',
      logout: 'लॉगआउट',
      account: 'मेरी प्रोफाइल'
    }
  };

  const currentLang = (i18n.language && ['mr', 'hi', 'en'].includes(i18n.language)) ? i18n.language : 'mr';
  const labels = navTranslations[currentLang] || navTranslations.mr;

  let items = [
    { id: 'home', label: labels.journey, tab: 'home' },
    { id: 'market', label: labels.market, tab: 'market' },
    { id: 'planning', label: labels.finance, tab: 'planning' },
    { id: 'schemes', label: labels.schemes, tab: 'schemes' },
    { id: 'equipment', label: labels.equipment, tab: 'equipment' },
    { id: 'loanready', label: labels.loanReady, tab: 'loanready' },
  ];

  if (user?.role === 'advisor') {
    items = [
      { id: 'home', label: labels.journey, tab: 'home' },
      { id: 'market', label: labels.market, tab: 'market' },
      { id: 'schemes', label: labels.schemes, tab: 'schemes' },
      { id: 'equipment', label: labels.equipment, tab: 'equipment' },
      { id: 'advisor', label: 'DIC Reviews & Dossiers', tab: '/advisor' },
    ];
  } else if (user?.role === 'banker') {
    items = [
      { id: 'planning', label: labels.finance, tab: 'planning' },
      { id: 'loanready', label: labels.loanReady, tab: 'loanready' },
      { id: 'schemes', label: 'Credit Subsidy Schemes', tab: 'schemes' },
      { id: 'banker', label: 'Credit Appraisal Pipeline', tab: '/banker' },
    ];
  } else if (user?.role === 'admin') {
    items = [
      { id: 'home', label: 'Platform Overview', tab: 'home' },
      { id: 'market', label: labels.market, tab: 'market' },
      { id: 'schemes', label: labels.schemes, tab: 'schemes' },
      { id: 'admin', label: 'State Administrative Console', tab: '/admin' },
    ];
  }

  const handleItemClick = (tabId) => {
    onNavigate(tabId);
    onClose();
  };

  return (
    <div 
      className="lg:hidden fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs flex flex-col justify-start pt-[100px] animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.mobile_menu_aria', { defaultValue: 'Mobile Navigation Menu' })}
    >
      <div 
        className="bg-white border-b border-stone-200 shadow-2xl px-4 py-4 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Meri Pehchaan Action Highlight */}
        <button
          type="button"
          onClick={() => {
            if (user) onNavigate('pehchaan');
            else onOpenAuth('login', 'pehchaan');
            onClose();
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-extrabold transition-all min-h-[44px] ${
            currentTab === 'pehchaan' || currentTab === 'profile'
              ? 'bg-[#0b2545] text-white border-[#0b2545] shadow-sm'
              : 'bg-emerald-50/70 hover:bg-emerald-100 text-[#0b2545] border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User size={18} className={currentTab === 'pehchaan' || currentTab === 'profile' ? 'text-white' : 'text-[#13714C]'} />
            <span>{currentLang === 'mr' ? 'मेरी पहचान' : 'Meri Pehchaan'}</span>
          </div>
          <ArrowRight size={16} className={currentTab === 'pehchaan' || currentTab === 'profile' ? 'text-white' : 'text-[#13714C]'} />
        </button>

        {/* 2. Primary Journey Navigation Items */}
        <nav className="space-y-1" aria-label={t('nav.mobile_main_aria', { defaultValue: 'Mobile Main Navigation' })}>
          {items.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.tab)}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors min-h-[44px] ${
                  isActive 
                    ? 'bg-[#0b2545] text-white' 
                    : 'text-stone-700 hover:bg-stone-100 active:bg-stone-200'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <CheckCircle2 size={16} className="text-amber-400" />}
              </button>
            );
          })}
        </nav>

        {/* 3. Help Action */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenHelp();
          }}
          className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 flex items-center gap-2 min-h-[44px]"
        >
          <MessageSquareHeart size={18} className="text-[#6332ea]" />
          <span>{labels.help}</span>
        </button>

        {/* 4. Language & Accessibility Section in Menu */}
        <div className="pt-3 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Language / भाषा
            </span>
            <LanguageSelector variant="light" />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (onOpenAccessibility) onOpenAccessibility();
                else if (onToggleContrast) onToggleContrast();
              }}
              className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 hover:text-[#6332ea] transition-colors"
            >
              <span>{t('accessibility.title', { defaultValue: 'Accessibility Options' })}</span>
            </button>
            <AccessibilityControls 
              onToggleContrast={onToggleContrast} 
              isHighContrast={isHighContrast}
              variant="light"
              compact={true} 
            />
          </div>
        </div>

        {/* 5. User Account / Session */}
        <div className="pt-3 border-t border-stone-200">
          {user ? (
            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div 
                className="flex items-center gap-2 cursor-pointer min-w-0"
                onClick={() => {
                  onNavigate('pehchaan');
                  onClose();
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#0b2545] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-stone-900 truncate">
                    {user.name || 'User'}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium flex items-center gap-1.5">
                    <span>{user.district || 'Maharashtra'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-stone-200 text-stone-800">
                      {user.role || 'entrepreneur'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={labels.logout}
                aria-label={labels.logout}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenAuth('login');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <User size={15} />
              <span>{labels.login}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
