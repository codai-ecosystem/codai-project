'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, MessageSquare, Vote, Calendar, MapPin, Heart,
  ThumbsUp, ThumbsDown, Star, Send, Bell, Megaphone,
  CheckCircle, AlertCircle, Clock, Eye, Share2, Filter,
  Search, ChevronRight, TrendingUp, BarChart3, Activity,
  FileText, Camera, Mic, Video, Image, ExternalLink,
  UserPlus, Award, Target, Globe, Shield, Zap,
  Building2, TreePine, Car, Lightbulb, Home, School,
  Hospital, ShoppingCart, Coffee, Music, Book, Briefcase
} from 'lucide-react'

interface EngagementMetric {
  id: string
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  description: string
}

interface PublicFeedback {
  id: string
  title: string
  description: string
  category: string
  author: string
  date: string
  status: 'open' | 'in-review' | 'in-progress' | 'completed' | 'rejected'
  votes: number
  comments: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  department: string
  location?: string
  images?: number
}

interface CommunityEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'town-hall' | 'workshop' | 'consultation' | 'forum' | 'survey'
  attendees: number
  maxAttendees: number
  status: 'upcoming' | 'ongoing' | 'completed'
  host: string
}

interface Poll {
  id: string
  question: string
  description: string
  options: { id: string; text: string; votes: number }[]
  totalVotes: number
  endDate: string
  category: string
  status: 'active' | 'ended'
}

