import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceService } from '../services/voiceService.js';
import { apiService } from '../services/api.js';
import { 
  selectBestVoice, 
  speakWithBrowser, 
  stopBrowserSpeech, 
  toBCP47 
} from '../utils/voiceSelection.js';

/**
 * AUTHORITATIVE VOICE CONTROLLER HOOK (Production & Demo Hardened)
 * 
 * Manages the complete voice lifecycle with seamless browser fallback:
 * - Selected language ('mr', 'hi', 'en') synced with standard BCP-47 locales ('mr-IN', 'hi-IN', 'en-IN')
 * - Microphone acquisition and graceful permission error handling
 * - Speech-to-Text: webkitSpeechRecognition / SpeechRecognition with interim buffering and silence debounce
 * - Safe single-stream lifecycle: strictly prevents duplicate recognizers, overlapping audio, or duplicate queries
 * - Grounded multilingual business advisory querying via backend POST /api/voice/query
 * - Text-to-Speech: Intelligent browser SpeechSynthesis fallback (native Marathi/Hindi/English voice selection)
 * - Honest human-friendly UI state messages (zero technical jargon exposed to users)
 */
export function useVoiceController({
  initialLanguage = 'mr',
  userProfile = null,
  onQueryAnswered = null,
  autoSpeakResponse = true
} = {}) {
  // 1. Language state
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const lang = String(initialLanguage).toLowerCase();
    if (lang.startsWith('hi')) return 'hi';
    if (lang.startsWith('en')) return 'en';
    return 'mr'; // Default Marathi
  });

  // 2. Lifecycle states: 'ready' | 'listening' | 'processing' | 'speaking' | 'answered' | 'error' | 'offline'
  const [status, setStatus] = useState('ready');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceProvider, setActiveVoiceProvider] = useState('browser'); // 'browser' | 'indic' | null

  // 3. Control & Synchronization Refs
  const recognitionRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const watchdogTimerRef = useRef(null);
  const transcriptBufferRef = useRef('');
  const isSubmittingRef = useRef(false);
  const isManuallyStoppedRef = useRef(false);
  const isListeningRef = useRef(false);
  const conversationHistoryRef = useRef([]);
  const mountedRef = useRef(true);

  // Keep ref in sync with current state
  isListeningRef.current = status === 'listening';

  // Check network connection
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  /**
   * Reset any active error state
   */
  const clearError = useCallback(() => {
    setErrorMsg('');
  }, []);

  /**
   * Safe cleanup of active speech recognition and audio streams
   */
  const stopHardwareStreams = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    stopBrowserSpeech();
    voiceService.cleanup();
  }, []);

  /**
   * Intelligent Speech Recognition Initializer (WebKit / Native SpeechRecognition)
   */
  const createIntelligentRecognizer = useCallback((langCode) => {
    const SpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;       // Continuous recognition prevents early cutoff
      recognition.interimResults = true;   // Real-time feedback as the user speaks
      recognition.maxAlternatives = 1;
      recognition.lang = toBCP47(langCode);

      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullText = (finalTranscript + interimTranscript).trim();
        if (fullText) {
          transcriptBufferRef.current = fullText;
          if (mountedRef.current) {
            setTranscript(fullText);
            setErrorMsg('');
          }

          // Reset silence debounce timer (1600ms of silence = user finished their thought)
          if (pauseTimerRef.current) {
            clearTimeout(pauseTimerRef.current);
          }

          pauseTimerRef.current = setTimeout(() => {
            if (mountedRef.current && isListeningRef.current && !isSubmittingRef.current && !isManuallyStoppedRef.current) {
              handleCompleteSpeechTurn();
            }
          }, 1600);
        }
      };

      recognition.onerror = (event) => {
        if (isManuallyStoppedRef.current || event.error === 'aborted') {
          return;
        }

        console.info('[VoiceController] SpeechRecognition event:', event.error);

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          if (mountedRef.current) {
            setStatus('error');
            setErrorMsg(
              langCode === 'mr'
                ? 'मायक्रोफोन वापरण्याची परवानगी आवश्यक आहे. कृपया ब्राऊझर सेटिंग्जमध्ये मायक्रोफोन सुरू करा.'
                : (langCode === 'hi'
                    ? 'माइक्रोफ़ोन अनुमति आवश्यक है। कृपया ब्राउज़र सेटिंग में अनुमति दें।'
                    : 'Microphone permission is required. Please allow microphone access.')
            );
          }
        } else if (event.error === 'no-speech') {
          if (!transcriptBufferRef.current.trim() && mountedRef.current) {
            setStatus('ready');
            setErrorMsg(
              langCode === 'mr'
                ? 'कोणताही आवाज ऐकू आला नाही. कृपया पुन्हा बोला किंवा खाली टाईप करा.'
                : (langCode === 'hi'
                    ? 'कोई आवाज़ सुनाई नहीं दी। कृपया फिर से बोलें या नीचे टाइप करें।'
                    : 'No speech detected. Please speak into the microphone or type below.')
            );
          }
        } else if (event.error === 'network') {
          if (mountedRef.current) {
            setStatus('offline');
            setErrorMsg(
              langCode === 'mr'
                ? 'इंटरनेट कनेक्शनमध्ये अडचण येत आहे. आपण खाली प्रश्न टाईप करू शकता.'
                : (langCode === 'hi'
                    ? 'इंटरनेट कनेक्शन में समस्या है। आप नीचे प्रश्न टाइप कर सकते हैं।'
                    : 'Voice connection issue. You can type your question below.')
            );
          }
        } else if (event.error === 'audio-capture') {
          if (mountedRef.current) {
            setStatus('error');
            setErrorMsg(
              langCode === 'mr'
                ? 'डिव्हाइसवर मायक्रोफोन सापडला नाही.'
                : (langCode === 'hi'
                    ? 'डिवाइस पर माइक्रोफ़ोन नहीं मिला।'
                    : 'No microphone was detected on your device.')
            );
          }
        } else {
          if (mountedRef.current && !transcriptBufferRef.current.trim()) {
            setStatus('ready');
          }
        }
      };

      recognition.onend = () => {
        // Recognition ended naturally while still in listening mode
        if (isListeningRef.current && !isSubmittingRef.current && !isManuallyStoppedRef.current) {
          if (transcriptBufferRef.current.trim()) {
            handleCompleteSpeechTurn();
          } else if (mountedRef.current) {
            setStatus('ready');
          }
        }
      };

      return recognition;
    } catch (e) {
      console.warn('[VoiceController] Failed to initialize SpeechRecognition:', e);
      return null;
    }
  }, []);

  /**
   * Finalize speech turn and submit question
   */
  const handleCompleteSpeechTurn = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (mountedRef.current) {
      setStatus('processing');
    }

    // Stop recognition stream safely
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    const spokenText = (transcriptBufferRef.current || transcript).trim();

    if (!spokenText) {
      isSubmittingRef.current = false;
      if (mountedRef.current) {
        setStatus('ready');
        setErrorMsg(
          selectedLanguage === 'mr'
            ? 'कोणताही आवाज ऐकू आला नाही. कृपया पुन्हा बोला किंवा टाईप करा.'
            : (selectedLanguage === 'hi'
                ? 'कोई आवाज़ सुनाई नहीं दी। कृपया फिर से बोलें या नीचे टाइप करें।'
                : 'No speech detected. Please tap the microphone to try again or type below.')
        );
      }
      return;
    }

    // Dispatch query to authoritative backend voice reasoning endpoint
    await executeQuery({ queryText: spokenText });
    isSubmittingRef.current = false;
  };

  /**
   * Execute Query against authoritative backend POST /api/voice/query
   */
  const executeQuery = async ({ queryText = '' } = {}) => {
    if (mountedRef.current) {
      setStatus('processing');
      setErrorMsg('');
    }

    // Cancel any active speech before starting query
    stopBrowserSpeech();
    voiceService.stopAllAudio();
    setIsSpeaking(false);

    try {
      let result = null;

      // 1. Primary backend voice query endpoint
      const payload = {
        query: queryText,
        language: selectedLanguage,
        userProfile,
        conversationHistory: conversationHistoryRef.current
      };

      console.info('[VoiceController] request started');
      console.info('[VoiceController] request payload', payload);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const voiceEndpoint = backendBase ? `${backendBase}/api/voice/query` : '/api/voice/query';

        const res = await fetch(voiceEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          result = await res.json();
        }
      } catch (fetchErr) {
        console.info('[VoiceController] Primary /api/voice/query network request fell back:', fetchErr.message);
      }

      // 2. Fallback to apiService.askVoiceAssistant if direct fetch failed
      if (!result || !result.answer) {
        result = await apiService.askVoiceAssistant(
          queryText,
          selectedLanguage,
          userProfile,
          conversationHistoryRef.current
        );
      }

      // 3. Fallback to advisory service if still empty
      if (!result || !result.answer) {
        result = await apiService.askAdvisor(
          queryText,
          selectedLanguage,
          userProfile,
          conversationHistoryRef.current
        );
      }

      if (!result || !result.answer) {
        throw new Error('No advisory answer could be retrieved.');
      }

      console.info('[VoiceController] final answer source', result.source || 'unknown', result.model ? `(${result.model})` : '');

      // Keep transcript in sync
      if (result.query && mountedRef.current) {
        setTranscript(result.query);
        transcriptBufferRef.current = result.query;
      }

      // Store in conversation history (last 4 turns)
      conversationHistoryRef.current.push({
        query: result.query || queryText,
        answer: result.answer,
        intent: result.intent,
        entities: result.entities
      });
      if (conversationHistoryRef.current.length > 4) {
        conversationHistoryRef.current.shift();
      }

      if (mountedRef.current) {
        setResponse(result);
        setStatus('answered');
      }

      if (onQueryAnswered) {
        onQueryAnswered(result);
      }

      // 4. Text-to-Speech Playback
      if (autoSpeakResponse) {
        await playSpeechResponse(result);
      }

    } catch (err) {
      console.warn('[VoiceController] Advisory query exception:', err.message);
      if (mountedRef.current) {
        setStatus('ready');
        setErrorMsg(
          selectedLanguage === 'mr'
            ? 'माहिती मिळण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा किंवा खाली टाईप करा.'
            : (selectedLanguage === 'hi'
                ? 'जानकारी प्राप्त करने में समस्या आ रही है। कृपया पुनः प्रयास करें या नीचे टाइप करें।'
                : 'Could not complete request. Please tap Retry or type your question below.')
        );
      }
    }
  };

  /**
   * Play speech response using Browser SpeechSynthesis fallback
   * - Never speaks Marathi or Hindi with an English voice
   * - Natural rate and pitch for rural accessibility
   * - Never leaves the UI stuck if synthesis fails or is interrupted
   */
  const playSpeechResponse = async (resultObj) => {
    const textToSpeak = resultObj?.ttsText || resultObj?.answer;
    if (!textToSpeak) return;

    // 1. Check if backend returned valid audio content (e.g. from local Indic-Parler-TTS)
    if (resultObj?.audio?.audioContent) {
      if (mountedRef.current) {
        setStatus('speaking');
        setIsSpeaking(true);
      }
      setActiveVoiceProvider('indic');
      try {
        await voiceService.playAudioContent(
          resultObj.audio.audioContent,
          resultObj.audio.mimeType || 'audio/wav'
        );
      } catch (audioErr) {
        console.warn('[VoiceController] Native audio playback fallback:', audioErr.message);
      } finally {
        if (mountedRef.current) {
          setIsSpeaking(false);
          setStatus('answered');
        }
      }
      return;
    }

    // 2. Browser SpeechSynthesis Fallback
    if (mountedRef.current) {
      setStatus('speaking');
      setIsSpeaking(true);
    }
    setActiveVoiceProvider('browser');

    try {
      await speakWithBrowser(textToSpeak, selectedLanguage, {
        rate: selectedLanguage === 'en' ? 0.95 : 0.92,
        pitch: 1.0,
        volume: 1.0,
        onStart: () => {
          if (mountedRef.current) {
            setIsSpeaking(true);
            setStatus('speaking');
          }
        },
        onEnd: () => {
          if (mountedRef.current) {
            setIsSpeaking(false);
            setStatus('answered');
          }
        },
        onError: () => {
          if (mountedRef.current) {
            setIsSpeaking(false);
            setStatus('answered');
          }
        }
      });
    } catch (synthErr) {
      console.info('[VoiceController] Browser SpeechSynthesis handled:', synthErr.message);
    } finally {
      if (mountedRef.current) {
        setIsSpeaking(false);
        setStatus('answered');
      }
    }
  };

  /**
   * Start Listening
   * - Cancels any ongoing audio playback before acquiring microphone
   * - Prevents duplicate sessions
   * - Selects language automatically (mr-IN, hi-IN, en-IN)
   */
  const startListening = async () => {
    clearError();

    // 1. Immediately cancel any running speech synthesis (no overlapping audio)
    stopBrowserSpeech();
    voiceService.stopAllAudio();
    setIsSpeaking(false);

    // Clean up any existing recognizer session first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    isSubmittingRef.current = false;
    isManuallyStoppedRef.current = false;
    transcriptBufferRef.current = '';
    setTranscript('');
    setResponse(null);

    // Check offline status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('offline');
      setErrorMsg(
        selectedLanguage === 'mr'
          ? 'व्हॉइससाठी इंटरनेट कनेक्शन आवश्यक आहे. आपण खाली टाईप करू शकता.'
          : (selectedLanguage === 'hi'
              ? 'वॉइस के लिए इंटरनेट चाहिए। आप नीचे टाइप कर सकते हैं।'
              : 'Voice needs an internet connection. You can type your question.')
      );
      return;
    }

    // Check browser speech recognition support
    const isSupported = typeof window !== 'undefined' && 
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!isSupported) {
      setStatus('error');
      setErrorMsg(
        selectedLanguage === 'mr'
          ? 'या ब्राऊझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया Google Chrome किंवा Microsoft Edge वापरा.'
          : (selectedLanguage === 'hi'
              ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया Chrome या Edge का उपयोग करें।'
              : 'Voice input is not supported in this browser. Please use Chrome or Edge.')
      );
      return;
    }

    try {
      const recognizer = createIntelligentRecognizer(selectedLanguage);
      if (!recognizer) {
        setStatus('error');
        setErrorMsg('Could not initialize speech recognition. You can type your question.');
        return;
      }

      recognitionRef.current = recognizer;
      recognizer.start();
      setStatus('listening');

      // Watchdog timer: If nothing heard and state doesn't change after 15 seconds, reset to ready
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = setTimeout(() => {
        if (mountedRef.current && isListeningRef.current && !transcriptBufferRef.current.trim()) {
          stopListening();
        }
      }, 15000);

    } catch (startErr) {
      console.warn('[VoiceController] Start listening exception:', startErr.message);
      setStatus('ready');
      setErrorMsg('Microphone is unavailable. You can type your question below.');
    }
  };

  /**
   * Manually stop listening and submit query
   */
  const stopListening = () => {
    isManuallyStoppedRef.current = true;

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    const currentText = (transcriptBufferRef.current || transcript).trim();
    if (currentText) {
      handleCompleteSpeechTurn();
    } else {
      stopHardwareStreams();
      if (mountedRef.current) {
        setStatus('ready');
      }
    }
  };

  /**
   * Cancel listening immediately without submitting
   */
  const cancelListening = () => {
    isManuallyStoppedRef.current = true;
    isSubmittingRef.current = false;
    stopHardwareStreams();
    setTranscript('');
    transcriptBufferRef.current = '';
    if (mountedRef.current) {
      setStatus('ready');
    }
  };

  /**
   * Stop audio playback
   */
  const stopSpeaking = () => {
    stopBrowserSpeech();
    voiceService.stopAllAudio();
    setIsSpeaking(false);
    if (mountedRef.current && status === 'speaking') {
      setStatus('answered');
    }
  };

  /**
   * Play or stop current answer audio
   */
  const toggleAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (response) {
      playSpeechResponse(response);
    }
  };

  /**
   * Submit typed or sample query
   */
  const submitTextQuery = (text) => {
    const clean = (text || '').trim();
    if (!clean) return;
    setTranscript(clean);
    transcriptBufferRef.current = clean;
    executeQuery({ queryText: clean });
  };

  /**
   * Change Language safely (stopping ongoing recognition/speech)
   */
  const changeLanguage = (langCode) => {
    const clean = String(langCode).toLowerCase();
    const newLang = clean.startsWith('hi') ? 'hi' : (clean.startsWith('en') ? 'en' : 'mr');
    if (newLang === selectedLanguage) return;

    cancelListening();
    stopSpeaking();
    clearError();
    setSelectedLanguage(newLang);
  };

  /**
   * Retry listening action
   */
  const retryListening = () => {
    cancelListening();
    startListening();
  };

  /**
   * Unmount / Cleanup Hook
   */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopHardwareStreams();
    };
  }, [stopHardwareStreams]);

  return {
    // States
    status,               // 'ready' | 'listening' | 'processing' | 'speaking' | 'answered' | 'error' | 'offline'
    isListening: status === 'listening',
    isProcessing: status === 'processing',
    isSpeaking,
    transcript,
    setTranscript,
    response,
    setResponse,
    errorMsg,
    clearError,
    selectedLanguage,
    activeVoiceProvider,
    isOnline,
    isRecognitionSupported: typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),

    // Actions
    startListening,
    stopListening,
    cancelListening,
    submitTextQuery,
    changeLanguage,
    playSpeechResponse,
    stopSpeaking,
    toggleAudio,
    retryListening
  };
}

export default useVoiceController;
