interface Props {
  step: number;
}

const ProgressIndicator = ({ step }: Props) => (
  <div className="flex justify-center mb-8">
    <div className="flex space-x-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full border-4 transition-all duration-500 flex items-center justify-center ${
              step >= s
                ? "border-white bg-white text-purple-600 shadow-lg scale-110"
                : "border-white/50 text-white/50"
            }`}
          >
            {s === 1 && "😊"}
            {s === 2 && "💭"}
            {s === 3 && "🎯"}
          </div>
          <div
            className={`text-xs mt-2 font-medium transition-colors duration-300 ${
              step >= s ? "text-white" : "text-white/50"
            }`}
          >
            {s === 1 && "Mood"}
            {s === 2 && "Feeling"}
            {s === 3 && "Reason"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProgressIndicator;
