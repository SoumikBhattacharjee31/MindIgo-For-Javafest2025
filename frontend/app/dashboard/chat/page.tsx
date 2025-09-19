import React, { Suspense } from "react";
import ChatContainer from "./components/ChatContainer";

// Create a fallback loading component
const ChatLoading = () => (
  <div className="h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 overflow-hidden flex items-center justify-center">
    <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-800 text-lg font-medium mb-2">Loading MindChat</p>
      <p className="text-gray-600 text-sm">Preparing your wellness session</p>
    </div>
  </div>
);

export default function MentalHealthChat() {
  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 overflow-hidden">
      <Suspense fallback={<ChatLoading />}>
        <ChatContainer />
      </Suspense>
    </div>
  );
}
