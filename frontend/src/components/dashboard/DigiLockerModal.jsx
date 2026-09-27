import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, 
  FileText, Check, AlertCircle, Sparkles, Lock
} from 'lucide-react';
import digilockerDemoService from '../../services/digilockerDemoService.js';

export default function DigiLockerModal({
  isOpen,
  onClose,
  onImportSuccess,
  defaultUserName = 'Entrepreneur'
}) {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'documents' | 'importing' | 'success'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState(['dl_aadhaar_demo', 'dl_pan_demo', 'dl_dl_demo']);
  const [availableDocs, setAvailableDocs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setMobileNumber('');
      setOtpValue(['', '', '', '', '', '']);
      setErrorMsg('');
      setSelectedDocIds(['dl_aadhaar_demo', 'dl_pan_demo', 'dl_dl_demo']);
      setAvailableDocs(digilockerDemoService.getAvailableCatalog());
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Phone Submit
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setErrorMsg(t('digilocker.err_mobile_invalid', 'Please enter a valid 10-digit mobile number.'));
      return;
    }
    try {
      digilockerDemoService.sendDemoOtp(cleanNumber);
      setStep('otp');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to proceed.');
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index, value) => {
    const digit = value.slice(-1).replace(/\D/g, '');
    const newOtp = [...otpValue];
    newOtp[index] = digit;
    setOtpValue(newOtp);

    // Auto focus next box
    if (digit && index < 5) {
      const nextInput = document.getElementById(`demo-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP Keydown (Backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`demo-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle Paste OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtpValue(newOtp);
    }
  };

  // Handle OTP Verify
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const entered = otpValue.join('');
    if (entered.length !== 6) {
      setErrorMsg(t('digilocker.err_otp_incomplete', 'Please enter the 6-digit verification code.'));
      return;
    }

    const result = digilockerDemoService.verifyDemoOtp(entered);
    if (result.success) {
      setStep('documents');
    } else {
      setErrorMsg(t('digilocker.err_otp_invalid', 'Invalid demo OTP. Please try again.'));
    }
  };

  // Toggle Document Selection
  const toggleDocSelection = (id) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle Import Selected
  const handleImportSubmit = () => {
    if (selectedDocIds.length === 0) {
      setErrorMsg(t('digilocker.err_no_docs_selected', 'Please select at least one document to import.'));
      return;
    }
    setErrorMsg('');
    setStep('importing');

    setTimeout(() => {
      const newState = digilockerDemoService.importSelectedDocuments(
        selectedDocIds,
        mobileNumber,
        defaultUserName
      );
      setStep('success');

      setTimeout(() => {
        if (onImportSuccess) onImportSuccess(newState);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 text-slate-900 animate-scaleUp max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#0284c7] flex items-center justify-center font-black">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {isMr ? 'डिजीलॉकर' : 'DigiLocker'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'phone' && (isMr ? 'खाते जोडा' : 'Connect Account')}
                {step === 'otp' && (isMr ? 'मोबाईल क्रमांक पडताळणी' : 'Verify Mobile Number')}
                {step === 'documents' && (isMr ? 'कागदपत्रे निवडा' : 'Select Documents to Import')}
                {step === 'importing' && (isMr ? 'कागदपत्रे प्राप्त करत आहे...' : 'Importing documents...')}
                {step === 'success' && (isMr ? 'कागदपत्रे यशस्वीरीत्या जोडली' : 'Documents imported successfully')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', { defaultValue: 'Close' })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={14} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: MOBILE NUMBER INPUT */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {isMr 
                ? 'आपल्या एमएसएमई प्रोफाईलसाठी अधिकृत व्यावसायिक व ओळख कागदपत्रे जोडण्यासाठी डिजीलॉकर खाते कनेक्ट करा.'
                : 'Connect your DigiLocker account to select verified business and identity documents for your MSME profile.'}
            </p>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-800">
                {isMr ? 'नोंदणीकृत मोबाईल क्रमांक' : 'Registered Mobile Number'}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 XXXXX"
                  autoFocus
                  className="w-full h-11 pl-12 pr-4 rounded-xl border border-slate-300 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {isMr ? 'आपला १० अंकी अधिकृत मोबाईल क्रमांक टाका.' : 'Enter your 10-digit registered mobile number.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isMr ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isMr ? 'पुढे चला →' : 'Continue →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DEMO OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-900">
                {isMr ? 'मोबाईल क्रमांक पडताळणी' : 'Verify Mobile Number'}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {isMr ? 'पडताळणी कोड पाठवला आहे:' : 'Verification code sent to:'} <strong className="text-slate-800">+91 {mobileNumber}</strong>
              </p>
            </div>

            {/* 6 Digit OTP Inputs */}
            <div className="flex items-center justify-center gap-2 py-2" onPaste={handleOtpPaste}>
              {otpValue.map((digit, idx) => (
                <input
                  key={idx}
                  id={`demo-otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-11 text-center font-mono font-bold text-lg rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]"
                />
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-900">
                {isMr ? 'ओटीपी: 123456' : 'OTP: 123456'}
              </span>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {isMr ? 'पडताळणीसाठी वरील ओटीपी प्रविष्ट करा.' : 'Enter the verification OTP above to proceed.'}
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                ← {isMr ? 'क्रमांक बदला' : 'Change Number'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isMr ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isMr ? 'पडताळणी करा' : 'Verify OTP'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: DOCUMENT SELECTION */}
        {step === 'documents' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">
                  {isMr ? 'डिजीलॉकर कागदपत्रे' : 'DigiLocker Documents'}
                </h4>
                <span className="text-[11px] font-bold text-emerald-700">
                  {isMr ? 'अधिकृत खाते' : 'Verified Account'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMr ? 'आपल्या कागदपत्र कक्षात जोडण्यासाठी कागदपत्रे निवडा.' : 'Select documents to import into your Document Centre.'}
              </p>
            </div>

            {/* Document Rows with Checkboxes */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableDocs.map((doc) => {
                const isChecked = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isChecked 
                        ? 'border-blue-300 bg-blue-50/40' 
                        : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by container
                        className="w-4 h-4 rounded text-[#0b2545] accent-[#0b2545] cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-900">{doc.title}</strong>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            {isMr ? 'पडताळणी' : 'Verified'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block leading-tight">{doc.issuer}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                      {isMr ? 'उपलब्ध' : 'Available'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Note on data privacy */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-600 flex items-center gap-2">
              <Lock size={12} className="shrink-0 text-slate-500" />
              <span>{isMr ? 'राष्ट्रीय डिजिटल ओळख आराखड्यांतर्गत सुरक्षित कागदपत्र पडताळणी.' : 'Secure DigiLocker integration for MSME document verification and bank appraisal.'}</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isMr ? 'रद्द' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{isMr ? 'निवडलेली कागदपत्रे जोडा' : 'Import Selected'}</span>
                <span>({selectedDocIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: IMPORTING ANIMATION */}
        {step === 'importing' && (
          <div className="py-10 text-center space-y-3 animate-fadeIn">
            <RefreshCw size={36} className="mx-auto text-[#0284c7] animate-spin" />
            <h4 className="text-sm font-black text-slate-900">
              {isMr ? 'कागदपत्रे जोडत आहे...' : 'Importing documents...'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isMr 
                ? 'निवडलेली कागदपत्रे आपल्या खात्याशी जोडली जात आहेत.'
                : 'Synchronizing selected records into your Document Centre.'}
            </p>
          </div>
        )}

        {/* STEP 5: SUCCESS STATE */}
        {step === 'success' && (
          <div className="py-10 text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-base font-black text-slate-900">
              {isMr ? 'कागदपत्रे यशस्वीरीत्या जोडली गेली' : 'Documents imported successfully'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isMr 
                ? 'आपली पडताळणी झालेली कागदपत्रे आता आपल्या खात्यात उपलब्ध आहेत.'
                : 'Your verified documents are now available in your Document Centre.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
