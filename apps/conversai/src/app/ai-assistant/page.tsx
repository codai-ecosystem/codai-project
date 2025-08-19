'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Sparkles,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Star,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash2,
  Archive,
  Bookmark,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Filter,
  Search,
  Grid,
  List,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Users,
  Mail,
  Calendar,
  FileText,
  Image,
  PieChart,
  BarChart,
  Activity,
  Globe,
  Shield,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  HelpCircle,
  Lightbulb,
  Rocket
} from 'lucide-react'

interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  category: 'email' | 'strategy' | 'analysis' | 'creative' | 'automation'
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  lastActivity: Date
  tokensUsed: number
  quality: number
  tags: string[]
  isBookmarked: boolean
  aiModel: string
  context: string
}

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type: 'text' | 'suggestion' | 'analysis' | 'template' | 'automation'
  confidence?: number
  actions?: AIAction[]
  metadata?: {
    wordCount?: number
    sentiment?: 'positive' | 'neutral' | 'negative'
    complexity?: 'simple' | 'moderate' | 'complex'
    language?: string
  }
}

interface AIAction {
  id: string
  type: 'implement' | 'edit' | 'save' | 'share' | 'schedule'
  label: string
  description: string
  icon: any
  enabled: boolean
}

interface AITemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  parameters: string[]
  usage: number
  rating: number
  createdAt: Date
  isCustom: boolean
  tags: string[]
}

interface AIMetrics {
  conversationsToday: number
  tokensUsedToday: number
  suggestionsAccepted: number
  timesSaved: string
  accuracyScore: number
  responseTime: string
  automationsCreated: number
  templatesUsed: number
}

