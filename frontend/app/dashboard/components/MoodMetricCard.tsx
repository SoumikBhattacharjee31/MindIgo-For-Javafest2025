'use client';
import React, { useState, useEffect } from 'react';
import { Smile, TrendingUp, TrendingDown, Minus, MoreVertical, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { moodApi, formatDateForApi } from '../mindfulness/api/moodApi';
import { moods } from '../mindfulness/moods';
import { errorToast } from '@/util/toastHelper';

interface MoodData {
  mood: string;
  date: string;
  description: string;
  reason: string;
}

const MoodMetricCard: React.FC = () => {
  const [todayMood, setTodayMood] = useState<MoodData | null>(null);
  const [yesterdayMood, setYesterdayMood] = useState<MoodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const today = formatDateForApi(new Date());
  const yesterday = formatDateForApi(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const loadMoodData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch last 2 days of mood data
      const moodData = await moodApi.getMoods(2, today);
      
      // Find today's and yesterday's mood
      const todayEntry = moodData.find(entry => entry.date === today) || null;
      const yesterdayEntry = moodData.find(entry => entry.date === yesterday) || null;
      
      setTodayMood(todayEntry);
      setYesterdayMood(yesterdayEntry);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load mood data';
      setError(errorMessage);
      // Don't show toast on initial load failure, just show in UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoodData();
  }, [today]);

  const getMoodDetails = (moodId: string) => {
    return moods.find(m => m.id === moodId) || { emoji: '😐', label: 'Unknown', color: 'from-gray-500 to-gray-600' };
  };

  const getMoodComparison = () => {
    if (!todayMood || !yesterdayMood) return null;

    // Simple mood ranking for comparison (higher = better)
    const moodRanks: { [key: string]: number } = {
      'terrible': 1,
      'sad': 2,
      'angry': 3,
      'anxious': 4,
      'neutral': 5,
      'relaxed': 6,
      'happy': 7,
      'motivated': 8,
      'excited': 9,
      'amazing': 10
    };

    const todayRank = moodRanks[todayMood.mood] || 5;
    const yesterdayRank = moodRanks[yesterdayMood.mood] || 5;

    if (todayRank > yesterdayRank) {
      return { trend: 'up', text: '↗ Improving', color: 'text-green-700 bg-green-100' };
    } else if (todayRank < yesterdayRank) {
      return { trend: 'down', text: '↘ Declining', color: 'text-red-700 bg-red-100' };
    } else {
      return { trend: 'neutral', text: '→ Stable', color: 'text-gray-700 bg-gray-100' };
    }
  };

  const handleCardClick = () => {
    if (!todayMood) {
      // Redirect to mindfulness page if no mood data for today
      router.push('/dashboard/mindfulness');
    }
    setMenuOpen(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleViewMindfulness = () => {
    router.push('/dashboard/mindfulness');
    setMenuOpen(false);
  };

  const getEncouragement = (moodData: MoodData | null) => {
    if (!moodData) return "Track your mood to unlock insights! 🌈";
    
    const moodDetails = getMoodDetails(moodData.mood);
    
    switch (moodData.mood) {
      case 'amazing':
      case 'excited':
        return "You're radiating positive energy! ✨";
      case 'happy':
      case 'motivated':
        return "Great mood! Keep the momentum going! 😊";
      case 'relaxed':
        return "Peaceful vibes! Balance is beautiful 🧘‍♀️";
      case 'neutral':
        return "Steady as you go! Every day is progress 📈";
      case 'anxious':
        return "Take a deep breath. You've got this! 💪";
      case 'sad':
      case 'angry':
        return "It's okay to feel this way. Tomorrow is new 🌅";
      case 'terrible':
        return "Tough day? Remember, you're stronger than you know 💝";
      default:
        return "Your feelings matter. Keep tracking! 💙";
    }
  };

  return (
    <>
      <div 
        className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative ${
          !todayMood ? 'cursor-pointer' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Header with menu */}
        <div className="flex items-center justify-between mb-4">
          <Smile className="w-5 h-5 text-yellow-500" />
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-20">
                  <button
                    onClick={handleViewMindfulness}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                    View Mindfulness
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-red-500 text-sm mb-2">Failed to load</div>
            <button
              onClick={loadMoodData}
              className="text-blue-500 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        ) : todayMood ? (
          <>
            {/* Mood data exists */}
            <h3 className="text-gray-600 text-sm font-medium">Today's Mood</h3>
            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodDetails(todayMood.mood).emoji}</span>
                <p className="text-2xl font-bold text-gray-900">
                  {getMoodDetails(todayMood.mood).label}
                </p>
              </div>
              {(() => {
                const comparison = getMoodComparison();
                return comparison ? (
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${comparison.color}`}>
                    {comparison.text}
                  </span>
                ) : null;
              })()}
            </div>

            {/* Mood description if available */}
            {todayMood.description && (
              <div className="text-xs text-gray-600 mb-3">
                <span className="font-medium">Feeling:</span> {todayMood.description}
              </div>
            )}

            <p className="text-xs text-purple-600 font-medium">
              {getEncouragement(todayMood)}
            </p>
          </>
        ) : (
          <>
            {/* No mood data */}
            <h3 className="text-gray-600 text-sm font-medium">Today's Mood</h3>
            <p className="text-2xl font-bold text-gray-400 mt-1 mb-3">Not tracked</p>
            <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Click to add today's mood</span>
            </div>
            <p className="text-xs text-purple-600 font-medium">
              {getEncouragement(null)}
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default MoodMetricCard;