"use client";
import React from "react";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";
import { TimeSlot } from "@/app/api/appointmentService";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedDate: string;
  loading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSlotSelect,
  selectedDate,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => slot.isAvailable);
  const unavailableSlots = slots.filter((slot) => !slot.isAvailable);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Available Time Slots
        </h3>
        <p className="text-sm text-gray-600">
          {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
        </p>
      </div>

      <div className="p-6">
        {availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Available Slots
            </h3>
            <p className="text-gray-500">
              There are no available time slots for this date. Please choose
              another date.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSlots.map((slot, index) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const duration =
                  slot.duration ||
                  dayjs
                    .duration(dayjs(slot.endTime).diff(dayjs(slot.startTime)))
                    .asMinutes();

                return (
                  <button
                    key={index}
                    onClick={() => onSlotSelect(slot)}
                    className={`
                      relative p-4 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="font-semibold">
                        {dayjs(slot.startTime).format("h:mm A")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {duration} min
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {unavailableSlots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Unavailable Slots
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {unavailableSlots.slice(0, 6).map((slot, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="line-through">
                          {dayjs(slot.startTime).format("h:mm A")}
                        </div>
                        <div className="text-xs mt-1">Booked</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                  <span>Unavailable</span>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {availableSlots.length} available
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
