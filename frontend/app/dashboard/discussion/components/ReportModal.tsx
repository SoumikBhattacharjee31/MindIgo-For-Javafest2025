"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/app/api/discussionService";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "post" | "comment";
  onSubmit: (reason: string, description?: string) => void;
}

const ReportModal = ({ isOpen, onClose, type, onSubmit }: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    {
      value: REPORT_REASONS.SPAM,
      label: "Spam",
      description: "Repetitive, unwanted, or promotional content",
    },
    {
      value: REPORT_REASONS.HARASSMENT,
      label: "Harassment",
      description: "Bullying, threats, or targeted abuse",
    },
    {
      value: REPORT_REASONS.INAPPROPRIATE_CONTENT,
      label: "Inappropriate Content",
      description: "Content that violates community standards",
    },
    {
      value: REPORT_REASONS.MISINFORMATION,
      label: "Misinformation",
      description: "False or misleading information",
    },
    {
      value: REPORT_REASONS.HATE_SPEECH,
      label: "Hate Speech",
      description: "Content that promotes hatred or discrimination",
    },
    {
      value: REPORT_REASONS.OTHER,
      label: "Other",
      description: "Another reason not listed above",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      return;
    }

    if (selectedReason === REPORT_REASONS.OTHER && !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(selectedReason, description.trim() || undefined);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedReason("");
    setDescription("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Report {type === "post" ? "Post" : "Comment"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Help us understand what's happening with this {type}. Your report
              will be reviewed by our moderation team.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why are you reporting this {type}? *
            </label>
            <div className="space-y-3">
              {reportReasons.map((reason) => (
                <div
                  key={reason.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedReason(reason.value)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {reason.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {reason.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details{" "}
              {selectedReason === REPORT_REASONS.OTHER ? "*" : "(Optional)"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                selectedReason === REPORT_REASONS.OTHER
                  ? "Please describe the issue..."
                  : "Provide any additional context that might help our review..."
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-vertical"
              maxLength={500}
              required={selectedReason === REPORT_REASONS.OTHER}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Warning Message */}
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please only submit reports for content that violates our
                  community guidelines. False reports may result in restrictions
                  on your account.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedReason ||
                (selectedReason === REPORT_REASONS.OTHER && !description.trim())
              }
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
