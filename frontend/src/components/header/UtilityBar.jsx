import React from 'react';
import { Accessibility } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector.jsx';

export default function UtilityBar({ 
  onToggleContrast, 
  isHighContrast,
  onOpenAccessibility
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-[#071d34] text-white text-[11px] font-semibold py-1 px-3 sm:px-4 md:px-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-h-[26px]">
        
        {/* Left: Identity Status Label with Vertical Divider matching the reference image */}
        <div className="flex items-center gap-2 min-w-0 text-white">
          <span className="font-extrabold text-white tracking-wider text-[10px] sm:text-[11px] truncate">
            VYAPARSATHI
          </span>
          <span className="text-white/40 select-none hidden xs:inline">|</span>
          <span className="font-medium text-stone-200 text-[10px] sm:text-[11px] truncate hidden xs:inline">
            {t('utility.tagline', { defaultValue: 'MSME BUSINESS SUPPORT NETWORK' })}
          </span>
        </div>

        {/* Right: Accessibility Option & Change Language */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-white">
          
          {/* Accessibility Option */}
          <button
            type="button"
            onClick={onOpenAccessibility || onToggleContrast}
            aria-pressed={isHighContrast}
            aria-label={t('accessibility.open_options', { defaultValue: 'Open accessibility options' })}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer select-none text-white/95 hover:text-white hover:bg-white/15"
          >
            <Accessibility size={14} className="shrink-0" />
            <span className="hidden sm:inline">{t('accessibility.options_button', { defaultValue: 'Accessibility Option' })}</span>
            <span className="sm:hidden">{t('accessibility.title_short', { defaultValue: 'Accessibility' })}</span>
          </button>

          <span className="text-white/30 select-none">|</span>

          {/* Change Language Selector */}
          <LanguageSelector variant="dark" />

        </div>

      </div>
    </div>
  );
}
