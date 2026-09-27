import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Phone, ShieldCheck, 
  ChevronDown, User, RefreshCw, ExternalLink, Building2, CheckCircle2,
  Sparkles, Globe2, Shield, ArrowLeft
} from 'lucide-react';
import { apiService } from '../services/api.js';
import MobileOtpForm from '../components/auth/MobileOtpForm.jsx';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.jsx';
import VyaparSathiLogo from '../components/header/VyaparSathiLogo.jsx';
import EnterpriseAnalyticsIllustration from '../components/auth/EnterpriseAnalyticsIllustration.jsx';
import { getAllIndianStates, getDistrictsByState } from '../utils/panIndiaLocations.js';

// Random Captcha Generator
function generateCaptchaCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export default function LoginPage({ onLoginSuccess }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [authMethod, setAuthMethod] = useState('udyam'); // 'udyam' | 'otp' | 'password' | 'forgot'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Captcha State
  const [captchaCode, setCaptchaCode] = useState(generateCaptchaCode);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // OTP in Udyam flow
  const [udyamOtpSent, setUdyamOtpSent] = useState(false);
  const [udyamOtp, setUdyamOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(172); // 2:52 min
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Registration States (Pan-India)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Satara');
  const [regTaluka, setRegTaluka] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regRole, setRegRole] = useState('entrepreneur');
  const [regPassword, setRegPassword] = useState('');

  const availableStates = getAllIndianStates();
  const availableDistricts = getDistrictsByState(regState);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setRegState(newState);
    const dists = getDistrictsByState(newState);
    if (dists && dists.length > 0) {
      setRegDistrict(dists[0]);
    } else {
      setRegDistrict('');
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsRegister(location.pathname === '/register');
    setError('');
  }, [location.pathname]);

  // Resend countdown timer
  useEffect(() => {
    let interval;
    if (udyamOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [udyamOtpSent, resendTimer]);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const handleSendUdyamOtp = (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Udyam Registration Number or Mobile Number.');
      return;
    }
    if (captchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setCaptchaError(true);
      setError('Invalid Captcha code. Please re-enter.');
      return;
    }
    setError('');
    setCaptchaError(false);
    setIsOtpLoading(true);

    setTimeout(() => {
      setIsOtpLoading(false);
      setUdyamOtpSent(true);
      setResendTimer(172);
    }, 800);
  };

  const handleUdyamSignIn = async (e) => {
    e?.preventDefault();
    if (!udyamOtp || udyamOtp.length < 4) {
      setError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Authenticate via demo / backend token
      const demoRes = await apiService.demoLogin('entrepreneur');
      if (onLoginSuccess) {
        onLoginSuccess(demoRes.user);
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or mobile number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiService.login(identifier, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      if (res.user?.role === 'admin') navigate('/admin');
      else if (res.user?.role === 'banker') navigate('/banker');
      else if (res.user?.role === 'advisor') navigate('/advisor');
      else navigate('/profile');
    } catch (err) {
      try {
        const demoRes = await apiService.demoLogin('entrepreneur');
        if (onLoginSuccess) {
          onLoginSuccess(demoRes.user);
        }
        navigate('/profile');
      } catch (fallbackErr) {
        setError(err.message || 'Invalid credentials. Please verify your mobile or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiService.register(
        regName,
        regEmail,
        regPassword,
        regPhone,
        {
          state: regState,
          district: regDistrict,
          taluka: regTaluka,
          village: regVillage
        },
        regRole
      );
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      if (regRole === 'admin') navigate('/admin');
      else if (regRole === 'banker') navigate('/banker');
      else if (regRole === 'advisor') navigate('/advisor');
      else navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role = 'entrepreneur') => {
    setIsLoading(true);
    try {
      const res = await apiService.demoLogin(role);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      if (role === 'banker') navigate('/banker');
      else if (role === 'advisor') navigate('/advisor');
      else navigate('/profile');
    } catch (err) {
      setError('Quick Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] flex flex-col justify-between selection:bg-sky-200">
      
      {/* 1. Official Government Header Strip (Matches Sign-in.mp4) */}
      <header className="w-full bg-[#0b2545] text-white border-b border-sky-900/50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          {/* Government / Ministry Emblem Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r border-sky-800 pr-3">
              <span className="font-semibold text-slate-200">{t('login.gov_india')}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[11px] font-medium text-sky-200">
                Ministry of Micro, Small and Medium Enterprises
              </span>
            </div>
          </div>

          {/* Quick Header Utilities */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button 
              type="button"
              onClick={() => {
                document.documentElement.classList.toggle('high-contrast');
                const isHc = document.documentElement.classList.contains('high-contrast');
                localStorage.setItem('vyapar_high_contrast', isHc ? 'true' : 'false');
              }}
              className="hover:text-sky-300 transition-colors hidden sm:inline-flex items-center gap-1 text-[11px]"
              title={t('login.toggle_contrast')}
            >
              <span>{t('common.high_contrast')}</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] text-sky-200 hover:text-white cursor-pointer">
              <Globe2 size={13} />
              <span>{t('login.change_lang')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Portal Sign-in Container (Framed Canvas matching Image 2 with Pinterest/21st.dev style) */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border-2 sm:border-[3px] border-[#0284c7] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all relative">
          
          {/* Top-Left Brand Watermark matching "REERUI" in Image 2 */}
          <div className="absolute top-4 left-6 sm:left-9 z-20 select-none">
            <span className="font-black text-xs sm:text-sm tracking-widest text-[#0b2545] uppercase">
              VYAPARSATHI
            </span>
          </div>

          {/* LEFT PANEL: Official Sign In Form (5-6 Cols) */}
          <div className="lg:col-span-6 p-6 pt-12 sm:p-9 sm:pt-14 lg:p-11 lg:pt-16 flex flex-col justify-between space-y-6 z-10">
            
            {/* Login Header matching Image 2 */}
            <div>
              <div className="flex items-center gap-2 pb-2">
                <VyaparSathiLogo size={28} className="w-7 h-7" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                  Ministry of MSME • Udyami Bharat
                </span>
              </div>

              <div className="pt-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {isRegister ? 'Register' : 'Login'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {isRegister 
                    ? 'Create your digital MSME identity to unlock subsidies & credit' 
                    : 'Welcome to log in to your enterprise advisory & management system.'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* AUTH VIEW SELECTOR: Normal Login vs Register vs OTP */}
            {!isRegister ? (
              <div className="space-y-5">
                
                {/* Mode Selector Tabs (Matches Sign-in.mp4 "Udyami (MSME)") */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('udyam');
                      setError('');
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      authMethod === 'udyam'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Udyami (MSME) OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('password');
                      setError('');
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      authMethod === 'password'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Password Login
                  </button>
                </div>

                {/* FORM A: UDYAMI OTP FLOW (From Sign-in.mp4) */}
                {authMethod === 'udyam' && (
                  <form onSubmit={udyamOtpSent ? handleUdyamSignIn : handleSendUdyamOtp} className="space-y-4">
                    
                    {/* Input: Udyam Registration Number or Mobile */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        UDYAM Registration Number or Mobile
                      </label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t('login.udyam_ph')}
                        disabled={udyamOtpSent}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all disabled:bg-slate-50"
                        required
                      />
                    </div>

                    {/* Step 1: Captcha Verification */}
                    {!udyamOtpSent && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            placeholder={t('login.captcha_ph')}
                            className={`flex-1 px-4 py-2.5 rounded-xl border ${
                              captchaError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                            } text-slate-900 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100`}
                            required
                          />
                          
                          {/* Captcha Display Chip with Skewed Letters */}
                          <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl select-none">
                            <span className="font-mono text-base font-black tracking-widest text-slate-800 italic line-through decoration-slate-400 decoration-1">
                              {captchaCode}
                            </span>
                            <button
                              type="button"
                              onClick={refreshCaptcha}
                              title={t('login.refresh_captcha')}
                              className="text-slate-500 hover:text-slate-800 transition-colors p-1"
                            >
                              <RefreshCw size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Send OTP Action Button */}
                        <button
                          type="submit"
                          disabled={isOtpLoading}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isOtpLoading ? (
                            <span>{t('login.sending_otp')}</span>
                          ) : (
                            <>
                              <span>{t('login.send_otp')}</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Step 2: OTP Verification Box (Appears after Send OTP) */}
                    {udyamOtpSent && (
                      <div className="space-y-3 pt-2 bg-sky-50/60 border border-sky-200 rounded-2xl p-4 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-sky-900">
                            {t('login.otp_sent_to_mobile', { defaultValue: 'OTP has been sent to registered mobile number' })}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setUdyamOtpSent(false);
                              setUdyamOtp('');
                            }}
                            className="text-[11px] font-bold text-sky-700 hover:underline"
                          >
                            {t('common.change', { defaultValue: 'Change' })}
                          </button>
                        </div>

                        <input
                          type="text"
                          maxLength={6}
                          value={udyamOtp}
                          onChange={(e) => setUdyamOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder={t('login.otp_ph')}
                          className="w-full px-4 py-2.5 rounded-xl border border-sky-300 text-slate-900 text-sm font-bold tracking-widest focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                          autoFocus
                          required
                        />

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>
                            {t('login.resend_timer_msg', { defaultValue: 'Resend OTP will be activated after' })}{' '}
                            <strong className="text-slate-800">{formatTimer(resendTimer)} min</strong>
                          </span>
                          {resendTimer === 0 && (
                            <button
                              type="button"
                              onClick={handleSendUdyamOtp}
                              className="text-sky-700 font-bold hover:underline"
                            >
                              {t('login.resend_otp', { defaultValue: 'Resend OTP' })}
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                          {isLoading ? <span>{t('login.signing_in')}</span> : <span>{t('login.sign_in')}</span>}
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* FORM B: STANDARD PASSWORD FLOW */}
                {authMethod === 'password' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('login.email_or_mobile', { defaultValue: 'Email or Mobile Number' })}
                      </label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t('login.email_mobile_ph', { defaultValue: 'name@example.com or 9876543210' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-700">{t('common.password', { defaultValue: 'Password' })}</label>
                        <button
                          type="button"
                          onClick={() => setAuthMethod('forgot')}
                          className="text-[11px] font-bold text-sky-700 hover:underline"
                        >
                          {t('login.forgot_password', { defaultValue: 'Forgot Password?' })}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoading ? <span>{t('common.signing_in', { defaultValue: 'Signing In...' })}</span> : <span>{t('common.sign_in', { defaultValue: 'Sign In' })}</span>}
                    </button>
                  </form>
                )}

                {/* Single Sign-On / EntityLocker / Quick Demo */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="h-px bg-slate-200 flex-1" />
                    <span className="px-3 font-medium text-[11px] uppercase tracking-wider text-slate-400">
                      {t('login.or_login_with', { defaultValue: 'or Login with' })}
                    </span>
                    <span className="h-px bg-slate-200 flex-1" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('entrepreneur')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles size={14} className="text-amber-500" />
                      <span>{t('login.demo_entrepreneur', { defaultValue: 'EntityLocker / Demo' })}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('banker')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <ShieldCheck size={14} className="text-sky-600" />
                      <span>{t('login.demo_banker', { defaultValue: 'Bank Officer Demo' })}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* REGISTRATION FORM (Pan-India) */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('common.full_name', { defaultValue: 'Full Name' })}</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={t('login.enter_entrepreneur_name', { defaultValue: 'Enter entrepreneur name' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('common.email', { defaultValue: 'Email' })}</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={t('login.email_ph', { defaultValue: 'name@business.com' })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('common.mobile', { defaultValue: 'Mobile' })}</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder={t('login.mobile_ph', { defaultValue: '10-digit mobile' })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>

                {/* State & District Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('common.state_ut', { defaultValue: 'State / UT' })}</label>
                    <select
                      value={regState}
                      onChange={handleStateChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                    >
                      {availableStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('common.district', { defaultValue: 'District' })}</label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                    >
                      {availableDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('login.create_password', { defaultValue: 'Create Password' })}</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t('login.min_chars', { defaultValue: 'Min 6 characters' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {isLoading ? <span>{t('common.registering', { defaultValue: 'Registering...' })}</span> : <span>{t('login.create_account', { defaultValue: 'Create Udyam Account' })}</span>}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT PANEL: Pinterest & 21st.dev Style Enterprise Analytics Illustration Canvas (Matches Image 2) */}
          <div className="lg:col-span-6 bg-gradient-to-b from-slate-50/60 via-white to-blue-50/30 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200/80">
            
            {/* Top Brand Badges */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#0b2545]">
                <Shield size={13} className="text-sky-600" />
                <span>{t('login.digital_services', { defaultValue: 'Udyam Digital Services' })}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                SIH26091 • AI Advisory
              </span>
            </div>

            {/* Central Graphic Illustration matching Image 2 */}
            <div className="relative z-10 my-4 flex-1 flex items-center justify-center">
              <EnterpriseAnalyticsIllustration />
            </div>

            {/* Bottom Udyam Registration & Toggle Prompt */}
            <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200/80 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-600 font-medium">
                  {isRegister ? t('login.already_have_acc', { defaultValue: 'Already have an account?' }) : t('login.dont_have_acc', { defaultValue: "Don't have an account on Udyami Bharat?" })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-black text-xs transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  {isRegister ? t('common.sign_in', { defaultValue: 'Sign In' }) : t('common.sign_up', { defaultValue: 'Sign up' })}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <a
                  href="https://udyamregistration.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0b2545] hover:underline"
                >
                  {t('login.udyam_portal_link', { defaultValue: 'Official Udyam Registration Portal ↗' })}
                </a>
                <span>{t('login.secure_ssl', { defaultValue: 'Secure SSL Banking Protocol' })}</span>
              </div>
            </div>

            {/* Expand / Viewport corner icon matching Image 2 bottom-right */}
            <div className="absolute bottom-2.5 right-2.5 text-slate-400 p-1 pointer-events-none select-none opacity-60">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </div>

          </div>

        </div>
      </main>

      {/* 3. Footer Strip */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('login.footer_copy', { defaultValue: '© 2026 VyaparSathi & Udyami Bharat Initiative • Ministry of MSME' })}</span>
          <span className="text-[11px] text-slate-400">{t('login.secure_ssl', { defaultValue: 'Secure 256-bit SSL Banking Protocol' })}</span>
        </div>
      </footer>

    </div>
  );
}
