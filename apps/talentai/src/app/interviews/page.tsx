'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Video,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Play,
  Pause,
  RotateCcw,
  Send,
  Eye,
  Edit3,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  MessageSquare,
  Phone,
  MapPin,
  Building,
  Award,
  Brain,
  Code,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Settings,
  Mail,
  ExternalLink,
  Timer,
  Book,
  Clipboard
} from 'lucide-react'

interface Interview {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  interviewType: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'final'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  scheduledDate: string
  duration: number
  interviewer: string
  interviewerRole: string
  location?: string
  meetingLink?: string
  notes: string
  feedback?: {
    technicalScore: number
    communicationScore: number
    cultureFitScore: number
    overallRating: number
    strengths: string[]
    concerns: string[]
    recommendation: 'hire' | 'no_hire' | 'maybe' | 'pending'
    comments: string
  }
  assessments: string[]
  preparationMaterials: string[]
}

interface Assessment {
  id: string
  candidateId: string
  candidateName: string
  assessmentType: 'coding' | 'system_design' | 'behavioral' | 'portfolio' | 'case_study' | 'presentation'
  title: string
  description: string
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed' | 'expired'
  assignedDate: string
  dueDate: string
  submittedDate?: string
  timeLimit: number
  maxScore: number
  currentScore?: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  skills: string[]
  instructions: string
  resources: string[]
  feedback?: {
    score: number
    breakdown: { criterion: string; score: number; feedback: string }[]
    overallFeedback: string
    reviewer: string
    reviewDate: string
  }
}

interface InterviewAnalytics {
  totalInterviews: number
  completedThisWeek: number
  averageDuration: number
  successRate: number
  typeDistribution: Array<{ type: string; count: number; percentage: number }>
  statusDistribution: Array<{ status: string; count: number; percentage: number }>
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>
  interviewerPerformance: Array<{ interviewer: string; count: number; avgRating: number; successRate: number }>
}

type ViewMode = 'calendar' | 'list' | 'assessments' | 'analytics'
type FilterType = 'all' | 'today' | 'this_week' | 'scheduled' | 'completed' | 'pending_feedback'

