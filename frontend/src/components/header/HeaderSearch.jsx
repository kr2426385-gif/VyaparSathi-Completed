import React, { useState, useRef, useEffect } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Clearly defined local search destinations & keywords (no fake live govt API claims)
const SEARCHABLE_DESTINATIONS = [
  { 
    id: 'home', 
    title: 'Business Journey & Plan Builder', 
    category: 'Journey',
    keywords: ['journey', 'start', 'business plan', 'roadmap', 'growth', 'उद्यम', 'प्रवास'], 
    tab: 'home' 
  },
  { 
    id: 'market', 
    title: 'Local Market Opportunity & Feasibility', 
    category: 'Market',
    keywords: ['market', 'demand', 'competitor', 'price', 'mandi', 'wholesale', 'retail', 'बाजार', 'किंमत'], 
    tab: 'market' 
  },
  { 
    id: 'planning', 
    title: 'Financial Calculator & Capital Structuring', 
    category: 'Finance',
    keywords: ['finance', 'funding', 'calculator', 'emi', 'loan gap', 'promoter margin', 'भांडवल', 'हप्ता'], 
    tab: 'planning' 
  },
  { 
    id: 'schemes', 
    title: 'Government Schemes & Subsidies (CMEGP, PMEGP, MUDRA)', 
    category: 'Schemes',
    keywords: ['schemes', 'subsidy', 'cmegp', 'pmegp', 'mudra', 'pmfme', 'cgtmse', 'योजना', 'अनुदान'], 
    tab: 'schemes' 
  },
  { 
    id: 'loanready', 
    title: 'Bank Loan Readiness & DPR Summary Report', 
    category: 'Finance',
    keywords: ['loan readiness', 'dpr', 'bank appraisal', 'credit checklist', 'कर्ज सज्जता', 'प्रकल्प अहवाल'], 
    tab: 'loanready' 
  },
  { 
    id: 'advisor', 
    title: 'Business Ideas & Sector Advisory', 
    category: 'Journey',
    keywords: ['ideas', 'dairy', 'food processing', 'rural retail', 'advisor', 'व्यवसाय कल्पना'], 
    tab: 'advisor' 
  },
  { 
    id: 'helpnear', 
    title: 'District Industries Centre (DIC) & Support Desks', 
    category: 'Support',
    keywords: ['support', 'help', 'dic', 'lead bank', 'officer', 'center', 'सहाय्य केंद्र', 'मदत'], 
    tab: 'helpnear' 
  },
  { 
    id: 'pehchaan', 
    title: 'Meri Pehchaan (Business Identity & Profile)', 
    category: 'Profile',
    keywords: ['profile', 'pehchaan', 'identity', 'aadhaar', 'pan', 'digilocker', 'मेरी पहचान', 'उद्योजक ओळख'], 
    tab: 'pehchaan' 
  },
  { 
    id: 'faqs', 
    title: 'Frequently Asked Questions (FAQs)', 
    category: 'Support',
    keywords: ['faq', 'questions', 'eligibility', 'documents', 'प्रश्न'], 
    tab: 'faqs' 
  }
];

export default function HeaderSearch({ 
  onNavigate, 
  onSearch,
  isMobile = false,
  onCloseMobileMenu 
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Localized placeholder
  const placeholderText = i18n.language === 'mr' 
    ? 'योजना, भांडवल, व्यवसाय मदत शोधा...' 
    : i18n.language === 'hi' 
      ? 'योजनाएं, फंडिंग, बिजनेस मदद खोजें...' 
      : 'Search schemes, funding, business help...';

  // Filter local results based on user query
  const trimmed = query.trim().toLowerCase();
  const matchedResults = trimmed.length > 0 
    ? SEARCHABLE_DESTINATIONS.filter(item => {
        return (
          item.title.toLowerCase().includes(trimmed) ||
          item.category.toLowerCase().includes(trimmed) ||
          item.keywords.some(kw => kw.toLowerCase().includes(trimmed))
        );
      })
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    if (onCloseMobileMenu) onCloseMobileMenu();
    if (item.tab === 'schemes' && onSearch) {
      onSearch(query);
    } else {
      onNavigate(item.tab);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmed) return;

    if (matchedResults.length > 0) {
      const target = selectedIndex >= 0 ? matchedResults[selectedIndex] : matchedResults[0];
      handleSelect(target);
    } else {
      // Default to scheme search with entered keyword
      if (onCloseMobileMenu) onCloseMobileMenu();
      if (onSearch) {
        onSearch(query);
      } else {
        onNavigate('schemes');
      }
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < matchedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : matchedResults.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isMobile ? '' : 'max-w-xs lg:max-w-sm xl:max-w-md'}`}>
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center w-full"
        role="search"
      >
        <label htmlFor="header-search-input" className="sr-only">
          {placeholderText}
        </label>
        
        {/* Search Input */}
        <input
          id="header-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          autoComplete="off"
          className="w-full bg-stone-100 hover:bg-stone-150 focus:bg-white border border-stone-300 focus:border-[#0b2545] rounded-xl pl-9 pr-14 py-2 text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-500 transition-all focus:outline-none focus:ring-2 focus:ring-[#0b2545]/20 min-h-[40px]"
        />

        {/* Search Icon */}
        <Search 
          size={16} 
          className="absolute left-3 text-stone-500 pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Clear Button if query exists */}
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-12 p-1 text-stone-400 hover:text-stone-700 rounded-full"
            aria-label={t('common.clear_search', { defaultValue: 'Clear search input' })}
          >
            <X size={14} />
          </button>
        )}

        {/* Search Action Submit Button */}
        <button
          type="submit"
          aria-label={t('common.submit_search', { defaultValue: 'Submit search' })}
          className="absolute right-1.5 px-2.5 py-1 bg-[#0b2545] hover:bg-[#13315c] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center min-h-[30px]"
        >
          <span>{t('common.search', { defaultValue: 'Search' })}</span>
        </button>
      </form>

      {/* Autocomplete / Suggested Matching Dropdown */}
      {isOpen && trimmed.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden z-50 divide-y divide-stone-100 animate-fadeIn">
          {matchedResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto py-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                {t('header.matching_features', { defaultValue: 'Matching Features & Topics' })}
              </div>
              {matchedResults.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition-colors ${
                    idx === selectedIndex ? 'bg-blue-50 text-[#0b2545]' : 'hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold block truncate">{item.title}</span>
                    <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">{item.category}</span>
                  </div>
                  <ArrowRight size={14} className="text-stone-400 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-stone-500">
              <p className="font-semibold text-stone-700">{t('header.no_matching_found', { defaultValue: 'No matching feature or topic found.' })}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{t('header.press_enter_search', { defaultValue: `Press Enter to search all government schemes for "${query}"` })}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
