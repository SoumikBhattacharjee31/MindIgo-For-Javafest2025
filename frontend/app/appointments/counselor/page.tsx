"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import {
  appointmentServiceApi,
  Appointment,
  Availability,
  CounselorSettings,
  DateSpecificAvailability,
  UpdateDateSpecificAvailability,
} from "@/app/appointments/api";
import AppointmentCard from "@/app/appointments/components/AppointmentCard";

type TabType = "dashboard" | "appointments" | "availability" | "settings";

// Utility function to format time as HH:mm:ss
const formatTimeForApi = (time: string): string => {
  if (!time) return "00:00:00";
  const parts = time.split(":");
  if (parts.length === 2) return `${time}:00`;
  return time;
};

const CounselorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [dateSpecificAvailability, setDateSpecificAvailability] = useState<
    DateSpecificAvailability[]
  >([]);
  const [settings, setSettings] = useState<CounselorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Form states for availability
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "17:00",
    slotDurationMinutes: 60,
  });
  const [newDateSpecificAvailability, setNewDateSpecificAvailability] =
    useState({
      specificDate: dayjs().format("YYYY-MM-DD"),
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 60,
      type: "AVAILABLE",
      reason: "",
    });

  // Form state for settings
  const [settingsForm, setSettingsForm] = useState({
    maxBookingDays: 30,
    defaultSlotDurationMinutes: 60,
    autoAcceptAppointments: false,
    requireApproval: true,
    bufferTimeMinutes: 15,
  });

  // Statistics
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingApproval: 0,
    todayAppointments: 0,
    completedThisMonth: 0,
    totalClients: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilter, searchTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchAvailability(),
        fetchDateSpecificAvailability(),
        fetchSettings(),
      ]);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentServiceApi.getMyAppointments();
      if (response.data.success) {
        const appointmentData = response.data.data || [];
        setAppointments(appointmentData);
        calculateStats(appointmentData);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      throw error;
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await appointmentServiceApi.getMyAvailability();
      if (response.data.success) {
        setAvailability(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  };

  const fetchDateSpecificAvailability = async () => {
    try {
      const response =
        await appointmentServiceApi.getMyDateSpecificAvailability();
      if (response.data.success) {
        setDateSpecificAvailability(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch date-specific availability:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await appointmentServiceApi.getCounselorSettings();
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
        setSettingsForm({
          maxBookingDays: response.data.data.maxBookingDays || 30,
          defaultSlotDurationMinutes:
            response.data.data.defaultSlotDurationMinutes || 60,
          autoAcceptAppointments:
            response.data.data.autoAcceptAppointments || false,
          requireApproval: response.data.data.requireApproval || true,
          bufferTimeMinutes: response.data.data.bufferTimeMinutes || 15,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const calculateStats = (appointmentData: Appointment[]) => {
    const now = dayjs();
    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");
    const todayStart = now.startOf("day");
    const todayEnd = now.endOf("day");

    const uniqueClients = new Set(appointmentData.map((apt) => apt.clientEmail))
      .size;

    const stats = {
      totalAppointments: appointmentData.length,
      pendingApproval: appointmentData.filter((apt) => apt.status === "PENDING")
        .length,
      todayAppointments: appointmentData.filter((apt) => {
        const appointmentDate = dayjs(apt.startTime);
        return (
          appointmentDate.isAfter(todayStart) &&
          appointmentDate.isBefore(todayEnd) &&
          (apt.status === "CONFIRMED" || apt.status === "PENDING")
        );
      }).length,
      completedThisMonth: appointmentData.filter(
        (apt) =>
          apt.status === "COMPLETED" &&
          dayjs(apt.startTime).isBetween(startOfMonth, endOfMonth, null, "[]")
      ).length,
      totalClients: uniqueClients,
    };
    setStats(stats);
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (activeFilter !== "all") {
      if (activeFilter === "today") {
        filtered = filtered.filter((apt) =>
          dayjs(apt.startTime).isSame(dayjs(), "day")
        );
      } else if (activeFilter === "upcoming") {
        filtered = filtered.filter(
          (apt) =>
            dayjs(apt.startTime).isAfter(dayjs()) &&
            ["CONFIRMED", "PENDING"].includes(apt.status)
        );
      } else {
        filtered = filtered.filter(
          (apt) => apt.status === activeFilter.toUpperCase()
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          (apt.clientName &&
            apt.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (apt.clientNotes &&
            apt.clientNotes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return dayjs(a.startTime).diff(dayjs(b.startTime));
    });

    setFilteredAppointments(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      toast.success("Dashboard refreshed");
    } catch (error) {
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (
    appointmentId: number,
    status: string,
    notes?: string
  ) => {
    try {
      await appointmentServiceApi.updateAppointmentStatus({
        appointmentId,
        status,
        notes: notes || "",
        rejectionReason: status === "REJECTED" ? notes || "" : "",
      });
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      fetchAppointments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update appointment"
      );
    }
  };

  const handleCreateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedAvailability = {
        ...newAvailability,
        startTime: formatTimeForApi(newAvailability.startTime),
        endTime: formatTimeForApi(newAvailability.endTime),
      };
      await appointmentServiceApi.createAvailability(formattedAvailability);
      toast.success("Availability created successfully");
      fetchAvailability();
      setNewAvailability({
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 60,
      });
    } catch (error) {
      toast.error("Failed to create availability");
    }
  };

  const handleUpdateAvailability = async (
    availabilityId: number,
    updates: Partial<Availability>
  ) => {
    try {
      const formattedUpdates = {
        ...updates,
        startTime: updates.startTime
          ? formatTimeForApi(updates.startTime)
          : undefined,
        endTime: updates.endTime
          ? formatTimeForApi(updates.endTime)
          : undefined,
      };
      await appointmentServiceApi.updateAvailability(
        availabilityId,
        formattedUpdates
      );
      toast.success("Availability updated successfully");
      fetchAvailability();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleDeleteAvailability = async (availabilityId: number) => {
    if (confirm("Are you sure you want to delete this availability?")) {
      try {
        await appointmentServiceApi.deleteAvailability(availabilityId);
        toast.success("Availability deleted successfully");
        fetchAvailability();
      } catch (error) {
        toast.error("Failed to delete availability");
      }
    }
  };

  const handleToggleAvailability = async (availabilityId: number) => {
    try {
      await appointmentServiceApi.toggleAvailability(availabilityId);
      toast.success("Availability status toggled");
      fetchAvailability();
    } catch (error) {
      toast.error("Failed to toggle availability");
    }
  };

  const handleCreateDateSpecificAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        newDateSpecificAvailability.type === "UNAVAILABLE" &&
        !newDateSpecificAvailability.reason.trim()
      ) {
        toast.error(
          "Reason is required when setting availability to Unavailable"
        );
        return;
      }
      const formattedAvailability = {
        specificDate: newDateSpecificAvailability.specificDate,
        startTime: formatTimeForApi(newDateSpecificAvailability.startTime),
        endTime: formatTimeForApi(newDateSpecificAvailability.endTime),
        slotDurationMinutes: newDateSpecificAvailability.slotDurationMinutes,
        type: newDateSpecificAvailability.type,
        reason: newDateSpecificAvailability.reason,
      };
      await appointmentServiceApi.createDateSpecificAvailability(
        formattedAvailability
      );
      toast.success("Date-specific availability created successfully");
      fetchDateSpecificAvailability();
      setNewDateSpecificAvailability({
        specificDate: dayjs().format("YYYY-MM-DD"),
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 60,
        type: "AVAILABLE",
        reason: "",
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create date-specific availability"
      );
    }
  };

  const handleUpdateDateSpecificAvailability = async (
    availabilityId: number,
    updates: Partial<UpdateDateSpecificAvailability>
  ) => {
    try {
      if (
        updates.type === "UNAVAILABLE" &&
        (!updates.reason || !updates.reason.trim())
      ) {
        toast.error(
          "Reason is required when setting availability to Unavailable"
        );
        return;
      }
      const formattedUpdates = {
        ...updates,
        specificDate: updates.specificDate ? updates.specificDate : undefined,
        startTime: updates.startTime
          ? formatTimeForApi(updates.startTime)
          : undefined,
        endTime: updates.endTime
          ? formatTimeForApi(updates.endTime)
          : undefined,
        type: updates.type,
        reason: updates.reason,
      };
      await appointmentServiceApi.updateDateSpecificAvailability(
        availabilityId,
        formattedUpdates
      );
      toast.success("Date-specific availability updated successfully");
      fetchDateSpecificAvailability();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update date-specific availability"
      );
    }
  };

  const handleDeleteDateSpecificAvailability = async (
    availabilityId: number
  ) => {
    if (
      confirm(
        "Are you sure you want to delete this date-specific availability?"
      )
    ) {
      try {
        await appointmentServiceApi.deleteDateSpecificAvailability(
          availabilityId
        );
        toast.success("Date-specific availability deleted successfully");
        fetchDateSpecificAvailability();
      } catch (error) {
        toast.error("Failed to delete date-specific availability");
      }
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentServiceApi.updateCounselorSettings(settingsForm);
      toast.success("Settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    onClick,
  }: any) => (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Icon className="w-5 h-5 mr-2 opacity-80" />
            <p className="text-white/80 text-sm font-medium">{title}</p>
          </div>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tab, label, icon: Icon, count }: any) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        activeTab === tab
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === tab
              ? "bg-white/20 text-white"
              : "bg-red-100 text-red-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const DashboardOverview = () => {
    const getTodayAppointments = () => {
      const today = dayjs();
      return appointments
        .filter(
          (a) =>
            dayjs(a.startTime).isSame(today, "day") &&
            (a.status === "CONFIRMED" || a.status === "PENDING")
        )
        .sort((a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix());
    };

    const getPendingAppointments = () => {
      return appointments
        .filter((a) => a.status === "PENDING")
        .sort((a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix());
    };

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="from-blue-500 to-blue-600"
            subtitle="Active clients"
          />
          <StatCard
            title="Pending Approval"
            value={stats.pendingApproval}
            icon={AlertCircle}
            color="from-amber-500 to-amber-600"
            subtitle="Needs review"
            onClick={() => {
              setActiveTab("appointments");
              setActiveFilter("pending");
            }}
          />
          <StatCard
            title="Today's Sessions"
            value={stats.todayAppointments}
            icon={Calendar}
            color="from-green-500 to-green-600"
            subtitle={dayjs().format("MMM D, YYYY")}
            onClick={() => {
              setActiveTab("appointments");
              setActiveFilter("today");
            }}
          />
          <StatCard
            title="This Month"
            value={stats.completedThisMonth}
            icon={CheckCircle}
            color="from-purple-500 to-purple-600"
            subtitle="Completed sessions"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Today's Schedule
              </h3>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {getTodayAppointments().length} sessions
              </span>
            </div>
            <div className="space-y-4">
              {getTodayAppointments().length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No appointments scheduled for today
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Enjoy your day off!
                  </p>
                </div>
              ) : (
                getTodayAppointments().map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole="COUNSELOR"
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Pending Approvals
              </h3>
              <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                {getPendingAppointments().length} pending
              </span>
            </div>
            <div className="space-y-4">
              {getPendingAppointments().length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                </div>
              ) : (
                getPendingAppointments().map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole="COUNSELOR"
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AvailabilityTab = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Manage Availability
      </h3>

      {/* Weekly Availability */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Availability
        </h4>
        <form
          onSubmit={handleCreateAvailability}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day of Week
            </label>
            <select
              value={newAvailability.dayOfWeek}
              onChange={(e) =>
                setNewAvailability({
                  ...newAvailability,
                  dayOfWeek: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={newAvailability.startTime}
              onChange={(e) =>
                setNewAvailability({
                  ...newAvailability,
                  startTime: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={newAvailability.endTime}
              onChange={(e) =>
                setNewAvailability({
                  ...newAvailability,
                  endTime: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Duration (min)
            </label>
            <input
              type="number"
              value={newAvailability.slotDurationMinutes}
              onChange={(e) =>
                setNewAvailability({
                  ...newAvailability,
                  slotDurationMinutes: parseInt(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="15"
              step="15"
              required
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" /> <span>Add Weekly Rule</span>
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {availability.map((avail) => (
            <div
              key={avail.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">{avail.dayOfWeek}</p>
                <p className="text-sm text-gray-600">
                  {dayjs(avail.startTime, "HH:mm:ss").format("h:mm A")} -{" "}
                  {dayjs(avail.endTime, "HH:mm:ss").format("h:mm A")} (
                  {avail.slotDurationMinutes} min slots)
                </p>
                <p
                  className={`text-sm font-semibold ${
                    avail.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {avail.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleAvailability(avail.id)}
                  title={avail.isActive ? "Deactivate" : "Activate"}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  {avail.isActive ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </button>
                <button
                  onClick={() => {
                    const newStartTime = prompt(
                      "Enter new start time (HH:mm):",
                      avail.startTime.split(":").slice(0, 2).join(":")
                    );
                    const newEndTime = prompt(
                      "Enter new end time (HH:mm):",
                      avail.endTime.split(":").slice(0, 2).join(":")
                    );
                    if (newStartTime && newEndTime) {
                      handleUpdateAvailability(avail.id, {
                        startTime: newStartTime,
                        endTime: newEndTime,
                      });
                    }
                  }}
                  title="Edit Time"
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteAvailability(avail.id)}
                  title="Delete"
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date-Specific Availability */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Date-Specific Exceptions
        </h4>
        <form
          onSubmit={handleCreateDateSpecificAvailability}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={newDateSpecificAvailability.specificDate}
              onChange={(e) =>
                setNewDateSpecificAvailability({
                  ...newDateSpecificAvailability,
                  specificDate: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={dayjs().format("YYYY-MM-DD")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={newDateSpecificAvailability.startTime}
              onChange={(e) =>
                setNewDateSpecificAvailability({
                  ...newDateSpecificAvailability,
                  startTime: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={newDateSpecificAvailability.endTime}
              onChange={(e) =>
                setNewDateSpecificAvailability({
                  ...newDateSpecificAvailability,
                  endTime: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Duration
            </label>
            <input
              type="number"
              value={newDateSpecificAvailability.slotDurationMinutes}
              onChange={(e) =>
                setNewDateSpecificAvailability({
                  ...newDateSpecificAvailability,
                  slotDurationMinutes: parseInt(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="15"
              step="15"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={newDateSpecificAvailability.type}
              onChange={(e) =>
                setNewDateSpecificAvailability({
                  ...newDateSpecificAvailability,
                  type: e.target.value,
                  reason:
                    e.target.value === "UNAVAILABLE"
                      ? newDateSpecificAvailability.reason
                      : "",
                })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          {newDateSpecificAvailability.type === "UNAVAILABLE" && (
            <div className="lg:col-span-5 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Unavailability
              </label>
              <input
                type="text"
                value={newDateSpecificAvailability.reason}
                onChange={(e) =>
                  setNewDateSpecificAvailability({
                    ...newDateSpecificAvailability,
                    reason: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Doctor's Appointment"
                required
              />
            </div>
          )}
          <div className="lg:col-span-5 md:col-span-2">
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" /> <span>Add Exception</span>
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {dateSpecificAvailability.map((avail) => (
            <div
              key={avail.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {dayjs(avail.specificDate).format("MMMM D, YYYY")}
                </p>
                <p className="text-sm text-gray-600">
                  {dayjs(avail.startTime, "HH:mm:ss").format("h:mm A")} -{" "}
                  {dayjs(avail.endTime, "HH:mm:ss").format("h:mm A")} (
                  {avail.slotDurationMinutes} min slots)
                </p>
                <p
                  className={`text-sm font-semibold ${
                    avail.type === "AVAILABLE"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {avail.type === "AVAILABLE"
                    ? "Available"
                    : `Unavailable${avail.reason ? `: ${avail.reason}` : ""}`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newType: "AVAILABLE" | "UNAVAILABLE" =
                      avail.type === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
                    const reason =
                      newType === "UNAVAILABLE"
                        ? prompt("Enter reason for unavailability:")
                        : null;

                    if (newType === "UNAVAILABLE" && reason === null) {
                      return; // User cancelled prompt
                    }

                    if (
                      newType === "UNAVAILABLE" &&
                      (!reason || !reason.trim())
                    ) {
                      toast.error(
                        "Reason is required when setting availability to Unavailable"
                      );
                      return;
                    }

                    const updatePayload = {
                      specificDate: avail.specificDate,
                      startTime: avail.startTime,
                      endTime: avail.endTime,
                      slotDurationMinutes: avail.slotDurationMinutes,
                      type: newType,
                      reason: reason,
                    };

                    handleUpdateDateSpecificAvailability(
                      avail.id,
                      updatePayload
                    );
                  }}
                  title={
                    avail.type === "AVAILABLE"
                      ? "Set to Unavailable"
                      : "Set to Available"
                  }
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  {avail.type === "AVAILABLE" ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </button>
                <button
                  onClick={() => {
                    const newStartTime = prompt(
                      "Enter new start time (HH:mm):",
                      avail.startTime.split(":").slice(0, 2).join(":")
                    );

                    if (newStartTime) {
                      const updatePayload = {
                        specificDate: avail.specificDate,
                        startTime: newStartTime,
                        endTime: avail.endTime,
                        slotDurationMinutes: avail.slotDurationMinutes,
                        type: avail.type,
                        reason: avail.reason,
                      };

                      handleUpdateDateSpecificAvailability(
                        avail.id,
                        updatePayload
                      );
                    }
                  }}
                  title="Edit Start Time"
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteDateSpecificAvailability(avail.id)}
                  title="Delete"
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Counselor Settings
      </h3>
      <form
        onSubmit={handleUpdateSettings}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Booking Days
          </label>
          <input
            type="number"
            value={settingsForm.maxBookingDays}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                maxBookingDays: parseInt(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="365"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Slot Duration (min)
          </label>
          <input
            type="number"
            value={settingsForm.defaultSlotDurationMinutes}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                defaultSlotDurationMinutes: parseInt(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="15"
            step="15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buffer Time (min)
          </label>
          <input
            type="number"
            value={settingsForm.bufferTimeMinutes}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                bufferTimeMinutes: parseInt(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="5"
          />
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settingsForm.autoAcceptAppointments}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                autoAcceptAppointments: e.target.checked,
              })
            }
            id="autoAccept"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="autoAccept"
            className="text-sm font-medium text-gray-700"
          >
            Auto-Accept Appointments
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settingsForm.requireApproval}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                requireApproval: e.target.checked,
              })
            }
            id="requireApproval"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="requireApproval"
            className="text-sm font-medium text-gray-700"
          >
            Require Approval
          </label>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Loading your dashboard...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Preparing your counselor workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  Counselor Dashboard
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Manage your practice and help clients succeed
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 border border-gray-200"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              <TabButton tab="dashboard" label="Dashboard" icon={Calendar} />
              <TabButton
                tab="appointments"
                label="Appointments"
                icon={Calendar}
                count={stats.pendingApproval}
              />
              <TabButton tab="availability" label="Availability" icon={Clock} />
              <TabButton tab="settings" label="Settings" icon={Settings} />
            </div>
          </div>
        </div>

        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Appointments
            </h3>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                    activeFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("today")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                    activeFilter === "today"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setActiveFilter("upcoming")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                    activeFilter === "upcoming"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                    activeFilter === "pending"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Pending
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                />
              </div>
            </div>
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No appointments found for this filter
                  </p>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole="COUNSELOR"
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === "availability" && <AvailabilityTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
};

export default CounselorDashboardPage;
