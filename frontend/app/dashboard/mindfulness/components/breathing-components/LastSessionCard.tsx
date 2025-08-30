import {Play, Clock, Calendar } from 'lucide-react';
import { LastSession } from '../../dataTypes';

const LastSessionCard = ({ session }: { session: LastSession | null }) => {
  if (!session) {
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
          <p className="text-white/40 text-xs mt-1">Start your first breathing exercise</p>
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round((session.completedCycles / session.totalCycles) * 100);

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Last Session</h3>
      </div>
      
      <div className={`${session.gradient} rounded-xl p-4 mb-4`}>
        <h4 className="text-white font-medium mb-2">{session.exerciseTitle}</h4>
        <div className="flex items-center justify-between text-white/90 text-sm mb-2">
          <span>{session.completedCycles}/{session.totalCycles} cycles</span>
          <span>{completionPercentage}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-3">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-white/70 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {session.date}
          </div>
          <span className="text-white/70 text-xs">{session.duration}m</span>
        </div>
      </div>

      <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg transition-colors">
        Continue Session
      </button>
    </div>
  );
};

export default LastSessionCard;