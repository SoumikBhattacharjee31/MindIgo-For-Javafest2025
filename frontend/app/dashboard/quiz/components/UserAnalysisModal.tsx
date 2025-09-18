'use client';
import React, { useState, useEffect } from 'react';
import { quizApi } from '../api/quizApi';
import { errorToast, successToast } from '../../../../util/toastHelper';

interface MoodAnalysisData {
  success: boolean;
  message: string;
  data: {
    file_id: number;
    mood_analysis: {
      overall_mood_state: string;
      mood_indicators: Array<{
        dimension: string;
        level: string;
        confidence: number;
        description: string;
        contributing_factors: string[];
      }>;
      dominant_emotions: string[];
      mood_stability: string;
      risk_level: string;
      recommendations: string[];
      professional_help_suggested: boolean;
      detailed_interpretation: string;
    };
    total_questions: number;
    assessment_reliability: string;
  };
  errorCode: null;
}

interface UserAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizCode: string;
  quizName?: string;
}

const UserAnalysisModal: React.FC<UserAnalysisModalProps> = ({
  isOpen,
  onClose,
  quizCode,
  quizName
}) => {
  const [analysisData, setAnalysisData] = useState<MoodAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quizCode) {
      fetchAnalysisData();
    }
  }, [isOpen, quizCode]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get the analysis link
      const analysisUrl = await quizApi.getAnalysisLink(quizCode);
      
      if (!analysisUrl) {
        setError('No analysis report available for this quiz yet.');
        return;
      }

      // Then fetch the analysis report from the URL
      const reportData = await quizApi.getAnalysisReport(analysisUrl);
      setAnalysisData(reportData);
      successToast('Analysis report loaded successfully!');
    } catch (err) {
      console.error('Error fetching analysis:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analysis report';
      setError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-200 text-red-800';
      case 'moderate':
        return 'bg-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getIndicatorLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Mental Health Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">
              {quizName ? `Results for ${quizName}` : `Quiz: ${quizCode}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading your analysis report...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Analysis</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchAnalysisData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {analysisData && (
            <div className="space-y-6">
              {/* Overall Mood State */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Overall Assessment
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {analysisData.data.mood_analysis.overall_mood_state}
                </p>
              </div>

              {/* Risk Level and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`border rounded-lg p-4 ${getRiskLevelColor(analysisData.data.mood_analysis.risk_level)}`}>
                  <div className="text-center">
                    <h4 className="font-semibold mb-2">Risk Level</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(analysisData.data.mood_analysis.risk_level)}`}>
                      {analysisData.data.mood_analysis.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-700 mb-2">Mood Stability</h4>
                    <span className="text-gray-800 capitalize font-medium">
                      {analysisData.data.mood_analysis.mood_stability}
                    </span>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-purple-700 mb-2">Professional Help</h4>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      analysisData.data.mood_analysis.professional_help_suggested 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {analysisData.data.mood_analysis.professional_help_suggested ? 'Recommended' : 'Not Required'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dominant Emotions */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Current Emotional State</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData.data.mood_analysis.dominant_emotions.map((emotion, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mood Indicators */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Detailed Analysis
                </h3>
                <div className="space-y-4">
                  {analysisData.data.mood_analysis.mood_indicators.map((indicator, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{indicator.dimension}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIndicatorLevelColor(indicator.level)}`}>
                            {indicator.level.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {Math.round(indicator.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">{indicator.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Factors:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {indicator.contributing_factors.map((factor, factorIndex) => (
                            <li key={factorIndex}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {analysisData.data.mood_analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-800 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-green-800 leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    <strong>Assessment Reliability:</strong> {analysisData.data.assessment_reliability}
                  </span>
                  <span>
                    <strong>Questions Analyzed:</strong> {analysisData.data.total_questions}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            This analysis is based on your quiz responses and is for informational purposes only.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAnalysisModal;