'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Plus,
  Paperclip,
  Image,
  Mic,
  Calendar,
  Users,
  Smile,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  X,
  ChevronDown,
  Settings,
  Clock,
  Star,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Template,
  Bot,
  Sparkles,
  Zap,
  Target,
  Hash,
  AtSign,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  Upload,
  Download,
  MoreVertical,
  Phone,
  Video,
  Search,
  Filter,
  SortDesc,
  Layout,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
  Flag,
  Tag,
  Bookmark,
  Share,
  Edit3,
  Type,
  MessageCircle
} from 'lucide-react'

interface EmailDraft {
  id: string
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  content: string
  attachments: Attachment[]
  priority: 'low' | 'normal' | 'high'
  scheduled?: Date
  template?: string
  tags: string[]
  signature: boolean
  readReceipt: boolean
  encrypted: boolean
  lastSaved: Date
  status: 'draft' | 'scheduled' | 'sent'
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
  uploadProgress?: number
}

interface Contact {
  id: string
  name: string
  email: string
  avatar?: string
  group: string
  frequency: number
  lastContact: Date
  tags: string[]
}

interface Template {
  id: string
  name: string
  subject: string
  content: string
  category: string
  usage: number
  lastUsed: Date
  tags: string[]
}

interface AIEmailSuggestion {
  type: 'tone' | 'content' | 'subject' | 'closing' | 'grammar'
  suggestion: string
  original: string
  confidence: number
  reason: string
  accepted?: boolean
}

interface ComposeMetrics {
  draftsCount: number
  scheduledCount: number
  templatesUsed: number
  aiSuggestionsToday: number
  avgComposeTime: string
  emailsSentToday: number
}

