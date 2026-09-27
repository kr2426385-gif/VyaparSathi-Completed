import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, ArrowRight, ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api.js';

export default function MobileOtpForm({ onSuccess, onBackToPassword }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('input-mobile'); // 'input-mobile' | 'verify-otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef([]);

  // Countdown timer for 30s resend cooldown
  useEffect(() => {
    let timer;
    if (step === 'verify-otp' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCountdown]);

  // Clean and format 10-digit mobile number
  const handleMobileChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      setMobile(raw);
      setError('');
    }
  };

  // Step 1: Send OTP through backend local development OTP system
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Mobile number must start with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMsg('');

    try {
      await apiService.sendOtp(mobile);
      setStep('verify-otp');
      setResendCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setInfoMsg('OTP sent successfully.');
      // Auto-focus first box after step transition
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.error('[Auth OTP] Send error:', err.message);
      setError(err.message || 'Failed to send OTP. Please check your mobile number.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setError('');
    setInfoMsg('');

    try {
      await apiService.sendOtp(mobile);
      setResendCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setInfoMsg('OTP sent successfully.');
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      console.error('[Auth OTP] Resend error:', err.message);
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle individual digit input and auto-advance
  const handleOtpDigitChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '');
    if (!sanitized) {
      const updated = [...otp];
      updated[index] = '';
      setOtp(updated);
      return;
    }

    const digit = sanitized[sanitized.length - 1]; // take latest entered digit
    const cleaned = digit;
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setError('');

    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across boxes
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Pasting 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasteData.length === 6) {
      const digits = pasteData.split('');
      setOtp(digits);
      setError('');
      otpInputsRef.current[5]?.focus();
    }
  };

  // Step 3: Verify 6-digit OTP and establish VyaparSathi Session
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiService.verifyOtp(mobile, fullOtp);
      if (onSuccess) {
        onSuccess(res.user);
      }
    } catch (err) {
      console.error('[Auth OTP] Verification error:', err.message);
      setError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone display with masking
  const maskedPhone = mobile.length === 10 
    ? `${mobile.slice(0, 2)}••••••${mobile.slice(8)}`
    : mobile;

  return (
    <div className="w-full space-y-4 animate-fadeIn">
      {step === 'input-mobile' ? (
        /* STEP 1: MOBILE NUMBER INPUT SCREEN */
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="text-center pb-1">
            <h3 className="text-base font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Phone size={16} className="text-[#54c463]" />
              <span>{t('login.mobile_otp_login', { defaultValue: 'Mobile OTP Login' })}</span>
            </h3>
            <p className="text-xs text-emerald-200/70 font-medium mt-0.5">
              {t('login.enter_mobile_desc', { defaultValue: 'Enter your mobile number to receive a 6-digit verification code' })}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#86efac]">
              {t('common.mobile', { defaultValue: 'Mobile Number' })}
            </label>
            <div className="relative flex items-center">
              {/* Indian Flag & Prefix Badge */}
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none gap-1.5 text-xs font-black text-emerald-200/90 border-r border-emerald-500/25 pr-2.5 my-2">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={mobile}
                onChange={handleMobileChange}
                placeholder={t('login.mobile_10_digits', { defaultValue: '10-digit mobile number' })}
                className="w-full pl-20 pr-4 py-3.5 rounded-2xl bg-black/30 border border-emerald-500/35 text-white placeholder:text-emerald-100/50 text-sm font-bold tracking-wider focus:outline-none focus:border-[#54c463] focus:ring-1 focus:ring-[#54c463]/40 transition-all shadow-inner"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-emerald-100/50 font-medium pl-1">
              {t('login.verification_code_note', { defaultValue: 'A 6-digit verification code will be generated for login/registration.' })}
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Action: Get OTP */}
          <button
            type="submit"
            disabled={isLoading || mobile.length !== 10}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#54c463] hover:bg-[#48b556] active:bg-[#3ca449] disabled:opacity-50 disabled:cursor-not-allowed text-[#06170c] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <span>{isLoading ? t('login.requesting_otp', { defaultValue: 'Requesting OTP...' }) : t('login.get_otp', { defaultValue: 'Get OTP' })}</span>
            <ArrowRight size={19} className="stroke-[2.8]" />
          </button>

          {/* Back to Password Login */}
          {onBackToPassword && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onBackToPassword}
                className="text-xs text-[#86efac] hover:text-white font-bold hover:underline cursor-pointer transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>{t('login.login_with_password_instead', { defaultValue: 'Login with Password instead' })}</span>
              </button>
            </div>
          )}
        </form>
      ) : (
        /* STEP 2: 6-DIGIT OTP VERIFICATION SCREEN */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center pb-1">
            <h3 className="text-base font-black text-white tracking-tight">
              {t('login.enter_verification_code', { defaultValue: 'Enter Verification Code' })}
            </h3>
            <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
              {t('login.enter_otp_sent_to', { defaultValue: 'Enter OTP sent to' })} <strong className="text-white font-bold">+91 {maskedPhone}</strong>
            </p>
          </div>

          {/* 6 Individual Digit Boxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 on-paste" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-11 h-12 sm:w-12 sm:h-13 rounded-xl sm:rounded-2xl text-center text-lg sm:text-xl font-black bg-black/40 border transition-all outline-none ${
                    digit 
                      ? 'border-[#54c463] text-white ring-2 ring-[#54c463]/30 bg-[#081f13]' 
                      : 'border-emerald-500/35 text-white/80 focus:border-[#54c463] focus:ring-2 focus:ring-[#54c463]/30'
                  }`}
                  required
                />
              ))}
            </div>

            {infoMsg && !error && (
              <p className="text-[11px] text-[#86efac] text-center font-bold">
                ✓ {infoMsg}
              </p>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verify & Login Button */}
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#54c463] hover:bg-[#48b556] active:bg-[#3ca449] disabled:opacity-50 disabled:cursor-not-allowed text-[#06170c] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <span>{isLoading ? t('login.verifying_otp', { defaultValue: 'Verifying OTP...' }) : t('login.verify_and_login', { defaultValue: 'Verify & Login' })}</span>
            <CheckCircle2 size={19} className="stroke-[2.5]" />
          </button>

          {/* Resend OTP & Change Number Controls */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              type="button"
              disabled={!canResend || isLoading}
              onClick={handleResendOtp}
              className={`font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                canResend 
                  ? 'text-[#54c463] hover:text-[#74e283] hover:underline' 
                  : 'text-stone-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{canResend ? t('login.resend_otp', { defaultValue: 'Resend OTP' }) : `${t('login.resend_otp', { defaultValue: 'Resend OTP' })} in ${resendCountdown}s`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('input-mobile');
                setError('');
                setInfoMsg('');
              }}
              className="text-stone-300 hover:text-white font-semibold cursor-pointer underline transition-colors"
            >
              {t('login.change_mobile_number', { defaultValue: 'Change mobile number' })}
            </button>
          </div>

          {/* Back to Password Login */}
          {onBackToPassword && (
            <div className="text-center pt-2 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={onBackToPassword}
                className="text-xs text-[#86efac] hover:text-white font-bold hover:underline cursor-pointer transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>{t('login.login_with_password_instead', { defaultValue: 'Login with Password instead' })}</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
