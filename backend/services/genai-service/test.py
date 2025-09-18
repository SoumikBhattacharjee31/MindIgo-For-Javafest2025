from app.config.logger_config import get_logger
from app.util.content_service_util import get_mood, get_breathing_exercise, get_song
logger = get_logger(__name__)

if __name__ == "__main__":
    import asyncio

    async def main():
        user_id = 1
        days = 7
        isMock = False

        moods = await get_mood(user_id=user_id, days=days, isMock=isMock)
        logger.info(f"Mood Data: {moods}")

        breathing_exercises = await get_breathing_exercise(user_id=user_id, isMock=isMock)
        logger.info(f"Breathing Exercises: {breathing_exercises}")

        song = get_song(mood_category ="happy")
        logger.info(f"Song Data: {song}")

    asyncio.run(main())