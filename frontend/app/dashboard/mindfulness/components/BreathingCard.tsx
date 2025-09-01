'use client'
import { useState } from 'react';
import { Info } from 'lucide-react';
import { BreathingExercise, LastSession } from '../dataTypes';

import BreathingExerciseCard from './breathing-components/BreathingExerciseCard';
import SettingsModal from './breathing-components/SettingsModal';
import MindigoRecommendation from './breathing-components/MindigoRecommedation';
import LastSessionCard from './breathing-components/LastSessionCard';
import BreathingSession from './breathing-components/BreathingSession';
import breathingExercisesData from '../../mock/breathing_exercise_data.json';

const BreathingCard = () => {
  const [exercises, setExercises] = useState<BreathingExercise[]>(breathingExercisesData as BreathingExercise[]);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [settingsExercise, setSettingsExercise] = useState<BreathingExercise | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSession, setShowSession] = useState<boolean>(false);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);

  const handleCardClick = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setShowSession(true);
  };

  const handleSettingsClick = (exercise: BreathingExercise) => {
    setSettingsExercise(exercise);
    setShowSettings(true);
  };

  const handleSettingsSave = (updatedExercise: BreathingExercise) => {
    setExercises(prev =>
      prev.map(ex => ex.title === updatedExercise.title ? updatedExercise : ex)
    );
  };

  const handleBackFromSession = () => {
    setShowSession(false);
    setSelectedExercise(null);
  };

  const handleSessionComplete = (session: LastSession) => {
    setLastSession(session);
  };

  if (showSession && selectedExercise) {
    return <BreathingSession exercise={selectedExercise} onBack={handleBackFromSession} onSessionComplete={handleSessionComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500  text-white p-4 rounded-b-2xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-medium">Choose a breathing exercise</h1>
        </div>
        <Info className="w-6 h-6" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <MindigoRecommendation />
          <LastSessionCard session={lastSession} />
        </div>
        <div className='grid grid-cols-2 gap-6'>
          {exercises.map((exercise, index) => (
            <BreathingExerciseCard
              key={index}
              exercise={exercise}
              onCardClick={handleCardClick}
              onSettingsClick={handleSettingsClick}
            />
          ))}
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