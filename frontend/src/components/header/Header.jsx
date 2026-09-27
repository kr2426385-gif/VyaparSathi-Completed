import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, ChevronDown, Camera, LayoutDashboard, HelpCircle, LogIn, Sparkles, Search, MessageSquareHeart } from 'lucide-react';
import UtilityBar from './UtilityBar.jsx';
import BrandBlock from './BrandBlock.jsx';
import PrimaryNavigation from './PrimaryNavigation.jsx';
import MobileMenu from './MobileMenu.jsx';
import HelpSupportModal from './HelpSupportModal.jsx';
import AccessibilityModal from './AccessibilityModal.jsx';

export default function Header({
  currentTab,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  onToggleContrast,
  isHighContrast
}) {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // User Dropdown and Avatar State
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try {
      return localStorage.getItem('vyapar_user_avatar') || user?.avatar || '';
    } catch (e) {
      return '';
    }
  });

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync avatar if user prop changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user]);

  // Click outside and Escape key to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setAvatarUrl(base64);
      try {
        localStorage.setItem('vyapar_user_avatar', base64);
        const storedUser = JSON.parse(localStorage.getItem('vyapar_user') || '{}');
        storedUser.avatar = base64;
        localStorage.setItem('vyapar_user', JSON.stringify(storedUser));
      } catch (err) {
        console.warn('Could not save avatar to localStorage:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : 'K';

  return (
    <header className="relative z-40 w-full select-none shadow-xs">
      {/* 1. TOP UTILITY BAR (Dark Navy MSME network identity + High Contrast + Accessibility Modal Trigger + Language Selector) */}
      <UtilityBar 
        onToggleContrast={onToggleContrast} 
        isHighContrast={isHighContrast} 
        onOpenAccessibility={() => setAccessibilityModalOpen(true)}
      />

      {/* 2. MAIN NAVIGATION BAR (Clean White Header, Left-Corner Logo, Compact Height) */}
      <div className="w-full relative border-b border-stone-200/90 shadow-2xs select-none bg-white">
        <div className="w-full px-3 sm:px-5 lg:px-6 py-1 sm:py-1.5 flex items-center justify-between gap-2 sm:gap-4 min-h-[44px]">
          
          {/* LEFT: Official VyaparSathi Emblem + Brand Name (Shifted to Left Corner) */}
          <div className="shrink-0">
            <BrandBlock 
              onNavigate={onNavigate} 
              currentLanguage={i18n.language} 
            />
          </div>

          {/* CENTER: Navigation Tabs (Desktop & Tablet) */}
          <div className="hidden md:flex items-center overflow-x-auto no-scrollbar py-0.5">
            <PrimaryNavigation 
              currentTab={currentTab}
              onNavigate={onNavigate}
              user={user}
            />
          </div>

          {/* RIGHT: Auth Pill [👤 Log In / Sign Up] + Mobile Menu Button [☰] */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* User Profile Avatar (When logged in) OR Auth Pill [👤 Log In / Sign Up] (When logged out) */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2545]"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  title={user?.name || "Account"}
                >
                  <div className="w-5 h-5 rounded-full bg-[#0b2545] text-white flex items-center justify-center text-[10px] font-black overflow-hidden shrink-0 shadow-2xs">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-bold text-stone-800 max-w-[90px] truncate">
                    {user?.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown 
                    size={13} 
                    className={`text-stone-500 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-stone-900' : ''
                    }`} 
                  />
                </button>

                {/* Clean White Profile Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-24px)] rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-fadeIn select-none text-stone-800">
                    {/* Header Info */}
                    <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-10 h-10 rounded-full bg-[#13714C] text-white flex items-center justify-center text-base font-black shrink-0 overflow-hidden shadow-xs cursor-pointer group transition-all"
                        title="Click to upload/change avatar picture"
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={14} className="text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-900 truncate">
                          {user?.name || 'Kisan Entrepreneur'}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {user?.email || user?.phone || 'Verified Rural Enterprise'}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {user?.role === 'admin' ? 'Administrator' :
                           user?.role === 'banker' ? 'Bank Officer' :
                           user?.role === 'advisor' ? 'DIC Advisor' : 'MSME Entrepreneur'}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Navigation Options */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <div>{t('nav.meri_pehchaan', { defaultValue: 'Meri Pehchaan' })}</div>
                          <div className="text-[10px] text-stone-400 font-medium">{t('nav.meri_pehchaan_sub', { defaultValue: 'Business identity & profile' })}</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setHelpModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                          <MessageSquareHeart size={14} />
                        </div>
                        <div>
                          <div>{t('nav.feedback', { defaultValue: 'Feedback' })}</div>
                          <div className="text-[10px] text-stone-400 font-medium">{t('nav.feedback_sub', { defaultValue: 'Rate your experience' })}</div>
                        </div>
                      </button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-1 mt-1 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                          <LogOut size={14} />
                        </div>
                        <span>{t('nav.logout', { defaultValue: 'Logout' })}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Pill [👤 Log In / Sign Up] styled for white navbar */
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#0b2545] hover:bg-[#13315c] text-white text-[11px] sm:text-xs font-semibold shadow-2xs">
                <User size={12} className="text-stone-300 shrink-0 hidden xs:inline" />
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth('login');
                    else if (onNavigate) onNavigate('login');
                  }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <span className="text-white/40 text-[10px]">/</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth('register');
                    else if (onNavigate) onNavigate('login');
                  }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Button (Shows on < md) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('nav.open_menu', { defaultValue: 'Open navigation menu' })}
              className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 min-h-[34px] min-w-[34px] transition-colors cursor-pointer"
            >
              <Menu size={19} />
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Responsive Drawer */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentTab={currentTab}
        onNavigate={onNavigate}
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onOpenHelp={() => {
          setMobileMenuOpen(false);
          setHelpModalOpen(true);
        }}
        onToggleContrast={onToggleContrast}
        isHighContrast={isHighContrast}
        onOpenAccessibility={() => {
          setMobileMenuOpen(false);
          setAccessibilityModalOpen(true);
        }}
      />

      {/* Public Service Help & Support Modal */}
      <HelpSupportModal 
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Accessibility Grid Modal */}
      <AccessibilityModal 
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />
    </header>
  );
}
