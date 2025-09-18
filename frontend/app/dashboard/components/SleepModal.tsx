'use client';
import React, { useState, useEffect } from 'react';
import { X, Clock, Moon, Sun, Save } from 'lucide-react';
import { sleepApi, SleepRequest, formatTimeForApi, formatTimeForDisplay } from '../sleep/sleepApi';
import { successToast, errorToast } from '@/util/toastHelper';

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: {
    date: string;
    sleepTime: string;
    wakeTime: string;
  } | null;
  selectedDate: string;
}

const SleepModal: React.FC<SleepModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDate
}) => {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ sleepTime?: string; wakeTime?: string }>({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSleepTime(formatTimeForDisplay(initialData.sleepTime));
        setWakeTime(formatTimeForDisplay(initialData.wakeTime));
      } else {
        // Set default values for new entry
        setSleepTime('23:00');
        setWakeTime('07:00');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: { sleepTime?: string; wakeTime?: string } = {};

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!sleepTime) {
      newErrors.sleepTime = 'Sleep time is required';
    } else if (!timeRegex.test(sleepTime)) {
      newErrors.sleepTime = 'Invalid time format (HH:MM)';
    }

    if (!wakeTime) {
      newErrors.wakeTime = 'Wake time is required';
    } else if (!timeRegex.test(wakeTime)) {
      newErrors.wakeTime = 'Invalid time format (HH:MM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const sleepData: SleepRequest = {
        date: selectedDate,
        sleepTime: formatTimeForApi(sleepTime),
        wakeTime: formatTimeForApi(wakeTime),
      };

      await sleepApi.saveSleep(sleepData);
      
      successToast(initialData ? 'Sleep data updated successfully!' : 'Sleep data saved successfully!');
      onSave();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save sleep data';
      errorToast(errorMessage);
      console.error('Error saving sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!sleepTime || !wakeTime) return null;
    
    try {
      const sleep = new Date(`2000-01-01T${sleepTime}:00`);
      let wake = new Date(`2000-01-01T${wakeTime}:00`);
      
      // If wake time is earlier than sleep time, assume it's next day
      if (wake < sleep) {
        wake = new Date(`2000-01-02T${wakeTime}:00`);
      }
      
      const diffMs = wake.getTime() - sleep.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${diffHours}h ${diffMinutes}m`;
    } catch {
      return null;
    }
  };

  const duration = calculateDuration();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Moon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? 'Edit Sleep Data' : 'Add Sleep Data'}
              </h2>
              <p className="text-sm text-gray-600">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Sleep Time */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Moon className="w-4 h-4 text-blue-500" />
              Sleep Time
            </label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.sleepTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              disabled={loading}
            />
            {errors.sleepTime && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.sleepTime}
              </p>
            )}
          </div>

          {/* Wake Time */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sun className="w-4 h-4 text-yellow-500" />
              Wake Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.wakeTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              disabled={loading}
            />
            {errors.wakeTime && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.wakeTime}
              </p>
            )}
          </div>

          {/* Duration Display */}
          {duration && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Sleep Duration</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{duration}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {initialData ? 'Update' : 'Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepModal;