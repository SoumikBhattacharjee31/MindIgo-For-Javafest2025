'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import ProgressBar from './ProgressBar';
import BreathingSessionHeader from './BreathingSessionHeader';
import Controls from './Controls';
import SessionMainBody from './SessionMainBody';
import BackgroundAudio from '@/app/components/BackgroundAudio';
import { BreathingExercise, LastSession } from '../../dataTypes';
import { infoToast } from '@/util/toastHelper';
import { formatDateForApi } from '../../api/breathingApi';

export interface BreathingSessionProps {
  exercise: BreathingExercise
  onBack: () => void
  onSessionComplete: (session: LastSession) => void
}

const BreathingSession = ({
  exercise,
  onBack,
  onSessionComplete
}: BreathingSessionProps) => {
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(exercise.cycle.task[0].duration);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sessionEnded, setSessionEnded] = useState<boolean>(false);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);
  
  // Track if session has been saved to prevent duplicate saves
  const sessionSavedRef = useRef<boolean>(false);

  // Memoize calculated values to avoid recalculation on every render
  const { phases, totalCycleTime, totalCycles, targetEndTime } = useMemo(() => ({
    phases: exercise.cycle.task,
    totalCycleTime: exercise.cycle.duration,
    totalCycles: Math.ceil((exercise.duration * 60) / exercise.cycle.duration),
    targetEndTime: exercise.duration * 60
  }), [exercise]);

  // Memoize current phase to avoid array access on every render
  const currentPhase = useMemo(() => phases[phaseIndex], [phases, phaseIndex]);
  
  // Memoize progress calculation
  const progress = useMemo(() => (totalTime / targetEndTime) * 100, [totalTime, targetEndTime]);

  // Create session object - memoized to avoid recreation
  const createSession = useCallback((completedCycles: number): LastSession => ({
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    completedCycles,
    totalCycles,
    date: formatDateForApi(new Date()), // Use proper local date formatting
    duration: Math.ceil(totalTime / 60)
  }), [exercise.id, exercise.title, totalCycles, totalTime]);

  // Save session helper
  const saveSession = useCallback((completedCycles: number, showToast = false) => {
    if (sessionSavedRef.current) return; // Prevent duplicate saves
    
    sessionSavedRef.current = true;
    const session = createSession(completedCycles);
    onSessionComplete(session);
    
    if (showToast) {
      infoToast(`Session ended. You completed ${completedCycles} ${completedCycles === 1 ? 'cycle' : 'cycles'}.`);
    }
  }, [createSession, onSessionComplete]);

  // Timer effect with optimized dependencies
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0 || sessionEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
      setTotalTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, sessionEnded]);

  // Phase transition effect
  useEffect(() => {
    if (isPlaying && timeLeft === 0 && !sessionEnded) {
      const nextPhaseIndex = (phaseIndex + 1) % phases.length;

      if (nextPhaseIndex === 0) {
        const newCycleCount = cycleCount + 1;
        setCycleCount(newCycleCount);
        
        // Check if session should end
        if (totalTime >= targetEndTime) {
          setSessionEnded(true);
          setIsPlaying(false);
          saveSession(newCycleCount);
          return;
        }
      }

      setPhaseIndex(nextPhaseIndex);
      setTimeLeft(phases[nextPhaseIndex].duration);
    }
  }, [
    isPlaying, timeLeft, sessionEnded, phaseIndex, phases,
    cycleCount, totalTime, targetEndTime, saveSession
  ]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setPhaseIndex(0);
    setTimeLeft(phases[0].duration);
    setCycleCount(0);
    setTotalTime(0);
    setSessionEnded(false);
    sessionSavedRef.current = false; // Reset save flag
  }, [phases]);

  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => !prev);
  }, []);

  const handleBack = useCallback(() => {
    // Only save if session hasn't been saved and at least one cycle is completed
    if (!sessionSavedRef.current && cycleCount > 0 && totalTime > 0) {
      saveSession(cycleCount, true);
    } else if (cycleCount === 0) {
      infoToast("You haven't completed any cycles. So the session is not saved.");
    } else if (totalTime === 0) {
      infoToast("You haven't spent any time on this session. So the session is not saved.");
    }
    
    // Use shorter timeout or immediate navigation
    const delay = sessionSavedRef.current || cycleCount === 0 || totalTime === 0 ? 0 : 1000;
    setTimeout(onBack, delay);
  }, [cycleCount, totalTime, saveSession, onBack]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 text-white">
      <BreathingSessionHeader
        onBack={handleBack}
        musicEnabled={musicEnabled}
        title={exercise.title}
        toggleMusic={toggleMusic}
      />

      <ProgressBar
        progress={progress}
        totalTime={totalTime}
        duration={exercise.duration}
      />

      <SessionMainBody
        isPlaying={isPlaying}
        type={currentPhase.type}
        phases={phases}
        phaseIndex={phaseIndex}
        duration={currentPhase.duration}
        timeLeft={timeLeft}
        description={exercise.description}
        cycleCount={cycleCount}
        totalCycles={totalCycles}
        sessionEnded={sessionEnded}
      />

      <Controls
        reset={reset}
        togglePlayPause={togglePlayPause}
        sessionEnded={sessionEnded}
        isPlaying={isPlaying}
      />

      <BackgroundAudio
        srcUrl='/audio/calm.mp3'
        muted={!musicEnabled}
        loop={true}
      />
    </div>
  );
};

export default BreathingSession;