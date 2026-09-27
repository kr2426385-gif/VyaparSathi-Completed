import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AccessibilityControls({ 
  onToggleContrast, 
  isHighContrast,
  variant = "dark",
  compact = false 
}) {
  const { t } = useTranslation();
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1 (A-), 0 (A), 1 (A+)

  const adjustFontSize = (delta) => {
    const newLevel = Math.max(-1, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(newLevel);
    const root = document.documentElement;
    if (newLevel === -1) root.style.fontSize = '92%';
    else if (newLevel === 0) root.style.fontSize = '100%';
    else if (newLevel === 1) root.style.fontSize = '108%';
    else if (newLevel === 2) root.style.fontSize = '116%';
  };

  const isDark = variant === "dark";

  return (
    <div className="flex items-center gap-2">
      {/* 1. TEXT RESIZING (A- | A | A+) */}
      <div 
        role="group" 
        aria-label={t('accessibility.text_size_group', { defaultValue: 'Text size adjustment' })} 
        className={`flex items-center rounded-lg p-0.5 border text-xs font-bold ${
          isDark ? 'bg-white/10 border-white/20' : 'bg-stone-100 border-stone-200'
        }`}
      >
        <button 
          type="button"
          onClick={() => adjustFontSize(-1)}
          aria-label={t('accessibility.decrease_font', { defaultValue: 'Decrease font size' })}
          title="Decrease text size (A-)"
          className={`px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 min-h-[30px] flex items-center justify-center ${
            fontSizeLevel === -1 
              ? 'bg-amber-400 text-stone-950 font-black shadow-xs' 
              : isDark 
                ? 'text-white/90 hover:text-white hover:bg-white/10' 
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
          }`}
        >
          A-
        </button>
        <span className={`${isDark ? 'text-white/30' : 'text-stone-300'} text-[10px] select-none px-0.5`}>|</span>
        <button 
          type="button"
          onClick={() => adjustFontSize(0)}
          aria-label={t('accessibility.reset_font', { defaultValue: 'Reset default font size' })}
          title="Reset default text size (A)"
          className={`px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 min-h-[30px] flex items-center justify-center ${
            fontSizeLevel === 0 
              ? 'bg-amber-400 text-stone-950 font-black shadow-xs' 
              : isDark 
                ? 'text-white/90 hover:text-white hover:bg-white/10' 
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
          }`}
        >
          A
        </button>
        <span className={`${isDark ? 'text-white/30' : 'text-stone-300'} text-[10px] select-none px-0.5`}>|</span>
        <button 
          type="button"
          onClick={() => adjustFontSize(1)}
          aria-label={t('accessibility.increase_font', { defaultValue: 'Increase font size' })}
          title="Increase text size (A+)"
          className={`px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 min-h-[30px] flex items-center justify-center ${
            fontSizeLevel >= 1 
              ? 'bg-amber-400 text-stone-950 font-black shadow-xs' 
              : isDark 
                ? 'text-white/90 hover:text-white hover:bg-white/10' 
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
          }`}
        >
          A+
        </button>
      </div>

      {/* 2. HIGH CONTRAST TOGGLE (Hidden in compact mobile view if already shown in top bar) */}
      {!compact && (
        <button 
          type="button"
          onClick={onToggleContrast}
          aria-pressed={isHighContrast}
          aria-label={t('accessibility.toggle_contrast', { defaultValue: 'Toggle high contrast display mode' })}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all min-h-[32px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
            isHighContrast 
              ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs font-black' 
              : isDark 
                ? 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20 hover:text-white' 
                : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
          }`}
        >
          <span>{t('accessibility.high_contrast', { defaultValue: 'High Contrast' })}</span>
        </button>
      )}
    </div>
  );
}
