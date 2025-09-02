'use client'
import { useState, useEffect } from 'react';
import { BreathingExercise, LastSession } from '../dataTypes';

import BreathingExerciseCard from './breathing-components/BreathingExerciseCard';
import SettingsModal from './breathing-components/SettingsModal';
import MindigoRecommendation from './breathing-components/MindigoRecommedation';
import LastSessionCard from './breathing-components/LastSessionCard';
import BreathingSession from './breathing-components/BreathingSession';
import BreathingCardHeader from './breathing-components/BreathingCardHeader';

import { breathingApi, toBreathingExercise, toLastSession, toBreathingRequest, toBreathingSessionRequest } from '../api/breathingApi'; // Adjust path as needed

const BreathingCard = () => {
  const [exercises, setExercises] = useState<BreathingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [settingsExercise, setSettingsExercise] = useState<BreathingExercise | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSession, setShowSession] = useState<boolean>(false);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);

  const [loadingExercises, setLoadingExercises] = useState<boolean>(true);
  const [errorExercises, setErrorExercises] = useState<string | null>(null);
  const [loadingLastSession, setLoadingLastSession] = useState<boolean>(true);
  const [errorLastSession, setErrorLastSession] = useState<string | null>(null);

  // Format current date as YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingExercises(true);
      setErrorExercises(null);
      try {
        const exercisesResponse = await breathingApi.getBreathingExercises();
        const mappedExercises = exercisesResponse.map(toBreathingExercise);
        setExercises(mappedExercises);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setErrorExercises('Failed to load breathing exercises. Please try again.');
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  // Fetch last session
  useEffect(() => {
    const fetchLastSession = async () => {
      setLoadingLastSession(true);
      setErrorLastSession(null);
      try {
        const date = getCurrentDate();
        const sessionResponse = await breathingApi.getLatestSession(date);
        if(sessionResponse) {
          const mappedSession = toLastSession(sessionResponse);
          setLastSession(mappedSession);
        }
      } catch (err) {
        console.error('Error fetching last session:', err);
        setErrorLastSession('Failed to load last session. Please try again.');
      } finally {
        setLoadingLastSession(false);
      }
    };

    fetchLastSession();
  }, []);

  const handleCardClick = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setShowSession(true);
  };

  const handleSettingsClick = (exercise: BreathingExercise) => {
    setSettingsExercise(exercise);
    setShowSettings(true);
  };

  const handleSettingsSave = async (updatedExercise: BreathingExercise) => {
    try {
      const request = toBreathingRequest(updatedExercise);
      const response = await breathingApi.customizeBreathingExercise(request);
      const mappedUpdated = toBreathingExercise(response);

      // Update local state
      setExercises(prev =>
        prev.map(ex => ex.id === mappedUpdated.id ? mappedUpdated : ex)
      );
    } catch (err) {
      console.error('Error saving settings:', err);
      // Optionally show error to user
    }
  };

  const handleBackFromSession = () => {
    setShowSession(false);
    setSelectedExercise(null);
  };

  const handleSessionComplete = async (session: LastSession) => {
    try {
      const request = toBreathingSessionRequest(session);
      const response = await breathingApi.storeBreathingSession(request);
      const mappedSession = toLastSession(response);
      setLastSession(mappedSession);
    } catch (err) {
      console.error('Error storing session:', err);
      // Optionally show error to user
    }
  };

  if (showSession && selectedExercise) {
    return <BreathingSession exercise={selectedExercise} onBack={handleBackFromSession} onSessionComplete={handleSessionComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 text-white p-4 rounded-b-2xl shadow-md">
      {/* Header */}
      <BreathingCardHeader />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <MindigoRecommendation />
          {loadingLastSession ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : errorLastSession ? (
            <div className="text-red-300">{errorLastSession}</div>
          ) : (
            <LastSessionCard session={lastSession} />
          )}
        </div>
        <div className='grid grid-cols-2 gap-6'>
          {loadingExercises ? (
            <div className="col-span-2 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : errorExercises ? (
            <div className="col-span-2 text-red-300">{errorExercises}</div>
          ) : (
            exercises.map((exercise, index) => (
              <BreathingExerciseCard
                key={index}
                exercise={exercise}
                onCardClick={handleCardClick}
                onSettingsClick={handleSettingsClick}
              />
            ))
          )}
        </div>
      </div>

      <SettingsModal
        exercise={settingsExercise}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default BreathingCard;