'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit3,
  Copy,
  Share2,
  Archive,
  Star,
  Clock,
  Building,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Play,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Upload,
  Settings,
  ChevronDown,
  ArrowUpRight,
  BookOpen,
  Award,
  Gauge
} from 'lucide-react'

interface JobPosting {
  id: string
  title: string
  department: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  location: string
  remote: boolean
  salary: {
    min: number
    max: number
    currency: string
  }
  status: 'active' | 'paused' | 'closed' | 'draft'
  priority: 'high' | 'medium' | 'low'
  applications: number
  views: number
  datePosted: string
  deadline: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  experience: string
  aiMatchScore: number
  sourceChannels: Array<{ channel: string; applications: number; cost: number }>
  hiringManager: {
    name: string
    avatar: string
    department: string
  }
  analytics: {
    applicationsToday: number
    viewsToday: number
    conversionRate: number
    avgTimeToApply: number
  }
}

interface JobAnalytics {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  avgApplicationsPerJob: number
  topPerformingJobs: JobPosting[]
  applicationsByChannel: Array<{ channel: string; count: number; percentage: number }>
  hiringFunnel: Array<{ stage: string; count: number; percentage: number }>
  costPerHire: number
  timeToFill: number
}

type JobFilter = 'all' | 'active' | 'paused' | 'draft' | 'high-priority'
type ViewMode = 'grid' | 'list' | 'analytics'
type SortOption = 'newest' | 'applications' | 'priority' | 'deadline'

