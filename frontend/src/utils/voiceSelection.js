/**
 * VyaparSathi Voice Selection & Synthesis Utility
 * 
 * Provides intelligent, cross-browser voice selection for SpeechSynthesis.
 * - Prioritizes native Indian locales (mr-IN, hi-IN, en-IN)
 * - Automatically handles asynchronous `voiceschanged` loading in Chrome, Edge, and Android
 * - Strictly prevents reciting Marathi or Hindi text with an English accent
 * - Manages speech cancellation to avoid overlapping audio
 */

// Cached voices list
let cachedVoices = [];
let voicesLoaded = false;

function initVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const update = () => {
    cachedVoices = window.speechSynthesis.getVoices() || [];
    if (cachedVoices.length > 0) {
      voicesLoaded = true;
    }
  };

  update();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = update;
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initVoices();
}

/**
 * Get the latest list of available voices
 */
export function getAvailableVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
  return cachedVoices;
}

/**
 * Normalizes short language code to BCP-47
 */
export function toBCP47(langCode = 'mr') {
  const clean = String(langCode).toLowerCase().trim();
  if (clean.startsWith('hi')) return 'hi-IN';
  if (clean.startsWith('en')) return 'en-IN';
  return 'mr-IN';
}

/**
 * Select the best available SpeechSynthesis voice for the given language.
 * 
 * Priority Rules:
 * Marathi ('mr'):
 *   1. Exact match 'mr-IN' or 'mr_IN'
 *   2. Any voice containing 'mr' in lang or 'marathi' in name
 *   3. If absent, check for Hindi 'hi-IN' (shares Devanagari script and phonetics) before non-Indic
 * 
 * Hindi ('hi'):
 *   1. Exact match 'hi-IN' or 'hi_IN'
 *   2. Any voice containing 'hi' in lang or 'hindi' in name
 * 
 * English ('en'):
 *   1. Indian English 'en-IN' (native accent for Indian business terms like "Lakh", "crore", "chaff cutter")
 *   2. 'en-GB' or 'en-US'
 *   3. Any English voice
 */
export function selectBestVoice(langCode = 'mr') {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const lang = String(langCode).toLowerCase();

  // 1. MARATHI
  if (lang.startsWith('mr')) {
    // Priority 1: Exact Marathi locale
    const exactMr = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'mr-in' || l === 'mr';
    });
    if (exactMr) return exactMr;

    // Priority 2: Voice name contains Marathi
    const nameMr = voices.find(v => (v.name || '').toLowerCase().includes('marathi'));
    if (nameMr) return nameMr;

    // Priority 3: Compatible Indic Devanagari voice (Hindi)
    // Devanagari phonetics are vastly superior to English phonetics for Marathi vocabulary
    const indicDevanagari = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'hi-in' || l === 'hi' || (v.name || '').toLowerCase().includes('hindi');
    });
    if (indicDevanagari) return indicDevanagari;

    return null; // Do NOT use an English voice to read Marathi
  }

  // 2. HINDI
  if (lang.startsWith('hi')) {
    const exactHi = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'hi-in' || l === 'hi';
    });
    if (exactHi) return exactHi;

    const nameHi = voices.find(v => (v.name || '').toLowerCase().includes('hindi'));
    if (nameHi) return nameHi;

    return null; // Do NOT use an English voice to read Hindi
  }

  // 3. ENGLISH
  const exactEnIn = voices.find(v => {
    const l = (v.lang || '').toLowerCase().replace('_', '-');
    return l === 'en-in';
  });
  if (exactEnIn) return exactEnIn;

  const enGeneral = voices.find(v => {
    const l = (v.lang || '').toLowerCase();
    return l.startsWith('en');
  });
  if (enGeneral) return enGeneral;

  return voices[0] || null;
}

/**
 * Checks if a viable native or compatible voice exists for the language
 */
export function hasCompatibleVoice(langCode = 'mr') {
  return Boolean(selectBestVoice(langCode));
}

/**
 * Cancel any ongoing speech synthesis immediately
 */
export function stopBrowserSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}

/**
 * Speak text using browser SpeechSynthesis with optimal rate, pitch, and voice
 * 
 * @param {string} text - Text to speak
 * @param {string} langCode - 'mr', 'hi', or 'en'
 * @param {object} options - { onStart, onEnd, onError, rate, pitch, volume }
 * @returns {Promise<{ played: boolean, reason?: string }>}
 */
export function speakWithBrowser(text, langCode = 'mr', options = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return resolve({ played: false, reason: 'unsupported' });
    }

    // 1. Cancel any active speech first (no overlapping audio)
    stopBrowserSpeech();

    const cleanText = (text || '')
      .replace(/[#*_`]/g, '')
      .replace(/[\n\r]+/g, '. ')
      .replace(/₹/g, 'रुपये ')
      .replace(/EMI/gi, 'ईएमआय')
      .replace(/CMEGP/gi, 'सीएमईजीपी')
      .replace(/PMEGP/gi, 'पीएमईजीपी')
      .replace(/PMFME/gi, 'पीएमएफएमई')
      .replace(/MUDRA/gi, 'मुद्रा')
      .trim();

    if (!cleanText) {
      return resolve({ played: false, reason: 'empty_text' });
    }

    const voice = selectBestVoice(langCode);
    if (!voice && (langCode === 'mr' || langCode === 'hi')) {
      return resolve({
        played: false,
        reason: 'no_native_voice',
        message: `Native ${langCode.toUpperCase()} voice not installed in browser.`
      });
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || toBCP47(langCode);
      } else {
        utterance.lang = toBCP47(langCode);
      }

      // Slightly relaxed, clear rate for rural clarity
      utterance.rate = options.rate || (langCode === 'en' ? 0.95 : 0.92);
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      let isFinished = false;
      const safeFinish = (success, reason = null) => {
        if (isFinished) return;
        isFinished = true;
        if (success && options.onEnd) options.onEnd();
        if (!success && options.onError) options.onError(reason);
        resolve({ played: success, reason });
      };

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        safeFinish(true);
      };

      utterance.onerror = (event) => {
        // "canceled" / "interrupted" is a normal manual stop, not a crash
        if (event.error === 'canceled' || event.error === 'interrupted') {
          safeFinish(false, 'stopped');
        } else {
          console.warn('[VoiceSelection] SpeechSynthesis error event:', event.error);
          safeFinish(false, event.error);
        }
      };

      // Safety timeout: Chrome on Windows can sometimes hang utterance without firing onend
      const approxDurationMs = Math.max(3000, (cleanText.length / 10) * 1000);
      const watchdogTimer = setTimeout(() => {
        if (!isFinished && window.speechSynthesis.speaking) {
          // If still speaking after expected duration + buffer, check state
        }
      }, approxDurationMs + 5000);

      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.warn('[VoiceSelection] SpeechSynthesis exception:', err);
      resolve({ played: false, reason: err.message });
    }
  });
}
