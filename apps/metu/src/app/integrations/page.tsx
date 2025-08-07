'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  Link,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Database,
  Bot,
  Mic,
  Speaker,
  Headphones,
  Bluetooth,
  Wifi,
  Settings,
  Shield,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  MessageSquare,
  Phone,
  Video,
  Mail,
  Send,
  FileText,
  Folder,
  Image,
  Music,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  Bookmark,
  Share2,
  Info,
  HelpCircle,
  Lock,
  Unlock,
  Sparkles,
  Crown,
  Award,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Layers,
  Box,
  Package,
  Truck,
  Home,
  Building,
  Factory,
  Store,
  ShoppingCart,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Briefcase,
  Laptop,
  Tablet,
  Watch,
  Camera,
  Printer,
  Router,
  Server,
  HardDrive,
  Cpu,
  Memory,
  CircuitBoard
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'smart_devices' | 'cloud_services' | 'voice_platforms' | 'productivity' | 'development';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: any;
  color: string;
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'advanced';
  lastSync: string;
  usageCount: number;
  isPopular: boolean;
  isPremium: boolean;
  version: string;
  documentationUrl: string;
  authType: 'oauth' | 'api_key' | 'webhook' | 'manual';
}

interface ConnectionStatus {
  total: number;
  connected: number;
  pending: number;
  errors: number;
}

interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  count: number;
}

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const connectionStatus: ConnectionStatus = {
    total: 24,
    connected: 18,
    pending: 3,
    errors: 2
  };

  const categories: IntegrationCategory[] = [
    {
      id: 'communication',
      name: 'Communication',
      description: 'Voice calls, messaging, and collaboration tools',
      icon: MessageSquare,
      color: 'blue',
      count: 8
    },
    {
      id: 'smart_devices',
      name: 'Smart Devices',
      description: 'IoT devices, smart home, and connected hardware',
      icon: Home,
      color: 'green',
      count: 6
    },
    {
      id: 'cloud_services',
      name: 'Cloud Services',
      description: 'Cloud storage, computing, and data services',
      icon: Cloud,
      color: 'purple',
      count: 5
    },
    {
      id: 'voice_platforms',
      name: 'Voice Platforms',
      description: 'Voice AI services and speech processing APIs',
      icon: Mic,
      color: 'orange',
      count: 4
    },
    {
      id: 'productivity',
      name: 'Productivity',
      description: 'Office tools, scheduling, and workflow automation',
      icon: Briefcase,
      color: 'indigo',
      count: 7
    },
    {
      id: 'development',
      name: 'Development',
      description: 'Developer tools, APIs, and code integration',
      icon: Laptop,
      color: 'red',
      count: 4
    }
  ];

  const integrations: Integration[] = [
    {
      id: 'azure-speech',
      name: 'Azure Speech Services',
      description: 'Microsoft Azure Speech-to-Text and Text-to-Speech API integration for enhanced voice capabilities',
      category: 'voice_platforms',
      provider: 'Microsoft',
      status: 'connected',
      icon: Cloud,
      color: 'blue',
      features: ['Speech Recognition', 'Voice Synthesis', 'Neural Voices', 'Custom Models'],
      setupComplexity: 'medium',
      lastSync: '2 minutes ago',
      usageCount: 1247,
      isPopular: true,
      isPremium: false,
      version: '1.24.0',
      documentationUrl: 'https://docs.microsoft.com/azure/speech',
      authType: 'api_key'
    },
    {
      id: 'google-assistant',
      name: 'Google Assistant SDK',
      description: 'Integration with Google Assistant for smart device control and voice interactions',
      category: 'voice_platforms',
      provider: 'Google',
      status: 'connected',
      icon: Bot,
      color: 'green',
      features: ['Smart Home Control', 'Voice Commands', 'Device Integration', 'Contextual Responses'],
      setupComplexity: 'advanced',
      lastSync: '5 minutes ago',
      usageCount: 892,
      isPopular: true,
      isPremium: false,
      version: '2.1.5',
      documentationUrl: 'https://developers.google.com/assistant',
      authType: 'oauth'
    },
    {
      id: 'alexa-skills',
      name: 'Amazon Alexa Skills Kit',
      description: 'Build and deploy custom Alexa skills with METU voice AI capabilities',
      category: 'voice_platforms',
      provider: 'Amazon',
      status: 'pending',
      icon: Speaker,
      color: 'orange',
      features: ['Custom Skills', 'Smart Home Skills', 'Flash Briefing', 'Account Linking'],
      setupComplexity: 'advanced',
      lastSync: 'Never',
      usageCount: 0,
      isPopular: true,
      isPremium: false,
      version: '1.8.2',
      documentationUrl: 'https://developer.amazon.com/alexa/alexa-skills-kit',
      authType: 'oauth'
    },
    {
      id: 'slack-bot',
      name: 'Slack Bot Integration',
      description: 'Deploy METU as a Slack bot for team communication and voice assistance',
      category: 'communication',
      provider: 'Slack',
      status: 'connected',
      icon: MessageSquare,
      color: 'purple',
      features: ['Bot Commands', 'Channel Integration', 'Direct Messages', 'File Sharing'],
      setupComplexity: 'easy',
      lastSync: '1 hour ago',
      usageCount: 456,
      isPopular: true,
      isPremium: false,
      version: '3.2.1',
      documentationUrl: 'https://api.slack.com/bot-users',
      authType: 'oauth'
    },
    {
      id: 'discord-bot',
      name: 'Discord Voice Bot',
      description: 'Voice-enabled Discord bot for gaming communities and voice channels',
      category: 'communication',
      provider: 'Discord',
      status: 'connected',
      icon: Headphones,
      color: 'indigo',
      features: ['Voice Channels', 'Music Player', 'Custom Commands', 'Server Management'],
      setupComplexity: 'medium',
      lastSync: '30 minutes ago',
      usageCount: 723,
      isPopular: true,
      isPremium: false,
      version: '2.4.6',
      documentationUrl: 'https://discord.com/developers/docs',
      authType: 'api_key'
    },
    {
      id: 'teams-integration',
      name: 'Microsoft Teams',
      description: 'Integrate METU with Microsoft Teams for meetings and collaboration',
      category: 'communication',
      provider: 'Microsoft',
      status: 'error',
      icon: Video,
      color: 'blue',
      features: ['Meeting Bot', 'Chat Integration', 'Voice Commands', 'Calendar Access'],
      setupComplexity: 'medium',
      lastSync: '2 days ago',
      usageCount: 234,
      isPopular: false,
      isPremium: true,
      version: '1.9.3',
      documentationUrl: 'https://docs.microsoft.com/microsoftteams',
      authType: 'oauth'
    },
    {
      id: 'philips-hue',
      name: 'Philips Hue',
      description: 'Control Philips Hue smart lights with voice commands through METU',
      category: 'smart_devices',
      provider: 'Philips',
      status: 'connected',
      icon: Lightbulb,
      color: 'yellow',
      features: ['Light Control', 'Color Changing', 'Scenes', 'Scheduling'],
      setupComplexity: 'easy',
      lastSync: '15 minutes ago',
      usageCount: 167,
      isPopular: true,
      isPremium: false,
      version: '1.45.0',
      documentationUrl: 'https://developers.meethue.com',
      authType: 'api_key'
    },
    {
      id: 'nest-thermostat',
      name: 'Google Nest',
      description: 'Smart thermostat and home automation control via voice commands',
      category: 'smart_devices',
      provider: 'Google',
      status: 'connected',
      icon: Home,
      color: 'green',
      features: ['Temperature Control', 'Scheduling', 'Energy Monitoring', 'Presence Detection'],
      setupComplexity: 'medium',
      lastSync: '1 hour ago',
      usageCount: 89,
      isPopular: false,
      isPremium: false,
      version: '3.1.2',
      documentationUrl: 'https://developers.nest.com',
      authType: 'oauth'
    },
    {
      id: 'aws-lambda',
      name: 'AWS Lambda',
      description: 'Serverless function execution for METU voice processing workflows',
      category: 'cloud_services',
      provider: 'Amazon Web Services',
      status: 'connected',
      icon: Zap,
      color: 'orange',
      features: ['Serverless Functions', 'Auto Scaling', 'Event Triggers', 'Cost Optimization'],
      setupComplexity: 'advanced',
      lastSync: '10 minutes ago',
      usageCount: 1523,
      isPopular: true,
      isPremium: true,
      version: '2.3.1',
      documentationUrl: 'https://docs.aws.amazon.com/lambda',
      authType: 'api_key'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Schedule management and meeting coordination through voice commands',
      category: 'productivity',
      provider: 'Google',
      status: 'connected',
      icon: Calendar,
      color: 'blue',
      features: ['Event Creation', 'Meeting Scheduling', 'Reminders', 'Availability Check'],
      setupComplexity: 'easy',
      lastSync: '5 minutes ago',
      usageCount: 678,
      isPopular: true,
      isPremium: false,
      version: '3.41.0',
      documentationUrl: 'https://developers.google.com/calendar',
      authType: 'oauth'
    },
    {
      id: 'github-integration',
      name: 'GitHub Integration',
      description: 'Voice-controlled repository management and code review assistance',
      category: 'development',
      provider: 'GitHub',
      status: 'pending',
      icon: Package,
      color: 'gray',
      features: ['Repository Access', 'Issue Management', 'Pull Requests', 'Code Review'],
      setupComplexity: 'medium',
      lastSync: 'Never',
      usageCount: 0,
      isPopular: false,
      isPremium: false,
      version: '4.2.0',
      documentationUrl: 'https://docs.github.com/rest',
      authType: 'oauth'
    },
    {
      id: 'spotify-control',
      name: 'Spotify Integration',
      description: 'Voice-controlled music playback and playlist management',
      category: 'productivity',
      provider: 'Spotify',
      status: 'connected',
      icon: Music,
      color: 'green',
      features: ['Music Control', 'Playlist Management', 'Search', 'Recommendations'],
      setupComplexity: 'easy',
      lastSync: '3 minutes ago',
      usageCount: 445,
      isPopular: true,
      isPremium: false,
      version: '1.5.8',
      documentationUrl: 'https://developer.spotify.com/web-api',
      authType: 'oauth'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle2;
      case 'disconnected': return XCircle;
      case 'error': return AlertCircle;
      case 'pending': return Clock;
      default: return XCircle;
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-100';
      case 'red': return 'text-red-600 bg-red-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'gray': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !showConnectedOnly || integration.status === 'connected';
    
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Voice AI Integrations
              </h1>
              <p className="text-gray-600 mt-1">
                Connect METU with your favorite services and devices
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Integration</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Dashboard', href: '/metu', current: false },
              { name: 'Conversations', href: '/metu/conversations', current: false },
              { name: 'Training', href: '/metu/training', current: false },
              { name: 'Analytics', href: '/metu/analytics', current: false },
              { name: 'Personality', href: '/metu/personality', current: false },
              { name: 'Integrations', href: '/metu/integrations', current: true },
              { name: 'Settings', href: '/metu/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Status Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{connectionStatus.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-green-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{connectionStatus.connected}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-yellow-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{connectionStatus.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-red-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-red-600">{connectionStatus.errors}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showConnectedOnly}
                  onChange={(e) => setShowConnectedOnly(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Connected only</span>
              </label>
              <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white/50 hover:border-blue-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${getCategoryColor(category.color)} mx-auto w-fit mb-2`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 text-center">{category.name}</h3>
                <p className="text-xs text-gray-600 text-center mt-1">{category.count} apps</p>
              </button>
            );
          })}
        </motion.div>

        {/* Integrations Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {filteredIntegrations.map((integration) => {
            const IconComponent = integration.icon;
            const StatusIcon = getStatusIcon(integration.status);
            
            return (
              <div key={integration.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(integration.color)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{integration.name}</span>
                        {integration.isPopular && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {integration.isPremium && <Crown className="w-4 h-4 text-purple-500" />}
                      </h3>
                      <p className="text-sm text-gray-600">{integration.provider}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)} flex items-center space-x-1`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="capitalize">{integration.status}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{integration.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Usage: {integration.usageCount.toLocaleString()}</span>
                    <span>v{integration.version}</span>
                  </div>

                  <div className="flex space-x-2">
                    {integration.status === 'connected' ? (
                      <button className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium">
                        Disconnect
                      </button>
                    ) : (
                      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                        Connect
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedIntegration(integration.id)}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Integration Details Modal */}
        {selectedIntegrationData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedIntegration(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${getCategoryColor(selectedIntegrationData.color)}`}>
                      <selectedIntegrationData.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedIntegrationData.name}</h2>
                      <p className="text-gray-600">{selectedIntegrationData.provider}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedIntegration(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedIntegrationData.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedIntegrationData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Setup Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Complexity:</span>
                          <span className="capitalize">{selectedIntegrationData.setupComplexity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auth Type:</span>
                          <span className="uppercase">{selectedIntegrationData.authType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span>v{selectedIntegrationData.version}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Usage Statistics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Usage:</span>
                          <span>{selectedIntegrationData.usageCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Sync:</span>
                          <span>{selectedIntegrationData.lastSync}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="capitalize">{selectedIntegrationData.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      {selectedIntegrationData.status === 'connected' ? 'Reconfigure' : 'Connect Now'}
                    </button>
                    <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Documentation</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Setup Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Quick Setup Guide</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Integration</h3>
              <p className="text-sm text-gray-600">Select from our library of pre-built integrations or create custom connections</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Configure Settings</h3>
              <p className="text-sm text-gray-600">Follow our step-by-step setup process with authentication and configuration</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Using</h3>
              <p className="text-sm text-gray-600">Begin using voice commands to control your connected services and devices</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">METU Integrations</h3>
              <p className="text-blue-200 mb-6 max-w-md">
                Connect your voice AI with the tools and services you use every day. 
                Build powerful voice-controlled workflows across your digital ecosystem.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Zap className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Link className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Globe className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Integration Categories</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Communication</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Smart Devices</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Cloud Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Voice Platforms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Developer Tools</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Custom Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Webhooks</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">SDKs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 METU Integrations. Connect everything with voice.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-blue-500 text-white">
                🔗 {connectionStatus.connected} Connected
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
