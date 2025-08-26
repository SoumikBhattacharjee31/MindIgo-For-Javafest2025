import {  Mood, Description, Reason } from "./moodOptions";
import { Entry } from "./MoodCheckinCard";

interface Props {
  entry: Entry;
  selectedMood: Mood | null;
  selectedDescription: Description | null;
  selectedReason: Reason | null;
  isAnimating: boolean;
  onEdit: () => void;
}

const TodayEntryCard = ({
  entry,
  selectedMood,
  selectedDescription,
  selectedReason,
  isAnimating,
  onEdit,
}: Props) => (
  <div
    className={`transition-all duration-300 ${
      isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
    }`}
  >
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{selectedMood?.emoji}</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Feeling {selectedDescription?.text}
        </h3>
        <p className="text-white/80 text-lg mb-4">
          Because of {selectedReason?.text} {selectedReason?.emoji}
        </p>
        <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
          <span className="text-white/80 text-sm">Today's Mood Logged ✓</span>
        </div>
      </div>
    </div>
    <div className="text-center">
      <button
        onClick={onEdit}
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Update My Mood
      </button>
    </div>
  </div>
);

export default TodayEntryCard;
