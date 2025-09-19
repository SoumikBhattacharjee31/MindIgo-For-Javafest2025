"use client";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ActivityCard from "@/app/dashboard/components/ActivityCard";
import {
  moodApi,
  formatDateForApi,
} from "@/app/dashboard/mindfulness/api/moodApi";
import {
  cachedBreathingApi,
  breathingCache,
  formatDateForApi as breathingFormatDate,
} from "@/app/dashboard/mindfulness/api/breathingApi";

interface Activity {
  id: string;
  activity: string;
  time?: string;
  nudge: string;
  type: "mood" | "breathing";
  isCompleted: boolean;
}

const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const today = formatDateForApi(new Date());

  // Check breathing exercise status
  const checkBreathingStatus = async (): Promise<boolean> => {
    try {
      // Use direct API call since cached version is problematic
      console.log("Checking breathing status with direct API call for:", today);

      const response = await fetch(
        `http://localhost:8080/api/v1/content/breathing/session?date=${today}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Direct API response:", data);

        if (data.success && data.data) {
          console.log("Session found - breathing completed");
          return true;
        }
      }

      console.log("No session found - breathing not completed");
      return false;
    } catch (error) {
      console.error("Error checking breathing status:", error);
      return false;
    }
  };

  // Check mood data status
  const checkMoodStatus = async (): Promise<boolean> => {
    try {
      const moodData = await moodApi.getMoods(1, today);
      return moodData.some((entry) => entry.date === today);
    } catch (error) {
      console.error("Error checking mood status:", error);
      return false;
    }
  };

  // Load all activities and their statuses
  const loadActivities = async () => {
    setLoading(true);
    try {
      const isMoodCompleted = await checkMoodStatus();
      const isBreathingCompleted = await checkBreathingStatus();

      // Focus on core mental health activities only
      const activityList: Activity[] = [
        {
          id: "mood",
          activity: "Track Your Mood",
          time: "Anytime today",
          nudge: "How are you feeling today? 🌈",
          type: "mood",
          isCompleted: isMoodCompleted,
        },
        {
          id: "breathing",
          activity: "Breathing Exercise",
          time: "5 minutes",
          nudge: "Breathe in calm, breathe out stress 🌸",
          type: "breathing",
          isCompleted: isBreathingCompleted,
        },
      ];

      setActivities(activityList);
    } catch (error) {
      console.error("Error loading activities:", error);
      // Fallback to basic activities if API fails
      setActivities([
        {
          id: "mood",
          activity: "Track Your Mood",
          time: "Anytime today",
          nudge: "How are you feeling today? 🌈",
          type: "mood",
          isCompleted: false,
        },
        {
          id: "breathing",
          activity: "Breathing Exercise",
          time: "5 minutes",
          nudge: "Breathe in calm, breathe out stress 🌸",
          type: "breathing",
          isCompleted: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [today]);

  const handleActivityClick = (activity: Activity) => {
    if (activity.isCompleted) {
      return; // Don't do anything if already completed
    }

    switch (activity.type) {
      case "mood":
        router.push("/dashboard/mindfulness");
        break;
      case "breathing":
        // Route to breathing exercises page (page=1)
        router.push("/dashboard/mindfulness?page=1");
        break;
      default:
        break;
    }
  };

  const completedCount = activities.filter(
    (activity) => activity.isCompleted
  ).length;
  const totalCount = activities.length;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Your Fun Daily Reminders Await! 🎊
        </h3>
        <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {completedCount}/{totalCount}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Let's make today amazing together!{" "}
        {completedCount > 0 &&
          `Great job on completing ${completedCount} activities! 🌟`}
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => (
            <ActivityCard
              key={item.id}
              activity={item.activity}
              time={item.time}
              nudge={item.nudge}
              type={item.type}
              isCompleted={item.isCompleted}
              onClick={() => handleActivityClick(item)}
            />
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No activities for today</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityList;
