'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Send,
  Inbox,
  Star,
  Archive,
  Trash2,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Paperclip,
  Users,
  Calendar,
  Settings,
  Bell,
  Eye,
  Reply,
  Forward,
  ChevronDown,
  Clock,
  AlertTriangle,
  Bot,
  BarChart3
} from 'lucide-react'
import EmailComposer from '../components/EmailComposer'
import ContactManager from '../components/ContactManager'
import EmailAnalyticsDashboard from '../components/EmailAnalyticsDashboard'

interface Email {
  id: string
  from: string
  to: string
  subject: string
  preview: string
  content: string
  timestamp: Date
  read: boolean
  starred: boolean
  important: boolean
  attachments: number
  labels: string[]
  aiSuggestions?: string[]
}

interface EmailFolder {
  id: string
  name: string
  icon: any
  count: number
  color: string
}

export default function ConversAIPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [showContacts, setShowContacts] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'Alex Johnson <alex@techcorp.com>',
      to: 'you@company.com',
      subject: 'Quarterly Report Review - Q4 2024',
      preview: 'Hi there, I\'ve attached the quarterly report for your review. Please let me know if you have any questions...',
      content: `Hi there,

I hope this email finds you well. I've attached the quarterly report for Q4 2024 for your review. 

Key highlights include:
• 23% revenue growth compared to Q3
• Successful launch of 3 new product features
• Customer satisfaction rating increased to 4.8/5
• Team expansion by 15 new hires

Please review the attached document and let me know if you have any questions or need clarification on any of the metrics.

Looking forward to discussing this in our upcoming meeting.

Best regards,
Alex Johnson
Senior Business Analyst
TechCorp Solutions`,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      starred: true,
      important: true,
      attachments: 2,
      labels: ['Business', 'Reports'],
      aiSuggestions: [
        'Schedule a follow-up meeting',
        'Request detailed metrics breakdown',
        'Acknowledge receipt and praise performance'
      ]
    },
    {
      id: '2',
      from: 'Sarah Martinez <sarah.martinez@designstudio.com>',
      to: 'you@company.com',
      subject: 'Project Timeline Update',
      preview: 'Quick update on the design project timeline. We\'re slightly ahead of schedule and should be able to deliver early...',
      content: `Hi,

Quick update on the design project timeline.

Good news - we're slightly ahead of schedule and should be able to deliver the final designs by Friday instead of Monday as originally planned.

The team has been working efficiently on:
✓ User interface mockups (completed)
✓ Brand guidelines (completed)  
✓ Asset creation (90% complete)
✓ Final reviews (in progress)

Would you like to schedule a presentation for early next week to review everything together?

Thanks,
Sarah Martinez
Creative Director`,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      starred: false,
      important: false,
      attachments: 0,
      labels: ['Projects', 'Design'],
      aiSuggestions: [
        'Confirm early delivery acceptance',
        'Schedule design review meeting',
        'Ask about final deliverables format'
      ]
    },
    {
      id: '3',
      from: 'Microsoft Teams <noreply@microsoft.com>',
      to: 'you@company.com',
      subject: 'Meeting Reminder: Weekly Sync - Starting in 30 minutes',
      preview: 'Your meeting "Weekly Sync" with the development team is starting in 30 minutes...',
      content: `Meeting Reminder

Your meeting "Weekly Sync" is starting in 30 minutes.

Meeting Details:
• Time: Today at 2:00 PM - 3:00 PM
• Participants: Development Team (8 people)
• Meeting Link: Join Microsoft Teams Meeting
• Agenda: Sprint review, blockers discussion, next week planning

Preparation items:
- Review completed tasks
- Prepare blocker updates
- Check sprint metrics dashboard

Join the meeting: [Teams Link]

This is an automated reminder from Microsoft Teams.`,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      starred: false,
      important: true,
      attachments: 0,
      labels: ['Meetings', 'Teams'],
      aiSuggestions: [
        'Join meeting now',
        'Review agenda items',
        'Prepare status update'
      ]
    },
    {
      id: '4',
      from: 'LinkedIn <messages-noreply@linkedin.com>',
      to: 'you@company.com',
      subject: 'New connection request from Maria Rodriguez',
      preview: 'Maria Rodriguez would like to connect with you on LinkedIn...',
      content: `Hi,

Maria Rodriguez, Senior Product Manager at Innovation Labs, would like to connect with you on LinkedIn.

Maria's message: "Hi! I came across your profile and was impressed by your work in AI and product development. I'd love to connect and potentially discuss some collaboration opportunities in the AI space."

View Maria's profile and respond to this connection request on LinkedIn.

Connect with Maria: [LinkedIn Link]

Best regards,
The LinkedIn Team`,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      starred: false,
      important: false,
      attachments: 0,
      labels: ['Social', 'LinkedIn'],
      aiSuggestions: [
        'Accept connection request',
        'View Maria\'s profile',
        'Respond with collaboration interest'
      ]
    }
  ])

  const folders: EmailFolder[] = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 3, color: 'text-blue-600' },
    { id: 'starred', name: 'Starred', icon: Star, count: 1, color: 'text-yellow-500' },
    { id: 'sent', name: 'Sent', icon: Send, count: 12, color: 'text-green-600' },
    { id: 'drafts', name: 'Drafts', icon: Mail, count: 2, color: 'text-gray-500' },
    { id: 'archive', name: 'Archive', icon: Archive, count: 45, color: 'text-purple-600' },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 5, color: 'text-red-500' }
  ]

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase())

    switch (selectedFolder) {
      case 'starred': return email.starred && matchesSearch
      case 'important': return email.important && matchesSearch
      default: return matchesSearch
    }
  })

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleEmailAction = (action: string, emailId: string) => {
    setEmails(prevEmails =>
      prevEmails.map(email => {
        if (email.id === emailId) {
          switch (action) {
            case 'read':
              return { ...email, read: true }
            case 'star':
              return { ...email, starred: !email.starred }
            case 'archive':
              return { ...email, archived: true }
            default:
              return email
          }
        }
        return email
      })
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ConversAI</h1>
              <p className="text-sm text-gray-500">Professional Email Platform</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {currentTime?.toLocaleTimeString() || '--:--:--'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnalytics(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Analytics"
              >
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={() => setShowContacts(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Contacts"
              >
                <Users className="h-5 w-5 text-gray-400" />
              </button>
              <Bell className="h-5 w-5 text-gray-400" />
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <motion.button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg px-4 py-3 mb-6 flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition-all"
            onClick={() => setShowComposer(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-5 w-5" />
            Compose
          </motion.button>

          <nav className="space-y-2">
            {folders.map((folder) => (
              <motion.button
                key={folder.id}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${selectedFolder === folder.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
                onClick={() => setSelectedFolder(folder.id)}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-center gap-3">
                  <folder.icon className={`h-5 w-5 ${folder.color}`} />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {folder.count}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Labels</h3>
            <div className="space-y-2">
              {['Business', 'Personal', 'Projects', 'Teams', 'Social'].map((label) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="w-96 bg-white/40 backdrop-blur-sm border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <h2 className="font-semibold text-gray-900 capitalize">{selectedFolder}</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredEmails.map((email) => (
              <motion.div
                key={email.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white/60 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                  } ${!email.read ? 'bg-blue-50/50' : ''}`}
                onClick={() => {
                  setSelectedEmail(email)
                  handleEmailAction('read', email.id)
                }}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!email.read && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                      <p className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {email.from.split('<')[0].trim()}
                      </p>
                      {email.important && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </div>
                    <p className={`text-sm truncate mb-1 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{email.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="text-xs text-gray-400">{formatTime(email.timestamp)}</span>
                    <div className="flex items-center gap-1">
                      {email.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      {email.attachments > 0 && <Paperclip className="h-3 w-3 text-gray-400" />}
                      {email.aiSuggestions && <Bot className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                </div>
                {email.labels.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {email.labels.map((label) => (
                      <span key={label} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 bg-white/30 backdrop-blur-sm">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="p-6 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">{selectedEmail.subject}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>From: {selectedEmail.from}</span>
                      <span>To: {selectedEmail.to}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(selectedEmail.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEmailAction('star', selectedEmail.id)}
                      className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${selectedEmail.starred ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                    >
                      <Star className={`h-5 w-5 ${selectedEmail.starred ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Reply className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Forward className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Archive className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                    {selectedEmail.content}
                  </pre>
                </div>

                {/* AI Suggestions */}
                {selectedEmail.aiSuggestions && (
                  <motion.div
                    className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-blue-900">AI Suggestions</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedEmail.aiSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Reply Section */}
              <div className="p-6 border-t border-gray-200 bg-white/60 backdrop-blur-sm">
                <div className="flex gap-3">
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Forward className="h-4 w-4" />
                    Forward
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer Modal */}
      <EmailComposer
        isOpen={showComposer}
        onClose={() => setShowComposer(false)}
        replyTo={selectedEmail ? {
          subject: selectedEmail.subject,
          to: selectedEmail.to,
          from: selectedEmail.from
        } : undefined}
      />

      {/* Contact Manager */}
      <ContactManager
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
        onSelectContact={(contact) => {
          setShowContacts(false)
          setShowComposer(true)
        }}
      />

      {/* Analytics Dashboard */}
      <EmailAnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  )
}
