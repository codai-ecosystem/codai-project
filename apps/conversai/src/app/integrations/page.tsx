'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Settings,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Play,
  Pause,
  StopCircle,
  Edit,
  Trash2,
  Copy,
  Share,
  Star,
  MoreVertical,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Mail,
  MessageSquare,
  Users,
  Database,
  Cloud,
  Server,
  Smartphone,
  Monitor,
  Wifi,
  Lock,
  Unlock,
  Key,
  Shield,
  Activity,
  TrendingUp,
  BarChart,
  PieChart,
  FileText,
  Image,
  Video,
  Mic,
  Phone,
  MapPin,
  Building,
  Briefcase,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Percent,
  Hash,
  AtSign,
  Link,
  Workflow,
  GitBranch,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Memory,
  Network,
  Radio,
  Bluetooth,
  Headphones,
  Camera,
  Printer,
  Scanner,
  Mouse,
  Keyboard,
  Gamepad2,
  Tv,
  Speaker,
  Volume2,
  Bell,
  Notification,
  Flag,
  Bookmark,
  Tag,
  Layers,
  Grid,
  List,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Award,
  Trophy,
  Medal,
  Crown,
  Target,
  Compass,
  Navigation,
  Map,
  Route,
  Send,
  Inbox,
  Archive,
  Folder,
  FolderOpen,
  File,
  FileType,
  FilePlus,
  FileCheck,
  FileX,
  Save,
  Paperclip,
  Scissors,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  ClipboardX,
  Command,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Move,
  MousePointer,
  Hand,
  Pointer,
  CursorArrow,
  Navigation2,
  Locate,
  LocateFixed,
  LocateOff,
  Crosshair,
  Focus,
  Scan,
  ScanLine,
  QrCode,
  Aperture,
  CameraOff,
  Flashlight,
  FlashlightOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Zap as Lightning,
  Battery,
  BatteryLow,
  Plug,
  Power,
  PowerOff,
  Lightbulb,
  LightbulbOff
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  icon: any
  color: string
  status: 'connected' | 'available' | 'pending' | 'error' | 'disabled'
  isPopular: boolean
  isPremium: boolean
  version: string
  provider: string
  setupComplexity: 'easy' | 'medium' | 'complex'
  usageCount: number
  lastUsed?: Date
  rating: number
  reviews: number
  features: string[]
  permissions: string[]
  pricing: string
  documentation: string
  supportedTriggers: string[]
  supportedActions: string[]
  connectionConfig?: any
}

interface IntegrationCategory {
  id: string
  name: string
  icon: any
  color: string
  count: number
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: {
    integration: string
    event: string
    config: any
  }
  actions: {
    integration: string
    action: string
    config: any
  }[]
  status: 'active' | 'paused' | 'error' | 'draft'
  executions: number
  lastRun?: Date
  avgRunTime: string
  successRate: number
  createdAt: Date
  tags: string[]
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  status: 'active' | 'inactive' | 'error'
  events: string[]
  lastTriggered?: Date
  requestCount: number
  errorRate: number
  avgResponseTime: string
  authentication: 'none' | 'basic' | 'bearer' | 'api_key'
  headers: Record<string, string>
  retryPolicy: {
    enabled: boolean
    maxRetries: number
    backoffDelay: number
  }
}

