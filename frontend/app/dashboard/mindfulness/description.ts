import { Description } from "./dataTypes";

export const descriptions: Description[] = [
  // Amazing
  { text: "Productive", emoji: "💼", color: "from-blue-400 to-blue-500", moods: ["amazing", "motivated"] },
  { text: "Grateful", emoji: "🙏", color: "from-yellow-400 to-yellow-500", moods: ["amazing", "happy"] },
  { text: "Excited", emoji: "🤩", color: "from-orange-400 to-orange-500", moods: ["amazing", "excited"] },
  { text: "Inspired", emoji: "🌟", color: "from-purple-400 to-purple-500", moods: ["amazing", "motivated"] },
  { text: "Fulfilled", emoji: "✨", color: "from-pink-400 to-pink-500", moods: ["amazing", "happy"] },

  // Happy
  { text: "Relaxed", emoji: "😌", color: "from-green-400 to-green-500", moods: ["happy", "relaxed"] },
  { text: "Loved", emoji: "❤️", color: "from-red-400 to-red-500", moods: ["happy", "amazing"] },
  { text: "Playful", emoji: "😄", color: "from-yellow-400 to-yellow-500", moods: ["happy", "excited"] },
  { text: "Cheerful", emoji: "😁", color: "from-orange-400 to-orange-500", moods: ["happy"] },
  { text: "Optimistic", emoji: "🌈", color: "from-pink-400 to-pink-500", moods: ["happy", "motivated"] },

  // Neutral
  { text: "Indifferent", emoji: "🤷‍♂️", color: "from-gray-400 to-gray-500", moods: ["neutral"] },
  { text: "Tired", emoji: "🥱", color: "from-yellow-400 to-yellow-500", moods: ["neutral", "sad"] },
  { text: "Calm", emoji: "🧘", color: "from-green-400 to-green-500", moods: ["neutral", "relaxed"] },
  { text: "Okay", emoji: "👌", color: "from-blue-400 to-blue-500", moods: ["neutral"] },
  { text: "Unbothered", emoji: "😶", color: "from-gray-400 to-gray-500", moods: ["neutral"] },

  // Sad
  { text: "Lonely", emoji: "🥺", color: "from-indigo-400 to-indigo-500", moods: ["sad", "terrible"] },
  { text: "Disappointed", emoji: "😞", color: "from-gray-400 to-gray-500", moods: ["sad"] },
  { text: "Gloomy", emoji: "🌧️", color: "from-blue-400 to-blue-500", moods: ["sad"] },
  { text: "Regretful", emoji: "😔", color: "from-indigo-400 to-indigo-500", moods: ["sad"] },
  { text: "Drained", emoji: "🥀", color: "from-purple-400 to-purple-500", moods: ["sad", "neutral"] },

  // Terrible
  { text: "Stressed", emoji: "😩", color: "from-red-400 to-red-500", moods: ["terrible", "angry"] },
  { text: "Hopeless", emoji: "😭", color: "from-blue-400 to-blue-500", moods: ["terrible"] },
  { text: "Defeated", emoji: "💔", color: "from-gray-400 to-gray-500", moods: ["terrible", "sad"] },
  { text: "Burnt Out", emoji: "🔥", color: "from-orange-400 to-orange-500", moods: ["terrible", "sad"] },
  { text: "Exhausted", emoji: "😵", color: "from-gray-400 to-gray-500", moods: ["terrible", "neutral"] },

  // Angry
  { text: "Frustrated", emoji: "😤", color: "from-orange-400 to-orange-500", moods: ["angry"] },
  { text: "Irritated", emoji: "😒", color: "from-yellow-400 to-yellow-500", moods: ["angry"] },
  { text: "Annoyed", emoji: "😠", color: "from-red-400 to-red-500", moods: ["angry"] },
  { text: "Resentful", emoji: "👿", color: "from-purple-400 to-purple-500", moods: ["angry"] },
  { text: "Impatient", emoji: "⏳", color: "from-orange-400 to-orange-500", moods: ["angry"] },

  // Anxious
  { text: "Worried", emoji: "😟", color: "from-yellow-400 to-yellow-500", moods: ["anxious"] },
  { text: "Restless", emoji: "😬", color: "from-gray-400 to-gray-500", moods: ["anxious"] },
  { text: "Overthinking", emoji: "🤯", color: "from-purple-400 to-purple-500", moods: ["anxious"] },
  { text: "Uneasy", emoji: "🙃", color: "from-blue-400 to-blue-500", moods: ["anxious"] },
  { text: "Nervous", emoji: "😰", color: "from-red-400 to-red-500", moods: ["anxious"] },

  // Excited
  { text: "Energetic", emoji: "⚡", color: "from-yellow-400 to-yellow-500", moods: ["excited"] },
  { text: "Playful", emoji: "🤸", color: "from-pink-400 to-pink-500", moods: ["excited", "happy"] },
  { text: "Adventurous", emoji: "🗺️", color: "from-green-400 to-green-500", moods: ["excited", "amazing"] },
  { text: "Eager", emoji: "😃", color: "from-orange-400 to-orange-500", moods: ["excited"] },
  { text: "Hopeful", emoji: "🌅", color: "from-red-400 to-red-500", moods: ["excited", "motivated"] },

  // Relaxed
  { text: "Peaceful", emoji: "🍃", color: "from-teal-400 to-teal-500", moods: ["relaxed"] },
  { text: "Chill", emoji: "🛋️", color: "from-gray-400 to-gray-500", moods: ["relaxed", "neutral"] },
  { text: "Comfortable", emoji: "🛏️", color: "from-pink-400 to-pink-500", moods: ["relaxed"] },
  { text: "Satisfied", emoji: "😌", color: "from-green-400 to-green-500", moods: ["relaxed", "happy"] },
  { text: "At Ease", emoji: "🌊", color: "from-blue-400 to-blue-500", moods: ["relaxed"] },

  // Motivated
  { text: "Motivated", emoji: "🔥", color: "from-red-400 to-red-500", moods: ["motivated", "amazing"] },
  { text: "Driven", emoji: "🚀", color: "from-purple-400 to-purple-500", moods: ["motivated"] },
  { text: "Focused", emoji: "🎯", color: "from-blue-400 to-blue-500", moods: ["motivated"] },
  { text: "Ambitious", emoji: "💡", color: "from-yellow-400 to-yellow-500", moods: ["motivated"] },
  { text: "Determined", emoji: "🛡️", color: "from-green-400 to-green-500", moods: ["motivated"] },
];
