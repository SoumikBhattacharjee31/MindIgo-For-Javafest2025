import React from 'react';
import { Quiz } from '../api/quizApi';

interface McqQuestionProps {
  quiz: Quiz;
  selectedValue: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

const McqQuestion: React.FC<McqQuestionProps> = ({
  quiz,
  selectedValue,
  onAnswerChange,
  disabled = false,
}) => {
  const handleOptionClick = (option: string) => {
    if (!disabled) {
      onAnswerChange(option);
    }
  };

  if (!quiz.options || quiz.options.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-lg font-medium text-gray-800 leading-relaxed">
          {quiz.question}
        </div>
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">
          No options available for this question.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium text-gray-800 leading-relaxed">
        {quiz.question}
      </div>
      
      <div className="space-y-3">
        {quiz.options.map((option, index) => {
          const isSelected = selectedValue === option;
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D, etc.
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              disabled={disabled}
              className={`
                w-full p-4 text-left rounded-lg border-2 transition-all duration-200 group
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                  : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
              `}
            >
              <div className="flex items-start space-x-3">
                <div 
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : 'border-gray-400 bg-white text-gray-600 group-hover:border-blue-400'
                    }
                  `}
                >
                  {optionLetter}
                </div>
                <div className="flex-1 text-sm leading-relaxed">
                  {option}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedValue && (
        <div className="text-center">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            Selected: {quiz.options.find(opt => opt === selectedValue)}
          </span>
        </div>
      )}
    </div>
  );
};

export default McqQuestion;