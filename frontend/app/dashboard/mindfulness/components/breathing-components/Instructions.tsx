interface InstructionProps {
  type: string;
  description: string;
  cycleCount: number;
  totalCycles: number;
}

const Instructions = ({
  type,
  description,
  cycleCount,
  totalCycles,
}: InstructionProps) => {
  return (
    <>
      <div className="text-lg font-medium mb-3">
        {type === "inhale" && "Breathe In Slowly"}
        {type === "exhale" && "Breathe Out Gently"}
        {type === "hold" && "Hold Your Breath"}
      </div>
      <div className="text-sm text-white/80 mb-4 leading-relaxed">
        {description}
      </div>
      <div className="text-sm text-white/60">
        Cycle {cycleCount + 1} of {totalCycles}
      </div>
    </>
  );
};

export default Instructions;
