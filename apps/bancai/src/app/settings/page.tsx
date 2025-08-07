'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, User, Shield, Bell, CreditCard, Eye, EyeOff,
  Smartphone, Lock, Mail, Phone, MapPin, Calendar, Globe,
  Download, Upload, Trash2, Edit, Save, X, Check, AlertCircle,
  Search, Filter, BarChart3, TrendingUp, Target, Activity, Award, Zap, Users,
  DollarSign, Banknote, Calculator, BookOpen, Heart, Star, RefreshCw, ArrowRight,
  SortDesc, Layers, FileText, HelpCircle, MessageSquare, Headphones, Key,
  Database, Monitor, Palette, Moon, Sun, Wifi, Bluetooth, Volume2, Vibrate, Clock
} from 'lucide-react';
import { useSession } from '../../lib/auth';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  avatar?: string;
  verified: boolean;
  twoFactorEnabled: boolean;
  language: string;
  timezone: string;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
}

interface NotificationSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Enhanced state management
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilterTags, setShowFilterTags] = useState(true);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Settings analytics state
  const [settingsAnalytics, setSettingsAnalytics] = useState({
    totalSettings: 47,
    configuredSettings: 34,
    securityScore: 92,
    lastUpdated: '2 hours ago',
    activeSessions: 3,
    connectedDevices: 5
  });

  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    verified: true,
    twoFactorEnabled: true,
    language: 'en',
    timezone: 'America/New_York'
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: '1',
      name: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      enabled: true,
      required: false
    },
    {
      id: '2',
      name: 'Login Notifications',
      description: 'Get notified when someone logs into your account',
      enabled: true,
      required: false
    },
    {
      id: '3',
      name: 'Device Management',
      description: 'Manage trusted devices and sessions',
      enabled: true,
      required: true
    },
    {
      id: '4',
      name: 'Automatic Logout',
      description: 'Automatically log out after 30 minutes of inactivity',
      enabled: false,
      required: false
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      category: 'Account',
      name: 'Login Alerts',
      description: 'Notifications about account access',
      email: true,
      push: true,
      sms: false
    },
    {
      id: '2',
      category: 'Transactions',
      name: 'Transaction Notifications',
      description: 'Get notified about all transactions',
      email: true,
      push: true,
      sms: true
    },
    {
      id: '3',
      category: 'Transfers',
      name: 'Transfer Updates',
      description: 'Updates about money transfers',
      email: true,
      push: true,
      sms: false
    },
    {
      id: '4',
      category: 'Marketing',
      name: 'Promotional Offers',
      description: 'Special offers and product updates',
      email: false,
      push: false,
      sms: false
    }
  ]);

  const handleProfileUpdate = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSecurityToggle = (id: string) => {
    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleNotificationToggle = (id: string, type: 'email' | 'push' | 'sms') => {
    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, [type]: !setting[type] } : setting
      )
    );
  };

  const settingsNavigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3, count: settingsAnalytics.totalSettings },
    { id: 'profile', name: 'Profile', icon: User, count: 12 },
    { id: 'security', name: 'Security', icon: Shield, count: 8 },
    { id: 'notifications', name: 'Notifications', icon: Bell, count: 15 },
    { id: 'cards', name: 'Cards & Accounts', icon: CreditCard, count: 4 },
    { id: 'preferences', name: 'Preferences', icon: Settings, count: 8 }
  ];

  const quickActions = [
    { icon: Edit, label: 'Profile', description: 'Update profile', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { icon: Key, label: 'Password', description: 'Change password', color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { icon: Shield, label: '2FA', description: 'Security setup', color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { icon: Bell, label: 'Alerts', description: 'Manage alerts', color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { icon: Database, label: 'Export', description: 'Download data', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { icon: Monitor, label: 'Devices', description: 'Manage devices', color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { icon: Palette, label: 'Theme', description: 'Appearance', color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { icon: HelpCircle, label: 'Support', description: 'Get help', color: 'bg-gradient-to-br from-gray-500 to-gray-600' }
  ];

  // Analytics update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSettingsAnalytics(prev => ({
        ...prev,
        lastUpdated: 'Just now'
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                <p className="text-green-100 text-lg">Manage your account preferences and security settings</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                {isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2 inline" />
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-all duration-200"
                    >
                      <Save className="h-4 w-4 mr-2 inline" />
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Settings</p>
                    <p className="text-2xl font-bold">{settingsAnalytics.totalSettings}</p>
                  </div>
                  <Settings className="h-8 w-8 text-green-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Configured</p>
                    <p className="text-2xl font-bold">{settingsAnalytics.configuredSettings}</p>
                  </div>
                  <Check className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Security Score</p>
                    <p className="text-2xl font-bold">{settingsAnalytics.securityScore}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Last Updated</p>
                    <p className="text-sm font-medium">{settingsAnalytics.lastUpdated}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">Active Sessions</p>
                    <p className="text-2xl font-bold">{settingsAnalytics.activeSessions}</p>
                  </div>
                  <Monitor className="h-8 w-8 text-indigo-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm">Devices</p>
                    <p className="text-2xl font-bold">{settingsAnalytics.connectedDevices}</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-teal-200" />
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
              {settingsNavigation.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeSection === tab.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                      }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.name}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeSection === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Settings</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{settingsAnalytics.configuredSettings}/{settingsAnalytics.totalSettings}</p>
                  <p className="text-sm text-gray-600">Settings Configured</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(settingsAnalytics.configuredSettings / settingsAnalytics.totalSettings) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-medium">Security</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{settingsAnalytics.securityScore}%</p>
                  <p className="text-sm text-gray-600">Security Score</p>
                  <p className="text-xs text-green-600 font-medium">Excellent Protection</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Monitor className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-purple-600 text-sm font-medium">Sessions</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{settingsAnalytics.activeSessions}</p>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-xs text-purple-600 font-medium">{settingsAnalytics.connectedDevices} devices connected</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-orange-600 text-sm font-medium">Updated</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">{settingsAnalytics.lastUpdated}</p>
                  <p className="text-sm text-gray-600">Last Modified</p>
                  <p className="text-xs text-orange-600 font-medium">Profile section</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <span className="text-sm text-gray-500">{quickActions.length} actions available</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className={`${action.color} p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 text-center">{action.label}</span>
                      <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                {settingsNavigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeSection === item.id
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-3" />
                          {item.name}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeSection === item.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {item.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-600" />
                    </div>
                    {isEditing && (
                      <div className="flex space-x-3">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                          ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          : 'bg-gray-50 cursor-not-allowed'
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                          ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          : 'bg-gray-50 cursor-not-allowed'
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleProfileUpdate('email', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                        {profile.verified && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => handleProfileUpdate('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={profile.address.street}
                          onChange={(e) => handleProfileUpdate('address.street', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={profile.address.city}
                          onChange={(e) => handleProfileUpdate('address.city', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={profile.address.state}
                          onChange={(e) => handleProfileUpdate('address.state', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={profile.address.zipCode}
                          onChange={(e) => handleProfileUpdate('address.zipCode', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          value={profile.address.country}
                          onChange={(e) => handleProfileUpdate('address.country', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                {/* Password */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Password & Login</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {securitySettings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{setting.name}</h4>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                            {setting.required && (
                              <p className="text-xs text-blue-600 mt-1">Required for account security</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleSecurityToggle(setting.id)}
                            disabled={setting.required}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                              } ${setting.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${setting.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-8">
                    {Object.entries(
                      notificationSettings.reduce((acc, setting) => {
                        if (!acc[setting.category]) {
                          acc[setting.category] = [];
                        }
                        acc[setting.category].push(setting);
                        return acc;
                      }, {} as { [key: string]: NotificationSetting[] })
                    ).map(([category, settings]) => (
                      <div key={category}>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">{category}</h4>
                        <div className="space-y-4">
                          {settings.map((setting) => (
                            <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">{setting.name}</h5>
                                  <p className="text-sm text-gray-500">{setting.description}</p>
                                </div>
                              </div>
                              <div className="flex space-x-6">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={setting.email}
                                    onChange={() => handleNotificationToggle(setting.id, 'email')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Email</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={setting.push}
                                    onChange={() => handleNotificationToggle(setting.id, 'push')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Push</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={setting.sms}
                                    onChange={() => handleNotificationToggle(setting.id, 'sms')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">SMS</span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cards & Accounts Section */}
            {activeSection === 'cards' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Cards & Payment Methods</h3>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Add New Card
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payment methods configured yet.</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Add Your First Card
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={profile.language}
                          onChange={(e) => handleProfileUpdate('language', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => handleProfileUpdate('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Data & Privacy</h4>
                    <div className="space-y-4">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Download className="h-4 w-4 mr-2" />
                        Download My Data
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <HelpCircle className="h-8 w-8 mr-3" />
                <h3 className="text-lg font-semibold">Settings Help</h3>
              </div>
              <p className="text-blue-100 mb-4">Need assistance with your account settings? Our support team is here to help.</p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Get Support
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 mr-3" />
                <h3 className="text-lg font-semibold">Security Center</h3>
              </div>
              <p className="text-green-100 mb-4">Monitor your account security and manage protection settings.</p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                View Security
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-8 w-8 mr-3" />
                <h3 className="text-lg font-semibold">Feedback</h3>
              </div>
              <p className="text-purple-100 mb-4">Share your thoughts about our settings experience and suggest improvements.</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
