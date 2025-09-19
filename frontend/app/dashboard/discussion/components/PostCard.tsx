"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  PostResponse,
  discussionApi,
  REACTION_TYPES,
  POST_CATEGORIES,
} from "@/app/dashboard/discussion/api";
import UpdatePostModal from "./UpdatePostModal";
import ReportModal from "./ReportModal";
import ImageGallery from "./ImageGallery";
import DropdownMenu, { DropdownItem } from "./DropdownMenu";

interface PostCardProps {
  post: PostResponse;
  onDelete: (postId: number) => void;
  onUpdate: (updatedPost: PostResponse) => void;
  onClick?: () => void;
  showFullContent?: boolean;
  isDetailView?: boolean;
}

const PostCard = ({
  post,
  onDelete,
  onUpdate,
  onClick,
  showFullContent = false,
  isDetailView = false,
}: PostCardProps) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(post.userReactionType);
  const [reactions, setReactions] = useState(post.reactionBreakdown);
  const [totalReactions, setTotalReactions] = useState(post.reactionCount);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case POST_CATEGORIES.PROBLEM:
        return "bg-red-100 text-red-800 border-red-200";
      case POST_CATEGORIES.SOLUTION:
        return "bg-green-100 text-green-800 border-green-200";
      case POST_CATEGORIES.SUGGESTION:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "COUNSELOR":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case REACTION_TYPES.LIKE:
        return "👍";
      case REACTION_TYPES.LOVE:
        return "❤️";
      case REACTION_TYPES.HELPFUL:
        return "🥰";
      case REACTION_TYPES.INSIGHTFUL:
        return "🥳";
      default:
        return "👍";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return date.toLocaleDateString();
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const response = await discussionApi.reactToPost(post.id, {
        reactionType,
      });

      if (response.data.success) {
        const newReactions = response.data.data.reactionBreakdown;
        const newTotal = response.data.data.totalReactions;

        setReactions(newReactions);
        setTotalReactions(newTotal);

        // Toggle reaction
        if (currentReaction === reactionType) {
          setCurrentReaction("");
        } else {
          setCurrentReaction(reactionType);
        }
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
      toast.error("Failed to react to post");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setIsDeleting(true);
      const response = await discussionApi.deletePost(post.id);

      if (response.data.success) {
        onDelete(post.id);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async (reason: string, description?: string) => {
    try {
      const response = await discussionApi.reportPost(post.id, {
        reason,
        description,
      });

      if (response.data.success) {
        toast.success("Post reported successfully");
        setIsReportModalOpen(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("Failed to report post");
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (showFullContent || content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg ${
          onClick && !isDetailView ? "cursor-pointer" : ""
        }`}
        onClick={onClick && !isDetailView ? onClick : undefined}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {post.authorName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{post.authorName}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                    post.authorRole
                  )}`}
                >
                  {post.authorRole}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Category and Dropdown */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                post.category
              )}`}
            >
              {post.category}
            </span>

            <DropdownMenu
              trigger={
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              }
            >
              {post.canEdit && (
                <>
                  <DropdownItem onClick={() => setIsUpdateModalOpen(true)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem onClick={handleDelete} className="text-red-600">
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownItem>
                </>
              )}
              <DropdownItem onClick={() => setIsReportModalOpen(true)}>
                Report
              </DropdownItem>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
          {post.title}
        </h2>

        {/* Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">
            {truncateContent(post.content)}
          </p>
        </div>

        {/* Images */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-4">
            <ImageGallery images={post.imageUrls} />
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Reactions */}
          <div className="flex items-center space-x-2">
            {Object.entries(REACTION_TYPES).map(([key, value]) => (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(value);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                  currentReaction === value
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{getReactionIcon(value)}</span>
                <span>{reactions[value] || 0}</span>
              </button>
            ))}
          </div>

          {/* Post Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{post.commentCount} comments</span>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <UpdatePostModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          post={post}
          onPostUpdated={onUpdate}
        />
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          type="post"
          onSubmit={handleReport}
        />
      )}
    </>
  );
};

export default PostCard;
