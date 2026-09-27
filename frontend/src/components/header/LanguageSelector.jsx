import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, Check } from 'lucide-react';

export default function LanguageSelector({ variant = "dark" }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'mr', label: 'मराठी', fullLabel: 'मराठी (Marathi)' },
    { code: 'hi', label: 'हिंदी', fullLabel: 'हिंदी (Hindi)' },
    { code: 'en', label: 'English', fullLabel: 'English' }
  ];

  const currentLangObj = languages.find(l => l.code === (i18n.language || 'mr')) || languages[0];

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem('vyapar_lang', code);
      localStorage.setItem('i18nextLng', code);
      localStorage.setItem('vyapar_language', code);
    } catch (e) {
      // Ignore localStorage error if disabled
    }
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isDark = variant === "dark";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button styled with palette #13714C, #3AB67D, #A2E494, #E9EBED */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select language / भाषा निवडा"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AB67D] ${
          isDark
            ? 'bg-[#13714C] text-[#E9EBED] border-[#3AB67D]/60 hover:bg-[#0f593b] shadow-xs'
            : 'bg-[#E9EBED] text-[#13714C] border-[#A2E494] hover:bg-white shadow-xs'
        }`}
      >
        <Globe size={13} className="text-[#A2E494] shrink-0" />
        <span>{currentLangObj.label}</span>
        <ChevronDown 
          size={13} 
          className={`transition-transform duration-200 text-[#A2E494] ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-[#A2E494]/60 shadow-xl py-1 z-50 overflow-hidden animate-fadeIn"
        >
          {languages.map((lang) => {
            const isSelected = (i18n.language || 'mr') === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-[#E9EBED] text-[#13714C] font-black' 
                    : 'text-stone-700 hover:bg-[#E9EBED]/70 hover:text-[#13714C] font-semibold'
                }`}
              >
                <span>{lang.fullLabel}</span>
                {isSelected && <Check size={13} className="text-[#13714C] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
