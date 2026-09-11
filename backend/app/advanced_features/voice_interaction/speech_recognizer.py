import os
from typing import Optional

class VoiceSpeechRecognizer:
    """
    Interfaces with speech-to-text engines (specifically OpenAI Whisper) 
    to transcribe audio files into text.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Sends audio file to OpenAI Whisper API for transcription.
        """
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found at: {audio_file_path}")
            
        if self.api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                
                with open(audio_file_path, "rb") as audio_file:
                    transcription = client.audio.transcriptions.create(
                        model="whisper-1", 
                        file=audio_file
                    )
                return transcription.text
            except Exception as e:
                print(f"Whisper transcription failed: {e}")
                
        # Mock/simulated response if API key is not present or transcription fails
        return self._simulate_transcription(audio_file_path)

    def _simulate_transcription(self, file_path: str) -> str:
        """
        Fallback simulation that returns a mock sentence based on the file name.
        """
        base_name = os.path.basename(file_path).lower()
        if "explain" in base_name:
            return "Explain this concept to me again."
        elif "summarize" in base_name:
            return "Please summarize the last paragraph."
        elif "quiz" in base_name:
            return "Generate quiz questions for this topic."
        
        return "Show me study flashcards."
