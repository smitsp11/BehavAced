"""
Voice Transcription Service
"""
from typing import Optional
import base64
import io
from openai import OpenAI
from app.core.config import settings


class VoiceService:
    """Service for voice transcription"""
    
    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
    
    def transcribe_audio(self, audio_base64: str, audio_format: str = "webm") -> dict:
        """
        Transcribe audio using OpenAI Whisper
        
        Args:
            audio_base64: Base64 encoded audio data
            audio_format: Audio format (webm, mp3, wav, etc.)
        
        Returns:
            dict with transcript and metadata
        """
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        try:
            # Decode audio
            audio_bytes = base64.b64decode(audio_base64)
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = f"audio.{audio_format}"
            
            # Transcribe using Whisper
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json"
            )
            
            return {
                "transcript": transcript.text,
                "duration": transcript.duration if hasattr(transcript, 'duration') else None,
                "language": transcript.language if hasattr(transcript, 'language') else "en"
            }
            
        except Exception as e:
            raise ValueError(f"Error transcribing audio: {str(e)}")
    
    def analyze_speech_patterns(self, transcript: str) -> dict:
        """
        Analyze speech patterns in transcript
        
        Returns:
            dict with filler word counts and patterns
        """
        filler_words = {
            'um': 0, 'uh': 0, 'like': 0, 'you know': 0,
            'so': 0, 'actually': 0, 'basically': 0,
            'literally': 0, 'kind of': 0, 'sort of': 0
        }
        
        transcript_lower = transcript.lower()
        
        # Count filler words
        for filler in filler_words.keys():
            filler_words[filler] = transcript_lower.count(filler)
        
        total_filler_count = sum(filler_words.values())
        
        # Estimate word count and speaking rate
        word_count = len(transcript.split())
        
        return {
            "filler_words": {k: v for k, v in filler_words.items() if v > 0},
            "total_filler_count": total_filler_count,
            "word_count": word_count,
            "filler_percentage": (total_filler_count / word_count * 100) if word_count > 0 else 0
        }


# Global instance
voice_service = VoiceService()

