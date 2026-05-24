import logging
import io
import os
import wave
import struct
from openai import OpenAI
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class TextToSpeechService:
    """Service for converting treatment plan text into playable audio files using OpenAI's TTS API."""
    def __init__(self, api_key: str = None):
        if not api_key:
            load_dotenv()
            api_key = os.getenv("OPENAI_API_KEY")
        self.api_key = api_key
        # Initialize OpenAI client directly
        self.client = OpenAI(api_key=api_key) if api_key else None

    def stream_speech(self, text: str, language: str = "en"):
        """Synthesize input text into a progressive chunked audio stream (MP3).
        
        Args:
            text: The text block to convert to speech.
            language: The target speaking language (e.g. 'en', 'hi', 'mr').
            
        Yields:
            bytes: Binary chunks of MP3 audio or fallback WAV audio.
        """
        if self.client:
            try:
                logger.info(f"Streaming speech for language {language} using OpenAI 'gpt-4o-mini-tts'...")
                voice = "alloy"
                
                # Request a streaming speech synthesis from OpenAI
                with self.client.audio.speech.with_streaming_response.create(
                    model="gpt-4o-mini-tts",
                    voice=voice,
                    input=text,
                    response_format="mp3"
                ) as response:
                    for chunk in response.iter_bytes(chunk_size=4096):
                        yield chunk
                logger.info("Successfully completed OpenAI speech streaming.")
                return
            except Exception as e:
                logger.error(f"OpenAI TTS streaming failed: {e}")
                logger.info("Falling back to silent WAV stream generator.")
        else:
            logger.warning("TTS Offline - No OpenAI API Key. Streaming silent fallback.")

        # Fallback generator: yields the silent WAV content in 1024-byte chunks
        try:
            wav_io = io.BytesIO()
            with wave.open(wav_io, 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(8000)
                # 8000 frames of 0 amplitude
                for _ in range(8000):
                    data = struct.pack('<h', 0)
                    wav.writeframesraw(data)
            wav_bytes = wav_io.getvalue()
            chunk_size = 1024
            for i in range(0, len(wav_bytes), chunk_size):
                yield wav_bytes[i:i+chunk_size]
        except Exception as fallback_err:
            logger.error(f"Failed to stream silent WAV fallback: {fallback_err}")
            yield b""

    def synthesize_speech(self, text: str, language: str = "en") -> bytes:
        """Synthesize input text into a playable audio file (MP3/WAV).
        
        Args:
            text: The text block to convert to speech (e.g. immediate actions list).
            language: The target speaking language (e.g. 'en', 'hi', 'mr').
            
        Returns:
            bytes: Binary audio data in MP3 format or fallback WAV format.
        """
        if self.client:
            try:
                logger.info(f"Synthesizing speech for language {language} using OpenAI 'gpt-4o-mini-tts'...")
                
                # Map languages to appropriate voices if needed, or use default 'alloy'
                voice = "alloy"
                
                # Request speech synthesis from OpenAI
                response = self.client.audio.speech.create(
                    model="gpt-4o-mini-tts",
                    voice=voice,
                    input=text
                )
                
                # Return raw audio bytes
                audio_bytes = response.content
                if audio_bytes and len(audio_bytes) > 0:
                    logger.info(f"Successfully synthesized {len(audio_bytes)} bytes of speech via OpenAI.")
                    return audio_bytes
            except Exception as e:
                logger.error(f"OpenAI TTS synthesis failed (e.g. due to key restrictions or 403): {e}")
                logger.info("Falling back to generating a valid silent WAV audio block to prevent client crash.")
        else:
            logger.warning("TTS Offline - No OpenAI API Key configured. Generating silent WAV fallback.")

        # Robust Fallback: Generate a valid silent WAV file in memory
        try:
            wav_io = io.BytesIO()
            # 1 second of silence: 8000Hz, 16-bit mono
            with wave.open(wav_io, 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(8000)
                # 8000 frames of 0 amplitude
                for _ in range(8000):
                    data = struct.pack('<h', 0)
                    wav.writeframesraw(data)
            return wav_io.getvalue()
        except Exception as fallback_err:
            logger.error(f"Failed to generate fallback silent WAV: {fallback_err}")
            return b""
