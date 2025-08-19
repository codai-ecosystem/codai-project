'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Filter,
  Grid,
  List,
  UserPlus,
  Mail,
  Phone,
  Video,
  MessageSquare,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Upload,
  Tag,
  Calendar,
  Clock,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Building,
  MapPin,
  ExternalLink,
  Copy,
  Share,
  Archive,
  UserCheck,
  UserX,
  Settings,
  Eye,
  Heart,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  SortDesc,
  FileText,
  Image,
  Paperclip,
  Hash,
  AtSign
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  lastContact: Date
  frequency: number
  tags: string[]
  groups: string[]
  notes?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  location?: string
  timezone?: string
  birthday?: Date
  customFields?: Record<string, string>
  isFavorite: boolean
  isBlocked: boolean
  emailCount: number
  meetingCount: number
  lastActivity: Date
  score: number
}

interface Team {
  id: string
  name: string
  description: string
  avatar?: string
  memberCount: number
  members: Contact[]
  owner: string
  admins: string[]
  createdAt: Date
  lastActivity: Date
  isPrivate: boolean
  tags: string[]
  channels: {
    email: boolean
    chat: boolean
    meetings: boolean
    calls: boolean
  }
  stats: {
    totalEmails: number
    totalMeetings: number
    avgResponseTime: string
    activeMembers: number
  }
}

interface ContactMetrics {
  totalContacts: number
  activeContacts: number
  totalTeams: number
  emailsSentToday: number
  meetingsToday: number
  responseRate: number
  avgConnectionTime: string
  newContactsThisWeek: number
}

