import React, { useState, useEffect } from 'react';
import { quizApi, UserQuizSession } from '../api/quizApi';
import { successToast, errorToast, infoToast, warningToast } from '../../../../util/toastHelper';
import UserAnalysisModal from './UserAnalysisModal';

interface QuizListProps {
  onQuizStart: (quizCode: string) => void;
  onSessionContinue: (sessionId: number) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onQuizStart, onSessionContinue }) => {
  const [availableQuizzes, setAvailableQuizzes] = useState<string[]>([]);
  const [userSessions, setUserSessions] = useState<UserQuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    quizCode: string;
  }>({ isOpen: false, quizCode: '' });
  const [continueDialog, setContinueDialog] = useState<{
    isOpen: boolean;
    session: UserQuizSession | null;
  }>({ isOpen: false, session: null });
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [analysisModal, setAnalysisModal] = useState<{
    isOpen: boolean;
    quizCode: string;
    quizName: string;
  }>({ isOpen: false, quizCode: '', quizName: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzes, sessions] = await Promise.all([
        quizApi.getAvailableQuizzes(),
        quizApi.getUserSessions()
      ]);
      setAvailableQuizzes(quizzes);
      setUserSessions(sessions);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quizCode: string) => {
    setConfirmDialog({ isOpen: true, quizCode });
  };

  const handleConfirmStart = async () => {
    if (!confirmDialog.quizCode) return;

    try {
      setStartingQuiz(true);
      const session = await quizApi.startQuiz({ quizCode: confirmDialog.quizCode });
      
      if (session.status === 'COMPLETED') {
        infoToast('This quiz has already been completed.');
      } else {
        successToast(session.status === 'IN_PROGRESS' ? 'Quiz session resumed!' : 'Quiz started successfully!');
      }
      
      setConfirmDialog({ isOpen: false, quizCode: '' });
      onQuizStart(confirmDialog.quizCode);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to start quiz');
    } finally {
      setStartingQuiz(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ isOpen: false, quizCode: '' });
  };

  const handleContinueSession = async (sessionId: number) => {
    try {
      successToast('Continuing quiz session...');
      onSessionContinue(sessionId);
    } catch (error) {
      console.error('Failed to continue session:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to continue session');
    }
  };

  const handleSessionClick = (session: UserQuizSession) => {
    if (session.status === 'COMPLETED') {
      // Show analysis modal for completed quizzes
      setAnalysisModal({
        isOpen: true,
        quizCode: session.quizCode,
        quizName: `Quiz #${userSessions.findIndex(s => s.id === session.id) + 1}`
      });
      return;
    }
    if (session.status === 'ABANDONED') {
      warningToast('This quiz session was abandoned and cannot be continued.');
      return;
    }
    setContinueDialog({ isOpen: true, session });
  };

  const handleConfirmContinue = async () => {
    if (!continueDialog.session) return;

    try {
      setStartingQuiz(true);
      await handleContinueSession(continueDialog.session.id);
      setContinueDialog({ isOpen: false, session: null });
    } catch (error) {
      console.error('Failed to continue session:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to continue session');
    } finally {
      setStartingQuiz(false);
    }
  };

  const handleCancelContinue = () => {
    setContinueDialog({ isOpen: false, session: null });
  };

  const getSessionStatus = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { text: 'In Progress', class: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { text: 'Completed', class: 'bg-green-100 text-green-800' };
      case 'ABANDONED':
        return { text: 'Abandoned', class: 'bg-red-100 text-red-800' };
      default:
        return { text: status, class: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mindigo Quizzes</h1>
          <p className="text-gray-600 text-lg">Take a moment to reflect on your mental well-being</p>
        </div>

        {/* Available Quizzes Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Available Quizzes
          </h2>
          
          {availableQuizzes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No New Quizzes Available</h3>
              <p className="text-gray-500">You have completed all available quizzes or there are no quizzes assigned to you at this time.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableQuizzes.map((quizCode, index) => (
                <div key={quizCode} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Quiz #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Code:</span> {quizCode}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleQuizSelect(quizCode)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Start Quiz</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Previous Sessions Section */}
        {userSessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Your Quiz History
            </h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userSessions.map((session) => {
                      const statusInfo = getSessionStatus(session.status);
                      const progressPercent = Math.round((session.currentQuestionSequence / session.totalQuestions) * 100);
                      
                      return (
                        <tr 
                          key={session.id} 
                          onClick={() => handleSessionClick(session)}
                          className={`
                            transition-all duration-200 cursor-pointer
                            ${session.status === 'IN_PROGRESS' 
                              ? 'hover:bg-blue-50 hover:shadow-sm' 
                              : session.status === 'COMPLETED'
                              ? 'hover:bg-green-50 hover:shadow-sm'
                              : 'hover:bg-gray-50 opacity-75'
                            }
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{session.quizCode}</div>
                              {session.status === 'IN_PROGRESS' && (
                                <div className="ml-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                                    Click to continue
                                  </span>
                                </div>
                              )}
                              {session.status === 'COMPLETED' && (
                                <div className="ml-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    View Analysis
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    session.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {session.currentQuestionSequence}/{session.totalQuestions}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.class}`}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(session.startedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.completedAt ? formatDate(session.completedAt) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Start Quiz</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to start the quiz with code <span className="font-medium">{confirmDialog.quizCode}</span>? 
                You can always resume it later if needed.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmStart}
                  disabled={startingQuiz}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {startingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting...
                    </>
                  ) : (
                    'Start Quiz'
                  )}
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={startingQuiz}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue Session Dialog */}
        {continueDialog.isOpen && continueDialog.session && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Continue Quiz</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Do you want to continue your quiz session for <span className="font-medium">{continueDialog.session.quizCode}</span>?
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Current Progress</span>
                    <span className="text-sm text-blue-700">
                      {continueDialog.session.currentQuestionSequence}/{continueDialog.session.totalQuestions}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${Math.round((continueDialog.session.currentQuestionSequence / continueDialog.session.totalQuestions) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Started: {formatDate(continueDialog.session.startedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmContinue}
                  disabled={startingQuiz}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {startingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Continuing...
                    </>
                  ) : (
                    'Continue Quiz'
                  )}
                </button>
                <button
                  onClick={handleCancelContinue}
                  disabled={startingQuiz}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Analysis Modal */}
        <UserAnalysisModal
          isOpen={analysisModal.isOpen}
          onClose={() => setAnalysisModal({ isOpen: false, quizCode: '', quizName: '' })}
          quizCode={analysisModal.quizCode}
          quizName={analysisModal.quizName}
        />
      </div>
    </div>
  );
};

export default QuizList;