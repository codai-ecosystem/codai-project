'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  UserCheck,
  UserX,
  Download,
  Upload,
  Plus,
  Edit3,
  Share2,
  Award,
  Target,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Video,
  Settings,
  ChevronDown,
  ArrowUpRight,
  BookOpen,
  Code,
  Database,
  Gauge
} from 'lucide-react'

interface CandidateProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  avatar: string
  currentRole: string
  experience: string
  expectedSalary: number
  currency: string
  availability: string
  status: 'new' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected' | 'withdrawn'
  priority: 'high' | 'medium' | 'low'
  source: string
  appliedDate: string
  lastActivity: string
  appliedJobs: Array<{ jobId: string; jobTitle: string; status: string; appliedDate: string }>
  skills: Array<{ name: string; level: number; verified: boolean }>
  education: Array<{ degree: string; school: string; year: string; gpa?: string }>
  experience_details: Array<{ company: string; role: string; duration: string; description: string }>
  assessments: Array<{ type: string; score: number; completedDate: string; status: string }>
  interviews: Array<{ type: string; date: string; interviewer: string; status: string; feedback?: string }>
  documents: Array<{ type: string; name: string; uploadDate: string; verified: boolean }>
  aiMatchScore: number
  cultureFitScore: number
  technicalScore: number
  communicationScore: number
  notes: string[]
  tags: string[]
  recruiterNotes: string
  nextAction: string
  actionDueDate: string
}

interface CandidateAnalytics {
  totalCandidates: number
  newCandidates: number
  inProgress: number
  hired: number
  averageTime: number
  conversionRate: number
  topSources: Array<{ source: string; count: number; percentage: number }>
  skillsAnalysis: Array<{ skill: string; count: number; avgLevel: number }>
  pipelineMetrics: Array<{ stage: string; count: number; percentage: number }>
  geographicDistribution: Array<{ location: string; count: number; percentage: number }>
}

type CandidateFilter = 'all' | 'new' | 'screening' | 'interview' | 'assessment' | 'offer' | 'high-priority'
type ViewMode = 'grid' | 'list' | 'pipeline' | 'analytics'
type SortOption = 'newest' | 'match-score' | 'last-activity' | 'alphabetical'

