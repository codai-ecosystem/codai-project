'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Database,
  HelpCircle,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Check,
  X,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Languages,
  MapPin,
  CreditCard,
  AlertTriangle
} from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  role: string
  timezone: string
  language: string
  avatar: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  desktopNotifications: boolean
  messageAlerts: boolean
  systemUpdates: boolean
  marketingEmails: boolean
  weeklyReports: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  loginAlerts: boolean
  sessionTimeout: number
  passwordLastChanged: Date
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  compactMode: boolean
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Alexandru',
    lastName: 'Popescu',
    email: 'alexandru.popescu@conversai.com',
    phone: '+40 721 234 567',
    company: 'ConversAI Technologies',
    role: 'Communication Manager',
    timezone: 'Europe/Bucharest',
    language: 'Romanian',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    messageAlerts: true,
    systemUpdates: true,
    marketingEmails: false,
    weeklyReports: true
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: true,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'ro',
    timezone: 'Europe/Bucharest',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    compactMode: false
  })

  const settingsSections = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'api', label: 'API Access', icon: Key },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ]

  const saveSettings = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
            { key: 'pushNotifications', label: 'Push Notifications', icon: Bell },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: MessageSquare },
            { key: 'desktopNotifications', label: 'Desktop Notifications', icon: Monitor }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof NotificationSettings] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setSecurity({ ...security, twoFactorAuth: !security.twoFactorAuth })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${security.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Session Timeout</h4>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'auto', label: 'Auto', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setAppearance({ ...appearance, theme: value as any })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${appearance.theme === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Language</h4>
            <select
              value={appearance.language}
              onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection()
      case 'notifications': return renderNotificationsSection()
      case 'security': return renderSecuritySection()
      case 'appearance': return renderAppearanceSection()
      case 'integrations':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-gray-200 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Settings</h3>
            <p className="text-gray-500">Manage your connected services and API configurations</p>
          </div>
        )
      case 'api':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value="conv_1234567890abcdef"
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-gray-200 text-center">
            <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">This section is under development</p>
          </div>
        )
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </div>
          </div>

          <motion.button
            onClick={saveSettings}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${saveSuccess
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSaving ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </header>

      <div className="flex h-[calc(100%-88px)]">
        {/* Sidebar */}
        <div className="w-72 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <nav className="space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentSection()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
