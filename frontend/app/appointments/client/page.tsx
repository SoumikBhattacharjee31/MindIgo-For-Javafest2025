"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import {
  appointmentServiceApi,
  Appointment,
  Counselor,
} from "@/app/api/appointmentService";
import AppointmentCard from "@/app/components/appointments/AppointmentCard";
import BookingModal from "@/app/components/appointments/BookingModal";

const ClientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    pending: 0,
    thisMonth: 0,
    nextWeek: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilter, searchTerm, dateRange]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAppointments(), fetchCounselors()]);
    } catch (error) {
      toast.error("Failed to load data");
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

  const fetchCounselors = async () => {
    try {
      const response = await appointmentServiceApi.getApprovedCounselors();
      if (response.data.success) {
        setCounselors(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch counselors:", error);
      throw error;
    }
  };

  const calculateStats = (appointmentData: Appointment[]) => {
    const now = dayjs();
    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");
    const nextWeekEnd = now.add(1, "week").endOf("week");

    const stats = {
      total: appointmentData.length,
      upcoming: appointmentData.filter(
        (apt) =>
          ["CONFIRMED", "PENDING"].includes(apt.status) &&
          dayjs(apt.startTime).isAfter(now)
      ).length,
      completed: appointmentData.filter((apt) => apt.status === "COMPLETED")
        .length,
      pending: appointmentData.filter((apt) => apt.status === "PENDING").length,
      thisMonth: appointmentData.filter((apt) =>
        dayjs(apt.startTime).isBetween(startOfMonth, endOfMonth, null, "[]")
      ).length,
      nextWeek: appointmentData.filter(
        (apt) =>
          ["CONFIRMED", "PENDING"].includes(apt.status) &&
          dayjs(apt.startTime).isBetween(now, nextWeekEnd, null, "[]")
      ).length,
    };
    setStats(stats);
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (activeFilter !== "all") {
      if (activeFilter === "upcoming") {
        filtered = filtered.filter(
          (apt) =>
            ["CONFIRMED", "PENDING"].includes(apt.status) &&
            dayjs(apt.startTime).isAfter(dayjs())
        );
      } else if (activeFilter === "past") {
        filtered = filtered.filter(
          (apt) =>
            dayjs(apt.endTime).isBefore(dayjs()) ||
            ["COMPLETED", "CANCELLED", "REJECTED"].includes(apt.status)
        );
      } else if (activeFilter === "today") {
        filtered = filtered.filter((apt) =>
          dayjs(apt.startTime).isSame(dayjs(), "day")
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
          apt.counselorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.counselorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.clientNotes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange !== "all") {
      const now = dayjs();
      if (dateRange === "week") {
        filtered = filtered.filter((apt) =>
          dayjs(apt.startTime).isSame(now, "week")
        );
      } else if (dateRange === "month") {
        filtered = filtered.filter((apt) =>
          dayjs(apt.startTime).isSame(now, "month")
        );
      } else if (dateRange === "quarter") {
        filtered = filtered.filter((apt) =>
          dayjs(apt.startTime).isSame(now, "quarter")
        );
      }
    }

    filtered.sort((a, b) => {
      const aTime = dayjs(a.startTime);
      const bTime = dayjs(b.startTime);
      const now = dayjs();

      const aIsUpcoming = aTime.isAfter(now);
      const bIsUpcoming = bTime.isAfter(now);

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      if (aIsUpcoming && bIsUpcoming) {
        return aTime.diff(now) - bTime.diff(now);
      } else {
        return bTime.diff(now) - aTime.diff(now);
      }
    });

    setFilteredAppointments(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAppointments();
      toast.success("Appointments refreshed");
    } catch (error) {
      toast.error("Failed to refresh appointments");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    const reason = prompt(
      "Please provide a reason for cancellation (optional):"
    );
    if (reason === null) return;

    try {
      await appointmentServiceApi.cancelAppointment(
        appointmentId,
        reason || undefined
      );
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment"
      );
    }
  };

  const handleRescheduleAppointment = (appointmentId: number) => {
    toast.info("Reschedule feature will be available soon");
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: any) => (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const FilterButton = ({ filter, label, count, color = "blue" }: any) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        activeFilter === filter
          ? `bg-${color}-600 text-white shadow-lg shadow-${color}-600/25`
          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeFilter === filter
              ? "bg-white/20 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Loading your appointments...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  My Appointments
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your mental health journey
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

              <button
                onClick={() => setShowBookingModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sessions"
            value={stats.total}
            icon={Calendar}
            color="from-blue-500 to-blue-600"
            subtitle={`${stats.thisMonth} this month`}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming}
            icon={Clock}
            color="from-green-500 to-green-600"
            subtitle={`${stats.nextWeek} next week`}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="from-purple-500 to-purple-600"
            subtitle="Sessions finished"
          />
          <StatCard
            title="Pending Approval"
            value={stats.pending}
            icon={AlertCircle}
            color="from-amber-500 to-amber-600"
            subtitle="Awaiting confirmation"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-wrap gap-3">
              <FilterButton
                filter="all"
                label="All"
                count={appointments.length}
              />
              <FilterButton
                filter="upcoming"
                label="Upcoming"
                count={stats.upcoming}
                color="green"
              />
              <FilterButton filter="today" label="Today" color="blue" />
              <FilterButton
                filter="pending"
                label="Pending"
                count={stats.pending}
                color="amber"
              />
              <FilterButton
                filter="completed"
                label="Completed"
                count={stats.completed}
                color="purple"
              />
              <FilterButton filter="past" label="Past" color="gray" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all duration-200"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">More Filters</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div className="flex rounded-xl border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Counselor
                  </label>
                  <select className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    <option value="all">All Counselors</option>
                    {counselors.map((counselor) => (
                      <option key={counselor.id} value={counselor.id}>
                        {counselor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setActiveFilter("all");
                      setSearchTerm("");
                      setDateRange("all");
                      setShowFilters(false);
                    }}
                    className="w-full px-4 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeFilter === "all"
                  ? "No appointments yet"
                  : `No ${activeFilter} appointments`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {activeFilter === "all"
                  ? "Start your mental health journey by booking your first therapy session with our qualified counselors"
                  : `You don't have any ${activeFilter} appointments at the moment`}
              </p>
              {activeFilter === "all" && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Book Your First Session
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                  : "space-y-6"
              }
            >
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="CLIENT"
                  onCancel={handleCancelAppointment}
                  onReschedule={handleRescheduleAppointment}
                />
              ))}
            </div>
          )}
        </div>

        {appointments.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Continue Your Mental Health Journey
              </h3>
              <p className="text-blue-100 text-lg lg:text-xl mb-8 max-w-2xl mx-auto">
                Regular therapy sessions are key to achieving your mental health
                goals. Book your next appointment and keep building on your
                progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg"
                >
                  Schedule Next Session
                </button>
                <button className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
                  View All Counselors
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={fetchAppointments}
        counselors={counselors}
      />

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

export default ClientAppointmentsPage;