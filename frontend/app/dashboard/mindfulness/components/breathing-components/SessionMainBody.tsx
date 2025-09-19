import { BreathingTask } from "@/app/dashboard/mindfulness/dataTypes";
import CircleAnimation from "./CircleAnimation";
import Instructions from "./Instructions";

interface SessionMainBodyProp {
  isPlaying: boolean;
  type: string;
  phases: BreathingTask[];
  phaseIndex: number;
  duration: number;
  timeLeft: number;
  description: string;
  cycleCount: number;
  totalCycles: number;
  sessionEnded: boolean;
}

const SessionMainBody = ({
  isPlaying,
  type,
  phases,
  phaseIndex,
  duration,
  timeLeft,
  description,
  cycleCount,
  totalCycles,
  sessionEnded,
}: SessionMainBodyProp) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <CircleAnimation
        isPlaying={isPlaying}
        type={type}
        phases={phases}
        phaseIndex={phaseIndex}
        duration={duration}
        timeLeft={timeLeft}
      />

      <div className="mt-12 text-center max-w-md">
        <Instructions
          type={type}
          description={description}
          cycleCount={cycleCount}
          totalCycles={totalCycles}
        />
      </div>

      {sessionEnded && (
        <div className="mt-6 text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
          <div className="text-green-400 font-semibold text-lg mb-1">
            Session Complete!
          </div>
          <div className="text-sm text-white/80">
            Well done on completing your breathing practice
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionMainBody;
