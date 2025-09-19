import { Suspense } from "react";
import MindfulnessContent from "./components/MindfulnessContent";

// Loading component for the mindfulness page
const MindfulnessLoading = () => (
  <div className="h-full w-full px-4 pb-4 pt-0 flex items-center justify-center">
    <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-800 text-lg font-medium mb-2">Loading Mindfulness</p>
      <p className="text-gray-600 text-sm">Preparing your wellness activities</p>
    </div>
  </div>
);

const MindfulnessPage = () => {
  return (
    <Suspense fallback={<MindfulnessLoading />}>
      <MindfulnessContent key={1}/>
    </Suspense>
  );
};

export default MindfulnessPage;