import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiService } from '../../services/api.js';

export default function ForgotPasswordForm({ onBackToLogin, onResetSuccess }) {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg(t('login.error_enter_credentials', { defaultValue: 'Please enter your registered mobile number or email.' }));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(t('login.error_password_length', { defaultValue: 'New password must be at least 6 characters.' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(t('login.error_password_match', { defaultValue: 'Passwords do not match. Please verify.' }));
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.resetPassword(identifier.trim(), newPassword);
      setSuccessMsg(res.message || t('login.password_updated_success', { defaultValue: 'Password updated successfully!' }));
      setTimeout(() => {
        if (onResetSuccess) {
          onResetSuccess();
        } else if (onBackToLogin) {
          onBackToLogin();
        }
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || t('login.error_reset_failed', { defaultValue: 'Failed to reset password. Please check your registered credentials.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-1 animate-fadeIn">
      <div className="text-center pb-0.5">
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
          {t('login.reset_password_title', { defaultValue: 'Reset Your Password' })}
        </h3>
        <p className="text-[11px] sm:text-xs text-[#86efac]/80 font-medium mt-0.5">
          {t('login.reset_password_desc', { defaultValue: 'Enter your registered details to set a new password' })}
        </p>
      </div>

      {successMsg ? (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-center space-y-2 animate-fadeIn">
          <CheckCircle2 size={32} className="text-[#54c463] mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-emerald-200">
            {successMsg}
          </p>
          <p className="text-[11px] text-stone-300">
            {t('login.redirecting_to_login', { defaultValue: 'Redirecting to login...' })}
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-3">
          {/* Registered Email or Mobile */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-100/75">
              <Mail size={16} />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('login.email_or_mobile', { defaultValue: 'Registered Mobile or Email' })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-emerald-500/35 text-white placeholder:text-emerald-100/50 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
              required
            />
          </div>

          {/* New Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-100/75">
              <Lock size={16} />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('login.new_password_min_6', { defaultValue: 'New Password (min 6 chars)' })}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/30 border border-emerald-500/35 text-white placeholder:text-emerald-100/50 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-100/75 hover:text-white cursor-pointer"
            >
              {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-100/75">
              <Lock size={16} />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('login.confirm_new_password', { defaultValue: 'Confirm New Password' })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-emerald-500/35 text-white placeholder:text-emerald-100/50 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
              required
              minLength={6}
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 flex items-start gap-2">
              <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 font-semibold leading-tight">
                {errorMsg}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#54c463] hover:bg-[#48b556] active:bg-[#3ca449] text-[#06170c] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/40 active:scale-[0.99] transition-all cursor-pointer mt-1"
          >
            <span>{loading ? t('login.updating_password', { defaultValue: 'Updating Password...' }) : t('login.update_password', { defaultValue: 'Update Password' })}</span>
            <ArrowRight size={17} className="stroke-[2.8]" />
          </button>
        </form>
      )}

      {/* Back to Login Button */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>{t('login.back_to_login', { defaultValue: 'Back to Log In' })}</span>
        </button>
      </div>
    </div>
  );
}
