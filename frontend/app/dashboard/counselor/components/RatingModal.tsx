// app/dashboard/counselor/components/RatingModal.tsx
"use client";
import React, { useState } from "react";
import { Star } from "lucide-react";
import { RateCounselorRequest } from "../types";

interface RatingModalProps {
  counselorId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: RateCounselorRequest) => Promise<void>;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
  counselorId, 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      await onSubmit({ counselorId, rating, review });
      onClose();
      setRating(0);
      setReview("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-base-200">
          <h2 className="text-2xl font-bold text-center">Rate Your Experience</h2>
          <p className="text-sm text-base-content/60 mt-1 text-center">
            Share your thoughts about {counselorId} - it helps others!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Stars */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-base-content/80">Your Rating</label>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      className="sr-only"
                      onChange={() => setRating(ratingValue)}
                    />
                    <Star
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        ratingValue <= (hover || rating)
                          ? "text-warning fill-current"
                          : "text-base-300"
                      }`}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
            {rating === 0 && error && (
              <p className="text-error text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Review Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">Review (Optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience... What did you like? How did it help you?"
              rows={4}
              className="textarea textarea-bordered w-full resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-base-content/60">
              <span>{review.length}/500</span>
            </div>
          </div>

          {/* Error Message */}
          {error && !rating && (
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
              disabled={rating === 0 || submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;