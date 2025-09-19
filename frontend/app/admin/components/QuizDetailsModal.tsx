"use client";
import React from "react";

interface Quiz {
  id: number;
  quizCode: string;
  fileId: string;
  question: string;
  sequenceNumber: number;
  type: string;
  options: string[] | null;
  scaleMin: number | null;
  scaleMax: number | null;
  scaleLabels: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

interface QuizOverview {
  quizCode: string;
  fileId: string;
  questions: Quiz[];
  completedUsers: string[];
}

interface QuizDetailsModalProps {
  quiz: QuizOverview;
  onClose: () => void;
}

const QuizDetailsModal: React.FC<QuizDetailsModalProps> = ({
  quiz,
  onClose,
}) => {
  const getQuestionTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case "mcq":
        return (
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-orange-600 font-semibold">MC</span>
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
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-600 font-semibold">D</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case "mcq":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Descriptive
          </span>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quiz Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">{quiz.quizCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quiz Info */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Quiz Code
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono text-gray-900">
                  {quiz.quizCode}
                </span>
                <button
                  onClick={() => copyToClipboard(quiz.quizCode)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy quiz code"
                >
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                File ID
              </h3>
              <span className="text-lg text-gray-900">{quiz.fileId}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Responses
              </h3>
              <span className="text-lg text-gray-900">
                {quiz.completedUsers.length}
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Questions ({quiz.questions.length})
            </h3>
            <div className="space-y-4">
              {quiz.questions
                .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                .map((question) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getQuestionTypeIcon(question.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Question {question.sequenceNumber}
                          </span>
                          {getQuestionTypeBadge(question.type)}
                        </div>
                        <p className="text-gray-700 mb-3">
                          {question.question}
                        </p>

                        {/* Question Details */}
                        {question.type.toLowerCase() === "mcq" &&
                          question.options && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 mb-2">
                                Options:
                              </h4>
                              <div className="space-y-1">
                                {question.options.map((option, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <span className="text-xs text-gray-500 w-4">
                                      {String.fromCharCode(65 + index)}.
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {option}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {question.type.toLowerCase() === "scale" &&
                          question.scaleLabels && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 mb-2">
                                Scale ({question.scaleMin} - {question.scaleMax}
                                ):
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(question.scaleLabels).map(
                                  ([value, label]) => (
                                    <div
                                      key={value}
                                      className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
                                    >
                                      <span className="text-sm font-medium text-purple-600">
                                        {value}:
                                      </span>
                                      <span className="text-sm text-gray-700">
                                        {label}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {question.type.toLowerCase() === "descriptive" && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-600">
                              Response Type:
                            </h4>
                            <span className="text-sm text-gray-500">
                              Open-ended text response
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Completed Users */}
          {quiz.completedUsers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Completed Users ({quiz.completedUsers.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {quiz.completedUsers.map((userId) => (
                  <div
                    key={userId}
                    className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-600">
                        {userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 truncate">
                      {userId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsModal;
