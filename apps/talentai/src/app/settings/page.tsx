'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Mail,
  Key,
  Users,
  Building,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Video,
  FileText,
  Download,
  Upload,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Moon,
  Sun,
  Monitor,
  Zap,
  Target,
  Award,
  Brain,
  Code,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Workflow,
  Integration,
  Cpu,
  HardDrive,
  Wifi,
  CloudIcon
} from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: any
  component: React.ComponentType
}

interface UserSettings {
  profile: {
    firstName: string
    lastName: string
    email: string
    role: string
    department: string
    avatar?: string
    timezone: string
    language: string
  }
  notifications: {
    email: {
      newApplications: boolean
      interviewScheduled: boolean
      candidateStatusChange: boolean
      teamMentions: boolean
      systemAlerts: boolean
      weeklyReports: boolean
    }
    push: {
      urgentNotifications: boolean
      interviewReminders: boolean
      deadlineAlerts: boolean
      teamUpdates: boolean
    }
    inApp: {
      showBadges: boolean
      soundEnabled: boolean
      desktopNotifications: boolean
    }
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    defaultView: 'grid' | 'list' | 'calendar'
    itemsPerPage: number
    autoRefresh: boolean
    compactMode: boolean
    showTutorials: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'team' | 'private'
    activityTracking: boolean
    dataSharing: boolean
    analytics: boolean
  }
}

interface SystemSettings {
  organization: {
    name: string
    logo?: string
    website: string
    address: string
    timezone: string
    currency: string
    dateFormat: string
    workingHours: {
      start: string
      end: string
      days: string[]
    }
  }
  hiring: {
    defaultInterviewDuration: number
    maxCandidatesPerJob: number
    autoArchiveAfterDays: number
    requireFeedbackForNextStage: boolean
    enableAIScoring: boolean
    enableVideoInterviews: boolean
    assessmentTimeLimit: number
  }
  integrations: {
    calendar: {
      enabled: boolean
      provider: 'google' | 'outlook' | 'apple'
      syncBidirectional: boolean
    }
    email: {
      enabled: boolean
      provider: 'smtp' | 'sendgrid' | 'mailgun'
      templates: boolean
    }
    slack: {
      enabled: boolean
      webhookUrl: string
      channels: string[]
    }
    zoom: {
      enabled: boolean
      apiKey: string
      autoCreateMeetings: boolean
    }
  }
  security: {
    twoFactorRequired: boolean
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
      requireUppercase: boolean
    }
    ipWhitelist: string[]
    auditLog: boolean
  }
}

