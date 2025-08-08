"use client"
import React, { useState } from 'react';
import { RoutineResponse, RoutineType, DayOfWeek } from '../types/routine';
import { formatTime12Hour, getActivityTypeColor, getActivityTypeDisplayName, getDayDisplayName } from '../utils/routineValidation';
import { FaClock, FaCalendarAlt, FaUser, FaEdit, FaTrash, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';

interface RoutineDetailProps {
  routine: RoutineResponse;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssign?: () => void;
  onBack: () => void;
  showDoctorActions?: boolean;
  showPatientActions?: boolean;
}

const RoutineDetail: React.FC<RoutineDetailProps> = ({
  routine,
  onEdit,
  onDelete,
  onAssign,
  onBack,
  showDoctorActions = true,
  showPatientActions = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  const groupActivitiesByDay = () => {
    if (routine.routineType === RoutineType.DAILY) {
      return {
        'Daily': routine.activities.sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    }

    const grouped: Record<string, typeof routine.activities> = {};
    
    // Initialize all days
    Object.values(DayOfWeek).forEach(day => {
      grouped[getDayDisplayName(day)] = [];
    });

    // Group activities by day
    routine.activities.forEach(activity => {
      if (activity.dayOfWeek) {
        const dayName = getDayDisplayName(activity.dayOfWeek);
        grouped[dayName].push(activity);
      }
    });

    // Sort activities within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  };

  const calculateTotalDuration = () => {
    const totalMinutes = routine.activities.reduce((sum, activity) => {
      const startMinutes = activity.startTime.split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
      const endMinutes = activity.endTime.split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
      return sum + (endMinutes - startMinutes);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getRoutineTypeIcon = () => {
    switch (routine.routineType) {
      case RoutineType.DAILY:
        return <FaClock className="text-blue-500" />;
      case RoutineType.WEEKLY:
        return <FaCalendarAlt className="text-green-500" />;
      default:
        return <FaUser className="text-purple-500" />;
    }
  };

  const getRoutineTypeColor = () => {
    switch (routine.routineType) {
      case RoutineType.DAILY:
        return 'bg-blue-100 text-blue-800';
      case RoutineType.WEEKLY:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const groupedActivities = groupActivitiesByDay();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Routines
            </button>
            
            <div className="flex space-x-2">
              {showDoctorActions && (
                <>
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  )}
                </>
              )}
              {showPatientActions && onAssign && (
                <button
                  onClick={onAssign}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Apply Routine
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRoutineTypeIcon()}
              <h1 className="text-3xl font-bold text-gray-900">{routine.name}</h1>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoutineTypeColor()}`}>
              {routine.routineType.charAt(0) + routine.routineType.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          {routine.description && (
            <p className="text-gray-600 mb-4">{routine.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FaUser className="mr-2 text-gray-400" />
              <span>{routine.activities.length} Activities</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2 text-gray-400" />
              <span>Total Duration: {calculateTotalDuration()}</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <span>Created: {new Date(routine.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([day, activities]) => (
          activities.length > 0 && (
            <div key={day} className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  {day}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({activities.length} {activities.length === 1 ? 'activity' : 'activities'})
                  </span>
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{activity.activityName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                              {getActivityTypeDisplayName(activity.activityType)}
                            </span>
                            {!activity.isActive && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-2">
                            <FaClock className="mr-2" />
                            <span className="font-medium">
                              {formatTime12Hour(activity.startTime)} - {formatTime12Hour(activity.endTime)}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              Duration: {(() => {
                                const startMinutes = activity.startTime.split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
                                const endMinutes = activity.endTime.split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
                                const duration = endMinutes - startMinutes;
                                const hours = Math.floor(duration / 60);
                                const minutes = duration % 60;
                                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                              })()}
                            </span>
                          </div>

                          {activity.description && (
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                          )}

                          {activity.instructions && (
                            <div className="bg-blue-50 rounded-md p-3">
                              <h4 className="font-medium text-blue-900 mb-1">Instructions:</h4>
                              <p className="text-blue-800 text-sm">{activity.instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the routine "{routine.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FaTimes className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <FaTrash className="inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetail;