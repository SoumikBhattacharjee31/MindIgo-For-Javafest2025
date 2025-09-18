'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { successToast, errorToast, infoToast } from '../../../util/toastHelper';
import QuizCard from '../../components/admin/QuizCard';
import QuizDetailsModal from '../../components/admin/QuizDetailsModal';
import UserAnswersModal from '../../components/admin/UserAnswersModal';

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

const QuizOverview = () => {
  const [quizzes, setQuizzes] = useState<QuizOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizOverview | null>(null);
  const [selectedUserReport, setSelectedUserReport] = useState<{
    userId: string;
    quizCode: string;
    report: UserQuizReport;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'completed' | 'empty'>('all');

  useEffect(() => {
    fetchQuizzesOverview();
  }, []);

  const fetchQuizzesOverview = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/v1/content/quiz/quizzes-overview', {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        errorToast(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes overview:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorToast('Unauthorized access');
        } else if (error.response?.status === 403) {
          errorToast('Access denied');
        } else {
          errorToast(error.response?.data?.message || 'Failed to fetch quizzes');
        }
      } else {
        errorToast('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserAnswers = async (userId: string, quizCode: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/content/quiz/user/${userId}/quiz/${quizCode}/answers`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSelectedUserReport({
          userId,
          quizCode,
          report: response.data.data
        });
      } else {
        errorToast(response.data.message || 'Failed to fetch user answers');
      }
    } catch (error) {
      console.error('Error fetching user answers:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorToast('Quiz incomplete or invalid request');
        } else if (error.response?.status === 404) {
          errorToast('Quiz not found');
        } else {
          errorToast(error.response?.data?.message || 'Failed to fetch user answers');
        }
      } else {
        errorToast('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnalysisLink = async (userId: string, quizCode: string, analysisReportLink: string) => {
    setLoading(true);
    // infoToast(`Updating analysis link for ${userId} - ${quizCode} - ${analysisReportLink}`);
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/content/quiz/update-analysis-link',
        {
          targetUserId: userId,
          quizCode,
          analysisReportLink
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        successToast('Analysis link updated successfully');
        // Refresh the data if needed
        await fetchQuizzesOverview();
      } else {
        errorToast(response.data.message || 'Failed to update analysis link');
      }
    } catch (error) {
      console.error('Error updating analysis link:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorToast('Invalid request or quiz not completed');
        } else if (error.response?.status === 404) {
          errorToast('Quiz not completed for the specified user');
        } else {
          errorToast(error.response?.data?.message || 'Failed to update analysis link');
        }
      } else {
        errorToast('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.quizCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.fileId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'completed' && quiz.completedUsers.length > 0) ||
                         (filterBy === 'empty' && quiz.completedUsers.length === 0);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quiz Overview</h1>
          <p className="text-gray-600 mt-1">Manage existing quizzes and view user responses</p>
        </div>
        <button
          onClick={fetchQuizzesOverview}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-purple-400"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Quizzes</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by quiz code or file ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'completed' | 'empty')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Quizzes</option>
              <option value="completed">Has Responses</option>
              <option value="empty">No Responses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-semibold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Responses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quizzes.filter(q => q.completedUsers.length > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quizzes.reduce((total, quiz) => total + quiz.completedUsers.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Loading quizzes...</span>
            </div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-500">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create your first quiz to get started'}
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.quizCode}
              quiz={quiz}
              onViewDetails={() => setSelectedQuiz(quiz)}
              onViewUserAnswers={handleViewUserAnswers}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {selectedQuiz && (
        <QuizDetailsModal
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
        />
      )}

      {selectedUserReport && (
        <UserAnswersModal
          userId={selectedUserReport.userId}
          report={selectedUserReport.report}
          onClose={() => setSelectedUserReport(null)}
          onUpdateAnalysisLink={handleUpdateAnalysisLink}
          loading={loading}
          quizCode={selectedUserReport.quizCode}
        />
      )}
    </div>
  );
};

export default QuizOverview;