function ProfileSettings() {
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Senior Recruiter',
    department: 'Human Resources',
    timezone: 'UTC-8 (Pacific)',
    language: 'English'
  })

  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Profile Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="UTC-8 (Pacific)">UTC-8 (Pacific)</option>
              <option value="UTC-5 (Eastern)">UTC-5 (Eastern)</option>
              <option value="UTC+0 (London)">UTC+0 (London)</option>
              <option value="UTC+1 (Central Europe)">UTC+1 (Central Europe)</option>
            </select>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center space-x-3 pt-4">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  )
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      newApplications: true,
      interviewScheduled: true,
      candidateStatusChange: false,
      teamMentions: true,
      systemAlerts: true,
      weeklyReports: false
    },
    push: {
      urgentNotifications: true,
      interviewReminders: true,
      deadlineAlerts: false,
      teamUpdates: false
    },
    inApp: {
      showBadges: true,
      soundEnabled: false,
      desktopNotifications: true
    }
  })

  const toggleNotification = (category: string, setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting as keyof typeof prev[category]]
      }
    }))
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Mail className="w-5 h-5 text-purple-400 mr-2" />
          Email Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-slate-400">
                  {key === 'newApplications' && 'Get notified when new applications are received'}
                  {key === 'interviewScheduled' && 'Receive updates when interviews are scheduled'}
                  {key === 'candidateStatusChange' && 'Updates when candidate status changes'}
                  {key === 'teamMentions' && 'Notifications when mentioned in team discussions'}
                  {key === 'systemAlerts' && 'Important system and security alerts'}
                  {key === 'weeklyReports' && 'Weekly performance and activity reports'}
                </div>
              </div>
              <button
                onClick={() => toggleNotification('email', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 text-purple-400 mr-2" />
          Push Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries(notifications.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-slate-400">
                  {key === 'urgentNotifications' && 'Critical alerts requiring immediate attention'}
                  {key === 'interviewReminders' && 'Reminders before scheduled interviews'}
                  {key === 'deadlineAlerts' && 'Alerts for approaching deadlines'}
                  {key === 'teamUpdates' && 'Updates from team members and collaborators'}
                </div>
              </div>
              <button
                onClick={() => toggleNotification('push', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* In-App Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Monitor className="w-5 h-5 text-purple-400 mr-2" />
          In-App Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries(notifications.inApp).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-slate-400">
                  {key === 'showBadges' && 'Display notification badges on navigation items'}
                  {key === 'soundEnabled' && 'Play sound for new notifications'}
                  {key === 'desktopNotifications' && 'Show desktop notifications outside the app'}
                </div>
              </div>
              <button
                onClick={() => toggleNotification('inApp', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IntegrationSettings() {
  const [integrations, setIntegrations] = useState({
    calendar: { enabled: true, provider: 'google', connected: true },
    email: { enabled: true, provider: 'smtp', connected: true },
    slack: { enabled: false, connected: false },
    zoom: { enabled: true, connected: true },
    linkedin: { enabled: false, connected: false },
    github: { enabled: false, connected: false }
  })

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return '🔗'
      case 'outlook': return '📧'
      case 'slack': return '💬'
      case 'zoom': return '📹'
      case 'linkedin': return '💼'
      case 'github': return '⚡'
      default: return '🔧'
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Third-Party Integrations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(integrations).map(([key, integration]) => (
          <div key={key} className="glassmorphism p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getProviderIcon(integration.provider || key)}</span>
                <div>
                  <h4 className="text-white font-medium capitalize">{key}</h4>
                  <p className="text-xs text-slate-400">
                    {key === 'calendar' && 'Sync interviews and meetings'}
                    {key === 'email' && 'Send automated emails and notifications'}
                    {key === 'slack' && 'Team collaboration and notifications'}
                    {key === 'zoom' && 'Video interview integration'}
                    {key === 'linkedin' && 'Candidate sourcing and profile import'}
                    {key === 'github' && 'Technical assessment integration'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.connected && (
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                )}
                <button
                  onClick={() => setIntegrations(prev => ({
                    ...prev,
                    [key]: { ...integration, enabled: !integration.enabled }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    integration.enabled ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      integration.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {integration.enabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Status:</span>
                  <span className={`${integration.connected ? 'text-green-400' : 'text-red-400'}`}>
                    {integration.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <button className={`w-full py-2 px-3 rounded text-sm font-medium transition-all ${
                  integration.connected 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                }`}>
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SecuritySettings() {
  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    sessionTimeout: 60,
    lastPasswordChange: '2024-01-15',
    loginAttempts: 3,
    ipWhitelisting: false,
    auditLog: true
  })

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="w-5 h-5 text-green-400 mr-2" />
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-slate-400 mt-1">Add an extra layer of security to your account</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${security.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                security.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {security.twoFactorEnabled && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center text-green-400 mb-2">
              <Check className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Two-factor authentication is active</span>
            </div>
            <p className="text-xs text-green-300/70">Your account is protected with authenticator app verification</p>
          </div>
        )}
      </div>

      {/* Password Security */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Key className="w-5 h-5 text-purple-400 mr-2" />
          Password Security
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Last Password Change</div>
              <div className="text-sm text-slate-400">{security.lastPasswordChange}</div>
            </div>
            <button className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all">
              Change Password
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={security.sessionTimeout}
                onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={security.loginAttempts}
                onChange={(e) => setSecurity(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Security */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 text-red-400 mr-2" />
          Advanced Security
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <div className="text-white font-medium">IP Whitelisting</div>
              <div className="text-sm text-slate-400">Restrict access to specific IP addresses</div>
            </div>
            <button
              onClick={() => setSecurity(prev => ({ ...prev, ipWhitelisting: !prev.ipWhitelisting }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                security.ipWhitelisting ? 'bg-red-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.ipWhitelisting ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <div className="text-white font-medium">Audit Logging</div>
              <div className="text-sm text-slate-400">Track all user actions and system events</div>
            </div>
            <button
              onClick={() => setSecurity(prev => ({ ...prev, auditLog: !prev.auditLog }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                security.auditLog ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.auditLog ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemSettings() {
  const [workingHours, setWorkingHours] = useState({
    start: '09:00',
    end: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  })

  const [hiringSettings, setHiringSettings] = useState({
    defaultInterviewDuration: 60,
    maxCandidatesPerJob: 100,
    autoArchiveAfterDays: 30,
    requireFeedbackForNextStage: true,
    enableAIScoring: true,
    enableVideoInterviews: true,
    assessmentTimeLimit: 120
  })

  const weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const toggleWorkingDay = (day: string) => {
    setWorkingHours(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  return (
    <div className="space-y-8">
      {/* Organization Settings */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Building className="w-5 h-5 text-purple-400 mr-2" />
          Organization Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name</label>
            <input
              type="text"
              defaultValue="TechCorp Solutions"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
            <input
              type="url"
              defaultValue="https://techcorp.com"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
            <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
            <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 text-blue-400 mr-2" />
          Working Hours
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
              <input
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
              <input
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Working Days</label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.key}
                  onClick={() => toggleWorkingDay(day.key)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    workingHours.days.includes(day.key)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hiring Configuration */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 text-green-400 mr-2" />
          Hiring Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Default Interview Duration (minutes)</label>
              <input
                type="number"
                value={hiringSettings.defaultInterviewDuration}
                onChange={(e) => setHiringSettings(prev => ({ ...prev, defaultInterviewDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Candidates Per Job</label>
              <input
                type="number"
                value={hiringSettings.maxCandidatesPerJob}
                onChange={(e) => setHiringSettings(prev => ({ ...prev, maxCandidatesPerJob: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Auto Archive After (days)</label>
              <input
                type="number"
                value={hiringSettings.autoArchiveAfterDays}
                onChange={(e) => setHiringSettings(prev => ({ ...prev, autoArchiveAfterDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(hiringSettings).slice(3).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-sm text-slate-400">
                    {key === 'requireFeedbackForNextStage' && 'Require feedback before moving candidates forward'}
                    {key === 'enableAIScoring' && 'Use AI to score candidate assessments'}
                    {key === 'enableVideoInterviews' && 'Allow video interview scheduling'}
                    {key === 'assessmentTimeLimit' && 'Default time limit for assessments'}
                  </div>
                </div>
                {typeof value === 'boolean' ? (
                  <button
                    onClick={() => setHiringSettings(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setHiringSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                    className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeSection, setActiveSection] = useState('profile')

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: User,
      component: ProfileSettings
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure email, push, and in-app notifications',
      icon: Bell,
      component: NotificationSettings
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with third-party services and tools',
      icon: Workflow,
      component: IntegrationSettings
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password, two-factor authentication, and access control',
      icon: Shield,
      component: SecuritySettings
    },
    {
      id: 'system',
      title: 'System',
      description: 'Organization settings, working hours, and hiring configuration',
      icon: Settings,
      component: SystemSettings
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const ActiveComponent = settingsSections.find(section => section.id === activeSection)?.component || ProfileSettings

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
        </div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 glassmorphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    TalentAI Settings
                  </h1>
                  <p className="text-xs text-slate-400">Configure platform preferences and integrations</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">All Services Active</span>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              className="glassmorphism rounded-xl border border-white/10 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-slate-400">{section.description}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              className="glassmorphism rounded-xl border border-white/10 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeSection}
            >
              <ActiveComponent />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Profile Management</h3>
              <p className="text-slate-400 text-sm">Customize your profile, preferences, and personal settings for optimal experience</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Security & Privacy</h3>
              <p className="text-slate-400 text-sm">Advanced security settings with two-factor authentication and access control</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">System Integration</h3>
              <p className="text-slate-400 text-sm">Seamless integration with third-party tools and automated workflow management</p>
            </motion.div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
