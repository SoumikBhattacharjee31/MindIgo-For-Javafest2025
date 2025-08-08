"use client"
import React, { useState, useEffect } from 'react';
import { CreateRoutineRequest, CreateActivityRequest, ActivityType, RoutineType, DayOfWeek, ValidationError } from '../types/routine';
import { validateRoutine, getActivityTypeDisplayName, formatTime12Hour } from '../utils/routineValidation';
import { FaPlus, FaTrash, FaClock, FaUser, FaListAlt } from 'react-icons/fa';

interface RoutineFormProps {
  initialData?: CreateRoutineRequest;
  onSubmit: (routine: CreateRoutineRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const RoutineForm: React.FC<RoutineFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}) => {
  const [routine, setRoutine] = useState<CreateRoutineRequest>({
    name: '',
    description: '',
    doctorId: 1, // This should come from authentication
    routineType: RoutineType.DAILY,
    activities: []
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRoutine(initialData);
    }
  }, [initialData]);

  const handleRoutineChange = (field: keyof CreateRoutineRequest, value: any) => {
    setRoutine(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    setErrors(prev => prev.filter(error => !error.field.includes(field)));
  };

  const addActivity = () => {
    const newActivity: CreateActivityRequest = {
      activityName: '',
      activityType: ActivityType.CUSTOM,
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      dayOfWeek: routine.routineType === RoutineType.WEEKLY ? DayOfWeek.MONDAY : undefined,
      instructions: ''
    };

    setRoutine(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };

  const updateActivity = (index: number, field: keyof CreateActivityRequest, value: any) => {
    setRoutine(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
    
    // Clear related errors
    setErrors(prev => prev.filter(error => !error.field.includes(`activities[${index}]`)));
  };

  const removeActivity = (index: number) => {
    setRoutine(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
    
    // Clear related errors
    setErrors(prev => prev.filter(error => !error.field.includes(`activities[${index}]`)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate routine
    const validationErrors = validateRoutine(routine.activities, routine.routineType);
    
    // Add basic routine validation
    if (!routine.name.trim()) {
      validationErrors.push({ field: 'name', message: 'Routine name is required' });
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    await onSubmit(routine);
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const ActivityForm: React.FC<{ activity: CreateActivityRequest; index: number }> = ({ activity, index }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-900">Activity {index + 1}</h4>
        <button
          type="button"
          onClick={() => removeActivity(index)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Name *
          </label>
          <input
            type="text"
            value={activity.activityName}
            onChange={(e) => updateActivity(index, 'activityName', e.target.value)}
            className={`w-full p-2 border rounded-md ${getFieldError(`activities[${index}].activityName`) ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Morning Walk, Breakfast"
          />
          {getFieldError(`activities[${index}].activityName`) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(`activities[${index}].activityName`)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type *
          </label>
          <select
            value={activity.activityType}
            onChange={(e) => updateActivity(index, 'activityType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {Object.values(ActivityType).map(type => (
              <option key={type} value={type}>
                {getActivityTypeDisplayName(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            type="time"
            value={activity.startTime}
            onChange={(e) => updateActivity(index, 'startTime', e.target.value)}
            className={`w-full p-2 border rounded-md ${getFieldError(`activities[${index}].startTime`) ? 'border-red-500' : 'border-gray-300'}`}
          />
          {getFieldError(`activities[${index}].startTime`) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(`activities[${index}].startTime`)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time *
          </label>
          <input
            type="time"
            value={activity.endTime}
            onChange={(e) => updateActivity(index, 'endTime', e.target.value)}
            className={`w-full p-2 border rounded-md ${getFieldError(`activities[${index}].endTime`) ? 'border-red-500' : 'border-gray-300'}`}
          />
          {getFieldError(`activities[${index}].endTime`) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(`activities[${index}].endTime`)}</p>
          )}
        </div>

        {routine.routineType === RoutineType.WEEKLY && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week *
            </label>
            <select
              value={activity.dayOfWeek || ''}
              onChange={(e) => updateActivity(index, 'dayOfWeek', e.target.value)}
              className={`w-full p-2 border rounded-md ${getFieldError(`activities[${index}].dayOfWeek`) ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Day</option>
              {Object.values(DayOfWeek).map(day => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {getFieldError(`activities[${index}].dayOfWeek`) && (
              <p className="text-red-500 text-sm mt-1">{getFieldError(`activities[${index}].dayOfWeek`)}</p>
            )}
          </div>
        )}

        <div className={routine.routineType === RoutineType.WEEKLY ? 'md:col-span-1' : 'md:col-span-2'}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={activity.description || ''}
            onChange={(e) => updateActivity(index, 'description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Brief description of the activity"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            value={activity.instructions || ''}
            onChange={(e) => updateActivity(index, 'instructions', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
            placeholder="Detailed instructions for the patient..."
          />
        </div>
      </div>
    </div>
  );

  const RoutinePreview: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{routine.name}</h3>
      {routine.description && (
        <p className="text-gray-600 mb-6">{routine.description}</p>
      )}
      
      <div className="space-y-4">
        {routine.activities
          .sort((a, b) => {
            if (routine.routineType === RoutineType.WEEKLY) {
              const dayOrder = Object.values(DayOfWeek);
              const dayComparison = dayOrder.indexOf(a.dayOfWeek!) - dayOrder.indexOf(b.dayOfWeek!);
              if (dayComparison !== 0) return dayComparison;
            }
            return a.startTime.localeCompare(b.startTime);
          })
          .map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <FaClock className="text-blue-500" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{activity.activityName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.activityType === ActivityType.FOOD ? 'bg-green-100 text-green-800' :
                    activity.activityType === ActivityType.EXERCISE ? 'bg-blue-100 text-blue-800' :
                    activity.activityType === ActivityType.SLEEP ? 'bg-purple-100 text-purple-800' :
                    activity.activityType === ActivityType.MEDITATION ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getActivityTypeDisplayName(activity.activityType)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime12Hour(activity.startTime)} - {formatTime12Hour(activity.endTime)}
                  {routine.routineType === RoutineType.WEEKLY && activity.dayOfWeek && (
                    <span className="ml-2">• {activity.dayOfWeek.charAt(0) + activity.dayOfWeek.slice(1).toLowerCase()}</span>
                  )}
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaListAlt className="mr-2" />
            {mode === 'create' ? 'Create New Routine' : 'Edit Routine'}
          </h2>
        </div>

        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 rounded-md ${!showPreview ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded-md ${showPreview ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Preview
            </button>
          </div>

          {showPreview ? (
            <RoutinePreview />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General routine errors */}
              {errors.filter(error => error.field === 'activities').map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-700 text-sm">{error.message}</p>
                </div>
              ))}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Routine Name *
                  </label>
                  <input
                    type="text"
                    value={routine.name}
                    onChange={(e) => handleRoutineChange('name', e.target.value)}
                    className={`w-full p-3 border rounded-md ${getFieldError('name') ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter routine name"
                  />
                  {getFieldError('name') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Routine Type *
                  </label>
                  <select
                    value={routine.routineType}
                    onChange={(e) => handleRoutineChange('routineType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value={RoutineType.DAILY}>Daily Routine</option>
                    <option value={RoutineType.WEEKLY}>Weekly Routine</option>
                    <option value={RoutineType.CUSTOM}>Custom Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={routine.description || ''}
                  onChange={(e) => handleRoutineChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
                  placeholder="Describe the purpose and goals of this routine..."
                />
              </div>

              {/* Activities Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Activities</h3>
                  <button
                    type="button"
                    onClick={addActivity}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Add Activity
                  </button>
                </div>

                {routine.activities.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FaListAlt className="mx-auto text-4xl mb-4" />
                    <p>No activities added yet. Click "Add Activity" to get started.</p>
                  </div>
                ) : (
                  routine.activities.map((activity, index) => (
                    <ActivityForm key={index} activity={activity} index={index} />
                  ))
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                  disabled={isLoading || routine.activities.length === 0}
                >
                  {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Routine' : 'Update Routine')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineForm;