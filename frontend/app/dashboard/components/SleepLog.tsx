"use client";
import React, { useState, useEffect } from "react";
import { Moon, Sun, Clock, X, Trash2, Edit3, Calendar } from "lucide-react";
import {
  sleepApi,
  SleepResponse,
  formatDateForApi,
  formatTimeForDisplay,
  calculateSleepDuration,
} from "@/app/dashboard/sleep/sleepApi";
import { successToast, errorToast } from "@/util/toastHelper";
import SleepModal from "./SleepModal";

interface SleepLogProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChange: () => void;
}

const SleepLog: React.FC<SleepLogProps> = ({
  isOpen,
  onClose,
  onDataChange,
}) => {
  const [sleepData, setSleepData] = useState<SleepResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SleepResponse | null>(
    null
  );

  const loadSleepData = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = formatDateForApi(new Date());
      const data = await sleepApi.getLastNDaysSleep(7, today);
      setSleepData(data);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load sleep data";
      setError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSleepData();
    }
  }, [isOpen]);

  const handleDelete = async (date: string) => {
    if (!window.confirm("Are you sure you want to delete this sleep record?")) {
      return;
    }

    try {
      setDeleteLoading(date);
      await sleepApi.deleteSleep(date);
      successToast("Sleep record deleted successfully!");
      await loadSleepData();
      onDataChange();
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete sleep record";
      errorToast(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (entry: SleepResponse) => {
    setSelectedEntry(entry);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    setEditModalOpen(false);
    setSelectedEntry(null);
    await loadSleepData();
    onDataChange();
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === formatDateForApi(today)) {
      return "Today";
    } else if (dateString === formatDateForApi(yesterday)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
  };

  const getDateDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getSleepQualityColor = (duration: string): string => {
    const hours = parseInt(duration.split("h")[0]);
    if (hours >= 7 && hours <= 9) return "text-green-600 bg-green-50";
    if (hours >= 6 && hours <= 10) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getSleepQualityText = (duration: string): string => {
    const hours = parseInt(duration.split("h")[0]);
    if (hours >= 7 && hours <= 9) return "Good";
    if (hours >= 6 && hours <= 10) return "Fair";
    return "Poor";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Sleep Log
                </h2>
                <p className="text-sm text-gray-600">
                  Last 7 days of sleep records
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading sleep data...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-800 font-medium">Error</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={loadSleepData}
                  className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {sleepData.length === 0 ? (
                  <div className="text-center py-12">
                    <Moon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No sleep records found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start tracking your sleep to see your patterns here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sleepData
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((entry) => {
                        const duration = calculateSleepDuration(
                          entry.sleepTime,
                          entry.wakeTime
                        );
                        const qualityColor = getSleepQualityColor(duration);
                        const qualityText = getSleepQualityText(duration);

                        return (
                          <div
                            key={entry.date}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="font-medium text-gray-900">
                                    {getDayName(entry.date)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {getDateDisplay(entry.date)}
                                  </div>
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${qualityColor}`}
                                  >
                                    {qualityText}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Moon className="w-4 h-4 text-blue-500" />
                                    <div>
                                      <div className="text-gray-500">Sleep</div>
                                      <div className="font-medium">
                                        {formatTimeForDisplay(entry.sleepTime)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-yellow-500" />
                                    <div>
                                      <div className="text-gray-500">Wake</div>
                                      <div className="font-medium">
                                        {formatTimeForDisplay(entry.wakeTime)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-green-500" />
                                    <div>
                                      <div className="text-gray-500">
                                        Duration
                                      </div>
                                      <div className="font-medium text-green-600">
                                        {duration}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.date)}
                                  disabled={deleteLoading === entry.date}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deleteLoading === entry.date ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <SleepModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEntry(null);
        }}
        onSave={handleEditSave}
        initialData={selectedEntry}
        selectedDate={selectedEntry?.date || ""}
      />
    </>
  );
};

export default SleepLog;
