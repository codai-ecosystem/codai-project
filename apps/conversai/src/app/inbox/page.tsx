'use client'

import React, { useState, useEffect } from 'react'
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
    BarChart3,
    MessageSquare,
    FileText,
    Zap,
    Shield,
    Globe,
    UserCircle,
    ChevronRight,
    RefreshCw,
    SortDesc,
    Layout,
    CheckCircle,
    Circle,
    MessageCircle,
    Download,
    ExternalLink
} from 'lucide-react'

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
    category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums'
    priority: 'high' | 'medium' | 'low'
    aiSuggestions?: string[]
    thread?: boolean
    threadCount?: number
}

interface EmailFolder {
    id: string
    name: string
    icon: any
    count: number
    color: string
}

interface EmailMetrics {
    totalEmails: number
    unreadCount: number
    todayReceived: number
    responseRate: number
    avgResponseTime: string
    aiSuggestionsUsed: number
}

interface EmailFilter {
    read: boolean | null
    starred: boolean | null
    important: boolean | null
    category: string | null
    priority: string | null
    hasAttachments: boolean | null
    dateRange: string | null
}

export default function InboxPage() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [selectedFolder, setSelectedFolder] = useState<string>('inbox')
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState<'date' | 'sender' | 'subject' | 'priority'>('date')
    const [viewMode, setViewMode] = useState<'list' | 'cards' | 'compact'>('list')
    const [selectedEmails, setSelectedEmails] = useState<string[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)

    const [emailFilter, setEmailFilter] = useState<EmailFilter>({
        read: null,
        starred: null,
        important: null,
        category: null,
        priority: null,
        hasAttachments: null,
        dateRange: null
    })

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
            category: 'primary',
            priority: 'high',
            thread: false,
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
            category: 'primary',
            priority: 'medium',
            thread: true,
            threadCount: 3,
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
            category: 'updates',
            priority: 'high',
            thread: false,
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
            category: 'social',
            priority: 'low',
            thread: false,
            aiSuggestions: [
                'Accept connection request',
                'View Maria\'s profile',
                'Respond with collaboration interest'
            ]
        },
        {
            id: '5',
            from: 'GitHub <notifications@github.com>',
            to: 'you@company.com',
            subject: 'Pull Request Review: Feature/advanced-analytics',
            preview: 'John Smith has requested your review on a pull request for the advanced analytics feature...',
            content: `Pull Request Review Request

John Smith has requested your review on pull request #247: "Feature/advanced-analytics"

Changes include:
• New analytics dashboard with real-time metrics
• Enhanced data visualization components
• Performance optimizations for large datasets
• Comprehensive test coverage (87%)

Files changed: 23
Lines added: +1,247
Lines removed: -89

Please review when you have a chance. The team is targeting this for the next sprint.

View Pull Request: [GitHub Link]

GitHub Notifications`,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            read: false,
            starred: true,
            important: false,
            attachments: 0,
            labels: ['Development', 'GitHub'],
            category: 'updates',
            priority: 'medium',
            thread: false,
            aiSuggestions: [
                'Review pull request immediately',
                'Schedule dedicated review time',
                'Request additional context'
            ]
        },
        {
            id: '6',
            from: 'Slack <notifications@slack.com>',
            to: 'you@company.com',
            subject: 'Daily Summary: 15 new messages in #development',
            preview: 'You have 15 new messages across 3 channels. Key discussions include API design and deployment planning...',
            content: `Slack Daily Summary

You have 15 new messages across 3 channels:

#development (12 messages):
• API design discussion with the backend team
• Deployment planning for next release
• Bug reports and fixes coordination

#design (2 messages):
• New brand guidelines approval
• UI component library updates

#general (1 message):
• Team lunch announcement for Friday

View in Slack: [Slack Link]

Slack Notifications`,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            read: true,
            starred: false,
            important: false,
            attachments: 0,
            labels: ['Team', 'Slack'],
            category: 'updates',
            priority: 'low',
            thread: false,
            aiSuggestions: [
                'Catch up on development channel',
                'Review design updates',
                'Respond to urgent messages'
            ]
        }
    ])

    const folders: EmailFolder[] = [
        { id: 'inbox', name: 'Inbox', icon: Inbox, count: 4, color: 'text-blue-600' },
        { id: 'starred', name: 'Starred', icon: Star, count: 2, color: 'text-yellow-500' },
        { id: 'sent', name: 'Sent', icon: Send, count: 28, color: 'text-green-600' },
        { id: 'drafts', name: 'Drafts', icon: FileText, count: 3, color: 'text-gray-500' },
        { id: 'archive', name: 'Archive', icon: Archive, count: 156, color: 'text-purple-600' },
        { id: 'trash', name: 'Trash', icon: Trash2, count: 12, color: 'text-red-500' }
    ]

    const metrics: EmailMetrics = {
        totalEmails: emails.length,
        unreadCount: emails.filter(e => !e.read).length,
        todayReceived: emails.filter(e => {
            const today = new Date()
            return e.timestamp.toDateString() === today.toDateString()
        }).length,
        responseRate: 87.3,
        avgResponseTime: '2.4h',
        aiSuggestionsUsed: 24
    }

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

        const matchesFolder = (() => {
            switch (selectedFolder) {
                case 'starred': return email.starred
                case 'sent': return false // Would be sent emails
                case 'drafts': return false // Would be draft emails
                case 'archive': return false // Would be archived emails
                case 'trash': return false // Would be deleted emails
                default: return true
            }
        })()

        const matchesFilters = (
            (emailFilter.read === null || email.read === emailFilter.read) &&
            (emailFilter.starred === null || email.starred === emailFilter.starred) &&
            (emailFilter.important === null || email.important === emailFilter.important) &&
            (emailFilter.category === null || email.category === emailFilter.category) &&
            (emailFilter.priority === null || email.priority === emailFilter.priority) &&
            (emailFilter.hasAttachments === null || (email.attachments > 0) === emailFilter.hasAttachments)
        )

        return matchesSearch && matchesFolder && matchesFilters
    })

    const sortedEmails = [...filteredEmails].sort((a, b) => {
        switch (sortBy) {
            case 'sender':
                return a.from.localeCompare(b.from)
            case 'subject':
                return a.subject.localeCompare(b.subject)
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
            case 'date':
            default:
                return b.timestamp.getTime() - a.timestamp.getTime()
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
            return date.toLocaleDateString('ro-RO')
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50 border-red-200'
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'low': return 'text-green-600 bg-green-50 border-green-200'
            default: return 'text-gray-500 bg-gray-50 border-gray-200'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'primary': return UserCircle
            case 'social': return Users
            case 'promotions': return Zap
            case 'updates': return Bell
            case 'forums': return MessageCircle
            default: return Mail
        }
    }

    const handleEmailAction = (action: string, emailId: string) => {
        setEmails(prevEmails =>
            prevEmails.map(email => {
                if (email.id === emailId) {
                    switch (action) {
                        case 'read':
                            return { ...email, read: true }
                        case 'unread':
                            return { ...email, read: false }
                        case 'star':
                            return { ...email, starred: !email.starred }
                        case 'important':
                            return { ...email, important: !email.important }
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

    const handleBulkAction = (action: string) => {
        setEmails(prevEmails =>
            prevEmails.map(email => {
                if (selectedEmails.includes(email.id)) {
                    switch (action) {
                        case 'read':
                            return { ...email, read: true }
                        case 'unread':
                            return { ...email, read: false }
                        case 'star':
                            return { ...email, starred: true }
                        case 'archive':
                            return { ...email, archived: true }
                        case 'delete':
                            return { ...email, deleted: true }
                        default:
                            return email
                    }
                }
                return email
            })
        )
        setSelectedEmails([])
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Simulate refresh delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsRefreshing(false)
    }

    const toggleEmailSelection = (emailId: string) => {
        setSelectedEmails(prev =>
            prev.includes(emailId)
                ? prev.filter(id => id !== emailId)
                : [...prev, emailId]
        )
    }

    const selectAllEmails = () => {
        setSelectedEmails(
            selectedEmails.length === sortedEmails.length
                ? []
                : sortedEmails.map(email => email.id)
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                            <h1 className="text-2xl font-bold text-gray-900">ConversAI Inbox</h1>
                            <p className="text-sm text-gray-500">
                                {metrics.unreadCount} unread • {metrics.totalEmails} total emails • {metrics.todayReceived} today
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                            {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
                        </div>
                        <div className="flex items-center gap-2">
                            <motion.button
                                onClick={handleRefresh}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Refresh"
                                animate={isRefreshing ? { rotate: 360 } : {}}
                                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
                            >
                                <RefreshCw className="h-5 w-5 text-gray-400" />
                            </motion.button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                                title="Filters"
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Layout className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('compact')}
                                    className={`p-1 rounded ${viewMode === 'compact' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <SortDesc className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="mt-4 grid grid-cols-6 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Response Rate</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{metrics.responseRate}%</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Avg Response</span>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{metrics.avgResponseTime}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">AI Suggestions</span>
                            <Bot className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{metrics.aiSuggestionsUsed}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Today</span>
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{metrics.todayReceived}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Unread</span>
                            <Mail className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{metrics.unreadCount}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total</span>
                            <Archive className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{metrics.totalEmails}</p>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-200px)]">
                {/* Enhanced Sidebar */}
                <div className="w-72 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
                    <motion.button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg px-4 py-3 mb-6 flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus className="h-5 w-5" />
                        Compose Email
                    </motion.button>

                    <nav className="space-y-2 mb-6">
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

                    {/* Quick Actions */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                Compose
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Users className="h-4 w-4 text-green-500" />
                                Contacts
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bot className="h-4 w-4 text-purple-500" />
                                AI Assistant
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <BarChart3 className="h-4 w-4 text-orange-500" />
                                Analytics
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Categories</h3>
                        <div className="space-y-2">
                            {[
                                { name: 'Primary', icon: UserCircle, color: 'bg-blue-400', count: 3 },
                                { name: 'Social', icon: Users, color: 'bg-green-400', count: 1 },
                                { name: 'Updates', icon: Bell, color: 'bg-yellow-400', count: 2 },
                                { name: 'Promotions', icon: Zap, color: 'bg-purple-400', count: 0 },
                                { name: 'Forums', icon: MessageCircle, color: 'bg-orange-400', count: 0 }
                            ].map((category) => (
                                <div key={category.name} className="flex items-center justify-between px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                                        <span>{category.name}</span>
                                    </div>
                                    {category.count > 0 && (
                                        <span className="text-xs text-gray-400">{category.count}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Email List */}
                <div className="w-96 bg-white/40 backdrop-blur-sm border-r border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAllEmails}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    {selectedEmails.length === sortedEmails.length ? (
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                                <h2 className="font-semibold text-gray-900 capitalize">{selectedFolder}</h2>
                                <span className="text-sm text-gray-500">({sortedEmails.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="text-xs bg-white/60 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="date">Date</option>
                                    <option value="sender">Sender</option>
                                    <option value="subject">Subject</option>
                                    <option value="priority">Priority</option>
                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        <AnimatePresence>
                            {selectedEmails.length > 0 && (
                                <motion.div
                                    className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">{selectedEmails.length} selected</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleBulkAction('read')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Mark Read
                                            </button>
                                            <button
                                                onClick={() => handleBulkAction('star')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Star
                                            </button>
                                            <button
                                                onClick={() => handleBulkAction('archive')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Archive
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                className="p-4 border-b border-gray-200 bg-gray-50/60 backdrop-blur-sm"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="block text-gray-600 mb-1">Status</label>
                                        <select
                                            value={emailFilter.read === null ? '' : emailFilter.read.toString()}
                                            onChange={(e) => setEmailFilter(prev => ({
                                                ...prev,
                                                read: e.target.value === '' ? null : e.target.value === 'true'
                                            }))}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                                        >
                                            <option value="">All</option>
                                            <option value="false">Unread</option>
                                            <option value="true">Read</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-1">Priority</label>
                                        <select
                                            value={emailFilter.priority || ''}
                                            onChange={(e) => setEmailFilter(prev => ({
                                                ...prev,
                                                priority: e.target.value || null
                                            }))}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                                        >
                                            <option value="">All</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-1">Category</label>
                                        <select
                                            value={emailFilter.category || ''}
                                            onChange={(e) => setEmailFilter(prev => ({
                                                ...prev,
                                                category: e.target.value || null
                                            }))}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                                        >
                                            <option value="">All</option>
                                            <option value="primary">Primary</option>
                                            <option value="social">Social</option>
                                            <option value="updates">Updates</option>
                                            <option value="promotions">Promotions</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-1">Attachments</label>
                                        <select
                                            value={emailFilter.hasAttachments === null ? '' : emailFilter.hasAttachments.toString()}
                                            onChange={(e) => setEmailFilter(prev => ({
                                                ...prev,
                                                hasAttachments: e.target.value === '' ? null : e.target.value === 'true'
                                            }))}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                                        >
                                            <option value="">All</option>
                                            <option value="true">With Attachments</option>
                                            <option value="false">No Attachments</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEmailFilter({
                                        read: null,
                                        starred: null,
                                        important: null,
                                        category: null,
                                        priority: null,
                                        hasAttachments: null,
                                        dateRange: null
                                    })}
                                    className="mt-3 text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Clear Filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="overflow-y-auto h-full">
                        {sortedEmails.map((email) => {
                            const CategoryIcon = getCategoryIcon(email.category)
                            const isSelected = selectedEmails.includes(email.id)

                            return (
                                <motion.div
                                    key={email.id}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white/60 transition-colors relative ${selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                                        } ${!email.read ? 'bg-blue-50/30' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
                                    onClick={() => {
                                        setSelectedEmail(email)
                                        handleEmailAction('read', email.id)
                                    }}
                                    whileHover={{ x: 2 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleEmailSelection(email.id)
                                            }}
                                            className="mt-1"
                                        >
                                            {isSelected ? (
                                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {!email.read && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                <CategoryIcon className="h-3 w-3 text-gray-400" />
                                                <p className={`text-sm truncate flex-1 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {email.from.split('<')[0].trim()}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    {email.important && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                                    <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(email.priority)}`}>
                                                        {email.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={`text-sm truncate mb-1 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {email.subject}
                                                {email.thread && (
                                                    <span className="ml-2 text-xs text-blue-600">({email.threadCount})</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{email.preview}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 ml-2">
                                            <span className="text-xs text-gray-400">{formatTime(email.timestamp)}</span>
                                            <div className="flex items-center gap-1">
                                                {email.starred && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleEmailAction('star', email.id)
                                                        }}
                                                    >
                                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                    </button>
                                                )}
                                                {email.attachments > 0 && <Paperclip className="h-3 w-3 text-gray-400" />}
                                                {email.aiSuggestions && <Bot className="h-3 w-3 text-blue-500" />}
                                                {email.thread && <MessageCircle className="h-3 w-3 text-green-500" />}
                                            </div>
                                        </div>
                                    </div>

                                    {email.labels.length > 0 && (
                                        <div className="flex gap-1 mt-2 ml-7">
                                            {email.labels.map((label) => (
                                                <span key={label} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 bg-white/30 backdrop-blur-sm">
                    {selectedEmail ? (
                        <div className="h-full flex flex-col">
                            {/* Enhanced Email Header */}
                            <div className="p-6 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-xl font-semibold text-gray-900">{selectedEmail.subject}</h1>
                                            {selectedEmail.thread && (
                                                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Thread ({selectedEmail.threadCount})
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(selectedEmail.priority)}`}>
                                                {selectedEmail.priority} priority
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>From: <strong>{selectedEmail.from}</strong></span>
                                            <span>To: {selectedEmail.to}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {formatTime(selectedEmail.timestamp)}
                                            </span>
                                        </div>
                                        {selectedEmail.labels.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {selectedEmail.labels.map((label) => (
                                                    <span key={label} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEmailAction('star', selectedEmail.id)}
                                            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${selectedEmail.starred ? 'text-yellow-500' : 'text-gray-400'
                                                }`}
                                        >
                                            <Star className={`h-5 w-5 ${selectedEmail.starred ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleEmailAction('important', selectedEmail.id)}
                                            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${selectedEmail.important ? 'text-red-500' : 'text-gray-400'
                                                }`}
                                        >
                                            <AlertTriangle className="h-5 w-5" />
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
                                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Attachments */}
                                {selectedEmail.attachments > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Paperclip className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">{selectedEmail.attachments} attachment(s)</span>
                                        <button className="text-sm text-blue-600 hover:text-blue-800">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
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
                                        className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Bot className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-medium text-blue-900">AI-Powered Suggestions</h3>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Smart</span>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedEmail.aiSuggestions.map((suggestion, index) => (
                                                <motion.button
                                                    key={index}
                                                    className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm flex items-center justify-between group"
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <span>{suggestion}</span>
                                                    <ExternalLink className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Enhanced Reply Section */}
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
                                    <motion.button
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Bot className="h-4 w-4" />
                                        AI Reply
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <motion.div
                                    className="h-20 w-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <MessageSquare className="h-10 w-10 text-blue-500" />
                                </motion.div>
                                <p className="text-gray-500 text-lg mb-2">Select an email to read</p>
                                <p className="text-gray-400 text-sm">Choose from {sortedEmails.length} emails in your inbox</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Professional Footer */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>ConversAI Professional • Secure Email Platform</span>
                        <span>Romanian Localization • Cloud Sync</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                <Shield className="h-4 w-4" />
                                Secure
                            </div>
                            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                <Globe className="h-4 w-4" />
                                Connected
                            </div>
                            <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                <Bot className="h-4 w-4" />
                                AI-Enhanced
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
