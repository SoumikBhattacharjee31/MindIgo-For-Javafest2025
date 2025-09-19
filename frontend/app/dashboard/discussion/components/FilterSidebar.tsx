"use client";

import { POST_CATEGORIES, USER_ROLES } from "@/app/dashboard/discussion/api";

interface FilterSidebarProps {
  filters: {
    category: string;
    authorRole: string;
    keyword: string;
    sortBy: string;
  };
  onFilterChange: (filters: any) => void;
}

const FilterSidebar = ({ filters, onFilterChange }: FilterSidebarProps) => {
  const handleInputChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      category: "",
      authorRole: "",
      keyword: "",
      sortBy: "newest",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search posts..."
            value={filters.keyword}
            onChange={(e) => handleInputChange("keyword", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value={POST_CATEGORIES.PROBLEM}>Problem</option>
            <option value={POST_CATEGORIES.SOLUTION}>Solution</option>
            <option value={POST_CATEGORIES.SUGGESTION}>Suggestion</option>
          </select>
        </div>

        {/* Author Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author Role
          </label>
          <select
            value={filters.authorRole}
            onChange={(e) => handleInputChange("authorRole", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value={USER_ROLES.USER}>User</option>
            <option value={USER_ROLES.COUNSELOR}>Counselor</option>
            <option value={USER_ROLES.ADMIN}>Admin</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostReactions">Most Reactions</option>
            <option value="mostComments">Most Comments</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Filters
          </label>
          <div className="space-y-2">
            <button
              onClick={() =>
                handleInputChange("authorRole", USER_ROLES.COUNSELOR)
              }
              className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
            >
              Counselor Posts
            </button>
            <button
              onClick={() =>
                handleInputChange("category", POST_CATEGORIES.PROBLEM)
              }
              className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
            >
              Problems Only
            </button>
            <button
              onClick={() =>
                handleInputChange("category", POST_CATEGORIES.SOLUTION)
              }
              className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
            >
              Solutions Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
