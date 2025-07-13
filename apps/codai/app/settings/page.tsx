'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  Palette,
  Code2,
  Database,
  Cloud,
  Key,
  Monitor,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
  Moon,
  Sun,
  Globe
} from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    builds: true,
    deployments: true,
    errors: true,
    security: true,
    updates: false
  })
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    theme: 'dark',
    autoSave: true,
    codeCompletion: true,
    linting: true
  })

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Manage your account information'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Configure notification preferences'
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Security and authentication settings'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      description: 'Customize the interface'
    },
    {
      id: 'development',
      title: 'Development',
      icon: <Code2 className="w-5 h-5" />,
      description: 'Development environment settings'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: <Cloud className="w-5 h-5" />,
      description: 'Third-party integrations'
    }
  ]

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">JD</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">John Developer</h3>
          <p className="text-slate-400">john.developer@codai.com</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Change Avatar
          </motion.button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
          <input
            type="text"
            defaultValue="John"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
          <input
            type="text"
            defaultValue="Developer"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input
            type="email"
            defaultValue="john.developer@codai.com"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
          <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400">
            <option>Senior Developer</option>
            <option>Team Lead</option>
            <option>DevOps Engineer</option>
            <option>Product Manager</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
        <textarea
          rows={4}
          defaultValue="Passionate full-stack developer with expertise in React, Node.js, and cloud architecture."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 resize-none"
        />
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-sm text-slate-400">
                  {key === 'builds' && 'Get notified when builds complete'}
                  {key === 'deployments' && 'Deployment status updates'}
                  {key === 'errors' && 'Critical error notifications'}
                  {key === 'security' && 'Security alerts and warnings'}
                  {key === 'updates' && 'Product updates and announcements'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
        <div className="flex items-center justify-between p-4 bg-amber-600/20 border border-amber-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-amber-300 font-medium">Browser notifications disabled</p>
              <p className="text-amber-400/70 text-sm">Enable to receive real-time alerts</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors">
            Enable
          </button>
        </div>
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <div className="p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-emerald-300 font-medium">2FA is enabled</p>
              <p className="text-emerald-400/70 text-sm">Your account is protected with two-factor authentication</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Development Key</p>
              <p className="text-slate-400 text-sm">Created 2 weeks ago • Last used 3 hours ago</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm rounded-md transition-colors">
                Revoke
              </button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 border-2 border-dashed border-white/20 rounded-lg text-slate-400 hover:text-white hover:border-white/40 transition-all"
          >
            + Generate New API Key
          </motion.button>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {['dark', 'light', 'auto'].map((theme) => (
            <motion.button
              key={theme}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePreferenceChange('theme', theme)}
              className={`p-4 rounded-lg border-2 transition-all ${preferences.theme === theme
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-white/20 hover:border-white/40'
                }`}
            >
              <div className="flex items-center justify-center mb-2">
                {theme === 'dark' && <Moon className="w-6 h-6 text-slate-400" />}
                {theme === 'light' && <Sun className="w-6 h-6 text-yellow-400" />}
                {theme === 'auto' && <Monitor className="w-6 h-6 text-blue-400" />}
              </div>
              <p className="text-white text-sm capitalize">{theme}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Language & Region</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="CET">Central European Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDevelopmentSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Editor Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Auto Save</p>
              <p className="text-sm text-slate-400">Automatically save changes</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.autoSave ? 'bg-blue-600' : 'bg-slate-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Code Completion</p>
              <p className="text-sm text-slate-400">AI-powered code suggestions</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('codeCompletion', !preferences.codeCompletion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.codeCompletion ? 'bg-blue-600' : 'bg-slate-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.codeCompletion ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Linting</p>
              <p className="text-sm text-slate-400">Real-time code analysis</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('linting', !preferences.linting)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.linting ? 'bg-blue-600' : 'bg-slate-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.linting ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Build Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Node.js Version</label>
            <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400">
              <option>18.x</option>
              <option>20.x</option>
              <option>21.x</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Package Manager</label>
            <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400">
              <option>pnpm</option>
              <option>npm</option>
              <option>yarn</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {[
          { name: 'GitHub', connected: true, icon: '🐙' },
          { name: 'GitLab', connected: false, icon: '🦊' },
          { name: 'Docker Hub', connected: true, icon: '🐳' },
          { name: 'AWS', connected: false, icon: '☁️' },
          { name: 'Vercel', connected: true, icon: '▲' },
          { name: 'Slack', connected: false, icon: '💬' }
        ].map((integration) => (
          <div key={integration.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{integration.icon}</span>
              <div>
                <p className="text-white font-medium">{integration.name}</p>
                <p className="text-slate-400 text-sm">
                  {integration.connected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <button
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${integration.connected
                  ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400'
                }`}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection()
      case 'notifications': return renderNotificationsSection()
      case 'security': return renderSecuritySection()
      case 'appearance': return renderAppearanceSection()
      case 'development': return renderDevelopmentSection()
      case 'integrations': return renderIntegrationsSection()
      default: return renderProfileSection()
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 relative z-10"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-slate-400">Manage your preferences</p>
        </div>

        <div className="space-y-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left p-4 rounded-lg transition-all ${activeSection === section.id
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <div className="flex items-center space-x-3">
                {section.icon}
                <div>
                  <p className="font-medium">{section.title}</p>
                  <p className="text-xs opacity-70">{section.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {sections.find(s => s.id === activeSection)?.title}
              </h1>
              <p className="text-slate-400">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
