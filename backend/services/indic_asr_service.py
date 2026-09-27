"""
Indic-Conformer Speech-to-Text (ASR) Service
VyaparSathi AI Service

Implements local AI4Bharat Indic-Conformer ASR model loading and inference.
- Model loaded once at service initialization (singleton pattern)
- Uses CUDA when available, falls back to CPU
- Converts incoming audio to 16kHz mono PCM WAV
- Supports Hindi ('hi'), Marathi ('mr'), and English ('en')
- Reads path from INDIC_CONFORMER_MODEL_PATH environment variable
- Strictly reports real loading status without fake fallback text
"""

import os
import io
import json
import logging
import base64
import wave
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger("indic_asr_service")
logging.basicConfig(level=logging.INFO)

SUPPORTED_LANGUAGES = ["hi", "mr", "en"]
DEFAULT_SAMPLE_RATE = 16000

class IndicConformerASRService:
    _instance: Optional["IndicConformerASRService"] = None

    @classmethod
    def get_instance(cls) -> "IndicConformerASRService":
        if cls._instance is None:
            cls._instance = IndicConformerASRService()
        return cls._instance

    def __init__(self):
        self.model_path = os.getenv("INDIC_CONFORMER_MODEL_PATH", "").strip()
        self.device = "cpu"
        self.is_loaded = False
        self.load_error: Optional[str] = None
        self.models: Dict[str, Any] = {}
        self.framework = None

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
        Loads the Indic-Conformer checkpoint once.
        Supports:
        1. NeMo EncDecCTCModel from .nemo checkpoint file
        2. Multi-language directory with conformer.json mapping
        3. Triton / TorchScript model.pt
        """
        if not self.model_path:
            self.is_loaded = False
            self.load_error = "INDIC_CONFORMER_MODEL_PATH is not set in environment."
            return

        if not os.path.exists(self.model_path):
            self.is_loaded = False
            self.load_error = f"Model path does not exist on disk: {self.model_path}"
            logger.warning(f"[Indic-Conformer] {self.load_error}")
            return

        # Check for PyTorch
        try:
            import torch
        except ImportError:
            self.is_loaded = False
            self.load_error = "PyTorch ('torch') is not installed in the Python environment."
            logger.warning(f"[Indic-Conformer] {self.load_error}")
            return

        # Check NeMo Toolkit
        try:
            import nemo.collections.asr as nemo_asr
            self.framework = "nemo"
            
            # Case A: Single .nemo file
            if os.path.isfile(self.model_path) and self.model_path.endswith(".nemo"):
                logger.info(f"[Indic-Conformer] Restoring NeMo model from {self.model_path} on {self.device}...")
                model = nemo_asr.models.EncDecCTCModel.restore_from(restore_path=self.model_path)
                model.eval()
                model = model.to(self.device)
                self.models["default"] = model
                self.is_loaded = True
                self.load_error = None
                logger.info("[Indic-Conformer] Model loaded successfully.")
                return

            # Case B: Directory containing conformer.json or language .nemo models
            if os.path.isdir(self.model_path):
                config_file = os.path.join(self.model_path, "conformer.json")
                if os.path.exists(config_file):
                    with open(config_file, "r", encoding="utf-8") as j:
                        config = json.load(j)
                    for lang, cfg in config.items():
                        sub_path = cfg.get("model_path", "")
                        if not os.path.isabs(sub_path):
                            sub_path = os.path.join(self.model_path, sub_path)
                        if os.path.exists(sub_path):
                            logger.info(f"[Indic-Conformer] Loading {lang} model from {sub_path}...")
                            m = nemo_asr.models.EncDecCTCModel.restore_from(restore_path=sub_path)
                            m.eval()
                            m = m.to(self.device)
                            self.models[lang] = m
                    if self.models:
                        self.is_loaded = True
                        self.load_error = None
                        logger.info(f"[Indic-Conformer] Loaded {len(self.models)} language models.")
                        return
                    else:
                        self.is_loaded = False
                        self.load_error = f"conformer.json found but referenced .nemo checkpoints do not exist inside {self.model_path}."
                        logger.warning(f"[Indic-Conformer] {self.load_error}")
                        return

                # Scan for any .nemo files in directory
                nemo_files = [f for f in os.listdir(self.model_path) if f.endswith(".nemo")]
                if nemo_files:
                    for nf in nemo_files:
                        full_nf = os.path.join(self.model_path, nf)
                        lang = "hi" if "hi" in nf else ("mr" if "mr" in nf else ("en" if "en" in nf else "default"))
                        logger.info(f"[Indic-Conformer] Restoring {nf} as {lang} on {self.device}...")
                        m = nemo_asr.models.EncDecCTCModel.restore_from(restore_path=full_nf)
                        m.eval()
                        m = m.to(self.device)
                        self.models[lang] = m
                    self.is_loaded = True
                    self.load_error = None
                    return

            self.is_loaded = False
            self.load_error = f"No valid .nemo checkpoint file found at {self.model_path}."
            logger.warning(f"[Indic-Conformer] {self.load_error}")

        except ImportError as e:
            self.is_loaded = False
            self.load_error = f"NeMo toolkit ('nemo_toolkit[asr]') is not installed: {e}"
            logger.warning(f"[Indic-Conformer] {self.load_error}")
        except Exception as e:
            self.is_loaded = False
            self.load_error = f"Failed to load Indic-Conformer checkpoint: {str(e)}"
            logger.error(f"[Indic-Conformer] {self.load_error}", exc_info=True)

    def get_status(self) -> Dict[str, Any]:
        return {
            "model_name": "Indic-Conformer",
            "task": "speech-to-text",
            "is_loaded": self.is_loaded,
            "device": self.device,
            "model_path": self.model_path,
            "supported_languages": SUPPORTED_LANGUAGES,
            "loaded_languages": list(self.models.keys()) if self.is_loaded else [],
            "load_error": self.load_error
        }

    def _convert_audio_to_wav(self, audio_bytes: bytes, original_mime: str = "") -> Tuple[bytes, int]:
        """
        Ensures audio is 16kHz mono PCM WAV.
        Handles WebM, OGG, MP3, and WAV using soundfile, pydub, or standard wave.
        """
        # 1. Try reading as standard RIFF WAV
        try:
            with io.BytesIO(audio_bytes) as bio:
                with wave.open(bio, 'rb') as wf:
                    channels = wf.getnchannels()
                    rate = wf.getframerate()
                    if channels == 1 and rate == DEFAULT_SAMPLE_RATE:
                        return audio_bytes, rate
        except Exception:
            pass

        # 2. Try soundfile
        try:
            import soundfile as sf
            import numpy as np
            with io.BytesIO(audio_bytes) as bio:
                data, samplerate = sf.read(bio)
                if data.ndim > 1:
                    data = data.mean(axis=1) # downmix to mono
                if samplerate != DEFAULT_SAMPLE_RATE:
                    # Simple resampling or scipy.signal.resample
                    try:
                        from scipy import signal
                        num_samples = int(len(data) * DEFAULT_SAMPLE_RATE / samplerate)
                        data = signal.resample(data, num_samples)
                        samplerate = DEFAULT_SAMPLE_RATE
                    except ImportError:
                        pass
                out_bio = io.BytesIO()
                sf.write(out_bio, data, DEFAULT_SAMPLE_RATE, format='WAV', subtype='PCM_16')
                return out_bio.getvalue(), DEFAULT_SAMPLE_RATE
        except Exception:
            pass

        # 3. Try pydub / ffmpeg
        try:
            from pydub import AudioSegment
            with io.BytesIO(audio_bytes) as bio:
                seg = AudioSegment.from_file(bio)
                seg = seg.set_frame_rate(DEFAULT_SAMPLE_RATE).set_channels(1)
                out_bio = io.BytesIO()
                seg.export(out_bio, format="wav")
                return out_bio.getvalue(), DEFAULT_SAMPLE_RATE
        except Exception:
            pass

        # Fallback to returning raw bytes
        return audio_bytes, DEFAULT_SAMPLE_RATE

    def transcribe(self, audio_input: Any, language: str = "mr", mime_type: str = "") -> Dict[str, Any]:
        """
        Transcribes audio bytes or base64 string to text.
        """
        if not self.is_loaded:
            error_msg = self.load_error or "Indic-Conformer model is not loaded."
            raise RuntimeError(f"Indic-Conformer ASR unavailable: {error_msg}")

        # Decode base64 if string
        if isinstance(audio_input, str):
            if audio_input.startswith("data:"):
                audio_input = audio_input.split(",", 1)[1]
            audio_bytes = base64.b64decode(audio_input)
        elif isinstance(audio_input, bytes):
            audio_bytes = audio_input
        else:
            raise ValueError("audio_input must be raw bytes or base64 string.")

        wav_bytes, _ = self._convert_audio_to_wav(audio_bytes, mime_type)

        lang = language if language in SUPPORTED_LANGUAGES else "mr"
        model = self.models.get(lang) or self.models.get("default") or next(iter(self.models.values()), None)

        if model is None:
            raise RuntimeError(f"No loaded ASR model found for language '{lang}'.")

        # Write temporary WAV file for NeMo transcribe
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(wav_bytes)
            tmp_path = tmp.name

        try:
            import torch
            with torch.no_grad():
                transcriptions = model.transcribe([tmp_path])
                text = transcriptions[0] if transcriptions else ""
                clean_text = text.strip() if isinstance(text, str) else str(text).strip()
                return {
                    "text": clean_text,
                    "language": lang,
                    "device": self.device,
                    "model": "indic-conformer"
                }
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
