import { useState, useEffect } from "react";
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

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { successToast, errorToast } from '@/util/toastHelper';

const MoodCheckinCard = () => {
  const [moodData, setMoodData] = useState<Entry[]>([]);
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [step, setStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedDescription, setSelectedDescription] =
    useState<Description | null>(null);
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter helpers
  const filteredDescriptions: Description[] = selectedMood
    ? descriptions.filter((d) => d.moods.includes(selectedMood.id))
    : [];

  const filteredReasons: Reason[] = selectedMood
    ? reasons.filter((r) => r.moods.includes(selectedMood.id))
    : [];

  // Load mood data from API
  const loadMoodData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = formatDateForApi(new Date());
      const moodResponses = await moodApi.getMoods(7, today);
      
      // Convert API responses to Entry format
      const entries = moodResponses.map(convertMoodResponseToEntry);
      setMoodData(entries);

      successToast('Mood data loaded successfully.');

      // Check if today's entry exists
      const todayEntryData = entries.find((e: Entry) => e.date === today);
      setTodayEntry(todayEntryData || null);

      if (todayEntryData) {
        // Restore selection for today's entry
        const mood = moods.find((m) => m.id === todayEntryData.mood) || null;
        const description = descriptions.find((d) => d.text === todayEntryData.description) || null;
        const reason = reasons.find((r) => r.text === todayEntryData.reason) || null;

        setSelectedMood(mood);
        setSelectedDescription(description);
        setSelectedReason(reason);
      }
    } catch (err) {
      console.error('Failed to load mood data:', err);
      errorToast('Failed to load mood data. '+err);
      setError('Failed to load mood data. Please try again.');
      // Fallback to empty array if API fails
      setMoodData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoodData();
  }, []);

  const handleEdit = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTodayEntry(null);
      setStep(1);
      setSelectedMood(null);
      setSelectedDescription(null);
      setSelectedReason(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async (reason: Reason) => {
    if (!selectedMood || !selectedDescription) return;

    try {
      setIsAnimating(true);
      setError(null);
      
      const today = formatDateForApi(new Date());
      const moodRequest = convertEntryToMoodRequest({
        date: today,
        mood: selectedMood.id,
        description: selectedDescription.text,
        reason: reason.text,
      });

      // Call API to set mood
      const moodResponse = await moodApi.setMood(moodRequest);
      
      setTimeout(() => {
        // Convert response back to Entry format
        const newEntry = convertMoodResponseToEntry(moodResponse);
        setTodayEntry(newEntry);
        
        // Update local mood data
        const updatedMoodData = [...moodData.filter((e) => e.date !== today), newEntry];
        setMoodData(updatedMoodData);
        setStep(1);
        setIsAnimating(false);
      }, 300);
      successToast('Mood saved successfully.');
      console.log('Mood saved successfully:', selectedMood);
    } catch (err) {
      console.error('Failed to save mood:', err);
      errorToast('Failed to save mood. '+err);
      setError('Failed to save mood. Please try again.');
      setIsAnimating(false);
    }
  };

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setIsAnimating(false);
    }, 200);
  };

  const prevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setIsAnimating(false);
    }, 200);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 p-6 flex items-center justify-center relative rounded-2xl">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/2 w-full h-full relative overflow-hidden flex items-center justify-center">
          <div className="text-white text-lg">Loading your mood data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 p-6 flex items-center justify-center relative rounded-2xl">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/2 w-full h-full relative overflow-hidden">
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-red-200 hover:text-white"
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
                  setSelectedMood={(m) => {
                    setSelectedMood(m);
                    setSelectedDescription(null);
                    setSelectedReason(null);
                  }}
                  nextStep={nextStep}
                />
              )}
              {step === 2 && selectedMood && (
                <DescriptionStep
                  descriptions={filteredDescriptions}
                  selectedDescription={selectedDescription}
                  setSelectedDescription={(d) => {
                    setSelectedDescription(d);
                    setSelectedReason(null);
                  }}
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
      <ToastContainer />
    </div>
  );
};

export default MoodCheckinCard;