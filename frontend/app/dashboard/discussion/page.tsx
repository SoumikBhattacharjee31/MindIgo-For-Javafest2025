"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  discussionApi,
  PostResponse,
  ApiResponse,
  Page,
  POST_CATEGORIES,
  USER_ROLES,
} from "@/app/api/discussionService";
import PostCard from "@/app/dashboard/discussion/components/PostCard";
import CreatePostModal from "@/app/dashboard/discussion/components/CreatePostModal";
import FilterSidebar from "@/app/dashboard/discussion/components/FilterSidebar";

const DiscussionPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    authorRole: "",
    keyword: "",
    sortBy: "newest",
  });

  const pageSize = 10;

  useEffect(() => {
    fetchPosts(true);
  }, [filters]);

  const fetchPosts = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const page = reset ? 0 : currentPage;

      const response = await discussionApi.getPosts({
        ...filters,
        page,
        size: pageSize,
      });

      const apiResponse: ApiResponse<Page<PostResponse>> = response.data;

      if (apiResponse.success) {
        if (reset) {
          setPosts(apiResponse.data.content);
          setCurrentPage(0);
        } else {
          setPosts((prev) => [...prev, ...apiResponse.data.content]);
        }

        setHasNextPage(!apiResponse.data.last);
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasNextPage && !loading) {
      setCurrentPage((prev) => prev + 1);
      fetchPosts();
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handlePostCreated = (newPost: PostResponse) => {
    setPosts((prev) => [newPost, ...prev]);
    setIsCreateModalOpen(false);
    toast.success("Post created successfully!");
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    toast.success("Post deleted successfully!");
  };

  const handlePostUpdated = (updatedPost: PostResponse) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    toast.success("Post updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Discussion Forum
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Share problems, solutions, and suggestions with the
                    community
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Post
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {loading && posts.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="mx-auto h-16 w-16"
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
                    No posts found
                  </h3>
                  <p className="text-gray-500">
                    Be the first to start a discussion!
                  </p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onDelete={handlePostDeleted}
                      onUpdate={handlePostUpdated}
                      onClick={() =>
                        router.push(`/dashboard/discussion/posts/${post.id}`)
                      }
                    />
                  ))}

                  {hasNextPage && (
                    <div className="text-center py-8">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        {loading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default DiscussionPage;
