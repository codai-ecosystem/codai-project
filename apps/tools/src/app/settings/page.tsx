'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Monitor,
  Globe,
  Crown,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Camera,
  Edit3,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Zap,
  HardDrive,
  Wifi,
  Bluetooth,
  RefreshCw,
  Info,
  ExternalLink,
  CreditCard,
  Calendar,
  Clock,
  Languages,
  Accessibility
} from 'lucide-react'

// TypeScript Interfaces
interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  subscription: {
    plan: string
    status: string
    expiresAt: string
    features: string[]
  }
  preferences: {
    language: string
    timezone: string
    dateFormat: string
  }
}

interface ToolsSettings {
  general: {
    autoSave: boolean
    darkMode: boolean
    compactMode: boolean
    showTooltips: boolean
    defaultView: string
    maxFileSize: number
    processingTimeout: number
    autoRefresh: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    ipWhitelist: string[]
    encryptionEnabled: boolean
    auditLogging: boolean
    apiKeyRotation: boolean
  }
  notifications: {
    emailAlerts: boolean
    pushNotifications: boolean
    processingComplete: boolean
    errorAlerts: boolean
    weeklyReports: boolean
    quietHours: {
      enabled: boolean
      startTime: string
      endTime: string
    }
  }
  performance: {
    cacheEnabled: boolean
    preloadTools: boolean
    compressionLevel: number
    parallelProcessing: boolean
    resourceLimit: number
    autoCleanup: boolean
  }
  accessibility: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    screenReader: boolean
    keyboardNavigation: boolean
    colorBlindMode: string
  }
  integrations: {
    apiAccess: boolean
    webhooks: string[]
    cloudSync: boolean
    exportFormats: string[]
    thirdPartyTools: boolean
    analyticsTracking: boolean
  }
}

interface SettingsSection {
  id: string
  title: string
  icon: any
  description: string
  category: string
}

interface SettingsMetrics {
  totalSettings: number
  configurationsChanged: number
  lastBackup: string
  systemHealth: string
  storageUsed: string
  apiCallsToday: number
}

const ToolsSettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile')
  const [settings, setSettings] = useState<ToolsSettings>({
    general: {
      autoSave: true,
      darkMode: true,
      compactMode: false,
      showTooltips: true,
      defaultView: 'grid',
      maxFileSize: 100,
      processingTimeout: 60,
      autoRefresh: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      ipWhitelist: [],
      encryptionEnabled: true,
      auditLogging: true,
      apiKeyRotation: false
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: false,
      processingComplete: true,
      errorAlerts: true,
      weeklyReports: false,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00'
      }
    },
    performance: {
      cacheEnabled: true,
      preloadTools: false,
      compressionLevel: 5,
      parallelProcessing: true,
      resourceLimit: 80,
      autoCleanup: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      colorBlindMode: 'none'
    },
    integrations: {
      apiAccess: true,
      webhooks: [],
      cloudSync: false,
      exportFormats: ['json', 'csv', 'xml'],
      thirdPartyTools: true,
      analyticsTracking: false
    }
  })

  const [userProfile] = useState<UserProfile>({
    id: 'user_12345',
    name: 'Alex Developer',
    email: 'alex@toolsplatform.com',
    avatar: '/avatars/alex.jpg',
    subscription: {
      plan: 'Pro',
      status: 'active',
      expiresAt: '2025-12-31',
      features: ['Unlimited Tools', 'Priority Processing', 'Advanced Analytics', 'API Access', 'Custom Integrations']
    },
    preferences: {
      language: 'English',
      timezone: 'UTC+02:00',
      dateFormat: 'DD/MM/YYYY'
    }
  })

  const [metrics] = useState<SettingsMetrics>({
    totalSettings: 47,
    configurationsChanged: 12,
    lastBackup: '2025-08-07T10:30:00Z',
    systemHealth: 'Excellent',
    storageUsed: '2.3 GB',
    apiCallsToday: 1547
  })

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const settingsSections: SettingsSection[] = [
    { id: 'profile', title: 'User Profile', icon: User, description: 'Personal information and account details', category: 'Account' },
    { id: 'general', title: 'General Settings', icon: Settings, description: 'Basic platform preferences and defaults', category: 'Platform' },
    { id: 'security', title: 'Security & Privacy', icon: Shield, description: 'Authentication and data protection', category: 'Platform' },
    { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Alert preferences and communication', category: 'Platform' },
    { id: 'appearance', title: 'Appearance', icon: Palette, description: 'Theme and display customization', category: 'Interface' },
    { id: 'performance', title: 'Performance', icon: Zap, description: 'Processing and resource optimization', category: 'Platform' },
    { id: 'accessibility', title: 'Accessibility', icon: Accessibility, description: 'Accessibility and usability features', category: 'Interface' },
    { id: 'integrations', title: 'Integrations', icon: Globe, description: 'API access and third-party connections', category: 'Advanced' },
    { id: 'data', title: 'Data Management', icon: Database, description: 'Export, import, and backup options', category: 'Advanced' }
  ]

  const handleSaveSettings = async () => {
    setSaveStatus('saving')
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset settings to defaults
      setSettings(prev => ({
        ...prev,
        general: {
          autoSave: true,
          darkMode: false,
          compactMode: false,
          showTooltips: true,
          defaultView: 'grid',
          maxFileSize: 50,
          processingTimeout: 30,
          autoRefresh: false
        }
      }))
    }
  }

  const renderProfileSection = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-8 h-8 text-indigo-400" />
            User Profile
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-xl text-indigo-300 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </motion.button>
        </div>

        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
              AD
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-xl font-semibold text-white">{userProfile.name}</h4>
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">{userProfile.subscription.plan}</span>
              </div>
            </div>
            <p className="text-indigo-300 mb-4">{userProfile.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Language</span>
                </div>
                <p className="text-white font-semibold">{userProfile.preferences.language}</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Timezone</span>
                </div>
                <p className="text-white font-semibold">{userProfile.preferences.timezone}</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Date Format</span>
                </div>
                <p className="text-white font-semibold">{userProfile.preferences.dateFormat}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-indigo-400" />
          Subscription Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">{userProfile.subscription.status.toUpperCase()}</span>
              </div>
              <span className="text-indigo-300">Expires: {new Date(userProfile.subscription.expiresAt).toLocaleDateString()}</span>
            </div>

            <div className="space-y-2">
              {userProfile.subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              Manage Subscription
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGeneralSection = () => (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-indigo-400" />
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Interface Settings */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-indigo-400" />
              Interface
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto Save</p>
                  <p className="text-sm text-indigo-300">Automatically save changes</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, general: { ...prev.general, autoSave: !prev.general.autoSave } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.general.autoSave ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.general.autoSave ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-sm text-indigo-300">Use dark theme</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, general: { ...prev.general, darkMode: !prev.general.darkMode } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.general.darkMode ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.general.darkMode ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    {settings.general.darkMode ? <Moon className="w-3 h-3 text-indigo-500" /> : <Sun className="w-3 h-3 text-yellow-500" />}
                  </motion.div>
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Show Tooltips</p>
                  <p className="text-sm text-indigo-300">Display help tooltips</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, general: { ...prev.general, showTooltips: !prev.general.showTooltips } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.general.showTooltips ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.general.showTooltips ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Default View</label>
                <select
                  value={settings.general.defaultView}
                  onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, defaultView: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                  <option value="compact">Compact View</option>
                </select>
              </div>
            </div>
          </div>

          {/* Processing Settings */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Processing
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Max File Size (MB)</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={settings.general.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, maxFileSize: parseInt(e.target.value) } }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-indigo-300 mt-1">
                  <span>10 MB</span>
                  <span>{settings.general.maxFileSize} MB</span>
                  <span>500 MB</span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Processing Timeout (seconds)</label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={settings.general.processingTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, processingTimeout: parseInt(e.target.value) } }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-indigo-300 mt-1">
                  <span>10s</span>
                  <span>{settings.general.processingTimeout}s</span>
                  <span>300s</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto Refresh</p>
                  <p className="text-sm text-indigo-300">Refresh data automatically</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, general: { ...prev.general, autoRefresh: !prev.general.autoRefresh } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.general.autoRefresh ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.general.autoRefresh ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-indigo-400" />
          Security & Privacy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Authentication */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Authentication
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-indigo-300">Enhanced account security</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, twoFactorAuth: !prev.security.twoFactorAuth } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.security.twoFactorAuth ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.security.twoFactorAuth ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    {settings.security.twoFactorAuth ? <Lock className="w-3 h-3 text-green-500" /> : <Unlock className="w-3 h-3 text-gray-500" />}
                  </motion.div>
                </motion.button>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Session Timeout (minutes)</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, sessionTimeout: parseInt(e.target.value) } }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Audit Logging</p>
                  <p className="text-sm text-indigo-300">Track security events</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, auditLogging: !prev.security.auditLogging } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.security.auditLogging ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.security.auditLogging ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Data Protection
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Encryption Enabled</p>
                  <p className="text-sm text-indigo-300">Encrypt sensitive data</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, encryptionEnabled: !prev.security.encryptionEnabled } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.security.encryptionEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.security.encryptionEnabled ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    {settings.security.encryptionEnabled ? <Eye className="w-3 h-3 text-green-500" /> : <EyeOff className="w-3 h-3 text-gray-500" />}
                  </motion.div>
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">API Key Rotation</p>
                  <p className="text-sm text-indigo-300">Auto-rotate API keys</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, apiKeyRotation: !prev.security.apiKeyRotation } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.security.apiKeyRotation ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.security.apiKeyRotation ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <Key className="w-3 h-3 text-indigo-500" />
                  </motion.div>
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete All Data
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-indigo-400" />
          Notifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Alert Settings */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Alert Preferences
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Alerts</p>
                  <p className="text-sm text-indigo-300">Receive email notifications</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, emailAlerts: !prev.notifications.emailAlerts } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.emailAlerts ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications.emailAlerts ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-indigo-300">Browser push alerts</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, pushNotifications: !prev.notifications.pushNotifications } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.pushNotifications ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications.pushNotifications ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Processing Complete</p>
                  <p className="text-sm text-indigo-300">Tool completion alerts</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, processingComplete: !prev.notifications.processingComplete } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.processingComplete ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications.processingComplete ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Error Alerts</p>
                  <p className="text-sm text-indigo-300">Failure notifications</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, errorAlerts: !prev.notifications.errorAlerts } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.errorAlerts ? 'bg-red-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications.errorAlerts ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <VolumeX className="w-5 h-5 text-indigo-400" />
              Quiet Hours
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Enable Quiet Hours</p>
                  <p className="text-sm text-indigo-300">Pause notifications during set hours</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, quietHours: { ...prev.notifications.quietHours, enabled: !prev.notifications.quietHours.enabled } } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.quietHours.enabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications.quietHours.enabled ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    {settings.notifications.quietHours.enabled ? <VolumeX className="w-3 h-3 text-indigo-500" /> : <Volume2 className="w-3 h-3 text-gray-500" />}
                  </motion.div>
                </motion.button>
              </div>

              {settings.notifications.quietHours.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Start Time</label>
                      <input
                        type="time"
                        value={settings.notifications.quietHours.startTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, quietHours: { ...prev.notifications.quietHours, startTime: e.target.value } } }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">End Time</label>
                      <input
                        type="time"
                        value={settings.notifications.quietHours.endTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, quietHours: { ...prev.notifications.quietHours, endTime: e.target.value } } }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Weekly Reports</p>
                  <p className="text-sm text-indigo-300">Performance summaries</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, weeklyReports: !prev.notifications.weeklyReports } }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.weeklyReports ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications.weeklyReports ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDataSection = () => (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
          <Database className="w-8 h-8 text-indigo-400" />
          Data Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export & Import */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              Export & Import
            </h4>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-xl text-indigo-300 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export All Settings
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-300 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Import Settings
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-300 transition-colors"
              >
                <Database className="w-5 h-5" />
                Export Processing History
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
              >
                <Info className="w-5 h-5" />
                Export Analytics Data
              </motion.button>
            </div>
          </div>

          {/* Backup & Recovery */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              Backup & Recovery
            </h4>

            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Last Backup</span>
                </div>
                <p className="text-white font-semibold">{new Date(metrics.lastBackup).toLocaleString()}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-300 transition-colors"
              >
                <HardDrive className="w-5 h-5" />
                Create Backup Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-xl text-yellow-300 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Restore from Backup
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetSettings}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 transition-colors"
              >
                <AlertTriangle className="w-5 h-5" />
                Reset to Defaults
              </motion.button>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="mt-8 bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            Storage Usage
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.storageUsed}</p>
              <p className="text-sm text-indigo-300">Used Storage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.apiCallsToday.toLocaleString()}</p>
              <p className="text-sm text-indigo-300">API Calls Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.configurationsChanged}</p>
              <p className="text-sm text-indigo-300">Configs Changed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.systemHealth}</p>
              <p className="text-sm text-indigo-300">System Health</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection()
      case 'general': return renderGeneralSection()
      case 'security': return renderSecuritySection()
      case 'notifications': return renderNotificationsSection()
      case 'appearance': return renderGeneralSection() // Simplified for demo
      case 'performance': return renderGeneralSection() // Simplified for demo
      case 'accessibility': return renderGeneralSection() // Simplified for demo
      case 'integrations': return renderGeneralSection() // Simplified for demo
      case 'data': return renderDataSection()
      default: return renderProfileSection()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="w-8 h-8 text-indigo-400" />
                Settings
              </h1>
              <p className="text-indigo-300 mt-1">Platform configuration and preferences</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.totalSettings}</p>
                  <p className="text-indigo-300">Total Settings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.configurationsChanged}</p>
                  <p className="text-indigo-300">Changed Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{metrics.systemHealth}</p>
                  <p className="text-indigo-300">System Health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-6">Settings Menu</h3>

              <div className="space-y-2">
                {settingsSections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === section.id
                        ? 'bg-indigo-500/30 border border-indigo-400/50 text-white'
                        : 'text-indigo-300 hover:bg-white/5'
                      }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-sm opacity-70">{section.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Save Controls */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
                  >
                    {saveStatus === 'saving' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetSettings}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset to Defaults
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {renderSectionContent()}
          </motion.div>
        </div>
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Shield className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-indigo-300">Advanced security features with encryption, audit logging, and compliance controls.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Zap className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Performance Optimization</h3>
              <p className="text-indigo-300">Fine-tune processing settings, caching, and resource allocation for optimal performance.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Database className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Data Management</h3>
              <p className="text-indigo-300">Comprehensive backup, export, and data lifecycle management capabilities.</p>
            </motion.div>
          </div>

          <div className="text-center text-indigo-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Tools Platform. All rights reserved. | Settings v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default ToolsSettingsPage
