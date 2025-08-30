"use client"
import MoodCheckinCard from "./components/MoodCheckinCard";
import NavigationTab from "./components/NavigationTab";
import MeditationCard from "./components/MeditationCard";
import BreathingCard from "./components/BreathingCard";
import { parseAsInteger, useQueryState } from "nuqs";

const Mindfulness = () => {
    const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
    const tabs = [
        { label: "Mood Check-in", component: <MoodCheckinCard /> },
        { label: "Breathing", component: <BreathingCard /> },
        { label: "Meditation", component: <MeditationCard /> },
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