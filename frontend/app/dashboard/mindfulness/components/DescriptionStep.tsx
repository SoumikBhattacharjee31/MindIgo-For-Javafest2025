import { Description } from "@/app/dashboard/mindfulness/dataTypes";

interface Props {
  descriptions: Description[];
  selectedDescription: Description | null;
  setSelectedDescription: (d: Description) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DescriptionStep = ({
  descriptions,
  selectedDescription,
  setSelectedDescription,
  nextStep,
  prevStep,
}: Props) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6 text-center">
      What describes your feeling?
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {descriptions.map((desc, index) => (
        <button
          key={index}
          onClick={() => {
            setSelectedDescription(desc);
            nextStep();
          }}
          className={`group relative p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 ${
            selectedDescription?.text === desc.text
              ? "bg-white/30 scale-105"
              : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              {desc.emoji}
            </span>
            <span className="text-white font-medium">{desc.text}</span>
          </div>
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${desc.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
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

export default DescriptionStep;
