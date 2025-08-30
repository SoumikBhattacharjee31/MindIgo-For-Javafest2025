'use client'
import { useState, useEffect,useRef } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { BreathingExercise, LastSession } from '../../dataTypes';

export interface BreathingSessionProps {
  exercise: BreathingExercise
  onBack: () => void
  onSessionComplete: (session: LastSession) => void
}

const BreathingSession = ({ 
  exercise ,
  onBack , 
  onSessionComplete
}: BreathingSessionProps) => {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(exercise.cycle.task[0].duration)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(false)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const phases = exercise.cycle.task
  const totalCycleTime = exercise.cycle.duration
  const totalCycles = Math.floor((exercise.duration * 60) / totalCycleTime)
  const targetEndTime = exercise.duration * 60

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Play tone based on phase
  const playTone = (phase: string) => {
    if (!musicEnabled || !audioContextRef.current) return

    // Stop previous tone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different phases
    switch (phase) {
      case 'inhale':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime) // A3
        break
      case 'hold':
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime) // E4
        break
      case 'exhale':
        oscillator.frequency.setValueAtTime(165, audioContext.currentTime) // E3
        break
    }

    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    oscillatorRef.current = oscillator
    gainNodeRef.current = gainNode
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isPlaying && timeLeft > 0 && !sessionEnded) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1)
        setTotalTime((t) => t + 1)
      }, 1000)
    } else if (isPlaying && timeLeft === 0 && !sessionEnded) {
      const next = (phaseIndex + 1) % phases.length
      
      if (next === 0) {
        // Completed a full cycle
        const newCount = cycleCount + 1
        setCycleCount(newCount)
        
        // Check if we've reached the target time
        if (totalTime >= targetEndTime) {
          // Session should end, but let current cycle complete
          setSessionEnded(true)
          setIsPlaying(false)
          
          const session: LastSession = {
            exerciseTitle: exercise.title,
            completedCycles: newCount,
            totalCycles,
            date: new Date().toLocaleDateString(),
            duration: Math.ceil(totalTime / 60),
            gradient: 'from-indigo-500 to-purple-700'
          }
          onSessionComplete(session)
          return
        }
      }

      setPhaseIndex(next)
      setTimeLeft(phases[next].duration)
      
      // Play tone for new phase
      playTone(phases[next].type)
    }
    
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft, phaseIndex, phases, cycleCount, totalCycles, exercise, onSessionComplete, totalTime, targetEndTime, sessionEnded, musicEnabled])

  const togglePlayPause = () => {
    if (!isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
    setIsPlaying((p) => !p)
  }

  const reset = () => {
    setIsPlaying(false)
    setPhaseIndex(0)
    setTimeLeft(phases[0].duration)
    setCycleCount(0)
    setTotalTime(0)
    setSessionEnded(false)
  }

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled)
  }

  const current = phases[phaseIndex]
  
  // Enhanced animations based on phase type
  const getCircleStyle = () => {
    const baseSize = 200 // Base size in pixels
    let scale = 1
    let animation = ''
    
    switch (current.type) {
      case 'inhale':
        scale = 1.4 // Grow larger
        animation = 'ease-in-out'
        break
      case 'exhale':
        scale = 0.7 // Shrink smaller
        animation = 'ease-in-out'
        break
      case 'hold':
        scale = 1.2 // Slightly larger
        animation = 'ease-in-out'
        break
    }

    return {
      width: `${baseSize}px`,
      height: `${baseSize}px`,
      transform: `scale(${scale})`,
      transition: `transform ${current.duration}s ${animation}`,
      animation: current.type === 'hold' ? 'pulse 2s ease-in-out infinite' : 'none'
    }
  }

  const getPhaseColor = () => {
    switch (current.type) {
      case 'inhale':
        return 'from-green-400 to-emerald-500'
      case 'exhale':
        return 'from-blue-400 to-cyan-500'
      case 'hold':
        return 'from-yellow-400 to-orange-500'
      default:
        return 'from-green-400 to-blue-500'
    }
  }

  const progress = ((totalTime) / targetEndTime) * 100

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <ArrowLeft className="w-6 h-6 cursor-pointer hover:text-purple-300 transition-colors" onClick={onBack} />
        <h1 className="text-lg font-medium">{exercise.title}</h1>
        <button 
          onClick={toggleMusic}
          className="w-6 h-6 cursor-pointer hover:text-purple-300 transition-colors"
        >
          {musicEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mx-4 mb-4 relative z-10">
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="text-center text-xs text-white/60 mt-1">
          {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')} / {exercise.duration}:00
        </div>
      </div>

      {/* Circle Animation */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div
          className={`rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center shadow-2xl relative`}
          style={getCircleStyle()}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm"></div>
          
          <div className="text-center relative z-10">
            <div className="text-2xl font-light capitalize mb-2 drop-shadow-lg">
              {current.type}
            </div>
            <div className="text-6xl font-bold drop-shadow-lg">{timeLeft}</div>
          </div>
        </div>

        {/* Phase Instructions */}
        <div className="mt-8 text-center max-w-md px-4">
          <div className="text-lg font-medium mb-2 capitalize">
            {current.type === 'inhale' && 'Breathe In Slowly'}
            {current.type === 'exhale' && 'Breathe Out Gently'}
            {current.type === 'hold' && 'Hold Your Breath'}
          </div>
          <div className="text-sm text-white/80 mb-4">{exercise.description}</div>
          <div className="text-xs text-white/60">
            Cycle {cycleCount + 1} of {totalCycles}
          </div>
        </div>

        {/* Session Status */}
        {sessionEnded && (
          <div className="mt-4 text-center">
            <div className="text-green-400 font-medium">Session Complete!</div>
            <div className="text-sm text-white/80">Well done on completing your breathing practice</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-6 pb-8 relative z-10">
        <button
          onClick={reset}
          className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110"
          title="Reset"
        >
          <span className="text-xl">↺</span>
        </button>
        <button
          onClick={togglePlayPause}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-900 hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-lg"
          disabled={sessionEnded}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
          }
        }
        
        .animate-breathing-hold {
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default BreathingSession;