export default function CitizenEngagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [newFeedbackTitle, setNewFeedbackTitle] = useState('')
  const [newFeedbackDescription, setNewFeedbackDescription] = useState('')

  const [engagementStats, setEngagementStats] = useState<EngagementMetric[]>([
    {
      id: 'active-citizens',
      title: 'Active Citizens',
      value: '24,847',
      change: '+18.3%',
      changeType: 'positive',
      icon: Users,
      color: 'from-teal-500 to-cyan-500',
      description: 'Citizens actively participating in civic engagement'
    },
    {
      id: 'feedback-submitted',
      title: 'Feedback Submitted',
      value: '3,926',
      change: '+24.7%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-500',
      description: 'Public feedback and suggestions this month'
    },
    {
      id: 'participation-rate',
      title: 'Participation Rate',
      value: '67.4%',
      change: '+5.2%',
      changeType: 'positive',
      icon: Vote,
      color: 'from-cyan-500 to-blue-500',
      description: 'Citizen participation in democratic processes'
    },
    {
      id: 'response-time',
      title: 'Avg Response Time',
      value: '2.8 days',
      change: '-12.5%',
      changeType: 'positive',
      icon: Clock,
      color: 'from-indigo-500 to-purple-500',
      description: 'Average time to respond to citizen feedback'
    }
  ])

  const [publicFeedback, setPublicFeedback] = useState<PublicFeedback[]>([
    {
      id: 'fb-001',
      title: 'Improve Public Transit Frequency',
      description: 'Bus routes need more frequent service during peak hours, especially Route 42 and Route 18.',
      category: 'Transportation',
      author: 'Sarah M.',
      date: '2025-08-06',
      status: 'in-progress',
      votes: 247,
      comments: 34,
      priority: 'high',
      department: 'Transportation',
      location: 'Downtown District',
      images: 3
    },
    {
      id: 'fb-002',
      title: 'Community Garden Initiative',
      description: 'Proposal to convert unused lot on 5th Street into a community garden for local food production.',
      category: 'Environment',
      author: 'Michael R.',
      date: '2025-08-05',
      status: 'in-review',
      votes: 189,
      comments: 22,
      priority: 'medium',
      department: 'Parks & Recreation',
      location: '5th Street',
      images: 2
    },
    {
      id: 'fb-003',
      title: 'Bike Lane Safety Improvements',
      description: 'Adding protected bike lanes on Main Street would significantly improve cyclist safety.',
      category: 'Transportation',
      author: 'Emma L.',
      date: '2025-08-04',
      status: 'open',
      votes: 156,
      comments: 18,
      priority: 'high',
      department: 'Transportation',
      location: 'Main Street',
      images: 1
    },
    {
      id: 'fb-004',
      title: 'Extended Library Hours',
      description: 'Request to extend public library hours on weekends for better community access.',
      category: 'Education',
      author: 'David K.',
      date: '2025-08-03',
      status: 'completed',
      votes: 134,
      comments: 15,
      priority: 'medium',
      department: 'Education',
      location: 'Central Library',
      images: 0
    },
    {
      id: 'fb-005',
      title: 'Park Lighting Improvement',
      description: 'Better lighting needed in Riverside Park for evening safety and accessibility.',
      category: 'Safety',
      author: 'Lisa T.',
      date: '2025-08-02',
      status: 'in-progress',
      votes: 203,
      comments: 27,
      priority: 'high',
      department: 'Public Safety',
      location: 'Riverside Park',
      images: 4
    }
  ])

  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([
    {
      id: 'event-001',
      title: 'Monthly Town Hall Meeting',
      description: 'Open forum for citizens to discuss local issues and upcoming initiatives.',
      date: '2025-08-15',
      time: '7:00 PM',
      location: 'City Council Chambers',
      type: 'town-hall',
      attendees: 124,
      maxAttendees: 200,
      status: 'upcoming',
      host: 'Mayor\'s Office'
    },
    {
      id: 'event-002',
      title: 'Transportation Planning Workshop',
      description: 'Collaborative session to plan future transportation improvements.',
      date: '2025-08-20',
      time: '6:30 PM',
      location: 'Community Center',
      type: 'workshop',
      attendees: 67,
      maxAttendees: 100,
      status: 'upcoming',
      host: 'Transportation Department'
    },
    {
      id: 'event-003',
      title: 'Budget Consultation Session',
      description: 'Public input session for next year\'s municipal budget priorities.',
      date: '2025-08-25',
      time: '2:00 PM',
      location: 'Municipal Building',
      type: 'consultation',
      attendees: 89,
      maxAttendees: 150,
      status: 'upcoming',
      host: 'Finance Department'
    }
  ])

  const [activePoll, setActivePoll] = useState<Poll>({
    id: 'poll-001',
    question: 'What should be the priority for downtown development?',
    description: 'Help us decide the focus for downtown revitalization projects over the next 2 years.',
    options: [
      { id: 'opt-1', text: 'More green spaces and parks', votes: 342 },
      { id: 'opt-2', text: 'Improved public transportation', votes: 287 },
      { id: 'opt-3', text: 'Small business support', votes: 198 },
      { id: 'opt-4', text: 'Cultural and arts venues', votes: 156 }
    ],
    totalVotes: 983,
    endDate: '2025-08-20',
    category: 'Development',
    status: 'active'
  })

  const categories = [
    { id: 'all', label: 'All Categories', icon: Globe },
    { id: 'Transportation', label: 'Transportation', icon: Car },
    { id: 'Environment', label: 'Environment', icon: TreePine },
    { id: 'Education', label: 'Education', icon: School },
    { id: 'Safety', label: 'Safety', icon: Shield },
    { id: 'Healthcare', label: 'Healthcare', icon: Hospital },
    { id: 'Housing', label: 'Housing', icon: Home }
  ]

  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'open', label: 'Open' },
    { id: 'in-review', label: 'In Review' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'rejected', label: 'Rejected' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'feedback', label: 'Public Feedback', icon: MessageSquare },
    { id: 'events', label: 'Community Events', icon: Calendar },
    { id: 'polls', label: 'Public Polls', icon: Vote },
    { id: 'participate', label: 'Get Involved', icon: UserPlus }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-review': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const filteredFeedback = publicFeedback.filter(feedback => {
    const matchesCategory = selectedCategory === 'all' || feedback.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || feedback.status === selectedStatus
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  const handleSubmitFeedback = () => {
    if (newFeedbackTitle.trim() && newFeedbackDescription.trim()) {
      const newFeedback: PublicFeedback = {
        id: `fb-${Date.now()}`,
        title: newFeedbackTitle,
        description: newFeedbackDescription,
        category: 'General',
        author: 'You',
        date: new Date().toISOString().split('T')[0],
        status: 'open',
        votes: 1,
        comments: 0,
        priority: 'medium',
        department: 'General',
        images: 0
      }
      setPublicFeedback([newFeedback, ...publicFeedback])
      setNewFeedbackTitle('')
      setNewFeedbackDescription('')
    }
  }

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setEngagementStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.id === 'active-citizens' 
          ? (parseInt(stat.value.replace(',', '')) + Math.floor(Math.random() * 5)).toLocaleString()
          : stat.value
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Enhanced Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-b border-teal-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Citizen Engagement
                </h1>
                <p className="text-sm text-gray-600">Public Participation & Democratic Tools</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{engagementStats[0]?.value || '0'} Active Citizens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{publicFeedback.length} Open Issues</span>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('participate')}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Get Involved
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-1">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {engagementStats.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                        metric.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {metric.change}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    <p className="text-gray-600 text-sm">{metric.description}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.button
                  className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white text-left group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('feedback')}
                >
                  <MessageSquare className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Submit Feedback</h3>
                  <p className="text-teal-100 text-sm">Share ideas and report issues</p>
                </motion.button>

                <motion.button
                  className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white text-left group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('events')}
                >
                  <Calendar className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Join Events</h3>
                  <p className="text-blue-100 text-sm">Participate in community meetings</p>
                </motion.button>

                <motion.button
                  className="p-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white text-left group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('polls')}
                >
                  <Vote className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Vote on Issues</h3>
                  <p className="text-cyan-100 text-sm">Make your voice heard</p>
                </motion.button>

                <motion.button
                  className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white text-left group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('participate')}
                >
                  <UserPlus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Get Involved</h3>
                  <p className="text-indigo-100 text-sm">Find volunteer opportunities</p>
                </motion.button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Feedback</h3>
                <div className="space-y-4">
                  {publicFeedback.slice(0, 3).map((feedback, index) => (
                    <motion.div
                      key={feedback.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setActiveTab('feedback')}
                    >
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{feedback.title}</h4>
                        <p className="text-gray-600 text-xs">{feedback.author} • {feedback.votes} votes</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {communityEvents.slice(0, 3).map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setActiveTab('events')}
                    >
                      <Calendar className="w-5 h-5 text-teal-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        <p className="text-gray-600 text-xs">{event.date} • {event.attendees}/{event.maxAttendees} attending</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Submit New Feedback */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Public Feedback</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newFeedbackTitle}
                    onChange={(e) => setNewFeedbackTitle(e.target.value)}
                    placeholder="Brief title for your feedback..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newFeedbackDescription}
                    onChange={(e) => setNewFeedbackDescription(e.target.value)}
                    placeholder="Describe your feedback, suggestion, or concern in detail..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">Add Photos</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Add Location</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSubmitFeedback}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.map((feedback, index) => (
                <motion.div
                  key={feedback.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6 hover:shadow-lg transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                          {feedback.status.replace('-', ' ')}
                        </div>
                        <div className={`text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                          {feedback.priority} priority
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{feedback.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{feedback.author}</span>
                        <span>•</span>
                        <span>{feedback.date}</span>
                        <span>•</span>
                        <span>{feedback.department}</span>
                        {feedback.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {feedback.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{feedback.votes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{feedback.comments}</span>
                      </button>
                      {feedback.images && feedback.images > 0 && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Image className="w-4 h-4" />
                          <span className="text-sm">{feedback.images}</span>
                        </div>
                      )}
                    </div>
                    
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Other tabs content placeholder */}
        {!['overview', 'feedback'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Features</h3>
            <p className="text-gray-600 mb-6">Advanced {activeTab} engagement features are being implemented.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
              Coming Soon
            </button>
          </motion.div>
        )}
      </div>

      {/* Modern Footer */}
      <motion.footer
        className="bg-white/80 backdrop-blur-sm border-t border-teal-200/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Citizen Voice</h3>
              <p className="text-teal-100 text-sm">Every citizen's input matters in shaping our community's future.</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Vote className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Democratic Process</h3>
              <p className="text-blue-100 text-sm">Transparent and inclusive decision-making for all citizens.</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Activity className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Community Action</h3>
              <p className="text-indigo-100 text-sm">Together we build stronger, more connected communities.</p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
