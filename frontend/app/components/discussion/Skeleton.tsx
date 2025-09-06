"use client";

// Basic skeleton loading component
export const Skeleton = ({ className = "" }: { className?: string }) => {
  return <div className={`animate-pulse bg-gray-300 rounded ${className}`} />;
};

// Post card skeleton
export const PostCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-3/4 mb-3" />

      {/* Content */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Images placeholder */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-12 rounded-full" />
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
};

// Comment skeleton
export const CommentSkeleton = ({ level = 0 }: { level?: number }) => {
  const indentationClass =
    level > 0
      ? `ml-${Math.min(level * 6, 18)} pl-4 border-l-2 border-gray-200`
      : "";

  return (
    <div className={`${indentationClass}`}>
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-2 w-12" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-8 rounded-full" />
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
};

// Loading spinner
export const LoadingSpinner = ({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
      />
    </div>
  );
};

// Full page loading
export const FullPageLoading = ({
  message = "Loading...",
}: {
  message?: string;
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 mt-4">{message}</p>
    </div>
  );
};
