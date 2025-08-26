"use client"
import { useState } from "react";
import MoodCheckinCard from "./components/MoodCheckinCard";
import NavigationTab from "./components/NavigationTab";

const MeditationCard = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl shadow-lg border border-green-200">
    <h2 className="text-2xl font-bold text-emerald-800 mb-4">Meditation</h2>
    <p className="text-emerald-600 mb-6">Find your inner peace with guided meditation.</p>
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-emerald-700">5-Minute Breathing</h3>
        <p className="text-sm text-emerald-600">Perfect for beginners</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-emerald-700">Body Scan</h3>
        <p className="text-sm text-emerald-600">Release tension and stress</p>
      </div>
    </div>
  </div>
);

const BreathingCard = () => (
  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-xl shadow-lg border border-purple-200">
    <h2 className="text-2xl font-bold text-violet-800 mb-4">Breathing Exercise</h2>
    <p className="text-violet-600 mb-6">Control your breath, control your mind.</p>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-24 h-24 bg-violet-200 rounded-full flex items-center justify-center">
        <div className="w-16 h-16 bg-violet-400 rounded-full animate-pulse"></div>
      </div>
      <button className="bg-violet-600 text-white px-6 py-2 rounded-full hover:bg-violet-700 transition-colors">
        Start Breathing
      </button>
    </div>
  </div>
);

const Mindfulness = () => {
    const [currentPage, setCurrentPage] = useState<number>(0);
    
    const tabs = [
        { label: "Mood Check-in", component: <MoodCheckinCard /> },
        { label: "Meditation", component: <MeditationCard /> },
        { label: "Breathing", component: <BreathingCard /> }
    ];

    return (
        <div className="h-full w-full px-4 pb-4 pt-0">
            <NavigationTab
                tabs={tabs}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />

            <div className="w-full">
                {tabs[currentPage].component}
            </div>
        </div>
    );
};

export default Mindfulness;