export default function InterviewsAssessmentsPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [interviewAnalytics] = useState<InterviewAnalytics>({
    totalInterviews: 156,
    completedThisWeek: 28,
    averageDuration: 45,
    successRate: 73.2,
    typeDistribution: [
      { type: 'Technical', count: 62, percentage: 39.7 },
      { type: 'Behavioral', count: 45, percentage: 28.8 },
      { type: 'Final', count: 28, percentage: 17.9 },
      { type: 'Phone Screen', count: 21, percentage: 13.5 }
    ],
    statusDistribution: [
      { status: 'Completed', count: 98, percentage: 62.8 },
      { status: 'Scheduled', count: 34, percentage: 21.8 },
      { status: 'In Progress', count: 12, percentage: 7.7 },
      { status: 'Pending Feedback', count: 12, percentage: 7.7 }
    ],
    ratingDistribution: [
      { rating: 5, count: 23, percentage: 23.5 },
      { rating: 4, count: 31, percentage: 31.6 },
      { rating: 3, count: 28, percentage: 28.6 },
      { rating: 2, count: 12, percentage: 12.2 },
      { rating: 1, count: 4, percentage: 4.1 }
    ],
    interviewerPerformance: [
      { interviewer: 'Sarah Johnson', count: 24, avgRating: 4.3, successRate: 78.5 },
      { interviewer: 'Mike Chen', count: 19, avgRating: 4.1, successRate: 74.2 },
      { interviewer: 'Emily Davis', count: 22, avgRating: 4.5, successRate: 81.3 },
      { interviewer: 'David Wilson', count: 16, avgRating: 3.9, successRate: 68.7 }
    ]
  })

  const [interviews] = useState<Interview[]>([
    {
      id: '1',
      candidateId: 'c1',
      candidateName: 'Sarah Chen',
      candidateEmail: 'sarah.chen@email.com',
      jobTitle: 'Senior Full Stack Developer',
      interviewType: 'technical',
      status: 'scheduled',
      scheduledDate: '2024-01-25T14:00:00Z',
      duration: 60,
      interviewer: 'Mike Johnson',
      interviewerRole: 'Tech Lead',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      notes: 'Focus on React and Node.js experience',
      assessments: ['coding-challenge-1', 'system-design-1'],
      preparationMaterials: ['React Documentation', 'System Design Primer'],
      feedback: {
        technicalScore: 9,
        communicationScore: 8,
        cultureFitScore: 9,
        overallRating: 4,
        strengths: ['Strong React skills', 'Good problem-solving', 'Clear communication'],
        concerns: ['Limited backend experience'],
        recommendation: 'hire',
        comments: 'Excellent candidate with strong technical skills and great cultural fit.'
      }
    },
    {
      id: '2',
      candidateId: 'c2',
      candidateName: 'Marcus Johnson',
      candidateEmail: 'marcus.j@email.com',
      jobTitle: 'DevOps Engineer',
      interviewType: 'phone',
      status: 'completed',
      scheduledDate: '2024-01-24T10:00:00Z',
      duration: 30,
      interviewer: 'Sarah Johnson',
      interviewerRole: 'HR Manager',
      notes: 'Initial phone screening',
      assessments: ['devops-assessment-1'],
      preparationMaterials: ['Company Overview', 'DevOps Role Description'],
      feedback: {
        technicalScore: 8,
        communicationScore: 7,
        cultureFitScore: 8,
        overallRating: 4,
        strengths: ['Strong DevOps background', 'Good communication'],
        concerns: ['Need to assess Kubernetes skills further'],
        recommendation: 'maybe',
        comments: 'Good initial screening. Proceed to technical interview.'
      }
    },
    {
      id: '3',
      candidateId: 'c3',
      candidateName: 'Emily Rodriguez',
      candidateEmail: 'emily.rodriguez@email.com',
      jobTitle: 'UX/UI Designer',
      interviewType: 'final',
      status: 'in_progress',
      scheduledDate: '2024-01-25T16:00:00Z',
      duration: 90,
      interviewer: 'Lisa Wong',
      interviewerRole: 'Design Director',
      location: 'Conference Room A',
      notes: 'Portfolio presentation and final interview',
      assessments: ['design-portfolio-review', 'design-challenge'],
      preparationMaterials: ['Design System Guidelines', 'Company Design Principles']
    },
    {
      id: '4',
      candidateId: 'c4',
      candidateName: 'David Kim',
      candidateEmail: 'david.kim@email.com',
      jobTitle: 'Senior Data Scientist',
      interviewType: 'behavioral',
      status: 'scheduled',
      scheduledDate: '2024-01-26T11:00:00Z',
      duration: 45,
      interviewer: 'Emily Davis',
      interviewerRole: 'Hiring Manager',
      meetingLink: 'https://zoom.us/j/123456789',
      notes: 'Focus on leadership and team collaboration',
      assessments: ['data-science-case-study'],
      preparationMaterials: ['Leadership Scenarios', 'Team Collaboration Examples']
    }
  ])

  const [assessments] = useState<Assessment[]>([
    {
      id: 'a1',
      candidateId: 'c1',
      candidateName: 'Sarah Chen',
      assessmentType: 'coding',
      title: 'Full Stack Development Challenge',
      description: 'Build a React application with Node.js backend',
      status: 'submitted',
      assignedDate: '2024-01-20T09:00:00Z',
      dueDate: '2024-01-23T23:59:59Z',
      submittedDate: '2024-01-22T18:30:00Z',
      timeLimit: 180,
      maxScore: 100,
      currentScore: 92,
      difficulty: 'medium',
      skills: ['React', 'Node.js', 'TypeScript', 'API Design'],
      instructions: 'Create a task management application with authentication and real-time updates',
      resources: ['API Documentation', 'Design Mockups', 'Starter Code'],
      feedback: {
        score: 92,
        breakdown: [
          { criterion: 'Code Quality', score: 95, feedback: 'Excellent code structure and best practices' },
          { criterion: 'Functionality', score: 90, feedback: 'All requirements met with bonus features' },
          { criterion: 'Performance', score: 88, feedback: 'Good optimization, minor improvements possible' },
          { criterion: 'Testing', score: 95, feedback: 'Comprehensive test coverage' }
        ],
        overallFeedback: 'Outstanding submission demonstrating strong full-stack capabilities.',
        reviewer: 'Mike Johnson',
        reviewDate: '2024-01-23T14:00:00Z'
      }
    },
    {
      id: 'a2',
      candidateId: 'c2',
      candidateName: 'Marcus Johnson',
      assessmentType: 'system_design',
      title: 'DevOps Infrastructure Design',
      description: 'Design a scalable CI/CD pipeline for microservices',
      status: 'in_progress',
      assignedDate: '2024-01-24T12:00:00Z',
      dueDate: '2024-01-26T23:59:59Z',
      timeLimit: 120,
      maxScore: 100,
      difficulty: 'hard',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Monitoring'],
      instructions: 'Design a complete DevOps solution for a microservices architecture',
      resources: ['Architecture Guidelines', 'Best Practices Document', 'Tool Comparison']
    },
    {
      id: 'a3',
      candidateId: 'c3',
      candidateName: 'Emily Rodriguez',
      assessmentType: 'portfolio',
      title: 'UX Design Portfolio Review',
      description: 'Present your best UX design projects and case studies',
      status: 'reviewed',
      assignedDate: '2024-01-18T10:00:00Z',
      dueDate: '2024-01-22T17:00:00Z',
      submittedDate: '2024-01-21T15:45:00Z',
      timeLimit: 60,
      maxScore: 100,
      currentScore: 88,
      difficulty: 'medium',
      skills: ['User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      instructions: 'Present 3-4 case studies showing your design process and impact',
      resources: ['Portfolio Guidelines', 'Presentation Template', 'Evaluation Criteria'],
      feedback: {
        score: 88,
        breakdown: [
          { criterion: 'Design Process', score: 90, feedback: 'Clear methodology and user-centered approach' },
          { criterion: 'Visual Design', score: 92, feedback: 'Excellent visual hierarchy and aesthetics' },
          { criterion: 'Problem Solving', score: 85, feedback: 'Good solutions, could show more iteration' },
          { criterion: 'Presentation', score: 85, feedback: 'Clear communication, engaging delivery' }
        ],
        overallFeedback: 'Strong portfolio demonstrating solid UX design capabilities and thinking.',
        reviewer: 'Lisa Wong',
        reviewDate: '2024-01-22T10:30:00Z'
      }
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      case 'in_progress': return 'bg-orange-500/20 text-orange-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      case 'rescheduled': return 'bg-yellow-500/20 text-yellow-400'
      case 'submitted': return 'bg-purple-500/20 text-purple-400'
      case 'reviewed': return 'bg-green-500/20 text-green-400'
      case 'assigned': return 'bg-blue-500/20 text-blue-400'
      case 'expired': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return Phone
      case 'video': return Video
      case 'onsite': return Building
      case 'technical': return Code
      case 'behavioral': return MessageSquare
      case 'final': return Award
      case 'coding': return Code
      case 'system_design': return BarChart3
      case 'portfolio': return Eye
      case 'case_study': return FileText
      case 'presentation': return Play
      default: return Calendar
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-orange-400'
      case 'expert': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-blue-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'today') {
      const today = new Date().toDateString()
      return matchesSearch && new Date(interview.scheduledDate).toDateString() === today
    }
    if (activeFilter === 'this_week') {
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      const interviewDate = new Date(interview.scheduledDate)
      return matchesSearch && interviewDate >= new Date() && interviewDate <= weekFromNow
    }
    if (activeFilter === 'pending_feedback') {
      return matchesSearch && interview.status === 'completed' && !interview.feedback
    }
    return matchesSearch && interview.status === activeFilter
  })

  const upcomingInterviews = interviews.filter(interview =>
    interview.status === 'scheduled' && new Date(interview.scheduledDate) > new Date()
  ).slice(0, 5)

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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Interviews & Assessments
                  </h1>
                  <p className="text-xs text-slate-400">Manage interview scheduling and skill assessments</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{interviewAnalytics.totalInterviews} Total Interviews</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{interviewAnalytics.completedThisWeek} This Week</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{interviewAnalytics.successRate}% Success Rate</span>
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
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{interviewAnalytics.totalInterviews}</div>
            <div className="text-sm text-slate-400 mb-2">Total Interviews</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">+{interviewAnalytics.completedThisWeek} this week</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{interviewAnalytics.successRate}%</div>
            <div className="text-sm text-slate-400 mb-2">Success Rate</div>
            <div className="flex items-center text-xs">
              <Target className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">Above target</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{interviewAnalytics.averageDuration}min</div>
            <div className="text-sm text-slate-400 mb-2">Avg Duration</div>
            <div className="flex items-center text-xs">
              <Clock className="w-3 h-3 text-blue-400 mr-1" />
              <span className="text-blue-400">Optimal timing</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">📝</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{assessments.length}</div>
            <div className="text-sm text-slate-400 mb-2">Active Assessments</div>
            <div className="flex items-center text-xs">
              <Activity className="w-3 h-3 text-orange-400 mr-1" />
              <span className="text-orange-400">{assessments.filter(a => a.status === 'in_progress').length} in progress</span>
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
                placeholder="Search interviews, candidates..."
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
                <option value="all">All Interviews</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="pending_feedback">Pending Feedback</option>
              </select>
            </div>

            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('assessments')}
                className={`p-2 rounded ${viewMode === 'assessments' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`p-2 rounded ${viewMode === 'analytics' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all">
              <Plus className="w-4 h-4" />
              <span>Schedule Interview</span>
            </button>
          </div>
        </motion.div>

        {/* Interview Listings */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredInterviews.map((interview, index) => {
                const TypeIcon = getTypeIcon(interview.interviewType)
                return (
                  <motion.div
                    key={interview.id}
                    className="glassmorphism rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{interview.candidateName}</h3>
                          <p className="text-sm text-slate-300">{interview.jobTitle}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(interview.scheduledDate).toLocaleDateString()}</span>
                        <Clock className="w-4 h-4 text-slate-400 ml-4" />
                        <span>{new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{interview.interviewer} ({interview.interviewerRole})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <Timer className="w-4 h-4 text-slate-400" />
                        <span>{interview.duration} minutes</span>
                        <span className="text-slate-400">•</span>
                        <span className="capitalize">{interview.interviewType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {interview.feedback && (
                      <div className="bg-white/5 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Feedback</span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= interview.feedback!.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(interview.feedback.technicalScore * 10)}`}>
                              {interview.feedback.technicalScore}/10
                            </div>
                            <div className="text-slate-400">Technical</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(interview.feedback.communicationScore * 10)}`}>
                              {interview.feedback.communicationScore}/10
                            </div>
                            <div className="text-slate-400">Communication</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(interview.feedback.cultureFitScore * 10)}`}>
                              {interview.feedback.cultureFitScore}/10
                            </div>
                            <div className="text-slate-400">Culture Fit</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        {interview.meetingLink && (
                          <button className="p-1 text-slate-400 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1 text-slate-400 hover:text-white transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400">
                        {interview.assessments.length} assessment{interview.assessments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
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
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-slate-400 text-sm">Automated interview scheduling with calendar integration and conflict resolution</p>
            </motion.div>

            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Assessments</h3>
              <p className="text-slate-400 text-sm">Intelligent skill assessments with automated scoring and detailed feedback</p>
            </motion.div>

            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance Analytics</h3>
              <p className="text-slate-400 text-sm">Comprehensive interview analytics with success rate tracking and insights</p>
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
