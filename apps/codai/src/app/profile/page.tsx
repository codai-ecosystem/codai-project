"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  preferences?: {
    theme: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisible: boolean;
      activityVisible: boolean;
    };
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    theme: "light",
    language: "en",
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData({
          name: data.name || "",
          theme: data.preferences?.theme || "light",
          language: data.preferences?.language || "en",
          notifications: data.preferences?.notifications || {
            email: true,
            push: true,
            inApp: true,
          },
          privacy: data.preferences?.privacy || {
            profileVisible: true,
            activityVisible: false,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {profile.name?.charAt(0) || profile.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-500">{profile.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    {profile.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.theme}
                        onChange={(e) => setEditData(prev => ({ ...prev, theme: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{profile.preferences?.theme || "light"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.language}
                        onChange={(e) => setEditData(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.preferences?.language || "en"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {["email", "push", "inApp"].map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type === "inApp" ? "In-App" : type} Notifications
                      </span>
                    </div>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editData.notifications[type as keyof typeof editData.notifications]}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [type]: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.preferences?.notifications?.[type as keyof typeof profile.preferences.notifications]
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}>
                        {profile.preferences?.notifications?.[type as keyof typeof profile.preferences.notifications] ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
              <div className="space-y-3">
                {[
                  { key: "profileVisible", label: "Profile Visible to Others" },
                  { key: "activityVisible", label: "Activity Visible to Others" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editData.privacy[item.key as keyof typeof editData.privacy]}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            [item.key]: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.preferences?.privacy?.[item.key as keyof typeof profile.preferences.privacy]
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}>
                        {profile.preferences?.privacy?.[item.key as keyof typeof profile.preferences.privacy] ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
