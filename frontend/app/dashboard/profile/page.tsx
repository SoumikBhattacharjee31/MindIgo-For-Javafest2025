'use client'

import useStore from "@/app/store/store";
import Image from "next/image";
import { useState } from "react";

interface Activity {
  id: number;
  description: string;
  timestamp: string;
}

const Profile = () => {
  const { user, setUser } = useStore();

  // Demo data for recent activities
  const [activities] = useState<Activity[]>([
    { id: 1, description: "Logged in successfully", timestamp: "2025-08-27 10:00 AM" },
    { id: 2, description: "Updated profile image", timestamp: "2025-08-26 03:45 PM" },
    { id: 3, description: "Listened to story: 'The Adventure Begins'", timestamp: "2025-08-25 08:30 PM" },
    { id: 4, description: "Verified email address", timestamp: "2025-08-24 11:15 AM" },
    { id: 5, description: "Changed password", timestamp: "2025-08-23 05:00 PM" },
    { id: 6, description: "Logged out", timestamp: "2025-08-22 09:45 PM" },
  ]);

  // Demo audio URL (replace with actual link when available)
  const demoAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* Left: Profile Card (40% width) */}
      <div className="w-[40%] p-8 bg-white shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Profile</h2>
        <div className="flex flex-col items-center">
          <Image
            src={user?.profileImageUrl ? user.profileImageUrl : "/default-profile.png"}
            alt="Profile Image"
            width={150}
            height={150}
            className="rounded-full mb-4"
          />
          <p className="text-xl font-semibold">{user?.name || "N/A"}</p>
          <p className="text-gray-600">{user?.email || "N/A"}</p>
        </div>
        <div className="mt-6 space-y-2">
          <p><strong>Role:</strong> {user?.role || "N/A"}</p>
          <p><strong>Date of Birth:</strong> {user?.dateOfBirth || "N/A"}</p>
          <p><strong>Gender:</strong> {user?.gender || "N/A"}</p>
          <p><strong>Created At:</strong> {user?.createdAt || "N/A"}</p>
          <p><strong>Last Login At:</strong> {user?.lastLoginAt || "N/A"}</p>
          <p><strong>Email Verified:</strong> {user?.emailVerified ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Right: Last Heard Story (top) and Recent Activities (bottom) */}
      <div className="w-[60%] flex flex-col">
        {/* Top Right: Last Heard Story */}
        <div className="h-[50%] p-8 bg-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">Last Heard Story</h2>
          <p className="mb-4 text-gray-600">Demo audio story (replace with actual link)</p>
          <audio controls className="w-full">
            <source src={demoAudioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Bottom Right: Scrollable Recent Activities */}
        <div className="h-[50%] p-8 bg-white shadow-lg overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">Recent Activities</h2>
          <ul className="space-y-2">
            {activities.map((activity) => (
              <li key={activity.id} className="border-b py-2">
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">{activity.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;