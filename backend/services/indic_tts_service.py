"""
Indic-Parler-TTS Text-to-Speech (TTS) Service
VyaparSathi AI Service

Implements local AI4Bharat Indic-Parler-TTS model loading and inference.
- Model loaded once at service initialization (singleton pattern)
- Uses CUDA when available, falls back to CPU
- Generates high-quality WAV audio
- Supports Hindi ('hi'), Marathi ('mr'), and English ('en')
- Speaker selection:
  - Hindi: 'Divya' (female) or 'Rohit' (male)
  - Marathi: 'Sunita' (female) or 'Sanjay' (male)
  - English: Professional business assistant tone
- Automatic temporary-file cleanup
- Reads path from INDIC_PARLER_MODEL_PATH environment variable
- Strictly reports real loading status without fake fallback audio
"""

import os
import io
import time
import logging
import base64
import wave
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger("indic_tts_service")
logging.basicConfig(level=logging.INFO)

SUPPORTED_LANGUAGES = ["hi", "mr", "en"]

# Verified AI4Bharat Indic-Parler-TTS speaker profiles
DEFAULT_SPEAKERS = {
    "hi": {"female": "Divya", "male": "Rohit", "default": "Divya"},
    "mr": {"female": "Sunita", "male": "Sanjay", "default": "Sunita"},
    "en": {"female": "Divya", "male": "Rohit", "default": "Divya"}
}

class IndicParlerTTSService:
    _instance: Optional["IndicParlerTTSService"] = None

    @classmethod
    def get_instance(cls) -> "IndicParlerTTSService":
        if cls._instance is None:
            cls._instance = IndicParlerTTSService()
        return cls._instance

    def __init__(self):
        self.model_path = os.getenv("INDIC_PARLER_MODEL_PATH", "").strip()
        self.device = "cpu"
        self.is_loaded = False
        self.load_error: Optional[str] = None
        self.model = None
        self.tokenizer = None
        self.description_tokenizer = None
        self.sampling_rate = 24000

        self._initialize_device()
        self._load_model()

    def _initialize_device(self):
        try:
            import torch
            if torch.cuda.is_available():
                self.device = "cuda"
            else:
                self.device = "cpu"
        except ImportError:
            self.device = "cpu"

    def _load_model(self):
        """
        Loads the Indic-Parler-TTS model once from local directory.
        """
        if not self.model_path:
            self.is_loaded = False
            self.load_error = "INDIC_PARLER_MODEL_PATH is not set in environment."
            return

        if not os.path.exists(self.model_path):
            self.is_loaded = False
            self.load_error = f"Model path does not exist on disk: {self.model_path}"
            logger.warning(f"[Indic-Parler-TTS] {self.load_error}")
            return

        # Check for PyTorch
        try:
            import torch
        except ImportError:
            self.is_loaded = False
            self.load_error = "PyTorch ('torch') is not installed in the Python environment."
            logger.warning(f"[Indic-Parler-TTS] {self.load_error}")
            return

        # Check for transformers / parler_tts
        try:
            from parler_tts import ParlerTTSForConditionalGeneration, ParlerTTSConfig
            from transformers import AutoTokenizer

            # Ensure transformers config repr doesn't trigger zero-arg init error on ParlerTTSConfig
            ParlerTTSConfig.has_no_defaults_at_init = True

            logger.info(f"[Indic-Parler-TTS] Loading model from {self.model_path} onto {self.device}...")
            self.model = ParlerTTSForConditionalGeneration.from_pretrained(
                self.model_path,
                local_files_only=True
            ).to(self.device)
            self.model.eval()

            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_path,
                local_files_only=True
            )
            self.description_tokenizer = AutoTokenizer.from_pretrained(
                self.model.config.text_encoder._name_or_path if hasattr(self.model.config, 'text_encoder') else self.model_path,
                local_files_only=True
            )
            self.sampling_rate = self.model.config.sampling_rate if hasattr(self.model.config, 'sampling_rate') else 24000
            self.is_loaded = True
            self.load_error = None
            logger.info("[Indic-Parler-TTS] Model loaded successfully.")

        except ImportError as e:
            self.is_loaded = False
            self.load_error = f"Required TTS packages ('parler_tts', 'transformers', 'soundfile') are not installed: {e}"
            logger.warning(f"[Indic-Parler-TTS] {self.load_error}")
        except Exception as e:
            self.is_loaded = False
            self.load_error = f"Failed to load Indic-Parler-TTS checkpoint from {self.model_path}: {str(e)}"
            logger.error(f"[Indic-Parler-TTS] {self.load_error}", exc_info=True)

    def get_status(self) -> Dict[str, Any]:
        return {
            "model_name": "Indic-Parler-TTS",
            "task": "text-to-speech",
            "is_loaded": self.is_loaded,
            "device": self.device,
            "model_path": self.model_path,
            "supported_languages": SUPPORTED_LANGUAGES,
            "supported_speakers": DEFAULT_SPEAKERS,
            "sampling_rate": self.sampling_rate,
            "load_error": self.load_error
        }

    def _resolve_speaker(self, language: str, speaker: Optional[str] = None, gender: str = "female") -> str:
        lang = language if language in SUPPORTED_LANGUAGES else "mr"
        lang_speakers = DEFAULT_SPEAKERS.get(lang, DEFAULT_SPEAKERS["mr"])
        
        if speaker and speaker.strip():
            s_clean = speaker.strip().capitalize()
            if s_clean in [lang_speakers["female"], lang_speakers["male"]]:
                return s_clean
        
        g_clean = (gender or "female").lower()
        return lang_speakers.get(g_clean, lang_speakers["default"])

    def synthesize(self, text: str, language: str = "mr", speaker: Optional[str] = None, gender: str = "female") -> Dict[str, Any]:
        """
        Synthesizes text to playable WAV audio bytes.
        Returns:
            {
                "audio_bytes": bytes,
                "audio_base64": str,
                "mime_type": "audio/wav",
                "sampling_rate": int,
                "speaker": str,
                "language": str,
                "device": str
            }
        """
        if not self.is_loaded:
            error_msg = self.load_error or "Indic-Parler-TTS model is not loaded."
            raise RuntimeError(f"Indic-Parler-TTS unavailable: {error_msg}")

        clean_text = (text or "").strip()
        if not clean_text:
            raise ValueError("Input text cannot be empty.")

        lang = language if language in SUPPORTED_LANGUAGES else "mr"
        chosen_speaker = self._resolve_speaker(lang, speaker, gender)

        # Standard AI4Bharat Indic-Parler-TTS voice conditioning description
        lang_names = {"mr": "Marathi", "hi": "Hindi", "en": "English"}
        lang_full = lang_names.get(lang, "Marathi")
        description = (
            f"{chosen_speaker}'s voice is clear, expressive, and delivers speech in a slightly high pitch "
            f"at a normal speaking pace in a quiet room, speaking {lang_full}."
        )

        import torch
        import soundfile as sf

        with torch.no_grad():
            desc_inputs = self.description_tokenizer(description, return_tensors="pt").to(self.device)
            prompt_inputs = self.tokenizer(clean_text, return_tensors="pt").to(self.device)

            generation = self.model.generate(
                input_ids=desc_inputs.input_ids,
                attention_mask=desc_inputs.attention_mask,
                prompt_input_ids=prompt_inputs.input_ids,
                prompt_attention_mask=prompt_inputs.attention_mask
            )

            audio_arr = generation.cpu().numpy().squeeze()

        # Write to in-memory WAV buffer
        out_bio = io.BytesIO()
        sf.write(out_bio, audio_arr, self.sampling_rate, format='WAV', subtype='PCM_16')
        wav_bytes = out_bio.getvalue()
        audio_b64 = base64.b64encode(wav_bytes).decode("utf-8")

        return {
            "audio_bytes": wav_bytes,
            "audio_base64": audio_b64,
            "mime_type": "audio/wav",
            "sampling_rate": self.sampling_rate,
            "speaker": chosen_speaker,
            "language": lang,
            "device": self.device
        }
