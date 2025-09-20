"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  discussionApi,
  PostResponse,
  CommentResponse,
  ApiResponse,
  Page,
  COMMENT_SORT_TYPES,
} from "@/app/dashboard/discussion/api";
import PostCard from "@/app/dashboard/discussion/components/PostCard";
import CommentSection from "@/app/dashboard/discussion/components/CommentSection";
import CommentForm from "@/app/dashboard/discussion/components/CommentForm";

const PostDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<string>(COMMENT_SORT_TYPES.NEWEST);

  const pageSize = 20;

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments(true);
    }
  }, [postId, sortBy]);

  const fetchPost = async () => {
    try {
      const response = await discussionApi.getPostById(Number(postId));
      const apiResponse: ApiResponse<PostResponse> = response.data;

      if (apiResponse.success) {
        setPost(apiResponse.data);
      } else {
        toast.error(apiResponse.message);
        router.push("/counselor/discussion");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to fetch post");
      router.push("/counselor/discussion");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (reset: boolean = false) => {
    try {
      setCommentsLoading(true);
      const page = reset ? 0 : currentPage;

      const response = await discussionApi.getComments(Number(postId), {
        sortBy,
        page,
        size: pageSize,
      });

      const apiResponse: ApiResponse<Page<CommentResponse>> = response.data;

      if (apiResponse.success) {
        if (reset) {
          setComments(apiResponse.data.content);
          setCurrentPage(0);
        } else {
          setComments((prev) => [...prev, ...apiResponse.data.content]);
        }

        setHasNextPage(!apiResponse.data.last);
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to fetch comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (hasNextPage && !commentsLoading) {
      setCurrentPage((prev) => prev + 1);
      fetchComments();
    }
  };

  const handlePostDeleted = () => {
    toast.success("Post deleted successfully!");
    router.push("/counselor/discussion");
  };

  const handlePostUpdated = (updatedPost: PostResponse) => {
    setPost(updatedPost);
    toast.success("Post updated successfully!");
  };

  const handleCommentCreated = (newComment: CommentResponse) => {
    setComments((prev) => [newComment, ...prev]);

    // Update post comment count
    if (post) {
      setPost((prev) =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : null
      );
    }

    toast.success("Comment posted successfully!");
  };

  const handleCommentDeleted = (commentId: number) => {
    const removeComment = (comments: CommentResponse[]): CommentResponse[] => {
      return comments.reduce((acc, comment) => {
        if (comment.id === commentId) {
          return acc; // Skip this comment
        }

        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = removeComment(comment.replies);
          return [...acc, { ...comment, replies: updatedReplies }];
        }

        return [...acc, comment];
      }, [] as CommentResponse[]);
    };

    setComments((prev) => removeComment(prev));

    // Update post comment count
    if (post) {
      setPost((prev) =>
        prev ? { ...prev, commentCount: prev.commentCount - 1 } : null
      );
    }

    toast.success("Comment deleted successfully!");
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleCommentUpdated = (updatedComment: CommentResponse) => {
    const updateRecursive = (
      comments: CommentResponse[]
    ): CommentResponse[] => {
      return comments.map((c) => {
        if (c.id === updatedComment.id) {
          return updatedComment;
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateRecursive(c.replies) };
        }
        return c;
      });
    };

    setComments((prev) => updateRecursive(prev));
    toast.success("Comment updated successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Post not found
          </h2>
          <button
            onClick={() => router.push("/counselor/discussion")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Discussion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/counselor/discussion")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Discussion
            </button>
          </div>

          {/* Post */}
          <PostCard
            post={post}
            onDelete={handlePostDeleted}
            onUpdate={handlePostUpdated}
            showFullContent={true}
            isDetailView={true}
          />

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            {/* Comment Form */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Add a Comment
              </h3>
              <CommentForm
                postId={post.id}
                onCommentCreated={handleCommentCreated}
              />
            </div>

            {/* Comments Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Comments ({post.commentCount})
              </h3>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={COMMENT_SORT_TYPES.NEWEST}>Newest</option>
                  <option value={COMMENT_SORT_TYPES.OLDEST}>Oldest</option>
                  <option value={COMMENT_SORT_TYPES.MOST_REACTIONS}>
                    Most Reactions
                  </option>
                  <option value={COMMENT_SORT_TYPES.MOST_REPLIES}>
                    Most Replies
                  </option>
                </select>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading && comments.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No comments yet
                </h3>
                <p className="text-gray-500">
                  Be the first to comment on this post!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentSection
                    key={comment.id}
                    comment={comment}
                    onCommentDeleted={handleCommentDeleted}
                    onCommentUpdated={handleCommentUpdated}
                    postId={post.id}
                  />
                ))}

                {hasNextPage && (
                  <div className="text-center py-4">
                    <button
                      onClick={loadMoreComments}
                      disabled={commentsLoading}
                      className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {commentsLoading ? "Loading..." : "Load More Comments"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
