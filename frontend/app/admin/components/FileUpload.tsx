"use client";
import React, { useState, useRef } from "react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, loading }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    onFileUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 text-gray-900">
      {/* Drag and Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragOver && !loading
            ? "border-purple-500 bg-purple-50"
            : loading
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
        } ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={loading ? undefined : handleDragOver}
        onDragLeave={loading ? undefined : handleDragLeave}
        onDrop={loading ? undefined : handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={loading}
        />

        <div className="space-y-4">
          <div
            className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full transition-colors ${
              loading ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            ) : (
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          <div>
            <p
              className={`text-lg font-medium transition-colors ${
                loading ? "text-gray-400" : "text-gray-700"
              }`}
            >
              {loading ? "Uploading..." : "Drop your file here, or"}
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={loading}
              className={`mt-2 px-4 py-2 rounded-lg transition-all ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {loading ? "Processing..." : "Browse Files"}
            </button>
          </div>

          <div
            className={`text-sm transition-colors ${
              loading ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <p>Supported formats: PDF, DOC, DOCX</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>

        {loading && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1 text-center">
              Uploading file...
            </p>
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Upload Guidelines:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload research papers, articles, or educational documents</li>
          <li>
            • Clear and well-structured content works best for quiz generation
          </li>
          <li>
            • Ensure the document contains substantive content for meaningful
            questions
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
