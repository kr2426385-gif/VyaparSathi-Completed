/**
 * VyaparSathi Voice Audio Hardware & Speech Utility
 * 
 * Responsibilities:
 * - MediaRecorder audio stream capture for backend Indic-Conformer STT
 * - Base64 audio playback for backend Indic-Parler-TTS
 * - Browser SpeechRecognition detection and language mapping
 * - Browser SpeechSynthesis with STRICT native voice verification (prevents English voices from reading Marathi Devanagari text)
 * - Safe audio teardown and resource release
 */

import { selectBestVoice, speakWithBrowser } from '../utils/voiceSelection.js';

class VoiceService {
  constructor() {
    this.currentAudioElement = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.mediaStream = null;
  }

  /**
   * Check if SpeechRecognition is supported natively in current browser
   */
  isRecognitionSupported() {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Check if MediaRecorder is supported for audio recording
   */
  isMediaRecorderSupported() {
    return typeof window !== 'undefined' && Boolean(navigator?.mediaDevices?.getUserMedia && window?.MediaRecorder);
  }

  /**
   * Check if SpeechSynthesis is supported
   */
  isSpeechSynthesisSupported() {
    return typeof window !== 'undefined' && Boolean(window.speechSynthesis);
  }

  /**
   * Map short language code to standard Indian BCP-47 locale tag
   */
  getBCP47LanguageTag(langCode = 'mr') {
    const clean = String(langCode).toLowerCase();
    if (clean.startsWith('hi')) return 'hi-IN';
    if (clean.startsWith('en')) return 'en-IN';
    return 'mr-IN';
  }

  /**
   * Verify if browser has an authentic native or compatible voice for the given language.
   * CRITICAL: Prevents English voices from reciting Marathi or Hindi phonetically.
   */
  hasMatchingVoice(langCode = 'mr') {
    if (!this.isSpeechSynthesisSupported()) return false;
    return Boolean(this.getMatchingVoice(langCode));
  }

  /**
   * Retrieve the matched native or compatible voice using intelligent priority
   */
  getMatchingVoice(langCode = 'mr') {
    if (!this.isSpeechSynthesisSupported()) return null;
    return selectBestVoice(langCode);
  }

  /**
   * Play base64 encoded audio (e.g. from Indic-Parler-TTS)
   * 
   * @param {string} base64Audio
   * @param {string} mimeType
   * @returns {Promise<void>}
   */
  playAudioContent(base64Audio, mimeType = 'audio/wav') {
    return new Promise((resolve, reject) => {
      try {
        this.stopAllAudio();

        if (!base64Audio || typeof base64Audio !== 'string') {
          return reject(new Error('Invalid base64 audio payload'));
        }

        const dataUri = base64Audio.startsWith('data:')
          ? base64Audio
          : `data:${mimeType};base64,${base64Audio}`;

        const audio = new Audio(dataUri);
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.currentAudioElement = null;
          resolve();
        };

        audio.onerror = (e) => {
          this.currentAudioElement = null;
          reject(e);
        };

        audio.play().catch(err => {
          this.currentAudioElement = null;
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Speak text using browser SpeechSynthesis ONLY if a matching native voice exists.
   * 
   * @param {string} text
   * @param {string} langCode - 'mr', 'hi', or 'en'
   * @returns {Promise<{ played: boolean, reason?: string }>}
   */
  speakTextNative(text, langCode = 'mr') {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSynthesisSupported()) {
        return resolve({ played: false, reason: 'speech_synthesis_unsupported' });
      }

      this.stopAllAudio();

      const matchedVoice = this.getMatchingVoice(langCode);
      if (!matchedVoice) {
        // DO NOT send Marathi text to an English voice.
        return resolve({
          played: false,
          reason: 'no_matching_native_voice',
          message: `Native ${langCode.toUpperCase()} speech synthesizer voice is not installed on this browser/OS.`
        });
      }

      // Clean text formatting
      const cleanText = text
        .replace(/[#*_`]/g, '')
        .replace(/[\n\r]+/g, '. ')
        .replace(/₹/g, 'रुपये ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || this.getBCP47LanguageTag(langCode);
      utterance.rate = 0.92; // Slightly slower, clearer cadence for rural accessibility

      utterance.onend = () => resolve({ played: true });
      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
          // Normal interruption or cancellation (user clicked another button or stopped voice)
          return resolve({ played: false, reason: e.error });
        }
        console.warn('[VoiceService] SpeechSynthesis error:', e.error || e);
        resolve({ played: false, reason: e.error || 'synthesis_error' });
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Start recording microphone input for backend Indic-Conformer STT
   */
  async startAudioRecording() {
    if (!this.isMediaRecorderSupported()) {
      throw new Error('MediaRecorder is not supported in this browser.');
    }

    this.audioChunks = [];
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    }

    this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Collect chunk slices every 250ms
    return mimeType;
  }

  /**
   * Stop recording microphone and return base64 audio string
   */
  async stopAudioRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this._releaseMediaStream();
        return resolve(null);
      }

      this.mediaRecorder.onstop = () => {
        try {
          if (this.audioChunks.length === 0) {
            this._releaseMediaStream();
            return resolve(null);
          }

          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
          this._releaseMediaStream();

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve({
              base64: typeof base64data === 'string' ? base64data : null,
              mimeType: blob.type
            });
          };
          reader.onerror = () => {
            resolve(null);
          };
          reader.readAsDataURL(blob);
        } catch (_) {
          this._releaseMediaStream();
          resolve(null);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (_) {
        this._releaseMediaStream();
        resolve(null);
      }
    });
  }

  _releaseMediaStream() {
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(t => t.stop());
      } catch (_) {}
      this.mediaStream = null;
    }
  }

  /**
   * Stop any current audio playback (Indic HTML5 Audio & Browser SpeechSynthesis)
   */
  stopAllAudio() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (_) {}
      this.currentAudioElement = null;
    }

    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  }

  /**
   * Stop everything (playback, recording, microphone)
   */
  cleanup() {
    this.stopAllAudio();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }
    this._releaseMediaStream();
  }
}

export const voiceService = new VoiceService();
export default voiceService;
