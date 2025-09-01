'use client'

import { useState, useEffect } from 'react';

import ProgressBar from './ProgressBar';
import BreathingSessionHeader from './BreathingSessionHeader';
import Controls from './Controls';
import SessionMainBody from './SessionMainBody';
import BackgroundAudio from '@/app/components/BackgroundAudio';
import { BreathingExercise, LastSession } from '../../dataTypes';
import { infoToast } from '@/util/toastHelper';

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

  const phases = exercise.cycle.task;
  const totalCycleTime = exercise.cycle.duration;
  const totalCycles = Math.floor((exercise.duration * 60) / totalCycleTime);
  const targetEndTime = exercise.duration * 60;


  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0 && !sessionEnded) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
        setTotalTime((t) => t + 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0 && !sessionEnded) {
      const next = (phaseIndex + 1) % phases.length;

      if (next === 0) {
        const newCount = cycleCount + 1;
        setCycleCount(newCount);
        const session: LastSession = {
          exerciseTitle: exercise.title,
          completedCycles: newCount,
          totalCycles,
          date: new Date().toLocaleDateString(),
          duration: Math.ceil(totalTime / 60),
          gradient: 'from-indigo-500 to-purple-700'
        };
        onSessionComplete(session);
        if (totalTime >= targetEndTime) {
          setSessionEnded(true);
          setIsPlaying(false);
          return;
        }
      }

      setPhaseIndex(next);
      setTimeLeft(phases[next].duration);
    }

    return () => clearInterval(timer);
  }, [
    isPlaying, timeLeft, phaseIndex, phases,
    cycleCount, totalCycles, exercise, onSessionComplete,
    totalTime, targetEndTime, sessionEnded, musicEnabled
  ]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setPhaseIndex(0);
    setTimeLeft(phases[0].duration);
    setCycleCount(0);
    setTotalTime(0);
    setSessionEnded(false);
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  const handleBack = () => {
    if (cycleCount === 0) {
      infoToast("You haven't completed any cycles. So the session is not saved.");
    } else if (totalTime === 0) {
      infoToast("You haven't spent any time on this session. So the session is not saved.");
    }
    else {
      infoToast(`Session ended. You completed ${cycleCount} ${cycleCount === 1 ? 'cycle' : 'cycles'}.`);
    }
    setTimeout(() => {
      onBack();
    }, 1000);
  }

  const currentPhase = phases[phaseIndex];
  const progress = ((totalTime) / targetEndTime) * 100;

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
        duration={currentPhase.duration}
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
