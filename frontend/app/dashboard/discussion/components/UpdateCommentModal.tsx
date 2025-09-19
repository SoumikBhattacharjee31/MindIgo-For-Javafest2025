"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  discussionApi,
  CommentResponse,
  UpdateCommentRequest,
} from "@/app/api/discussionService";

interface UpdateCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: CommentResponse;
  onCommentUpdated: (updatedComment: CommentResponse) => void;
}

const UpdateCommentModal = ({
  isOpen,
  onClose,
  comment,
  onCommentUpdated,
}: UpdateCommentModalProps) => {
  const [formData, setFormData] = useState<UpdateCommentRequest>({
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && comment) {
      setFormData({
        content: comment.content,
      });
    }
  }, [isOpen, comment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await discussionApi.updateComment(comment.id, formData);

      if (response.data.success) {
        onCommentUpdated(response.data.data);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Comment
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
          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Update your comment..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              maxLength={5000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/5000 characters
            </p>
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCommentModal;
