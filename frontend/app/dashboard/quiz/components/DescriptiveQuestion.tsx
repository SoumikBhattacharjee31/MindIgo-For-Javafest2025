import React from 'react';
import { Quiz } from '../api/quizApi';

interface DescriptiveQuestionProps {
  quiz: Quiz;
  selectedValue: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

const DescriptiveQuestion: React.FC<DescriptiveQuestionProps> = ({
  quiz,
  selectedValue,
  onAnswerChange,
  disabled = false,
}) => {
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!disabled) {
      onAnswerChange(event.target.value);
    }
  };

  const maxLength = 1000;
  const remainingChars = maxLength - selectedValue.length;

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium text-gray-800 leading-relaxed">
        {quiz.question}
      </div>
      
      <div className="space-y-2">
        <textarea
          value={selectedValue}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="Please provide a detailed answer..."
          maxLength={maxLength}
          rows={6}
          className={`
            w-full p-4 border-2 rounded-lg resize-none transition-all duration-200 text-gray-800
            ${disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
              : 'border-gray-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
            }
            placeholder-gray-400
          `}
        />
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-500">
            {selectedValue.length >= 5 
              ? <span className="text-green-600">✓ Answer looks good</span>
              : selectedValue.length > 0 
                ? <span className="text-amber-600">Please provide more detail (minimum 5 characters)</span>
                : <span className="text-gray-500">Start typing your answer...</span>
            }
          </div>
          <div className={`
            ${remainingChars < 50 ? 'text-red-500' : remainingChars < 100 ? 'text-amber-500' : 'text-gray-500'}
          `}>
            {remainingChars} characters remaining
          </div>
        </div>
        
        {/* Progress bar for character count */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className={`
              h-1 rounded-full transition-all duration-300
              ${selectedValue.length < 50 
                ? 'bg-red-400' 
                : selectedValue.length < maxLength * 0.8 
                  ? 'bg-blue-400' 
                  : 'bg-amber-400'
              }
            `}
            style={{ width: `${Math.min((selectedValue.length / maxLength) * 100, 100)}%` }}
          />
        </div>
      </div>
      
      {selectedValue && selectedValue.length >= 5 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-green-800 text-sm">
              Answer ready ({selectedValue.length} characters)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptiveQuestion;