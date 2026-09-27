import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, Send, Volume2, VolumeX, 
  AlertTriangle, ShieldCheck, RotateCcw, 
  ArrowRight, Sparkles 
} from 'lucide-react';
import { useVoice } from '../hooks/useVoice.js';
import { apiService } from '../services/api.js';

// Subtle Botanical Leaf Line-Art SVGs (5-8% opacity, placed strictly at corners/edges)
function CornerBotanicals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0" aria-hidden="true">
      {/* Top-Left Corner: Delicate Agricultural Branch */}
      <svg
        className="absolute -top-3 -left-3 w-36 h-36 sm:w-48 sm:h-48 text-[#2d6a4f] opacity-[0.06]"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 10 C40 35, 75 75, 125 125" />
        <path d="M40 35 C35 20, 50 12, 60 22 C62 30, 50 36, 40 35 Z" />
        <path d="M65 65 C60 48, 76 40, 86 50 C88 59, 75 66, 65 65 Z" />
        <path d="M95 95 C90 78, 106 70, 116 80 C118 89, 105 96, 95 95 Z" />
        <path d="M40 35 C20 40, 15 55, 26 63 C33 65, 39 52, 40 35 Z" />
        <path d="M65 65 C48 70, 42 86, 52 95 C60 97, 66 84, 65 65 Z" />
      </svg>

      {/* Top-Right Corner: Slender Paddy / Wheat Stalk */}
      <svg
        className="absolute -top-3 -right-3 w-32 h-32 sm:w-44 sm:h-44 text-[#2d6a4f] opacity-[0.05]"
        viewBox="0 0 140 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M130 10 C105 45, 65 85, 20 120" />
        <path d="M115 30 C125 22, 132 30, 126 38 C120 42, 112 37, 115 30 Z" />
        <path d="M95 52 C105 44, 112 52, 106 60 C100 64, 92 59, 95 52 Z" />
        <path d="M75 74 C85 66, 92 74, 86 82 C80 86, 72 81, 75 74 Z" />
        <path d="M110 35 C100 27, 94 35, 100 43 C106 47, 113 42, 110 35 Z" />
        <path d="M90 57 C80 49, 74 57, 80 65 C86 69, 93 64, 90 57 Z" />
      </svg>

      {/* Bottom-Left Corner: Curved Sprout Foliage */}
      <svg
        className="absolute -bottom-3 -left-3 w-32 h-32 sm:w-44 sm:h-44 text-[#2d6a4f] opacity-[0.06]"
        viewBox="0 0 140 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 130 C45 105, 80 65, 115 20" />
        <path d="M40 105 C32 90, 48 80, 58 90 C62 98, 50 108, 40 105 Z" />
        <path d="M70 75 C62 60, 78 50, 88 60 C92 68, 80 78, 70 75 Z" />
        <path d="M45 110 C58 120, 52 135, 38 130 C30 125, 35 112, 45 110 Z" />
      </svg>

      {/* Bottom-Right Corner: Muted Foliage Line */}
      <svg
        className="absolute -bottom-3 -right-3 w-36 h-36 sm:w-48 sm:h-48 text-[#2d6a4f] opacity-[0.05]"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M150 150 C110 115, 75 75, 25 25" />
        <path d="M120 120 C105 110, 115 95, 125 105 C132 110, 128 122, 120 120 Z" />
        <path d="M88 88 C73 78, 83 63, 93 73 C100 78, 96 90, 88 88 Z" />
        <path d="M125 125 C138 138, 125 150, 115 142 C108 135, 116 125, 125 125 Z" />
      </svg>
    </div>
  );
}

