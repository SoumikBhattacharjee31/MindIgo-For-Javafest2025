import json
import os
from typing import List, Optional, Dict, Any
import requests
from app.dto.story_models import Voice, TTSRequest, VoiceSettings
from app.config.settings import settings
from app.config.logger_config import get_logger
from app.model.model_gen import get_gemini_model
logger = get_logger(__name__)

class StoryService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = settings.ELEVENLABS_BASE_URL
        self.model_id = settings.ELEVENLABS_MODEL_ID
        self.voices_file = settings.ELEVENLABS_VOICE_FILENAME
        self.voices_cache: Dict[str, Voice] = {}
        self.story_model = get_gemini_model("flash_lite",temperature=0.6,max_retries=3)
        # Initialize the service
        self.initialize()
    
    def initialize(self):
        """Initialize the service by loading voices from JSON or fetching from API."""
        try:
            self._load_from_json()
            if not self.voices_cache:
                self._fetch_and_save_voices()
            logger.info(f"StoryService initialized with {len(self.voices_cache)} voices")
        except Exception as e:
            logger.error(f"Failed to initialize StoryService: {e}")
            raise
    
    def _load_from_json(self):
        """Load voices from JSON file if it exists."""
        try:
            if os.path.exists(self.voices_file) and os.path.getsize(self.voices_file) > 0:
                with open(self.voices_file, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    voices_data = data.get('voices', [])
                    
                    for voice_data in voices_data:
                        # Handle voice_settings if present
                        settings_data = voice_data.get('settings')
                        voice_settings = None
                        if settings_data:
                            voice_settings = VoiceSettings(**settings_data)
                        
                        voice = Voice(
                            voice_id=voice_data['voice_id'],
                            name=voice_data['name'],
                            category=voice_data.get('category'),
                            description=voice_data.get('description'),
                            preview_url=voice_data.get('preview_url'),
                            available_for_tiers=voice_data.get('available_for_tiers'),
                            settings=voice_settings
                        )
                        self.voices_cache[voice.voice_id] = voice
                    
                    logger.info(f"Loaded {len(self.voices_cache)} voices from JSON file")
            else:
                logger.info("No voices JSON file found or empty; will fetch from API")
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing voices JSON: {e}")
        except Exception as e:
            logger.error(f"Error loading voices from JSON: {e}")
    
    def _fetch_and_save_voices(self):
        """Fetch voices from ElevenLabs API and save to JSON file."""
        try:
            headers = self._create_headers()
            
            response = requests.get(
                f"{self.base_url}/v1/voices",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                voices_data = response.json()
                voices_list = voices_data.get('voices', [])
                
                # Clear existing cache
                self.voices_cache.clear()
                
                # Process each voice
                for voice_data in voices_list:
                    # Handle voice_settings if present
                    settings_data = voice_data.get('settings')
                    voice_settings = None
                    if settings_data:
                        voice_settings = VoiceSettings(**settings_data)
                    
                    voice = Voice(
                        voice_id=voice_data['voice_id'],
                        name=voice_data['name'],
                        category=voice_data.get('category'),
                        description=voice_data.get('description'),
                        preview_url=voice_data.get('preview_url'),
                        available_for_tiers=voice_data.get('available_for_tiers'),
                        settings=voice_settings
                    )
                    self.voices_cache[voice.voice_id] = voice
                
                # Save to JSON file
                self._save_voices_to_json()
                
                logger.info(f"Fetched and saved {len(self.voices_cache)} voices to JSON file")
            else:
                logger.error(f"HTTP error fetching voices: {response.status_code} - {response.text}")
                raise Exception(f"Failed to fetch voices from ElevenLabs API: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error fetching voices: {e}")
            raise Exception(f"Failed to fetch voices from ElevenLabs API: {e}")
        except Exception as e:
            logger.error(f"Error fetching/saving voices: {e}")
            raise Exception(f"Failed to fetch/save voices: {e}")
    
    def _save_voices_to_json(self):
        """Save voices cache to JSON file."""
        try:
            # Convert voices to serializable format using Pydantic's dict() method
            voices_list = []
            for voice in self.voices_cache.values():
                voice_dict = voice.model_dump()
                voices_list.append(voice_dict)
            
            voices_response = {'voices': voices_list}
            
            with open(self.voices_file, 'w', encoding='utf-8') as file:
                json.dump(voices_response, file, indent=2, ensure_ascii=False)
                
        except Exception as e:
            logger.error(f"Error saving voices to JSON: {e}")
            raise
    
    def refresh_voices(self):
        """Refresh voices by fetching from API."""
        self._fetch_and_save_voices()
    
    def get_all_voices(self) -> List[Voice]:
        """Get all voices."""
        return list(self.voices_cache.values())
    
    def get_voice_by_id(self, voice_id: str) -> Optional[Voice]:
        """Get voice data by voice ID."""
        return self.voices_cache.get(voice_id)
    
    def get_voices_by_category(self, category: str) -> List[Voice]:
        """Get voices filtered by category."""
        return [
            voice for voice in self.voices_cache.values() 
            if voice.category and voice.category.lower() == category.lower()
        ]
    
    def get_available_categories(self) -> List[str]:
        """Get all available voice categories."""
        categories = set()
        for voice in self.voices_cache.values():
            if voice.category:
                categories.add(voice.category)
        return sorted(list(categories))
    
    def search_voices(self, query: str) -> List[Voice]:
        """Search voices by name, description, or category."""
        if not query or not query.strip():
            return []
        
        query_lower = query.lower().strip()
        results = []
        
        for voice in self.voices_cache.values():
            if (query_lower in voice.name.lower() or
                (voice.description and query_lower in voice.description.lower()) or
                (voice.category and query_lower in voice.category.lower())):
                results.append(voice)
        
        return results
    
    def generate_voice(self, tts_request: TTSRequest) -> bytes:
        """Generate voice audio from text using ElevenLabs TTS API."""
        # Validate voice exists
        if tts_request.voice_id not in self.voices_cache:
            raise ValueError(f"Voice with ID {tts_request.voice_id} not found")
        
        try:
            headers = self._create_headers()
            
            # Prepare request body
            request_body = {
                "text": tts_request.text,
                "model_id": self.model_id
            }
            
            # Add voice settings if provided
            if tts_request.voice_settings:
                request_body["voice_settings"] = tts_request.voice_settings.model_dump()
            
            # Make the TTS request
            url = f"{self.base_url}/v1/text-to-speech/{tts_request.voice_id}"
            params = {"output_format": tts_request.output_format}
            
            response = requests.post(
                url,
                headers=headers,
                json=request_body,
                params=params,
                timeout=60
            )
            
            if response.status_code == 200:
                audio_data = response.content
                logger.info(f"Generated TTS audio: {len(audio_data)} bytes for voice {tts_request.voice_id}")
                return audio_data
            else:
                logger.error(f"TTS request failed: {response.status_code} - {response.text}")
                raise Exception(f"TTS request failed with status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error in TTS: {e}")
            raise Exception(f"Text-to-speech conversion failed: {e}")
        except Exception as e:
            logger.error(f"Error in text-to-speech conversion: {e}")
            raise Exception(f"Text-to-speech conversion failed: {e}")
    
    def _create_headers(self) -> Dict[str, str]:
        """Create headers for API requests."""
        return {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def is_healthy(self) -> bool:
        """Health check method."""
        return len(self.voices_cache) > 0
    
    def get_service_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        category_count = {}
        for category in self.get_available_categories():
            category_count[category] = len(self.get_voices_by_category(category))
        
        return {
            "total_voices": len(self.voices_cache),
            "total_categories": len(self.get_available_categories()),
            "category_breakdown": category_count,
            "is_healthy": self.is_healthy(),
            "voices_file_exists": os.path.exists(self.voices_file)
        }

    def generate_story(self, prompt: str) -> str:
        """Generate a story using the Gemini model."""
        try:
            final_state = self.story_model.invoke(
            f"""Imagine the user provided some insight of his or her mood and life which is this: '{prompt}'. 
                Write a very short story (5-7 sentences max) 
                that reflects this mood while gently guiding them toward comfort, hope, or strength. 
                Keep the language simple, soothing, and easy to read. 
                Make it emotionally supportive, vivid, and uplifting, like a gentle reminder that they are not alone.
                Avoid complex words or abstract concepts. 
                The story should feel like a warm hug, offering solace and encouragement in a few heartfelt sentences"""
            )
            logger.info("Story generated successfully")
            return final_state.content
        except Exception as e:
            logger.error(f"Error generating story: {e}")
            raise Exception(f"Story generation failed: {e}")

    def generate_voice_story(self, prompt: str, voice_id: str) -> bytes:
        """Generate a story and convert it to speech."""
        try:
            story_text = self.generate_story(prompt)
            tts_request = TTSRequest(
                voice_id=voice_id,
                text=story_text,
                output_format="mp3"
            )
            audio_data = self.generate_voice(tts_request)
            logger.info("Voice story generated successfully")
            return audio_data
        except Exception as e:
            logger.error(f"Error generating voice story: {e}")
            raise Exception(f"Voice story generation failed: {e}")