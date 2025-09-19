import { BreathingTask } from "@/app/dashboard/mindfulness/dataTypes";

const getCircleScale = (
  isPlaying: boolean,
  type: string,
  phases: BreathingTask[],
  phaseIndex: number
) => {
  if (!isPlaying) return 1;

  switch (type) {
    case "inhale":
      return 1.25;
    case "exhale":
      return 0.85;
    case "hold":
      const prevPhase =
        phases[(phaseIndex - 1 + phases.length) % phases.length];
      return prevPhase.type === "inhale" ? 1.25 : 0.85;
    default:
      return 1;
  }
};

const getAnimationClasses = (isPlaying: boolean, type: string) => {
  if (type === "hold" && isPlaying) {
    return "animate-pulse";
  }
  return "";
};

const getPhaseColor = (type: string) => {
  switch (type) {
    case "inhale":
      return "from-green-400 to-emerald-600";
    case "exhale":
      return "from-blue-400 to-cyan-600";
    case "hold":
      return "from-amber-400 to-orange-600";
    default:
      return "from-purple-400 to-indigo-600";
  }
};

interface CircleAnimationProps {
  isPlaying: boolean;
  type: string;
  phases: BreathingTask[];
  phaseIndex: number;
  duration: number;
  timeLeft: number;
}

const CircleAnimation = ({
  isPlaying,
  type,
  phases,
  phaseIndex,
  duration,
  timeLeft,
}: CircleAnimationProps) => {
  return (
    <div
      className={`w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor(
        type
      )} 
            flex items-center justify-center shadow-2xl ${getAnimationClasses(
              isPlaying,
              type
            )}`}
      style={{
        transform: `scale(${getCircleScale(
          isPlaying,
          type,
          phases,
          phaseIndex
        )})`,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        transition:
          type === "hold" ? "none" : `transform ${duration}s ease-in-out`,
      }}
    >
      <div className="text-center">
        <div className="text-2xl font-medium capitalize mb-3 opacity-90">
          {type}
        </div>
        <div className="text-6xl font-bold">{timeLeft}</div>
      </div>
    </div>
  );
};

export default CircleAnimation;
