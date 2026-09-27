import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Link, Moon, 
  ImageOff, MousePointer2, Droplet, Check,
  MoveHorizontal, ArrowUpDown
} from 'lucide-react';

export default function AccessibilityModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [activeOptions, setActiveOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('vyapar_accessibility_options');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [lineHeightLevel, setLineHeightLevel] = useState(() => {
    return activeOptions['line-height'] ? 2 : 0;
  });

  // Sync state changes with DOM classes
  useEffect(() => {
    const root = document.documentElement;

    // Bigger text
    if (activeOptions['bigger-text']) {
      root.classList.add('accessibility-bigger-text');
    } else {
      root.classList.remove('accessibility-bigger-text');
    }

    // Text spacing
    if (activeOptions['text-spacing']) {
      root.classList.add('accessibility-spacing');
    } else {
      root.classList.remove('accessibility-spacing');
    }

    // Line height
    if (activeOptions['line-height']) {
      root.classList.add('accessibility-line-height');
    } else {
      root.classList.remove('accessibility-line-height');
    }

    // Highlight links
    if (activeOptions['highlight-links']) {
      root.classList.add('accessibility-highlight-links');
    } else {
      root.classList.remove('accessibility-highlight-links');
    }

    // Dyslexia friendly
    if (activeOptions['dyslexia']) {
      root.classList.add('accessibility-dyslexia');
    } else {
      root.classList.remove('accessibility-dyslexia');
    }

    // Hide images
    if (activeOptions['hide-images']) {
      root.classList.add('accessibility-hide-images');
    } else {
      root.classList.remove('accessibility-hide-images');
    }

    // Large cursor
    if (activeOptions['cursor']) {
      root.classList.add('accessibility-large-cursor');
    } else {
      root.classList.remove('accessibility-large-cursor');
    }

    // Invert colors
    if (activeOptions['invert-colors']) {
      root.classList.add('accessibility-invert');
    } else {
      root.classList.remove('accessibility-invert');
    }

    // Dark mode
    if (activeOptions['dark-mode']) {
      root.classList.add('dark');
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('dark');
      root.classList.remove('high-contrast');
    }

    try {
      localStorage.setItem('vyapar_accessibility_options', JSON.stringify(activeOptions));
    } catch {}
  }, [activeOptions]);

  const toggleOption = (key) => {
    if (key === 'line-height') {
      const nextLevel = (lineHeightLevel + 1) % 4;
      setLineHeightLevel(nextLevel);
      setActiveOptions(prev => ({ ...prev, 'line-height': nextLevel > 0 }));
      return;
    }
    setActiveOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      {/* Accessibility Panel Modal (Small compact 3x3 cards) */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={t('accessibility.title', { defaultValue: 'Accessibility options' })}
        className="w-full max-w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden border border-purple-200 animate-slideDown select-none flex flex-col"
      >
        {/* Top Purple Banner Header */}
        <div className="bg-[#6332ea] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
          <h2 className="text-sm font-bold tracking-tight">
            {t('accessibility.title', { defaultValue: 'Accessibility options' })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('accessibility.close', { defaultValue: 'Close accessibility options' })}
            className="p-1 rounded-md text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={17} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Small 3x3 Tiles Grid */}
        <div className="p-2.5 overflow-y-auto grid grid-cols-3 gap-2 bg-[#f8f9ff]">
          
          {/* 1. Bigger Text */}
          <button
            type="button"
            onClick={() => toggleOption('bigger-text')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['bigger-text'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['bigger-text'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <span className="text-lg font-black mb-0.5 font-serif tracking-tighter">
              TT
            </span>
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.bigger_text', { defaultValue: 'Bigger Text' })}
            </span>
          </button>

          {/* 2. Text Spacing */}
          <button
            type="button"
            onClick={() => toggleOption('text-spacing')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['text-spacing'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['text-spacing'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <div className="flex flex-col items-center mb-0.5">
              <span className="text-sm font-black leading-none">A</span>
              <MoveHorizontal size={12} className="mt-0.5" />
            </div>
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.text_spacing', { defaultValue: 'Text Spacing' })}
            </span>
          </button>

          {/* 3. Line Height */}
          <button
            type="button"
            onClick={() => toggleOption('line-height')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['line-height'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['line-height'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <ArrowUpDown size={18} className="mb-0.5" />
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.line_height', { defaultValue: 'Line Height' })}
            </span>
            {activeOptions['line-height'] && (
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4].map(idx => (
                  <span 
                    key={idx} 
                    className={`h-0.5 w-1.5 rounded-full ${idx <= lineHeightLevel ? 'bg-[#6332ea]' : 'bg-purple-200'}`} 
                  />
                ))}
              </div>
            )}
          </button>

          {/* 4. Highlight Links */}
          <button
            type="button"
            onClick={() => toggleOption('highlight-links')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['highlight-links'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['highlight-links'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <Link size={18} className="mb-1" />
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.highlight_links', { defaultValue: 'Highlight Links' })}
            </span>
          </button>

          {/* 5. Dyslexia Friendly */}
          <button
            type="button"
            onClick={() => toggleOption('dyslexia')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions.dyslexia 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions.dyslexia && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <span className="text-lg font-black mb-0.5 font-serif">
              Df
            </span>
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.dyslexia', { defaultValue: 'Dyslexia' })}
            </span>
          </button>

          {/* 6. Hide Images */}
          <button
            type="button"
            onClick={() => toggleOption('hide-images')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['hide-images'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['hide-images'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <ImageOff size={18} className="mb-1" />
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.hide_images', { defaultValue: 'Hide Images' })}
            </span>
          </button>

          {/* 7. Cursor */}
          <button
            type="button"
            onClick={() => toggleOption('cursor')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions.cursor 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions.cursor && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <MousePointer2 size={18} className="mb-1" />
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.cursor', { defaultValue: 'Cursor' })}
            </span>
          </button>

          {/* 8. Light-Dark */}
          <button
            type="button"
            onClick={() => toggleOption('dark-mode')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['dark-mode'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['dark-mode'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <Moon size={18} className="mb-1" />
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.light_dark', { defaultValue: 'Light-Dark' })}
            </span>
          </button>

          {/* 9. Invert Colors */}
          <button
            type="button"
            onClick={() => toggleOption('invert-colors')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border transition-all cursor-pointer aspect-square text-center relative ${
              activeOptions['invert-colors'] 
                ? 'border-[#6332ea] ring-1.5 ring-[#6332ea]/30 shadow-xs text-[#6332ea]' 
                : 'border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            {activeOptions['invert-colors'] && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6332ea] text-white flex items-center justify-center text-[9px]">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <Droplet size={18} className="mb-1 fill-current" />
            <span className="text-[10px] font-bold leading-tight">
              {t('accessibility.invert_colors', { defaultValue: 'Invert Colors' })}
            </span>
          </button>

        </div>

        {/* Reset All Footer Button */}
        <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">
            {t('accessibility.active_count', { defaultValue: 'Active' })}: {Object.values(activeOptions).filter(Boolean).length}
          </span>
          <button
            type="button"
            onClick={() => {
              setLineHeightLevel(0);
              setActiveOptions({});
            }}
            className="text-[#6332ea] hover:text-purple-800 font-bold hover:underline cursor-pointer"
          >
            {t('accessibility.reset_all', { defaultValue: 'Reset all' })}
          </button>
        </div>

      </div>
    </div>
  );
}
