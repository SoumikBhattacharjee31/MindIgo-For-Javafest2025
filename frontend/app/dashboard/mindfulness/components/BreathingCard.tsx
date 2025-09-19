"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  BreathingExercise,
  LastSession,
} from "@/app/dashboard/mindfulness/dataTypes";

import BreathingExerciseCard from "./breathing-components/BreathingExerciseCard";
import SettingsModal from "./breathing-components/SettingsModal";
import MindigoRecommendation from "./breathing-components/MindigoRecommedation";
import LastSessionCard from "./breathing-components/LastSessionCard";
import BreathingSession from "./breathing-components/BreathingSession";
import BreathingCardHeader from "./breathing-components/BreathingCardHeader";
import { successToast, errorToast } from "@/util/toastHelper";
import {
  breathingApi,
  toBreathingExercise,
  toLastSession,
  toBreathingRequest,
  toBreathingSessionRequest,
  formatDateForApi,
} from "@/app/dashboard/mindfulness/api/breathingApi";

interface LoadingState {
  exercises: boolean;
  lastSession: boolean;
  savingSettings: boolean;
  savingSession: boolean;
}

interface ErrorState {
  exercises: string | null;
  lastSession: string | null;
}

interface InitializedState {
  exercises: boolean;
  lastSession: boolean;
}