export default function ComposePage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [activeComposer, setActiveComposer] = useState<EmailDraft | null>(null)
  const [composerMode, setComposerMode] = useState<'compose' | 'reply' | 'forward'>('compose')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showContacts, setShowContacts] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'compose' | 'drafts' | 'scheduled' | 'templates'>('compose')
  const [isMaximized, setIsMaximized] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const [drafts, setDrafts] = useState<EmailDraft[]>([
    {
      id: '1',
      to: ['sarah.martinez@designstudio.com'],
      cc: [],
      bcc: [],
      subject: 'Project Timeline Discussion',
      content: 'Hi Sarah,\n\nI wanted to follow up on our earlier conversation about the project timeline...',
      attachments: [],
      priority: 'normal',
      template: 'professional-followup',
      tags: ['work', 'project'],
      signature: true,
      readReceipt: false,
      encrypted: false,
      lastSaved: new Date(Date.now() - 30 * 60 * 1000),
      status: 'draft'
    },
    {
      id: '2',
      to: ['team@company.com'],
      cc: ['manager@company.com'],
      bcc: [],
      subject: 'Weekly Team Update - Q4 Progress',
      content: 'Team,\n\nHere\'s our weekly progress update:\n\n• Completed features: 8/10\n• Bug fixes: 12 resolved\n• Upcoming milestones...',
      attachments: [
        { id: 'a1', name: 'weekly-report.pdf', type: 'application/pdf', size: 2048000 }
      ],
      priority: 'high',
      tags: ['team', 'update'],
      signature: true,
      readReceipt: true,
      encrypted: false,
      lastSaved: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'draft'
    },
    {
      id: '3',
      to: ['client@example.com'],
      cc: [],
      bcc: [],
      subject: 'Proposal Review - Next Steps',
      content: 'Dear Client,\n\nThank you for reviewing our proposal. I wanted to schedule a meeting to discuss...',
      attachments: [],
      priority: 'high',
      scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: ['client', 'proposal'],
      signature: true,
      readReceipt: true,
      encrypted: true,
      lastSaved: new Date(Date.now() - 60 * 60 * 1000),
      status: 'scheduled'
    }
  ])

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Martinez',
      email: 'sarah.martinez@designstudio.com',
      group: 'Work',
      frequency: 15,
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['design', 'project']
    },
    {
      id: '2',
      name: 'Alex Johnson',
      email: 'alex@techcorp.com',
      group: 'Business',
      frequency: 8,
      lastContact: new Date(Date.now() - 3 * 60 * 60 * 1000),
      tags: ['analytics', 'business']
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      email: 'maria@innovation.com',
      group: 'Network',
      frequency: 3,
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['innovation', 'collaboration']
    },
    {
      id: '4',
      name: 'Development Team',
      email: 'team@company.com',
      group: 'Team',
      frequency: 25,
      lastContact: new Date(Date.now() - 60 * 60 * 1000),
      tags: ['development', 'internal']
    },
    {
      id: '5',
      name: 'Client Support',
      email: 'support@client.com',
      group: 'Support',
      frequency: 5,
      lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['support', 'external']
    }
  ])

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Professional Follow-up',
      subject: 'Following up on our conversation',
      content: 'Hi {name},\n\nI wanted to follow up on our earlier conversation about {topic}. \n\nPlease let me know if you have any questions or if there\'s anything else I can help with.\n\nBest regards,\n{sender}',
      category: 'Business',
      usage: 23,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['followup', 'professional']
    },
    {
      id: '2',
      name: 'Meeting Request',
      subject: 'Meeting Request - {topic}',
      content: 'Hi {name},\n\nI hope this email finds you well. I would like to schedule a meeting to discuss {topic}.\n\nPlease let me know your availability for the coming week.\n\nLooking forward to hearing from you.\n\nBest regards,\n{sender}',
      category: 'Meetings',
      usage: 18,
      lastUsed: new Date(Date.now() - 60 * 60 * 1000),
      tags: ['meeting', 'schedule']
    },
    {
      id: '3',
      name: 'Project Update',
      subject: 'Project Update - {project_name}',
      content: 'Hi Team,\n\nHere\'s the latest update on {project_name}:\n\n• Current status: {status}\n• Completed this week: {completed}\n• Next steps: {next_steps}\n• Blockers: {blockers}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{sender}',
      category: 'Updates',
      usage: 31,
      lastUsed: new Date(Date.now() - 30 * 60 * 1000),
      tags: ['project', 'update', 'team']
    },
    {
      id: '4',
      name: 'Thank You Note',
      subject: 'Thank you - {reason}',
      content: 'Dear {name},\n\nThank you for {reason}. Your {contribution} was greatly appreciated.\n\nI look forward to {future_collaboration}.\n\nWarm regards,\n{sender}',
      category: 'Personal',
      usage: 12,
      lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ['thanks', 'appreciation']
    },
    {
      id: '5',
      name: 'Client Proposal',
      subject: 'Proposal for {service} - {client_name}',
      content: 'Dear {client_name},\n\nThank you for your interest in our {service}. Please find attached our detailed proposal.\n\nKey highlights:\n• {highlight_1}\n• {highlight_2}\n• {highlight_3}\n\nI would be happy to discuss this further at your convenience.\n\nBest regards,\n{sender}',
      category: 'Sales',
      usage: 7,
      lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['proposal', 'client', 'sales']
    }
  ])

  const [aiSuggestions, setAISuggestions] = useState<AIEmailSuggestion[]>([
    {
      type: 'subject',
      suggestion: 'Project Timeline Discussion - Next Steps Required',
      original: 'Project Timeline Discussion',
      confidence: 87,
      reason: 'Adding urgency and action orientation improves open rates by 23%'
    },
    {
      type: 'tone',
      suggestion: 'I hope this message finds you well. I wanted to follow up...',
      original: 'I wanted to follow up...',
      confidence: 92,
      reason: 'More professional and warm opening increases response rates'
    },
    {
      type: 'content',
      suggestion: 'Please let me know if you have any questions or if we should schedule a call to discuss further.',
      original: 'Let me know if you have questions.',
      confidence: 89,
      reason: 'Offering specific next steps increases engagement'
    },
    {
      type: 'closing',
      suggestion: 'Looking forward to your thoughts and next steps.',
      original: 'Best regards',
      confidence: 85,
      reason: 'Action-oriented closing encourages response'
    }
  ])

  const metrics: ComposeMetrics = {
    draftsCount: drafts.filter(d => d.status === 'draft').length,
    scheduledCount: drafts.filter(d => d.status === 'scheduled').length,
    templatesUsed: 12,
    aiSuggestionsToday: 24,
    avgComposeTime: '4m 32s',
    emailsSentToday: 8
  }

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200'
      case 'normal': return 'text-blue-500 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText
      case 'scheduled': return Clock
      case 'sent': return Send
      default: return FileText
    }
  }

  const createNewDraft = () => {
    const newDraft: EmailDraft = {
      id: Date.now().toString(),
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      content: '',
      attachments: [],
      priority: 'normal',
      tags: [],
      signature: true,
      readReceipt: false,
      encrypted: false,
      lastSaved: new Date(),
      status: 'draft'
    }
    setActiveComposer(newDraft)
    setComposerMode('compose')
    setSelectedTab('compose')
  }

  const saveDraft = (draft: EmailDraft) => {
    const updatedDraft = { ...draft, lastSaved: new Date() }
    setDrafts(prev => {
      const index = prev.findIndex(d => d.id === draft.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = updatedDraft
        return updated
      } else {
        return [...prev, updatedDraft]
      }
    })
    setActiveComposer(updatedDraft)
  }

  const applyTemplate = (template: Template) => {
    if (activeComposer) {
      const updatedDraft = {
        ...activeComposer,
        subject: template.subject,
        content: template.content,
        template: template.id
      }
      setActiveComposer(updatedDraft)
      setShowTemplates(false)
    }
  }

  const addContact = (contact: Contact) => {
    if (activeComposer) {
      const updatedDraft = {
        ...activeComposer,
        to: [...activeComposer.to.filter(email => email !== contact.email), contact.email]
      }
      setActiveComposer(updatedDraft)
      setShowContacts(false)
    }
  }

  const applySuggestion = (suggestion: AIEmailSuggestion) => {
    if (activeComposer) {
      let updatedDraft = { ...activeComposer }

      switch (suggestion.type) {
        case 'subject':
          updatedDraft.subject = suggestion.suggestion
          break
        case 'content':
        case 'tone':
        case 'closing':
          updatedDraft.content = updatedDraft.content.replace(suggestion.original, suggestion.suggestion)
          break
      }

      setActiveComposer(updatedDraft)
      setAISuggestions(prev => prev.map(s =>
        s === suggestion ? { ...s, accepted: true } : s
      ))
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compose & Messaging</h1>
              <p className="text-sm text-gray-500">
                {metrics.draftsCount} drafts • {metrics.scheduledCount} scheduled • {metrics.emailsSentToday} sent today
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isMaximized ? 'Minimize' : 'Maximize'}
              >
                {isMaximized ? (
                  <Minimize2 className="h-5 w-5 text-gray-400" />
                ) : (
                  <Maximize2 className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${showAdvancedOptions ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                title="Advanced Options"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="mt-4 grid grid-cols-6 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Compose Time</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.avgComposeTime}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Templates Used</span>
              <Template className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.templatesUsed}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Suggestions</span>
              <Bot className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.aiSuggestionsToday}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sent Today</span>
              <Send className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.emailsSentToday}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Drafts</span>
              <FileText className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.draftsCount}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <Calendar className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.scheduledCount}</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-200px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          {/* New Email Button */}
          <motion.button
            onClick={createNewDraft}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg px-4 py-3 mb-6 flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-5 w-5" />
            New Email
          </motion.button>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {[
              { id: 'compose', label: 'Compose', icon: MessageSquare },
              { id: 'drafts', label: 'Drafts', icon: FileText },
              { id: 'scheduled', label: 'Scheduled', icon: Clock },
              { id: 'templates', label: 'Templates', icon: Template }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-all ${selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content based on selected tab */}
          {selectedTab === 'drafts' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Drafts ({metrics.draftsCount})</h3>
              {drafts.filter(d => d.status === 'draft').map((draft) => (
                <motion.div
                  key={draft.id}
                  onClick={() => setActiveComposer(draft)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${activeComposer?.id === draft.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 truncate">{draft.subject || 'No Subject'}</p>
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(draft.priority)}`}>
                      {draft.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">To: {draft.to.join(', ') || 'No recipients'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Saved {formatTime(draft.lastSaved)}</span>
                    <div className="flex items-center gap-1">
                      {draft.attachments.length > 0 && <Paperclip className="h-3 w-3" />}
                      {draft.encrypted && <Shield className="h-3 w-3" />}
                      {draft.template && <Template className="h-3 w-3" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedTab === 'scheduled' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Scheduled ({metrics.scheduledCount})</h3>
              {drafts.filter(d => d.status === 'scheduled').map((draft) => (
                <motion.div
                  key={draft.id}
                  onClick={() => setActiveComposer(draft)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${activeComposer?.id === draft.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 truncate">{draft.subject}</p>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">To: {draft.to.join(', ')}</p>
                  <div className="text-xs text-gray-500">
                    Scheduled: {draft.scheduled?.toLocaleDateString('ro-RO')} at {draft.scheduled?.toLocaleTimeString('ro-RO')}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedTab === 'templates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Templates ({templates.length})</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="p-3 rounded-lg border bg-white/60 border-gray-200 hover:bg-white cursor-pointer transition-all"
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate">{template.subject}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Used {template.usage} times</span>
                    <span>{formatTime(template.lastUsed)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedTab === 'compose' && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowContacts(!showContacts)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Users className="h-4 w-4 text-green-500" />
                    Browse Contacts
                  </button>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Template className="h-4 w-4 text-blue-500" />
                    Email Templates
                  </button>
                  <button
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bot className="h-4 w-4 text-purple-500" />
                    AI Assistant
                  </button>
                </div>
              </div>

              {/* Recent Contacts */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Contacts</h3>
                <div className="space-y-2">
                  {contacts.slice(0, 3).map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => addContact(contact)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                        <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Composer Area */}
        <div className="flex-1 flex flex-col">
          {activeComposer ? (
            <>
              {/* Composer Header */}
              <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {composerMode === 'compose' ? 'New Email' :
                      composerMode === 'reply' ? 'Reply' : 'Forward'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveDraft(activeComposer)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all">
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>

                {/* Email Fields */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-12 text-sm font-medium text-gray-700">To:</label>
                    <input
                      type="text"
                      value={activeComposer.to.join(', ')}
                      onChange={(e) => setActiveComposer({
                        ...activeComposer,
                        to: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Recipients..."
                      className="flex-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowContacts(!showContacts)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Users className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAdvancedOptions && (
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-center gap-3">
                          <label className="w-12 text-sm font-medium text-gray-700">CC:</label>
                          <input
                            type="text"
                            value={activeComposer.cc.join(', ')}
                            onChange={(e) => setActiveComposer({
                              ...activeComposer,
                              cc: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="CC recipients..."
                            className="flex-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="w-12 text-sm font-medium text-gray-700">BCC:</label>
                          <input
                            type="text"
                            value={activeComposer.bcc.join(', ')}
                            onChange={(e) => setActiveComposer({
                              ...activeComposer,
                              bcc: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="BCC recipients..."
                            className="flex-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3">
                    <label className="w-12 text-sm font-medium text-gray-700">Subject:</label>
                    <input
                      type="text"
                      value={activeComposer.subject}
                      onChange={(e) => setActiveComposer({
                        ...activeComposer,
                        subject: e.target.value
                      })}
                      placeholder="Email subject..."
                      className="flex-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={activeComposer.priority}
                      onChange={(e) => setActiveComposer({
                        ...activeComposer,
                        priority: e.target.value as any
                      })}
                      className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 p-2">
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Bold className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Italic className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Underline className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <AlignLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <AlignCenter className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <AlignRight className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Link className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <List className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Smile className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Paperclip className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Image className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Mic className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="flex-1"></div>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Template className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Bot className="h-4 w-4 text-purple-600" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex">
                {/* Main Editor */}
                <div className="flex-1 p-4">
                  <textarea
                    value={activeComposer.content}
                    onChange={(e) => setActiveComposer({
                      ...activeComposer,
                      content: e.target.value
                    })}
                    placeholder="Compose your email..."
                    className="w-full h-full resize-none bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* AI Suggestions Panel */}
                <AnimatePresence>
                  {showAISuggestions && (
                    <motion.div
                      className="w-80 border-l border-gray-200 bg-white/60 backdrop-blur-sm p-4"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          AI Suggestions
                        </h3>
                        <button
                          onClick={() => setShowAISuggestions(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            className={`p-3 rounded-lg border ${suggestion.accepted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:border-purple-300'
                              }`}
                            whileHover={{ scale: suggestion.accepted ? 1 : 1.02 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-purple-600 capitalize">
                                {suggestion.type}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">{suggestion.confidence}%</span>
                                {suggestion.accepted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <button
                                    onClick={() => applySuggestion(suggestion)}
                                    className="p-1 hover:bg-purple-100 rounded"
                                  >
                                    <Plus className="h-3 w-3 text-purple-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">{suggestion.suggestion}</p>
                            <p className="text-xs text-gray-500">{suggestion.reason}</p>
                          </motion.div>
                        ))}
                      </div>

                      <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all">
                        <Zap className="h-4 w-4" />
                        Get More Suggestions
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Attachments & Options */}
              {(activeComposer.attachments.length > 0 || showAdvancedOptions) && (
                <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200 p-4">
                  {activeComposer.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {activeComposer.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                            </div>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAdvancedOptions && (
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeComposer.signature}
                          onChange={(e) => setActiveComposer({
                            ...activeComposer,
                            signature: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-700">Include signature</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeComposer.readReceipt}
                          onChange={(e) => setActiveComposer({
                            ...activeComposer,
                            readReceipt: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-700">Request read receipt</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeComposer.encrypted}
                          onChange={(e) => setActiveComposer({
                            ...activeComposer,
                            encrypted: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-700">Encrypt email</span>
                        <Shield className="h-4 w-4 text-green-500" />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="h-20 w-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <MessageSquare className="h-10 w-10 text-blue-500" />
                </motion.div>
                <p className="text-gray-500 text-lg mb-2">Start composing</p>
                <p className="text-gray-400 text-sm mb-4">Create a new email or select a draft to continue</p>
                <motion.button
                  onClick={createNewDraft}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-5 w-5" />
                  New Email
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
            <span>ConversAI Composer • Advanced Email Creation</span>
            <span>AI-Powered Suggestions • Template Library</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Shield className="h-4 w-4" />
                Secure
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <Bot className="h-4 w-4" />
                AI-Enhanced
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Template className="h-4 w-4" />
                Template-Ready
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
