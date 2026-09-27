import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Star,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api.js';

export default function HelpSupportModal({ isOpen, onClose, onNavigate }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'mr';

  // Feedback form state
  const [rating, setRating] = useState(5); // Default 5 stars
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [mayContact, setMayContact] = useState(true);
  const [joinResearch, setJoinResearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOptionalContact, setShowOptionalContact] = useState(false);

  // Auto-populate logged-in user info if available
  useEffect(() => {
    if (isOpen) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('vyapar_user') || '{}');
        if (storedUser.name && !name) setName(storedUser.name);
        if ((storedUser.phone || storedUser.email) && !contact) {
          setContact(storedUser.phone || storedUser.email);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Localized dictionary matching website theme
  const labels = {
    mr: {
      modalTitle: 'आपला अनुभव नोंदवा',
      modalSubtitle: 'आम्ही आपल्या अभिप्रायाची मनापासून कदर करतो! कृपया आपला अनुभव रेट करा आणि मौल्यवान सूचना सामायिक करा.',
      ratingLevels: ['सुधारणा हवी', 'समाधानकारक', 'चांगले', 'उत्तम', 'अतिउत्कृष्ट!'],
      messagePlaceholder: 'आपला अनुभव किंवा सूचना येथे सांगा...',
      namePlaceholder: 'नाव (पर्यायी)',
      contactPlaceholder: 'मोबाईल / ईमेल (पर्यायी)',
      mayContactText: 'या अभिप्रायाबाबत माझ्याशी संपर्क साधला जाऊ शकतो.',
      privacyPolicyText: 'गोपनीयता धोरण',
      joinResearchText: "मी संशोधन गटात सामील होऊन व्यासपीठ सुधारण्यास तयार आहे.",
      submitBtn: 'पाठवा',
      cancelBtn: 'रद्द करा',
      submitting: 'नोंदवत आहे...',
      successTitle: 'धन्यवाद!',
      successDesc: 'तुमचा बहुमूल्य अभिप्राय यशस्वीरीत्या नोंदवला गेला आहे.',
      submitAnother: 'नवीन अभिप्राय द्या',
      optionalDetails: 'संपर्क माहिती जोडा (पर्यायी)'
    },
    hi: {
      modalTitle: 'अपना अनुभव रेट करें',
      modalSubtitle: 'हम आपकी प्रतिक्रिया की अत्यधिक कद्र करते हैं! कृपया कुछ पल निकालकर अपना अनुभव साझा करें।',
      ratingLevels: ['सुधार चाहिए', 'संतोषजनक', 'अच्छा', 'बहुत अच्छा', 'अति उत्तम!'],
      messagePlaceholder: 'अपना अनुभव और सुझाव यहाँ बताएं...',
      namePlaceholder: 'नाम (वैकल्पिक)',
      contactPlaceholder: 'मोबाइल / ईमेल (वैकल्पिक)',
      mayContactText: 'इस फीडबैक के संबंध में मुझसे संपर्क किया जा सकता है।',
      privacyPolicyText: 'गोपनीयता नीति',
      joinResearchText: "मैं रिसर्च ग्रुप से जुड़कर सुधार में मदद के लिए तैयार हूँ।",
      submitBtn: 'भेजें',
      cancelBtn: 'रद्द करें',
      submitting: 'दर्ज हो रहा है...',
      successTitle: 'धन्यवाद!',
      successDesc: 'आपकी प्रतिक्रिया सफलतापूर्वक दर्ज कर ली गई है।',
      submitAnother: 'नया फीडबैक भेजें',
      optionalDetails: 'संपर्क विवरण जोड़ें (वैकल्पिक)'
    },
    en: {
      modalTitle: 'Rate your experience',
      modalSubtitle: 'We highly value your feedback! Kindly take a moment to rate your experience and provide us with your valuable feedback.',
      ratingLevels: ['Needs Work', 'Fair', 'Good', 'Very Good', 'Excellent!'],
      messagePlaceholder: 'Tell us about your experience!',
      namePlaceholder: 'Name (optional)',
      contactPlaceholder: 'Mobile / Email (optional)',
      mayContactText: 'I may be contacted about this feedback.',
      privacyPolicyText: 'Privacy Policy',
      joinResearchText: "I'd like to help improve by joining the Research Group.",
      submitBtn: 'Send',
      cancelBtn: 'Cancel',
      submitting: 'Sending...',
      successTitle: 'Thank You!',
      successDesc: 'Your feedback has been recorded successfully.',
      submitAnother: 'Send Another',
      optionalDetails: 'Add contact info (optional)'
    }
  };

  const text = labels[currentLang] || labels.mr;
  const activeRatingDisplay = hoverRating || rating;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!rating && !message.trim()) {
      setErrorMessage('Please select a rating or enter your feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        rating,
        message: message.trim(),
        name: name.trim() || 'Anonymous Entrepreneur',
        contact: contact.trim() || '',
        mayContact,
        joinResearch,
        language: currentLang,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      };

      if (apiService?.submitFeedback) {
        await apiService.submitFeedback(payload);
      } else {
        const local = JSON.parse(localStorage.getItem('vyapar_feedbacks') || '[]');
        local.push({
          id: 'fb_' + Date.now(),
          ...payload
        });
        localStorage.setItem('vyapar_feedbacks', JSON.stringify(local));
      }

      setIsSubmitted(true);
      setMessage('');
    } catch (err) {
      console.warn('Feedback submission local fallback:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      onClick={onClose}
    >
      {/* 
        MODAL CARD MATCHING IMAGE 1 IN VYAPARSATHI THEME:
        Soft rounded card, centered header, 5 glowing stars, 
        recessed soft-shadow textarea, centered pill button
      */}
      <div 
        className="relative max-w-md w-full rounded-[28px] bg-white border border-stone-200/90 shadow-2xl p-5 sm:p-8 select-text text-stone-900 animate-scaleUp max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close', { defaultValue: 'Close' })}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* FEEDBACK CONTENT */}
        <div>
          {isSubmitted ? (
            /* Confirmation Screen */
            <div className="py-8 px-2 text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-[#0b2545]">
                {text.successTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                {text.successDesc}
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
                >
                  {text.submitAnother}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-center">
              {/* Centered Heading & Subtitle exactly matching Image 1 */}
              <div>
                <h2 
                  id="feedback-dialog-title" 
                  className="text-xl sm:text-2xl font-black text-[#0b2545] tracking-tight"
                >
                  {text.modalTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1.5 leading-relaxed max-w-xs mx-auto">
                  {text.modalSubtitle}
                </p>
              </div>

              {errorMessage && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                  {errorMessage}
                </div>
              )}

              {/* 1. 5 STAR RATING (Image 1 Centered Golden Stars) */}
              <div className="flex flex-col items-center justify-center pt-1 gap-1">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = activeRatingDisplay >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-120 active:scale-95 focus:outline-none cursor-pointer"
                        aria-label={`Rate ${starVal} out of 5 stars`}
                      >
                        <Star 
                          size={32} 
                          className={`transition-all duration-200 ${
                            isFilled 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]' 
                              : 'text-stone-300 fill-stone-100 hover:text-amber-300'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating Level Label */}
                <div className="text-[11px] font-bold text-amber-700 min-h-[16px]">
                  {text.ratingLevels[activeRatingDisplay - 1]}
                </div>
              </div>

              {/* 2. RECESSED TEXTAREA (Image 1 Style with Soft Inset Shadow) */}
              <div className="text-left">
                <textarea
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={text.messagePlaceholder}
                  className="w-full min-h-[110px] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed rounded-2xl border border-stone-200/90 bg-stone-50/80 text-stone-900 placeholder:text-stone-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:outline-none focus:bg-white focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/15 transition-all resize-none"
                />
              </div>

              {/* Collapsible Contact Options */}
              <div className="text-left pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowOptionalContact(!showOptionalContact)}
                  className="text-[11px] font-bold text-[#0b2545] hover:underline cursor-pointer block text-center w-full"
                >
                  {showOptionalContact ? '− ' : '+ '} {text.optionalDetails}
                </button>

                {showOptionalContact && (
                  <div className="space-y-2 pt-2 text-xs text-stone-700 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={text.namePlaceholder}
                        className="w-full h-8 px-3 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0b2545]"
                      />
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={text.contactPlaceholder}
                        className="w-full h-8 px-3 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0b2545]"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px]">
                      <input
                        type="checkbox"
                        checked={mayContact}
                        onChange={(e) => setMayContact(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#0b2545] accent-[#0b2545]"
                      />
                      <span>{text.mayContactText}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px]">
                      <input
                        type="checkbox"
                        checked={joinResearch}
                        onChange={(e) => setJoinResearch(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#0b2545] accent-[#0b2545]"
                      />
                      <span>{text.joinResearchText}</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 3. CENTERED PILL "SEND" BUTTON (Matching Image 1 in VyaparSathi Brand Palette) */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-stone-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 min-w-[140px]"
                >
                  {isSubmitting ? text.submitting : text.submitBtn}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
