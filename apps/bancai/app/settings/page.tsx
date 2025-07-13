'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Key,
  Download,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  Palette,
  Languages,
  Clock,
  Camera,
  DollarSign
} from 'lucide-react'

interface Setting {
  id: string
  title: string
  description: string
  enabled: boolean
  category: 'profile' | 'security' | 'notifications' | 'privacy' | 'preferences'
}

const mockSettings: Setting[] = [
  {
    id: 'email-notifications',
    title: 'Email Notifications',
    description: 'Receive transaction alerts and updates via email',
    enabled: true,
    category: 'notifications'
  },
  {
    id: 'sms-alerts',
    title: 'SMS Alerts',
    description: 'Get instant SMS for large transactions and security events',
    enabled: true,
    category: 'notifications'
  },
  {
    id: 'push-notifications',
    title: 'Push Notifications',
    description: 'Receive push notifications on your mobile device',
    enabled: false,
    category: 'notifications'
  },
  {
    id: 'two-factor-auth',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    enabled: true,
    category: 'security'
  },
  {
    id: 'biometric-login',
    title: 'Biometric Login',
    description: 'Use fingerprint or face recognition to log in',
    enabled: true,
    category: 'security'
  },
  {
    id: 'automatic-logout',
    title: 'Automatic Logout',
    description: 'Automatically log out after 15 minutes of inactivity',
    enabled: true,
    category: 'security'
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    description: 'Share anonymized data to improve our services',
    enabled: false,
    category: 'privacy'
  },
  {
    id: 'marketing-emails',
    title: 'Marketing Communications',
    description: 'Receive promotional offers and product updates',
    enabled: false,
    category: 'privacy'
  }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ))
  }

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon className="w-5 h-5" /> },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-blue-200 mt-2">Manage your account preferences and security</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Alexandru Popescu</h4>
                <p className="text-blue-200">Premium Account Holder</p>
                <p className="text-blue-200 text-sm">Member since January 2023</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="Alexandru"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Popescu"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <input
                    type="email"
                    defaultValue="alexandru.popescu@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <input
                    type="tel"
                    defaultValue="+40 765 432 109"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-blue-200 text-sm font-medium mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-blue-200" />
                  <textarea
                    defaultValue="Strada Mihai Eminescu 15, Bucuresti, Romania"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Password Security */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Password & Authentication</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Update Password
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Security Settings</h3>

            <div className="space-y-4">
              {getSettingsByCategory('security').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.title}</h4>
                    <p className="text-blue-200 text-sm">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Active Sessions</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Current Session</h4>
                    <p className="text-blue-200 text-sm">Windows • Chrome • Bucharest, Romania</p>
                    <p className="text-emerald-400 text-xs">Active now</p>
                  </div>
                </div>
                <span className="text-emerald-400 text-sm font-medium">Current</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Mobile App</h4>
                    <p className="text-blue-200 text-sm">iPhone • iOS App • Bucharest, Romania</p>
                    <p className="text-blue-200 text-xs">2 hours ago</p>
                  </div>
                </div>
                <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>

            <div className="space-y-4">
              {getSettingsByCategory('notifications').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.title}</h4>
                    <p className="text-blue-200 text-sm">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Privacy Settings</h3>

            <div className="space-y-4">
              {getSettingsByCategory('privacy').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.title}</h4>
                    <p className="text-blue-200 text-sm">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Data Management</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Export Your Data</h4>
                <p className="text-blue-200 text-sm mb-4">Download a copy of your account data and transaction history</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Request Export
                </button>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="text-white font-medium mb-2">Delete Account</h4>
                <p className="text-red-200 text-sm mb-4">Permanently delete your account and all associated data</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* General Preferences */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">General Preferences</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Language</label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <select className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="ro">Română</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Currency</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <select className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="RON">Romanian Leu (RON)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Time Zone</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <select className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Europe/Bucharest">Europe/Bucharest (GMT+2)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Date Format</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <select className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border-2 border-blue-500">
                <div className="w-full h-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg mb-3"></div>
                <h4 className="text-white font-medium">Dark Theme</h4>
                <p className="text-blue-200 text-sm">Current theme</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border-2 border-transparent hover:border-blue-500/50 cursor-pointer">
                <div className="w-full h-20 bg-gradient-to-br from-white to-gray-100 rounded-lg mb-3"></div>
                <h4 className="text-white font-medium">Light Theme</h4>
                <p className="text-blue-200 text-sm">Coming soon</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border-2 border-transparent hover:border-blue-500/50 cursor-pointer">
                <div className="w-full h-20 bg-gradient-to-br from-purple-900 via-blue-900 to-emerald-900 rounded-lg mb-3"></div>
                <h4 className="text-white font-medium">Auto Theme</h4>
                <p className="text-blue-200 text-sm">System preference</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
