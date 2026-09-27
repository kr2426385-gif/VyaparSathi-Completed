from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseSTTProvider(ABC):
    """Abstract interface for Speech-to-Text providers (Whisper, Google STT, Azure, etc.)"""
    @abstractmethod
    def transcribe(self, audio_data: bytes, language: str = "mr") -> Dict[str, Any]:
        pass

class BaseTTSProvider(ABC):
    """Abstract interface for Text-to-Speech providers (Google TTS, ElevenLabs, Azure, Coqui, etc.)"""
    @abstractmethod
    def synthesize(self, text: str, language: str = "mr") -> Dict[str, Any]:
        pass
