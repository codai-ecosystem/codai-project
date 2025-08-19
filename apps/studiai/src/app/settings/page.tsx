'use client'

import React, { useState } from 'react'
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Monitor,
  Volume2,
  Eye,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Info,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Database,
  Cloud,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Camera,
  Mic,
  MicOff,
  VolumeX,
  Sun,
  Moon,
  Zap,
  Target,
  Brain,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  MessageCircle,
  Share2,
  Flag,
  Languages,
  CreditCard,
  DollarSign,
  Package,
  Star,
  Badge,
  Crown,
  Heart,
  Bookmark,
  Tag,
  Filter,
  Search,
  SortAsc,
  Grid,
  List,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  Navigation,
  Compass,
  Route,
  Map,
  Home,
  Building,
  School,
  Briefcase,
  GraduationCap,
  Book,
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  Archive,
  Link,
  LinkOff,
  Copy,
  Scissors,
  Clipboard,
  Printer,
  Scanner,
  Fax
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    bio: 'Passionate learner exploring AI and machine learning technologies.',
    website: 'https://johndoe.dev',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe'
  })

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    courseUpdates: true,
    assignmentReminders: true,
    communityActivity: true,
    marketingEmails: false,
    weeklyDigest: true,
    achievementAlerts: true,
    studyReminders: true
  })

  // Privacy Settings State
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showProgress: true,
    showAchievements: true,
    allowMessages: true,
    showOnlineStatus: true,
    dataTracking: true,
    analyticsSharing: false,
    thirdPartyIntegrations: true
  })

  // Learning Preferences State
  const [learningPrefs, setLearningPrefs] = useState({
    language: 'en',
    difficulty: 'intermediate',
    studyGoal: '2',
    preferredTime: 'evening',
    reminderFrequency: 'daily',
    autoplay: true,
    subtitles: true,
    playbackSpeed: '1x',
    theme: 'light',
    fontSize: 'medium'
  })

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '24',
    passwordStrength: 'strong',
    deviceManagement: true,
    apiAccess: false
  })

  const settingSections = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Personal information and public profile'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Email, push, and reminder preferences'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: Shield,
      description: 'Data sharing and visibility settings'
    },
    {
      id: 'learning',
      name: 'Learning',
      icon: Brain,
      description: 'Study preferences and learning goals'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Lock,
      description: 'Password, 2FA, and access control'
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: CreditCard,
      description: 'Subscription and payment methods'
    },
    {
      id: 'data',
      name: 'Data Management',
      icon: Database,
      description: 'Export, import, and delete account data'
    }
  ]

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile: profileData,
      settings: { notifications, privacy, learningPrefs, security },
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'studiai-data-export.json'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-gray-600">Customize your learning experience</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
              <nav className="space-y-2">
                {settingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <section.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>

                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                      👤
                    </div>
                    <div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Change Photo
                      </button>
                      <p className="text-sm text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Social Links */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <input
                          type="text"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                        <input
                          type="text"
                          value={profileData.github}
                          onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="github.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>

                  {/* Communication Preferences */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Communication Methods</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                        { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser and mobile push notifications' },
                        { key: 'smsNotifications', label: 'SMS Notifications', description: 'Text message notifications for urgent updates' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Notifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Content & Activity</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'courseUpdates', label: 'Course Updates', description: 'New lessons, announcements, and course changes' },
                        { key: 'assignmentReminders', label: 'Assignment Reminders', description: 'Upcoming deadlines and assignment notifications' },
                        { key: 'communityActivity', label: 'Community Activity', description: 'Replies, mentions, and community interactions' },
                        { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'Badges, certificates, and milestone notifications' },
                        { key: 'studyReminders', label: 'Study Reminders', description: 'Daily and weekly study goal reminders' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your weekly learning progress' },
                        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates, features, and promotional content' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>

                  {/* Profile Visibility */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Profile Visibility</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Who can see your profile?</label>
                        <select
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="public">Everyone</option>
                          <option value="students">StudiAI Students Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      {[
                        { key: 'showProgress', label: 'Show Learning Progress', description: 'Display your course progress and achievements' },
                        { key: 'showAchievements', label: 'Show Achievements', description: 'Display badges and certificates on your profile' },
                        { key: 'allowMessages', label: 'Allow Direct Messages', description: 'Let other students send you messages' },
                        { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Display when you\'re active on the platform' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy[item.key]}
                              onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data & Analytics */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Data & Analytics</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'dataTracking', label: 'Usage Analytics', description: 'Help improve StudiAI by sharing anonymous usage data' },
                        { key: 'analyticsSharing', label: 'Performance Analytics', description: 'Share learning performance data for research purposes' },
                        { key: 'thirdPartyIntegrations', label: 'Third-party Integrations', description: 'Allow connections with external learning tools' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy[item.key]}
                              onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Learning Preferences */}
            {activeSection === 'learning' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Preferences</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                      <select
                        value={learningPrefs.language}
                        onChange={(e) => setLearningPrefs({ ...learningPrefs, language: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="pt">Portuguese</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>

                    {/* Difficulty Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Difficulty</label>
                      <select
                        value={learningPrefs.difficulty}
                        onChange={(e) => setLearningPrefs({ ...learningPrefs, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    {/* Study Goal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Daily Study Goal (hours)</label>
                      <select
                        value={learningPrefs.studyGoal}
                        onChange={(e) => setLearningPrefs({ ...learningPrefs, studyGoal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="0.5">30 minutes</option>
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4+ hours</option>
                      </select>
                    </div>

                    {/* Preferred Study Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Time</label>
                      <select
                        value={learningPrefs.preferredTime}
                        onChange={(e) => setLearningPrefs({ ...learningPrefs, preferredTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="morning">Morning (6AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 6PM)</option>
                        <option value="evening">Evening (6PM - 10PM)</option>
                        <option value="night">Night (10PM - 6AM)</option>
                      </select>
                    </div>

                    {/* Reminder Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Frequency</label>
                      <select
                        value={learningPrefs.reminderFrequency}
                        onChange={(e) => setLearningPrefs({ ...learningPrefs, reminderFrequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="none">No reminders</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {/* Playback Speed */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Playback Speed</label>
                      <select
                        value={learningPrefs.playbackSpeed}
                        onChange={(e) => setLearningPrefs({ ...learningPrefs, playbackSpeed: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="0.5x">0.5x</option>
                        <option value="0.75x">0.75x</option>
                        <option value="1x">1x (Normal)</option>
                        <option value="1.25x">1.25x</option>
                        <option value="1.5x">1.5x</option>
                        <option value="2x">2x</option>
                      </select>
                    </div>
                  </div>

                  {/* Video Preferences */}
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Video & Content Preferences</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'autoplay', label: 'Autoplay Videos', description: 'Automatically play next video in sequence' },
                        { key: 'subtitles', label: 'Show Subtitles', description: 'Display captions by default' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={learningPrefs[item.key]}
                              onChange={(e) => setLearningPrefs({ ...learningPrefs, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Display Preferences */}
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Display Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                          value={learningPrefs.theme}
                          onChange={(e) => setLearningPrefs({ ...learningPrefs, theme: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                        <select
                          value={learningPrefs.fontSize}
                          onChange={(e) => setLearningPrefs({ ...learningPrefs, fontSize: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="xl">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

                  {/* Password */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Password</h4>
                    <div className="space-y-4">
                      <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Change Password
                      </button>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Password strength: Strong</span>
                        </div>
                        <p className="mt-1">Last changed: 30 days ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Enable 2FA</div>
                        <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {security.twoFactorAuth ? (
                          <span className="text-green-600 text-sm font-medium">Enabled</span>
                        ) : (
                          <span className="text-gray-500 text-sm">Disabled</span>
                        )}
                        <button
                          onClick={() => setSecurity({ ...security, twoFactorAuth: !security.twoFactorAuth })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${security.twoFactorAuth
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                          {security.twoFactorAuth ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Session Management</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="1">1 hour</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                          <option value="168">1 week</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      {[
                        { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of new login attempts' },
                        { key: 'deviceManagement', label: 'Device Management', description: 'Track and manage logged-in devices' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={security[item.key]}
                              onChange={(e) => setSecurity({ ...security, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h4>
                    <div className="space-y-3">
                      {[
                        { device: 'MacBook Pro', location: 'San Francisco, CA', current: true, lastActive: 'Active now' },
                        { device: 'iPhone 15', location: 'San Francisco, CA', current: false, lastActive: '2 hours ago' },
                        { device: 'Chrome Browser', location: 'New York, NY', current: false, lastActive: '1 day ago' }
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {session.device.includes('MacBook') && <Laptop className="h-5 w-5 text-blue-600" />}
                              {session.device.includes('iPhone') && <Smartphone className="h-5 w-5 text-blue-600" />}
                              {session.device.includes('Chrome') && <Monitor className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center space-x-2">
                                <span>{session.device}</span>
                                {session.current && <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">Current</span>}
                              </div>
                              <div className="text-sm text-gray-500">{session.location} • {session.lastActive}</div>
                            </div>
                          </div>
                          {!session.current && (
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Settings */}
            {activeSection === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h3>

                  {/* Current Plan */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Current Plan</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900">Pro Plan</h5>
                          <p className="text-gray-600">Access to all courses and premium features</p>
                          <p className="text-sm text-gray-500 mt-2">Next billing: August 15, 2025</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">$29/mo</div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                            Change Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Payment Methods</h4>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Add New
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                            <div className="text-sm text-gray-500">Expires 12/2027 • Default</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Billing History</h4>
                    <div className="space-y-3">
                      {[
                        { date: 'July 15, 2025', amount: '$29.00', status: 'Paid', invoice: 'INV-001' },
                        { date: 'June 15, 2025', amount: '$29.00', status: 'Paid', invoice: 'INV-002' },
                        { date: 'May 15, 2025', amount: '$29.00', status: 'Paid', invoice: 'INV-003' }
                      ].map((bill, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{bill.date}</div>
                            <div className="text-sm text-gray-500">Invoice #{bill.invoice}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{bill.amount}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 text-sm">{bill.status}</span>
                              <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data Management */}
            {activeSection === 'data' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>

                  {/* Export Data */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Export Your Data</h4>
                    <p className="text-gray-600 mb-4">
                      Download a copy of your learning data, including course progress, achievements, and profile information.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                  </div>

                  {/* Import Data */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Import Data</h4>
                    <p className="text-gray-600 mb-4">
                      Import learning data from other platforms or restore from a previous export.
                    </p>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import Data</span>
                    </button>
                  </div>

                  {/* Clear Data */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Clear Learning Data</h4>
                    <p className="text-gray-600 mb-4">
                      Reset your learning progress while keeping your account active.
                    </p>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Clear Progress</span>
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="border-t border-red-200 pt-8">
                    <h4 className="text-md font-medium text-red-900 mb-4">Danger Zone</h4>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-medium text-red-900 mb-2">Delete Account</h5>
                      <p className="text-red-700 text-sm mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </button>

                      {showDeleteConfirm && (
                        <div className="mt-4 p-4 bg-red-100 rounded-lg">
                          <p className="text-red-800 text-sm mb-3">
                            Are you sure? This will permanently delete your account and all data.
                          </p>
                          <div className="flex space-x-3">
                            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Settings
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Customize your learning experience and manage your account
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
