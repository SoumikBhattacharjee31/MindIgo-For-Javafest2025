// app/appointments/counselor/page.tsx
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
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  MessageSquare,
  Bell,
  RefreshCw,
  ChevronDown,
  Loader2,
  Star,
  Award,
  Target,
  DollarSign,
  Activity,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

import {
  appointmentServiceApi,
  Appointment,
  Availability,
  CounselorSettings,
  DateSpecificAvailability,
} from "@/app/api/appointmentService";
import AppointmentCard from "@/app/components/appointments/AppointmentCard";

type TabType =
  | "dashboard"
  | "appointments"
  | "availability"
  | "settings"
  | "analytics";

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

  // Statistics
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingApproval: 0,
    todayAppointments: 0,
    completedThisMonth: 0,
    totalClients: 0,
    averageRating: 4.8,
    responseTime: 2.3,
    completionRate: 98,
    weeklyEarnings: 1240,
    monthlyGrowth: 15,
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
      if (response.data.success) {
        setSettings(response.data.data);
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
      averageRating: 4.8, // This would come from API
      responseTime: 2.3, // This would come from API
      completionRate:
        appointmentData.length > 0
          ? Math.round(
              (appointmentData.filter((apt) => apt.status === "COMPLETED")
                .length /
                appointmentData.length) *
                100
            )
          : 0,
      weeklyEarnings: 1240, // This would come from API
      monthlyGrowth: 15, // This would come from API
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

    // Sort: pending first, then by date
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

  // Enhanced Statistics Card Component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    trend,
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
      {trend && (
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-sm flex items-center ${
              trend.positive ? "text-green-200" : "text-red-200"
            }`}
          >
            {trend.positive ? "↗" : "↘"} {trend.value}%
          </span>
          <span className="text-white/60 text-xs">{trend.period}</span>
        </div>
      )}
    </div>
  );

  // Tab Navigation Component
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

  // Dashboard Overview Component
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

    const getUpcomingAppointments = () => {
      const now = dayjs();
      return appointments
        .filter(
          (a) =>
            dayjs(a.startTime).isAfter(now) &&
            (a.status === "CONFIRMED" || a.status === "PENDING")
        )
        .slice(0, 5);
    };

    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="from-blue-500 to-blue-600"
            subtitle="Active clients"
            trend={{
              positive: true,
              value: stats.monthlyGrowth,
              period: "this month",
            }}
            onClick={() => setActiveTab("appointments")}
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
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={Target}
            color="from-purple-500 to-purple-600"
            subtitle="All time average"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Metrics
              </h3>
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {stats.averageRating}/5.0
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-semibold">{stats.responseTime}h avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold">
                  {stats.completedThisMonth} sessions
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab("availability")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Manage Availability</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Update Settings</span>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">View Analytics</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {appointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      apt.status === "PENDING"
                        ? "bg-amber-400"
                        : apt.status === "CONFIRMED"
                        ? "bg-green-400"
                        : apt.status === "COMPLETED"
                        ? "bg-blue-400"
                        : "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {apt.clientName || apt.clientEmail}
                    </p>
                    <p className="text-xs text-gray-500">
                      {dayjs(apt.startTime).format("MMM D, h:mm A")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      apt.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : apt.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule & Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
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
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {appointment.clientName || appointment.clientEmail}
                      </p>
                      <p className="text-sm text-gray-600">
                        {dayjs(appointment.startTime).format("h:mm A")} -{" "}
                        {dayjs(appointment.endTime).format("h:mm A")}
                      </p>
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                          appointment.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Approvals */}
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
                getPendingAppointments()
                  .slice(0, 4)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {appointment.clientName || appointment.clientEmail}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dayjs(appointment.startTime).format("MMM D, h:mm A")}
                        </p>
                        {appointment.clientNotes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            "{appointment.clientNotes}"
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "CONFIRMED")
                          }
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt(
                              "Please provide a rejection reason:"
                            );
                            if (reason) {
                              handleStatusUpdate(
                                appointment.id,
                                "REJECTED",
                                reason
                              );
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Counselor Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
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

              <button className="relative flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 border border-gray-200">
                <Bell className="w-5 h-5" />
                <span className="hidden sm:inline">Notifications</span>
                {stats.pendingApproval > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {stats.pendingApproval}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              <TabButton tab="dashboard" label="Dashboard" icon={BarChart3} />
              <TabButton
                tab="appointments"
                label="Appointments"
                icon={Calendar}
                count={stats.pendingApproval}
              />
              <TabButton tab="availability" label="Availability" icon={Clock} />
              <TabButton tab="settings" label="Settings" icon={Settings} />
              <TabButton tab="analytics" label="Analytics" icon={TrendingUp} />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "availability" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Availability Management
            </h3>
            <p className="text-gray-600">
              Availability management interface would go here
            </p>
          </div>
        )}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Counselor Settings
            </h3>
            <p className="text-gray-600">
              Settings management interface would go here
            </p>
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analytics & Reports
            </h3>
            <p className="text-gray-600">Analytics dashboard would go here</p>
          </div>
        )}
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