export default function JobsPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeFilter, setActiveFilter] = useState<JobFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])

  const [jobAnalytics] = useState<JobAnalytics>({
    totalJobs: 67,
    activeJobs: 24,
    totalApplications: 3247,
    avgApplicationsPerJob: 48.5,
    topPerformingJobs: [],
    applicationsByChannel: [
      { channel: 'LinkedIn', count: 1456, percentage: 44.8 },
      { channel: 'Company Website', count: 1134, percentage: 34.9 },
      { channel: 'Job Boards', count: 657, percentage: 20.3 }
    ],
    hiringFunnel: [
      { stage: 'Posted', count: 67, percentage: 100 },
      { stage: 'Applications', count: 3247, percentage: 48.5 },
      { stage: 'Screening', count: 1623, percentage: 50.0 },
      { stage: 'Interviews', count: 487, percentage: 15.0 },
      { stage: 'Offers', count: 97, percentage: 3.0 }
    ],
    costPerHire: 3250,
    timeToFill: 28
  })

  const [jobPostings] = useState<JobPosting[]>([
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      type: 'full-time',
      location: 'San Francisco, CA',
      remote: true,
      salary: { min: 120000, max: 160000, currency: 'USD' },
      status: 'active',
      priority: 'high',
      applications: 147,
      views: 2341,
      datePosted: '2024-01-15',
      deadline: '2024-02-15',
      description: 'We are looking for a Senior Full Stack Developer to join our engineering team...',
      requirements: ['5+ years experience', 'React/Node.js', 'TypeScript', 'AWS'],
      benefits: ['Health Insurance', 'Stock Options', 'Remote Work', '401k'],
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
      experience: '5+ years',
      aiMatchScore: 94,
      sourceChannels: [
        { channel: 'LinkedIn', applications: 89, cost: 1250 },
        { channel: 'Company Website', applications: 58, cost: 0 }
      ],
      hiringManager: { name: 'Sarah Chen', avatar: 'SC', department: 'Engineering' },
      analytics: { applicationsToday: 12, viewsToday: 187, conversionRate: 6.3, avgTimeToApply: 4.2 }
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      type: 'full-time',
      location: 'Austin, TX',
      remote: false,
      salary: { min: 110000, max: 140000, currency: 'USD' },
      status: 'active',
      priority: 'high',
      applications: 89,
      views: 1567,
      datePosted: '2024-01-18',
      deadline: '2024-02-18',
      description: 'Join our product team to drive product strategy and execution...',
      requirements: ['3+ years PM experience', 'Agile methodology', 'Analytics tools'],
      benefits: ['Health Insurance', 'Stock Options', 'Learning Budget'],
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping'],
      experience: '3+ years',
      aiMatchScore: 87,
      sourceChannels: [
        { channel: 'LinkedIn', applications: 52, cost: 890 },
        { channel: 'Job Boards', applications: 37, cost: 450 }
      ],
      hiringManager: { name: 'Mike Johnson', avatar: 'MJ', department: 'Product' },
      analytics: { applicationsToday: 8, viewsToday: 143, conversionRate: 5.7, avgTimeToApply: 3.8 }
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      department: 'Design',
      type: 'full-time',
      location: 'Remote',
      remote: true,
      salary: { min: 85000, max: 115000, currency: 'USD' },
      status: 'paused',
      priority: 'medium',
      applications: 203,
      views: 3456,
      datePosted: '2024-01-10',
      deadline: '2024-02-10',
      description: 'Create exceptional user experiences for our digital products...',
      requirements: ['4+ years UX/UI experience', 'Figma proficiency', 'Portfolio required'],
      benefits: ['Health Insurance', 'Remote Work', 'Design Budget'],
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      experience: '4+ years',
      aiMatchScore: 91,
      sourceChannels: [
        { channel: 'Dribbble', applications: 78, cost: 650 },
        { channel: 'Company Website', applications: 125, cost: 0 }
      ],
      hiringManager: { name: 'Emily Rodriguez', avatar: 'ER', department: 'Design' },
      analytics: { applicationsToday: 0, viewsToday: 0, conversionRate: 5.9, avgTimeToApply: 5.1 }
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      department: 'Engineering',
      type: 'full-time',
      location: 'Seattle, WA',
      remote: true,
      salary: { min: 130000, max: 170000, currency: 'USD' },
      status: 'draft',
      priority: 'medium',
      applications: 0,
      views: 0,
      datePosted: '2024-01-22',
      deadline: '2024-02-22',
      description: 'Build and maintain our cloud infrastructure and deployment pipelines...',
      requirements: ['5+ years DevOps experience', 'Kubernetes', 'AWS/Azure', 'CI/CD'],
      benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Learning Budget'],
      skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Jenkins'],
      experience: '5+ years',
      aiMatchScore: 89,
      sourceChannels: [],
      hiringManager: { name: 'David Kim', avatar: 'DK', department: 'Engineering' },
      analytics: { applicationsToday: 0, viewsToday: 0, conversionRate: 0, avgTimeToApply: 0 }
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400'
      case 'closed': return 'bg-red-500/20 text-red-400'
      case 'draft': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'paused': return PauseCircle
      case 'closed': return Archive
      case 'draft': return Edit3
      default: return Clock
    }
  }

  const filteredJobs = jobPostings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'high-priority') return matchesSearch && job.priority === 'high'
    return matchesSearch && job.status === activeFilter
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
      case 'applications':
        return b.applications - a.applications
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      default:
        return 0
    }
  })

  const handleJobSelection = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on jobs:`, selectedJobs)
    setSelectedJobs([])
  }

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0
    })
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
        </div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 glassmorphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Jobs & Positions
                  </h1>
                  <p className="text-xs text-slate-400">Manage job postings and recruitment workflows</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{jobAnalytics.totalJobs} Total Jobs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{jobAnalytics.activeJobs} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{jobAnalytics.totalApplications.toLocaleString()} Applications</span>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💼</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{jobAnalytics.totalJobs}</div>
            <div className="text-sm text-slate-400 mb-2">Total Job Postings</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">+5 this month</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{jobAnalytics.activeJobs}</div>
            <div className="text-sm text-slate-400 mb-2">Active Positions</div>
            <div className="flex items-center text-xs">
              <Activity className="w-3 h-3 text-blue-400 mr-1" />
              <span className="text-blue-400">{jobAnalytics.activeJobs}/{jobAnalytics.totalJobs} active</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{jobAnalytics.totalApplications.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mb-2">Total Applications</div>
            <div className="flex items-center text-xs">
              <Target className="w-3 h-3 text-purple-400 mr-1" />
              <span className="text-purple-400">{jobAnalytics.avgApplicationsPerJob} avg per job</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">${jobAnalytics.costPerHire.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mb-2">Cost per Hire</div>
            <div className="flex items-center text-xs">
              <Clock className="w-3 h-3 text-orange-400 mr-1" />
              <span className="text-orange-400">{jobAnalytics.timeToFill} days to fill</span>
            </div>
          </div>
        </motion.div>

        {/* Controls and Actions */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs, departments, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as JobFilter)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Jobs</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="high-priority">High Priority</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest</option>
                <option value="applications">Applications</option>
                <option value="priority">Priority</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>

            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`p-2 rounded ${viewMode === 'analytics' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedJobs.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">{selectedJobs.length} selected</span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-all"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('pause')}
                  className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded text-sm hover:bg-yellow-500/30 transition-all"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            )}
            <button className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
              <Upload className="w-4 h-4" />
              <span>Import Jobs</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all">
              <Plus className="w-4 h-4" />
              <span>Create Job</span>
            </button>
          </div>
        </motion.div>

        {/* Job Listings */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {sortedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className="glassmorphism rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleJobSelection(job.id)}
                        className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{job.remote ? 'Remote' : job.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-slate-300">
                      <span className="font-medium">{formatSalary(job.salary)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>{job.applications}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-slate-400 text-xs rounded">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                        {job.hiringManager.avatar}
                      </div>
                      <span className="text-xs text-slate-400">{job.hiringManager.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              className="glassmorphism rounded-xl border border-white/10 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">
                        <input
                          type="checkbox"
                          className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Job Title</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Department</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Applications</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Salary</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Deadline</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(job.id)}
                            onChange={() => handleJobSelection(job.id)}
                            className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{job.title}</div>
                              <div className="text-xs text-slate-400">{job.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{job.department}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{job.applications}</td>
                        <td className="p-4 text-sm text-slate-300">{formatSalary(job.salary)}</td>
                        <td className="p-4 text-sm text-slate-300">{new Date(job.deadline).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-slate-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-white transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {viewMode === 'analytics' && (
            <motion.div
              key="analytics"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Applications by Channel */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Applications by Channel</h3>
                <div className="space-y-4">
                  {jobAnalytics.applicationsByChannel.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{channel.channel}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-white/20 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                            style={{ width: `${channel.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium w-12">{channel.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hiring Funnel */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Hiring Funnel</h3>
                <div className="space-y-4">
                  {jobAnalytics.hiringFunnel.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{stage.stage}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-white/20 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${stage.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium w-12">{stage.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-6">Job Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-sm text-slate-300">Avg. Applications</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{jobAnalytics.avgApplicationsPerJob}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm text-slate-300">Cost per Hire</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${jobAnalytics.costPerHire.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-sm text-slate-300">Time to Fill</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{jobAnalytics.timeToFill} days</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Gauge className="w-5 h-5 text-orange-400 mr-2" />
                      <span className="text-sm text-slate-300">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-white">68.5%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Optimization</h3>
              <p className="text-slate-400 text-sm">Automatically optimize job postings for maximum reach and quality applications</p>
            </motion.div>

            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm">Track job performance, conversion rates, and hiring metrics in real-time</p>
            </motion.div>

            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Channel Distribution</h3>
              <p className="text-slate-400 text-sm">Distribute job postings across multiple platforms with automated optimization</p>
            </motion.div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
