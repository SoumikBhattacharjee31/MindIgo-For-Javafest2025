"use client";
import React from "react";
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  MapPin,
  Star,
} from "lucide-react";
import dayjs from "dayjs";
import { Appointment } from "@/app/api/appointmentService";
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: "CLIENT" | "COUNSELOR";
  onStatusUpdate?: (
    appointmentId: number,
    status: string,
    notes?: string
  ) => void;
  onCancel?: (appointmentId: number) => void;
  onReschedule?: (appointmentId: number) => void;
  showActions?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onStatusUpdate,
  onCancel,
  onReschedule,
  showActions = true,
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-800",
        icon: Clock,
      },
      CONFIRMED: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        badge: "bg-green-100 text-green-800",
        icon: Calendar,
      },
      REJECTED: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        badge: "bg-red-100 text-red-800",
        icon: Calendar,
      },
      CANCELLED: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        badge: "bg-gray-100 text-gray-800",
        icon: Calendar,
      },
      COMPLETED: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        badge: "bg-blue-100 text-blue-800",
        icon: Calendar,
      },
      RESCHEDULED: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        badge: "bg-purple-100 text-purple-800",
        icon: Clock,
      },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  const isUpcoming = dayjs(appointment.startTime).isAfter(dayjs());
  const isPast = dayjs(appointment.endTime).isBefore(dayjs());
  const isToday = dayjs(appointment.startTime).isSame(dayjs(), "day");

  return (
    <div
      className={`rounded-xl shadow-sm border-2 ${statusConfig.border} ${statusConfig.bg} overflow-hidden transition-all hover:shadow-lg group`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              {isToday && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {userRole === "CLIENT"
                  ? appointment.counselorName
                  : appointment.clientName || appointment.clientEmail}
              </h3>
              <p className="text-gray-600 text-sm">
                {userRole === "CLIENT"
                  ? appointment.counselorEmail
                  : appointment.clientEmail}
              </p>
              {appointment.counselorName && (
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Professional Therapist
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.badge} flex items-center`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {appointment.status}
            </span>
            {isToday && isUpcoming && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Today
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">
                {dayjs(appointment.startTime).format("dddd, MMMM D, YYYY")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-medium text-gray-900">
                {dayjs(appointment.startTime).format("h:mm A")} -{" "}
                {dayjs(appointment.endTime).format("h:mm A")}
              </p>
              <p className="text-xs text-gray-500">
                {dayjs
                  .duration(
                    dayjs(appointment.endTime).diff(
                      dayjs(appointment.startTime)
                    )
                  )
                  .asMinutes()}{" "}
                minutes
              </p>
            </div>
          </div>
        </div>

        {(appointment.clientNotes ||
          appointment.counselorNotes ||
          appointment.rejectionReason) && (
          <div className="space-y-3">
            {appointment.clientNotes && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Client Notes
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {appointment.clientNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {appointment.counselorNotes && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Counselor Notes
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {appointment.counselorNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {appointment.rejectionReason && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-start space-x-2">
                  <MessageCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {appointment.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {userRole === "COUNSELOR" && appointment.status === "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      onStatusUpdate?.(appointment.id, "CONFIRMED")
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt(
                        "Please provide a rejection reason:"
                      );
                      if (reason) {
                        onStatusUpdate?.(appointment.id, "REJECTED", reason);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}

              {(appointment.status === "PENDING" ||
                appointment.status === "CONFIRMED") &&
                isUpcoming && (
                  <>
                    <button
                      onClick={() => onCancel?.(appointment.id)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    {appointment.status === "CONFIRMED" && (
                      <button
                        onClick={() => onReschedule?.(appointment.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Reschedule
                      </button>
                    )}
                  </>
                )}

              {appointment.status === "CONFIRMED" && isToday && (
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Join Session</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
