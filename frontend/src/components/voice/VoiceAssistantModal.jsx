import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, Volume2, VolumeX, X, 
  Sparkles, CheckCircle2, RefreshCw, Send, Globe, WifiOff, AlertCircle, RotateCcw
} from 'lucide-react';
import { useVoiceController } from '../../hooks/useVoiceController.js';

// Equalizer waveform bars matching the exact design: dark slate on outer sides, gold/amber in the middle
const WAVEFORM_BARS = [
  { baseH: 4, amber: false },
  { baseH: 6, amber: false },
  { baseH: 8, amber: false },
  { baseH: 12, amber: false },
  { baseH: 10, amber: false },
  { baseH: 16, amber: false },
  { baseH: 14, amber: false },
  { baseH: 20, amber: true },
  { baseH: 28, amber: true },
  { baseH: 38, amber: true },
  { baseH: 30, amber: true },
  { baseH: 22, amber: true },
  { baseH: 14, amber: false },
  { baseH: 16, amber: false },
  { baseH: 10, amber: false },
  { baseH: 12, amber: false },
  { baseH: 8, amber: false },
  { baseH: 6, amber: false },
  { baseH: 4, amber: false }
];

export default function VoiceAssistantModal({ isOpen, onClose, onNavigate, userProfile }) {
  const { t, i18n } = useTranslation();

  const currentUiLang = i18n.language === 'en' ? 'en' : (i18n.language === 'hi' ? 'hi' : 'mr');

  const {
    status,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    setTranscript,
    response,
    setResponse,
    errorMsg,
    selectedLanguage,
    startListening,
    stopListening,
    cancelListening,
    submitTextQuery,
    changeLanguage,
    stopSpeaking,
    toggleAudio,
    retryListening
  } = useVoiceController({
    initialLanguage: currentUiLang,
    userProfile,
    autoSpeakResponse: true
  });

  // Animated waveform dynamic pulse factor when listening/speaking
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setPulseTick((prev) => (prev + 1) % 100);
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, isSpeaking]);

  // Stop recognition and audio when modal closes
  useEffect(() => {
    if (!isOpen) {
      cancelListening();
      stopSpeaking();
    }
  }, [isOpen, cancelListening, stopSpeaking]);

  if (!isOpen) return null;

  const handleClose = () => {
    cancelListening();
    stopSpeaking();
    onClose();
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      submitTextQuery(transcript.trim());
    } else if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('voice.title', { defaultValue: 'VyaparSathi Voice Assistant' })}
    >
      <div 
        className="relative max-w-[490px] w-full bg-white rounded-[28px] border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col animate-scaleUp text-stone-900 mx-3 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header Bar: Dark Navy with Amber Icon and Multilingual Subtitle */}
        <div className="bg-[#0b2545] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Mic size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
                {t('voice.title', { defaultValue: 'VyaparSathi Voice Assistant' })}
              </h3>
              <p className="text-[11px] font-bold text-amber-400 leading-none mt-0.5">
                {t('voice.languages_badge', { defaultValue: 'Marathi • Hindi • English' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label={t('common.close', { defaultValue: 'Close' })}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Body Container */}
        <div className="p-6 flex flex-col justify-between space-y-4">
          
          {/* Language Selector Bar */}
          <div className="flex items-center justify-between bg-stone-50/70 border border-stone-200/80 rounded-2xl p-1.5">
            <div className="flex items-center gap-1.5 pl-1.5">
              <Globe size={15} className="text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-stone-700">
                Language:
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { code: 'mr', label: 'मराठी' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'en', label: 'English' }
              ].map((lang) => {
                const isActive = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0b2545] text-amber-300 font-black shadow-2xs'
                        : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Mic & Waveform Section */}
          <div className="flex flex-col items-center justify-center pt-2 pb-1 space-y-3">
            
            {/* Big Circular Mic Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full bg-[#0b2545] text-amber-400 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                isListening 
                  ? 'ring-8 ring-amber-300/40 animate-pulse bg-[#081b33]' 
                  : isSpeaking 
                  ? 'ring-8 ring-emerald-300/40 bg-[#081b33]' 
                  : 'hover:bg-[#13315c]'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
              aria-label={isListening ? 'Stop listening' : 'Start speaking'}
            >
              <Mic size={40} className="text-amber-400 stroke-[2.2]" />
            </button>

            {/* ASK ASSISTANT Label */}
            <div className="text-center">
              <span className="text-xs font-black text-stone-900 tracking-wider uppercase block">
                {status === 'listening' 
                  ? (selectedLanguage === 'mr' ? 'ऐकत आहे...' : selectedLanguage === 'hi' ? 'सुन रहे हैं...' : 'LISTENING...')
                  : status === 'processing'
                  ? (selectedLanguage === 'mr' ? 'प्रक्रिया चालू आहे...' : selectedLanguage === 'hi' ? 'प्रक्रिया चल रही है...' : 'PROCESSING...')
                  : status === 'speaking'
                  ? (selectedLanguage === 'mr' ? 'उत्तर सांगत आहे...' : selectedLanguage === 'hi' ? 'उत्तर सुना रहे हैं...' : 'SPEAKING...')
                  : 'ASK ASSISTANT'}
              </span>
            </div>

            {/* Symmetrical Waveform Equalizer */}
            <div className="flex items-center justify-center gap-[3px] h-9 py-1 select-none">
              {WAVEFORM_BARS.map((bar, i) => {
                // When listening or speaking, modulate heights dynamically
                let currentHeight = bar.baseH;
                if (isListening || isSpeaking) {
                  const waveFactor = 0.5 + Math.sin(pulseTick * 0.8 + i * 0.5) * 0.5;
                  currentHeight = Math.max(4, Math.round(bar.baseH * waveFactor));
                }

                return (
                  <span
                    key={i}
                    style={{ height: `${currentHeight}px` }}
                    className={`w-[2.5px] rounded-full transition-all duration-150 ${
                      bar.amber ? 'bg-amber-500' : 'bg-stone-800'
                    }`}
                  />
                );
              })}
            </div>

          </div>

          {/* Response Box (Expands when query is answered) */}
          {response && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-left space-y-2.5 animate-fadeIn shadow-xs max-h-60 sm:max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-600" />
                  VyaparSathi Advisory
                </span>
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isSpeaking ? <VolumeX size={13} className="text-rose-600" /> : <Volume2 size={13} />}
                  <span className="text-[10px]">{isSpeaking ? 'Stop' : 'Audio'}</span>
                </button>
              </div>

              <p className="text-xs text-stone-800 font-medium leading-relaxed whitespace-pre-line">
                {response.answer}
              </p>

              {response.suggestedActions && response.suggestedActions.length > 0 && (
                <div className="pt-1.5 border-t border-emerald-200/60 space-y-1">
                  {response.suggestedActions.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[11px] font-bold text-emerald-950">
                      <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResponse(null);
                    setTranscript('');
                    stopSpeaking();
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-[#0b2545] hover:text-amber-600 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>
                    {selectedLanguage === 'mr' ? 'नवीन प्रश्न विचारा' : selectedLanguage === 'hi' ? 'नया प्रश्न पूछें' : 'Ask another question'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-left">
              <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-rose-800">
                  {errorMsg}
                </p>
                <button
                  type="button"
                  onClick={retryListening}
                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-900 hover:underline cursor-pointer"
                >
                  <RotateCcw size={10} />
                  <span>{selectedLanguage === 'mr' ? 'पुन्हा प्रयत्न करा' : selectedLanguage === 'hi' ? 'फिर प्रयास करें' : 'Try Again'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Bottom Pill Input Bar: matching the image */}
          <form 
            onSubmit={handleInputSubmit}
            className="w-full flex items-center bg-white border border-stone-300 rounded-full pl-5 pr-2 py-2 shadow-2xs focus-within:border-[#0b2545] focus-within:ring-1 focus-within:ring-[#0b2545] transition-all"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={t('voice.input_placeholder', { defaultValue: 'Send Message' })}
              className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-stone-800 placeholder-stone-400 focus:outline-none pr-2"
            />
            <button
              type={transcript.trim() ? "submit" : "button"}
              onClick={!transcript.trim() ? (isListening ? stopListening : startListening) : undefined}
              disabled={isProcessing}
              className="w-9 h-9 rounded-full bg-[#0b2545] hover:bg-[#13315c] text-amber-400 flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              title={transcript.trim() ? t('voice.send_message', { defaultValue: 'Send Message' }) : (isListening ? t('voice.stop_listening', { defaultValue: 'Stop Listening' }) : t('voice.tap_to_speak', { defaultValue: 'Tap to Speak' }))}
              aria-label={transcript.trim() ? t('voice.send_message', { defaultValue: 'Send Message' }) : t('voice.voice_input', { defaultValue: 'Voice Input' })}
            >
              {transcript.trim() ? (
                <Send size={15} className="text-amber-400" />
              ) : (
                <Mic size={17} className="text-amber-400 stroke-[2.2]" />
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
