import {Clock, Calendar } from 'lucide-react';
import { LastSession } from '../../dataTypes';

interface LastSessionBodyProps {
    session: LastSession;
}

const LastSessionBody = ({ session }: LastSessionBodyProps) => {
    const completionPercentage = Math.round((session.completedCycles / session.totalCycles) * 100);
    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Last Session</h3>
            </div>

            <div className={`bg-gradient-to-bl from-indigo-500 to-purple-700 rounded-xl p-4 mb-4`}>
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

}

export default LastSessionBody;