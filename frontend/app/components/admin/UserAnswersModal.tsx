'use client';
import React, { useState } from 'react';

interface UserQuizReport {
  file_id: string;
  quizzes: Array<{
    question: string;
    type: string;
    options: string[] | null;
    scale_min: number | null;
    scale_max: number | null;
    scale_labels: Record<string, string> | null;
  }>;
  answers: string[];
}

interface UserAnswersModalProps {
  userId: string;
  report: UserQuizReport;
  onClose: () => void;
  onUpdateAnalysisLink: (userId: string, quizCode: string, analysisReportLink: string) => void;
  loading: boolean;
}

const UserAnswersModal: React.FC<UserAnswersModalProps> = ({
  userId,
  report,
  onClose,
  onUpdateAnalysisLink,
  loading
}) => {
  const [analysisLink, setAnalysisLink] = useState('');
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);

  const getQuestionTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'mcq':
        return (
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-orange-600 font-semibold">MC</span>
          </div>
        );
      case 'scale':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-green-600 font-semibold">S</span>
          </div>
        );
      case 'descriptive':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-600 font-semibold">D</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAnswer = (question: UserQuizReport['quizzes'][0], answer: string, index: number) => {
    const lowerType = question.type.toLowerCase();

    if (lowerType === 'mcq' && question.options) {
      const selectedOption = answer;
      const selectedOptionIndex = question.options.indexOf(selectedOption);
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-orange-700">Selected:</span>
            <span className="text-sm text-orange-800">
              {String.fromCharCode(65 + selectedOptionIndex)}. {selectedOption}
            </span>
          </div>
        </div>
      );
    }

    if (lowerType === 'scale' && question.scale_labels) {
      const scaleLabel = question.scale_labels[answer] || 'Unknown';
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-700">Rating:</span>
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {answer}
                </div>
                <span className="text-sm text-green-800">({scaleLabel})</span>
              </div>
            </div>
            <div className="text-xs text-green-600">
              Scale: {question.scale_min} - {question.scale_max}
            </div>
          </div>
        </div>
      );
    }

    if (lowerType === 'descriptive') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-900">
            <span className="font-medium text-blue-700 block mb-2">Response:</span>
            <div className="bg-white p-2 rounded border">
              {answer || <span className="text-gray-500 italic">No response provided</span>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <span className="text-sm text-gray-700">{answer}</span>
      </div>
    );
  };

  const handleSubmitAnalysisLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (analysisLink.trim()) {
      // We need the quiz code, which we can derive from the context
      // For now, we'll need to pass it as a prop or derive it somehow
      onUpdateAnalysisLink(userId, '', analysisLink.trim());
      setAnalysisLink('');
      setShowAnalysisForm(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      userId,
      fileId: report.file_id,
      completedAt: new Date().toISOString(),
      questionsAndAnswers: report.quizzes.map((q, index) => ({
        question: q.question,
        type: q.type,
        answer: report.answers[index],
        ...(q.type.toLowerCase() === 'scale' && q.scale_labels && {
          scaleLabel: q.scale_labels[report.answers[index]]
        })
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `quiz_report_${userId}_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Quiz Report</h2>
            <p className="text-sm text-gray-600 mt-1">User ID: {userId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Report Info */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">File ID</h3>
                <span className="text-gray-900">{report.file_id}</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Questions</h3>
                <span className="text-gray-900">{report.quizzes.length}</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Completion</h3>
                <span className="text-green-600 font-medium">100%</span>
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Questions & Answers</h3>
            {report.quizzes.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 mt-1">
                    {getQuestionTypeIcon(question.type)}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Question {index + 1}
                      </span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        question.type.toLowerCase() === 'mcq'
                          ? 'bg-orange-100 text-orange-800'
                          : question.type.toLowerCase() === 'scale'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {question.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{question.question}</p>
                    
                    {/* Show options for MCQ */}
                    {question.type.toLowerCase() === 'mcq' && question.options && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Available Options:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show scale info */}
                    {question.type.toLowerCase() === 'scale' && question.scale_labels && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Scale Labels:</h4>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {Object.entries(question.scale_labels).map(([value, label]) => (
                            <span key={value} className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                              {value}: {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Answer */}
                <div className="ml-9">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">User Answer:</h4>
                  {renderAnswer(question, report.answers[index], index)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {!showAnalysisForm ? (
              <button
                onClick={() => setShowAnalysisForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Add Analysis Link</span>
              </button>
            ) : (
              <form onSubmit={handleSubmitAnalysisLink} className="flex items-center space-x-2">
                <input
                  type="url"
                  value={analysisLink}
                  onChange={(e) => setAnalysisLink(e.target.value)}
                  placeholder="Enter analysis report URL..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnalysisForm(false);
                    setAnalysisLink('');
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
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

export default UserAnswersModal;