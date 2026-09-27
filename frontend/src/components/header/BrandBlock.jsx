import React from 'react';
import { useTranslation } from 'react-i18next';
import VyaparSathiLogo from './VyaparSathiLogo.jsx';

export default function BrandBlock({ onNavigate, currentLanguage = 'mr' }) {
  const { t } = useTranslation();
  const subtitles = {
    mr: 'ग्रामीण भारतासाठी आपला डिजिटल व्यवसाय साथीदार',
    hi: 'ग्रामीण भारत के लिए आपका डिजिटल व्यवसाय साथी',
    en: 'Your Digital Business Partner for Rural India'
  };

  const subtitle = subtitles[currentLanguage] || subtitles.mr;

  return (
    <div 
      onClick={() => onNavigate('home')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate('home');
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={t('brand.homepage_aria', { defaultValue: 'VyaparSathi Homepage' })}
      title={t('brand.platform_title', { defaultValue: 'VyaparSathi Platform' })}
      className="flex items-center gap-2 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg p-0.5 transition-all select-none"
    >
      <VyaparSathiLogo size={30} className="transition-transform group-hover:scale-105 shrink-0" />
      <div className="flex flex-col">
        <span className="text-base sm:text-lg font-black tracking-tight leading-none flex items-center">
          <span className="text-[#0b2545]">{t('brand.vyapar_part', { defaultValue: 'VYAPAR' })}</span>
          <span className="text-[#FF6E00]">SA</span>
          <span className="text-[#0284C7]">T</span>
          <span className="text-[#16A34A]">HI</span>
        </span>
        <span className="text-[10px] text-stone-500 font-medium tracking-normal mt-0.5 leading-none hidden xs:inline-block max-w-[160px] sm:max-w-none truncate">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
