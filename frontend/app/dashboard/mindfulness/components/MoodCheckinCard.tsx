import { useState, useEffect } from "react";
import MoodLog from "./MoodLog";
import ProgressIndicator from "./ProgressIndicator";
import TodayEntryCard from "./TodayEntryCard";
import MoodStep from "./MoodStep";
import DescriptionStep from "./DescriptionStep";
import ReasonStep from "./ReasonStep";
import { Mood, Description, Reason, moods } from "./moodOptions";

import moodData from "../../mock/mood_data.json";

export interface Entry {
  date: string;
  mood: string;
  description: string;
  reason: string;
}

const MoodCheckinCard = () => {
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [step, setStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedDescription, setSelectedDescription] =
    useState<Description | null>(null);
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const entry = moodData.find((e: Entry) => e.date === today) as
      | Entry
      | undefined;
    setTodayEntry(entry ?? null);

    if (entry) {
      // restore selection
      const mood = moods.find((m) => m.emoji === entry.mood) || null;
      const description =
        mood?.descriptions.find((d) => d.text === entry.description) || null;
      const reason =
        description?.reasons.find((r) => r.text === entry.reason) || null;

      setSelectedMood(mood);
      setSelectedDescription(description);
      setSelectedReason(reason);
    }
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

  const handleSubmit = (reason: Reason) => {
    if (!selectedMood || !selectedDescription) return;

    setIsAnimating(true);
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      const newEntry: Entry = {
        date: today,
        mood: selectedMood.emoji,
        description: selectedDescription.text,
        reason: reason.text,
      };
      setTodayEntry(newEntry);
      setStep(1);
      setIsAnimating(false);
    }, 300);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 p-6 flex items-center justify-center relative rounded-2xl">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/2 w-full h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

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
                  descriptions={selectedMood.descriptions}
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
                  reasons={selectedDescription.reasons}
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
