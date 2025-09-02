import { useState, useEffect, useCallback, useMemo } from "react";
import MoodLog from "./MoodLog";
import ProgressIndicator from "./ProgressIndicator";
import TodayEntryCard from "./TodayEntryCard";
import MoodStep from "./MoodStep";
import DescriptionStep from "./DescriptionStep";
import ReasonStep from "./ReasonStep";
import { Mood, Description, Reason, Entry } from "../dataTypes";
import { moods } from "../moods";
import { descriptions } from "../description";
import { reasons } from "../reason";
import { 
  moodApi, 
  formatDateForApi, 
  convertMoodResponseToEntry, 
  convertEntryToMoodRequest 
} from "../api/moodApi";
import { successToast, errorToast } from '@/util/toastHelper';

// Constants
const ANIMATION_DELAY = 300;
const STEP_TRANSITION_DELAY = 200;
const INITIAL_STEP = 1;
const MOOD_DATA_DAYS = 7;

const MoodCheckinCard = () => {
  // State management
  const [moodData, setMoodData] = useState<Entry[]>([]);
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [step, setStep] = useState<number>(INITIAL_STEP);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<Description | null>(null);
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized today's date to prevent unnecessary re-calculations
  const today = useMemo(() => formatDateForApi(new Date()), []);

  // Memoized filtered data to prevent unnecessary re-calculations
  const filteredDescriptions = useMemo((): Description[] => 
    selectedMood ? descriptions.filter((d) => d.moods.includes(selectedMood.id)) : [],
    [selectedMood]
  );

  const filteredReasons = useMemo((): Reason[] => 
    selectedMood ? reasons.filter((r) => r.moods.includes(selectedMood.id)) : [],
    [selectedMood]
  );

  // Memoized helper to find today's entry
  const findTodayEntry = useCallback((entries: Entry[]): Entry | null => 
    entries.find((e: Entry) => e.date === today) || null,
    [today]
  );

  // Optimized state restoration function
  const restoreSelectionState = useCallback((entry: Entry) => {
    const mood = moods.find((m) => m.id === entry.mood) || null;
    const description = descriptions.find((d) => d.text === entry.description) || null;
    const reason = reasons.find((r) => r.text === entry.reason) || null;

    setSelectedMood(mood);
    setSelectedDescription(description);
    setSelectedReason(reason);
  }, []);

  // Optimized mood data loading with better error handling
  const loadMoodData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const moodResponses = await moodApi.getMoods(MOOD_DATA_DAYS, today);
      const entries = moodResponses.map(convertMoodResponseToEntry);
      
      setMoodData(entries);
      
      const todayEntryData = findTodayEntry(entries);
      setTodayEntry(todayEntryData);

      if (todayEntryData) {
        restoreSelectionState(todayEntryData);
      }

      successToast('Mood data loaded successfully.');
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const errorMessage = `Failed to load mood data. ${errMsg}`;
      
      console.error('Failed to load mood data:', err);
      errorToast(errorMessage);
      setError(`${errorMessage}. Please try again.`);
      setMoodData([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [today, findTodayEntry, restoreSelectionState]);

  // Initialize data on mount
  useEffect(() => {
    loadMoodData();
  }, [loadMoodData]);

  // Optimized edit handler with consistent animation timing
  const handleEdit = useCallback(() => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setTodayEntry(null);
      setStep(INITIAL_STEP);
      setSelectedMood(null);
      setSelectedDescription(null);
      setSelectedReason(null);
      setIsAnimating(false);
    }, ANIMATION_DELAY);
  }, []);

  // Optimized submit handler with better state management
  const handleSubmit = useCallback(async (reason: Reason) => {
    if (!selectedMood || !selectedDescription) {
      console.warn('Cannot submit: missing mood or description');
      return;
    }

    try {
      setIsAnimating(true);
      setError(null);
      
      const moodRequest = convertEntryToMoodRequest({
        date: today,
        mood: selectedMood.id,
        description: selectedDescription.text,
        reason: reason.text,
      });

      const moodResponse = await moodApi.setMood(moodRequest);
      
      setTimeout(() => {
        const newEntry = convertMoodResponseToEntry(moodResponse);
        setTodayEntry(newEntry);
        
        // Efficiently update mood data without mutation
        setMoodData(prevData => [
          ...prevData.filter((e) => e.date !== today), 
          newEntry
        ]);
        
        setStep(INITIAL_STEP);
        setIsAnimating(false);
      }, ANIMATION_DELAY);

      successToast('Mood saved successfully.');
      console.log('Mood saved successfully:', selectedMood);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const errorMessage = `Failed to save mood. ${errMsg}`;
      
      console.error('Failed to save mood:', err);
      errorToast(errorMessage);
      setError(`${errorMessage}. Please try again.`);
      setIsAnimating(false);
    }
  }, [selectedMood, selectedDescription, today]);

  // Optimized step navigation with consistent timing
  const nextStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setIsAnimating(false);
    }, STEP_TRANSITION_DELAY);
  }, []);

  const prevStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(s => s - 1);
      setIsAnimating(false);
    }, STEP_TRANSITION_DELAY);
  }, []);

  // Optimized mood selection handler to prevent unnecessary re-renders
  const handleMoodSelection = useCallback((mood: Mood) => {
    setSelectedMood(mood);
    setSelectedDescription(null);
    setSelectedReason(null);
  }, []);

  // Optimized description selection handler
  const handleDescriptionSelection = useCallback((description: Description) => {
    setSelectedDescription(description);
    setSelectedReason(null);
  }, []);

  // Error dismissal handler
  const dismissError = useCallback(() => setError(null), []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 p-6 flex items-center justify-center relative rounded-b-2xl">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/2 w-full h-full relative overflow-hidden flex items-center justify-center">
          <div className="text-white text-lg">Loading your mood data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 p-6 flex items-center justify-center relative rounded-b-2xl">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/2 w-full h-full relative overflow-hidden">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
            {error}
            <button 
              onClick={dismissError}
              className="float-right text-red-200 hover:text-white transition-colors duration-200"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <MoodLog moodData={moodData} />

        <div className="relative z-10">
          {todayEntry ? (
            <TodayEntryCard
              entry={todayEntry}
              selectedMood={selectedMood}
              selectedDescription={selectedDescription}
              selectedReason={selectedReason}
              isAnimating={isAnimating}
              onEdit={handleEdit}
            />
          ) : (
            <div
              className={`transition-all duration-300 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              {step === 1 && (
                <MoodStep
                  moods={moods}
                  selectedMood={selectedMood}
                  setSelectedMood={handleMoodSelection}
                  nextStep={nextStep}
                />
              )}
              
              {step === 2 && selectedMood && (
                <DescriptionStep
                  descriptions={filteredDescriptions}
                  selectedDescription={selectedDescription}
                  setSelectedDescription={handleDescriptionSelection}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}
              
              {step === 3 && selectedDescription && (
                <ReasonStep
                  reasons={filteredReasons}
                  selectedReason={selectedReason}
                  setSelectedReason={setSelectedReason}
                  handleSubmit={handleSubmit}
                  prevStep={prevStep}
                />
              )}
              
              <ProgressIndicator step={step} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodCheckinCard;