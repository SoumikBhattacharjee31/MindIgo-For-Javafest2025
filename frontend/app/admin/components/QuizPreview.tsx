"use client";
import React, { useState } from "react";

interface Quiz {
  question: string;
  type: "mcq" | "scale" | "descriptive";
  options?: string[] | null;
  scale_min?: number | null;
  scale_max?: number | null;
  scale_labels?: Record<string, string> | null;
}

interface QuizData {
  file_id: number;
  quizzes: Quiz[];
}

interface QuizPreviewProps {
  quiz: QuizData;
  onSaveQuiz?: (selectedQuestions: Quiz[], fileId: number) => void;
  loading?: boolean;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({
  quiz,
  onSaveQuiz,
  loading = false,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showAll, setShowAll] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(quiz.quizzes.map((_, index) => index)));
    }
    setSelectAll(!selectAll);
  };

  const toggleQuestionSelection = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
    setSelectAll(newSelected.size === quiz.quizzes.length);
  };

  const handleSaveQuiz = () => {
    if (selectedQuestions.size === 0) {
      alert("Please select at least one question to save");
      return;
    }

    const selectedQuizzes = Array.from(selectedQuestions)
      .map((index) => quiz.quizzes[index])
      .filter((q) => q !== undefined);

    if (onSaveQuiz) {
      onSaveQuiz(selectedQuizzes, quiz.file_id);
    }
  };

  const toggleShowAll = () => {
    if (showAll) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(quiz.quizzes.map((_, index) => index)));
    }
    setShowAll(!showAll);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "mcq":
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-600 font-semibold">MC</span>
          </div>
        );
      case "scale":
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-green-600 font-semibold">S</span>
          </div>
        );
      case "descriptive":
        return (
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-orange-600 font-semibold">D</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case "mcq":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Multiple Choice
          </span>
        );
      case "scale":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Rating Scale
          </span>
        );
      case "descriptive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Descriptive
          </span>
        );
      default:
        return null;
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(quiz, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `quiz_${new Date().getTime()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quiz Preview ({quiz.quizzes.length} questions)
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Question types:</span>
              <div className="flex space-x-2">
                {Array.from(new Set(quiz.quizzes.map((q) => q.type))).map(
                  (type) => (
                    <span key={type}>{getQuestionTypeBadge(type)}</span>
                  )
                )}
              </div>
            </div>
            {selectedQuestions.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-purple-600 font-medium">
                  {selectedQuestions.size} selected
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleShowAll}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {showAll ? "Collapse All" : "Expand All"}
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      {onSaveQuiz && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h4 className="text-sm font-medium text-purple-800">
                Select Questions to Save
              </h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-purple-700">Select All</span>
              </label>
            </div>
            <button
              onClick={handleSaveQuiz}
              disabled={selectedQuestions.size === 0 || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Save Selected Quiz ({selectedQuestions.size})</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            Select the questions you want to include in the final quiz, then
            click save to create it.
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {quiz.quizzes.map((question, index) => (
          <div
            key={index}
            className={`border rounded-lg bg-white transition-colors ${
              selectedQuestions.has(index)
                ? "border-purple-300 bg-purple-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start p-4">
              {/* Selection Checkbox */}
              {onSaveQuiz && (
                <div className="flex-shrink-0 mr-3 mt-1">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(index)}
                    onChange={() => toggleQuestionSelection(index)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Question Content */}
              <div
                className="flex items-start justify-between flex-1 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleQuestion(index)}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getQuestionTypeIcon(question.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Question {index + 1}
                      </span>
                      {getQuestionTypeBadge(question.type)}
                      {selectedQuestions.has(index) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {question.question}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedQuestions.has(index) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Question Details */}
            {expandedQuestions.has(index) && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-4">
                  {question.type === "mcq" && question.options && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Options:
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === "scale" && question.scale_labels && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Rating Scale ({question.scale_min} -{" "}
                        {question.scale_max}):
                      </h4>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        {Object.entries(question.scale_labels).map(
                          ([value, label]) => (
                            <div key={value} className="text-center">
                              <div className="w-8 h-8 bg-white border-2 border-purple-300 rounded-full flex items-center justify-center mb-2">
                                <span className="text-sm font-medium text-purple-600">
                                  {value}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600 max-w-20 block">
                                {label}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {question.type === "descriptive" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Response Type:
                      </h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            Open-ended text response
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quiz Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {quiz.quizzes.length}
            </div>
            <div className="text-xs text-gray-500">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {quiz.quizzes.filter((q) => q.type === "mcq").length}
            </div>
            <div className="text-xs text-gray-500">Multiple Choice</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {quiz.quizzes.filter((q) => q.type === "scale").length}
            </div>
            <div className="text-xs text-gray-500">Rating Scale</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {quiz.quizzes.filter((q) => q.type === "descriptive").length}
            </div>
            <div className="text-xs text-gray-500">Descriptive</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
