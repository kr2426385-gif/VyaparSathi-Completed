import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import digilockerDemoService from '../../services/digilockerDemoService.js';

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadSuccess
}) {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [category, setCategory] = useState('Business Registration');
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'Aadhaar', label: isMr ? 'आधार कार्ड' : 'Aadhaar Card' },
    { id: 'PAN', label: isMr ? 'पॅन कार्ड' : 'PAN Card' },
    { id: 'Business Registration', label: isMr ? 'व्यवसाय नोंदणी / प्रमाणपत्र' : 'Business Registration / Certificate' },
    { id: 'Bank Document', label: isMr ? 'बँक कागदपत्र / पासबुक / विवरण' : 'Bank Document / Passbook / Statement' },
    { id: 'GST / Udyam', label: isMr ? 'जीएसटी / उद्यम नोंदणी' : 'GST / Udyam Registration' },
    { id: 'Other', label: isMr ? 'इतर कागदपत्र' : 'Other Document' }
  ];

  useEffect(() => {
    if (isOpen) {
      setCategory('Business Registration');
      setDocTitle('');
      setSelectedFile(null);
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size must be under 5MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      setErrorMsg('Please enter a document title.');
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      const docData = {
        category,
        title: docTitle.trim(),
        fileName: selectedFile ? selectedFile.name : `${docTitle.trim()}.pdf`,
        fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '150 KB'
      };

      const updatedList = digilockerDemoService.saveUserUploadedDocument(docData);
      setIsSubmitting(false);
      if (onUploadSuccess) onUploadSuccess(updatedList);
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-6 text-slate-900 animate-scaleUp max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-[#13714C] flex items-center justify-center">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {isMr ? 'व्यावसायिक कागदपत्र अपलोड करा' : 'Upload Business Document'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isMr ? 'आपल्या एमएसएमई दस्तऐवज भांडारात कागदपत्रे जोडा.' : 'Add documents to your MSME document repository.'}
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

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-800">
              {isMr ? 'कागदपत्राचा प्रकार' : 'Document Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0b2545]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-800">
              {isMr ? 'कागदपत्राचे नाव / वर्णन' : 'Document Name / Description'}
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder={isMr ? "उदा. उद्यम नोंदणी प्रमाणपत्र" : "e.g. Udyam Registration Certificate"}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0b2545]"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-800">
              {isMr ? 'फाईल निवडा (PDF, PNG, JPG)' : 'Select File (PDF, PNG, JPG)'}
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#13714C]">
                  <FileText size={16} />
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud size={24} className="mx-auto text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 block">
                    {isMr ? 'फाईल निवडण्यासाठी क्लिक करा' : 'Click to browse file'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isMr ? 'कमाल मर्यादा: ५ MB' : 'Maximum size: 5MB'}
                  </span>
                </div>
              )}
            </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (isMr ? 'अपलोड होत आहे...' : 'Uploading...') : (isMr ? 'कागदपत्र जोडा' : 'Add Document')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
