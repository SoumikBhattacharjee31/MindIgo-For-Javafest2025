"use client";
import React, { useState } from "react";

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

interface QuizCardProps {
  quiz: QuizOverview;
  onViewDetails: () => void;
  onViewUserAnswers: (userId: string, quizCode: string) => void;
  loading: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onViewDetails,
  onViewUserAnswers,
  loading,
}) => {
  const [expandedUsers, setExpandedUsers] = useState(false);

  const getQuestionTypeStats = () => {
    const stats = { scale: 0, mcq: 0, descriptive: 0 };
    quiz.questions.forEach((q) => {
      const type = q.type.toLowerCase();
      if (type === "scale") stats.scale++;
      else if (type === "mcq") stats.mcq++;
      else if (type === "descriptive") stats.descriptive++;
    });
    return stats;
  };

  const stats = getQuestionTypeStats();
  const hasResponses = quiz.completedUsers.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {quiz.quizCode}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  hasResponses
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {hasResponses ? "Active" : "No Responses"}
              </span>
            </div>
            <p className="text-sm text-gray-600">File ID: {quiz.fileId}</p>
            <p className="text-sm text-gray-500">
              Created:{" "}
              {new Date(quiz.questions[0]?.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onViewDetails}
            disabled={loading}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
          >
            View Details
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {quiz.questions.length}
            </p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.scale}</p>
            <p className="text-xs text-gray-500">Scale</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.mcq}</p>
            <p className="text-xs text-gray-500">MCQ</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {quiz.completedUsers.length}
            </p>
            <p className="text-xs text-gray-500">Responses</p>
          </div>
        </div>

        {/* Question Types */}
        <div className="flex flex-wrap gap-2 mb-4">
          {stats.scale > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {stats.scale} Scale
            </span>
          )}
          {stats.mcq > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {stats.mcq} MCQ
            </span>
          )}
          {stats.descriptive > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {stats.descriptive} Descriptive
            </span>
          )}
        </div>

        {/* Completed Users */}
        {hasResponses && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Completed by {quiz.completedUsers.length} user
                {quiz.completedUsers.length !== 1 ? "s" : ""}
              </h4>
              <button
                onClick={() => setExpandedUsers(!expandedUsers)}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                {expandedUsers ? "Hide" : "Show"} Users
              </button>
            </div>

            {expandedUsers && (
              <div className="space-y-2">
                {quiz.completedUsers.slice(0, 5).map((userId) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">
                          {userId.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">{userId}</span>
                    </div>
                    <button
                      onClick={() => onViewUserAnswers(userId, quiz.quizCode)}
                      disabled={loading}
                      className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      View Answers
                    </button>
                  </div>
                ))}
                {quiz.completedUsers.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    and {quiz.completedUsers.length - 5} more users...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasResponses && (
          <div className="border-t pt-4">
            <div className="text-center text-gray-500">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-3m-13 0h3m-3 0l3-3m0 0l3 3M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"
                />
              </svg>
              <p className="text-sm">No responses yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
