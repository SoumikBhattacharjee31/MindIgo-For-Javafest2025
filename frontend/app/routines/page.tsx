"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { RoutineResponse, CreateRoutineRequest } from "./types";
import { routineService } from "./api";
import RoutineList from "./components/RoutineList";
import RoutineForm from "./components/RoutineForm";
import RoutineDetail from "./components/RoutineDetail";
import PatientAssign from "./components/PatientAssign";
import { FaStethoscope, FaUser, FaCog, FaBell } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

type ViewMode = "list" | "create" | "edit" | "detail" | "assign";
type UserRole = "doctor" | "patient";

const Dashboard: React.FC = () => {
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [selectedRoutine, setSelectedRoutine] =
    useState<RoutineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("doctor"); // This should come from authentication
  const [currentDoctorId] = useState(1); // This should come from authentication
  const [currentPatientId] = useState(1); // This should come from authentication

  useEffect(() => {
    loadRoutines();
  }, [userRole]);

  const loadRoutines = async () => {
    setIsLoading(true);
    try {
      let data: RoutineResponse[];
      console.log(userRole);
      if (userRole === "doctor") {
        data = await routineService.getRoutinesByDoctor(currentDoctorId);
      } else {
        data = await routineService.getPatientRoutines(currentPatientId);
      }
      setRoutines(data);
    } catch (error) {
      toast.error("Failed to load routines");
      console.error("Error loading routines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoutine = async (routineData: CreateRoutineRequest) => {
    try {
      setIsLoading(true);
      const newRoutine = await routineService.createRoutine(routineData);
      setRoutines((prev) => [newRoutine, ...prev]);
      setCurrentView("list");
      toast.success("Routine created successfully!");
    } catch (error) {
      toast.error("Failed to create routine");
      console.error("Error creating routine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoutine = async (routineData: CreateRoutineRequest) => {
    if (!selectedRoutine) return;

    try {
      setIsLoading(true);
      const updatedRoutine = await routineService.updateRoutine(
        selectedRoutine.id,
        routineData,
        currentDoctorId
      );
      setRoutines((prev) =>
        prev.map((r) => (r.id === selectedRoutine.id ? updatedRoutine : r))
      );
      setCurrentView("list");
      setSelectedRoutine(null);
      toast.success("Routine updated successfully!");
    } catch (error) {
      toast.error("Failed to update routine");
      console.error("Error updating routine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoutine = async (routineId: number) => {
    try {
      setIsLoading(true);
      await routineService.deleteRoutine(routineId, currentDoctorId);
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
      if (selectedRoutine?.id === routineId) {
        setSelectedRoutine(null);
      }
      setCurrentView("list");
      toast.success("Routine deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete routine");
      console.error("Error deleting routine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRoutine = async (assignData: {
    patientId: number;
    routineId: number;
  }) => {
    try {
      setIsLoading(true);
      await routineService.assignRoutineToPatient(assignData);
      setCurrentView("list");
      setSelectedRoutine(null);
      toast.success("Routine assigned to patient successfully!");
    } catch (error) {
      toast.error("Failed to assign routine to patient");
      console.error("Error assigning routine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoutine = (routine: RoutineResponse) => {
    setSelectedRoutine(routine);
    setCurrentView("edit");
  };

  const handleViewRoutine = (routine: RoutineResponse) => {
    setSelectedRoutine(routine);
    setCurrentView("detail");
  };

  const handleAssignToPatient = (routine: RoutineResponse) => {
    setSelectedRoutine(routine);
    setCurrentView("assign");
  };

  const convertToCreateRequest = (
    routine: RoutineResponse
  ): CreateRoutineRequest => {
    return {
      name: routine.name,
      description: routine.description,
      doctorId: routine.doctorId,
      routineType: routine.routineType,
      activities: routine.activities.map((activity) => ({
        activityName: activity.activityName,
        activityType: activity.activityType,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        dayOfWeek: activity.dayOfWeek,
        instructions: activity.instructions,
      })),
    };
  };

  const renderNavbar = () => (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FaStethoscope className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                HealthRoutine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600">
              <FaBell className="h-5 w-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600">
              <FaCog className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <FaUser className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {userRole === "doctor" ? "Dr. Smith" : "John Doe"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "create":
        return (
          <RoutineForm
            mode="create"
            onSubmit={handleCreateRoutine}
            onCancel={() => setCurrentView("list")}
            isLoading={isLoading}
          />
        );

      case "edit":
        return selectedRoutine ? (
          <RoutineForm
            mode="edit"
            initialData={convertToCreateRequest(selectedRoutine)}
            onSubmit={handleUpdateRoutine}
            onCancel={() => setCurrentView("list")}
            isLoading={isLoading}
          />
        ) : null;

      case "detail":
        return selectedRoutine ? (
          <RoutineDetail
            routine={selectedRoutine}
            onEdit={
              userRole === "doctor"
                ? () => handleEditRoutine(selectedRoutine)
                : undefined
            }
            onDelete={
              userRole === "doctor"
                ? () => handleDeleteRoutine(selectedRoutine.id)
                : undefined
            }
            onAssign={
              userRole === "patient"
                ? () => handleAssignToPatient(selectedRoutine)
                : undefined
            }
            onBack={() => setCurrentView("list")}
            showDoctorActions={userRole === "doctor"}
            showPatientActions={userRole === "patient"}
          />
        ) : null;

      case "assign":
        return selectedRoutine ? (
          <PatientAssign
            routine={selectedRoutine}
            onAssign={handleAssignRoutine}
            onCancel={() => setCurrentView("list")}
            isLoading={isLoading}
          />
        ) : null;

      default:
        return (
          <RoutineList
            routines={routines}
            onEdit={handleEditRoutine}
            onDelete={handleDeleteRoutine}
            onView={handleViewRoutine}
            onCreate={() => setCurrentView("create")}
            onAssign={userRole === "doctor" ? handleAssignToPatient : undefined}
            isLoading={isLoading}
            showDoctorView={userRole === "doctor"}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavbar()}

      <main className="py-8">{renderCurrentView()}</main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Dashboard;
