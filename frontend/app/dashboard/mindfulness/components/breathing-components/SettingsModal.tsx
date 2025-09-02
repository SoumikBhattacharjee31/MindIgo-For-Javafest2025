'use client'
import { useState, useEffect } from 'react'
import { BreathingExercise, BreathingTask } from '../../dataTypes'
import { X } from 'lucide-react'
import NumberPicker from '@/app/components/NumberPicker'

export interface SettingsModalProps {
  exercise: BreathingExercise | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedExercise: BreathingExercise) => void
}

const SettingsModal = ({ exercise, isOpen, onClose, onSave }: SettingsModalProps) => {
  const [duration, setDuration] = useState(5)
  const [inhale, setInhale] = useState(4)
  const [hold, setHold] = useState(0)
  const [exhale, setExhale] = useState(4)
  const [holdAfterExhale, setHoldAfterExhale] = useState(0)
  const [activeTab, setActiveTab] = useState<'cycle' | 'duration'>('cycle')

  useEffect(() => {
    if (exercise) {
      setDuration(exercise.duration)
      // Extract values from cycle tasks
      const inhaleTasks = exercise.cycle.task.filter(t => t.type === 'inhale')
      const holdTasks = exercise.cycle.task.filter(t => t.type === 'hold')
      const exhaleTasks = exercise.cycle.task.filter(t => t.type === 'exhale')

      setInhale(inhaleTasks[0]?.duration ?? 4)
      setHold(holdTasks[0]?.duration ?? 0)
      setExhale(exhaleTasks[0]?.duration ?? 4)
      setHoldAfterExhale(holdTasks[1]?.duration ?? 0)
    }
  }, [exercise])

  const handleSave = () => {
    if (!exercise) return

    // Create new cycle with updated tasks
    const newTasks: BreathingTask[] = [
      { order: 1, type: 'inhale', duration: inhale },
      { order: 2, type: 'hold', duration: hold },
      { order: 3, type: 'exhale', duration: exhale },
    ]

    const cycleDuration = inhale + hold + exhale + holdAfterExhale
    const extra = holdAfterExhale > 0 ? `-${holdAfterExhale}` : '';
    const updatedExercise: BreathingExercise = {
      ...exercise,
      duration,
      pattern: `${inhale}-${hold}-${exhale}${extra}`,
      cycle: {
        duration: cycleDuration,
        task: newTasks
      }
    }

    onSave(updatedExercise)
    onClose()
  }

  if (!isOpen || !exercise) return null

  const isCustomizable = exercise.title === 'Custom'
  const cycleTime = inhale + hold + exhale

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{exercise.title} Settings</h2>
          <X className="w-6 h-6 text-white/60 cursor-pointer hover:text-white transition-colors" onClick={onClose} />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isCustomizable ? (
            <div>
              {/* Tabs */}
              <div className="flex bg-white/10 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setActiveTab('cycle')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cycle'
                      ? 'bg-white text-purple-900'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  Cycle
                </button>
                <button
                  onClick={() => setActiveTab('duration')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'duration'
                      ? 'bg-white text-purple-900'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  Duration
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'cycle' ? (
                <div className="space-y-4">
                  {/* Breathing Pattern Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumberPicker
                      min={0}
                      max={10}
                      defaultValue={inhale}
                      onChange={setInhale}
                      loop={false}
                      label="Inhale"
                    />
                    <NumberPicker
                      min={0}
                      max={10}
                      defaultValue={hold}
                      onChange={setHold}
                      loop={false}
                      label="Hold"
                    />
                    <NumberPicker
                      min={0}
                      max={10}
                      defaultValue={exhale}
                      onChange={setExhale}
                      loop={false}
                      label="Exhale"
                    />
                  </div>

                  {/* Cycle Time Display */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">Cycle Time:</p>
                    <p className="text-white font-mono text-lg">{cycleTime}s</p>
                  </div>
                </div>
              ) : (
                <div>
                  <NumberPicker
                    min={1}
                    max={30}
                    defaultValue={duration}
                    onChange={setDuration}
                    loop={false}
                    label="Exercise Duration"
                    unit="min"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Non-Custom Exercise - Duration Only */
            <div>
              <NumberPicker
                min={1}
                max={30}
                defaultValue={duration}
                onChange={setDuration}
                loop={false}
                label="Exercise Duration"
                unit="min"
              />
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex space-x-3 mt-6 pt-4 border-t border-white/20">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-white text-purple-900 rounded-xl hover:bg-white/90 transition-colors duration-200 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal