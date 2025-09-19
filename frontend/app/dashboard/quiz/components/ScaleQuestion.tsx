import React from "react";
import { Quiz } from "@/app/dashboard/quiz/api/quizApi";

interface ScaleQuestionProps {
  quiz: Quiz;
  selectedValue: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({
  quiz,
  selectedValue,
  onAnswerChange,
  disabled = false,
}) => {
  const scaleMin = quiz.scaleMin || 1;
  const scaleMax = quiz.scaleMax || 5;

  const handleScaleClick = (value: number) => {
    if (!disabled) {
      onAnswerChange(value.toString());
    }
  };

  const renderScaleButtons = () => {
    const buttons = [];
    for (let i = scaleMin; i <= scaleMax; i++) {
      const isSelected = selectedValue === i.toString();
      const label = quiz.scaleLabels?.[i.toString()] || i.toString();

      buttons.push(
        <div key={i} className="flex flex-col items-center space-y-2">
          <button
            type="button"
            onClick={() => handleScaleClick(i)}
            disabled={disabled}
            className={`
              w-12 h-12 rounded-full border-2 font-semibold text-sm transition-all duration-200
              ${
                isSelected
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg transform scale-110"
                  : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:shadow-md"
              }
              ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:transform hover:scale-105"
              }
            `}
          >
            {i}
          </button>
          <span className="text-xs text-gray-600 text-center max-w-20 leading-tight">
            {label}
          </span>
        </div>
      );
    }
    return buttons;
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium text-gray-800 leading-relaxed">
        {quiz.question}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-center items-center space-x-4 md:space-x-6">
          {renderScaleButtons()}
        </div>

        {/* Scale indicators */}
        <div className="flex justify-between mt-4 px-4 text-sm text-gray-500">
          <span>
            {quiz.scaleLabels?.[scaleMin.toString()] || `${scaleMin}`}
          </span>
          <span>
            {quiz.scaleLabels?.[scaleMax.toString()] || `${scaleMax}`}
          </span>
        </div>
      </div>

      {selectedValue && (
        <div className="text-center">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            Selected: {selectedValue} -{" "}
            {quiz.scaleLabels?.[selectedValue] || selectedValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default ScaleQuestion;
