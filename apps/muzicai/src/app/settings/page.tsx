'use client'

import React, { useState } from 'react'
import { 
  Settings,
  User,
  Music,
  Bell,
  Shield,
  Palette,
  Sliders,
  Download,
  Upload,
  Key,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Volume2,
  Mic,
  Camera,
  HardDrive,
  Cloud,
  CreditCard,
  Crown,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Info,
  Star,
  Heart,
  Share2,
  Link,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    newTracks: true,
    collaborations: true,
    comments: false,
    likes: true,
    follows: true,
    system: true
  })

  const settingsSections = [
    { id: 'profile', name: 'User Profile', icon: User, color: 'text-purple-600' },
    { id: 'audio', name: 'Audio Settings', icon: Music, color: 'text-blue-600' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'text-green-600' },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield, color: 'text-red-600' },
    { id: 'appearance', name: 'Appearance', icon: Palette, color: 'text-pink-600' },
    { id: 'advanced', name: 'Advanced', icon: Sliders, color: 'text-indigo-600' }
  ]

  const audioSettings = [
    { name: 'Sample Rate', value: '44.1 kHz', options: ['44.1 kHz', '48 kHz', '96 kHz', '192 kHz'] },
    { name: 'Buffer Size', value: '512 samples', options: ['128 samples', '256 samples', '512 samples', '1024 samples'] },
    { name: 'Audio Driver', value: 'ASIO', options: ['ASIO', 'DirectSound', 'MME', 'WDM'] },
    { name: 'Input Device', value: 'AI Microphone', options: ['AI Microphone', 'Default Input', 'USB Mic'] },
    { name: 'Output Device', value: 'AI Speakers', options: ['AI Speakers', 'Default Output', 'Studio Monitors'] }
  ]

  const subscriptionPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['5 AI generations/day', 'Basic instruments', 'Standard quality', '1 project'],
      current: false,
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      features: ['Unlimited AI generations', 'Premium instruments', 'High quality exports', 'Unlimited projects', 'Collaboration tools'],
      current: true,
      popular: true
    },
    {
      name: 'Studio',
      price: '$49',
      period: '/month',
      features: ['Everything in Pro', 'Studio-grade mastering', '96kHz/24-bit quality', 'Advanced AI tools', 'Priority support'],
      current: false,
      popular: false
    }
  ]

  const integrations = [
    { name: 'Spotify', status: 'connected', icon: '🎵', description: 'Sync your playlists and releases' },
    { name: 'SoundCloud', status: 'disconnected', icon: '☁️', description: 'Upload directly to SoundCloud' },
    { name: 'YouTube Music', status: 'connected', icon: '📺', description: 'Distribute to YouTube Music' },
    { name: 'Apple Music', status: 'pending', icon: '🍎', description: 'Release on Apple Music' },
    { name: 'Bandcamp', status: 'disconnected', icon: '🎪', description: 'Sell your music on Bandcamp' },
    { name: 'Discord', status: 'connected', icon: '🎮', description: 'Share with Discord communities' }
  ]

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl">
              🎵
            </div>
            <div className="flex-1">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                <Camera className="h-4 w-4 inline mr-1" />
                Change Avatar
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              defaultValue="AI Music Producer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              defaultValue="@aiproducer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              rows={3}
              defaultValue="Creating AI-powered music that touches the soul. Electronic music enthusiast and sound designer."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="producer@muzicai.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              defaultValue="Los Angeles, CA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-gray-500" />
            <input
              type="url"
              placeholder="https://yourwebsite.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-lg">🐦</span>
            <input
              type="text"
              placeholder="@yourtwitterhandle"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-lg">📸</span>
            <input
              type="text"
              placeholder="@yourinstagram"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAudioSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Configuration</h3>
        <div className="space-y-4">
          {audioSettings.map((setting, index) => (
            <div key={index} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">{setting.name}</label>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                {setting.options.map((option) => (
                  <option key={option} value={option} selected={option === setting.value}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Audio Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">AI Processing Quality</label>
              <p className="text-xs text-gray-500">Higher quality uses more resources</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Standard</option>
              <option selected>High</option>
              <option>Ultra</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Real-time AI Processing</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Auto-save Projects</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <p className="text-xs text-gray-500">
                  {key === 'newTracks' && 'Notify when new tracks are released'}
                  {key === 'collaborations' && 'Notify about collaboration requests'}
                  {key === 'comments' && 'Notify when someone comments on your tracks'}
                  {key === 'likes' && 'Notify when your tracks are liked'}
                  {key === 'follows' && 'Notify when someone follows you'}
                  {key === 'system' && 'System updates and announcements'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Weekly Newsletter</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Product Updates</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Public Profile</label>
              <p className="text-xs text-gray-500">Make your profile visible to other users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Show Online Status</label>
              <p className="text-xs text-gray-500">Let others see when you're online</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Track Downloads</label>
              <p className="text-xs text-gray-500">Let users download your tracks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-xs text-gray-500">Add an extra layer of security</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              <Shield className="h-4 w-4 inline mr-1" />
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Change Password</label>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
              <Key className="h-4 w-4 inline mr-1" />
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Active Sessions</label>
              <p className="text-xs text-gray-500">Manage your logged-in devices</p>
            </div>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${!darkMode ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`} onClick={() => setDarkMode(false)}>
            <div className="w-full h-16 bg-gradient-to-br from-white to-gray-100 rounded mb-3 border"></div>
            <h4 className="font-medium text-gray-900">Light Mode</h4>
            <p className="text-sm text-gray-600">Clean and bright interface</p>
          </div>
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${darkMode ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`} onClick={() => setDarkMode(true)}>
            <div className="w-full h-16 bg-gradient-to-br from-gray-800 to-black rounded mb-3"></div>
            <h4 className="font-medium text-gray-900">Dark Mode</h4>
            <p className="text-sm text-gray-600">Easy on the eyes</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Customization</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Compact Mode</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Show Waveforms</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Animation Effects</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdvancedSection = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription & Billing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={`border-2 rounded-xl p-4 transition-all ${
                plan.current 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              } ${plan.popular ? 'ring-2 ring-purple-200' : ''}`}
            >
              {plan.popular && (
                <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full inline-block mb-2">
                  <Star className="h-3 w-3 inline mr-1" />
                  Popular
                </div>
              )}
              <h4 className="font-semibold text-gray-900 mb-1">{plan.name}</h4>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {plan.price}<span className="text-sm font-normal text-gray-600">{plan.period}</span>
              </div>
              <ul className="space-y-1 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <Check className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.current ? (
                <button className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium">
                  Current Plan
                </button>
              ) : (
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{integration.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  integration.status === 'connected' ? 'bg-green-100 text-green-800' :
                  integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {integration.status}
                </span>
                <button className={`text-sm px-3 py-1 rounded transition-colors ${
                  integration.status === 'connected' 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-purple-600 hover:bg-purple-50'
                }`}>
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Storage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Export Data</label>
              <p className="text-xs text-gray-500">Download all your projects and data</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 inline mr-1" />
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Clear Cache</label>
              <p className="text-xs text-gray-500">Free up storage space</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              <Trash2 className="h-4 w-4 inline mr-1" />
              Clear
            </button>
          </div>
          
          <div className="flex items-center justify-between text-red-600">
            <div>
              <label className="text-sm font-medium">Delete Account</label>
              <p className="text-xs text-red-500">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
              <Trash2 className="h-4 w-4 inline mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-gray-600">Customize your MuzicAI experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                <Save className="h-4 w-4 inline mr-1" />
                Save Changes
              </button>
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                    <span className="text-sm font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && renderProfileSection()}
            {activeSection === 'audio' && renderAudioSection()}
            {activeSection === 'notifications' && renderNotificationsSection()}
            {activeSection === 'privacy' && renderPrivacySection()}
            {activeSection === 'appearance' && renderAppearanceSection()}
            {activeSection === 'advanced' && renderAdvancedSection()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MuzicAI Settings
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configure your perfect music creation environment
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors">Help Center</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