export default function IntegrationsPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [selectedTab, setSelectedTab] = useState<'integrations' | 'workflows' | 'webhooks' | 'api-keys'>('integrations')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const categories: IntegrationCategory[] = [
    { id: 'communication', name: 'Communication', icon: MessageSquare, color: 'from-blue-500 to-indigo-600', count: 12 },
    { id: 'productivity', name: 'Productivity', icon: Briefcase, color: 'from-green-500 to-emerald-600', count: 8 },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'from-purple-500 to-violet-600', count: 10 },
    { id: 'crm', name: 'CRM & Sales', icon: Users, color: 'from-orange-500 to-red-600', count: 6 },
    { id: 'cloud', name: 'Cloud Services', icon: Cloud, color: 'from-teal-500 to-cyan-600', count: 9 },
    { id: 'analytics', name: 'Analytics', icon: BarChart, color: 'from-pink-500 to-rose-600', count: 7 },
    { id: 'payment', name: 'Payment', icon: CreditCard, color: 'from-yellow-500 to-amber-600', count: 5 },
    { id: 'development', name: 'Development', icon: Code, color: 'from-indigo-500 to-purple-600', count: 11 }
  ]

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Gmail',
      description: 'Send and receive emails, manage labels, and automate email workflows',
      category: categories[0],
      icon: Mail,
      color: 'from-red-500 to-red-600',
      status: 'connected',
      isPopular: true,
      isPremium: false,
      version: '2.1.0',
      provider: 'Google',
      setupComplexity: 'easy',
      usageCount: 1247,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      rating: 4.8,
      reviews: 2847,
      features: ['Email sending', 'Label management', 'Thread operations', 'Attachment handling'],
      permissions: ['Read emails', 'Send emails', 'Manage labels', 'Access attachments'],
      pricing: 'Free',
      documentation: 'https://docs.google.com/gmail-api',
      supportedTriggers: ['New email', 'New label', 'Email starred', 'Email archived'],
      supportedActions: ['Send email', 'Create label', 'Star email', 'Archive email', 'Reply to email']
    },
    {
      id: '2',
      name: 'Slack',
      description: 'Send messages, create channels, and manage team communication',
      category: categories[0],
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      status: 'connected',
      isPopular: true,
      isPremium: false,
      version: '3.2.1',
      provider: 'Slack Technologies',
      setupComplexity: 'easy',
      usageCount: 856,
      lastUsed: new Date(Date.now() - 30 * 60 * 1000),
      rating: 4.7,
      reviews: 1923,
      features: ['Message sending', 'Channel management', 'File sharing', 'User management'],
      permissions: ['Send messages', 'Read channels', 'Upload files', 'Manage users'],
      pricing: 'Free',
      documentation: 'https://api.slack.com/docs',
      supportedTriggers: ['New message', 'Mention received', 'Channel created', 'User joined'],
      supportedActions: ['Send message', 'Create channel', 'Upload file', 'Set status', 'Invite user']
    },
    {
      id: '3',
      name: 'Microsoft Teams',
      description: 'Collaborate with team members and automate meeting workflows',
      category: categories[0],
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      status: 'connected',
      isPopular: false,
      isPremium: true,
      version: '1.8.3',
      provider: 'Microsoft',
      setupComplexity: 'medium',
      usageCount: 342,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
      rating: 4.5,
      reviews: 756,
      features: ['Meeting scheduling', 'Team chat', 'File collaboration', 'Video calls'],
      permissions: ['Schedule meetings', 'Send messages', 'Access files', 'Start calls'],
      pricing: '$8/month',
      documentation: 'https://docs.microsoft.com/teams',
      supportedTriggers: ['Meeting started', 'Message received', 'File uploaded', 'User status changed'],
      supportedActions: ['Schedule meeting', 'Send message', 'Share file', 'Update status']
    },
    {
      id: '4',
      name: 'Google Calendar',
      description: 'Create events, manage schedules, and sync meeting data',
      category: categories[1],
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      status: 'available',
      isPopular: true,
      isPremium: false,
      version: '2.5.0',
      provider: 'Google',
      setupComplexity: 'easy',
      usageCount: 0,
      rating: 4.9,
      reviews: 3421,
      features: ['Event creation', 'Calendar sharing', 'Reminder management', 'Attendee tracking'],
      permissions: ['Read calendar', 'Create events', 'Manage reminders', 'Access attendees'],
      pricing: 'Free',
      documentation: 'https://developers.google.com/calendar',
      supportedTriggers: ['Event created', 'Event updated', 'Event deleted', 'Reminder triggered'],
      supportedActions: ['Create event', 'Update event', 'Delete event', 'Add attendee', 'Set reminder']
    },
    {
      id: '5',
      name: 'Trello',
      description: 'Manage boards, cards, and project workflows efficiently',
      category: categories[1],
      icon: Grid,
      color: 'from-blue-500 to-teal-600',
      status: 'pending',
      isPopular: false,
      isPremium: false,
      version: '1.9.2',
      provider: 'Atlassian',
      setupComplexity: 'easy',
      usageCount: 0,
      rating: 4.6,
      reviews: 1287,
      features: ['Board management', 'Card operations', 'List automation', 'Member assignment'],
      permissions: ['Read boards', 'Create cards', 'Manage lists', 'Assign members'],
      pricing: 'Free',
      documentation: 'https://developer.atlassian.com/cloud/trello',
      supportedTriggers: ['Card created', 'Card moved', 'Due date approaching', 'Member assigned'],
      supportedActions: ['Create card', 'Move card', 'Add comment', 'Assign member', 'Set due date']
    },
    {
      id: '6',
      name: 'HubSpot',
      description: 'Sync contacts, track deals, and automate marketing campaigns',
      category: categories[3],
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      status: 'error',
      isPopular: true,
      isPremium: true,
      version: '3.1.4',
      provider: 'HubSpot',
      setupComplexity: 'complex',
      usageCount: 234,
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rating: 4.4,
      reviews: 892,
      features: ['Contact management', 'Deal tracking', 'Email campaigns', 'Analytics reporting'],
      permissions: ['Read contacts', 'Create deals', 'Send emails', 'Access analytics'],
      pricing: '$50/month',
      documentation: 'https://developers.hubspot.com',
      supportedTriggers: ['Contact created', 'Deal updated', 'Email opened', 'Form submitted'],
      supportedActions: ['Create contact', 'Update deal', 'Send email', 'Add to list', 'Create task']
    },
    {
      id: '7',
      name: 'Salesforce',
      description: 'Manage leads, opportunities, and customer relationships',
      category: categories[3],
      icon: Building,
      color: 'from-blue-500 to-blue-700',
      status: 'available',
      isPopular: true,
      isPremium: true,
      version: '4.2.1',
      provider: 'Salesforce',
      setupComplexity: 'complex',
      usageCount: 0,
      rating: 4.3,
      reviews: 1456,
      features: ['Lead management', 'Opportunity tracking', 'Account management', 'Reporting'],
      permissions: ['Read leads', 'Create opportunities', 'Update accounts', 'Access reports'],
      pricing: '$75/month',
      documentation: 'https://developer.salesforce.com',
      supportedTriggers: ['Lead created', 'Opportunity closed', 'Account updated', 'Task completed'],
      supportedActions: ['Create lead', 'Update opportunity', 'Assign task', 'Send email', 'Create account']
    },
    {
      id: '8',
      name: 'AWS S3',
      description: 'Store files, backup data, and manage cloud storage workflows',
      category: categories[4],
      icon: Cloud,
      color: 'from-yellow-500 to-orange-600',
      status: 'connected',
      isPopular: false,
      isPremium: false,
      version: '2.3.0',
      provider: 'Amazon Web Services',
      setupComplexity: 'medium',
      usageCount: 567,
      lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000),
      rating: 4.7,
      reviews: 678,
      features: ['File upload', 'Bucket management', 'Access control', 'Backup automation'],
      permissions: ['Upload files', 'Download files', 'Manage buckets', 'Set permissions'],
      pricing: 'Pay-as-you-go',
      documentation: 'https://docs.aws.amazon.com/s3',
      supportedTriggers: ['File uploaded', 'File deleted', 'Bucket created', 'Access granted'],
      supportedActions: ['Upload file', 'Delete file', 'Create bucket', 'Set permissions', 'Copy file']
    },
    {
      id: '9',
      name: 'Google Analytics',
      description: 'Track website performance and analyze user behavior data',
      category: categories[5],
      icon: BarChart,
      color: 'from-blue-500 to-green-600',
      status: 'connected',
      isPopular: true,
      isPremium: false,
      version: '1.7.2',
      provider: 'Google',
      setupComplexity: 'medium',
      usageCount: 423,
      lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      rating: 4.6,
      reviews: 1834,
      features: ['Traffic analysis', 'Goal tracking', 'Custom reports', 'Real-time data'],
      permissions: ['Read analytics', 'Access reports', 'View goals', 'Export data'],
      pricing: 'Free',
      documentation: 'https://developers.google.com/analytics',
      supportedTriggers: ['Goal completed', 'Traffic spike', 'New visitor', 'Session started'],
      supportedActions: ['Track event', 'Create goal', 'Generate report', 'Send alert']
    },
    {
      id: '10',
      name: 'Stripe',
      description: 'Process payments, manage subscriptions, and handle billing',
      category: categories[6],
      icon: CreditCard,
      color: 'from-purple-500 to-indigo-600',
      status: 'available',
      isPopular: true,
      isPremium: false,
      version: '3.4.1',
      provider: 'Stripe',
      setupComplexity: 'medium',
      usageCount: 0,
      rating: 4.8,
      reviews: 2156,
      features: ['Payment processing', 'Subscription management', 'Invoice generation', 'Dispute handling'],
      permissions: ['Process payments', 'Create customers', 'Manage subscriptions', 'Access analytics'],
      pricing: '2.9% + 30¢ per transaction',
      documentation: 'https://stripe.com/docs',
      supportedTriggers: ['Payment succeeded', 'Subscription created', 'Invoice paid', 'Dispute created'],
      supportedActions: ['Create payment', 'Refund payment', 'Create subscription', 'Send invoice']
    },
    {
      id: '11',
      name: 'GitHub',
      description: 'Manage repositories, track issues, and automate development workflows',
      category: categories[7],
      icon: Code,
      color: 'from-gray-700 to-gray-900',
      status: 'connected',
      isPopular: true,
      isPremium: false,
      version: '2.8.0',
      provider: 'GitHub',
      setupComplexity: 'easy',
      usageCount: 789,
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
      rating: 4.9,
      reviews: 3456,
      features: ['Repository management', 'Issue tracking', 'Pull request automation', 'CI/CD integration'],
      permissions: ['Read repositories', 'Create issues', 'Manage pull requests', 'Access actions'],
      pricing: 'Free',
      documentation: 'https://docs.github.com/rest',
      supportedTriggers: ['Push to repository', 'Issue created', 'Pull request opened', 'Release published'],
      supportedActions: ['Create issue', 'Merge pull request', 'Create branch', 'Add label', 'Assign reviewer']
    },
    {
      id: '12',
      name: 'Jira',
      description: 'Track bugs, manage sprints, and coordinate development projects',
      category: categories[7],
      icon: Bug,
      color: 'from-blue-600 to-blue-800',
      status: 'pending',
      isPopular: false,
      isPremium: true,
      version: '1.6.3',
      provider: 'Atlassian',
      setupComplexity: 'complex',
      usageCount: 0,
      rating: 4.2,
      reviews: 987,
      features: ['Issue tracking', 'Sprint management', 'Workflow automation', 'Reporting'],
      permissions: ['Create issues', 'Manage sprints', 'Update workflows', 'Access reports'],
      pricing: '$7/user/month',
      documentation: 'https://developer.atlassian.com/cloud/jira',
      supportedTriggers: ['Issue created', 'Status changed', 'Sprint started', 'Comment added'],
      supportedActions: ['Create issue', 'Update status', 'Add comment', 'Assign user', 'Create sprint']
    }
  ]

  const workflows: Workflow[] = [
    {
      id: '1',
      name: 'Email to Slack Notification',
      description: 'Send Slack notifications when important emails are received',
      trigger: {
        integration: 'Gmail',
        event: 'New email',
        config: { label: 'Important', from: 'clients' }
      },
      actions: [{
        integration: 'Slack',
        action: 'Send message',
        config: { channel: '#notifications', template: 'New email from {{sender}}' }
      }],
      status: 'active',
      executions: 234,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avgRunTime: '1.2s',
      successRate: 98.7,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      tags: ['email', 'slack', 'notifications']
    },
    {
      id: '2',
      name: 'Calendar Event to CRM',
      description: 'Create CRM tasks when new calendar events are scheduled',
      trigger: {
        integration: 'Google Calendar',
        event: 'Event created',
        config: { calendar: 'work', attendees: 'external' }
      },
      actions: [{
        integration: 'HubSpot',
        action: 'Create task',
        config: { type: 'follow-up', priority: 'high' }
      }],
      status: 'paused',
      executions: 89,
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      avgRunTime: '2.8s',
      successRate: 94.3,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      tags: ['calendar', 'crm', 'tasks']
    },
    {
      id: '3',
      name: 'Payment Success Analytics',
      description: 'Track successful payments in Google Analytics',
      trigger: {
        integration: 'Stripe',
        event: 'Payment succeeded',
        config: { amount: '>100', currency: 'USD' }
      },
      actions: [{
        integration: 'Google Analytics',
        action: 'Track event',
        config: { category: 'E-commerce', action: 'Purchase', value: '{{amount}}' }
      }],
      status: 'active',
      executions: 456,
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      avgRunTime: '0.8s',
      successRate: 99.1,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      tags: ['payment', 'analytics', 'tracking']
    }
  ]

  const webhooks: WebhookEndpoint[] = [
    {
      id: '1',
      name: 'Order Processing',
      url: 'https://api.conversai.com/webhooks/orders',
      method: 'POST',
      status: 'active',
      events: ['order.created', 'order.updated', 'order.cancelled'],
      lastTriggered: new Date(Date.now() - 15 * 60 * 1000),
      requestCount: 2847,
      errorRate: 0.8,
      avgResponseTime: '245ms',
      authentication: 'bearer',
      headers: { 'Content-Type': 'application/json' },
      retryPolicy: { enabled: true, maxRetries: 3, backoffDelay: 1000 }
    },
    {
      id: '2',
      name: 'User Registration',
      url: 'https://api.conversai.com/webhooks/users',
      method: 'POST',
      status: 'active',
      events: ['user.created', 'user.updated', 'user.deleted'],
      lastTriggered: new Date(Date.now() - 45 * 60 * 1000),
      requestCount: 1234,
      errorRate: 1.2,
      avgResponseTime: '189ms',
      authentication: 'api_key',
      headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' },
      retryPolicy: { enabled: true, maxRetries: 5, backoffDelay: 2000 }
    },
    {
      id: '3',
      name: 'Payment Notifications',
      url: 'https://api.conversai.com/webhooks/payments',
      method: 'POST',
      status: 'error',
      events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      requestCount: 567,
      errorRate: 5.4,
      avgResponseTime: '1.2s',
      authentication: 'basic',
      headers: { 'Content-Type': 'application/json' },
      retryPolicy: { enabled: false, maxRetries: 0, backoffDelay: 0 }
    }
  ]

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || integration.category.id === selectedCategory
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle
      case 'pending': return Clock
      case 'error': return XCircle
      case 'disabled': return XCircle
      default: return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'disabled': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'complex': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const connectIntegration = async (integration: Integration) => {
    setIsConnecting(true)
    setSelectedIntegration(integration)
    setShowSetupModal(true)

    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
      setShowSetupModal(false)
      // Update integration status (in real app, this would be managed by state management)
    }, 3000)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return date.toLocaleDateString('ro-RO')
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
              <p className="text-sm text-gray-500">
                {integrations.filter(i => i.status === 'connected').length} connected • {workflows.length} workflows • {webhooks.length} webhooks
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
            </div>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSetupModal(true)}
            >
              <Plus className="h-5 w-5" />
              Add Integration
            </motion.button>
          </div>
        </div>

        {/* Integration Stats */}
        <div className="mt-4 grid grid-cols-6 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connected</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{integrations.filter(i => i.status === 'connected').length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available</span>
              <Plus className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{integrations.filter(i => i.status === 'available').length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Workflows</span>
              <Workflow className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{workflows.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Webhooks</span>
              <Globe className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{webhooks.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Usage</span>
              <Activity className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(integrations.reduce((sum, i) => sum + i.usageCount, 0))}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <Target className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">97.8%</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-180px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <div className="space-y-2">
            {[
              { id: 'integrations', label: 'All Integrations', icon: Grid },
              { id: 'workflows', label: 'Workflows', icon: Workflow },
              { id: 'webhooks', label: 'Webhooks', icon: Globe },
              { id: 'api-keys', label: 'API Keys', icon: Key }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${selectedTab === tab.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {selectedTab === 'integrations' && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all ${selectedCategory === null ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span>All Categories</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {integrations.length}
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all ${selectedCategory === category.id ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search integrations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="connected">Connected</option>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {filteredIntegrations.map((integration) => {
                    const StatusIcon = getStatusIcon(integration.status)
                    return (
                      <motion.div
                        key={integration.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                        whileHover={{ y: -2 }}
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${integration.color} text-white`}>
                            <integration.icon className="h-6 w-6" />
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.isPopular && (
                              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                                <Star className="h-3 w-3" />
                                Popular
                              </div>
                            )}
                            {integration.isPremium && (
                              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                Premium
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                          <p className="text-xs text-gray-500">by {integration.provider}</p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(integration.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {integration.status}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {integration.rating}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Usage</span>
                            <span className="font-medium text-gray-900">{formatNumber(integration.usageCount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Setup</span>
                            <span className={`px-2 py-1 rounded text-xs ${getComplexityColor(integration.setupComplexity)}`}>
                              {integration.setupComplexity}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pricing</span>
                            <span className="font-medium text-gray-900">{integration.pricing}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {integration.status === 'connected' ? (
                            <>
                              <button className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                                Configure
                              </button>
                              <button className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                <Settings className="h-4 w-4" />
                              </button>
                            </>
                          ) : integration.status === 'available' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                connectIntegration(integration)
                              }}
                              className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                            >
                              Connect
                            </button>
                          ) : integration.status === 'pending' ? (
                            <button className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium cursor-not-allowed">
                              Connecting...
                            </button>
                          ) : (
                            <button className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                              Retry
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {selectedTab === 'workflows' && (
              <motion.div
                key="workflows"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Automation Workflows</h2>
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-5 w-5" />
                    Create Workflow
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {workflows.map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6"
                      whileHover={{ y: -1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                          <p className="text-sm text-gray-600">{workflow.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${workflow.status === 'active' ? 'bg-green-100 text-green-700' :
                              workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                                workflow.status === 'error' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                            }`}>
                            {workflow.status}
                          </span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                          <Lightning className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">{workflow.trigger.integration}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                          <Zap className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">{workflow.actions[0].integration}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Executions</span>
                          <p className="font-medium text-gray-900">{workflow.executions}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Success Rate</span>
                          <p className="font-medium text-gray-900">{workflow.successRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Runtime</span>
                          <p className="font-medium text-gray-900">{workflow.avgRunTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Run</span>
                          <p className="font-medium text-gray-900">
                            {workflow.lastRun ? formatTime(workflow.lastRun) : 'Never'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'webhooks' && (
              <motion.div
                key="webhooks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Webhook Endpoints</h2>
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-5 w-5" />
                    Add Webhook
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {webhooks.map((webhook) => {
                    const StatusIcon = getStatusIcon(webhook.status)
                    return (
                      <motion.div
                        key={webhook.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6"
                        whileHover={{ y: -1 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{webhook.name}</h3>
                            <p className="text-sm text-gray-600 font-mono">{webhook.url}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(webhook.status)}`}>
                              <StatusIcon className="h-3 w-3" />
                              {webhook.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                              {webhook.method}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Events</h4>
                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => (
                              <span key={event} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Requests</span>
                            <p className="font-medium text-gray-900">{formatNumber(webhook.requestCount)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Error Rate</span>
                            <p className="font-medium text-gray-900">{webhook.errorRate}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Response Time</span>
                            <p className="font-medium text-gray-900">{webhook.avgResponseTime}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Triggered</span>
                            <p className="font-medium text-gray-900">
                              {webhook.lastTriggered ? formatTime(webhook.lastTriggered) : 'Never'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Authentication</span>
                            <p className="font-medium text-gray-900">{webhook.authentication}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {selectedTab === 'api-keys' && (
              <motion.div
                key="api-keys"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">API Keys Management</h2>
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-5 w-5" />
                    Generate API Key
                  </motion.button>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                  <div className="text-center py-12">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">API Keys Management</h3>
                    <p className="text-gray-500 mb-4">
                      Manage your API keys for secure integration access
                    </p>
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Create Your First API Key
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSetupModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isConnecting ? (
                    <RefreshCw className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Zap className="h-8 w-8 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isConnecting ? 'Connecting...' : 'Setup Integration'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isConnecting
                    ? `Connecting to ${selectedIntegration?.name}...`
                    : `Configure your ${selectedIntegration?.name} integration`
                  }
                </p>
                {!isConnecting && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSetupModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => selectedIntegration && connectIntegration(selectedIntegration)}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>ConversAI Integrations • Workflow Automation • Third-party Connections</span>
            <span>Secure API Management • Real-time Monitoring • Enterprise Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Zap className="h-4 w-4" />
                Automated
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <Globe className="h-4 w-4" />
                Connected
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Shield className="h-4 w-4" />
                Secure
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
