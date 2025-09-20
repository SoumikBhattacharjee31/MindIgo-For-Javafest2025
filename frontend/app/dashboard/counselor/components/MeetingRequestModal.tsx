// app/dashboard/counselor/components/MeetingRequestModal.tsx
"use client";
import React, { useState } from "react";
import { MeetingType } from "../types";

interface MeetingRequestModalProps {
  onClose: () => void;
  onSubmit: (type: MeetingType) => Promise<void>;
  error: string;
}

const MeetingRequestModal: React.FC<MeetingRequestModalProps> = ({ onClose, onSubmit, error }) => {
  const [meetingType, setMeetingType] = useState<MeetingType>("AUDIO");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(meetingType);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-base-200">
          <h2 className="text-2xl font-bold text-center">Request a Meeting</h2>
          <p className="text-sm text-base-content/60 mt-1 text-center">
            Select the type of meeting you want to request.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meeting Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-base-content/80">Meeting Type</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="AUDIO"
                  checked={meetingType === "AUDIO"}
                  onChange={() => setMeetingType("AUDIO")}
                  className="radio radio-primary"
                />
                Audio Meeting
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="VIDEO"
                  checked={meetingType === "VIDEO"}
                  onChange={() => setMeetingType("VIDEO")}
                  className="radio radio-primary"
                />
                Video Meeting
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Send Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingRequestModal;