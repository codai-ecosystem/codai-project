'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  Calendar,
  Brain,
  Building,
  Filter,
  Search,
  MoreHorizontal,
  ArrowRight,
  Clock,
  Star,
  Award,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Share2,
  Plus,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react'

interface Candidate {
  id: string
  name: string
  position: string
  skills: string[]
  experience: string
  status: 'screening' | 'interview' | 'offer' | 'hired' | 'declined'
  score: number
  avatar: string
  location: string
  salary: string
  lastActivity: string
}

interface Job {
  id: string
  title: string
  department: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  location: string
  applications: number
  status: 'active' | 'paused' | 'closed'
  datePosted: string
  priority: 'high' | 'medium' | 'low'
  budget: string
}

interface DashboardMetrics {
  totalCandidates: number
  activeJobs: number
  interviewsScheduled: number
  hireRate: number
  avgTimeToHire: number
  candidatesSources: Array<{ source: string; count: number; percentage: number }>
  hiringFunnel: Array<{ stage: string; count: number; percentage: number }>
  recentActivity: Array<{ type: string; message: string; time: string; icon: any }>
}

type FilterType = 'all' | 'active' | 'screening' | 'interview' | 'urgent'

export default function TalentaiPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [metrics] = useState<DashboardMetrics>({
    totalCandidates: 2847,
    activeJobs: 24,
    interviewsScheduled: 18,
    hireRate: 34.2,
    avgTimeToHire: 28,
    candidatesSources: [
      { source: 'LinkedIn', count: 1247, percentage: 43.8 },
      { source: 'Company Website', count: 854, percentage: 30.0 },
      { source: 'Job Boards', count: 456, percentage: 16.0 },
      { source: 'Referrals', count: 290, percentage: 10.2 }
    ],
    hiringFunnel: [
      { stage: 'Applications', count: 2847, percentage: 100 },
      { stage: 'Screening', count: 1423, percentage: 50 },
      { stage: 'Interviews', count: 568, percentage: 20 },
      { stage: 'Offers', count: 142, percentage: 5 },
      { stage: 'Hired', count: 97, percentage: 3.4 }
    ],
    recentActivity: [
      { type: 'interview', message: 'Interview scheduled with Sarah Chen for Senior Developer role', time: '2 hours ago', icon: Calendar },
      { type: 'application', message: 'New application received for Product Manager position', time: '4 hours ago', icon: UserCheck },
      { type: 'hire', message: 'Michael Rodriguez hired for UX Designer role', time: '6 hours ago', icon: CheckCircle },
      { type: 'job', message: 'Frontend Developer position posted to LinkedIn', time: '1 day ago', icon: Briefcase }
    ]
  })

  const [topCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      position: 'Senior Full Stack Developer',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      experience: '5+ years',
      status: 'interview',
      score: 94,
      avatar: 'SC',
      location: 'San Francisco, CA',
      salary: '$120-140k',
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      position: 'DevOps Engineer',
      skills: ['Kubernetes', 'Docker', 'Jenkins', 'AWS'],
      experience: '7+ years',
      status: 'screening',
      score: 89,
      avatar: 'MJ',
      location: 'Austin, TX',
      salary: '$130-150k',
      lastActivity: '4 hours ago'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      position: 'UX/UI Designer',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      experience: '4+ years',
      status: 'offer',
      score: 92,
      avatar: 'ER',
      location: 'New York, NY',
      salary: '$95-115k',
      lastActivity: '1 day ago'
    },
    {
      id: '4',
      name: 'David Kim',
      position: 'Data Scientist',
      skills: ['Python', 'TensorFlow', 'SQL', 'Statistics'],
      experience: '6+ years',
      status: 'interview',
      score: 87,
      avatar: 'DK',
      location: 'Seattle, WA',
      salary: '$125-145k',
      lastActivity: '3 hours ago'
    }
  ])

  const [urgentJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      type: 'full-time',
      location: 'San Francisco, CA',
      applications: 127,
      status: 'active',
      datePosted: '2024-01-15',
      priority: 'high',
      budget: '$120-140k'
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      type: 'full-time',
      location: 'Austin, TX',
      applications: 89,
      status: 'active',
      datePosted: '2024-01-18',
      priority: 'high',
      budget: '$110-130k'
    },
    {
      id: '3',
      title: 'UX Designer',
      department: 'Design',
      type: 'full-time',
      location: 'Remote',
      applications: 156,
      status: 'active',
      datePosted: '2024-01-20',
      priority: 'medium',
      budget: '$95-115k'
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
      case 'screening': return 'bg-yellow-500/20 text-yellow-400'
      case 'interview': return 'bg-blue-500/20 text-blue-400'
      case 'offer': return 'bg-purple-500/20 text-purple-400'
      case 'hired': return 'bg-green-500/20 text-green-400'
      case 'declined': return 'bg-red-500/20 text-red-400'
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

  const filteredCandidates = topCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === 'all') return matchesSearch
    return matchesSearch && candidate.status === activeFilter
  })

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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    TalentAI Dashboard
                  </h1>
                  <p className="text-xs text-slate-400">AI-powered talent acquisition platform</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{metrics.totalCandidates.toLocaleString()} Candidates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{metrics.activeJobs} Active Jobs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{metrics.interviewsScheduled} Interviews</span>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.totalCandidates.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mb-2">Total Candidates</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">+12.5%</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💼</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.activeJobs}</div>
            <div className="text-sm text-slate-400 mb-2">Active Jobs</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-blue-400 mr-1" />
              <span className="text-blue-400">+3 this week</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.interviewsScheduled}</div>
            <div className="text-sm text-slate-400 mb-2">Interviews Scheduled</div>
            <div className="flex items-center text-xs">
              <Clock className="w-3 h-3 text-purple-400 mr-1" />
              <span className="text-purple-400">Next in 2h</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.hireRate}%</div>
            <div className="text-sm text-slate-400 mb-2">Hire Rate</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">+2.1%</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metrics.avgTimeToHire}</div>
            <div className="text-sm text-slate-400 mb-2">Avg. Days to Hire</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-red-400 mr-1 rotate-180" />
              <span className="text-green-400">-3 days</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Search */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates, jobs, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Candidates</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all">
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
            <button className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Candidates Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glassmorphism rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Top Candidates</h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <span>{filteredCandidates.length} of {topCandidates.length}</span>
                  <button className="text-purple-400 hover:text-purple-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {candidate.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-semibold text-white">{candidate.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                              {candidate.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{candidate.position}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span>{candidate.location}</span>
                            <span>•</span>
                            <span>{candidate.experience}</span>
                            <span>•</span>
                            <span>{candidate.salary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-12 h-2 bg-white/20 rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                              style={{ width: `${candidate.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-white">{candidate.score}%</span>
                        </div>
                        <div className="text-xs text-slate-400">{candidate.lastActivity}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-slate-400 text-xs rounded">
                            +{candidate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar with Urgent Jobs and Recent Activity */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Urgent Jobs */}
            <div className="glassmorphism rounded-xl border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Urgent Jobs</h3>
              </div>

              <div className="space-y-4">
                {urgentJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{job.title}</h4>
                      <span className={`text-xs font-medium ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{job.department} • {job.location}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{job.applications} applications</span>
                      <span className="text-slate-400">{job.budget}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glassmorphism rounded-xl border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              </div>

              <div className="space-y-4">
                {metrics.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mt-1">
                      <activity.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-1">{activity.message}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hiring Funnel Quick View */}
            <div className="glassmorphism rounded-xl border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Hiring Funnel</h3>
              </div>

              <div className="space-y-3">
                {metrics.hiringFunnel.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{stage.stage}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-white/20 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400 w-8">{stage.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
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
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Matching</h3>
              <p className="text-slate-400 text-sm">Advanced algorithms match candidates with perfect job opportunities</p>
            </motion.div>

            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-slate-400 text-sm">Monitor hiring performance and optimize your recruitment strategy</p>
            </motion.div>

            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Ready</h3>
              <p className="text-slate-400 text-sm">Scalable solution for organizations of all sizes with enterprise security</p>
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
