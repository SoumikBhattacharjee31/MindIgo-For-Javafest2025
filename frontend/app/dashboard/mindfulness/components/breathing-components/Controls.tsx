import { Pause, Play } from "lucide-react";

interface ControlsProps {
  reset: () => void;
  togglePlayPause: () => void;
  sessionEnded: boolean;
  isPlaying: boolean;
}

const Controls = ({
  reset,
  togglePlayPause,
  sessionEnded,
  isPlaying,
}: ControlsProps) => {
  return (
    <div className="flex items-center justify-center space-x-8 pb-12">
      <button
        onClick={reset}
        className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
        title="Reset"
      >
        <span className="text-2xl">↺</span>
      </button>

      <button
        onClick={togglePlayPause}
        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-900 hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={sessionEnded}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8" />
        ) : (
          <Play className="w-8 h-8 ml-1" />
        )}
      </button>
    </div>
  );
};

export default Controls;
