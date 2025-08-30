import { BreathingExercise } from '../../dataTypes';
import { Settings } from 'lucide-react';
import { JSX } from 'react';

interface BreathingExerciseCardProps {
  exercise: BreathingExercise;
  onCardClick: (exercise: BreathingExercise) => void;
  onSettingsClick: (exercise: BreathingExercise) => void;
}

const getGradient = (title: string) => {
  switch (title) {
    case "Box":
      return "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800";
    case "Long exhale":
      return "bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-800";
    case "Equal":
      return "bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-800";
    case "Custom":
      return "bg-gradient-to-br from-blue-700 via-blue-800 to-slate-800";
    default:
      return "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900";
  }
};

const getIconColor = (title: string) => {
  switch (title) {
    case "Box":
      return "bg-purple-400";
    case "Long exhale":
      return "bg-purple-300";
    case "Equal":
      return "bg-indigo-400";
    case "Custom":
      return "bg-blue-400";
    default:
      return "bg-gray-400";
  }
};

const getOverlappingCircles = (title: string): JSX.Element => {
  const colorClass = getIconColor(title);
  
  switch (title) {
    case "Box":
      return (
        <div className="absolute -top-6 -right-6 w-24 h-24 opacity-20">
          <div className={`absolute top-4 left-4 w-12 h-12 ${colorClass} rounded-2xl opacity-60 rotate-12`} />
          <div className={`absolute top-8 left-8 w-12 h-12 ${colorClass} rounded-2xl opacity-40 rotate-45`} />
        </div>
      );
    case "Long exhale":
      return (
        <div className="absolute -top-4 -right-8 w-32 h-20 opacity-25">
          <div className={`absolute top-2 left-2 w-16 h-6 ${colorClass} rounded-full opacity-70`} />
          <div className={`absolute top-6 left-8 w-20 h-4 ${colorClass} rounded-full opacity-50`} />
          <div className={`absolute top-12 left-4 w-24 h-8 ${colorClass} rounded-full opacity-30`} />
        </div>
      );
    case "Equal":
      return (
        <div className="absolute -top-4 -right-4 w-20 h-20 opacity-25">
          <div className={`absolute top-2 left-2 w-10 h-10 ${colorClass} rounded-full opacity-60`} />
          <div className={`absolute top-6 left-6 w-10 h-10 ${colorClass} rounded-full opacity-50`} />
          <div className={`absolute top-10 left-10 w-10 h-10 ${colorClass} rounded-full opacity-40`} />
        </div>
      );
    case "Custom":
      return (
        <div className="absolute -top-2 -right-2 w-20 h-20 opacity-20">
          <div className={`absolute top-0 left-0 w-8 h-8 ${colorClass} rounded-full opacity-70 animate-pulse`} />
          <div className={`absolute top-4 left-6 w-6 h-6 ${colorClass} rounded-full opacity-60`} />
          <div className={`absolute top-8 left-2 w-10 h-10 ${colorClass} rounded-full opacity-40`} />
          <div className={`absolute top-12 left-8 w-4 h-4 ${colorClass} rounded-full opacity-50`} />
        </div>
      );
    default:
      return (
        <div className="absolute -top-4 -right-4 w-20 h-20 opacity-25">
          <div className={`absolute top-2 left-2 w-8 h-8 ${colorClass} rounded-full opacity-60`} />
          <div className={`absolute top-6 left-6 w-8 h-8 ${colorClass} rounded-full opacity-50`} />
          <div className={`absolute top-10 left-4 w-8 h-8 ${colorClass} rounded-full opacity-40`} />
        </div>
      );
  }
};

const BreathingExerciseCard = ({
  exercise,
  onCardClick,
  onSettingsClick,
}: BreathingExerciseCardProps) => (
  <div
    className={`${getGradient(exercise.title)} w-60 h-60 p-6 rounded-3xl shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-white/10`}
    onClick={() => onCardClick(exercise)}
  >
    {/* Background decoration */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    
    {/* Overlapping circles decoration */}
    {getOverlappingCircles(exercise.title)}
    
    {/* Content */}
    <div className="relative z-10 h-full flex flex-col">
      {/* Title and Pattern */}
      <div className="mb-auto">
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{exercise.title}</h3>
        <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
          <p className="text-lg font-mono text-white/95 font-semibold">{exercise.pattern}</p>
        </div>
        <p className="text-sm text-white/80 leading-relaxed font-medium">{exercise.description}</p>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between mt-6">
        <div className="bg-white/15 backdrop-blur-sm px-3 py-2 rounded-xl">
          <span className="text-white font-semibold text-sm">{exercise.duration} mins</span>
        </div>
        <button
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick(exercise);
          }}
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  </div>
);

export default BreathingExerciseCard;