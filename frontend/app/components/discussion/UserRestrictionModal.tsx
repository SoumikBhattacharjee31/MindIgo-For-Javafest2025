"use client";

import { useState } from "react";
import {
  RestrictUserRequest,
  RESTRICTION_TYPES,
} from "../../api/discussionService";

interface UserRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSubmit: (data: RestrictUserRequest) => void;
}

const UserRestrictionModal = ({
  isOpen,
  onClose,
  userName,
  onSubmit,
}: UserRestrictionModalProps) => {
  const [formData, setFormData] = useState<RestrictUserRequest>({
    restrictionType: RESTRICTION_TYPES.POST_ONLY,
    durationInHours: 24,
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "durationInHours" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      return;
    }

    if (formData.durationInHours <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      restrictionType: RESTRICTION_TYPES.POST_ONLY,
      durationInHours: 24,
      reason: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getDurationPresets = () => [
    { label: "1 Hour", value: 1 },
    { label: "6 Hours", value: 6 },
    { label: "12 Hours", value: 12 },
    { label: "1 Day", value: 24 },
    { label: "3 Days", value: 72 },
    { label: "1 Week", value: 168 },
    { label: "2 Weeks", value: 336 },
    { label: "1 Month", value: 720 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Restrict User</h2>
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
              You are about to restrict: <strong>{userName}</strong>
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-orange-400"
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
                  <p className="text-sm text-orange-700">
                    This will prevent the user from participating in discussions
                    according to the restriction type.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Restriction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restriction Type *
              </label>
              <select
                name="restrictionType"
                value={formData.restrictionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value={RESTRICTION_TYPES.POST_ONLY}>
                  Cannot Create Posts
                </option>
                <option value={RESTRICTION_TYPES.COMMENT_ONLY}>
                  Cannot Comment
                </option>
                <option value={RESTRICTION_TYPES.FULL_RESTRICTION}>
                  Cannot Post or Comment
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.restrictionType === RESTRICTION_TYPES.POST_ONLY &&
                  "User can comment but cannot create new posts"}
                {formData.restrictionType === RESTRICTION_TYPES.COMMENT_ONLY &&
                  "User can create posts but cannot comment"}
                {formData.restrictionType ===
                  RESTRICTION_TYPES.FULL_RESTRICTION &&
                  "User cannot create posts or comments"}
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {getDurationPresets().map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        durationInHours: preset.value,
                      }))
                    }
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      formData.durationInHours === preset.value
                        ? "bg-orange-100 border-orange-300 text-orange-700"
                        : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="durationInHours"
                  value={formData.durationInHours}
                  onChange={handleInputChange}
                  min="1"
                  max="8760"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <span className="text-sm text-gray-600">hours</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum 1 year (8760 hours)
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for restriction *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Provide a detailed reason for this restriction..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-vertical"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
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
                !formData.reason.trim() ||
                formData.durationInHours <= 0
              }
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Restricting..." : "Restrict User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRestrictionModal;
