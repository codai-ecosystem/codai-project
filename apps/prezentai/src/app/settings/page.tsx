'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
  Globe,
  Key,
  Database,
  Monitor,
  Smartphone,
  Tablet,
  Mail,
  MessageSquare,
  Slack,
  Zap,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  Edit,
  Link,
  Cloud,
  HardDrive,
  Lock,
  Unlock,
  Camera,
  Mic,
  Video,
  Share2,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  company: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  comments: boolean;
  shares: boolean;
  mentions: boolean;
  updates: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  presentationDefaults: 'public' | 'team' | 'private';
  activityTracking: boolean;
  analytics: boolean;
  dataSharing: boolean;
}

interface ExportSettings {
  format: 'pdf' | 'pptx' | 'html' | 'video';
  quality: 'high' | 'medium' | 'low';
  includeNotes: boolean;
  includeComments: boolean;
  watermark: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    avatar: 'gradient-to-br from-purple-500 to-pink-500',
    role: 'Team Lead',
    company: 'Acme Corporation',
    timezone: 'UTC-8 (Pacific Time)',
    language: 'English (US)'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    comments: true,
    shares: true,
    mentions: true,
    updates: false
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'team',
    presentationDefaults: 'team',
    activityTracking: true,
    analytics: true,
    dataSharing: false
  });

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    quality: 'high',
    includeNotes: true,
    includeComments: false,
    watermark: true
  });

  const handleSave = () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const integrations = [
    { name: 'Slack', icon: <Slack className="w-5 h-5" />, connected: true, description: 'Share presentations in Slack channels' },
    { name: 'Google Drive', icon: <Cloud className="w-5 h-5" />, connected: true, description: 'Sync presentations with Google Drive' },
    { name: 'Dropbox', icon: <Cloud className="w-5 h-5" />, connected: false, description: 'Backup presentations to Dropbox' },
    { name: 'Microsoft Teams', icon: <MessageSquare className="w-5 h-5" />, connected: false, description: 'Collaborate via Microsoft Teams' },
    { name: 'Zoom', icon: <Video className="w-5 h-5" />, connected: true, description: 'Present directly in Zoom meetings' },
    { name: 'Zapier', icon: <Zap className="w-5 h-5" />, connected: false, description: 'Automate workflows with Zapier' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Settings & Preferences
              </h1>
              <p className="text-gray-600 mt-1">
                Customize your PrezentAI experience and manage your account
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-purple-200 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Overview', href: '/prezentai', current: false },
              { name: 'Presentations', href: '/prezentai/presentations', current: false },
              { name: 'Templates', href: '/prezentai/templates', current: false },
              { name: 'Media Library', href: '/prezentai/media', current: false },
              { name: 'Analytics', href: '/prezentai/analytics', current: false },
              { name: 'Collaboration', href: '/prezentai/collaboration', current: false },
              { name: 'Settings', href: '/prezentai/settings', current: true },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Save Notification */}
      {showSaveNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Settings saved successfully!</span>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 sticky top-32">
              <nav className="space-y-2">
                {[
                  { id: 'profile', name: 'Profile', icon: <User className="w-4 h-4" /> },
                  { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                  { id: 'privacy', name: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
                  { id: 'appearance', name: 'Appearance', icon: <Palette className="w-4 h-4" /> },
                  { id: 'export', name: 'Export Settings', icon: <Download className="w-4 h-4" /> },
                  { id: 'integrations', name: 'Integrations', icon: <Globe className="w-4 h-4" /> },
                  { id: 'api', name: 'API & Access', icon: <Key className="w-4 h-4" /> },
                  { id: 'storage', name: 'Storage & Data', icon: <Database className="w-4 h-4" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${activeTab === item.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>

                  <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6">
                      <div className={`w-20 h-20 bg-${userProfile.avatar} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                        {userProfile.name.charAt(0)}
                      </div>
                      <div>
                        <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <span>Change Photo</span>
                        </button>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          value={userProfile.role}
                          onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                          type="text"
                          value={userProfile.company}
                          onChange={(e) => setUserProfile({ ...userProfile, company: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={userProfile.timezone}
                          onChange={(e) => setUserProfile({ ...userProfile, timezone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                        >
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC+0 (Greenwich Time)</option>
                          <option>UTC+1 (Central European Time)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={userProfile.language}
                          onChange={(e) => setUserProfile({ ...userProfile, language: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                        >
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Password & Security</h3>
                  <div className="space-y-4">
                    <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Enable Two-Factor Authentication</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>

                <div className="space-y-6">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-50">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-sm text-gray-500">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'push' && 'Browser push notifications'}
                          {key === 'comments' && 'New comments on your presentations'}
                          {key === 'shares' && 'When someone shares with you'}
                          {key === 'mentions' && 'When you are mentioned'}
                          {key === 'updates' && 'Product updates and announcements'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Security Settings</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-white/50 rounded-lg border border-purple-50">
                    <h4 className="font-medium text-gray-900 mb-2">Profile Visibility</h4>
                    <p className="text-sm text-gray-500 mb-4">Control who can see your profile information</p>
                    <div className="space-y-2">
                      {['public', 'team', 'private'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={option}
                            checked={privacySettings.profileVisibility === option}
                            onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as any })}
                            className="mr-3 text-purple-600"
                          />
                          <span className="capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/50 rounded-lg border border-purple-50">
                    <h4 className="font-medium text-gray-900 mb-2">Default Presentation Privacy</h4>
                    <p className="text-sm text-gray-500 mb-4">Default privacy setting for new presentations</p>
                    <div className="space-y-2">
                      {['public', 'team', 'private'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="presentationDefaults"
                            value={option}
                            checked={privacySettings.presentationDefaults === option}
                            onChange={(e) => setPrivacySettings({ ...privacySettings, presentationDefaults: e.target.value as any })}
                            className="mr-3 text-purple-600"
                          />
                          <span className="capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {['activityTracking', 'analytics', 'dataSharing'].map((key) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-50">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-sm text-gray-500">
                          {key === 'activityTracking' && 'Track activity for analytics and improvements'}
                          {key === 'analytics' && 'Allow collection of usage analytics'}
                          {key === 'dataSharing' && 'Share anonymized data for product improvement'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings[key as keyof PrivacySettings] as boolean}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Settings */}
            {activeTab === 'export' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Export & Download Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Export Format</label>
                    <select
                      value={exportSettings.format}
                      onChange={(e) => setExportSettings({ ...exportSettings, format: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                    >
                      <option value="pdf">PDF</option>
                      <option value="pptx">PowerPoint (PPTX)</option>
                      <option value="html">HTML</option>
                      <option value="video">Video (MP4)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Quality</label>
                    <select
                      value={exportSettings.quality}
                      onChange={(e) => setExportSettings({ ...exportSettings, quality: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                    >
                      <option value="high">High Quality</option>
                      <option value="medium">Medium Quality</option>
                      <option value="low">Low Quality (Faster)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {['includeNotes', 'includeComments', 'watermark'].map((key) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-50">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-sm text-gray-500">
                          {key === 'includeNotes' && 'Include speaker notes in exports'}
                          {key === 'includeComments' && 'Include comments and feedback'}
                          {key === 'watermark' && 'Add PrezentAI watermark to exports'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportSettings[key as keyof ExportSettings] as boolean}
                          onChange={(e) => setExportSettings({ ...exportSettings, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Connected Services</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {integrations.map((integration) => (
                    <div key={integration.name} className="p-4 bg-white/50 rounded-lg border border-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {integration.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                            <p className="text-sm text-gray-500">{integration.description}</p>
                          </div>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${integration.connected
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                        >
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                      {integration.connected && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          <span>Connected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">API Access</h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">API Key Security</h4>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        Keep your API key secure. Don't share it in publicly accessible areas.
                      </p>
                    </div>

                    <div className="p-4 bg-white/50 rounded-lg border border-purple-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Personal API Key</h4>
                          <p className="text-sm text-gray-500">Use this key to access PrezentAI API</p>
                        </div>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                          {showApiKey ? 'prezai_pk_1234567890abcdef' : '••••••••••••••••••••••••'}
                        </code>
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex space-x-3">
                        <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200">
                          Regenerate Key
                        </button>
                        <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200">
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">API Usage</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">1,247</div>
                      <div className="text-sm text-gray-500">API Calls This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">89%</div>
                      <div className="text-sm text-gray-500">Rate Limit Used</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">99.8%</div>
                      <div className="text-sm text-gray-500">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Settings */}
            {activeTab === 'storage' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Storage & Data Management</h3>

                <div className="space-y-6">
                  {/* Storage Usage */}
                  <div className="p-4 bg-white/50 rounded-lg border border-purple-50">
                    <h4 className="font-medium text-gray-900 mb-4">Storage Usage</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Presentations</span>
                        <span className="text-sm font-medium">2.4 GB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Used: 2.4 GB</span>
                        <span>Available: 5 GB</span>
                      </div>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="p-4 bg-white/50 rounded-lg border border-purple-50">
                    <h4 className="font-medium text-gray-900 mb-2">Export Your Data</h4>
                    <p className="text-sm text-gray-500 mb-4">Download all your presentations and data</p>
                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Request Data Export</span>
                    </button>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">PrezentAI Settings</h3>
              <p className="text-purple-200 mb-6 max-w-md">
                Customize your presentation experience with advanced settings and preferences.
                Control privacy, notifications, integrations, and more.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Shield className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Account Settings</h4>
              <ul className="space-y-2 text-purple-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Profile Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Controls</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Security Options</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Data Export</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform Features</h4>
              <ul className="space-y-2 text-purple-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">API Access</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Export Options</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Storage Management</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200 text-sm">
              © 2025 PrezentAI Settings. Complete control over your presentation platform.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                ⚙️ All Settings Configured
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
