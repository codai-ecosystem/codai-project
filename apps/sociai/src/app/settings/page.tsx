'use client';

import { useState } from 'react';
import {
  Settings, Save, Shield, Bell, Globe, User, Palette, Database,
  Key, Lock, Eye, EyeOff, Smartphone, Mail, MessageSquare,
  Monitor, Moon, Sun, Volume2, VolumeX, Vibrate, RotateCcw,
  Download, Upload, Trash2, RefreshCw, Check, X, AlertTriangle,
  Info, HelpCircle, ExternalLink, Plus, Minus, Edit3, Copy,
  CreditCard, Calendar, Star, Award, Crown, Zap, Sparkles,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Github,
  MapPin, Clock, Languages, DollarSign, BarChart3, Target,
  Filter, Search, SortAsc, ToggleLeft, ToggleRight, Sliders,
  ChevronDown, ChevronRight, ArrowRight, FileText, Image,
  Video, Headphones, Mic, Camera, Share2, Link2, QrCode,
  Fingerprint, Scan, Wifi, Bluetooth, Usb, Cloud, HardDrive,
  Cpu, MemoryStick, Battery, Signal, Antenna, Radio, Cast,
  Maximize2, Minimize2, Square, Circle, Triangle, Hexagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  category: 'posts' | 'messages' | 'mentions' | 'followers' | 'ai' | 'security';
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  category: 'profile' | 'posts' | 'messages' | 'data' | 'ai';
  value: 'public' | 'friends' | 'private';
  options: Array<{
    value: 'public' | 'friends' | 'private';
    label: string;
    description: string;
  }>;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  lastSync: Date;
  postsCount: number;
  followersCount: number;
  icon: React.ReactNode;
  color: string;
}