export default function CandidatesPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeFilter, setActiveFilter] = useState<CandidateFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  const [candidateAnalytics] = useState<CandidateAnalytics>({
    totalCandidates: 2847,
    newCandidates: 156,
    inProgress: 1423,
    hired: 97,
    averageTime: 18.5,
    conversionRate: 34.2,
    topSources: [
      { source: 'LinkedIn', count: 1247, percentage: 43.8 },
      { source: 'Company Website', count: 854, percentage: 30.0 },
      { source: 'Job Boards', count: 456, percentage: 16.0 },
      { source: 'Referrals', count: 290, percentage: 10.2 }
    ],
    skillsAnalysis: [
      { skill: 'JavaScript', count: 567, avgLevel: 7.8 },
      { skill: 'React', count: 423, avgLevel: 7.2 },
      { skill: 'Python', count: 389, avgLevel: 6.9 },
      { skill: 'Node.js', count: 334, avgLevel: 7.1 }
    ],
    pipelineMetrics: [
      { stage: 'Applied', count: 2847, percentage: 100 },
      { stage: 'Screening', count: 1423, percentage: 50 },
      { stage: 'Interview', count: 568, percentage: 20 },
      { stage: 'Assessment', count: 284, percentage: 10 },
      { stage: 'Offer', count: 142, percentage: 5 },
      { stage: 'Hired', count: 97, percentage: 3.4 }
    ],
    geographicDistribution: [
      { location: 'San Francisco Bay Area', count: 643, percentage: 22.6 },
      { location: 'New York', count: 512, percentage: 18.0 },
      { location: 'Austin', count: 341, percentage: 12.0 },
      { location: 'Seattle', count: 298, percentage: 10.5 }
    ]
  })

  const [candidates] = useState<CandidateProfile[]>([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      avatar: 'SC',
      currentRole: 'Senior Software Engineer',
      experience: '5+ years',
      expectedSalary: 140000,
      currency: 'USD',
      availability: 'Immediate',
      status: 'interview',
      priority: 'high',
      source: 'LinkedIn',
      appliedDate: '2024-01-15',
      lastActivity: '2 hours ago',
      appliedJobs: [
        { jobId: '1', jobTitle: 'Senior Full Stack Developer', status: 'interview', appliedDate: '2024-01-15' }
      ],
      skills: [
        { name: 'React', level: 9, verified: true },
        { name: 'Node.js', level: 8, verified: true },
        { name: 'TypeScript', level: 8, verified: false },
        { name: 'AWS', level: 7, verified: true }
      ],
      education: [
        { degree: 'MS Computer Science', school: 'Stanford University', year: '2019', gpa: '3.8' },
        { degree: 'BS Computer Engineering', school: 'UC Berkeley', year: '2017', gpa: '3.7' }
      ],
      experience_details: [
        { company: 'Meta', role: 'Senior Software Engineer', duration: '2021-Present', description: 'Lead development of React-based web applications' },
        { company: 'Google', role: 'Software Engineer', duration: '2019-2021', description: 'Developed scalable backend services using Go and Python' }
      ],
      assessments: [
        { type: 'Technical Coding', score: 94, completedDate: '2024-01-16', status: 'completed' },
        { type: 'System Design', score: 87, completedDate: '2024-01-17', status: 'completed' }
      ],
      interviews: [
        { type: 'Phone Screen', date: '2024-01-18', interviewer: 'Mike Johnson', status: 'completed', feedback: 'Strong technical skills, good communication' }
      ],
      documents: [
        { type: 'Resume', name: 'Sarah_Chen_Resume.pdf', uploadDate: '2024-01-15', verified: true },
        { type: 'Portfolio', name: 'Portfolio_Website.url', uploadDate: '2024-01-15', verified: true }
      ],
      aiMatchScore: 94,
      cultureFitScore: 88,
      technicalScore: 92,
      communicationScore: 90,
      notes: ['Excellent technical background', 'Strong leadership potential', 'Available immediately'],
      tags: ['React Expert', 'Full Stack', 'Stanford Alumni', 'Meta Experience'],
      recruiterNotes: 'Top candidate for senior roles. Strong technical skills and culture fit.',
      nextAction: 'Schedule final interview',
      actionDueDate: '2024-01-25'
    },
    {
      id: '2',
      firstName: 'Marcus',
      lastName: 'Johnson',
      email: 'marcus.j@email.com',
      phone: '+1 (555) 234-5678',
      location: 'Austin, TX',
      avatar: 'MJ',
      currentRole: 'DevOps Engineer',
      experience: '7+ years',
      expectedSalary: 150000,
      currency: 'USD',
      availability: '2 weeks notice',
      status: 'screening',
      priority: 'high',
      source: 'Company Website',
      appliedDate: '2024-01-18',
      lastActivity: '4 hours ago',
      appliedJobs: [
        { jobId: '4', jobTitle: 'DevOps Engineer', status: 'screening', appliedDate: '2024-01-18' }
      ],
      skills: [
        { name: 'Kubernetes', level: 9, verified: true },
        { name: 'Docker', level: 9, verified: true },
        { name: 'AWS', level: 8, verified: true },
        { name: 'Terraform', level: 7, verified: false }
      ],
      education: [
        { degree: 'BS Computer Science', school: 'UT Austin', year: '2017' }
      ],
      experience_details: [
        { company: 'Netflix', role: 'Senior DevOps Engineer', duration: '2020-Present', description: 'Managing cloud infrastructure and CI/CD pipelines' },
        { company: 'Spotify', role: 'DevOps Engineer', duration: '2018-2020', description: 'Automated deployment processes and monitoring systems' }
      ],
      assessments: [
        { type: 'Infrastructure Design', score: 0, completedDate: '', status: 'pending' }
      ],
      interviews: [],
      documents: [
        { type: 'Resume', name: 'Marcus_Johnson_Resume.pdf', uploadDate: '2024-01-18', verified: true }
      ],
      aiMatchScore: 89,
      cultureFitScore: 85,
      technicalScore: 91,
      communicationScore: 82,
      notes: ['Strong DevOps background', 'Netflix experience valuable'],
      tags: ['Kubernetes Expert', 'Cloud Native', 'Netflix Alumni'],
      recruiterNotes: 'Excellent DevOps candidate with strong cloud experience.',
      nextAction: 'Technical phone screen',
      actionDueDate: '2024-01-22'
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 345-6789',
      location: 'New York, NY',
      avatar: 'ER',
      currentRole: 'UX Designer',
      experience: '4+ years',
      expectedSalary: 105000,
      currency: 'USD',
      availability: '1 month notice',
      status: 'offer',
      priority: 'medium',
      source: 'Dribbble',
      appliedDate: '2024-01-10',
      lastActivity: '1 day ago',
      appliedJobs: [
        { jobId: '3', jobTitle: 'UX/UI Designer', status: 'offer', appliedDate: '2024-01-10' }
      ],
      skills: [
        { name: 'Figma', level: 9, verified: true },
        { name: 'User Research', level: 8, verified: true },
        { name: 'Prototyping', level: 8, verified: false },
        { name: 'Design Systems', level: 7, verified: true }
      ],
      education: [
        { degree: 'MFA Design', school: 'Parsons School of Design', year: '2020' }
      ],
      experience_details: [
        { company: 'Airbnb', role: 'Senior UX Designer', duration: '2021-Present', description: 'Lead UX design for host experience platform' },
        { company: 'Uber', role: 'UX Designer', duration: '2020-2021', description: 'Designed rider and driver mobile experiences' }
      ],
      assessments: [
        { type: 'Design Portfolio Review', score: 92, completedDate: '2024-01-12', status: 'completed' },
        { type: 'Design Challenge', score: 88, completedDate: '2024-01-14', status: 'completed' }
      ],
      interviews: [
        { type: 'Portfolio Review', date: '2024-01-12', interviewer: 'Lisa Wong', status: 'completed', feedback: 'Excellent design thinking and user-centered approach' },
        { type: 'Team Interview', date: '2024-01-19', interviewer: 'Design Team', status: 'completed', feedback: 'Great culture fit, strong collaboration skills' }
      ],
      documents: [
        { type: 'Resume', name: 'Emily_Rodriguez_Resume.pdf', uploadDate: '2024-01-10', verified: true },
        { type: 'Portfolio', name: 'Design_Portfolio.pdf', uploadDate: '2024-01-10', verified: true }
      ],
      aiMatchScore: 92,
      cultureFitScore: 94,
      technicalScore: 88,
      communicationScore: 93,
      notes: ['Exceptional design portfolio', 'Strong user research skills', 'Great culture fit'],
      tags: ['UX Expert', 'Airbnb Experience', 'User Research', 'Design Systems'],
      recruiterNotes: 'Outstanding designer with strong portfolio. Ready for offer.',
      nextAction: 'Prepare offer letter',
      actionDueDate: '2024-01-23'
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      avatar: 'DK',
      currentRole: 'Data Scientist',
      experience: '6+ years',
      expectedSalary: 135000,
      currency: 'USD',
      availability: 'Flexible',
      status: 'assessment',
      priority: 'medium',
      source: 'Job Board',
      appliedDate: '2024-01-20',
      lastActivity: '3 hours ago',
      appliedJobs: [
        { jobId: '5', jobTitle: 'Senior Data Scientist', status: 'assessment', appliedDate: '2024-01-20' }
      ],
      skills: [
        { name: 'Python', level: 9, verified: true },
        { name: 'Machine Learning', level: 8, verified: true },
        { name: 'SQL', level: 8, verified: true },
        { name: 'TensorFlow', level: 7, verified: false }
      ],
      education: [
        { degree: 'PhD Statistics', school: 'University of Washington', year: '2018' }
      ],
      experience_details: [
        { company: 'Microsoft', role: 'Senior Data Scientist', duration: '2019-Present', description: 'Developed ML models for Azure AI services' },
        { company: 'Amazon', role: 'Data Scientist', duration: '2018-2019', description: 'Built recommendation systems for e-commerce platform' }
      ],
      assessments: [
        { type: 'Data Science Challenge', score: 0, completedDate: '', status: 'in-progress' }
      ],
      interviews: [
        { type: 'Phone Screen', date: '2024-01-21', interviewer: 'Tech Lead', status: 'completed', feedback: 'Strong analytical skills, good problem-solving approach' }
      ],
      documents: [
        { type: 'Resume', name: 'David_Kim_Resume.pdf', uploadDate: '2024-01-20', verified: true }
      ],
      aiMatchScore: 87,
      cultureFitScore: 83,
      technicalScore: 89,
      communicationScore: 85,
      notes: ['Strong ML background', 'PhD in Statistics', 'Microsoft experience'],
      tags: ['Data Science', 'Machine Learning', 'PhD', 'Microsoft Alumni'],
      recruiterNotes: 'Solid data science candidate with strong academic and industry background.',
      nextAction: 'Review assessment results',
      actionDueDate: '2024-01-26'
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
      case 'new': return 'bg-blue-500/20 text-blue-400'
      case 'screening': return 'bg-yellow-500/20 text-yellow-400'
      case 'interview': return 'bg-purple-500/20 text-purple-400'
      case 'assessment': return 'bg-orange-500/20 text-orange-400'
      case 'offer': return 'bg-green-500/20 text-green-400'
      case 'hired': return 'bg-emerald-500/20 text-emerald-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      case 'withdrawn': return 'bg-gray-500/20 text-gray-400'
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-blue-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'high-priority') return matchesSearch && candidate.priority === 'high'
    return matchesSearch && candidate.status === activeFilter
  })

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      case 'match-score':
        return b.aiMatchScore - a.aiMatchScore
      case 'last-activity':
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      case 'alphabetical':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      default:
        return 0
    }
  })

  const handleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on candidates:`, selectedCandidates)
    setSelectedCandidates([])
  }

  const formatSalary = (salary: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(salary)
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Candidates
                  </h1>
                  <p className="text-xs text-slate-400">Manage candidate profiles and recruitment pipeline</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{candidateAnalytics.totalCandidates.toLocaleString()} Total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{candidateAnalytics.newCandidates} New</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{candidateAnalytics.hired} Hired</span>
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{candidateAnalytics.totalCandidates.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mb-2">Total Candidates</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">+{candidateAnalytics.newCandidates} this week</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🔄</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{candidateAnalytics.inProgress.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mb-2">In Progress</div>
            <div className="flex items-center text-xs">
              <Activity className="w-3 h-3 text-blue-400 mr-1" />
              <span className="text-blue-400">{Math.round((candidateAnalytics.inProgress / candidateAnalytics.totalCandidates) * 100)}% of total</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{candidateAnalytics.hired}</div>
            <div className="text-sm text-slate-400 mb-2">Successfully Hired</div>
            <div className="flex items-center text-xs">
              <Target className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">{candidateAnalytics.conversionRate}% conversion</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{candidateAnalytics.averageTime}</div>
            <div className="text-sm text-slate-400 mb-2">Avg. Days to Hire</div>
            <div className="flex items-center text-xs">
              <Clock className="w-3 h-3 text-orange-400 mr-1" />
              <span className="text-orange-400">18% faster than industry</span>
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
                placeholder="Search candidates, skills, roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as CandidateFilter)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Candidates</option>
                <option value="new">New</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="assessment">Assessment</option>
                <option value="offer">Offer</option>
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
                <option value="match-score">Match Score</option>
                <option value="last-activity">Last Activity</option>
                <option value="alphabetical">Alphabetical</option>
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
                onClick={() => setViewMode('pipeline')}
                className={`p-2 rounded ${viewMode === 'pipeline' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Activity className="w-4 h-4" />
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
            {selectedCandidates.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">{selectedCandidates.length} selected</span>
                <button
                  onClick={() => handleBulkAction('advance')}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-all"
                >
                  Advance
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('tag')}
                  className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30 transition-all"
                >
                  Tag
                </button>
              </div>
            )}
            <button className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>
        </motion.div>

        {/* Candidate Listings */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {sortedCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
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
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateSelection(candidate.id)}
                        className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {candidate.avatar}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                      <Star className={`w-4 h-4 ${getPriorityColor(candidate.priority)}`} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-sm text-slate-300 mb-2">{candidate.currentRole}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{candidate.experience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-slate-300">
                      <span className="font-medium">{formatSalary(candidate.expectedSalary, candidate.currency)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{candidate.aiMatchScore}%</div>
                        <div className="text-xs text-slate-400">AI Match</div>
                      </div>
                      <div className="w-12 h-2 bg-white/20 rounded-full">
                        <div 
                          className={`h-full rounded-full ${candidate.aiMatchScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                            candidate.aiMatchScore >= 80 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 
                            'bg-gradient-to-r from-yellow-500 to-orange-500'}`}
                          style={{ width: `${candidate.aiMatchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {candidate.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded flex items-center space-x-1">
                        <span>{skill.name}</span>
                        {skill.verified && <CheckCircle className="w-3 h-3 text-green-400" />}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-slate-400 text-xs rounded">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getScoreColor(candidate.technicalScore)}`}>
                        {candidate.technicalScore}%
                      </div>
                      <div className="text-xs text-slate-400">Technical</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getScoreColor(candidate.cultureFitScore)}`}>
                        {candidate.cultureFitScore}%
                      </div>
                      <div className="text-xs text-slate-400">Culture Fit</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getScoreColor(candidate.communicationScore)}`}>
                        {candidate.communicationScore}%
                      </div>
                      <div className="text-xs text-slate-400">Communication</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-slate-400">
                      <div>Applied: {new Date(candidate.appliedDate).toLocaleDateString()}</div>
                      <div>Last activity: {candidate.lastActivity}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
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

          {viewMode === 'analytics' && (
            <motion.div
              key="analytics"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top Sources */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Top Candidate Sources</h3>
                <div className="space-y-4">
                  {candidateAnalytics.topSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{source.source}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-white/20 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium w-12">{source.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Metrics */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recruitment Pipeline</h3>
                <div className="space-y-4">
                  {candidateAnalytics.pipelineMetrics.map((stage, index) => (
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

              {/* Skills Analysis */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Top Skills</h3>
                <div className="space-y-4">
                  {candidateAnalytics.skillsAnalysis.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-300">{skill.skill}</span>
                        <span className="text-xs text-slate-400">({skill.avgLevel}/10 avg)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-2 bg-white/20 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${(skill.count / candidateAnalytics.totalCandidates) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium w-8">{skill.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Geographic Distribution</h3>
                <div className="space-y-4">
                  {candidateAnalytics.geographicDistribution.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{location.location}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 h-2 bg-white/20 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium w-10">{location.count}</span>
                      </div>
                    </div>
                  ))}
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
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Screening</h3>
              <p className="text-slate-400 text-sm">Intelligent candidate matching and automated screening with skill verification</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm">Comprehensive recruitment analytics and pipeline performance insights</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Skill Assessment</h3>
              <p className="text-slate-400 text-sm">Automated technical assessments and cultural fit evaluation tools</p>
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
