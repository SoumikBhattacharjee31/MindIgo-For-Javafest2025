import { Mood } from "@/app/dashboard/mindfulness/dataTypes";

interface Props {
  moods: Mood[];
  selectedMood: Mood | null;
  setSelectedMood: (m: Mood) => void;
  nextStep: () => void;
}

const MoodStep = ({
  moods,
  selectedMood,
  setSelectedMood,
  nextStep,
}: Props) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6 text-center">
      Pick your mood
    </h2>
    <div className="grid grid-cols-5 gap-4 mb-6">
      {moods.map((mood, index) => (
        <button
          key={index}
          onClick={() => {
            setSelectedMood(mood);
            nextStep();
          }}
          className={`group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 ${
            selectedMood?.emoji === mood.emoji
              ? "bg-white/30 scale-105 shadow-xl"
              : ""
          }`}
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
            {mood.emoji}
          </div>
          <div className="text-white/80 text-sm font-medium">{mood.label}</div>
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${mood.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
          ></div>
        </button>
      ))}
    </div>
  </div>
);

export default MoodStep;