export default function AIAssistantPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [selectedTab, setSelectedTab] = useState<'chat' | 'templates' | 'automations' | 'analytics'>('chat')
  const [currentMessage, setCurrentMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [filterCategory, setFilterCategory] = useState<'all' | 'email' | 'strategy' | 'analysis' | 'creative' | 'automation'>('all')

  const [conversations, setConversations] = useState<AIConversation[]>([
    {
      id: '1',
      title: 'Email Campaign Strategy',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Help me create an email campaign for our Q4 product launch',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: 'text'
        },
        {
          id: '2',
          role: 'assistant',
          content: 'I\'ll help you create a comprehensive Q4 product launch email campaign. Based on best practices, here\'s a strategic approach:\n\n**Campaign Structure:**\n1. Teaser Email (2 weeks before)\n2. Announcement Email (Launch day)\n3. Feature Highlight Series (3 emails)\n4. Customer Success Stories\n5. Limited Time Offer\n\n**Key Elements:**\n- Compelling subject lines with 35-50 character limit\n- Mobile-optimized templates\n- Clear CTAs with contrasting colors\n- Personalization tokens\n- A/B testing for subject lines\n\nWould you like me to draft specific email content for any of these campaign elements?',
          timestamp: new Date(Date.now() - 59 * 60 * 1000),
          type: 'suggestion',
          confidence: 92,
          actions: [
            { id: '1', type: 'implement', label: 'Create Templates', description: 'Generate email templates', icon: FileText, enabled: true },
            { id: '2', type: 'save', label: 'Save Strategy', description: 'Save this strategy', icon: Save, enabled: true },
            { id: '3', type: 'schedule', label: 'Schedule Campaign', description: 'Set up timeline', icon: Calendar, enabled: true }
          ],
          metadata: {
            wordCount: 126,
            sentiment: 'positive',
            complexity: 'moderate'
          }
        }
      ],
      category: 'strategy',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 5 * 60 * 1000),
      tokensUsed: 234,
      quality: 92,
      tags: ['email', 'campaign', 'product-launch'],
      isBookmarked: true,
      aiModel: 'ConversAI-Pro',
      context: 'Email marketing strategy discussion'
    },
    {
      id: '2',
      title: 'Customer Response Analysis',
      messages: [
        {
          id: '3',
          role: 'user',
          content: 'Analyze the sentiment of these customer responses and suggest improvements',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text'
        },
        {
          id: '4',
          role: 'assistant',
          content: 'Based on my analysis of the customer responses:\n\n**Sentiment Breakdown:**\n- Positive: 67% (↑12% from last month)\n- Neutral: 21%\n- Negative: 12% (↓8% from last month)\n\n**Key Insights:**\n• Customers love the new interface design\n• Pricing concerns mentioned in 18% of responses\n• Response time satisfaction improved significantly\n• Feature requests: Dark mode (mentioned 23 times)\n\n**Recommended Actions:**\n1. Address pricing transparency in FAQ\n2. Prioritize dark mode development\n3. Create response time improvement case study\n\nWould you like me to generate specific response templates for different sentiment categories?',
          timestamp: new Date(Date.now() - 118 * 60 * 1000),
          type: 'analysis',
          confidence: 89,
          metadata: {
            wordCount: 97,
            sentiment: 'neutral',
            complexity: 'complex'
          }
        }
      ],
      category: 'analysis',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 118 * 60 * 1000),
      tokensUsed: 187,
      quality: 89,
      tags: ['analysis', 'sentiment', 'customer-feedback'],
      isBookmarked: false,
      aiModel: 'ConversAI-Analyst',
      context: 'Customer feedback sentiment analysis'
    },
    {
      id: '3',
      title: 'Creative Subject Lines',
      messages: [
        {
          id: '5',
          role: 'user',
          content: 'Generate creative subject lines for our summer sale campaign',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          type: 'text'
        },
        {
          id: '6',
          role: 'assistant',
          content: 'Here are high-converting subject lines for your summer sale:\n\n**Urgency-Based:**\n• "🌞 Summer Sale: 48 Hours Left to Save 40%"\n• "Last Call: Summer Deals Expire Tonight"\n• "⏰ Your Summer Savings End Soon"\n\n**Benefit-Focused:**\n• "Beat the Heat with 40% Off Everything"\n• "Summer Essentials: Now 40% Less"\n• "Cool Deals for Hot Days 🏖️"\n\n**Curiosity-Driven:**\n• "The Summer Deal Everyone\'s Talking About"\n• "Something Big is Happening This Summer"\n• "You Won\'t Believe These Summer Prices"\n\n**Personalized Options:**\n• "{Name}, Your Summer Sale Awaits"\n• "Handpicked Summer Deals for {Name}"\n\nRecommended A/B test: Emoji vs. No Emoji versions. Expected open rate improvement: 15-25%.',
          timestamp: new Date(Date.now() - 178 * 60 * 1000),
          type: 'creative',
          confidence: 94,
          actions: [
            { id: '4', type: 'implement', label: 'Use in Campaign', description: 'Apply to email campaign', icon: Mail, enabled: true },
            { id: '5', type: 'edit', label: 'Customize', description: 'Edit subject lines', icon: Edit, enabled: true }
          ],
          metadata: {
            wordCount: 134,
            sentiment: 'positive',
            complexity: 'simple'
          }
        }
      ],
      category: 'creative',
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 178 * 60 * 1000),
      tokensUsed: 156,
      quality: 94,
      tags: ['creative', 'subject-lines', 'sale'],
      isBookmarked: true,
      aiModel: 'ConversAI-Creative',
      context: 'Creative copywriting for email marketing'
    }
  ])

  const [templates, setTemplates] = useState<AITemplate[]>([
    {
      id: '1',
      name: 'Email Campaign Strategy',
      description: 'Generate comprehensive email marketing strategies',
      category: 'Marketing',
      prompt: 'Create a detailed email campaign strategy for {product} targeting {audience} with {goals}',
      parameters: ['product', 'audience', 'goals'],
      usage: 47,
      rating: 4.8,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isCustom: false,
      tags: ['email', 'strategy', 'marketing']
    },
    {
      id: '2',
      name: 'Customer Response Generator',
      description: 'Create personalized responses to customer inquiries',
      category: 'Customer Service',
      prompt: 'Generate a professional response to this customer inquiry: {inquiry} with tone: {tone}',
      parameters: ['inquiry', 'tone'],
      usage: 73,
      rating: 4.9,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      isCustom: false,
      tags: ['customer-service', 'response', 'support']
    },
    {
      id: '3',
      name: 'Subject Line Optimizer',
      description: 'Create high-converting email subject lines',
      category: 'Copywriting',
      prompt: 'Generate 10 compelling subject lines for {campaign_type} focusing on {key_benefit}',
      parameters: ['campaign_type', 'key_benefit'],
      usage: 89,
      rating: 4.7,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      isCustom: true,
      tags: ['subject-lines', 'copywriting', 'conversion']
    }
  ])

  const metrics: AIMetrics = {
    conversationsToday: 12,
    tokensUsedToday: 2847,
    suggestionsAccepted: 34,
    timesSaved: '4h 23m',
    accuracyScore: 91.7,
    responseTime: '1.2s',
    automationsCreated: 8,
    templatesUsed: 15
  }

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredConversations = conversations.filter(conv =>
    filterCategory === 'all' || conv.category === filterCategory
  )

  const currentConversation = conversations.find(c => c.id === selectedConversation)

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return Mail
      case 'strategy': return Target
      case 'analysis': return BarChart
      case 'creative': return Lightbulb
      case 'automation': return Zap
      default: return MessageSquare
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-100 text-blue-700'
      case 'strategy': return 'bg-purple-100 text-purple-700'
      case 'analysis': return 'bg-green-100 text-green-700'
      case 'creative': return 'bg-orange-100 text-orange-700'
      case 'automation': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const startNewConversation = () => {
    const newConversation: AIConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      category: 'email',
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      tokensUsed: 0,
      quality: 0,
      tags: [],
      isBookmarked: false,
      aiModel: 'ConversAI-Pro',
      context: 'New conversation'
    }
    setConversations(prev => [newConversation, ...prev])
    setSelectedConversation(newConversation.id)
  }

  const sendMessage = () => {
    if (!currentMessage.trim() || !selectedConversation) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation
        ? {
          ...conv,
          messages: [...conv.messages, userMessage],
          lastActivity: new Date()
        }
        : conv
    ))

    setCurrentMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your request. Let me help you with that. Based on the context, here are my recommendations...',
        timestamp: new Date(),
        type: 'suggestion',
        confidence: 87,
        actions: [
          { id: 'temp1', type: 'implement', label: 'Apply Solution', description: 'Implement this solution', icon: CheckCircle, enabled: true },
          { id: 'temp2', type: 'save', label: 'Save Response', description: 'Save for later use', icon: Save, enabled: true }
        ],
        metadata: {
          wordCount: 23,
          sentiment: 'positive',
          complexity: 'simple'
        }
      }

      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation
          ? {
            ...conv,
            messages: [...conv.messages, aiResponse],
            lastActivity: new Date(),
            tokensUsed: conv.tokensUsed + 45
          }
          : conv
      ))
    }, 1500)
  }

  const toggleBookmark = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, isBookmarked: !conv.isBookmarked }
        : conv
    ))
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
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-500">
                {metrics.conversationsToday} conversations • {metrics.suggestionsAccepted} suggestions accepted • {metrics.timesSaved} saved
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsSpeaking(!isSpeaking)}
                className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                title="Voice Output"
              >
                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                title="AI Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Metrics Bar */}
        <div className="mt-4 grid grid-cols-8 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accuracy</span>
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.accuracyScore}%</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.responseTime}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tokens Used</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.tokensUsedToday.toLocaleString()}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time Saved</span>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.timesSaved}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Suggestions</span>
              <Lightbulb className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.suggestionsAccepted}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Automations</span>
              <Rocket className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.automationsCreated}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Templates</span>
              <FileText className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.templatesUsed}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversations</span>
              <MessageSquare className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.conversationsToday}</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-200px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          {/* New Conversation Button */}
          <motion.button
            onClick={startNewConversation}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg px-4 py-3 mb-4 flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-5 w-5" />
            New AI Conversation
          </motion.button>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'templates', label: 'Templates', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-all ${selectedTab === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content based on selected tab */}
          {selectedTab === 'chat' && (
            <div className="space-y-3">
              {/* Category Filter */}
              <div className="mb-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="email">Email</option>
                  <option value="strategy">Strategy</option>
                  <option value="analysis">Analysis</option>
                  <option value="creative">Creative</option>
                  <option value="automation">Automation</option>
                </select>
              </div>

              <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Conversations</h3>
              {filteredConversations.map((conversation) => {
                const CategoryIcon = getCategoryIcon(conversation.category)
                return (
                  <motion.div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedConversation === conversation.id
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-white/60 border-gray-200 hover:bg-white'
                      }`}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-gray-500" />
                        <p className="font-medium text-gray-900 truncate">{conversation.title}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(conversation.id)
                        }}
                        className={`p-1 rounded transition-colors ${conversation.isBookmarked
                            ? 'text-yellow-500'
                            : 'text-gray-400 hover:text-yellow-500'
                          }`}
                      >
                        <Bookmark className={`h-3 w-3 ${conversation.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(conversation.category)}`}>
                        {conversation.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${conversation.status === 'active' ? 'bg-green-100 text-green-700' :
                          conversation.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {conversation.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{conversation.messages.length} messages</span>
                      <span>{formatTime(conversation.lastActivity)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>Quality: {conversation.quality}%</span>
                      <span>{conversation.tokensUsed} tokens</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {selectedTab === 'templates' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 mb-3">AI Templates</h3>
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  className="p-3 rounded-lg border bg-white/60 border-gray-200 hover:bg-white cursor-pointer transition-all"
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500">{template.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.category}</span>
                    <span>Used {template.usage} times</span>
                  </div>
                  {template.isCustom && (
                    <div className="mt-2">
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Custom</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentConversation.title}</h2>
                    <p className="text-sm text-gray-500">
                      {currentConversation.aiModel} • {currentConversation.messages.length} messages • {currentConversation.tokensUsed} tokens
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(currentConversation.category)}`}>
                      {currentConversation.category}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`p-4 rounded-lg ${message.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/80 border border-gray-200'
                        }`}>
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-purple-600">AI Assistant</span>
                            {message.confidence && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                                {message.confidence}% confident
                              </span>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.metadata && (
                          <div className="mt-2 text-xs opacity-75">
                            Words: {message.metadata.wordCount} •
                            Sentiment: {message.metadata.sentiment} •
                            Complexity: {message.metadata.complexity}
                          </div>
                        )}
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action) => (
                              <button
                                key={action.id}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                                disabled={!action.enabled}
                              >
                                <action.icon className="h-3 w-3" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 text-center">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200 p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask your AI assistant anything..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsListening(!isListening)}
                      className={`p-3 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                        }`}
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                    <motion.button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim()}
                      className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="h-20 w-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Bot className="h-10 w-10 text-purple-500" />
                </motion.div>
                <p className="text-gray-500 text-lg mb-2">Your AI Assistant awaits</p>
                <p className="text-gray-400 text-sm mb-4">Start a new conversation or select an existing one</p>
                <motion.button
                  onClick={startNewConversation}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="h-5 w-5" />
                  Start Conversation
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>ConversAI Assistant • AI-Powered Communication</span>
            <span>Smart Suggestions • Voice Integration • Advanced Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Brain className="h-4 w-4" />
                Intelligent
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <Zap className="h-4 w-4" />
                Fast Response
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