const BreathingCard = () => {
  // State management
  const [exercises, setExercises] = useState<BreathingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] =
    useState<BreathingExercise | null>(null);
  const [settingsExercise, setSettingsExercise] =
    useState<BreathingExercise | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSession, setShowSession] = useState<boolean>(false);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);

  // Consolidated loading and error states
  const [loading, setLoading] = useState<LoadingState>({
    exercises: true,
    lastSession: true,
    savingSettings: false,
    savingSession: false,
  });

  const [errors, setErrors] = useState<ErrorState>({
    exercises: null,
    lastSession: null,
  });

  // Add initialization tracking to prevent duplicate API calls
  const [initialized, setInitialized] = useState<InitializedState>({
    exercises: false,
    lastSession: false,
  });

  // Use refs to track loading state and prevent race conditions
  const isLoadingExercisesRef = useRef<boolean>(false);
  const isLoadingLastSessionRef = useRef<boolean>(false);

  // Memoized current date to avoid recalculation
  const currentDate = useMemo(() => {
    return formatDateForApi(new Date()); // Use consistent date formatting
  }, []);

  // Update loading state helper
  const updateLoading = useCallback(
    (key: keyof LoadingState, value: boolean) => {
      setLoading((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Update error state helper
  const updateError = useCallback(
    (key: keyof ErrorState, value: string | null) => {
      setErrors((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Fetch exercises with optimized error handling
  const fetchExercises = useCallback(async () => {
    if (initialized.exercises || isLoadingExercisesRef.current) return; // Prevent duplicate calls
    
    updateLoading("exercises", true);
    updateError("exercises", null);
    isLoadingExercisesRef.current = true;

    try {
      const exercisesResponse = await breathingApi.getBreathingExercises();
      const mappedExercises = exercisesResponse.map(toBreathingExercise);
      setExercises(mappedExercises);
      setInitialized(prev => ({ ...prev, exercises: true }));
      successToast("Breathing exercises loaded successfully.");
    } catch (err) {
      const errorMessage =
        "Failed to load breathing exercises. Please try again.";
      console.error("Error fetching exercises:", err);
      updateError("exercises", errorMessage);
      errorToast(errorMessage);
    } finally {
      updateLoading("exercises", false);
      isLoadingExercisesRef.current = false;
    }
  }, [initialized.exercises, updateLoading, updateError]);

  // Fetch last session with optimized error handling
  const fetchLastSession = useCallback(async () => {
    if (initialized.lastSession || isLoadingLastSessionRef.current) return; // Prevent duplicate calls
    
    updateLoading("lastSession", true);
    updateError("lastSession", null);
    isLoadingLastSessionRef.current = true;

    try {
      const sessionResponse = await breathingApi.getLatestSession(currentDate);
      if (sessionResponse) {
        const mappedSession = toLastSession(sessionResponse);
        setLastSession(mappedSession);
        successToast("Last session loaded successfully.");
      }
      setInitialized(prev => ({ ...prev, lastSession: true }));
    } catch (err) {
      const errorMessage = "Failed to load last session. Please try again.";
      console.error("Error fetching last session:", err);
      updateError("lastSession", errorMessage);
      errorToast(errorMessage);
    } finally {
      updateLoading("lastSession", false);
      isLoadingLastSessionRef.current = false;
    }
  }, [currentDate, initialized.lastSession, updateLoading, updateError]);

  // Initial data fetch with cleanup for React StrictMode
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (isMounted) {
        await fetchExercises();
      }
      if (isMounted) {
        await fetchLastSession();
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [fetchExercises, fetchLastSession]);

  // Handle exercise card click
  const handleCardClick = useCallback((exercise: BreathingExercise) => {
    console.log("Selected Exercise:", exercise);
    setSelectedExercise(exercise);
    setShowSession(true);
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback((exercise: BreathingExercise) => {
    setSettingsExercise(exercise);
    setShowSettings(true);
  }, []);

  // Handle settings save - optimistic update pattern
  const handleSettingsSave = useCallback(
    async (updatedExercise: BreathingExercise) => {
      updateLoading("savingSettings", true);

      // Optimistic update - save locally first
      const previousExercises = exercises;
      setExercises((prev) =>
        prev.map((ex) => (ex.id === updatedExercise.id ? updatedExercise : ex))
      );

      try {
        const request = toBreathingRequest(updatedExercise);
        const response = await breathingApi.customizeBreathingExercise(request);
        const mappedUpdated = toBreathingExercise(response);

        // Update with server response (in case server modified anything)
        setExercises((prev) =>
          prev.map((ex) => (ex.id === mappedUpdated.id ? mappedUpdated : ex))
        );

        successToast("Breathing exercise updated successfully.");
      } catch (err) {
        // Rollback on error
        setExercises(previousExercises);
        console.error("Error saving settings:", err);
        errorToast("Failed to update breathing exercise. Please try again.");
      } finally {
        updateLoading("savingSettings", false);
      }
    },
    [exercises, updateLoading]
  );

  // Handle session navigation
  const handleBackFromSession = useCallback(() => {
    setShowSession(false);
    setSelectedExercise(null);
  }, []);

  // Handle session completion - optimistic update pattern
  const handleSessionComplete = useCallback(
    async (session: LastSession) => {
      updateLoading("savingSession", true);

      // Optimistic update - save locally first
      const previousSession = lastSession;
      setLastSession(session);

      try {
        const request = toBreathingSessionRequest(session);
        const response = await breathingApi.storeBreathingSession(request);
        const mappedSession = toLastSession(response);

        // Update with server response
        setLastSession(mappedSession);
        successToast("Session completed and stored successfully.");
      } catch (err) {
        // Rollback on error
        setLastSession(previousSession);
        console.error("Error storing session:", err);
        errorToast("Failed to store session. Please try again.");
      } finally {
        updateLoading("savingSession", false);
      }
    },
    [lastSession, updateLoading]
  );

  // Handle modal close
  const handleSettingsClose = useCallback(() => {
    setShowSettings(false);
    setSettingsExercise(null);
  }, []);

  // Early return for session view
  if (showSession && selectedExercise) {
    return (
      <BreathingSession
        exercise={selectedExercise}
        onBack={handleBackFromSession}
        onSessionComplete={handleSessionComplete}
      />
    );
  }

  // Loading component
  const LoadingSpinner = ({
    size = "medium",
  }: {
    size?: "small" | "medium" | "large";
  }) => {
    const sizeClasses = {
      small: "h-8 w-8",
      medium: "h-12 w-12",
      large: "h-16 w-16",
    };

    return (
      <div className="flex justify-center items-center">
        <div
          className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${sizeClasses[size]}`}
        />
      </div>
    );
  };

  // Error component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="text-red-300 text-center p-4 bg-red-500/10 rounded-lg">
      {message}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 text-white p-4 rounded-b-2xl shadow-md">
      {/* Header */}
      <BreathingCardHeader />

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <MindigoRecommendation />

          {/* Last Session Section */}
          {loading.lastSession ? (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : errors.lastSession ? (
            <ErrorMessage message={errors.lastSession} />
          ) : (
            <LastSessionCard session={lastSession} />
          )}
        </div>

        {/* Right Column - Exercise Cards */}
        <div className="grid grid-cols-2 gap-6">
          {loading.exercises ? (
            <div className="col-span-2 h-64 flex items-center justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : errors.exercises ? (
            <div className="col-span-2">
              <ErrorMessage message={errors.exercises} />
            </div>
          ) : exercises.length === 0 ? (
            <div className="col-span-2 text-center text-white/70 p-8">
              No breathing exercises available
            </div>
          ) : (
            exercises.map((exercise) => (
              <BreathingExerciseCard
                key={exercise.id} // Use ID instead of index for better performance
                exercise={exercise}
                onCardClick={handleCardClick}
                onSettingsClick={handleSettingsClick}
              />
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        exercise={settingsExercise}
        isOpen={showSettings}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default BreathingCard;
