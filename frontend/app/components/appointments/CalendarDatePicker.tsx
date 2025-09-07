"use client";
import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import dayjs from "dayjs";

interface CalendarDatePickerProps {
  availableDates: string[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  availableDates,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDate = startOfMonth.startOf("week");
  const endDate = endOfMonth.endOf("week");

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = day.add(1, "day");
  }

  const isDateAvailable = (date: dayjs.Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");
    return availableDates.includes(dateStr);
  };

  const isDateDisabled = (date: dayjs.Dayjs) => {
    if (minDate && date.isBefore(dayjs(minDate))) return true;
    if (maxDate && date.isAfter(dayjs(maxDate))) return true;
    return false;
  };

  const isDateSelected = (date: dayjs.Dayjs) => {
    return date.format("YYYY-MM-DD") === selectedDate;
  };

  const isToday = (date: dayjs.Dayjs) => {
    return date.isSame(dayjs(), "day");
  };

  const getDateClassName = (date: dayjs.Dayjs) => {
    let className =
      "h-10 w-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all hover:bg-blue-50 ";

    if (!date.isSame(currentMonth, "month")) {
      className += "text-gray-300 ";
    } else if (isDateDisabled(date) || !isDateAvailable(date)) {
      className += "text-gray-300 cursor-not-allowed hover:bg-transparent ";
    } else if (isDateSelected(date)) {
      className += "bg-blue-600 text-white hover:bg-blue-700 shadow-lg ";
    } else if (isToday(date)) {
      className += "bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 ";
    } else if (isDateAvailable(date)) {
      className += "text-gray-900 hover:bg-blue-50 font-medium ";
    }

    return className;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
            className="p-2 hover:bg-white/70 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.format("MMMM YYYY")}
            </h2>
          </div>

          <button
            onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
            className="p-2 hover:bg-white/70 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <button
              key={day.format("YYYY-MM-DD")}
              onClick={() => {
                if (isDateAvailable(day) && !isDateDisabled(day)) {
                  onDateSelect(day.format("YYYY-MM-DD"));
                }
              }}
              className={getDateClassName(day)}
              disabled={isDateDisabled(day) || !isDateAvailable(day)}
            >
              {day.format("D")}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Available</span>
              </div>
            </div>
            <span>{availableDates.length} available dates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDatePicker;
