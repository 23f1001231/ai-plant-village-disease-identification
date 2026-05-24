from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from openai import OpenAI
import base64
import io
import logging

logger = logging.getLogger(__name__)

class SpeechToTextService:
    """Transcribes farmer audio messages using OpenAI models (gpt-4o-mini-transcribe/whisper-1)."""
    def __init__(self, api_key: str = None):
        if not api_key:
            import os
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.getenv("OPENAI_API_KEY")
        self.api_key = api_key
        # Initialize OpenAI client directly
        self.client = OpenAI(api_key=api_key) if api_key else None

    def transcribe_audio(self, audio_bytes: bytes, language: str = "en", filename: str = "audio.wav") -> str:
        """Transcribe uploaded audio bytes in the given language.
        
        Args:
            audio_bytes: Raw audio binary data (e.g. WAV, MP3, M4A).
            language: The target spoken language (e.g. 'en', 'hi', 'mr').
            filename: The original uploaded filename to guide OpenAI in format parsing.
            
        Returns:
            str: Transcribed natural language text.
        """
        if not self.client:
            return f"[STT Offline - No API Key: Spoken text query in {language}]"
            
        # Fail-safe auto-detect based on file magic bytes if default name is used
        if filename == "audio.wav" and len(audio_bytes) >= 4:
            magic = audio_bytes[:4]
            if magic == b"\x1a\x45\xdf\xa3":
                filename = "audio.webm"
            elif magic == b"OggS":
                filename = "audio.ogg"
            elif magic.startswith(b"\x00\x00\x00") or b"ftyp" in audio_bytes[4:12]:
                filename = "audio.mp4"
            elif magic == b"ID3" or magic.startswith(b"\xff\xfb") or magic.startswith(b"\xff\xf3"):
                filename = "audio.mp3"
            logger.info(f"Auto-detected audio container type from magic bytes. Name set to: {filename}")
            
        # Primary: Direct OpenAI client transcription using "gpt-4o-mini-transcribe"
        try:
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = filename
            
            # Check for standard language ISO code conversions
            lang_code = language.split("-")[0].lower() if language else "en"
            
            logger.info(f"Attempting transcription using direct client with model 'gpt-4o-mini-transcribe' (file: {filename})...")
            transcript = self.client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=audio_file,
                language=lang_code
            )
            transcription = transcript.text.strip()
            if transcription is not None:
                logger.info(f"Successfully transcribed audio via direct client 'gpt-4o-mini-transcribe' (length: {len(transcription)}).")
                return transcription
        except Exception as e:
            logger.warning(f"Direct client 'gpt-4o-mini-transcribe' failed: {e}. Trying standard 'whisper-1' model...")

        # Fallback: Direct OpenAI client transcription using standard "whisper-1" model
        try:
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = filename
            
            lang_code = language.split("-")[0].lower() if language else "en"
            
            logger.info(f"Attempting transcription using direct client with standard 'whisper-1' (file: {filename})...")
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=lang_code
            )
            transcription = transcript.text.strip()
            if transcription is not None:
                logger.info(f"Successfully transcribed audio via standard 'whisper-1' model (length: {len(transcription)}).")
                return transcription
        except Exception as e:
            logger.error(f"All Speech-to-Text transcription methods failed: {e}")
            return f"[Transcription failed: {str(e)}]"

