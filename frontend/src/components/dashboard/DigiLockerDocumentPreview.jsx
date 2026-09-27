import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck, FileText, CheckCircle2, User, Calendar, Hash, Building2 } from 'lucide-react';

export default function DigiLockerDocumentPreview({
  isOpen,
  onClose,
  document: doc,
  userName = 'Entrepreneur'
}) {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  if (!isOpen || !doc) return null;

  const isDemo = doc.isDemo !== false;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 animate-scaleUp overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {doc.title}
              </h3>
              {isDemo ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 tracking-wide uppercase">
                  {isMr ? 'डिजीलॉकर पडताळणी' : 'DigiLocker Verified'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  {isMr ? 'अपलोड केलेले' : 'User Uploaded'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {doc.issuer || doc.fileName || (isMr ? 'पडताळणी झालेली नोंद' : 'Verified Document Record')}
            </p>
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

        {/* Document Body */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
          
          {/* Top Issuer Row */}
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0b2545] flex items-center justify-center font-bold">
                <FileText size={15} />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {doc.category || (isMr ? 'ओळख दस्तऐवज' : 'Identity Document')}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
              <CheckCircle2 size={12} />
              <span>{isMr ? 'सक्रिय' : 'Active'}</span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                {isMr ? 'नाव' : 'Name'}:
              </span>
              <span className="font-bold text-slate-900 text-right">
                {doc.details?.holderName || userName || (isMr ? 'उद्योजक' : 'Entrepreneur')}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <FileText size={13} className="text-slate-400" />
                {isMr ? 'दस्तऐवज' : 'Document'}:
              </span>
              <span className="font-bold text-slate-900 text-right">
                {doc.title}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Hash size={13} className="text-slate-400" />
                {isMr ? 'दस्तऐवज क्र.' : 'Document No'}:
              </span>
              <span className="font-mono font-bold text-slate-900 text-right">
                {doc.docNumber || 'XXXX XXXX XXXX'}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                {isMr ? 'जारी दिनांक' : 'Issued Date'}:
              </span>
              <span className="font-semibold text-slate-800 text-right">
                {doc.issueDate || '12/04/2021'}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-slate-400" />
                {isMr ? 'स्थिती' : 'Status'}:
              </span>
              <span className="font-semibold text-emerald-800 text-right">
                {isMr ? 'सक्रिय • पडताळणी पूर्ण' : 'Active • Verified'}
              </span>
            </div>
          </div>

          {/* Secure Notice */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/70 text-[10px] text-slate-500 text-center">
            {isMr 
              ? 'आपल्या व्यवसाय खात्याशी सुरक्षितपणे जोडलेले व पडताळणी झालेले दस्तऐवज.'
              : 'Digitally verified and securely linked with your enterprise account.'}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isMr ? 'बंद करा' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
