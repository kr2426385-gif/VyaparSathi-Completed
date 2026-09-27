import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mic, BookOpen, MapPin, Sliders } from 'lucide-react';

export default function BottomNav({ currentTab, onNavigate }) {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const navItems = [
    { id: 'pehchaan', label: isMr ? 'मेरी पहचान' : 'Meri Pehchaan', icon: User },
    { id: 'ai', label: t('nav_ai_advisor'), icon: Mic },
    { id: 'schemes', label: t('nav_schemes'), icon: BookOpen },
    { id: 'map', label: t('nav_market'), icon: MapPin },
    { id: 'simulator', label: t('nav_simulator'), icon: Sliders }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full select-none active:bg-stone-50 transition-all ${
                isActive ? 'text-primary' : 'text-stone-500'
              }`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon size={isActive ? 22 : 20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
              </div>
              <span className="text-[11px] font-bold mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
