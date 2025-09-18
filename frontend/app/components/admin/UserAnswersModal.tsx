'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { successToast, errorToast } from '../../../util/toastHelper';

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

interface MoodAnalysisResponse {
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

interface UserAnswersModalProps {
  userId: string;
  report: UserQuizReport;
  onClose: () => void;
  onUpdateAnalysisLink: (userId: string, quizCode: string, analysisReportLink: string) => void;
  loading: boolean;
  quizCode: string;
}

const UserAnswersModal: React.FC<UserAnswersModalProps> = ({
  userId,
  report,
  onClose,
  onUpdateAnalysisLink,
  loading,
  quizCode
}) => {
  const [analysisLink, setAnalysisLink] = useState('');
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [showAnalysisPreview, setShowAnalysisPreview] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<MoodAnalysisResponse | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadedReportUrl, setUploadedReportUrl] = useState('');
  const [showUploadPreview, setShowUploadPreview] = useState(false);

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
      onUpdateAnalysisLink(userId, quizCode, analysisLink.trim());
      setAnalysisLink('');
      setShowAnalysisForm(false);
    }
  };

  const generateMoodAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const evaluationRequest = {
        file_id: parseInt(report.file_id),
        quizzes: report.quizzes.map(quiz => ({
          question: quiz.question,
          type: quiz.type,
          options: quiz.options,
          scale_min: quiz.scale_min,
          scale_max: quiz.scale_max,
          scale_labels: quiz.scale_labels
        })),
        answers: report.answers
      };

      const response = await axios.post<MoodAnalysisResponse>(
        'http://localhost:8080/api/v1/genai/quiz/evaluate',
        evaluationRequest,
        { withCredentials: true }
      );

      if (response.data.success) {
        setAnalysisResponse(response.data);
        setShowAnalysisPreview(true);
      } else {
        errorToast('Failed to generate mood analysis');
      }
    } catch (error) {
      console.error('Error generating mood analysis:', error);
      if (axios.isAxiosError(error)) {
        errorToast(error.response?.data?.message || 'Failed to generate analysis');
      } else {
        errorToast('Network error occurred during analysis');
      }
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  const uploadAnalysisReport = async () => {
    if (!analysisResponse) return;
    
    setUploadingReport(true);
    try {
      // Create a JSON blob with the analysis
      const analysisBlob = new Blob([JSON.stringify(analysisResponse, null, 2)], {
        type: 'application/json'
      });
      
      const formData = new FormData();
      formData.append('file', analysisBlob, `mood_analysis_${userId}_${Date.now()}.json`);

      const response = await axios.post(
        'http://localhost:8080/api/v1/file/upload/reports',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        console.log('Upload response:', response.data);
        const reportUrl = response.data.data;
        console.log('Extracted URL:', reportUrl);
        if (reportUrl) {
          setUploadedReportUrl(reportUrl);
          setShowUploadPreview(true);
          successToast('Analysis report uploaded successfully!');
        } else {
          console.error('No URL found in response:', response.data);
          errorToast('Upload successful but no URL returned');
        }
      } else {
        errorToast('Failed to upload analysis report');
      }
    } catch (error) {
      console.error('Error uploading analysis report:', error);
      if (axios.isAxiosError(error)) {
        errorToast(error.response?.data?.message || 'Failed to upload report');
      } else {
        errorToast('Network error occurred during upload');
      }
    } finally {
      setUploadingReport(false);
    }
  };

  const confirmAnalysisLinkUpdate = async () => {
    console.log('confirmAnalysisLinkUpdate called', { uploadedReportUrl, userId, quizCode });
    if (uploadedReportUrl) {
      try {
        await onUpdateAnalysisLink(userId, quizCode, uploadedReportUrl);
        setShowUploadPreview(false);
        setShowAnalysisPreview(false);
        setAnalysisResponse(null);
        setUploadedReportUrl('');
        successToast('Analysis link updated successfully!');
      } catch (error) {
        console.error('Error updating analysis link:', error);
        errorToast('Failed to update analysis link');
      }
    } else {
      console.error('No uploaded report URL available');
      errorToast('No report URL available to update');
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
    <>
      {/* Analysis Preview Modal */}
      {showAnalysisPreview && analysisResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Mood Analysis Preview</h2>
                <p className="text-sm text-gray-600 mt-1">Generated analysis for User ID: {userId}</p>
              </div>
              <button
                onClick={() => setShowAnalysisPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Overall Mood State */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Overall Mood State</h3>
                  <p className="text-blue-800">{analysisResponse.data.mood_analysis.overall_mood_state}</p>
                </div>

                {/* Risk Level */}
                <div className={`border rounded-lg p-4 ${
                  analysisResponse.data.mood_analysis.risk_level === 'high' 
                    ? 'bg-red-50 border-red-200' 
                    : analysisResponse.data.mood_analysis.risk_level === 'moderate'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`text-lg font-semibold ${
                      analysisResponse.data.mood_analysis.risk_level === 'high' 
                        ? 'text-red-900' 
                        : analysisResponse.data.mood_analysis.risk_level === 'moderate'
                        ? 'text-yellow-900'
                        : 'text-green-900'
                    }`}>Risk Level</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      analysisResponse.data.mood_analysis.risk_level === 'high' 
                        ? 'bg-red-200 text-red-800' 
                        : analysisResponse.data.mood_analysis.risk_level === 'moderate'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {analysisResponse.data.mood_analysis.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <p className={analysisResponse.data.mood_analysis.risk_level === 'high' 
                    ? 'text-red-800' 
                    : analysisResponse.data.mood_analysis.risk_level === 'moderate'
                    ? 'text-yellow-800'
                    : 'text-green-800'
                  }>
                    Professional help suggested: {analysisResponse.data.mood_analysis.professional_help_suggested ? 'Yes' : 'No'}
                  </p>
                </div>

                {/* Mood Indicators */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Indicators</h3>
                  <div className="space-y-4">
                    {analysisResponse.data.mood_analysis.mood_indicators.map((indicator, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{indicator.dimension}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              indicator.level === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : indicator.level === 'moderate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : indicator.level === 'mild'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {indicator.level.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">
                              {Math.round(indicator.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{indicator.description}</p>
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Contributing Factors:</h5>
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="list-disc list-inside text-green-800 space-y-2">
                      {analysisResponse.data.mood_analysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Assessment Reliability: <strong>{analysisResponse.data.assessment_reliability}</strong>
                </span>
                <span className="text-sm text-gray-600">
                  Questions: {analysisResponse.data.total_questions}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAnalysisPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadAnalysisReport}
                  disabled={uploadingReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploadingReport ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Preview Modal */}
      {showUploadPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          {/* {console.log('Upload preview modal rendering', { showUploadPreview, uploadedReportUrl })} */}
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Confirmation</h2>
                <p className="text-sm text-gray-600 mt-1">Analysis report has been uploaded successfully</p>
              </div>
              <button
                onClick={() => setShowUploadPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">Report Uploaded Successfully</span>
                </div>
                <p className="text-green-700 text-sm">
                  The mood analysis report has been uploaded to the reports system.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Report URL:</h3>
                <div className="bg-white border rounded p-2 text-sm text-gray-800 font-mono break-all">
                  {uploadedReportUrl || 'No URL available'}
                </div>
                {uploadedReportUrl && (
                  <div className="mt-2 text-xs text-gray-500">
                    URL Length: {uploadedReportUrl.length} characters
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Next Step:</strong> Would you like to update the analysis link for this user with the uploaded report URL?
                  This will link the user's quiz responses to their detailed mood analysis report.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowUploadPreview(false);
                  setShowAnalysisPreview(false);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Skip
              </button>
              <button
                onClick={confirmAnalysisLinkUpdate}
                disabled={loading || !uploadedReportUrl}
                className={`px-4 py-2 rounded-lg transition ${
                  loading || !uploadedReportUrl 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Analysis Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
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
          <div className="flex items-center space-x-3">
            {/* Generate Analysis Button */}
            <button
              onClick={generateMoodAnalysis}
              disabled={generatingAnalysis}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {generatingAnalysis ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate Analysis</span>
                </>
              )}
            </button>

            {/* Manual Analysis Link */}
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
    </>
  );
};

export default UserAnswersModal;