export default function AIAdvisor({ initialQuery = '', onNavigate, user }) {
  const { t, i18n } = useTranslation();
  const lang = ['mr', 'hi', 'en'].includes(i18n.language) ? i18n.language : 'mr';

  // Short, human greeting tailored per language
  const greetings = {
    mr: {
      title: 'नमस्कार! 👋',
      subtitle: 'मी आपल्याला कशी मदत करू शकतो?'
    },
    hi: {
      title: 'नमस्ते! 👋',
      subtitle: 'मैं आपकी क्या मदद कर सकता हूँ?'
    },
    en: {
      title: 'Namaste! 👋',
      subtitle: 'How can I help you today?'
    }
  };

  const currentGreeting = greetings[lang] || greetings.mr;

  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollContainerRef = useRef(null);

  // Hook to handle browser SpeechRecognition & SpeechSynthesis
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking 
  } = useVoice(lang);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isListening, isProcessing]);

  // Handle preset quick queries passed from dashboard or router
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // 4 Small Prompt Pills
  const quickPills = [
    {
      id: 'idea',
      label: lang === 'mr' ? 'व्यवसाय कल्पना' : lang === 'hi' ? 'व्यवसाय विचार' : 'Business idea',
      query: lang === 'mr' 
        ? 'माझ्या भांडवल आणि जिल्ह्यासाठी योग्य व्यवसाय सुचवा.' 
        : lang === 'hi' 
        ? 'मेरे बजट और ज़िले के लिए उपयुक्त व्यवसाय बताएं।' 
        : 'Tell me about viable business ideas for my budget and district.'
    },
    {
      id: 'market',
      label: lang === 'mr' ? 'बाजार' : lang === 'hi' ? 'बाज़ार' : 'Market',
      query: lang === 'mr' 
        ? 'स्थानिक बाजारातील मागणी आणि बाजारभाव कसे तपासावे?' 
        : lang === 'hi' 
        ? 'स्थानीय बाज़ार मांग और मंडी भाव कैसे देखें?' 
        : 'How can I check local market demand and mandi rates?'
    },
    {
      id: 'loan',
      label: lang === 'mr' ? 'कर्ज' : lang === 'hi' ? 'ऋण' : 'Loan',
      query: lang === 'mr' 
        ? 'एमएसएमई कर्ज सज्जता आणि डीपीआर अहवालासाठी काय आवश्यक आहे?' 
        : lang === 'hi' 
        ? 'एमएसएमई ऋण और डीपीआर रिपोर्ट के लिए क्या आवश्यकताएं हैं?' 
        : 'What are the requirements for MSME loan readiness and DPR?'
    },
    {
      id: 'schemes',
      label: lang === 'mr' ? 'योजना' : lang === 'hi' ? 'योजनाएं' : 'Schemes',
      query: lang === 'mr' 
        ? 'माझ्या उद्योगासाठी कोणत्या शासकीय योजना व अनुदान उपलब्ध आहेत?' 
        : lang === 'hi' 
        ? 'मेरे व्यवसाय के लिए कौन-सी सरकारी योजनाएं और सब्सिडी हैं?' 
        : 'Which government schemes and subsidies apply to my enterprise?'
    }
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    // Add user message
    const userMsgId = 'msg-' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: query }]);
    setInputVal('');
    setIsProcessing(true);

    try {
      let userProfile = user || null;
      if (!userProfile) {
        try {
          const cached = localStorage.getItem('vyapar_user') || localStorage.getItem('vyapar_profile');
          if (cached) userProfile = JSON.parse(cached);
        } catch (_) {}
      }
      
      const response = await apiService.askAIAdvisor(query, lang, userProfile);

      // Format clean AI message
      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        isStructured: !!(response.recommendation || response.why || response.journeyNodes),
        recommendation: response.recommendation || response.answer,
        why: response.why || response.suggestedActions || [],
        businessData: response.businessData,
        journeyNodes: response.journeyNodes,
        ragSource: response.ragSource || (response.sources && response.sources.length > 0 ? response.sources[0].title : null),
        nextStep: response.nextStep,
        targetTab: response.targetTab,
        text: response.recommendation || response.answer || ''
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-speak response for rural hands-free accessibility
      if (aiMsg.recommendation) {
        const spokenText = aiMsg.why && aiMsg.why.length > 0
          ? `${aiMsg.recommendation}. ${aiMsg.why[0]}`
          : aiMsg.recommendation;
        speak(spokenText);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(), 
        sender: 'ai', 
        text: t('advisor.error_network', { defaultValue: 'Unable to connect to advisory service. Please check connection and try again.' }),
        isError: true,
        lastQuery: query
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger microphone speech recognition
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((resultText) => {
        if (resultText) {
          handleSendMessage(resultText);
        }
      });
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([]);
  };

  return (
    <div className="w-full flex justify-center py-2 sm:py-4 px-2 sm:px-4 select-none">
      {/* Clean White Agricultural Advisory Desk Container */}
      <div className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-2xl shadow-xs flex flex-col overflow-hidden h-[calc(100vh-140px)] sm:h-[calc(100vh-155px)] min-h-[500px]">
        
        {/* Subtle Botanical Corner Line-Art (5-8% opacity) */}
        <CornerBotanicals />

        {/* 1. COMPACT HEADER */}
        <header className="relative z-10 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-100 bg-white/95">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 select-none">
              <img 
                src="/images/vyaparsathi-logo.png" 
                alt="VyaparSathi Logo" 
                className="w-full h-full object-contain filter drop-shadow-xs" 
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#1b4332] tracking-tight leading-none truncate">
                {t('advisor.brand_title', { defaultValue: 'VyaparSathi Advisor' })}
              </h1>
            </div>
          </div>

          {/* Header Action Menu */}
          <div className="flex items-center gap-1 shrink-0 relative">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                title={t('advisor.clear_chat', { defaultValue: 'Clear conversation' })}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label={t('advisor.clear_chat', { defaultValue: 'Clear chat' })}
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </header>

        {/* 2. CHAT CONVERSATION AREA */}
        <div 
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4"
        >
          {/* Initial Greeting & 4 Quick Pills */}
          <div className="space-y-3 pt-1 pb-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {currentGreeting.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-normal mt-0.5">
                {currentGreeting.subtitle}
              </p>
            </div>

            {/* 4 Small Prompt Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {quickPills.map(pill => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleSendMessage(pill.query)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-[#2d6a4f] hover:bg-[#f0fdf4] hover:text-[#1b4332] active:scale-95 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end animate-fadeIn">
                  <div className="max-w-[88%] sm:max-w-[78%] bg-[#1b4332] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-2xs text-xs sm:text-sm font-normal leading-relaxed break-words">
                    {msg.text}
                  </div>
                </div>
              );
            }

            // Structured Advisor response
            if (msg.isStructured) {
              return (
                <div key={msg.id} className="flex justify-start animate-fadeIn">
                  <div className="max-w-[92%] sm:max-w-[82%] bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-xs space-y-2.5 text-stone-800 break-words">
                    
                    {/* Header: Recommendation title + Voice Listen Button */}
                    <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-2">
                      <h3 className="font-bold text-stone-900 text-xs sm:text-[13px] leading-snug">
                        {msg.recommendation}
                      </h3>

                      {/* Text-to-Speech Control */}
                      <button
                        type="button"
                        onClick={() => isSpeaking ? stopSpeaking() : speak(`${msg.recommendation}. ${msg.why?.join('. ') || ''}`)}
                        className={`p-1 rounded-md border transition-all shrink-0 cursor-pointer ${
                          isSpeaking 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                        title={isSpeaking ? t('advisor.stop', { defaultValue: 'Stop audio' }) : t('advisor.listen', { defaultValue: 'Listen audio' })}
                        aria-label={isSpeaking ? 'Stop listening' : 'Listen to response'}
                      >
                        {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                    </div>

                    {/* Key Advisory Points (Clean, compact bullets) */}
                    {msg.why && msg.why.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-stone-700 leading-normal">
                        {msg.why.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold select-none leading-tight mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Financial Overview Micro-Metrics (Clean inline chips instead of raw pipe text) */}
                    {msg.businessData && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.businessData.split('|').map((item, i) => {
                          const parts = item.split(':');
                          const label = parts[0]?.trim();
                          const val = parts.slice(1).join(':').trim();
                          return (
                            <div key={i} className="inline-flex items-center gap-1 bg-stone-50 border border-stone-200/80 px-2 py-0.5 rounded-md text-[11px]">
                              {label && <span className="text-stone-500 font-medium">{label}:</span>}
                              <strong className="text-stone-900 font-bold">{val || item}</strong>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Source & Quick Actions Footer */}
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                      {msg.ragSource ? (
                        <div className="flex items-center gap-1 text-[10px] text-stone-400">
                          <ShieldCheck size={12} className="shrink-0 text-emerald-600" />
                          <span className="truncate max-w-[220px]">Source: {msg.ragSource}</span>
                        </div>
                      ) : <div />}

                      {onNavigate && (
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          {msg.targetTab ? (
                            <button
                              type="button"
                              onClick={() => onNavigate(msg.targetTab)}
                              className="px-2.5 py-1 rounded-lg bg-[#0b2545] hover:bg-[#13315c] text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{msg.nextStep || 'Next Step'}</span>
                              <ArrowRight size={11} />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onNavigate('market')}
                                className="px-2 py-0.5 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Market →
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigate('planning')}
                                className="px-2 py-0.5 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Finance →
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigate('schemes')}
                                className="px-2 py-0.5 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Schemes →
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigate('loanready')}
                                className="px-2 py-0.5 rounded-md bg-[#0b2545] hover:bg-[#13315c] text-white text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Loan →
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            }

            // Plain text assistant message
            return (
              <div key={msg.id} className="flex justify-start animate-fadeIn">
                <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs sm:text-sm leading-relaxed break-words ${
                  msg.isError 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2' 
                    : 'bg-[#f7f9f7] border border-[#e2eae2] border-l-3 border-l-[#2d6a4f] text-stone-800 shadow-2xs'
                }`}>
                  {msg.isError && <AlertTriangle size={15} className="shrink-0 text-rose-600" />}
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          })}

          {/* Voice Listening Waveform Indicator */}
          {isListening && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-[#1b4332] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-ping" />
                <span>{transcript ? `"${transcript}..."` : t('advisor.listening', { defaultValue: 'Listening...' })}</span>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-stone-600 font-medium">
                <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                <span>{t('advisor.thinking', { defaultValue: 'Thinking...' })}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. HORIZONTAL INPUT CONTAINER (Strong bottom visual anchor) */}
        <footer className="relative z-10 p-3 sm:p-4 bg-white border-t border-stone-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-white border border-stone-300 focus-within:border-[#2d6a4f] focus-within:ring-1 focus-within:ring-[#2d6a4f] rounded-xl sm:rounded-2xl px-2.5 py-1.5 shadow-xs transition-all"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isProcessing}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={`p-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                isListening 
                  ? 'bg-[#f0fdf4] text-[#1b4332] ring-2 ring-[#2d6a4f] animate-pulse' 
                  : 'text-stone-400 hover:text-[#1b4332] hover:bg-stone-50'
              }`}
              title={isListening ? 'Stop recording' : 'Speak your question'}
            >
              <Mic size={17} strokeWidth={isListening ? 2.5 : 2} />
            </button>

            {/* Input Text Box */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={t('advisor.input_placeholder', { defaultValue: 'Ask about your business...' })}
              disabled={isListening || isProcessing}
              className="flex-1 bg-transparent py-2 px-1 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-w-0 font-normal"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isListening || isProcessing}
              aria-label={t('advisor.send_message', { defaultValue: 'Send message' })}
              className={`p-2 rounded-lg transition-all shrink-0 flex items-center justify-center ${
                !inputVal.trim() || isListening || isProcessing
                  ? 'text-stone-300 cursor-not-allowed bg-transparent'
                  : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white active:scale-95 cursor-pointer shadow-2xs'
              }`}
            >
              <Send size={15} />
            </button>
          </form>
        </footer>

      </div>
    </div>
  );
}
