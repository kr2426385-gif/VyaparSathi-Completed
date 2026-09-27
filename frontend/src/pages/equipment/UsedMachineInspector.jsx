import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Image as ImageIcon, 
  ArrowLeft, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { apiService } from '../../services/api.js';

export default function UsedMachineInspector() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Equipment metadata inputs
  const [equipmentType, setEquipmentType] = useState('Chaff Cutter / Motorized Machine');
  const [statedAge, setStatedAge] = useState(2);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Camera Initialization
  const startCamera = async () => {
    setError('');
    setImagePreview(null);
    setAnalysisResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play()?.catch((playErr) => {
          if (playErr.name !== 'AbortError') {
            console.warn('Camera video play error:', playErr);
          }
        });
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera permission error:', err);
      setError('Could not access camera. Please check permissions or choose an image from your gallery.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    stopCamera();
  };

  // 2. Gallery File Picker
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setError('');
    setAnalysisResult(null);
    stopCamera();

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(compressed);
        setImageBase64(compressed);
      };
      img.onerror = () => {
        setImagePreview(event.target.result);
        setImageBase64(event.target.result);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 3. API Analysis Call
  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await apiService.analyzeUsedMachineRisk({
        imageBase64,
        mimeType: 'image/jpeg',
        equipmentType,
        statedAgeYears: Number(statedAge) || 2,
        statedOperatingCondition: 'operational'
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error('Inspection analysis error:', err);
      const serverMsg = err.response?.data?.error;
      setError(serverMsg || err.message || 'Failed to analyze machine photo. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult(null);
    setError('');
    startCamera();
  };

  const handleChooseAnother = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 select-none">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopCamera();
            navigate('/equipment-advisor');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#0b2545] transition-colors min-h-[44px]"
        >
          <ArrowLeft size={16} />
          <span>{t('equipment.back_to_hub', { defaultValue: 'Back to Advisor Hub' })}</span>
        </button>
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0b2545]">
          <Camera size={15} />
          <span>{t('equipment.visual_risk_insp', { defaultValue: 'Visual Risk Inspection' })}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Check a Used Machine
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Capture or upload clear photos of the used equipment to detect rust, chassis cracks, and mechanical wear.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: CAPTURE OR UPLOAD VIEW */}
      {!imagePreview && !isCameraActive && (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#0b2545] flex items-center justify-center mx-auto">
            <Camera size={32} />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-stone-900">
              Provide a Clear Machine Photo
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Ensure adequate daylight, photograph the entire unit or motor nameplate, and avoid blurry closeups.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={startCamera}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[48px]"
            >
              <Camera size={16} className="text-amber-300" />
              <span>{t('equipment.take_photo', { defaultValue: 'Take Photo' })}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs flex items-center justify-center gap-2 transition-all min-h-[48px]"
            >
              <ImageIcon size={16} />
              <span>{t('equipment.choose_gallery', { defaultValue: 'Choose from Gallery' })}</span>
            </button>
          </div>

          {/* Quick Context Inputs */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Equipment Category
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 min-h-[44px]"
              >
                <option value="Chaff Cutter / Motorized Machine">Chaff Cutter / Fodder Machine</option>
                <option value="Milking Machine">{t('equipment.milking_machine_opt', { defaultValue: 'Dual-Bucket Milking Machine' })}</option>
                <option value="Atta Chakki / Stone Mill">Flour Mill / Atta Chakki</option>
                <option value="Mini Dal Mill">Mini Dal Mill / Destoner</option>
                <option value="Micro Pulverizer / Spice Grinder">Micro Pulverizer / Spice Grinder</option>
                <option value="Cold Press Oil Ghani">{t('equipment.oil_expeller_opt', { defaultValue: 'Cold Press Oil Expeller' })}</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Seller-Stated Age (Years)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={statedAge}
                onChange={(e) => setStatedAge(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 min-h-[44px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CAMERA STREAM VIEW */}
      {isCameraActive && (
        <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg space-y-3 p-2">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className="w-full max-h-[420px] object-cover rounded-xl"
          />
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-[#0b2545] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              aria-label={t('equipment.capture_photo_aria', { defaultValue: 'Capture photograph' })}
            >
              <div className="w-11 h-11 rounded-full bg-[#0b2545]"></div>
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CAPTURED IMAGE PREVIEW & ACTION BAR */}
      {imagePreview && !analysisResult && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-stone-200 max-h-[380px] flex items-center justify-center bg-stone-900">
            <img
              src={imagePreview}
              alt={t('equipment.machine_preview', { defaultValue: 'Machine Preview' })}
              className="max-h-[380px] w-auto object-contain"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleRetake}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <RotateCcw size={14} />
                <span>{t('equipment.retake_photo', { defaultValue: 'Retake Photo' })}</span>
              </button>
              <button
                onClick={handleChooseAnother}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <ImageIcon size={14} />
                <span>{t('equipment.choose_another', { defaultValue: 'Choose Another' })}</span>
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px]"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{t('equipment.analyzing_machine', { defaultValue: 'Analyzing Machine...' })}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="text-amber-300" />
                  <span>{t('equipment.analyze_machine', { defaultValue: 'Analyze Machine' })}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ANALYSIS RESULT SCREEN */}
      {analysisResult && (
        <div className="space-y-6">
          
          {/* Risk Level Badge Card */}
          <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-xs space-y-3 ${
            analysisResult.riskLevel === 'Low'
              ? 'bg-emerald-50/70 border-emerald-400'
              : (analysisResult.riskLevel === 'High' ? 'bg-rose-50/70 border-rose-400' : 'bg-amber-50/70 border-amber-400')
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {analysisResult.riskLevel === 'Low' ? (
                  <CheckCircle2 size={24} className="text-emerald-700" />
                ) : (
                  <AlertTriangle size={24} className={analysisResult.riskLevel === 'High' ? 'text-rose-700' : 'text-amber-700'} />
                )}
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                    Used Equipment Risk Level
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold">
                    {analysisResult.analysisMethodLabel || (analysisResult.isFallback ? 'Standard Engineering Benchmark' : 'Automated Visual Inspection')}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                analysisResult.riskLevel === 'Low'
                  ? 'bg-emerald-700 text-white'
                  : (analysisResult.riskLevel === 'High' ? 'bg-rose-700 text-white' : 'bg-amber-600 text-white')
              }`}>
                {analysisResult.riskLevel} Risk
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-stone-900">
                Purchase Recommendation
              </h3>
              <p className="text-xs text-stone-700 font-medium leading-relaxed">
                {analysisResult.purchaseRecommendation}
              </p>
            </div>
          </div>

          {/* Observable Issues Checklist */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-2">
              Visible Issues & Component Health
            </h3>

            <div className="space-y-2.5">
              {analysisResult.visibleIssues?.map((issue, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <strong className="text-stone-900 font-bold block">{issue.aspect}</strong>
                    <p className="text-[11px] text-stone-600">{issue.description}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded shrink-0 ${
                    issue.status === 'Intact' || issue.status === 'Clean' || issue.status === 'Present' || issue.status === 'Readable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CRITICAL MANDATORY SAFETY DISCLAIMER */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase">
              <ShieldAlert size={18} className="text-rose-700" />
              <span>Inspection Limitations & Physical Trial Requirement</span>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {analysisResult.inspectionLimitations?.mandatoryWarning}
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-[11px] text-rose-950 font-semibold">
              ⚠️ {analysisResult.inspectionLimitations?.advice}
            </div>
          </div>

          {/* Suggested On-Site Physical Checks */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide">
              Mandatory Physical Checks Before Payment:
            </h4>
            <div className="space-y-1.5 text-xs text-stone-700">
              {analysisResult.suggestedPhysicalChecks?.map((check, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0b2545] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setImagePreview(null);
                setAnalysisResult(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 min-h-[44px]"
            >
              Analyze Another Machine
            </button>
            <button
              onClick={() => navigate('/equipment-advisor/plan')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0b2545] text-white text-xs font-black min-h-[44px]"
            >
              Compare with New Machinery Plan
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
