'use client'

import useStore from "@/app/store/store";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { user, setUser } = useStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editable fields
  const [editableData, setEditableData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    profileImageUrl: "",
  });

  // Initialize editable data when user changes
  useEffect(() => {
    if (user) {
      setEditableData({
        name: user.name || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Update user data in store (API call would go here)
    // setUser({
    //   ...user,
    //   ...editableData
    // });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setEditableData({
        name: user.name || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300">
      {/* Main Profile Section */}
      <div className="w-full p-8 shadow-lg overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-600">Profile</h2>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Image and Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            <div className="flex flex-col items-center">
              <Image
                src={editableData.profileImageUrl || "/noimage.png"}
                alt="Profile Image"
                width={150}
                height={150}
                className="rounded-full mb-4 border-4 border-blue-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/noimage.png";
                }}
              />
              {isEditing && (
                <input
                  type="url"
                  placeholder="Profile Image URL"
                  value={editableData.profileImageUrl}
                  onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                  className="w-48 p-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            </div>

            <div className="flex-1 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-800">{user?.name || "N/A"}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editableData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-600">{user?.email || "N/A"}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editableData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-600">{user?.dateOfBirth || "N/A"}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    value={editableData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-lg text-gray-600">{user?.gender || "N/A"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-600">{user?.role || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
                <p className={`font-medium ${user?.emailVerified ? "text-green-600" : "text-red-600"}`}>
                  {user?.emailVerified ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-600">{user?.createdAt || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <p className="text-gray-600">{user?.lastLoginAt || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;