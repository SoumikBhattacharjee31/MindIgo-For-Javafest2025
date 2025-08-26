import { Reason } from "../dataTypes";

interface Props {
  reasons: Reason[];
  selectedReason: Reason | null;
  setSelectedReason: (r: Reason) => void;
  handleSubmit: (r: Reason) => void;
  prevStep: () => void;
}

const ReasonStep = ({
  reasons,
  selectedReason,
  setSelectedReason,
  handleSubmit,
  prevStep,
}: Props) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6 text-center">
      What's the main reason?
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {reasons.map((reason, index) => (
        <button
          key={index}
          onClick={() => {
            setSelectedReason(reason);
            handleSubmit(reason);
          }}
          className={`group relative p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 ${
            selectedReason?.text === reason.text ? "bg-white/30 scale-105" : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              {reason.emoji}
            </span>
            <span className="text-white font-medium">{reason.text}</span>
          </div>
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${reason.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
          ></div>
        </button>
      ))}
    </div>
    <div className="text-center">
      <button
        onClick={prevStep}
        className="bg-white/20 text-white px-6 py-2 rounded-full hover:bg-white/30 transition-all duration-300"
      >
        ← Back
      </button>
    </div>
  </div>
);

export default ReasonStep;
