'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Smartphone,
  Eye,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Palette,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Image,
  Download,
  Upload,
  Save,
  RefreshCw,
  Trash2,
  Edit3,
  Copy,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  MessageSquare,
  Headphones,
  Star,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Brain,
  Heart,
  Bookmark,
  Tag,
  Filter,
  Search,
  SortAsc,
  Grid,
  List,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Home,
  Store,
  Package,
  Truck,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Percent,
  Gift,
  Users,
  Building,
  Car,
  Plane,
  Ship,
  Coffee,
  Book,
  Music,
  Film,
  Gamepad2,
  Dumbbell,
  Shirt,
  Laptop,
  Watch,
  Headphones as HeadphonesIcon,
  Baby,
  PawPrint,
  Flower,
  Utensils,
  Briefcase,
  GraduationCap,
  Palette as PaletteIcon,
  Archive,
  FileText,
  Folder,
  FolderOpen,
  Link,
  Cloud,
  Database,
  Server,
  Wifi,
  WifiOff,
  Bluetooth,
  Cast,
  AirplayIcon,
  Printer,
  Scanner,
  HardDrive,
  Cpu,
  Memory,
  Battery,
  BatteryLow,
  Power,
  PowerOff,
  PlugZap,
  Gauge,
  Thermometer,
  Timer,
  Stopwatch,
  Alarm,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  ToggleLeft,
  ToggleRight,
  Sliders,
  SlidersHorizontal,
  Layers,
  Layout,
  Sidebar,
  Menu,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react'

interface UserSettings {
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar?: string
    dateOfBirth?: Date
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
    location: {
      country: string
      state: string
      city: string
      zipCode: string
    }
  }
  preferences: {
    currency: string
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'auto'
    compactMode: boolean
    animations: boolean
    sounds: boolean
  }
  notifications: {
    email: {
      priceDrops: boolean
      orderUpdates: boolean
      promotions: boolean
      newsletters: boolean
      recommendations: boolean
    }
    push: {
      priceDrops: boolean
      orderUpdates: boolean
      promotions: boolean
      deliveryReminders: boolean
      stockAlerts: boolean
    }
    sms: {
      orderUpdates: boolean
      deliveryReminders: boolean
      urgentAlerts: boolean
    }
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    dataSharing: boolean
    analytics: boolean
    personalization: boolean
    thirdPartySharing: boolean
  }
  shopping: {
    defaultPaymentMethod?: string
    defaultShippingAddress?: string
    autoApplyCoupons: boolean
    savePaymentMethods: boolean
    trackingOptIn: boolean
    reviewReminders: boolean
    wishlistSharing: boolean
    priceAlertFrequency: 'instant' | 'daily' | 'weekly'
  }
  ai: {
    personalizedRecommendations: boolean
    shoppingAssistant: boolean
    voiceCommands: boolean
    smartFiltering: boolean
    predictiveShopping: boolean
    autoCategories: boolean
    spendingInsights: boolean
  }
  security: {
    twoFactorAuth: boolean
    loginNotifications: boolean
    deviceTracking: boolean
    biometricAuth: boolean
    sessionTimeout: number
  }
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay'
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  nickname?: string
}

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
  nickname?: string
}

