'use client';

import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Key, Camera,
  Edit3, Save, X, Check, AlertCircle, Eye, EyeOff, Upload,
  CreditCard, Globe, Bell, Lock, Smartphone, Download,
  Settings, Activity, FileText, HelpCircle, LogOut, Trash2
} from 'lucide-react';
import { useSession } from '../../lib/auth';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string;
  profilePicture: string;
  accountType: 'personal' | 'business' | 'premium';
  memberSince: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    currency: string;
    timezone: string;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    id: '12345',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    dateOfBirth: '1990-05-15',
    profilePicture: '',
    accountType: 'premium',
    memberSince: '2022-01-15',
    lastLogin: '2025-01-16T08:30:00Z',
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    kycStatus: 'verified',
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York'
    }
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Add API call here
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'activity', name: 'Activity', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="mt-2 flex justify-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getAccountTypeColor(profile.accountType)}`}>
                    {profile.accountType.charAt(0).toUpperCase() + profile.accountType.slice(1)} Account
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                    <Download className="h-4 w-4 mr-3" />
                    Download Data
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help Center
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.firstName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.lastName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="flex items-center">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2 flex-1">{profile.email}</p>
                        )}
                        {profile.emailVerified && (
                          <Check className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="flex items-center">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedProfile.phone}
                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 py-2 flex-1">{profile.phone}</p>
                        )}
                        {profile.phoneVerified && (
                          <Check className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedProfile.dateOfBirth}
                          onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{formatDate(profile.dateOfBirth)}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={editedProfile.address.street}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile,
                              address: { ...editedProfile.address, street: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="City"
                              value={editedProfile.address.city}
                              onChange={(e) => setEditedProfile({
                                ...editedProfile,
                                address: { ...editedProfile.address, city: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={editedProfile.address.state}
                              onChange={(e) => setEditedProfile({
                                ...editedProfile,
                                address: { ...editedProfile.address, state: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="ZIP Code"
                              value={editedProfile.address.zipCode}
                              onChange={(e) => setEditedProfile({
                                ...editedProfile,
                                address: { ...editedProfile.address, zipCode: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={editedProfile.address.country}
                              onChange={(e) => setEditedProfile({
                                ...editedProfile,
                                address: { ...editedProfile.address, country: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-900 py-2">
                          <p>{profile.address.street}</p>
                          <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                          <p>{profile.address.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Account Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">KYC Status</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getKycStatusColor(profile.kycStatus)}`}>
                            {profile.kycStatus.charAt(0).toUpperCase() + profile.kycStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Member Since</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(profile.memberSince)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Login</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(profile.lastLogin).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>

                  {/* Password Change */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS Authentication</p>
                          <p className="text-sm text-gray-500">
                            {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium ${profile.twoFactorEnabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                      >
                        {profile.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-500">Chrome on Windows • New York, NY</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Active now</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Mobile App</p>
                            <p className="text-sm text-gray-500">iPhone • Last seen 2 hours ago</p>
                          </div>
                        </div>
                        <button className="text-sm text-red-600 hover:text-red-800">Revoke</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Preferences</h3>

                  {/* Notification Settings */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Transaction alerts and updates</p>
                          </div>
                        </div>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${profile.preferences.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.preferences.notifications.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                            <p className="text-sm text-gray-500">Mobile app notifications</p>
                          </div>
                        </div>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${profile.preferences.notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.preferences.notifications.push ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                            <p className="text-sm text-gray-500">Security alerts via SMS</p>
                          </div>
                        </div>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${profile.preferences.notifications.sms ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.preferences.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Regional Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Data & Privacy */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Data & Privacy</h4>
                    <div className="space-y-4">
                      <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Download className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Download Your Data</p>
                              <p className="text-sm text-gray-500">Get a copy of your account data</p>
                            </div>
                          </div>
                          <div className="text-gray-400">→</div>
                        </div>
                      </button>
                      <button className="w-full text-left p-4 border border-red-300 rounded-lg hover:bg-red-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Trash2 className="h-5 w-5 text-red-400" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Delete Account</p>
                              <p className="text-sm text-red-500">Permanently delete your account</p>
                            </div>
                          </div>
                          <div className="text-red-400">→</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Documents</h3>

                  <div className="space-y-4">
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Identity Document</p>
                            <p className="text-sm text-gray-500">Driver's License • Verified</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Verified
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Proof of Address</p>
                            <p className="text-sm text-gray-500">Utility Bill • Verified</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Verified
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </button>
                        </div>
                      </div>
                    </div>

                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Additional Documents</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Account Activity</h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Login from Chrome</p>
                        <p className="text-sm text-gray-500">New York, NY • 2 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Password changed</p>
                        <p className="text-sm text-gray-500">Yesterday at 3:42 PM</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Two-factor authentication enabled</p>
                        <p className="text-sm text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
