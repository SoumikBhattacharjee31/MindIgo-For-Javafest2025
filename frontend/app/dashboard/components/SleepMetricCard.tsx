'use client';
import React, { useState, useEffect } from 'react';
import { Moon, MoreVertical, Plus, Edit3, History, Clock, Sun } from 'lucide-react';
import { sleepApi, SleepResponse, formatDateForApi, formatTimeForDisplay, calculateSleepDuration } from '../sleep/sleepApi';
import { errorToast } from '@/util/toastHelper';
import SleepModal from './SleepModal';
import SleepLog from './SleepLog';

const SleepMetricCard: React.FC = () => {
  const [todaySleep, setTodaySleep] = useState<SleepResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const today = formatDateForApi(new Date());

  const loadTodaySleep = async () => {
    try {
      setLoading(true);
      setError(null);
      const sleepData = await sleepApi.getSleepByDate(today);
      setTodaySleep(sleepData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load sleep data';
      setError(errorMessage);
      // Don't show toast on initial load failure, just show in UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodaySleep();
  }, [today]);

  const handleDataChange = () => {
    loadTodaySleep();
    setMenuOpen(false);
  };

  const handleAddEdit = () => {
    setModalOpen(true);
    setMenuOpen(false);
  };

  const handleViewLog = () => {
    setLogOpen(true);
    setMenuOpen(false);
  };

  const getSleepQuality = (duration: string) => {
    const hours = parseInt(duration.split('h')[0]);
    if (hours >= 7 && hours <= 9) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (hours >= 6 && hours <= 10) return { text: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getEncouragement = (sleepData: SleepResponse | null) => {
    if (!sleepData) return "Track your sleep to unlock insights! 🌙";
    
    const duration = calculateSleepDuration(sleepData.sleepTime, sleepData.wakeTime);
    const hours = parseInt(duration.split('h')[0]);
    
    if (hours >= 8) return "Fantastic sleep! You're well-rested! ✨";
    if (hours >= 7) return "Good sleep! Keep up the routine! 😊";
    if (hours >= 6) return "Not bad! Try for a bit more sleep tonight 💤";
    return "Your sleep needs attention. Rest well tonight! 🌙";
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
        {/* Header with menu */}
        <div className="flex items-center justify-between mb-4">
          <Moon className="w-5 h-5 text-blue-500" />
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-20">
                  <button
                    onClick={handleAddEdit}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {todaySleep ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {todaySleep ? 'Edit Today' : 'Add Today'}
                  </button>
                  <button
                    onClick={handleViewLog}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <History className="w-4 h-4" />
                    View Log (7 days)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-red-500 text-sm mb-2">Failed to load</div>
            <button
              onClick={loadTodaySleep}
              className="text-blue-500 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        ) : todaySleep ? (
          <>
            {/* Sleep data exists */}
            <h3 className="text-gray-600 text-sm font-medium">Sleep Duration</h3>
            <div className="flex items-center gap-2 mt-1 mb-3">
              <p className="text-2xl font-bold text-gray-900">
                {calculateSleepDuration(todaySleep.sleepTime, todaySleep.wakeTime)}
              </p>
              {(() => {
                const duration = calculateSleepDuration(todaySleep.sleepTime, todaySleep.wakeTime);
                const quality = getSleepQuality(duration);
                return (
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${quality.color} ${quality.bg}`}>
                    {quality.text}
                  </span>
                );
              })()}
            </div>

            {/* Sleep and wake times */}
            <div className="flex gap-4 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Moon className="w-3 h-3" />
                <span>Sleep: {formatTimeForDisplay(todaySleep.sleepTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sun className="w-3 h-3" />
                <span>Wake: {formatTimeForDisplay(todaySleep.wakeTime)}</span>
              </div>
            </div>

            <p className="text-xs text-purple-600 font-medium">
              {getEncouragement(todaySleep)}
            </p>
          </>
        ) : (
          <>
            {/* No sleep data */}
            <h3 className="text-gray-600 text-sm font-medium">Sleep Duration</h3>
            <p className="text-2xl font-bold text-gray-400 mt-1 mb-3">--</p>
            <button
              onClick={handleAddEdit}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add today's sleep
            </button>
            <p className="text-xs text-purple-600 font-medium">
              {getEncouragement(null)}
            </p>
          </>
        )}
      </div>

      {/* Modals */}
      <SleepModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleDataChange}
        initialData={todaySleep}
        selectedDate={today}
      />

      <SleepLog
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        onDataChange={handleDataChange}
      />
    </>
  );
};

export default SleepMetricCard;