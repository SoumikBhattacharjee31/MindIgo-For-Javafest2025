"use client";

import { ReportResponse } from "../../api/discussionService";

interface ReportsTableProps {
  reports: ReportResponse[];
  type: "post" | "comment";
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onModerate: (id: number, title: string) => void;
  onRestrictUser: (userId: number, userName: string) => void;
}

const ReportsTable = ({
  reports,
  type,
  loading,
  hasMore,
  onLoadMore,
  onModerate,
  onRestrictUser,
}: ReportsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWED":
        return "bg-green-100 text-green-800";
      case "DISMISSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "SPAM":
        return "bg-orange-100 text-orange-800";
      case "HARASSMENT":
        return "bg-red-100 text-red-800";
      case "INAPPROPRIATE_CONTENT":
        return "bg-purple-100 text-purple-800";
      case "MISINFORMATION":
        return "bg-blue-100 text-blue-800";
      case "HATE_SPEECH":
        return "bg-red-100 text-red-800";
      case "OTHER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const formatReason = (reason: string) => {
    return reason
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No reports found
        </h3>
        <p className="text-gray-500">
          No {type} reports to review at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {type === "post" ? "Post" : "Comment"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reporter
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {type === "post"
                    ? `Post #${report.postId}`
                    : `Comment #${report.commentId}`}
                </div>
                {report.description && (
                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                    {report.description}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {report.reporterEmail}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getReasonColor(
                    report.reason
                  )}`}
                >
                  {formatReason(report.reason)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    report.status
                  )}`}
                >
                  {report.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(report.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {report.status === "PENDING" && (
                  <>
                    <button
                      onClick={() =>
                        onModerate(
                          type === "post" ? report.postId! : report.commentId!,
                          type === "post"
                            ? `Post #${report.postId}`
                            : `Comment #${report.commentId}`
                        )
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Moderate
                    </button>
                    <button
                      onClick={() =>
                        onRestrictUser(report.authorId, report.authorEmail)
                      }
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Restrict User
                    </button>
                  </>
                )}
                {report.status === "REVIEWED" && report.reviewedByEmail && (
                  <div className="text-xs text-gray-500">
                    Reviewed by: {report.reviewedByEmail}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="text-center py-4 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-md transition-colors"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;
