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
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Lock,
  Unlock,
  Smartphone,
  Fingerprint,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  Bluetooth,
  Camera,
  Mic,
  Speaker,
  Battery,
  Zap,
  HardDrive,
  Cloud,
  Server,
  FileText,
  History,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Target,
  Award,
  Star,
  Heart,
  Bookmark,
  Flag,
  MapPin,
  Calendar,
  Timer,
  Stopwatch,
  AlarmClock,
  Plus,
  Minus,
  Edit,
  Trash,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  SortDesc,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Unlink,
  QrCode,
  Scan,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  Coins,
  TrendingDown,
  Calculator,
  Receipt,
  ShoppingCart
} from 'lucide-react'

// TypeScript Interfaces
interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  walletAddress: string
  joinDate: string
  tier: 'basic' | 'premium' | 'pro'
  kycStatus: 'pending' | 'verified' | 'rejected'
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  backupEnabled: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  biometricAuth: boolean
  sessionTimeout: number
  autoLock: boolean
  passwordExpiry: number
  loginAlerts: boolean
  deviceTracking: boolean
  ipWhitelist: string[]
  suspiciousActivityAlerts: boolean
  encryptionLevel: 'standard' | 'high' | 'military'
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  transactionAlerts: boolean
  priceAlerts: boolean
  stakingRewards: boolean
  deFiUpdates: boolean
  securityAlerts: boolean
  marketingEmails: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  frequency: 'instant' | 'daily' | 'weekly'
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC' | 'ETH'
  language: string
  timezone: string
  dateFormat: string
  numberFormat: string
  hideAmounts: boolean
  compactMode: boolean
  animations: boolean
  sounds: boolean
  haptics: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private'
  activityTracking: boolean
  analyticsOptIn: boolean
  cookieConsent: boolean
  dataSharing: boolean
  locationTracking: boolean
  crashReporting: boolean
  performanceData: boolean
  marketingConsent: boolean
  thirdPartyIntegrations: boolean
}

interface BackupSettings {
  cloudBackup: boolean
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  encryptedBackup: boolean
  localBackup: boolean
  seedPhraseBackup: boolean
  lastBackup: string
  backupSize: number
}

const WalletSettingsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSensitive, setShowSensitive] = useState(false)

  const [userProfile] = useState<UserProfile>({
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'AJ',
    walletAddress: '0x1234...5678',
    joinDate: '2024-03-15',
    tier: 'premium',
    kycStatus: 'verified',
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    backupEnabled: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    biometricAuth: true,
    sessionTimeout: 30,
    autoLock: true,
    passwordExpiry: 90,
    loginAlerts: true,
    deviceTracking: true,
    ipWhitelist: [],
    suspiciousActivityAlerts: true,
    encryptionLevel: 'high'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    transactionAlerts: true,
    priceAlerts: true,
    stakingRewards: true,
    deFiUpdates: false,
    securityAlerts: true,
    marketingEmails: false,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'instant'
  })

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'dark',
    accentColor: '#8B5CF6',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'US',
    hideAmounts: false,
    compactMode: false,
    animations: true,
    sounds: true,
    haptics: true
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    activityTracking: false,
    analyticsOptIn: true,
    cookieConsent: true,
    dataSharing: false,
    locationTracking: false,
    crashReporting: true,
    performanceData: true,
    marketingConsent: false,
    thirdPartyIntegrations: false
  })

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    cloudBackup: true,
    autoBackup: true,
    backupFrequency: 'weekly',
    encryptedBackup: true,
    localBackup: false,
    seedPhraseBackup: true,
    lastBackup: '2025-08-07T12:00:00Z',
    backupSize: 2.4
  })

  const categories = [
    { id: 'profile', name: 'Profile', icon: User, count: 8 },
    { id: 'security', name: 'Security', icon: Shield, count: 10 },
    { id: 'notifications', name: 'Notifications', icon: Bell, count: 12 },
    { id: 'appearance', name: 'Appearance', icon: Palette, count: 11 },
    { id: 'privacy', name: 'Privacy', icon: Eye, count: 10 },
    { id: 'backup', name: 'Backup', icon: Database, count: 7 }
  ]

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
    { code: 'ETH', symbol: 'Ξ', name: 'Ethereum' }
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' }
  ]

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'basic': return { color: 'bg-slate-500', text: 'Basic' }
      case 'premium': return { color: 'bg-purple-500', text: 'Premium' }
      case 'pro': return { color: 'bg-yellow-500', text: 'Pro' }
      default: return { color: 'bg-slate-500', text: 'Basic' }
    }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified': return { color: 'text-green-400', icon: Check, text: 'Verified' }
      case 'pending': return { color: 'text-yellow-400', icon: Clock, text: 'Pending' }
      case 'rejected': return { color: 'text-red-400', icon: X, text: 'Rejected' }
      default: return { color: 'text-slate-400', icon: Clock, text: 'Unknown' }
    }
  }

  const handleSave = () => {
    setHasChanges(false)
    setIsEditing(false)
    // Save logic here
  }

  const handleExport = () => {
    // Export settings logic
    console.log('Exporting settings...')
  }

  const handleImport = () => {
    // Import settings logic
    console.log('Importing settings...')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const ToggleSwitch = ({ checked, onChange, disabled = false }: any) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-purple-500' : 'bg-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={disabled}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      />
    </motion.button>
  )

  const SettingsCard = ({ title, description, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-slate-300 mt-1">{description}</p>}
      </div>
      {children}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
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
                <Settings className="w-8 h-8 text-slate-400" />
                Wallet Settings
              </h1>
              <p className="text-slate-300 mt-1">Manage your wallet preferences and security</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">58</p>
                  <p className="text-slate-300">Settings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">87%</p>
                  <p className="text-slate-300">Configured</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">High</p>
                  <p className="text-slate-300">Security</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">6</p>
                  <p className="text-slate-300">Categories</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-300 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </motion.button>

                {hasChanges && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </motion.button>
                )}
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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sticky top-32">
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCategory === category.id
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                          : 'text-slate-300 hover:bg-white/10'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">{category.name}</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{category.count}</span>
                    </motion.button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <div className="flex-1">
            {/* Profile Settings */}
            {selectedCategory === 'profile' && (
              <div className="space-y-6">
                <SettingsCard title="Profile Information" description="Manage your personal details and account information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                        {userProfile.avatar}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{userProfile.name}</h4>
                        <p className="text-slate-300">{userProfile.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 ${getTierBadge(userProfile.tier).color} rounded-full text-xs text-white`}>
                            {getTierBadge(userProfile.tier).text}
                          </span>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const badge = getKycBadge(userProfile.kycStatus)
                              const Icon = badge.icon
                              return (
                                <>
                                  <Icon className={`w-4 h-4 ${badge.color}`} />
                                  <span className={`text-xs ${badge.color}`}>{badge.text}</span>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Wallet Address</label>
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm flex-1">
                            {showSensitive ? userProfile.walletAddress : '0x****...****'}
                          </code>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowSensitive(!showSensitive)}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-colors"
                          >
                            {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Member Since</label>
                        <p className="text-white">{formatDate(userProfile.joinDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-300">Email Verified</p>
                        <p className="text-white font-medium">{userProfile.emailVerified ? 'Yes' : 'No'}</p>
                      </div>
                      <Check className="w-5 h-5 text-green-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-300">Phone Verified</p>
                        <p className="text-white font-medium">{userProfile.phoneVerified ? 'Yes' : 'No'}</p>
                      </div>
                      <Check className="w-5 h-5 text-green-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-300">Backup Enabled</p>
                        <p className="text-white font-medium">{userProfile.backupEnabled ? 'Yes' : 'No'}</p>
                      </div>
                      <Database className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* Security Settings */}
            {selectedCategory === 'security' && (
              <div className="space-y-6">
                <SettingsCard title="Authentication" description="Manage your authentication methods and security features">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-300">Add an extra layer of security to your account</p>
                      </div>
                      <ToggleSwitch
                        checked={securitySettings.twoFactorAuth}
                        onChange={(value: boolean) => setSecuritySettings({ ...securitySettings, twoFactorAuth: value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="text-white font-medium">Biometric Authentication</h4>
                        <p className="text-sm text-slate-300">Use fingerprint or face recognition</p>
                      </div>
                      <ToggleSwitch
                        checked={securitySettings.biometricAuth}
                        onChange={(value: boolean) => setSecuritySettings({ ...securitySettings, biometricAuth: value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="text-white font-medium">Auto Lock</h4>
                        <p className="text-sm text-slate-300">Automatically lock the app when inactive</p>
                      </div>
                      <ToggleSwitch
                        checked={securitySettings.autoLock}
                        onChange={(value: boolean) => setSecuritySettings({ ...securitySettings, autoLock: value })}
                      />
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Session Management" description="Control your login sessions and device access">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Session Timeout (minutes)</label>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Encryption Level</label>
                      <select
                        value={securitySettings.encryptionLevel}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, encryptionLevel: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="standard">Standard (AES-256)</option>
                        <option value="high">High (AES-256 + RSA)</option>
                        <option value="military">Military Grade</option>
                      </select>
                    </div>
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* Notification Settings */}
            {selectedCategory === 'notifications' && (
              <div className="space-y-6">
                <SettingsCard title="Notification Channels" description="Choose how you want to receive notifications">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <span className="text-white">Email</span>
                      </div>
                      <ToggleSwitch
                        checked={notificationSettings.email}
                        onChange={(value: boolean) => setNotificationSettings({ ...notificationSettings, email: value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-green-400" />
                        <span className="text-white">Push</span>
                      </div>
                      <ToggleSwitch
                        checked={notificationSettings.push}
                        onChange={(value: boolean) => setNotificationSettings({ ...notificationSettings, push: value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        <span className="text-white">SMS</span>
                      </div>
                      <ToggleSwitch
                        checked={notificationSettings.sms}
                        onChange={(value: boolean) => setNotificationSettings({ ...notificationSettings, sms: value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">In-App</span>
                      </div>
                      <ToggleSwitch
                        checked={notificationSettings.inApp}
                        onChange={(value: boolean) => setNotificationSettings({ ...notificationSettings, inApp: value })}
                      />
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Alert Types" description="Configure which events trigger notifications">
                  <div className="space-y-4">
                    {[
                      { key: 'transactionAlerts', label: 'Transaction Alerts', icon: DollarSign },
                      { key: 'priceAlerts', label: 'Price Alerts', icon: TrendingUp },
                      { key: 'stakingRewards', label: 'Staking Rewards', icon: Award },
                      { key: 'deFiUpdates', label: 'DeFi Updates', icon: Zap },
                      { key: 'securityAlerts', label: 'Security Alerts', icon: Shield }
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-slate-400" />
                            <span className="text-white">{item.label}</span>
                          </div>
                          <ToggleSwitch
                            checked={(notificationSettings as any)[item.key]}
                            onChange={(value: boolean) => setNotificationSettings({ ...notificationSettings, [item.key]: value })}
                          />
                        </div>
                      )
                    })}
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* Appearance Settings */}
            {selectedCategory === 'appearance' && (
              <div className="space-y-6">
                <SettingsCard title="Theme & Display" description="Customize the look and feel of your wallet">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((theme) => (
                          <motion.button
                            key={theme}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme as any })}
                            className={`p-3 rounded-xl border transition-all capitalize ${appearanceSettings.theme === theme
                                ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                : 'border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
                              }`}
                          >
                            {theme === 'light' && <Sun className="w-5 h-5 mx-auto mb-2" />}
                            {theme === 'dark' && <Moon className="w-5 h-5 mx-auto mb-2" />}
                            {theme === 'system' && <Monitor className="w-5 h-5 mx-auto mb-2" />}
                            {theme}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Currency</label>
                      <select
                        value={appearanceSettings.currency}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, currency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Language</label>
                      <select
                        value={appearanceSettings.language}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {languages.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.flag} {language.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Display Options" description="Configure display preferences and privacy settings">
                  <div className="space-y-4">
                    {[
                      { key: 'hideAmounts', label: 'Hide Amounts by Default', icon: EyeOff },
                      { key: 'compactMode', label: 'Compact Mode', icon: Monitor },
                      { key: 'animations', label: 'Enable Animations', icon: Activity },
                      { key: 'sounds', label: 'Sound Effects', icon: Volume2 },
                      { key: 'haptics', label: 'Haptic Feedback', icon: Smartphone }
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-slate-400" />
                            <span className="text-white">{item.label}</span>
                          </div>
                          <ToggleSwitch
                            checked={(appearanceSettings as any)[item.key]}
                            onChange={(value: boolean) => setAppearanceSettings({ ...appearanceSettings, [item.key]: value })}
                          />
                        </div>
                      )
                    })}
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* Privacy Settings */}
            {selectedCategory === 'privacy' && (
              <div className="space-y-6">
                <SettingsCard title="Data & Privacy" description="Control how your data is collected and used">
                  <div className="space-y-4">
                    {[
                      { key: 'activityTracking', label: 'Activity Tracking', icon: Activity },
                      { key: 'analyticsOptIn', label: 'Analytics Data', icon: BarChart3 },
                      { key: 'crashReporting', label: 'Crash Reporting', icon: AlertTriangle },
                      { key: 'performanceData', label: 'Performance Data', icon: TrendingUp },
                      { key: 'locationTracking', label: 'Location Tracking', icon: MapPin },
                      { key: 'dataSharing', label: 'Data Sharing', icon: Globe },
                      { key: 'marketingConsent', label: 'Marketing Communications', icon: Mail },
                      { key: 'thirdPartyIntegrations', label: 'Third-party Integrations', icon: Link }
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-slate-400" />
                            <span className="text-white">{item.label}</span>
                          </div>
                          <ToggleSwitch
                            checked={(privacySettings as any)[item.key]}
                            onChange={(value: boolean) => setPrivacySettings({ ...privacySettings, [item.key]: value })}
                          />
                        </div>
                      )
                    })}
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* Backup Settings */}
            {selectedCategory === 'backup' && (
              <div className="space-y-6">
                <SettingsCard title="Backup & Recovery" description="Secure your wallet with automatic backups">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="text-white font-medium">Cloud Backup</h4>
                        <p className="text-sm text-slate-300">Automatically backup to encrypted cloud storage</p>
                      </div>
                      <ToggleSwitch
                        checked={backupSettings.cloudBackup}
                        onChange={(value: boolean) => setBackupSettings({ ...backupSettings, cloudBackup: value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="text-white font-medium">Seed Phrase Backup</h4>
                        <p className="text-sm text-slate-300">Backup your recovery seed phrase</p>
                      </div>
                      <ToggleSwitch
                        checked={backupSettings.seedPhraseBackup}
                        onChange={(value: boolean) => setBackupSettings({ ...backupSettings, seedPhraseBackup: value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Backup Frequency</label>
                      <select
                        value={backupSettings.backupFrequency}
                        onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Cloud className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 font-medium">Last Backup</span>
                      </div>
                      <p className="text-white">{formatDate(backupSettings.lastBackup)}</p>
                      <p className="text-sm text-slate-300">Size: {backupSettings.backupSize} MB</p>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Quick Actions" description="Backup and restore your wallet data">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 rounded-xl text-green-300 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Create Backup</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Restore Backup</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
                    >
                      <Key className="w-5 h-5" />
                      <span>View Seed Phrase</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Reset Wallet</span>
                    </motion.button>
                  </div>
                </SettingsCard>
              </div>
            )}
          </div>
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
              <Shield className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Enhanced Security</h3>
              <p className="text-slate-300">Multi-layer security with encryption, 2FA, and biometric authentication protection.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Database className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Automated Backup</h3>
              <p className="text-slate-300">Secure cloud backups with encrypted storage and recovery seed phrase protection.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Palette className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
              <p className="text-slate-300">Customize your experience with themes, currencies, languages, and privacy controls.</p>
            </motion.div>
          </div>

          <div className="text-center text-slate-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Wallet Platform. All rights reserved. | Settings v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default WalletSettingsPage
