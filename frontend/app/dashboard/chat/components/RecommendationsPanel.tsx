import React, { useMemo } from 'react';
import { Heart, Music, UserPlus, Wind, Phone, Lightbulb, Sparkles } from 'lucide-react';
import { Recommendation } from '../dataType';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

const RecommendationsPanel = ({ recommendations }: RecommendationsPanelProps) => {
  // Sort recommendations by priority (urgency)
  const getSortedRecommendations = useMemo(() => {
    const urgencyOrder = { 'immediate': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return [...recommendations].sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 4;
      const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 4;
      return aOrder - bOrder;
    });
  }, [recommendations]);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-5 h-5 text-purple-600" />;
      case 'doctor': return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'breathing_exercise': return <Wind className="w-5 h-5 text-teal-600" />;
      case 'emergency_contact': return <Phone className="w-5 h-5 text-red-600" />;
      case 'mood_insight': return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      default: return <Heart className="w-5 h-5 text-rose-600" />;
    }
  };

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'immediate': 
        return {
          container: 'border-red-200/50 bg-gradient-to-br from-red-50/80 via-rose-50/60 to-pink-50/40 shadow-red-100/50',
          badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
          text: 'bg-red-100/80 text-red-800 border border-red-200/50'
        };
      case 'high':
        return {
          container: 'border-amber-200/50 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/40 shadow-amber-100/50',
          badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
          text: 'bg-amber-100/80 text-amber-800 border border-amber-200/50'
        };
      case 'medium':
        return {
          container: 'border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 shadow-blue-100/50',
          badge: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25',
          text: 'bg-blue-100/80 text-blue-800 border border-blue-200/50'
        };
      default:
        return {
          container: 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-green-50/40 shadow-emerald-100/50',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25',
          text: 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50'
        };
    }
  };

  return (
    <div className="w-80 h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border-l border-indigo-100/50 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white border-b border-violet-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Recommendations</h3>
              <p className="text-violet-100 text-sm">Tailored for your wellbeing</p>
            </div>
          </div>
          {recommendations.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              <span className="text-xs font-medium">{recommendations.length}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollBehavior: 'smooth' }}>
        {recommendations.length === 0 ? (
          <div className="text-center text-slate-500 flex items-center justify-center h-full">
            <div className="bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-indigo-50/40 backdrop-blur-sm p-8 rounded-3xl border border-violet-100/50 shadow-lg">
              <Heart className="w-12 h-12 mx-auto mb-4 text-violet-400" />
              <p className="text-sm font-medium text-slate-700 mb-2">Personalized Care</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                As we chat, I'll suggest helpful resources, activities, and support options tailored just for you.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Priority Header */}
            {recommendations.length > 1 && (
              <div className="sticky top-0 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-violet-200/50 mb-4 z-10 shadow-sm">
                <p className="text-xs text-violet-700 font-medium text-center">
                  Sorted by priority • {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            
            {getSortedRecommendations.map((rec, index) => {
              const styles = getUrgencyStyle(rec.urgency);
              
              return (
                <div
                  key={index}
                  className={`border-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg backdrop-blur-sm hover:shadow-xl ${styles.container} group`}
                >
                  {/* Priority Badge */}
                  <div className="absolute -top-2 -right-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${styles.badge}`}>
                      {rec.urgency === 'immediate' ? '!' :
                       rec.urgency === 'high' ? 'H' :
                       rec.urgency === 'medium' ? 'M' : 'L'}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm mb-2 leading-snug">{rec.title}</h4>
                      <p className="text-xs text-slate-700 mb-3 leading-relaxed opacity-90">{rec.reason}</p>
                      <div className={`text-xs px-3 py-2 rounded-full inline-block font-semibold backdrop-blur-sm ${styles.text}`}>
                        {rec.urgency.toUpperCase()} PRIORITY
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle animation on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
            
            {/* Bottom spacing */}
            <div className="h-4"></div>
          </>
        )}
      </div>
    </div>
  );
};


export default RecommendationsPanel;