export default function ContactsTeamsPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTab, setSelectedTab] = useState<'contacts' | 'teams' | 'groups' | 'directory'>('contacts')
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent' | 'frequent'>('all')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  // Sample data with comprehensive contact information
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Martinez',
      email: 'sarah.martinez@designstudio.com',
      phone: '+40 721 456 789',
      company: 'Design Studio Pro',
      position: 'Senior UX Designer',
      status: 'online',
      lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000),
      frequency: 25,
      tags: ['design', 'ux', 'client'],
      groups: ['Work', 'Design Team'],
      location: 'Bucharest, Romania',
      timezone: 'Europe/Bucharest',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahmartinez',
        website: 'https://sarahdesigns.com'
      },
      isFavorite: true,
      isBlocked: false,
      emailCount: 47,
      meetingCount: 12,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      score: 95
    },
    {
      id: '2',
      name: 'Alexandru Popescu',
      email: 'alex.popescu@techcorp.ro',
      phone: '+40 745 123 456',
      company: 'TechCorp Romania',
      position: 'Lead Developer',
      status: 'busy',
      lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000),
      frequency: 18,
      tags: ['development', 'backend', 'team'],
      groups: ['Work', 'Development'],
      location: 'Cluj-Napoca, Romania',
      timezone: 'Europe/Bucharest',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/alexpopescu'
      },
      isFavorite: false,
      isBlocked: false,
      emailCount: 32,
      meetingCount: 8,
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
      score: 82
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      email: 'maria@innovation-lab.com',
      phone: '+34 612 345 678',
      company: 'Innovation Lab',
      position: 'Product Manager',
      status: 'away',
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      frequency: 12,
      tags: ['product', 'innovation', 'strategy'],
      groups: ['Business', 'Partners'],
      location: 'Barcelona, Spain',
      timezone: 'Europe/Madrid',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/mariarodriguez',
        twitter: 'https://twitter.com/mariainnovates'
      },
      isFavorite: true,
      isBlocked: false,
      emailCount: 28,
      meetingCount: 5,
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      score: 76
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john.smith@globaltech.com',
      phone: '+1 555 123 4567',
      company: 'Global Tech Solutions',
      position: 'VP of Engineering',
      status: 'offline',
      lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      frequency: 8,
      tags: ['leadership', 'engineering', 'enterprise'],
      groups: ['Executives', 'Partners'],
      location: 'San Francisco, USA',
      timezone: 'America/Los_Angeles',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johnsmith',
        website: 'https://globaltech.com'
      },
      isFavorite: false,
      isBlocked: false,
      emailCount: 15,
      meetingCount: 3,
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
      score: 68
    },
    {
      id: '5',
      name: 'Ana Ionescu',
      email: 'ana.ionescu@startup.ro',
      phone: '+40 732 987 654',
      company: 'InnovateTech',
      position: 'Founder & CEO',
      status: 'online',
      lastContact: new Date(Date.now() - 60 * 60 * 1000),
      frequency: 31,
      tags: ['startup', 'founder', 'ai'],
      groups: ['Entrepreneurs', 'AI Community'],
      location: 'Timișoara, Romania',
      timezone: 'Europe/Bucharest',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/anaionescu',
        twitter: 'https://twitter.com/anatech'
      },
      isFavorite: true,
      isBlocked: false,
      emailCount: 65,
      meetingCount: 18,
      lastActivity: new Date(Date.now() - 15 * 60 * 1000),
      score: 92
    }
  ])

  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Design Team',
      description: 'Creative professionals working on UI/UX design projects',
      memberCount: 8,
      members: contacts.slice(0, 3),
      owner: '1',
      admins: ['1', '2'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isPrivate: false,
      tags: ['design', 'creative', 'ui-ux'],
      channels: {
        email: true,
        chat: true,
        meetings: true,
        calls: true
      },
      stats: {
        totalEmails: 247,
        totalMeetings: 32,
        avgResponseTime: '2h 15m',
        activeMembers: 6
      }
    },
    {
      id: '2',
      name: 'Development Squad',
      description: 'Full-stack developers and engineers building our platform',
      memberCount: 12,
      members: contacts.slice(1, 4),
      owner: '2',
      admins: ['2'],
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      isPrivate: false,
      tags: ['development', 'engineering', 'tech'],
      channels: {
        email: true,
        chat: true,
        meetings: true,
        calls: false
      },
      stats: {
        totalEmails: 456,
        totalMeetings: 48,
        avgResponseTime: '1h 45m',
        activeMembers: 10
      }
    },
    {
      id: '3',
      name: 'Executive Board',
      description: 'Leadership team for strategic decisions and company direction',
      memberCount: 5,
      members: [contacts[3], contacts[4]],
      owner: '4',
      admins: ['4', '5'],
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isPrivate: true,
      tags: ['leadership', 'strategy', 'executive'],
      channels: {
        email: true,
        chat: false,
        meetings: true,
        calls: true
      },
      stats: {
        totalEmails: 128,
        totalMeetings: 24,
        avgResponseTime: '4h 30m',
        activeMembers: 4
      }
    }
  ])

  const metrics: ContactMetrics = {
    totalContacts: contacts.length,
    activeContacts: contacts.filter(c => c.status === 'online').length,
    totalTeams: teams.length,
    emailsSentToday: 23,
    meetingsToday: 4,
    responseRate: 94.2,
    avgConnectionTime: '3m 45s',
    newContactsThisWeek: 7
  }

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    switch (filterBy) {
      case 'favorites': return contact.isFavorite
      case 'recent': return contact.lastActivity > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      case 'frequent': return contact.frequency > 20
      default: return true
    }
  })

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
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

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const toggleFavorite = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contacts & Teams</h1>
              <p className="text-sm text-gray-500">
                {metrics.totalContacts} contacts • {metrics.activeContacts} online • {metrics.totalTeams} teams
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={viewMode === 'grid' ? 'List View' : 'Grid View'}
              >
                {viewMode === 'grid' ? (
                  <List className="h-5 w-5 text-gray-400" />
                ) : (
                  <Grid className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                title="Filters"
              >
                <Filter className="h-5 w-5" />
              </button>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </motion.button>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="mt-4 grid grid-cols-8 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Rate</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.responseRate}%</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emails Today</span>
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.emailsSentToday}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Meetings Today</span>
              <Video className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.meetingsToday}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Connect</span>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.avgConnectionTime}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New This Week</span>
              <UserPlus className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.newContactsThisWeek}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.activeContacts}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Teams</span>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.totalTeams}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{metrics.totalContacts}</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-200px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts & teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            {[
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'teams', label: 'Teams', icon: Users }
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

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mb-4 p-3 bg-white/60 border border-gray-200 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by:</h4>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Contacts' },
                    { id: 'favorites', label: 'Favorites' },
                    { id: 'recent', label: 'Recent' },
                    { id: 'frequent', label: 'Frequent' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterBy(filter.id as any)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${filterBy === filter.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content List */}
          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {selectedTab === 'contacts'
              ? filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedContact?.id === contact.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                        {contact.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.company}</p>
                      <p className="text-xs text-gray-500">Score: {contact.score}</p>
                    </div>
                  </div>
                </motion.div>
              ))
              : filteredTeams.map((team) => (
                <motion.div
                  key={team.id}
                  className="p-3 rounded-lg border bg-white/60 border-gray-200 hover:bg-white cursor-pointer transition-all"
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {team.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{team.name}</p>
                        {team.isPrivate && <Shield className="h-3 w-3 text-red-500" />}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{team.memberCount} members</p>
                      <p className="text-xs text-gray-500">{formatTime(team.lastActivity)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {selectedContact ? (
            /* Contact Details View */
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Contact Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(selectedContact.status)}`}></div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedContact.name}</h2>
                      <p className="text-lg text-gray-600">{selectedContact.position}</p>
                      <p className="text-sm text-gray-500">{selectedContact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedContact.id)}
                      className={`p-2 rounded-lg transition-colors ${selectedContact.isFavorite
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'hover:bg-gray-100 text-gray-400'
                        }`}
                    >
                      <Star className={`h-5 w-5 ${selectedContact.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    <Phone className="h-4 w-4" />
                    Call
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                    <Video className="h-4 w-4" />
                    Meet
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </button>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{selectedContact.email}</p>
                      </div>
                      {selectedContact.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">{selectedContact.phone}</p>
                        </div>
                      )}
                      {selectedContact.location && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="text-gray-900">{selectedContact.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email Count</span>
                        <span className="font-medium">{selectedContact.emailCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Meetings</span>
                        <span className="font-medium">{selectedContact.meetingCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Frequency</span>
                        <span className="font-medium">{selectedContact.frequency}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Score</span>
                        <span className="font-medium">{selectedContact.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Contact</span>
                        <span className="font-medium">{formatTime(selectedContact.lastContact)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedContact.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            /* Contact/Team Grid/List View */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTab === 'contacts' ? 'All Contacts' : 'Teams & Groups'}
                </h2>
                <div className="flex items-center gap-2">
                  {selectedContacts.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {selectedContacts.length} selected
                    </span>
                  )}
                </div>
              </div>

              {selectedTab === 'contacts' ? (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'
                }>
                  {filteredContacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      className={`bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white transition-all cursor-pointer ${viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4'
                        }`}
                      onClick={() => setSelectedContact(contact)}
                      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                    >
                      <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                            {contact.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{contact.company}</p>
                          {viewMode === 'grid' && (
                            <p className="text-xs text-gray-500 mt-1">{contact.position}</p>
                          )}
                        </div>
                      </div>
                      {viewMode === 'list' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{contact.emailCount} emails</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">Score: {contact.score}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeams.map((team) => (
                    <motion.div
                      key={team.id}
                      className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 p-6 hover:bg-white transition-all cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {team.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                            {team.isPrivate && <Shield className="h-4 w-4 text-red-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{team.memberCount} members</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                        <div>Emails: {team.stats.totalEmails}</div>
                        <div>Meetings: {team.stats.totalMeetings}</div>
                        <div>Active: {team.stats.activeMembers}</div>
                        <div>Response: {team.stats.avgResponseTime}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>ConversAI Contacts • Professional Network Management</span>
            <span>Team Collaboration • Smart Contact Insights</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Users className="h-4 w-4" />
                Connected
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <Target className="h-4 w-4" />
                Smart Insights
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Zap className="h-4 w-4" />
                Team Sync
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
