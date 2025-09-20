// app/dashboard/counselor/components/ReviewsTab.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Star, User, Calendar } from "lucide-react";
import { CounselorRating, PaginatedRatingsResponse } from "../types";
import { getRatingsForCounselor } from "../api";

interface ReviewsTabProps {
  counselorId: number;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ counselorId }) => {
  const [ratings, setRatings] = useState<CounselorRating[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchRatings();
  }, [counselorId, currentPage]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError("");
      const data: PaginatedRatingsResponse = await getRatingsForCounselor(
        counselorId.toString(),
        currentPage,
        PAGE_SIZE
      );
      setRatings(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load reviews. Please try again later.");
      setRatings([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card bg-base-200 p-4 rounded-xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton h-10 w-10 rounded-full"></div>
                <div className="space-y-2">
                  <div className="skeleton h-4 w-32"></div>
                  <div className="skeleton h-3 w-24"></div>
                </div>
              </div>
              <div className="skeleton h-4 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasReviews = ratings.length > 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-warning" />
          Client Reviews
        </h3>
        <p className="text-base-content/60">
          {hasReviews ? `${ratings.length} reviews` : "No reviews yet"}
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {hasReviews ? (
        <>
          <div className="space-y-4 mb-6">
            {ratings.map((rating, index) => (
              <div key={index} className="card bg-base-200 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                      {rating.userProfileImageUrl ? (
                        <img
                          src={rating.userProfileImageUrl}
                          alt={rating.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-base-content/60" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base-content truncate max-w-[200px]">
                          {rating.userName}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating.rating
                                  ? "text-warning fill-current"
                                  : "text-base-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-base-content/60">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(rating.createdAt)}</span>
                      </div>
                    </div>

                    {rating.review && (
                      <p className="text-base-content/80 leading-relaxed mt-2">
                        "{rating.review}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="btn btn-sm btn-outline"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`btn btn-sm ${
                      i === currentPage
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="btn btn-sm btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-base-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-base-content/60 mb-2">
            No reviews yet
          </h3>
          <p className="text-base-content/40">
            Be the first to share your experience with this counselor.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;