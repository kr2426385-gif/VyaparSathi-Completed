import os
import io
import base64
from typing import Dict, Any, Optional
from voice.base import BaseSTTProvider, BaseTTSProvider

"""
[LEGACY / DEPRECATED]
Voice service provider stubs in the Python ai-service.
AUTHORITATIVE ARCHITECTURE:
Production voice STT and TTS are now handled by:
1. Frontend Voice Controller (useVoiceController.js)
2. Backend Voice Service (/api/ai/transcribe and /api/ai/tts)
3. Local AI4Bharat Indic-Conformer (ASR) and Indic-Parler-TTS (TTS)
4. VyaparSathi Business Advisory Engine (voiceAdvisoryService.js)
The GoogleCloudVoiceProvider and AzureSpeechVoiceProvider classes below are retained
only for backward compatibility with existing test suites and should not be used for new integrations.
"""

SUPPORTED_LANGUAGES = ["en", "hi", "mr"]
SUPPORTED_MIME_TYPES = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/webm", "audio/ogg", "audio/x-wav"]
MAX_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB maximum payload

class GoogleCloudVoiceProvider(BaseSTTProvider, BaseTTSProvider):
    """Deprecated legacy stub. See services/indic_asr_service.py and services/indic_tts_service.py for authoritative STT/TTS."""

    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        self.api_key = os.getenv("GOOGLE_SPEECH_API_KEY")
        self.is_ready = bool(self.credentials_path or self.api_key)

    def transcribe(self, audio_data: bytes, language: str = "mr") -> Dict[str, Any]:
        if not self.is_ready:
            return {"available": False, "provider": None, "message": "Google Cloud Speech credentials not configured."}
        # Production adapter for Google Cloud Speech client
        return {
            "available": True,
            "provider": "google-cloud-speech",
            "text": "",
            "language": language
        }

    def synthesize(self, text: str, language: str = "mr") -> Dict[str, Any]:
        if not self.is_ready:
            return {"available": False, "provider": None, "message": "Google Cloud TTS credentials not configured."}
        return {
            "available": True,
            "provider": "google-cloud-tts",
            "audioContent": None,
            "mimeType": "audio/mp3",
            "language": language
        }

class AzureSpeechVoiceProvider(BaseSTTProvider, BaseTTSProvider):
    """Deprecated legacy stub. See services/indic_asr_service.py and services/indic_tts_service.py for authoritative STT/TTS."""
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.speech_region = os.getenv("AZURE_SPEECH_REGION")
        self.is_ready = bool(self.speech_key and self.speech_region)

    def transcribe(self, audio_data: bytes, language: str = "mr") -> Dict[str, Any]:
        if not self.is_ready:
            return {"available": False, "provider": None, "message": "Azure Speech credentials not configured."}
        return {
            "available": True,
            "provider": "azure-speech",
            "text": "",
            "language": language
        }

    def synthesize(self, text: str, language: str = "mr") -> Dict[str, Any]:
        if not self.is_ready:
            return {"available": False, "provider": None, "message": "Azure Speech credentials not configured."}
        return {
            "available": True,
            "provider": "azure-speech",
            "audioContent": None,
            "mimeType": "audio/mp3",
            "language": language
        }

class UnavailableVoiceProvider(BaseSTTProvider, BaseTTSProvider):
    def transcribe(self, audio_data: bytes, language: str = "mr") -> Dict[str, Any]:
        return {
            "available": False,
            "provider": None,
            "message": "Voice service is not configured."
        }

    def synthesize(self, text: str, language: str = "mr") -> Dict[str, Any]:
        return {
            "available": False,
            "provider": None,
            "message": "Voice service is not configured."
        }

class VoiceService:
    def __init__(self):
        provider_name = (os.getenv("VOICE_PROVIDER") or "").lower()
        if provider_name == "google":
            self.provider = GoogleCloudVoiceProvider()
        elif provider_name == "azure":
            self.provider = AzureSpeechVoiceProvider()
        else:
            # Check if google or azure env vars exist
            if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("GOOGLE_SPEECH_API_KEY"):
                self.provider = GoogleCloudVoiceProvider()
            elif os.getenv("AZURE_SPEECH_KEY") and os.getenv("AZURE_SPEECH_REGION"):
                self.provider = AzureSpeechVoiceProvider()
            else:
                self.provider = UnavailableVoiceProvider()

    def validate_audio_payload(self, audio_base64: Optional[str], mime_type: str = "audio/webm") -> tuple[bool, Optional[bytes], Optional[str]]:
        """Validate size, encoding, and non-empty audio without logging raw data."""
        if not audio_base64 or not isinstance(audio_base64, str):
            return False, None, "Audio payload must be a non-empty base64 string."
        
        # Check mime type
        clean_mime = mime_type.split(";")[0].strip().lower()
        if clean_mime not in SUPPORTED_MIME_TYPES:
            return False, None, f"Unsupported audio MIME type '{clean_mime}'. Supported: {', '.join(SUPPORTED_MIME_TYPES)}"

        try:
            audio_bytes = base64.b64decode(audio_base64)
        except Exception:
            return False, None, "Malformed audio payload: invalid base64 encoding."

        if len(audio_bytes) > MAX_AUDIO_BYTES:
            return False, None, f"Audio file exceeds maximum size limit of 5MB ({len(audio_bytes)} bytes)."

        if len(audio_bytes) < 10:
            return False, None, "Audio file is empty or corrupted."

        return True, audio_bytes, None

    def transcribe(
        self,
        audio_content: Optional[str] = None,
        language: str = "mr",
        mime_type: str = "audio/webm"
    ) -> Dict[str, Any]:
        """Transcribe audio with input validation and security enforcement."""
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language '{language}'. Supported: {', '.join(SUPPORTED_LANGUAGES)}")

        # Validate audio payload security (MIME type, size limit <= 5MB)
        valid, audio_bytes, err = self.validate_audio_payload(audio_content, mime_type)
        if not valid:
            raise ValueError(err)

        # Check provider availability
        if isinstance(self.provider, UnavailableVoiceProvider) or not getattr(self.provider, 'is_ready', False):
            return {
                "available": False,
                "provider": None,
                "message": "Voice service is not configured.",
                "supportedLanguages": SUPPORTED_LANGUAGES
            }

        return self.provider.transcribe(audio_bytes, language=language)

    def speak(self, text: str, language: str = "mr") -> Dict[str, Any]:
        """Synthesize speech audio from text in Marathi, Hindi, or English."""
        if not text or not isinstance(text, str) or len(text.strip()) == 0:
            raise ValueError("Text to synthesize cannot be empty.")

        if len(text) > 1000:
            raise ValueError("Text exceeds maximum synthesis length of 1000 characters.")

        if language not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language '{language}'. Supported: {', '.join(SUPPORTED_LANGUAGES)}")

        if isinstance(self.provider, UnavailableVoiceProvider) or not getattr(self.provider, 'is_ready', False):
            return {
                "available": False,
                "provider": None,
                "message": "Voice service is not configured.",
                "supportedLanguages": SUPPORTED_LANGUAGES
            }

        return self.provider.synthesize(text, language=language)

voice_service = VoiceService()
