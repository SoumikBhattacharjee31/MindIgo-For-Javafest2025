import { Brain, Wind, Calendar, Plus } from "lucide-react";

const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Plus className="w-5 h-5 text-green-500" />
        Quick Actions 🚀
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Jump in and start building your wellness story!
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-105 group">
          <Brain className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
          <span className="text-xs font-medium block">Meditate</span>
          <span className="text-xs text-blue-600 opacity-75">
            & Log Your Mood! 😊
          </span>
        </button>
        <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all transform hover:scale-105 group">
          <Wind className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
          <span className="text-xs font-medium block">Breathe</span>
          <span className="text-xs text-green-600 opacity-75">
            & Feel Amazing! 🌿
          </span>
        </button>
        <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all transform hover:scale-105 group">
          <Calendar className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
          <span className="text-xs font-medium block">Journal</span>
          <span className="text-xs text-purple-600 opacity-75">
            & Reflect! ✨
          </span>
        </button>
        <button className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all transform hover:scale-105 group">
          <Plus className="w-5 h-5 mx-auto mb-1 group-hover:animate-pulse" />
          <span className="text-xs font-medium block">Add Entry</span>
          <span className="text-xs text-orange-600 opacity-75">
            & Unlock Insights! 🔍
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
