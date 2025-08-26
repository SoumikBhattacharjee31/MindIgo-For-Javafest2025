import { Reason } from "./dataTypes";

export const reasons: Reason[] = [
  // Amazing
  { text: "Work Success", emoji: "🏆", color: "from-green-400 to-green-500", moods: ["amazing", "motivated"] },
  { text: "Learning", emoji: "📚", color: "from-purple-400 to-purple-500", moods: ["amazing", "happy"] },
  { text: "Fitness Goal", emoji: "💪", color: "from-red-400 to-red-500", moods: ["motivated", "amazing"] },
  { text: "New Project", emoji: "🚀", color: "from-purple-400 to-purple-500", moods: ["amazing", "motivated"] },
  { text: "Travel", emoji: "✈️", color: "from-blue-400 to-blue-500", moods: ["amazing", "excited"] },

  // Happy
  { text: "Family", emoji: "👨‍👩‍👧‍👦", color: "from-pink-400 to-pink-500", moods: ["happy", "grateful", "sad"] },
  { text: "Friends", emoji: "👯‍♂️", color: "from-indigo-400 to-indigo-500", moods: ["happy", "amazing"] },
  { text: "Health", emoji: "🏥", color: "from-green-400 to-green-500", moods: ["happy", "grateful", "terrible"] },
  { text: "Celebration", emoji: "🎉", color: "from-pink-400 to-pink-500", moods: ["amazing", "happy"] },
  { text: "Weekend", emoji: "🌴", color: "from-blue-400 to-blue-500", moods: ["happy", "relaxed"] },

  // Neutral
  { text: "Routine", emoji: "🔄", color: "from-gray-400 to-gray-500", moods: ["neutral"] },
  { text: "Weather", emoji: "⛅", color: "from-blue-400 to-blue-500", moods: ["neutral"] },
  { text: "Boredom", emoji: "😐", color: "from-gray-400 to-gray-500", moods: ["neutral"] },
  { text: "Waiting", emoji: "🕒", color: "from-gray-400 to-gray-500", moods: ["neutral"] },
  { text: "Daily Chores", emoji: "🧹", color: "from-green-400 to-green-500", moods: ["neutral"] },

  // Sad
  { text: "Loss", emoji: "⚰️", color: "from-gray-400 to-gray-500", moods: ["terrible", "sad"] },
  { text: "Homesickness", emoji: "🏠", color: "from-blue-400 to-blue-500", moods: ["sad"] },
  { text: "Breakup", emoji: "💔", color: "from-red-400 to-red-500", moods: ["sad", "terrible"] },
  { text: "Failure", emoji: "📉", color: "from-gray-400 to-gray-500", moods: ["sad"] },
  { text: "Loneliness", emoji: "🚶", color: "from-indigo-400 to-indigo-500", moods: ["sad"] },

  // Terrible
  { text: "Overwork", emoji: "📊", color: "from-blue-400 to-blue-500", moods: ["terrible", "angry"] },
  { text: "Finances", emoji: "💸", color: "from-green-400 to-green-500", moods: ["terrible", "anxious"] },
  { text: "Health Issues", emoji: "🤒", color: "from-red-400 to-red-500", moods: ["terrible", "sad"] },
  { text: "Conflict", emoji: "⚔️", color: "from-orange-400 to-orange-500", moods: ["terrible", "angry"] },
  { text: "Rejection", emoji: "🚫", color: "from-gray-400 to-gray-500", moods: ["terrible", "sad"] },

  // Angry
  { text: "Deadlines", emoji: "⏰", color: "from-red-400 to-red-500", moods: ["anxious", "angry"] },
  { text: "Arguments", emoji: "💢", color: "from-orange-400 to-orange-500", moods: ["angry"] },
  { text: "Traffic", emoji: "🚗", color: "from-yellow-400 to-yellow-500", moods: ["angry"] },
  { text: "Unfairness", emoji: "⚖️", color: "from-blue-400 to-blue-500", moods: ["angry"] },
  { text: "Noise", emoji: "🔊", color: "from-purple-400 to-purple-500", moods: ["angry"] },

  // Anxious
  { text: "Exams", emoji: "✏️", color: "from-blue-400 to-blue-500", moods: ["anxious"] },
  { text: "Deadlines", emoji: "⏰", color: "from-red-400 to-red-500", moods: ["anxious", "angry"] },
  { text: "Interviews", emoji: "🗣️", color: "from-orange-400 to-orange-500", moods: ["anxious"] },
  { text: "Future", emoji: "🔮", color: "from-purple-400 to-purple-500", moods: ["anxious"] },
  { text: "Health Check", emoji: "🩺", color: "from-green-400 to-green-500", moods: ["anxious"] },

  // Excited
  { text: "Games", emoji: "🎮", color: "from-purple-400 to-purple-500", moods: ["happy", "playful", "excited"] },
  { text: "Concert", emoji: "🎶", color: "from-pink-400 to-pink-500", moods: ["excited", "happy"] },
  { text: "Adventure", emoji: "🗺️", color: "from-green-400 to-green-500", moods: ["excited", "amazing"] },
  { text: "Shopping", emoji: "🛍️", color: "from-orange-400 to-orange-500", moods: ["excited", "happy"] },
  { text: "Events", emoji: "🎊", color: "from-blue-400 to-blue-500", moods: ["excited"] },

  // Relaxed
  { text: "Weekend", emoji: "🌴", color: "from-blue-400 to-blue-500", moods: ["happy", "relaxed"] },
  { text: "Self-Care", emoji: "🛀", color: "from-pink-400 to-pink-500", moods: ["happy", "relaxed"] },
  { text: "Reading", emoji: "📖", color: "from-purple-400 to-purple-500", moods: ["relaxed"] },
  { text: "Music", emoji: "🎵", color: "from-blue-400 to-blue-500", moods: ["relaxed", "happy"] },
  { text: "Nature", emoji: "🌳", color: "from-green-400 to-green-500", moods: ["relaxed"] },

  // Motivated
  { text: "Fitness Goal", emoji: "💪", color: "from-red-400 to-red-500", moods: ["motivated", "amazing"] },
  { text: "New Project", emoji: "🚀", color: "from-purple-400 to-purple-500", moods: ["motivated", "amazing"] },
  { text: "Learning", emoji: "📚", color: "from-purple-400 to-purple-500", moods: ["motivated", "amazing"] },
  { text: "Career Growth", emoji: "💼", color: "from-blue-400 to-blue-500", moods: ["motivated"] },
  { text: "Inspiration", emoji: "🌟", color: "from-yellow-400 to-yellow-500", moods: ["motivated"] },
];
