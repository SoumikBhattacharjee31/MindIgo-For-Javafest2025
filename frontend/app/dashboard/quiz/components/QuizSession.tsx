import React, { useState, useEffect } from "react";
import {
  quizApi,
  QuizSessionResponse,
  validateAnswer,
  isSessionCompleted,
  isSessionInProgress,
  formatProgressPercentage,
  estimateTimeRemaining,
} from "@/app/dashboard/quiz/api/quizApi";
import {
  successToast,
  errorToast,
  warningToast,
  infoToast,
} from "@/util/toastHelper";
import ScaleQuestion from "./ScaleQuestion";
import McqQuestion from "./McqQuestion";
import DescriptiveQuestion from "./DescriptiveQuestion";

interface QuizSessionProps {
  quizCode?: string;
  sessionId?: number | null;
  onComplete: () => void;
  onExit: () => void;
}

const QuizSession: React.FC<QuizSessionProps> = ({
  quizCode,
  sessionId,
  onComplete,
  onExit,
}) => {
  const [session, setSession] = useState<QuizSessionResponse | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timeStarted, setTimeStarted] = useState<Date>(new Date());

  useEffect(() => {
    initializeSession();
  }, [quizCode, sessionId]);

  useEffect(() => {
    // Reset answer when question changes
    setCurrentAnswer("");
  }, [session?.currentQuestion?.id]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      let sessionData: QuizSessionResponse;

      if (sessionId) {
        // Continue existing session by sessionId
        sessionData = await quizApi.getSessionStatus(sessionId);
        infoToast("Resuming quiz session...");
      } else if (quizCode) {
        // Start new session by quizCode
        sessionData = await quizApi.startQuiz({ quizCode });
      } else {
        throw new Error("Either quizCode or sessionId must be provided");
      }

      setSession(sessionData);
      setTimeStarted(new Date());

      if (isSessionCompleted(sessionData)) {
        infoToast("Quiz already completed!");
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else if (sessionId && isSessionInProgress(sessionData)) {
        successToast(
          `Resumed quiz: ${sessionData.currentQuestionSequence}/${sessionData.totalQuestions} questions completed`
        );
      }
    } catch (error) {
      console.error("Failed to initialize quiz session:", error);
      errorToast(
        error instanceof Error ? error.message : "Failed to start quiz"
      );
      onExit();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!session || !session.currentQuestion) {
      errorToast("No active question found");
      return;
    }

    // Validate answer
    const validationErrors = validateAnswer(
      session.currentQuestion,
      currentAnswer
    );
    if (validationErrors.length > 0) {
      errorToast(validationErrors[0]);
      return;
    }

    try {
      setSubmitting(true);
      const updatedSession = await quizApi.submitAnswer({
        sessionId: session.sessionId,
        quizId: session.currentQuestion.id,
        answer: currentAnswer.trim(),
      });

      setSession(updatedSession);
      successToast(updatedSession.message || "Answer submitted successfully!");

      // Check if quiz is completed
      if (isSessionCompleted(updatedSession)) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      errorToast(
        error instanceof Error ? error.message : "Failed to submit answer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    onExit();
  };

  const cancelExit = () => {
    setShowExitDialog(false);
  };

  const renderQuestion = () => {
    if (!session?.currentQuestion) return null;

    const question = session.currentQuestion;
    const commonProps = {
      quiz: question,
      selectedValue: currentAnswer,
      onAnswerChange: setCurrentAnswer,
      disabled: submitting,
    };

    switch (question.type) {
      case "SCALE":
        return <ScaleQuestion {...commonProps} />;
      case "MCQ":
        return <McqQuestion {...commonProps} />;
      case "DESCRIPTIVE":
        return <DescriptiveQuestion {...commonProps} />;
      default:
        return (
          <div className="text-red-500 bg-red-50 p-4 rounded-lg">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-yellow-500";
    if (percentage < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const canSubmit = () => {
    if (!session?.currentQuestion || submitting) return false;

    const validationErrors = validateAnswer(
      session.currentQuestion,
      currentAnswer
    );
    return validationErrors.length === 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Session not found</p>
          <button
            onClick={onExit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  if (isSessionCompleted(session)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Quiz Completed!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for taking the time to complete this mental health
              assessment.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-800">
                <p>
                  <span className="font-medium">Total Questions:</span>{" "}
                  {session.totalQuestions}
                </p>
                <p>
                  <span className="font-medium">Completed:</span>{" "}
                  {formatDate(session.completedAt!)}
                </p>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Quiz List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = session.progressPercentage;
  const estimatedTime = estimateTimeRemaining(session);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mindigo Quiz</h1>
              <p className="text-gray-600">Code: {session.quizCode}</p>
            </div>
            <button
              onClick={handleExit}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Exit Quiz</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {session.currentQuestionSequence} of{" "}
                {session.totalQuestions}
              </span>
              <span className="text-sm text-gray-500">
                Est. time remaining: {estimatedTime}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                  progressPercentage
                )}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium">
                {formatProgressPercentage(progressPercentage)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                Question {session.currentQuestionSequence}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {session.currentQuestion?.type.toLowerCase()} Question
              </span>
            </div>
          </div>

          {renderQuestion()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {session.currentQuestionSequence === session.totalQuestions
              ? "This is the last question"
              : `${
                  session.totalQuestions - session.currentQuestionSequence
                } questions remaining`}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleExit}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Save & Exit
            </button>
            <button
              onClick={handleAnswerSubmit}
              disabled={!canSubmit()}
              className={`
                px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                ${
                  canSubmit()
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : session.currentQuestionSequence === session.totalQuestions ? (
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
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Complete Quiz</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Exit Confirmation Dialog */}
        {showExitDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Exit Quiz
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to exit? Your progress has been saved and
                you can resume this quiz later.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Exit Quiz
                </button>
                <button
                  onClick={cancelExit}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Continue Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default QuizSession;
