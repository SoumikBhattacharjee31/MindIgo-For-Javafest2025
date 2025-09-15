import { Heart, Music, UserPlus, Wind, Phone, Lightbulb, Sparkles } from 'lucide-react';
import { Recommendation } from '../dataType';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

const RecommendationsPanel = ({ recommendations }: RecommendationsPanelProps) => {
  // Sort recommendations by priority (urgency)
  const getSortedRecommendations = () => {
    const urgencyOrder = { 'immediate': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return [...recommendations].sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 4;
      const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 4;
      return aOrder - bOrder;
    });
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-5 h-5 text-purple-600" />;
      case 'doctor': return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'breathing_exercise': return <Wind className="w-5 h-5 text-teal-600" />;
      case 'emergency_contact': return <Phone className="w-5 h-5 text-red-600" />;
      case 'mood_insight': return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      default: return <Heart className="w-5 h-5 text-pink-600" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100';
      case 'high': return 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-100';
      case 'medium': return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-100';
      default: return 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-100';
    }
  };

  return (
    <div className="w-80 bg-white/80 backdrop-blur-lg border-l border-indigo-100 flex flex-col shadow-xl">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Recommendations</h3>
              <p className="text-purple-100 text-sm">Personalized for your wellbeing</p>
            </div>
          </div>
          {recommendations.length > 0 && (
            <div className="bg-white/20 px-2 py-1 rounded-full">
              <span className="text-xs font-medium">{recommendations.length}</span>
            </div>
          )}
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ 
          maxHeight: 'calc(100vh - 200px)', // Fixed height constraint
          scrollBehavior: 'smooth'
        }}
      >
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500 flex items-center justify-center min-h-[300px]">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <Heart className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <p className="text-sm font-medium text-gray-700 mb-2">Personalized Care</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                As we chat, I'll suggest helpful resources, activities, and support options tailored just for you.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Priority Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-purple-200 mb-4 z-10">
              <p className="text-xs text-purple-700 font-medium text-center">
                Sorted by priority • {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {getSortedRecommendations().map((rec, index) => (
              <div
                key={index}
                className={`border-2 rounded-2xl p-5 transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg ${getUrgencyColor(rec.urgency)} relative`}
              >
                {/* Priority Badge */}
                <div className="absolute -top-2 -right-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    rec.urgency === 'immediate' ? 'bg-red-500 text-white' :
                    rec.urgency === 'high' ? 'bg-orange-500 text-white' :
                    rec.urgency === 'medium' ? 'bg-yellow-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {rec.urgency === 'immediate' ? '!' :
                     rec.urgency === 'high' ? 'H' :
                     rec.urgency === 'medium' ? 'M' : 'L'}
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">{rec.title}</h4>
                    <p className="text-xs text-gray-700 mb-3 leading-relaxed">{rec.reason}</p>
                    <div className={`text-xs px-3 py-1.5 rounded-full inline-block font-semibold ${
                      rec.urgency === 'immediate' ? 'bg-red-200 text-red-800' :
                      rec.urgency === 'high' ? 'bg-orange-200 text-orange-800' :
                      rec.urgency === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-emerald-200 text-emerald-800'
                    }`}>
                      {rec.urgency.toUpperCase()} PRIORITY
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bottom spacing for better scroll experience */}
            <div className="h-4"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;