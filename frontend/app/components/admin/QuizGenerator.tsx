'use client';
import React, { useState } from 'react';

interface QuizGeneratorProps {
  selectedFile: string;
  onGenerateQuiz: (params: {
    file_url: string;
    num_questions: number;
    question_types: string[];
    assessment_areas: string[];
    difficulty: string;
  }) => void;
  loading: boolean;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  selectedFile,
  onGenerateQuiz,
  loading
}) => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['mcq', 'scale']);
  const [assessmentAreas, setAssessmentAreas] = useState<string[]>(['mood', 'wellbeing']);
  const [difficulty, setDifficulty] = useState('medium');

  const questionTypeOptions = [
    { value: 'mcq', label: 'Multiple Choice Questions' },
    { value: 'scale', label: 'Rating Scale Questions' },
    { value: 'descriptive', label: 'Descriptive Questions' }
  ];

  const assessmentAreaOptions = [
    { value: 'mood', label: 'Mood Assessment' },
    { value: 'anxiety', label: 'Anxiety Levels' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'wellbeing', label: 'General Wellbeing' },
    { value: 'social_functioning', label: 'Social Functioning' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', description: 'Basic understanding required' },
    { value: 'medium', label: 'Medium', description: 'Moderate analysis needed' },
    { value: 'hard', label: 'Hard', description: 'Deep comprehension required' }
  ];

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setQuestionTypes([...questionTypes, type]);
    } else {
      setQuestionTypes(questionTypes.filter(t => t !== type));
    }
  };

  const handleAssessmentAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setAssessmentAreas([...assessmentAreas, area]);
    } else {
      setAssessmentAreas(assessmentAreas.filter(a => a !== area));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questionTypes.length === 0) {
      alert('Please select at least one question type');
      return;
    }
    
    if (assessmentAreas.length === 0) {
      alert('Please select at least one assessment area');
      return;
    }

    onGenerateQuiz({
      file_url: selectedFile,
      num_questions: numQuestions,
      question_types: questionTypes,
      assessment_areas: assessmentAreas,
      difficulty: difficulty
    });
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const cleaned = filename.replace(/_[a-f0-9-]{36}\.pdf$/, '.pdf');
    return cleaned.length > 30 ? cleaned.substring(0, 27) + '...' : cleaned;
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity ${loading ? 'opacity-75' : ''}`}>
      {/* Selected File Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Selected File</p>
            <p className="text-xs text-gray-600">{getFileName(selectedFile)}</p>
          </div>
        </div>
      </div>

      {/* Number of Questions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Questions
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="5"
            max="25"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            disabled={loading}
            className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-opacity ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <div className={`flex items-center justify-center w-16 h-10 rounded-lg font-semibold transition-colors ${
            loading 
              ? 'bg-gray-200 text-gray-500' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {numQuestions}
          </div>
        </div>
        <p className={`text-xs mt-1 transition-colors ${
          loading ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Choose between 5-25 questions for your quiz
        </p>
      </div>

      {/* Question Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Question Types
        </label>
        <div className="grid grid-cols-1 gap-3">
          {questionTypeOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 p-3 border border-gray-200 rounded-lg transition-all ${
                loading 
                  ? 'cursor-not-allowed bg-gray-50 opacity-50' 
                  : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={questionTypes.includes(option.value)}
                onChange={(e) => handleQuestionTypeChange(option.value, e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
              />
              <div>
                <p className={`text-sm font-medium transition-colors ${
                  loading ? 'text-gray-500' : 'text-gray-900'
                }`}>{option.label}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Assessment Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Assessment Areas
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assessmentAreaOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 p-3 border border-gray-200 rounded-lg transition-all ${
                loading 
                  ? 'cursor-not-allowed bg-gray-50 opacity-50' 
                  : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={assessmentAreas.includes(option.value)}
                onChange={(e) => handleAssessmentAreaChange(option.value, e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
              />
              <div>
                <p className={`text-sm font-medium transition-colors ${
                  loading ? 'text-gray-500' : 'text-gray-900'
                }`}>{option.label}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Difficulty Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {difficultyOptions.map((option) => (
            <div
              key={option.value}
              className={`flex flex-col p-4 border rounded-lg transition-all ${
                loading
                  ? 'cursor-not-allowed opacity-50 bg-gray-50'
                  : difficulty === option.value
                  ? 'border-purple-500 bg-purple-50 cursor-pointer'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 cursor-pointer'
              }`}
              onClick={loading ? undefined : () => setDifficulty(option.value)}
            >
              <input
                type="radio"
                name="difficulty"
                value={option.value}
                checked={difficulty === option.value}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={loading}
                className="sr-only"
                readOnly
              />
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium transition-colors ${
                  loading ? 'text-gray-500' : 'text-gray-900'
                }`}>{option.label}</span>
                {difficulty === option.value && !loading && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                )}
              </div>
              <p className={`text-xs transition-colors ${
                loading ? 'text-gray-400' : 'text-gray-600'
              }`}>{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || questionTypes.length === 0 || assessmentAreas.length === 0}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Quiz...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Generate AI Quiz</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          This may take a few moments to process your document and generate questions
        </p>
      </div>
    </form>
  );
};

export default QuizGenerator;