import { Play, Clock } from "lucide-react";
const LastSessionPlaceholder = () => {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Last Session</h3>
      </div>
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-white/40" />
        </div>
        <p className="text-white/60 text-sm">No sessions completed yet</p>
        <p className="text-white/40 text-xs mt-1">
          Start your first breathing exercise
        </p>
      </div>
    </div>
  );
};

export default LastSessionPlaceholder;
