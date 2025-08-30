'use client'
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { BreathingExercise, LastSession } from '../../dataTypes';

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
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.cycle.task[0].duration);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Audio refs for MP3 files
  const inhaleAudioRef = useRef<HTMLAudioElement | null>(null);
  const holdAudioRef = useRef<HTMLAudioElement | null>(null);
  const exhaleAudioRef = useRef<HTMLAudioElement | null>(null);

  const phases = exercise.cycle.task;
  const totalCycleTime = exercise.cycle.duration;
  const totalCycles = Math.floor((exercise.duration * 60) / totalCycleTime);
  const targetEndTime = exercise.duration * 60;

  // Initialize audio elements with royalty-free Pixabay URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      inhaleAudioRef.current = new Audio('../../../../../public/audio/calm.mp3'); // Gentle inhale (5s)
      holdAudioRef.current = new Audio('../../../../../public/audio/calm.mp3');   // Calm ambient tone (10s)
      exhaleAudioRef.current = new Audio('../../../../../public/audio/calm.mp3'); // Gentle exhale (5s)

      // Set audio properties
      [inhaleAudioRef.current, holdAudioRef.current, exhaleAudioRef.current].forEach(audio => {
        if (audio) {
          audio.volume = 0.6; // Increased for better audibility
          audio.loop = audio === holdAudioRef.current; // Loop only hold audio
          audio.crossOrigin = 'anonymous';
        }
      });
    }

    return () => {
      // Cleanup
      [inhaleAudioRef.current, holdAudioRef.current, exhaleAudioRef.current].forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  // Play audio based on phase
  const playPhaseAudio = (phaseType: string) => {
    if (!musicEnabled) return;

    // Stop all audio first
    [inhaleAudioRef.current, holdAudioRef.current, exhaleAudioRef.current].forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Play appropriate audio
    let audioToPlay: HTMLAudioElement | null = null;
    switch (phaseType) {
      case 'inhale':
        audioToPlay = inhaleAudioRef.current;
        break;
      case 'hold':
        audioToPlay = holdAudioRef.current;
        break;
      case 'exhale':
        audioToPlay = exhaleAudioRef.current;
        break;
    }

    if (audioToPlay) {
      audioToPlay.play().catch(e => console.error(`Audio playback error for ${phaseType}:`, e.message, e));
    }
  };

  // Timer logic
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
        // Completed a full cycle
        const newCount = cycleCount + 1;
        setCycleCount(newCount);

        // Check if we've reached the target time
        if (totalTime >= targetEndTime) {
          setSessionEnded(true);
          setIsPlaying(false);

          const session: LastSession = {
            exerciseTitle: exercise.title,
            completedCycles: newCount,
            totalCycles,
            date: new Date().toLocaleDateString(),
            duration: Math.ceil(totalTime / 60),
            gradient: 'from-indigo-500 to-purple-700'
          };
          onSessionComplete(session);
          return;
        }
      }

      setPhaseIndex(next);
      setTimeLeft(phases[next].duration);

      // Play audio for new phase
      playPhaseAudio(phases[next].type);
    }

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, phaseIndex, phases, cycleCount, totalCycles, exercise, onSessionComplete, totalTime, targetEndTime, sessionEnded, musicEnabled]);

  const togglePlayPause = () => {
    setIsPlaying((p) => {
      const newPlaying = !p;
      if (newPlaying) {
        playPhaseAudio(phases[phaseIndex].type); // Play audio for initial phase
      }
      return newPlaying;
    });
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

  const currentPhase = phases[phaseIndex];

  // Calculate smooth gradual scale based on time progress
  const getCircleScale = () => {
    if (!isPlaying) return 1;

    switch (currentPhase.type) {
      case 'inhale':
        return 1.25;
      case 'exhale':
        return 0.85;
      case 'hold':
        const prevPhase = phases[(phaseIndex - 1 + phases.length) % phases.length];
        return prevPhase.type === 'inhale' ? 1.25 : 0.85;
      default:
        return 1;
    }
  };

  const getAnimationClasses = () => {
    if (currentPhase.type === 'hold' && isPlaying) {
      return 'animate-pulse';
    }
    return '';
  };

  const getPhaseColor = () => {
    switch (currentPhase.type) {
      case 'inhale':
        return 'from-green-400 to-emerald-600';
      case 'exhale':
        return 'from-blue-400 to-cyan-600';
      case 'hold':
        return 'from-amber-400 to-orange-600';
      default:
        return 'from-purple-400 to-indigo-600';
    }
  };

  const progress = ((totalTime) / targetEndTime) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <ArrowLeft
          className="w-6 h-6 cursor-pointer hover:text-purple-300 transition-colors"
          onClick={onBack}
        />
        <h1 className="text-xl font-semibold">{exercise.title}</h1>
        <button
          onClick={toggleMusic}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {musicEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mx-6 mb-6">
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-center text-sm text-white/70 mt-2">
          {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')} / {exercise.duration}:00
        </div>
      </div>

      {/* Main Circle Animation */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div
          className={`w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center shadow-2xl ${getAnimationClasses()}`}
          style={{
            transform: `scale(${getCircleScale()})`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transition: currentPhase.type === 'hold' ? 'none' : `transform ${currentPhase.duration}s ease-in-out`
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-medium capitalize mb-3 opacity-90">
              {currentPhase.type}
            </div>
            <div className="text-6xl font-bold">{timeLeft}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center max-w-md">
          <div className="text-lg font-medium mb-3">
            {currentPhase.type === 'inhale' && 'Breathe In Slowly'}
            {currentPhase.type === 'exhale' && 'Breathe Out Gently'}
            {currentPhase.type === 'hold' && 'Hold Your Breath'}
          </div>
          <div className="text-sm text-white/80 mb-4 leading-relaxed">
            {exercise.description}
          </div>
          <div className="text-sm text-white/60">
            Cycle {cycleCount + 1} of {totalCycles}
          </div>
        </div>

        {/* Session Complete Message */}
        {sessionEnded && (
          <div className="mt-6 text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <div className="text-green-400 font-semibold text-lg mb-1">Session Complete!</div>
            <div className="text-sm text-white/80">Well done on completing your breathing practice</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-8 pb-12">
        <button
          onClick={reset}
          className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
          title="Reset"
        >
          <span className="text-2xl">↺</span>
        </button>

        <button
          onClick={togglePlayPause}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-900 hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={sessionEnded}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default BreathingSession;