export interface Reason {
  text: string;
  emoji: string;
  color: string;
}

export interface Description {
  text: string;
  emoji: string;
  color: string;
  reasons: Reason[];
}

export interface Mood {
  emoji: string;
  label: string;
  color: string;
  descriptions: Description[];
}

export const moods: Mood[] = [
  {
    emoji: "😍",
    label: "Amazing",
    color: "from-pink-500 to-pink-600",
    descriptions: [
      {
        text: "Productive",
        emoji: "💼",
        color: "from-blue-400 to-blue-500",
        reasons: [
          { text: "Work Success", emoji: "🏆", color: "from-green-400 to-green-500" },
          { text: "Learning", emoji: "📚", color: "from-purple-400 to-purple-500" },
          { text: "Fitness Goal", emoji: "💪", color: "from-red-400 to-red-500" },
        ],
      },
      {
        text: "Grateful",
        emoji: "🙏",
        color: "from-yellow-400 to-yellow-500",
        reasons: [
          { text: "Family", emoji: "👨‍👩‍👧‍👦", color: "from-pink-400 to-pink-500" },
          { text: "Friends", emoji: "👯‍♂️", color: "from-indigo-400 to-indigo-500" },
          { text: "Health", emoji: "🏥", color: "from-green-400 to-green-500" },
        ],
      },
      {
        text: "Excited",
        emoji: "🤩",
        color: "from-orange-400 to-orange-500",
        reasons: [
          { text: "Travel", emoji: "✈️", color: "from-blue-400 to-blue-500" },
          { text: "New Project", emoji: "🚀", color: "from-purple-400 to-purple-500" },
          { text: "Celebration", emoji: "🎉", color: "from-pink-400 to-pink-500" },
        ],
      },
    ],
  },
  {
    emoji: "😊",
    label: "Happy",
    color: "from-green-500 to-green-600",
    descriptions: [
      {
        text: "Relaxed",
        emoji: "😌",
        color: "from-green-400 to-green-500",
        reasons: [
          { text: "Weekend", emoji: "🌴", color: "from-blue-400 to-blue-500" },
          { text: "Self-Care", emoji: "🛀", color: "from-pink-400 to-pink-500" },
          { text: "Hobbies", emoji: "🎸", color: "from-purple-400 to-purple-500" },
        ],
      },
      {
        text: "Loved",
        emoji: "❤️",
        color: "from-red-400 to-red-500",
        reasons: [
          { text: "Relationship", emoji: "💑", color: "from-pink-400 to-pink-500" },
          { text: "Family", emoji: "👨‍👩‍👧‍👦", color: "from-yellow-400 to-yellow-500" },
          { text: "Friendship", emoji: "👯‍♂️", color: "from-indigo-400 to-indigo-500" },
        ],
      },
      {
        text: "Playful",
        emoji: "😄",
        color: "from-yellow-400 to-yellow-500",
        reasons: [
          { text: "Games", emoji: "🎮", color: "from-purple-400 to-purple-500" },
          { text: "Sports", emoji: "⚽", color: "from-green-400 to-green-500" },
          { text: "Fun Time", emoji: "🎢", color: "from-blue-400 to-blue-500" },
        ],
      },
    ],
  },
  {
    emoji: "😐",
    label: "Neutral",
    color: "from-gray-500 to-gray-600",
    descriptions: [
      {
        text: "Indifferent",
        emoji: "🤷‍♂️",
        color: "from-gray-400 to-gray-500",
        reasons: [
          { text: "Routine", emoji: "🔄", color: "from-blue-400 to-blue-500" },
          { text: "Nothing Special", emoji: "📅", color: "from-gray-400 to-gray-500" },
          { text: "Same Old", emoji: "♻️", color: "from-green-400 to-green-500" },
        ],
      },
      {
        text: "Tired",
        emoji: "🥱",
        color: "from-yellow-400 to-yellow-500",
        reasons: [
          { text: "Workload", emoji: "💻", color: "from-blue-400 to-blue-500" },
          { text: "Lack of Sleep", emoji: "😴", color: "from-indigo-400 to-indigo-500" },
          { text: "Overthinking", emoji: "🤯", color: "from-red-400 to-red-500" },
        ],
      },
      {
        text: "Calm",
        emoji: "🧘",
        color: "from-green-400 to-green-500",
        reasons: [
          { text: "Meditation", emoji: "☮️", color: "from-purple-400 to-purple-500" },
          { text: "Nature", emoji: "🌳", color: "from-green-400 to-green-500" },
          { text: "Quiet Time", emoji: "📖", color: "from-yellow-400 to-yellow-500" },
        ],
      },
    ],
  },
  {
    emoji: "😔",
    label: "Sad",
    color: "from-indigo-500 to-indigo-600",
    descriptions: [
      {
        text: "Lonely",
        emoji: "🥺",
        color: "from-indigo-400 to-indigo-500",
        reasons: [
          { text: "No Socializing", emoji: "🚶‍♂️", color: "from-gray-400 to-gray-500" },
          { text: "Missing Family", emoji: "🏠", color: "from-pink-400 to-pink-500" },
          { text: "Breakup", emoji: "💔", color: "from-red-400 to-red-500" },
        ],
      },
      {
        text: "Disappointed",
        emoji: "😞",
        color: "from-gray-400 to-gray-500",
        reasons: [
          { text: "Work", emoji: "🏢", color: "from-gray-400 to-gray-500" },
          { text: "Health", emoji: "🤒", color: "from-red-400 to-red-500" },
          { text: "Unmet Goals", emoji: "📉", color: "from-blue-400 to-blue-500" },
        ],
      },
      {
        text: "Anxious",
        emoji: "😟",
        color: "from-yellow-400 to-yellow-500",
        reasons: [
          { text: "Future", emoji: "🔮", color: "from-purple-400 to-purple-500" },
          { text: "Exams", emoji: "✏️", color: "from-blue-400 to-blue-500" },
          { text: "Deadlines", emoji: "⏰", color: "from-red-400 to-red-500" },
        ],
      },
    ],
  },
  {
    emoji: "😢",
    label: "Terrible",
    color: "from-blue-500 to-blue-600",
    descriptions: [
      {
        text: "Stressed",
        emoji: "😩",
        color: "from-red-400 to-red-500",
        reasons: [
          { text: "Overwork", emoji: "📊", color: "from-blue-400 to-blue-500" },
          { text: "Finances", emoji: "💸", color: "from-green-400 to-green-500" },
          { text: "Health Issues", emoji: "🩺", color: "from-red-400 to-red-500" },
        ],
      },
      {
        text: "Overwhelmed",
        emoji: "😵",
        color: "from-orange-400 to-orange-500",
        reasons: [
          { text: "Too Many Tasks", emoji: "📝", color: "from-blue-400 to-blue-500" },
          { text: "Responsibility", emoji: "⚖️", color: "from-yellow-400 to-yellow-500" },
          { text: "Burnout", emoji: "🔥", color: "from-red-400 to-red-500" },
        ],
      },
      {
        text: "Hopeless",
        emoji: "😭",
        color: "from-blue-400 to-blue-500",
        reasons: [
          { text: "Loss", emoji: "⚰️", color: "from-gray-400 to-gray-500" },
          { text: "Failure", emoji: "📉", color: "from-red-400 to-red-500" },
          { text: "Isolation", emoji: "🚷", color: "from-indigo-400 to-indigo-500" },
        ],
      },
    ],
  },
];
