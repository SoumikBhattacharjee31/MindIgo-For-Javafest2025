"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  discussionApi,
  DiscussionStatsResponse,
  ReportResponse,
  ApiResponse,
  Page,
  ModerationRequest,
  RestrictUserRequest,
} from "@/app/api/discussionService";
import StatsCard from "@/app/dashboard/discussion/components/StatsCard";
import ReportsTable from "@/app/dashboard/discussion/components/ReportsTable";
import ModerationModal from "@/app/dashboard/discussion/components/ModerationModal";
import UserRestrictionModal from "@/app/dashboard/discussion/components/UserRestrictionModal";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DiscussionStatsResponse | null>(null);
  const [postReports, setPostReports] = useState<ReportResponse[]>([]);
  const [commentReports, setCommentReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "stats" | "post-reports" | "comment-reports"
  >("stats");

  // Moderation Modal States
  const [moderationModal, setModerationModal] = useState<{
    isOpen: boolean;
    type: "post" | "comment" | null;
    id: number | null;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: "",
  });

  // User Restriction Modal State
  const [restrictionModal, setRestrictionModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });

  // Pagination states
  const [postReportsPage, setPostReportsPage] = useState(0);
  const [commentReportsPage, setCommentReportsPage] = useState(0);
  const [hasMorePostReports, setHasMorePostReports] = useState(false);
  const [hasMoreCommentReports, setHasMoreCommentReports] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchPostReports();
    fetchCommentReports();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await discussionApi.getDiscussionStats();
      const apiResponse: ApiResponse<DiscussionStatsResponse> = response.data;

      if (apiResponse.success) {
        setStats(apiResponse.data);
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch statistics");
    }
  };

  const fetchPostReports = async (
    page: number = 0,
    append: boolean = false
  ) => {
    try {
      setLoading(!append);
      const response = await discussionApi.getPostReports({ page, size: 10 });
      const apiResponse: ApiResponse<Page<ReportResponse>> = response.data;

      if (apiResponse.success) {
        if (append) {
          setPostReports((prev) => [...prev, ...apiResponse.data.content]);
        } else {
          setPostReports(apiResponse.data.content);
        }
        setHasMorePostReports(!apiResponse.data.last);
        setPostReportsPage(page);
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error fetching post reports:", error);
      toast.error("Failed to fetch post reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentReports = async (
    page: number = 0,
    append: boolean = false
  ) => {
    try {
      setLoading(!append);
      const response = await discussionApi.getCommentReports({
        page,
        size: 10,
      });
      const apiResponse: ApiResponse<Page<ReportResponse>> = response.data;

      if (apiResponse.success) {
        if (append) {
          setCommentReports((prev) => [...prev, ...apiResponse.data.content]);
        } else {
          setCommentReports(apiResponse.data.content);
        }
        setHasMoreCommentReports(!apiResponse.data.last);
        setCommentReportsPage(page);
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error fetching comment reports:", error);
      toast.error("Failed to fetch comment reports");
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePost = async (data: ModerationRequest) => {
    if (!moderationModal.id) return;

    try {
      const response = await discussionApi.moderatePost(
        moderationModal.id,
        data
      );
      const apiResponse: ApiResponse<void> = response.data;

      if (apiResponse.success) {
        toast.success("Post moderated successfully");
        setModerationModal({ isOpen: false, type: null, id: null, title: "" });
        fetchPostReports(); // Refresh reports
        fetchStats(); // Refresh stats
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error moderating post:", error);
      toast.error("Failed to moderate post");
    }
  };

  const handleModerateComment = async (data: ModerationRequest) => {
    if (!moderationModal.id) return;

    try {
      const response = await discussionApi.moderateComment(
        moderationModal.id,
        data
      );
      const apiResponse: ApiResponse<void> = response.data;

      if (apiResponse.success) {
        toast.success("Comment moderated successfully");
        setModerationModal({ isOpen: false, type: null, id: null, title: "" });
        fetchCommentReports(); // Refresh reports
        fetchStats(); // Refresh stats
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error moderating comment:", error);
      toast.error("Failed to moderate comment");
    }
  };

  const handleRestrictUser = async (data: RestrictUserRequest) => {
    if (!restrictionModal.userId) return;

    try {
      const response = await discussionApi.restrictUser(
        restrictionModal.userId,
        data
      );
      const apiResponse: ApiResponse<void> = response.data;

      if (apiResponse.success) {
        toast.success("User restricted successfully");
        setRestrictionModal({ isOpen: false, userId: null, userName: "" });
        fetchStats(); // Refresh stats
      } else {
        toast.error(apiResponse.message);
      }
    } catch (error) {
      console.error("Error restricting user:", error);
      toast.error("Failed to restrict user");
    }
  };

  const openModerationModal = (
    type: "post" | "comment",
    id: number,
    title: string
  ) => {
    setModerationModal({
      isOpen: true,
      type,
      id,
      title,
    });
  };

  const openRestrictionModal = (userId: number, userName: string) => {
    setRestrictionModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage discussions, reports, and user restrictions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("stats")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "stats"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab("post-reports")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "post-reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Post Reports
                {stats && stats.pendingReports > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {stats.pendingReports}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("comment-reports")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "comment-reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Comment Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats && (
              <>
                <StatsCard
                  title="Total Posts"
                  value={stats.totalPosts}
                  icon="📝"
                  color="blue"
                />
                <StatsCard
                  title="Total Comments"
                  value={stats.totalComments}
                  icon="💬"
                  color="green"
                />
                <StatsCard
                  title="Total Reactions"
                  value={stats.totalReactions}
                  icon="❤️"
                  color="purple"
                />
                <StatsCard
                  title="Pending Reports"
                  value={stats.pendingReports}
                  icon="⚠️"
                  color="red"
                />
                <StatsCard
                  title="Active Restrictions"
                  value={stats.activeRestrictions}
                  icon="🚫"
                  color="yellow"
                />
                <StatsCard
                  title="Posts Today"
                  value={stats.postsToday}
                  icon="📅"
                  color="indigo"
                />
                <StatsCard
                  title="Comments Today"
                  value={stats.commentsToday}
                  icon="🗨️"
                  color="pink"
                />
              </>
            )}
          </div>
        )}

        {activeTab === "post-reports" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Post Reports
              </h2>
              <ReportsTable
                reports={postReports}
                type="post"
                loading={loading}
                hasMore={hasMorePostReports}
                onLoadMore={() => fetchPostReports(postReportsPage + 1, true)}
                onModerate={(id, title) =>
                  openModerationModal("post", id, title)
                }
                onRestrictUser={openRestrictionModal}
              />
            </div>
          </div>
        )}

        {activeTab === "comment-reports" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Comment Reports
              </h2>
              <ReportsTable
                reports={commentReports}
                type="comment"
                loading={loading}
                hasMore={hasMoreCommentReports}
                onLoadMore={() =>
                  fetchCommentReports(commentReportsPage + 1, true)
                }
                onModerate={(id, title) =>
                  openModerationModal("comment", id, title)
                }
                onRestrictUser={openRestrictionModal}
              />
            </div>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      <ModerationModal
        isOpen={moderationModal.isOpen}
        onClose={() =>
          setModerationModal({ isOpen: false, type: null, id: null, title: "" })
        }
        type={moderationModal.type}
        title={moderationModal.title}
        onSubmit={
          moderationModal.type === "post"
            ? handleModeratePost
            : handleModerateComment
        }
      />

      {/* User Restriction Modal */}
      <UserRestrictionModal
        isOpen={restrictionModal.isOpen}
        onClose={() =>
          setRestrictionModal({ isOpen: false, userId: null, userName: "" })
        }
        userName={restrictionModal.userName}
        onSubmit={handleRestrictUser}
      />
    </div>
  );
};

export default AdminDashboard;
