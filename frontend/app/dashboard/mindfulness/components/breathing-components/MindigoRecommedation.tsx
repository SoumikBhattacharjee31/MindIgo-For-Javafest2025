import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const MindigoRecommendation = () => {
  const recommendations = [
    {
      title: "Morning Energy Boost",
      exercise: "Box Breathing",
      reason: "Perfect for starting your day with focus",
      icon: "🌅",
      gradient: "bg-gradient-to-br from-orange-500 to-yellow-500"
    },
    {
      title: "Stress Relief",
      exercise: "Long Exhale",
      reason: "Based on your recent activity patterns",
      icon: "🧘‍♀️",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      title: "Better Sleep",
      exercise: "4-7-8 Breathing",
      reason: "Recommended for evening relaxation",
      icon: "🌙",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-500"
    }
  ];

  const [currentRec, setCurrentRec] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRec(prev => (prev + 1) % recommendations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = recommendations[currentRec];

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center mb-4">
        <Star className="w-5 h-5 text-yellow-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Mindigo Recommends</h3>
      </div>
      
      <div className={`${current.gradient} rounded-xl p-4 mb-4`}>
        <div className="text-2xl mb-2">{current.icon}</div>
        <h4 className="text-white font-medium mb-1">{current.title}</h4>
        <p className="text-white/90 text-sm mb-2">{current.exercise}</p>
        <p className="text-white/70 text-xs">{current.reason}</p>
      </div>

      {/* Recommendation dots */}
      <div className="flex justify-center space-x-2">
        {recommendations.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentRec ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MindigoRecommendation;