'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { CommentResponse, discussionApi, REACTION_TYPES } from '../../api/discussionService';
import CommentForm from './CommentForm';
import ReportModal from './ReportModal';
import UpdateCommentModal from './UpdateCommentModal';

interface CommentSectionProps {
  comment: CommentResponse;
  onCommentDeleted: (commentId: number) => void;
  onCommentUpdated: (updatedComment: CommentResponse) => void;
  postId: number;
  level?: number;
}

const CommentSection = ({ comment, onCommentDeleted, onCommentUpdated, postId, level = 0 }: CommentSectionProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(comment.userReactionType);
  const [reactions, setReactions] = useState(comment.reactionBreakdown);
  const [totalReactions, setTotalReactions] = useState(comment.reactionCount);
  const [replies, setReplies] = useState(comment.replies || []);

  const maxNestingLevel = 3; // Limit nesting depth

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COUNSELOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case REACTION_TYPES.LIKE: return '👍';
      case REACTION_TYPES.LOVE: return '❤️';
      case REACTION_TYPES.HELPFUL: return '🥰';
      case REACTION_TYPES.INSIGHTFUL: return '🥳';
      default: return '👍';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const response = await discussionApi.reactToComment(comment.id, { reactionType });
      
      if (response.data.success) {
        const newReactions = response.data.data.reactionBreakdown;
        const newTotal = response.data.data.totalReactions;
        
        setReactions(newReactions);
        setTotalReactions(newTotal);
        
        // Toggle reaction
        if (currentReaction === reactionType) {
          setCurrentReaction('');
        } else {
          setCurrentReaction(reactionType);
        }
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
      toast.error('Failed to react to comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsDeleting(true);
      const response = await discussionApi.deleteComment(comment.id);
      
      if (response.data.success) {
        onCommentDeleted(comment.id);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async (reason: string, description?: string) => {
    try {
      const response = await discussionApi.reportComment(comment.id, { reason, description });
      
      if (response.data.success) {
        toast.success('Comment reported successfully');
        setIsReportModalOpen(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast.error('Failed to report comment');
    }
  };

  const handleReplyCreated = (newReply: CommentResponse) => {
    setReplies(prev => [newReply, ...prev]);
    setShowReplyForm(false);
    toast.success('Reply posted successfully!');
  };

  const handleNestedCommentDeleted = (commentId: number) => {
    setReplies(prev => prev.filter(reply => reply.id !== commentId));
  };

  const handleNestedCommentUpdated = (updatedComment: CommentResponse) => {
    const updateRecursive = (comments: CommentResponse[]): CommentResponse[] => {
      return comments.map(c => {
        if (c.id === updatedComment.id) {
          return updatedComment;
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateRecursive(c.replies) };
        }
        return c;
      });
    };

    setReplies(prev => updateRecursive(prev));
  };

  const indentationClass = level > 0 ? `ml-${Math.min(level * 6, 18)} pl-4 border-l-2 border-gray-200` : '';

  return (
    <>
      <div className={`${indentationClass}`}>
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {comment.authorName.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-gray-900 text-sm">{comment.authorName}</h5>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(comment.authorRole)}`}>
                    {comment.authorRole}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Comment Content */}
          <div className="mb-3">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            {/* Reactions */}
            <div className="flex items-center space-x-1">
              {Object.entries(REACTION_TYPES).slice(0, 4).map(([key, value]) => ( // Show only first 3 reactions to save space
                <button
                  key={key}
                  onClick={() => handleReaction(value)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    currentReaction === value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{getReactionIcon(value)}</span>
                  <span>{reactions[value] || 0}</span>
                </button>
              ))}
              
              {totalReactions > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  {totalReactions} reactions
                </span>
              )}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {level < maxNestingLevel && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>
              )}
              
              {replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {showReplies ? 'Hide' : 'Show'} {replies.length} replies
                </button>
              )}
              
              {comment.canEdit && (
                <>
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
              
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-gray-600 hover:text-gray-800"
              >
                Report
              </button>
            </div>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onCommentCreated={handleReplyCreated}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                buttonText="Reply"
              />
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {showReplies && replies.length > 0 && (
          <div className="space-y-3">
            {replies.map((reply) => (
              <CommentSection
                key={reply.id}
                comment={reply}
                onCommentDeleted={handleNestedCommentDeleted}
                onCommentUpdated={handleNestedCommentUpdated}
                postId={postId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <UpdateCommentModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          comment={comment}
          onCommentUpdated={onCommentUpdated}
        />
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          type="comment"
          onSubmit={handleReport}
        />
      )}
    </>
  );
};

export default CommentSection;