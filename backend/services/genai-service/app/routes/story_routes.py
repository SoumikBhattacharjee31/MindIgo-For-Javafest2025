from fastapi import APIRouter, HTTPException, Query, Path, Body
from fastapi.responses import Response
from typing import Optional
import logging
from app.dto.api_response_class import APIResponseClass
from app.dto.story_models import TTSRequest, VoiceSettings
from app.service.story_service import StoryService

story_service = StoryService()

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health")
def health_check() -> APIResponseClass:
    """Health check endpoint for the story service."""
    try:
        is_healthy = story_service.is_healthy()
        stats = story_service.get_service_stats()
        
        if is_healthy:
            return APIResponseClass(
                success=True, 
                message="Story service is healthy", 
                data=stats
            )
        else:
            return APIResponseClass(
                success=False, 
                message="Story service is not healthy", 
                data=stats,
                error_code="UNHEALTHY_SERVICE"
            )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@router.get("/voices", response_model=APIResponseClass)
def get_voices(
    category: Optional[str] = Query(None, description="Filter voices by category")
) -> APIResponseClass:
    """Get all available voices, optionally filtered by category."""
    try:
        if category:
            voices = story_service.get_voices_by_category(category.strip())
            message = f"Voices retrieved for category: {category}"
        else:
            voices = story_service.get_all_voices()
            message = "All voices retrieved successfully"
        
        return APIResponseClass(
            success=True,
            message=message,
            data=voices
        )
    except Exception as e:
        logger.error(f"Error retrieving voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve voices")

@router.get("/voices/{voice_id}", response_model=APIResponseClass)
def get_voice_by_id(
    voice_id: str = Path(..., description="Voice ID to retrieve")
) -> APIResponseClass:
    """Get a specific voice by its ID."""
    try:
        voice = story_service.get_voice_by_id(voice_id)
        
        if voice:
            return APIResponseClass(
                success=True,
                message="Voice retrieved successfully",
                data=voice
            )
        else:
            return APIResponseClass(
                success=False,
                message="Voice not found",
                data=None,
                error_code="VOICE_NOT_FOUND"
            )
    except Exception as e:
        logger.error(f"Error retrieving voice {voice_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve voice")

@router.get("/voices/categories", response_model=APIResponseClass)
def get_categories() -> APIResponseClass:
    """Get all available voice categories."""
    try:
        categories = story_service.get_available_categories()
        return APIResponseClass(
            success=True,
            message="Categories retrieved successfully",
            data=categories
        )
    except Exception as e:
        logger.error(f"Error retrieving categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")

@router.get("/voices/search", response_model=APIResponseClass)
def search_voices(
    query: str = Query(..., min_length=1, description="Search query for voice name, description, or category")
) -> APIResponseClass:
    """Search voices by name, description, or category."""
    try:
        if not query or not query.strip():
            return APIResponseClass(
                success=False,
                message="Search query cannot be empty",
                data=None,
                error_code="EMPTY_QUERY"
            )
        
        voices = story_service.search_voices(query.strip())
        return APIResponseClass(
            success=True,
            message=f"Search completed for query: '{query}'",
            data=voices
        )
    except Exception as e:
        logger.error(f"Error searching voices with query '{query}': {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@router.post("/generate")
def generate_voice(
    tts_request: TTSRequest = Body(..., description="Text-to-speech request")
):
    """Generate voice audio from text."""
    try:
        logger.info(f"Generating speech for voice: {tts_request.voice_id}, text length: {len(tts_request.text)}")
        
        # Validate voice exists
        voice = story_service.get_voice_by_id(tts_request.voice_id)
        if not voice:
            return APIResponseClass(
                success=False,
                message=f"Voice with ID '{tts_request.voice_id}' not found",
                data=None,
                error_code="VOICE_NOT_FOUND"
            )
        
        # Generate audio
        audio_data = story_service.generate_voice(tts_request)
        
        if not audio_data or len(audio_data) == 0:
            raise HTTPException(status_code=500, detail="Generated audio is empty")
        
        # Return audio file
        media_type = "audio/mpeg" if tts_request.output_format.startswith("mp3") else "audio/wav"
        filename = f"generated_voice.{tts_request.output_format.split('_')[0]}"
        
        return Response(
            content=audio_data,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(audio_data))
            }
        )
        
    except ValueError as e:
        logger.warning(f"Invalid request for TTS generation: {e}")
        return APIResponseClass(
            success=False,
            message=str(e),
            data=None,
            error_code="INVALID_VOICE_ID"
        )
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate speech")

@router.post("/generate/preview", response_model=APIResponseClass)
def generate_voice_preview(
    voice_id: str = Body(..., embed=True),
    sample_text: str = Body("Hello, this is a preview of my voice.", embed=True)
) -> APIResponseClass:
    """Generate a short voice preview for testing."""
    try:
        # Validate voice exists
        voice = story_service.get_voice_by_id(voice_id)
        if not voice:
            return APIResponseClass(
                success=False,
                message=f"Voice with ID '{voice_id}' not found",
                data=None,
                error_code="VOICE_NOT_FOUND"
            )
        
        # Create a simple preview request
        preview_request = TTSRequest(
            voice_id=voice_id,
            text=sample_text[:100],  # Limit preview text length
            voice_settings=VoiceSettings(stability=0.7, similarity_boost=0.8),
            output_format="mp3_22050_32"  # Lower quality for preview
        )
        
        # Generate preview audio
        audio_data = story_service.generate_voice(preview_request)
        
        # Return base64 encoded audio for embedding in response
        import base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return APIResponseClass(
            success=True,
            message="Voice preview generated successfully",
            data={
                "voice_id": voice_id,
                "voice_name": voice.name,
                "audio_data": audio_base64,
                "audio_format": "mp3",
                "sample_text": sample_text[:100]
            }
        )
        
    except ValueError as e:
        logger.warning(f"Invalid request for voice preview: {e}")
        return APIResponseClass(
            success=False,
            message=str(e),
            data=None,
            error_code="INVALID_VOICE_ID"
        )
    except Exception as e:
        logger.error(f"Error generating voice preview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate preview")

@router.post("/refresh")
def refresh_voices() -> APIResponseClass:
    """Refresh voices cache from ElevenLabs API (Admin function)."""
    try:
        story_service.refresh_voices()
        return APIResponseClass(
            success=True,
            message="Voices refreshed successfully",
            data={"total_voices": len(story_service.get_all_voices())}
        )
    except Exception as e:
        logger.error(f"Error refreshing voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh voices")

@router.get("/stats", response_model=APIResponseClass)
def get_service_stats() -> APIResponseClass:
    """Get service statistics."""
    try:
        stats = story_service.get_service_stats()
        return APIResponseClass(
            success=True,
            message="Service statistics retrieved successfully",
            data=stats
        )
    except Exception as e:
        logger.error(f"Error retrieving service stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")