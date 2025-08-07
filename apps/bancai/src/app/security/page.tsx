'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  History,
  MapPin,
  Monitor,
  CreditCard,
  Bell,
  Mail,
  Fingerprint,
  Camera,
  Wifi,
  Globe,
  User,
  Download,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Award,
  Zap,
  Users,
  DollarSign,
  Banknote,
  Calculator,
  BookOpen,
  Heart,
  Star,
  RefreshCw,
  ArrowRight,
  SortDesc,
  Layers,
  FileText,
  HelpCircle,
  MessageSquare,
  Phone,
  Headphones
} from 'lucide-react';

interface SecurityEvent {
  id: string
  type: 'login' | 'password_change' | 'device_added' | 'suspicious_activity' | 'transaction'
  description: string
  timestamp: string
  location: string
  device: string
  status: 'success' | 'failed' | 'blocked'
  ipAddress?: string
}

interface TrustedDevice {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  location: string
  lastUsed: string
  isActive: boolean
}

interface SecuritySetting {
  id: string
  category: string
  name: string
  description: string
  enabled: boolean
  level: 'basic' | 'enhanced' | 'maximum'
  icon: any
}

export default function SecurityPage() {
  // Enhanced State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showFilterTags, setShowFilterTags] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Enhanced Security Analytics
  const securityAnalytics = useMemo(() => ({
    totalEvents: 247,
    successfulLogins: 89,
    failedAttempts: 12,
    blockedActivities: 3,
    trustedDevices: 8,
    activeAlerts: 2,
    securityScore: 94,
    lastUpdate: new Date().toLocaleString()
  }), []);

  // Enhanced Utility Functions
  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSortBy('timestamp');
    setSelectedTimeRange('7days');
    setShowFilterTags(false);
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'login',
      description: 'Successful login',
      timestamp: '2025-01-24 14:32:15',
      location: 'New York, NY',
      device: 'Chrome on Windows',
      status: 'success',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      type: 'transaction',
      description: 'Credit card payment processed',
      timestamp: '2025-01-24 09:15:22',
      location: 'New York, NY',
      device: 'BancAI Mobile App',
      status: 'success'
    },
    {
      id: '3',
      type: 'device_added',
      description: 'New device registered',
      timestamp: '2025-01-23 16:45:30',
      location: 'Brooklyn, NY',
      device: 'Safari on iPhone',
      status: 'success',
      ipAddress: '192.168.1.105'
    },
    {
      id: '4',
      type: 'suspicious_activity',
      description: 'Failed login attempt',
      timestamp: '2025-01-22 23:15:45',
      location: 'Unknown Location',
      device: 'Unknown Browser',
      status: 'blocked',
      ipAddress: '185.220.101.45'
    }
  ]

  const trustedDevices: TrustedDevice[] = [
    {
      id: '1',
      name: 'My MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 121.0',
      location: 'New York, NY',
      lastUsed: '2025-01-24 14:32:15',
      isActive: true
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      browser: 'Safari 17.2',
      location: 'New York, NY',
      lastUsed: '2025-01-24 12:15:30',
      isActive: false
    },
    {
      id: '3',
      name: 'Work iPad',
      type: 'tablet',
      browser: 'Safari 17.1',
      location: 'Brooklyn, NY',
      lastUsed: '2025-01-23 16:45:30',
      isActive: false
    }
  ]

  const securitySettings: SecuritySetting[] = [
    {
      id: 'two_factor',
      category: 'Authentication',
      name: 'Two-Factor Authentication',
      description: 'Require a second form of verification when signing in',
      enabled: true,
      level: 'enhanced',
      icon: Smartphone
    },
    {
      id: 'biometric',
      category: 'Authentication',
      name: 'Biometric Login',
      description: 'Use fingerprint or face recognition for quick access',
      enabled: true,
      level: 'maximum',
      icon: Fingerprint
    },
    {
      id: 'login_alerts',
      category: 'Notifications',
      name: 'Login Alerts',
      description: 'Get notified of all account access attempts',
      enabled: true,
      level: 'enhanced',
      icon: Bell
    },
    {
      id: 'transaction_alerts',
      category: 'Notifications',
      name: 'Transaction Alerts',
      description: 'Real-time notifications for all transactions',
      enabled: true,
      level: 'maximum',
      icon: CreditCard
    },
    {
      id: 'location_tracking',
      category: 'Privacy',
      name: 'Location Services',
      description: 'Track device location for security verification',
      enabled: false,
      level: 'basic',
      icon: MapPin
    },
    {
      id: 'session_timeout',
      category: 'Session',
      name: 'Auto-Logout',
      description: 'Automatically sign out after 30 minutes of inactivity',
      enabled: true,
      level: 'enhanced',
      icon: Clock
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'activity', label: 'Recent Activity', icon: History },
    { id: 'devices', label: 'Trusted Devices', icon: Monitor },
    { id: 'settings', label: 'Security Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy Controls', icon: Lock }
  ]

  const getEventIcon = (type: string, status: string) => {
    if (status === 'blocked') return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (status === 'failed') return <X className="h-5 w-5 text-red-500" />

    switch (type) {
      case 'login': return <User className="h-5 w-5 text-green-500" />
      case 'transaction': return <CreditCard className="h-5 w-5 text-blue-500" />
      case 'device_added': return <Monitor className="h-5 w-5 text-purple-500" />
      case 'password_change': return <Key className="h-5 w-5 text-yellow-500" />
      default: return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-5 w-5 text-blue-500" />
      case 'tablet': return <Monitor className="h-5 w-5 text-purple-500" />
      default: return <Monitor className="h-5 w-5 text-gray-500" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Security Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Security Score</h3>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">92/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-600">Strong</h4>
            <p className="text-sm text-gray-600">Account Protection</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-blue-600">Enabled</h4>
            <p className="text-sm text-gray-600">Two-Factor Auth</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Fingerprint className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-purple-600">Active</h4>
            <p className="text-sm text-gray-600">Biometric Login</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }}></div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Your account is well protected</span>
          <span>92% secure</span>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">Change Password</h4>
              <p className="text-sm text-gray-600">Update your password</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold">Manage 2FA</h4>
              <p className="text-sm text-gray-600">Two-factor settings</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold">Download Data</h4>
              <p className="text-sm text-gray-600">Export account data</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold">Security Alert</h4>
              <p className="text-sm text-gray-600">Review alerts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Security Events</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
        </div>

        <div className="space-y-4">
          {securityEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              {getEventIcon(event.type, event.status)}
              <div className="flex-1">
                <p className="font-medium">{event.description}</p>
                <p className="text-sm text-gray-600">
                  {event.location} • {event.device} • {event.timestamp}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'success' ? 'bg-green-100 text-green-700' :
                event.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'
                }`}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderActivity = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Security Activity Log</h3>
        <div className="flex space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Log
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {securityEvents.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-start space-x-4">
              {getEventIcon(event.type, event.status)}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{event.description}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'success' ? 'bg-green-100 text-green-700' :
                    event.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {event.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Time:</span> {event.timestamp}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {event.location}
                  </div>
                  <div>
                    <span className="font-medium">Device:</span> {event.device}
                  </div>
                  {event.ipAddress && (
                    <div>
                      <span className="font-medium">IP:</span> {event.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trusted Devices</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Device
        </button>
      </div>

      <div className="grid gap-6">
        {trustedDevices.map((device) => (
          <Card key={device.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                {getDeviceIcon(device.type)}
                <div>
                  <h4 className="font-semibold flex items-center space-x-2">
                    <span>{device.name}</span>
                    {device.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Current Session
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{device.browser}</p>
                  <p className="text-sm text-gray-600">{device.location}</p>
                  <p className="text-sm text-gray-600">Last used: {device.lastUsed}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                {!device.isActive && (
                  <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Security Settings</h3>

      <div className="space-y-6">
        {['Authentication', 'Notifications', 'Privacy', 'Session'].map((category) => (
          <Card key={category} className="p-6">
            <h4 className="font-semibold mb-4">{category}</h4>
            <div className="space-y-4">
              {securitySettings
                .filter(setting => setting.category === category)
                .map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <setting.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h5 className="font-medium">{setting.name}</h5>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${setting.level === 'maximum' ? 'bg-green-100 text-green-700' :
                        setting.level === 'enhanced' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {setting.level}
                      </span>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={() => { }}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Security & Privacy Center
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Protect your financial data with advanced security features, monitoring, and comprehensive privacy controls
              </p>
            </div>

            {/* Security Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{securityAnalytics.securityScore}%</div>
                <div className="text-sm text-white/80">Security Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Activity className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{securityAnalytics.totalEvents}</div>
                <div className="text-sm text-white/80">Total Events</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Monitor className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{securityAnalytics.trustedDevices}</div>
                <div className="text-sm text-white/80">Trusted Devices</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{securityAnalytics.activeAlerts}</div>
                <div className="text-sm text-white/80">Active Alerts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Lock className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{securityAnalytics.successfulLogins}</div>
                <div className="text-sm text-white/80">Successful Logins</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Target className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{securityAnalytics.blockedActivities}</div>
                <div className="text-sm text-white/80">Blocked Activities</div>
              </div>
            </div>

            {/* Enhanced Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { id: 'overview', label: 'Security Overview', icon: Shield, count: securityAnalytics.totalEvents },
                { id: 'devices', label: 'Trusted Devices', icon: Monitor, count: securityAnalytics.trustedDevices },
                { id: 'activity', label: 'Activity Log', icon: History, count: securityAnalytics.totalEvents },
                { id: 'settings', label: 'Security Settings', icon: Settings, count: 0 },
                { id: 'alerts', label: 'Security Alerts', icon: Bell, count: securityAnalytics.activeAlerts },
                { id: 'privacy', label: 'Privacy Controls', icon: Eye, count: 0 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white/90 hover:bg-white/20'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Security Score</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-900">{securityAnalytics.securityScore}%</div>
              <div className="text-sm text-green-700">Overall Protection</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Excellent security level
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">Trusted Devices</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-900">{securityAnalytics.trustedDevices}</div>
              <div className="text-sm text-blue-700">Active Devices</div>
              <div className="flex items-center text-xs text-blue-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                All devices verified
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">Recent Activity</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-900">{securityAnalytics.successfulLogins}</div>
              <div className="text-sm text-purple-700">Successful Logins</div>
              <div className="flex items-center text-xs text-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                Last 30 days
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-600">Security Alerts</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-900">{securityAnalytics.activeAlerts}</div>
              <div className="text-sm text-orange-700">Active Alerts</div>
              <div className="flex items-center text-xs text-orange-600">
                <Bell className="h-3 w-3 mr-1" />
                Requires attention
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Security Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group"
            >
              <Settings className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-900">Settings</span>
            </button>

            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all group"
            >
              <Lock className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-green-900">2FA</span>
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all group"
            >
              <Monitor className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-purple-900">Devices</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all group"
            >
              <History className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-orange-900">Activity</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all group"
            >
              <Bell className="h-8 w-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-red-900">Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all group"
            >
              <Eye className="h-8 w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-indigo-900">Privacy</span>
            </button>

            <button
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 transition-all group"
            >
              <Download className="h-8 w-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-teal-900">Export</span>
            </button>

            <button
              onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all group"
            >
              {showSensitiveInfo ? (
                <EyeOff className="h-8 w-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
              ) : (
                <Eye className="h-8 w-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-medium text-gray-900">Privacy</span>
            </button>
          </div>
        </div>
          ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'activity' && renderActivity()}
      {activeTab === 'devices' && renderDevices()}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'privacy' && (
        <div className="text-center py-12">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Controls</h3>
          <p className="text-gray-600">Advanced privacy settings and data controls coming soon</p>
        </div>
      )}
    </div>
    </div >
  )
}
