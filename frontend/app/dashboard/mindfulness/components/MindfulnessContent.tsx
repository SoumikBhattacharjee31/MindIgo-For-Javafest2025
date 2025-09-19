"use client";
import MoodCheckinCard from "./MoodCheckinCard";
import NavigationTab from "./NavigationTab";
import StoryCard from "./StoryCard";
import BreathingCard from "./BreathingCard";
import { parseAsInteger, useQueryState } from "nuqs";

const MindfulnessContent = () => {
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(0)
  );
  const tabs = [
    { label: "Mood Check-in", component: <MoodCheckinCard /> },
    { label: "Breathing", component: <BreathingCard /> },
    { label: "Story", component: <StoryCard /> },
  ];

  return (
    <div className="h-full w-full px-4 pb-4 pt-0">
      <NavigationTab
        tabs={tabs}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="w-full">{tabs[currentPage].component}</div>
    </div>
  );
};

export default MindfulnessContent;
