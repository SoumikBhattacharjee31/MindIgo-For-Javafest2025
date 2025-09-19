'use client';
import React, { useState, useEffect } from 'react';
import { successToast, errorToast } from '../../../util/toastHelper';
import FileUpload from '../../components/admin/FileUpload';
import FileList from '../../components/admin/FileList';
import QuizGenerator from '../../components/admin/QuizGenerator';
import QuizPreview from '../../components/admin/QuizPreview';
import { quizApi, getQuizApiErrorMessage, type GeneratedQuizData, type QuizQuestion } from '../../api/quizApi';

interface QuizData {
  file_id: number;
  quizzes: QuizQuestion[];
}

const QuizManagement = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizData | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [savedQuiz, setSavedQuiz] = useState<{
    file_id: string;
    quizCode: string;
    totalQuestions: number;
  } | null>(null);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const filesData = await quizApi.getFilesList();
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
      errorToast(getQuizApiErrorMessage(error));
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const uploadedFileUrl = await quizApi.uploadFile(file);
      successToast('File uploaded successfully!');
      setSelectedFile(uploadedFileUrl); // Set the uploaded file URL as selected
      await fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Error uploading file:', error);
      errorToast(getQuizApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizGenerate = async (params: {
    file_url: string;
    num_questions: number;
    question_types: string[];
    assessment_areas: string[];
    difficulty: string;
  }) => {
    setLoading(true);
    try {
      const generatedData = await quizApi.generateQuiz(params);
      setGeneratedQuiz(generatedData);
      successToast('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      errorToast(getQuizApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (selectedQuestions: QuizQuestion[], fileId: number) => {
    setLoading(true);
    try {
      const saveQuizData = await quizApi.saveQuiz({
        file_id: fileId,
        quizzes: selectedQuestions
      });
      setSavedQuiz(saveQuizData);
      successToast(`Quiz saved successfully! Quiz Code: ${saveQuizData.quizCode}`);
    } catch (error) {
      console.error('Error saving quiz:', error);
      errorToast(getQuizApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
        <div className="text-sm text-gray-500">
          Upload papers and generate AI-powered quizzes
        </div>
      </div>

      {/* File Upload Section */}
      <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${
        loading ? 'opacity-50 pointer-events-none' : ''
      }`}>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Papers</h2>
        <FileUpload onFileUpload={handleFileUpload} loading={loading} />
      </div>

      {/* File List Section */}
      <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${
        loading ? 'opacity-50 pointer-events-none' : ''
      }`}>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Papers</h2>
        <FileList 
          files={files} 
          onFileSelect={setSelectedFile}
          selectedFile={selectedFile}
          onRefresh={fetchFiles}
          loading={loading}
        />
      </div>

      {/* Quiz Generation Section */}
      {selectedFile && (
        <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${
          loading ? 'opacity-50 pointer-events-none' : ''
        }`}>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Generate Quiz</h2>
          <QuizGenerator
            selectedFile={selectedFile}
            onGenerateQuiz={handleQuizGenerate}
            loading={loading}
          />
        </div>
      )}

      {/* Quiz Preview Section */}
      {generatedQuiz && (
        <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${
          loading ? 'opacity-50 pointer-events-none' : ''
        }`}>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Generated Quiz Preview</h2>
          <QuizPreview 
            quiz={generatedQuiz} 
            onSaveQuiz={handleSaveQuiz}
            loading={loading}
          />
        </div>
      )}

      {/* Saved Quiz Success Section */}
      {savedQuiz && (
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800">Quiz Saved Successfully!</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Quiz Code</h3>
              <p className="text-lg font-bold text-green-700">{savedQuiz.quizCode}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">File ID</h3>
              <p className="text-lg font-bold text-green-700">{savedQuiz.file_id}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Questions</h3>
              <p className="text-lg font-bold text-green-700">{savedQuiz.totalQuestions}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700">
              Your quiz has been created and is ready to be shared with users.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(savedQuiz.quizCode);
                  successToast('Quiz code copied to clipboard!');
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Quiz Code</span>
              </button>
              <button
                onClick={() => {
                  setGeneratedQuiz(null);
                  setSavedQuiz(null);
                }}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
              >
                Create Another Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Processing...</p>
              <p className="text-xs text-gray-500">Please wait while we handle your request</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;