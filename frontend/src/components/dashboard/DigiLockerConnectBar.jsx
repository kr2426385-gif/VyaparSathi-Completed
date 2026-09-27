import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CheckCircle2, ChevronRight, Unlink, AlertCircle, FileText } from 'lucide-react';

export default function DigiLockerConnectBar({
  connectionState,
  onOpenConnectModal,
  onDisconnect
}) {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const isConnected = connectionState?.isConnected;
  const importedCount = connectionState?.importedDocs?.length || 0;

  return (
    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Left: DigiLocker Brand & Info */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            isConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-blue-50 border-blue-200 text-[#0284c7]'
          }`}>
            <ShieldCheck size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                {isMr ? 'डिजीलॉकर' : 'DigiLocker'}
              </span>
              {isConnected && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>{isMr ? 'जोडलेले' : 'Connected'}</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              {isConnected 
                ? (isMr ? `${importedCount} अधिकृत कागदपत्रे उपलब्ध आहेत.` : `${importedCount} verified documents available for profile & KYC.`)
                : (isMr ? 'डिजीलॉकरवरून आपली अधिकृत कागदपत्रे जोडा.' : 'Import your verified documents securely from DigiLocker.')}
            </p>
          </div>
        </div>

        {/* Right Action: Connect or Disconnect */}
        <div className="self-end sm:self-auto shrink-0 flex items-center gap-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={onOpenConnectModal}
              className="px-3.5 py-1.5 rounded-lg bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <span>{isMr ? 'डिजीलॉकर जोडा' : 'Connect DigiLocker'}</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <div className="relative">
              {!showConfirmDisconnect ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDisconnect(true)}
                  className="px-3 py-1 rounded-lg border border-slate-300 hover:border-rose-300 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 bg-white transition-all cursor-pointer"
                >
                  <Unlink size={13} />
                  <span>{isMr ? 'डिस्कनेक्ट करा' : 'Disconnect'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-[11px] text-rose-700 font-bold hidden md:inline">
                    {isMr ? 'कागदपत्रे हटवायची?' : 'Disconnect?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onDisconnect();
                      setShowConfirmDisconnect(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition-all cursor-pointer"
                  >
                    {isMr ? 'होय, डिस्कनेक्ट' : 'Disconnect'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDisconnect(false)}
                    className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    {isMr ? 'रद्द' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
