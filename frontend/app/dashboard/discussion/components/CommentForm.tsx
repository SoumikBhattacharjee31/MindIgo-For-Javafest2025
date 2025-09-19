"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  discussionApi,
  CommentResponse,
  CreateCommentRequest,
} from "@/app/dashboard/discussion/api";

interface CommentFormProps {
  postId: number;
  parentCommentId?: number;
  onCommentCreated: (comment: CommentResponse) => void;
  onCancel?: () => void;
  placeholder?: string;
  buttonText?: string;
}

const CommentForm = ({
  postId,
  parentCommentId,
  onCommentCreated,
  onCancel,
  placeholder = "Write your comment...",
  buttonText = "Post Comment",
}: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Comment content is required");
      return;
    }
    if (content.length > 2000) {
      toast.error("Comment is too long (max 2000 characters)");
      return;
    }
    try {
      setIsSubmitting(true);
      const commentData: CreateCommentRequest = {
        content: content.trim(),
        parentCommentId,
      };
      const response = await discussionApi.createComment(postId, commentData);
      if (response.data.success) {
        onCommentCreated(response.data.data);
        setContent("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={parentCommentId ? 3 : 4}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {content.length}/2000 characters
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Posting..." : buttonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
