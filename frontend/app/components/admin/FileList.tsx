'use client';
import React from 'react';

interface FileListProps {
  files: string[];
  onFileSelect: (file: string) => void;
  selectedFile: string;
  onRefresh: () => void;
  loading?: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onFileSelect,
  selectedFile,
  onRefresh,
  loading = false
}) => {
  const getFileName = (url: string) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    // Remove UUID and clean up filename
    const cleaned = filename.replace(/_[a-f0-9-]{36}\.pdf$/, '.pdf');
    return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
  };

  const getFileSize = () => {
    // Since we don't have file size in the API response, we'll show a placeholder
    return 'Unknown size';
  };

  const formatDate = () => {
    // Since we don't have upload date in the API response, we'll show current date as placeholder
    return new Date().toLocaleDateString();
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
        <p className="text-gray-500 mb-4">Upload your first document to get started with quiz generation.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Refresh List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {files.length} file{files.length !== 1 ? 's' : ''} available
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-lg transition-colors ${
            loading 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
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

      <div className="grid gap-3">
        {files.map((fileUrl, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-all ${
              loading 
                ? 'cursor-not-allowed opacity-50' 
                : `cursor-pointer ${
                    selectedFile === fileUrl
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`
            }`}
            onClick={loading ? undefined : () => onFileSelect(fileUrl)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getFileName(fileUrl)}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-gray-500">{getFileSize()}</p>
                  <p className="text-xs text-gray-500">Uploaded: {formatDate()}</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {selectedFile === fileUrl ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-purple-600 font-medium">Selected</span>
                  </div>
                ) : (
                  <button className="text-sm text-gray-400 hover:text-purple-600 transition">
                    Select
                  </button>
                )}
              </div>
            </div>

            {selectedFile === fileUrl && (
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">
                    Ready for quiz generation
                  </span>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View File
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;