export default function SettingsPreferences() {
  const [selectedTab, setSelectedTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: {
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        zipCode: '94102'
      }
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/Los_Angeles',
      theme: 'light',
      compactMode: false,
      animations: true,
      sounds: true
    },
    notifications: {
      email: {
        priceDrops: true,
        orderUpdates: true,
        promotions: false,
        newsletters: false,
        recommendations: true
      },
      push: {
        priceDrops: true,
        orderUpdates: true,
        promotions: false,
        deliveryReminders: true,
        stockAlerts: true
      },
      sms: {
        orderUpdates: true,
        deliveryReminders: true,
        urgentAlerts: true
      }
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
      personalization: true,
      thirdPartySharing: false
    },
    shopping: {
      autoApplyCoupons: true,
      savePaymentMethods: true,
      trackingOptIn: true,
      reviewReminders: true,
      wishlistSharing: false,
      priceAlertFrequency: 'instant'
    },
    ai: {
      personalizedRecommendations: true,
      shoppingAssistant: true,
      voiceCommands: false,
      smartFiltering: true,
      predictiveShopping: true,
      autoCategories: true,
      spendingInsights: true
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      deviceTracking: true,
      biometricAuth: false,
      sessionTimeout: 30
    }
  })

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
      nickname: 'Personal Visa'
    },
    {
      id: '2',
      type: 'paypal',
      isDefault: false,
      nickname: 'PayPal Account'
    }
  ])

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      street: '123 Main St, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      phone: '+1 (555) 123-4567',
      isDefault: true,
      nickname: 'Home Address'
    },
    {
      id: '2',
      type: 'work',
      name: 'John Doe',
      street: '456 Business Ave, Suite 100',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US',
      isDefault: false,
      nickname: 'Work Office'
    }
  ])

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.')
      const newSettings = { ...prev }
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newSettings
    })
    setHasUnsavedChanges(true)
  }

  const saveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      setHasUnsavedChanges(false)
    }, 1000)
  }

  const resetSettings = () => {
    // Reset to defaults
    setHasUnsavedChanges(false)
  }

  const toggleSetting = (path: string) => {
    const keys = path.split('.')
    let current: any = settings
    for (const key of keys) {
      current = current[key]
    }
    updateSetting(path, !current)
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />
      case 'paypal':
        return <DollarSign className="h-5 w-5" />
      case 'apple_pay':
      case 'google_pay':
        return <Smartphone className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5" />
      case 'work':
        return <Building className="h-5 w-5" />
      case 'other':
        return <MapPin className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <Settings className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings & Preferences</h1>
              <p className="text-sm text-gray-500">Customize your CumparAI experience</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </div>
            )}

            <motion.button
              onClick={saveSettings}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="h-5 w-5" />
              Save Changes
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-100px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <div className="space-y-1">
            {[
              { id: 'profile', name: 'Profile', icon: User, description: 'Personal information' },
              { id: 'preferences', name: 'Preferences', icon: Palette, description: 'Display & language' },
              { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Alerts & updates' },
              { id: 'privacy', name: 'Privacy', icon: Shield, description: 'Data & visibility' },
              { id: 'shopping', name: 'Shopping', icon: ShoppingCart, description: 'Shopping preferences' },
              { id: 'ai', name: 'AI Features', icon: Brain, description: 'AI & automation' },
              { id: 'payments', name: 'Payment Methods', icon: CreditCard, description: 'Cards & accounts' },
              { id: 'addresses', name: 'Addresses', icon: MapPin, description: 'Shipping addresses' },
              { id: 'security', name: 'Security', icon: Lock, description: 'Account security' },
              { id: 'support', name: 'Help & Support', icon: HelpCircle, description: 'Get assistance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${selectedTab === tab.id
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{tab.name}</p>
                  <p className="text-xs text-gray-500 truncate">{tab.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={settings.profile.firstName}
                        onChange={(e) => updateSetting('profile.firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={settings.profile.lastName}
                        onChange={(e) => updateSetting('profile.lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSetting('profile.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => updateSetting('profile.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select
                          value={settings.profile.location.country}
                          onChange={(e) => updateSetting('profile.location.country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input
                          type="text"
                          value={settings.profile.location.state}
                          onChange={(e) => updateSetting('profile.location.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={settings.profile.location.city}
                          onChange={(e) => updateSetting('profile.location.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                        <input
                          type="text"
                          value={settings.profile.location.zipCode}
                          onChange={(e) => updateSetting('profile.location.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Display & Language Preferences</h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => updateSetting('preferences.language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => updateSetting('preferences.currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => updateSetting('preferences.timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                        <option value="America/Denver">Mountain Time (MST/MDT)</option>
                        <option value="America/Chicago">Central Time (CST/CDT)</option>
                        <option value="America/New_York">Eastern Time (EST/EDT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => updateSetting('preferences.theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Interface Options</h3>

                    {[
                      { key: 'compactMode', label: 'Compact Mode', description: 'Use smaller spacing and elements' },
                      { key: 'animations', label: 'Animations', description: 'Enable smooth transitions and effects' },
                      { key: 'sounds', label: 'Sound Effects', description: 'Play notification sounds' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <button
                          onClick={() => toggleSetting(`preferences.${option.key}`)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(settings.preferences as any)[option.key] ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(settings.preferences as any)[option.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">AI Features & Automation</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'personalizedRecommendations',
                        label: 'Personalized Recommendations',
                        description: 'Get AI-powered product suggestions based on your preferences',
                        icon: Sparkles
                      },
                      {
                        key: 'shoppingAssistant',
                        label: 'AI Shopping Assistant',
                        description: 'Chat with AI for shopping advice and product searches',
                        icon: MessageSquare
                      },
                      {
                        key: 'voiceCommands',
                        label: 'Voice Commands',
                        description: 'Use voice to search products and navigate the app',
                        icon: Mic
                      },
                      {
                        key: 'smartFiltering',
                        label: 'Smart Filtering',
                        description: 'AI learns your preferences to improve search results',
                        icon: Filter
                      },
                      {
                        key: 'predictiveShopping',
                        label: 'Predictive Shopping',
                        description: 'Get notified about products you might need',
                        icon: Target
                      },
                      {
                        key: 'autoCategories',
                        label: 'Auto Categorization',
                        description: 'Automatically organize your purchases and wishlists',
                        icon: Grid
                      },
                      {
                        key: 'spendingInsights',
                        label: 'Spending Insights',
                        description: 'AI-powered analysis of your shopping patterns',
                        icon: BarChart3
                      }
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3">
                          <feature.icon className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">{feature.label}</p>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting(`ai.${feature.key}`)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(settings.ai as any)[feature.key] ? 'bg-purple-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(settings.ai as any)[feature.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">AI Privacy Notice</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      AI features use your shopping data to provide personalized experiences.
                      All data processing follows our privacy policy and you can disable features anytime.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="h-5 w-5" />
                      Add Payment Method
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg border border-gray-200">
                            {getPaymentIcon(method.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {method.nickname || `${method.brand} ${method.type.replace('_', ' ')}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {method.last4 && `•••• ${method.last4}`}
                              {method.expiryMonth && method.expiryYear &&
                                ` • Expires ${method.expiryMonth}/${method.expiryYear}`
                              }
                            </p>
                            {method.isDefault && (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition-all">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Account Settings • Privacy Controls • AI Configuration</span>
            <span>Payment Management • Security Options • Support Center</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                <Settings className="h-4 w-4" />
                Settings
              </div>
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                <Shield className="h-4 w-4" />
                Privacy
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Brain className="h-4 w-4" />
                AI Features
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
