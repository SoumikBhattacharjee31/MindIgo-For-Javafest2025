"use client"
import React, { useState } from 'react';
import { RoutineResponse, RoutineType } from '../types/routine';
import { formatTime12Hour, getActivityTypeColor, getActivityTypeDisplayName, getDayDisplayName } from '../utils/routineValidation';
import { FaEdit, FaTrash, FaClock, FaUser, FaEye, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

interface RoutineListProps {
  routines: RoutineResponse[];
  onEdit: (routine: RoutineResponse) => void;
  onDelete: (routineId: number) => void;
  onView: (routine: RoutineResponse) => void;
  onCreate: () => void;
  onAssign?: (routine: RoutineResponse) => void;
  isLoading?: boolean;
  showDoctorView?: boolean;
}

const RoutineList: React.FC<RoutineListProps> = ({
  routines,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onAssign,
  isLoading = false,
  showDoctorView = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<RoutineType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('created');

  const filteredRoutines = routines
    .filter(routine => {
      const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          routine.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || routine.routineType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

  const RoutineCard: React.FC<{ routine: RoutineResponse }> = ({ routine }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{routine.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                routine.routineType === RoutineType.DAILY ? 'bg-blue-100 text-blue-800' :
                routine.routineType === RoutineType.WEEKLY ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {routine.routineType.charAt(0) + routine.routineType.slice(1).toLowerCase()}
              </span>
              <span className="text-sm text-gray-500">
                {routine.activities.length} {routine.activities.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onView(routine)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              title="View Details"
            >
              <FaEye />
            </button>
            {showDoctorView && (
              <>
                <button
                  onClick={() => onEdit(routine)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                  title="Edit Routine"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(routine.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Routine"
                >
                  <FaTrash />
                </button>
              </>
            )}
            {onAssign && (
              <button
                onClick={() => onAssign(routine)}
                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                title="Assign to Patient"
              >
                <FaUser />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {routine.description && (
          <p className="text-gray-600 mb-4 text-sm">{routine.description}</p>
        )}

        {/* Activities Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 text-sm">Activities:</h4>
          <div className="space-y-1">
            {routine.activities.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                    {getActivityTypeDisplayName(activity.activityType)}
                  </span>
                  <span className="text-gray-700">{activity.activityName}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FaClock className="w-3 h-3 mr-1" />
                  <span>{formatTime12Hour(activity.startTime)}</span>
                  {routine.routineType === RoutineType.WEEKLY && activity.dayOfWeek && (
                    <span className="ml-2 text-xs">
                      {getDayDisplayName(activity.dayOfWeek).slice(0, 3)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {routine.activities.length > 3 && (
              <div className="text-xs text-gray-500 italic">
                +{routine.activities.length - 3} more activities
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span>Created: {new Date(routine.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(routine.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {showDoctorView ? 'My Routines' : 'Available Routines'}
            </h1>
            <p className="text-gray-600 mt-2">
              {showDoctorView 
                ? 'Manage and create daily/weekly routines for your patients' 
                : 'Browse and apply routines to improve your daily habits'
              }
            </p>
          </div>
          {showDoctorView && (
            <button
              onClick={onCreate}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 flex items-center font-medium"
              disabled={isLoading}
            >
              <FaPlus className="mr-2" />
              Create Routine
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search routines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as RoutineType | 'ALL')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value={RoutineType.DAILY}>Daily</option>
                <option value={RoutineType.WEEKLY}>Weekly</option>
                <option value={RoutineType.CUSTOM}>Custom</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'updated')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created">Created Date</option>
                <option value="updated">Updated Date</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRoutines.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaClock className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No routines found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterType !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.'
              : showDoctorView 
                ? 'Get started by creating your first routine.'
                : 'No routines are available at the moment.'
            }
          </p>
          {showDoctorView && (
            <button
              onClick={onCreate}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Create Your First Routine
            </button>
          )}
        </div>
      )}

      {/* Routines Grid */}
      {!isLoading && filteredRoutines.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredRoutines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center text-sm text-gray-500">
            Showing {filteredRoutines.length} of {routines.length} routines
          </div>
        </>
      )}
    </div>
  );
};

export default RoutineList;