interface AIPreference {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'analysis' | 'automation' | 'personalization';
  enabled: boolean;
  level: 'conservative' | 'balanced' | 'aggressive';
}

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  gradient: string;
  accent: string;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'connected', label: 'Connected Accounts', icon: Link2 },
    { id: 'ai', label: 'AI Preferences', icon: Sparkles },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  const notificationSettings: NotificationSetting[] = [
    {
      id: '1',
      title: 'New Posts',
      description: 'Get notified when someone you follow posts new content',
      category: 'posts',
      enabled: true,
      email: true,
      push: true,
      sms: false
    },
    {
      id: '2',
      title: 'Direct Messages',
      description: 'Receive notifications for new direct messages',
      category: 'messages',
      enabled: true,
      email: true,
      push: true,
      sms: true
    },
    {
      id: '3',
      title: 'Mentions & Tags',
      description: 'Get alerted when someone mentions or tags you',
      category: 'mentions',
      enabled: true,
      email: true,
      push: true,
      sms: false
    },
    {
      id: '4',
      title: 'New Followers',
      description: 'Know when someone starts following you',
      category: 'followers',
      enabled: true,
      email: false,
      push: true,
      sms: false
    },
    {
      id: '5',
      title: 'AI Insights',
      description: 'Receive AI-generated content and performance insights',
      category: 'ai',
      enabled: true,
      email: true,
      push: false,
      sms: false
    },
    {
      id: '6',
      title: 'Security Alerts',
      description: 'Important security and login notifications',
      category: 'security',
      enabled: true,
      email: true,
      push: true,
      sms: true
    }
  ];

  const privacySettings: PrivacySetting[] = [
    {
      id: '1',
      title: 'Profile Visibility',
      description: 'Who can see your profile information',
      category: 'profile',
      value: 'public',
      options: [
        { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
        { value: 'friends', label: 'Friends Only', description: 'Only your connections can see your profile' },
        { value: 'private', label: 'Private', description: 'Only you can see your profile' }
      ]
    },
    {
      id: '2',
      title: 'Post Visibility',
      description: 'Default visibility for your posts',
      category: 'posts',
      value: 'friends',
      options: [
        { value: 'public', label: 'Public', description: 'Anyone can see your posts' },
        { value: 'friends', label: 'Friends Only', description: 'Only your connections can see your posts' },
        { value: 'private', label: 'Private', description: 'Only you can see your posts' }
      ]
    },
    {
      id: '3',
      title: 'Message Requests',
      description: 'Who can send you direct messages',
      category: 'messages',
      value: 'friends',
      options: [
        { value: 'public', label: 'Anyone', description: 'Anyone can message you' },
        { value: 'friends', label: 'Friends Only', description: 'Only connections can message you' },
        { value: 'private', label: 'No One', description: 'Block all message requests' }
      ]
    },
    {
      id: '4',
      title: 'Data Usage',
      description: 'How your data is used for AI insights',
      category: 'data',
      value: 'balanced',
      options: [
        { value: 'public', label: 'Full Usage', description: 'Use all data for insights and recommendations' },
        { value: 'friends', label: 'Limited Usage', description: 'Use only public data for insights' },
        { value: 'private', label: 'No Usage', description: 'Don\'t use data for AI insights' }
      ]
    }
  ];

  const connectedAccounts: ConnectedAccount[] = [
    {
      id: '1',
      platform: 'Instagram',
      username: '@johndoe_official',
      connected: true,
      lastSync: new Date(Date.now() - 3600000),
      postsCount: 247,
      followersCount: 12400,
      icon: <Instagram className="h-5 w-5" />,
      color: 'bg-pink-500'
    },
    {
      id: '2',
      platform: 'Twitter',
      username: '@john_doe',
      connected: true,
      lastSync: new Date(Date.now() - 1800000),
      postsCount: 1834,
      followersCount: 8900,
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      platform: 'LinkedIn',
      username: 'john-doe',
      connected: false,
      lastSync: new Date(Date.now() - 86400000),
      postsCount: 156,
      followersCount: 3400,
      icon: <Linkedin className="h-5 w-5" />,
      color: 'bg-blue-700'
    },
    {
      id: '4',
      platform: 'Facebook',
      username: 'john.doe.page',
      connected: true,
      lastSync: new Date(Date.now() - 7200000),
      postsCount: 89,
      followersCount: 5600,
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-600'
    },
    {
      id: '5',
      platform: 'YouTube',
      username: 'johndoe',
      connected: false,
      lastSync: new Date(Date.now() - 172800000),
      postsCount: 34,
      followersCount: 2100,
      icon: <Youtube className="h-5 w-5" />,
      color: 'bg-red-500'
    },
    {
      id: '6',
      platform: 'TikTok',
      username: '@johndoe_creator',
      connected: true,
      lastSync: new Date(Date.now() - 900000),
      postsCount: 78,
      followersCount: 15700,
      icon: <Video className="h-5 w-5" />,
      color: 'bg-black'
    }
  ];

  const aiPreferences: AIPreference[] = [
    {
      id: '1',
      title: 'Content Generation',
      description: 'AI assistance for creating posts and captions',
      category: 'content',
      enabled: true,
      level: 'balanced'
    },
    {
      id: '2',
      title: 'Performance Analysis',
      description: 'AI-powered insights and recommendations',
      category: 'analysis',
      enabled: true,
      level: 'aggressive'
    },
    {
      id: '3',
      title: 'Auto-Scheduling',
      description: 'Automatically schedule posts at optimal times',
      category: 'automation',
      enabled: false,
      level: 'conservative'
    },
    {
      id: '4',
      title: 'Personalized Feed',
      description: 'AI-curated content based on your interests',
      category: 'personalization',
      enabled: true,
      level: 'balanced'
    },
    {
      id: '5',
      title: 'Smart Hashtags',
      description: 'AI-suggested hashtags for better reach',
      category: 'content',
      enabled: true,
      level: 'aggressive'
    },
    {
      id: '6',
      title: 'Trend Detection',
      description: 'Early alerts about trending topics',
      category: 'analysis',
      enabled: true,
      level: 'balanced'
    }
  ];

  const themeOptions: ThemeOption[] = [
    {
      id: 'default',
      name: 'Ocean Breeze',
      description: 'Blue to purple gradient (default)',
      preview: '/api/placeholder/100/60',
      gradient: 'from-blue-500 to-purple-600',
      accent: 'text-blue-600'
    },
    {
      id: 'sunset',
      name: 'Sunset Glow',
      description: 'Orange to pink gradient',
      preview: '/api/placeholder/100/60',
      gradient: 'from-orange-500 to-pink-600',
      accent: 'text-orange-600'
    },
    {
      id: 'forest',
      name: 'Forest Green',
      description: 'Green to teal gradient',
      preview: '/api/placeholder/100/60',
      gradient: 'from-green-500 to-teal-600',
      accent: 'text-green-600'
    },
    {
      id: 'night',
      name: 'Midnight',
      description: 'Dark purple to black gradient',
      preview: '/api/placeholder/100/60',
      gradient: 'from-purple-900 to-black',
      accent: 'text-purple-400'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
    }, 3000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const toggleNotification = (id: string, type: 'enabled' | 'email' | 'push' | 'sms') => {
    // Handle notification toggle logic
    console.log(`Toggle ${type} for notification ${id}`);
  };

  const toggleAIPreference = (id: string) => {
    // Handle AI preference toggle
    console.log(`Toggle AI preference ${id}`);
  };

  const connectAccount = (platform: string) => {
    // Handle account connection
    console.log(`Connect ${platform} account`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Settings & Preferences</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/80">
                <div className="text-center">
                  <div className="text-lg font-semibold">{connectedAccounts.filter(acc => acc.connected).length}</div>
                  <div className="text-xs">Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{aiPreferences.filter(pref => pref.enabled).length}</div>
                  <div className="text-xs">AI Features</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">Pro</div>
                  <div className="text-xs">Plan</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Settings Menu</h3>
              </div>
              <nav className="p-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <motion.button
                      key={section.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {activeSection === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h3>

                    <div className="space-y-6">
                      {/* Language & Region */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Languages className="inline h-4 w-4 mr-2" />
                              Language
                            </label>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="en">English</option>
                              <option value="es">Español</option>
                              <option value="fr">Français</option>
                              <option value="de">Deutsch</option>
                              <option value="ro">Română</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Clock className="inline h-4 w-4 mr-2" />
                              Timezone
                            </label>
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="UTC">UTC (GMT+0)</option>
                              <option value="EST">Eastern Time (GMT-5)</option>
                              <option value="PST">Pacific Time (GMT-8)</option>
                              <option value="CET">Central European (GMT+1)</option>
                              <option value="EET">Eastern European (GMT+2)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Display Preferences */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Dark Mode</div>
                              <div className="text-sm text-gray-600">Switch to dark theme</div>
                            </div>
                            <button
                              onClick={() => setIsDarkMode(!isDarkMode)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Compact Mode</div>
                              <div className="text-sm text-gray-600">Show more content on screen</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Auto-refresh</div>
                              <div className="text-sm text-gray-600">Automatically refresh content</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h3>

                    <div className="space-y-6">
                      {/* Profile Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                              type="text"
                              defaultValue="John Doe"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                              type="text"
                              defaultValue="@johndoe"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                              type="email"
                              defaultValue="john.doe@email.com"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              defaultValue="+1 (555) 123-4567"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                          <textarea
                            rows={3}
                            defaultValue="Social media enthusiast and content creator passionate about AI and technology."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Security */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Security</h4>
                        <div className="space-y-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Key className="h-5 w-5 text-gray-600" />
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Change Password</div>
                                <div className="text-sm text-gray-600">Update your account password</div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Shield className="h-5 w-5 text-gray-600" />
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                                <div className="text-sm text-gray-600">Add an extra layer of security</div>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Enabled</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Smartphone className="h-5 w-5 text-gray-600" />
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Login Sessions</div>
                                <div className="text-sm text-gray-600">Manage active sessions</div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>

                    <div className="space-y-6">
                      {notificationSettings.map((setting) => (
                        <div key={setting.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900">{setting.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                            </div>
                            <button
                              onClick={() => toggleNotification(setting.id, 'enabled')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </div>

                          {setting.enabled && (
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={setting.email}
                                  onChange={() => toggleNotification(setting.id, 'email')}
                                  className="rounded"
                                />
                                <Mail className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Email</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={setting.push}
                                  onChange={() => toggleNotification(setting.id, 'push')}
                                  className="rounded"
                                />
                                <Bell className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Push</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={setting.sms}
                                  onChange={() => toggleNotification(setting.id, 'sms')}
                                  className="rounded"
                                />
                                <MessageSquare className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-700">SMS</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === 'connected' && (
                  <motion.div
                    key="connected"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Connected Accounts</h3>

                    <div className="space-y-4">
                      {connectedAccounts.map((account) => (
                        <div key={account.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center text-white`}>
                                {account.icon}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{account.platform}</h4>
                                <p className="text-sm text-gray-600">{account.username}</p>
                                {account.connected && (
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>{formatNumber(account.postsCount)} posts</span>
                                    <span>{formatNumber(account.followersCount)} followers</span>
                                    <span>Last sync: {new Date(account.lastSync).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {account.connected ? (
                                <>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                    Connected
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition-colors"
                                  >
                                    Sync Now
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                  >
                                    Disconnect
                                  </motion.button>
                                </>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => connectAccount(account.platform)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                  Connect
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">AI Preferences</h3>

                    <div className="space-y-6">
                      {aiPreferences.map((preference) => (
                        <div key={preference.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900">{preference.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{preference.description}</p>
                              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${preference.category === 'content' ? 'bg-blue-100 text-blue-700' :
                                  preference.category === 'analysis' ? 'bg-purple-100 text-purple-700' :
                                    preference.category === 'automation' ? 'bg-green-100 text-green-700' :
                                      'bg-orange-100 text-orange-700'
                                }`}>
                                {preference.category}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleAIPreference(preference.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preference.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preference.enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </div>

                          {preference.enabled && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                AI Aggressiveness Level
                              </label>
                              <div className="flex items-center space-x-4">
                                <button
                                  className={`px-3 py-1 rounded-full text-sm transition-colors ${preference.level === 'conservative'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  Conservative
                                </button>
                                <button
                                  className={`px-3 py-1 rounded-full text-sm transition-colors ${preference.level === 'balanced'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  Balanced
                                </button>
                                <button
                                  className={`px-3 py-1 rounded-full text-sm transition-colors ${preference.level === 'aggressive'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  Aggressive
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Appearance & Themes</h3>

                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Theme Selection</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {themeOptions.map((theme) => (
                            <motion.button
                              key={theme.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedTheme(theme.id)}
                              className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedTheme === theme.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className={`h-16 w-full rounded-lg bg-gradient-to-r ${theme.gradient} mb-3`}></div>
                              <h5 className="font-medium text-gray-900">{theme.name}</h5>
                              <p className="text-sm text-gray-600">{theme.description}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Display Options</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">High Contrast Mode</div>
                              <div className="text-sm text-gray-600">Increase contrast for better visibility</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Reduce Motion</div>
                              <div className="text-sm text-gray-600">Minimize animations and transitions</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Large Text</div>
                              <div className="text-sm text-gray-600">Increase text size for better readability</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'data' && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Data & Storage</h3>

                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Storage Usage</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Media Files</span>
                              <span>1.2 GB / 5 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Posts & Content</span>
                              <span>456 MB / 2 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>AI Data</span>
                              <span>89 MB / 1 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '9%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Data Management</h4>
                        <div className="space-y-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                          >
                            <div className="flex items-center space-x-3">
                              {isExporting ? (
                                <RefreshCw className="h-5 w-5 text-gray-600 animate-spin" />
                              ) : (
                                <Download className="h-5 w-5 text-gray-600" />
                              )}
                              <div className="text-left">
                                <div className="font-medium text-gray-900">
                                  {isExporting ? 'Exporting Data...' : 'Export Data'}
                                </div>
                                <div className="text-sm text-gray-600">Download all your data</div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Trash2 className="h-5 w-5 text-gray-600" />
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Clear Cache</div>
                                <div className="text-sm text-gray-600">Free up storage space</div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center justify-between p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <div className="text-left">
                                <div className="font-medium text-red-900">Delete Account</div>
                                <div className="text-sm text-red-600">Permanently delete your account</div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
              </p>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Shield className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Privacy & Security</h3>
              <p className="text-white/80">Advanced security features and privacy controls to keep your data safe and secure.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Sparkles className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Customization</h3>
              <p className="text-white/80">Personalize your AI experience with advanced preferences and intelligent automation.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Settings className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Complete Control</h3>
              <p className="text-white/80">Comprehensive settings and preferences to customize every aspect of your experience.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
