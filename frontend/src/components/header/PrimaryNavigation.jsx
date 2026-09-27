import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrimaryNavigation({ 
  currentTab, 
  onNavigate 
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'mr';

  const tabLabels = {
    journey: {
      mr: 'उद्योग प्रवास',
      hi: 'उद्योग यात्रा',
      en: 'Journey'
    },
    market: {
      mr: 'बाजार संधी',
      hi: 'बाज़ार अवसर',
      en: 'Market'
    },
    finance: {
      mr: 'भांडवल',
      hi: 'वित्त एवं पूंजी',
      en: 'Finance'
    },
    schemes: {
      mr: 'योजना',
      hi: 'योजनाएं',
      en: 'Schemes'
    },
    equipment: {
      mr: 'यंत्रसामग्री',
      hi: 'यंत्रसामग्री',
      en: 'Equipment'
    }
  };

  const navTabs = [
    { 
      id: 'journey', 
      label: tabLabels.journey[lang] || tabLabels.journey.mr, 
      target: 'home',
      isActive: currentTab === 'home' || currentTab === 'journey' || currentTab === 'ideas'
    },
    { 
      id: 'market', 
      label: tabLabels.market[lang] || tabLabels.market.mr, 
      target: 'market',
      isActive: currentTab === 'market'
    },
    { 
      id: 'finance', 
      label: tabLabels.finance[lang] || tabLabels.finance.mr, 
      target: 'finance',
      isActive: currentTab === 'finance' || currentTab === 'planning' || currentTab === 'loanready' || currentTab === 'simulator'
    },
    { 
      id: 'schemes', 
      label: tabLabels.schemes[lang] || tabLabels.schemes.mr, 
      target: 'schemes',
      isActive: currentTab === 'schemes'
    },
    { 
      id: 'equipment', 
      label: tabLabels.equipment[lang] || tabLabels.equipment.mr, 
      target: 'equipment',
      isActive: currentTab === 'equipment' || currentTab === 'equipmenttest'
    }
  ];

  return (
    <nav 
      aria-label={t('nav.primary_nav_aria', { defaultValue: 'Primary Navigation' })}
      className="flex items-center gap-1 sm:gap-2 select-none"
    >
      {navTabs.map((tab) => {
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.target)}
            className={`px-2.5 sm:px-3 py-1 text-xs rounded-lg transition-all select-none cursor-pointer focus:outline-none ${
              tab.isActive
                ? 'bg-[#0b2545] text-white font-extrabold shadow-xs'
                : 'text-stone-700 hover:text-[#0b2545] hover:bg-stone-100 font-bold'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
