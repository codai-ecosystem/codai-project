'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  Volume2,
  Mic,
  Download,
  Upload,
  Trash2,
  Save,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Languages,
  Database,
  Cloud,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  HelpCircle,
  Crown,
  Star,
  Award,
  CreditCard,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Copy,
  ExternalLink,
  MoreVertical,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';

interface SettingsSection {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  timezone: string;
  language: string;
  subscription: 'free' | 'pro' | 'enterprise';
  joinDate: string;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    voice: true,
    email: true,
    training: true,
    updates: false
  });

  const userProfile: UserProfile = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: '/api/placeholder/120/120',
    timezone: 'America/New_York',
    language: 'English (US)',
    subscription: 'pro',
    joinDate: 'March 2024'
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      name: 'User Profile',
      description: 'Personal information and account details',
      icon: User,
      color: 'blue'
    },
    {
      id: 'voice',
      name: 'Voice Settings',
      description: 'Audio configuration and voice preferences',
      icon: Mic,
      color: 'green'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Alert preferences and communication settings',
      icon: Bell,
      color: 'yellow'
    },
    {
      id: 'privacy',
      name: 'Privacy & Security',
      description: 'Data protection and security settings',
      icon: Shield,
      color: 'red'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      description: 'Theme, display, and interface customization',
      icon: Monitor,
      color: 'purple'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'API access, integrations, and developer tools',
      icon: Settings,
      color: 'gray'
    }
  ];

  const getSectionColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {userProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">{userProfile.name}</h4>
            <p className="text-gray-600">{userProfile.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${userProfile.subscription === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {userProfile.subscription.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">Joined {userProfile.joinDate}</span>
            </div>
          </div>
          <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={userProfile.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={userProfile.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-purple-600" />
            <div>
              <h4 className="font-medium text-gray-900">METU Pro</h4>
              <p className="text-sm text-gray-600">Advanced voice AI features</p>
            </div>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
            Manage Plan
          </button>
        </div>
      </div>
    </div>
  );

  const renderVoiceSection = () => (
    <div className="space-y-6">
      <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4">Audio Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Device</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Default Microphone</option>
              <option>USB Headset Microphone</option>
              <option>Built-in Microphone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Output Device</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Default Speakers</option>
              <option>USB Headset</option>
              <option>Built-in Speakers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voice Sensitivity</label>
            <input type="range" min="0" max="100" defaultValue="75" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4">Voice Processing</h3>
        <div className="space-y-3">
          {[
            { label: 'Noise Cancellation', description: 'Reduce background noise', enabled: true },
            { label: 'Echo Reduction', description: 'Minimize audio feedback', enabled: true },
            { label: 'Voice Enhancement', description: 'Improve voice clarity', enabled: false },
            { label: 'Auto Gain Control', description: 'Automatic volume adjustment', enabled: true }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" defaultChecked={setting.enabled} className="form-checkbox h-4 w-4 text-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'voice', label: 'Voice Alerts', description: 'Audio notifications for important events' },
            { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'training', label: 'Training Reminders', description: 'Reminders for voice training sessions' },
            { key: 'updates', label: 'Product Updates', description: 'New features and improvements' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{notification.label}</p>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={notifications[notification.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [notification.key]: e.target.checked }))}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4">Quiet Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input type="time" defaultValue="22:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'voice': return renderVoiceSection();
      case 'notifications': return renderNotificationsSection();
      case 'privacy': return (
        <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4">Privacy & Security Settings</h3>
          <p className="text-gray-600">Configure your data protection and security preferences.</p>
        </div>
      );
      case 'appearance': return (
        <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4">Appearance Settings</h3>
          <p className="text-gray-600">Customize the look and feel of your METU experience.</p>
        </div>
      );
      case 'advanced': return (
        <div className="bg-white/50 rounded-lg p-6 border border-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4">Advanced Settings</h3>
          <p className="text-gray-600">Developer tools, API access, and advanced configurations.</p>
        </div>
      );
      default: return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your METU voice AI preferences</p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Dashboard', href: '/metu', current: false },
              { name: 'Conversations', href: '/metu/conversations', current: false },
              { name: 'Training', href: '/metu/training', current: false },
              { name: 'Analytics', href: '/metu/analytics', current: false },
              { name: 'Personality', href: '/metu/personality', current: false },
              { name: 'Integrations', href: '/metu/integrations', current: false },
              { name: 'Settings', href: '/metu/settings', current: true },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Settings Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <div className={`p-1 rounded ${getSectionColor(section.color)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{section.name}</p>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {renderCurrentSection()}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">METU Settings</h3>
            <p className="text-blue-200 mb-6">Customize your voice AI experience</p>
            <p className="text-blue-200 text-sm">© 2025 METU. Your voice, your way.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
