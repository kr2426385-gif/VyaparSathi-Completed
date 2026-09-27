import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Mic, Sparkles, ArrowRight, Bot, CheckCircle2, RefreshCw } from 'lucide-react';
import EnterpriseShowcaseCard, { ENTERPRISE_SLIDES } from '../auth/EnterpriseShowcaseCard.jsx';
import AuthJourneyStepper from '../auth/AuthJourneyStepper.jsx';
import { askGeminiAdvisor } from '../../utils/geminiAdvisor.js';

export default function CopilotModal({ isOpen, onClose, onNavigate, userProfile }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'copilot',
      text: "Namaste! I am your VyaparSathi Enterprise Copilot. Ask me about project costs, PMFME 35% subsidies, machinery setups, or local Mandi demand in Maharashtra."
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [currentJourneyStep, setCurrentJourneyStep] = useState(2);
  const messagesEndRef = useRef(null);

  const SUGGESTIONS = [
    { label: 'Grapes & Wine (Nashik)', slide: 0, query: 'What is the investment and subsidy for grape processing in Nashik?' },
    { label: 'Banana Packhouse (Jalgaon)', slide: 1, query: 'How to setup a banana ripening and sorting enterprise in Jalgaon?' },
    { label: 'Strawberry Pulp (Satara)', slide: 2, query: 'What are PMFME subsidies for strawberry processing in Mahabaleshwar?' },
    { label: 'Orange Juice (Nagpur)', slide: 3, query: 'What is the 5-year ROI for citrus processing in Nagpur cluster?' }
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = { id: 'usr_' + Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Auto-switch right-side enterprise slide based on query keywords
    const lower = query.toLowerCase();
    if (lower.includes('grape') || lower.includes('nashik') || lower.includes('wine')) {
      setActiveSlideIndex(0);
      setCurrentJourneyStep(2);
    } else if (lower.includes('banana') || lower.includes('jalgaon')) {
      setActiveSlideIndex(1);
      setCurrentJourneyStep(3);
    } else if (lower.includes('strawberry') || lower.includes('satara') || lower.includes('mahabaleshwar')) {
      setActiveSlideIndex(2);
      setCurrentJourneyStep(4);
    } else if (lower.includes('orange') || lower.includes('citrus') || lower.includes('nagpur')) {
      setActiveSlideIndex(3);
      setCurrentJourneyStep(4);
    }

    try {
      const activeLang = ['mr', 'hi', 'en'].includes(i18n?.language) ? i18n.language : 'mr';
      const res = await askGeminiAdvisor({
        query,
        language: activeLang,
        userProfile: userProfile || { enterpriseName: 'Maharashtra Agro Venture', district: 'Satara' }
      });

      setMessages((prev) => [
        ...prev,
        {
          id: 'copilot_' + Date.now(),
          sender: 'copilot',
          text: res.answer || res.recommendation,
          actions: res.suggestedActions,
          schemes: res.relevantSchemes
        }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'copilot_' + Date.now(),
          sender: 'copilot',
          text: `For your agro-enterprise, we recommend leveraging the PMFME 35% Credit-Linked Capital Subsidy (up to ₹10 Lakhs). With a healthy DSCR above 1.75x and direct FPO linkages, bank sanction probability is rated high.`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      {/* Outer Card with Glowing Neon Border */}
      <div className="relative w-full max-w-5xl rounded-3xl p-[2px] bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 shadow-2xl shadow-emerald-950/40">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Inner Dual Card Grid */}
        <div className="w-full rounded-[23px] bg-black/40 backdrop-blur-md p-2 sm:p-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch max-h-[92vh] overflow-y-auto">
          
          {/* LEFT CARD: COPILOT CONVERSATIONAL INTERFACE */}
          <div className="bg-[#fdfbf7] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-lg border border-amber-100/60 overflow-hidden min-h-[460px]">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                      <span>{t('copilot.title', { defaultValue: 'VyaparSathi Copilot' })}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h2>
                    <span className="text-[10px] text-stone-500 font-bold block">
                      {t('copilot.subtitle', { defaultValue: 'Autonomous Rural Enterprise Advisor' })}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {t('copilot.online', { defaultValue: 'Online' })}
                </span>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveSlideIndex(sug.slide);
                      handleSendMessage(sug.query);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 transition-all cursor-pointer"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 my-1 max-h-[240px] text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#0b2545] text-white rounded-br-none'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{msg.text}</p>

                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
                        {msg.actions.map((act, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} className="shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-2 text-stone-500 text-xs">
                    <RefreshCw size={12} className="animate-spin text-amber-500" />
                    <span>{t('copilot.synthesizing', { defaultValue: 'Copilot synthesizing cluster data...' })}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="space-y-3 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={t('copilot.placeholder', { defaultValue: 'Ask copilot anything about your business...' })}
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-white border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs font-semibold text-stone-900 outline-none transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#f3bf43] hover:bg-amber-400 text-stone-900 font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  <span>{t('copilot.send', { defaultValue: 'Send' })}</span>
                  <Send size={11} />
                </button>
              </form>

              {/* Bottom 5-Step Journey Pipeline */}
              <AuthJourneyStepper currentStep={currentJourneyStep} />
            </div>

          </div>

          {/* RIGHT CARD: REGIONAL AGRO ENTERPRISE CAROUSEL CONTEXT */}
          <div className="hidden md:block w-full h-full min-h-[380px] md:min-h-full">
            <EnterpriseShowcaseCard
              currentSlideIndex={activeSlideIndex}
              onSelectSlide={(idx) => setActiveSlideIndex(idx)}
              autoPlay={false}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
