from app.service.story_service import StoryService

story_service = StoryService()

for voice in story_service.get_all_voices():
    print(f"Voice ID: {voice.voice_id}, Name: {voice.name}" )
    
story = story_service.generate_story("I am not feeling well today.",);
print(story)