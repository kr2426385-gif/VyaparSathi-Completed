import { useEffect, useRef } from 'react';
import { useVoiceController } from './useVoiceController.js';
import { voiceService } from '../services/voiceService.js';

/**
 * Compatibility wrapper for useVoice around the authoritative useVoiceController.
 * Preserves the API signature expected by AIAdvisor.jsx without maintaining duplicate speech recognizers.
 * NO fake offline speech simulation.
 */
export const useVoice = (lang = 'mr') => {
  const onFinalCallbackRef = useRef(null);

  const controller = useVoiceController({
    initialLanguage: lang,
    autoSpeakResponse: false,
    onQueryAnswered: (result) => {
      if (onFinalCallbackRef.current && (result.query || controller.transcript)) {
        onFinalCallbackRef.current(result.query || controller.transcript);
      }
    }
  });

  // Keep language in sync if prop changes
  useEffect(() => {
    controller.changeLanguage(lang);
  }, [lang]);

  const startListening = (onFinalResult) => {
    onFinalCallbackRef.current = onFinalResult || null;
    controller.startListening();
  };

  const speak = async (text) => {
    if (!text) return;
    try {
      const hasVoice = voiceService.hasMatchingVoice(controller.selectedLanguage);
      if (hasVoice) {
        await voiceService.speakTextNative(text, controller.selectedLanguage);
      }
    } catch (err) {
      console.warn('[useVoice compatibility] Speech synthesis error:', err);
    }
  };

  return {
    isListening: controller.isListening,
    isSpeaking: controller.isSpeaking,
    transcript: controller.transcript,
    isSupported: controller.isRecognitionSupported,
    startListening,
    stopListening: controller.stopListening,
    speak,
    stopSpeaking: controller.stopSpeaking,
    status: controller.status,
    errorMsg: controller.errorMsg
  };
};

export default useVoice;
