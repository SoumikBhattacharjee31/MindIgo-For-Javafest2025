import React from "react";
import { Message } from "@/app/dashboard/chat/dataType";

interface MainBodyHeaderProps {
  messages: Message[];
}

const MainBodyHeader = ({ messages }: MainBodyHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
          Chat Session
        </h1>
        <p className="text-slate-600 text-sm mt-1 font-medium">
          Share your thoughts in this safe space
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50/80 backdrop-blur-sm rounded-full border border-emerald-200/50">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-sm text-emerald-700 font-medium">
            Connected
          </span>
        </div>
        {messages.length > 0 && (
          <div className="px-3 py-1.5 bg-indigo-50/80 backdrop-blur-sm rounded-full border border-indigo-200/50">
            <span className="text-sm text-indigo-700 font-medium">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainBodyHeader;
