'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Crown,
  Star,
  Mail,
  Phone,
  Calendar,
  Clock,
  Activity,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Video,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Plus,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Brain,
  Briefcase,
  MapPin,
  Building,
  GraduationCap
} from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'coordinator' | 'analyst'
  department: string
  location: string
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  permissions: string[]
  performance: {
    candidatesManaged: number
    successfulHires: number
    avgTimeToHire: number
    satisfactionScore: number
    monthlyGoal: number
    currentProgress: number
  }
  workload: {
    activeCandidates: number
    upcomingInterviews: number
    pendingTasks: number
    capacity: number
  }
  skills: string[]
  certifications: string[]
  recentActivity: Array<{
    action: string
    timestamp: string
    details: string
  }>
}

interface TeamAnalytics {
  totalMembers: number
  activeMembers: number
  avgPerformance: number
  teamCapacity: number
  departmentDistribution: Array<{ department: string; count: number; percentage: number }>
  roleDistribution: Array<{ role: string; count: number; percentage: number }>
  performanceMetrics: Array<{ metric: string; value: number; target: number; status: 'good' | 'warning' | 'critical' }>
  workloadDistribution: Array<{ memberId: string; name: string; workload: number; capacity: number }>
}

type ViewMode = 'grid' | 'list' | 'org-chart' | 'analytics'
type FilterType = 'all' | 'admin' | 'recruiter' | 'hiring_manager' | 'coordinator' | 'analyst'

export default function TeamManagementPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const [teamAnalytics] = useState<TeamAnalytics>({
    totalMembers: 12,
    activeMembers: 11,
    avgPerformance: 87.3,
    teamCapacity: 78.5,
    departmentDistribution: [
      { department: 'Recruitment', count: 6, percentage: 50 },
      { department: 'Talent Acquisition', count: 3, percentage: 25 },
      { department: 'HR Operations', count: 2, percentage: 16.7 },
      { department: 'Analytics', count: 1, percentage: 8.3 }
    ],
    roleDistribution: [
      { role: 'Recruiter', count: 5, percentage: 41.7 },
      { role: 'Hiring Manager', count: 3, percentage: 25 },
      { role: 'Coordinator', count: 2, percentage: 16.7 },
      { role: 'Admin', count: 1, percentage: 8.3 },
      { role: 'Analyst', count: 1, percentage: 8.3 }
    ],
    performanceMetrics: [
      { metric: 'Avg. Time to Hire', value: 18.5, target: 20, status: 'good' },
      { metric: 'Hire Success Rate', value: 87, target: 85, status: 'good' },
      { metric: 'Candidate Satisfaction', value: 4.6, target: 4.5, status: 'good' },
      { metric: 'Team Utilization', value: 78, target: 80, status: 'warning' }
    ],
    workloadDistribution: [
      { memberId: '1', name: 'Sarah Johnson', workload: 85, capacity: 100 },
      { memberId: '2', name: 'Mike Chen', workload: 92, capacity: 100 },
      { memberId: '3', name: 'Emily Davis', workload: 76, capacity: 100 },
      { memberId: '4', name: 'David Wilson', workload: 68, capacity: 100 }
    ]
  })

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      avatar: 'SJ',
      role: 'admin',
      department: 'Recruitment',
      location: 'San Francisco, CA',
      joinDate: '2022-03-15',
      status: 'active',
      permissions: ['manage_team', 'view_analytics', 'export_data', 'system_settings'],
      performance: {
        candidatesManaged: 456,
        successfulHires: 23,
        avgTimeToHire: 15.2,
        satisfactionScore: 4.8,
        monthlyGoal: 25,
        currentProgress: 92
      },
      workload: {
        activeCandidates: 34,
        upcomingInterviews: 8,
        pendingTasks: 12,
        capacity: 100
      },
      skills: ['Talent Sourcing', 'Interview Coordination', 'Team Leadership', 'Analytics'],
      certifications: ['SHRM-CP', 'LinkedIn Recruiter', 'Agile HR'],
      recentActivity: [
        { action: 'Completed interview', timestamp: '2 hours ago', details: 'Frontend Developer position' },
        { action: 'Updated candidate status', timestamp: '4 hours ago', details: 'Advanced 3 candidates to next stage' },
        { action: 'Team meeting', timestamp: '1 day ago', details: 'Weekly recruitment review' }
      ]
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@company.com',
      phone: '+1 (555) 234-5678',
      avatar: 'MC',
      role: 'recruiter',
      department: 'Talent Acquisition',
      location: 'Austin, TX',
      joinDate: '2021-07-22',
      status: 'active',
      permissions: ['manage_candidates', 'schedule_interviews', 'view_reports'],
      performance: {
        candidatesManaged: 389,
        successfulHires: 19,
        avgTimeToHire: 17.8,
        satisfactionScore: 4.6,
        monthlyGoal: 20,
        currentProgress: 95
      },
      workload: {
        activeCandidates: 42,
        upcomingInterviews: 6,
        pendingTasks: 8,
        capacity: 100
      },
      skills: ['Technical Recruiting', 'Candidate Screening', 'Negotiation', 'CRM Management'],
      certifications: ['Certified Talent Acquisition Professional', 'Boolean Search Expert'],
      recentActivity: [
        { action: 'Sourced new candidates', timestamp: '1 hour ago', details: 'Added 5 new DevOps candidates' },
        { action: 'Conducted screening call', timestamp: '3 hours ago', details: 'Senior React Developer' },
        { action: 'Updated job posting', timestamp: '6 hours ago', details: 'Backend Engineer position' }
      ]
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 345-6789',
      avatar: 'ED',
      role: 'hiring_manager',
      department: 'Recruitment',
      location: 'New York, NY',
      joinDate: '2020-11-08',
      status: 'active',
      permissions: ['approve_offers', 'final_interviews', 'team_decisions'],
      performance: {
        candidatesManaged: 367,
        successfulHires: 18,
        avgTimeToHire: 19.3,
        satisfactionScore: 4.5,
        monthlyGoal: 20,
        currentProgress: 90
      },
      workload: {
        activeCandidates: 28,
        upcomingInterviews: 4,
        pendingTasks: 6,
        capacity: 100
      },
      skills: ['Leadership Hiring', 'Cultural Assessment', 'Strategic Planning', 'Team Building'],
      certifications: ['People Management', 'Leadership Assessment', 'Diversity & Inclusion'],
      recentActivity: [
        { action: 'Approved job offer', timestamp: '30 minutes ago', details: 'UX Designer position' },
        { action: 'Final interview completed', timestamp: '2 hours ago', details: 'Product Manager candidate' },
        { action: 'Strategy meeting', timestamp: '4 hours ago', details: 'Q2 hiring planning' }
      ]
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@company.com',
      phone: '+1 (555) 456-7890',
      avatar: 'DW',
      role: 'coordinator',
      department: 'HR Operations',
      location: 'Seattle, WA',
      joinDate: '2023-01-12',
      status: 'active',
      permissions: ['schedule_interviews', 'coordinate_logistics', 'candidate_communication'],
      performance: {
        candidatesManaged: 298,
        successfulHires: 14,
        avgTimeToHire: 21.1,
        satisfactionScore: 4.3,
        monthlyGoal: 15,
        currentProgress: 93
      },
      workload: {
        activeCandidates: 22,
        upcomingInterviews: 12,
        pendingTasks: 4,
        capacity: 100
      },
      skills: ['Interview Coordination', 'Candidate Experience', 'Process Optimization', 'Communication'],
      certifications: ['Project Management', 'Customer Service Excellence'],
      recentActivity: [
        { action: 'Scheduled interviews', timestamp: '45 minutes ago', details: '6 interviews for this week' },
        { action: 'Candidate follow-up', timestamp: '2 hours ago', details: 'Post-interview feedback collection' },
        { action: 'Process update', timestamp: '5 hours ago', details: 'Interview scheduling workflow' }
      ]
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400'
      case 'recruiter': return 'bg-blue-500/20 text-blue-400'
      case 'hiring_manager': return 'bg-purple-500/20 text-purple-400'
      case 'coordinator': return 'bg-green-500/20 text-green-400'
      case 'analyst': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown
      case 'recruiter': return Users
      case 'hiring_manager': return Shield
      case 'coordinator': return Calendar
      case 'analyst': return BarChart3
      default: return Users
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getPerformanceColor = (progress: number) => {
    if (progress >= 90) return 'text-green-400'
    if (progress >= 70) return 'text-blue-400'
    if (progress >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeFilter === 'all') return matchesSearch
    return matchesSearch && member.role === activeFilter
  })

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on members:`, selectedMembers)
    setSelectedMembers([])
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
                    Team Management
                  </h1>
                  <p className="text-xs text-slate-400">Manage your recruitment team and roles</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{teamAnalytics.totalMembers} Total Members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{teamAnalytics.activeMembers} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{teamAnalytics.avgPerformance}% Avg Performance</span>
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
        {/* Team Overview Metrics */}
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
            <div className="text-2xl font-bold text-white mb-1">{teamAnalytics.totalMembers}</div>
            <div className="text-sm text-slate-400 mb-2">Team Members</div>
            <div className="flex items-center text-xs">
              <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">{teamAnalytics.activeMembers} active</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{teamAnalytics.avgPerformance}%</div>
            <div className="text-sm text-slate-400 mb-2">Avg Performance</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">+5.2% this month</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{teamAnalytics.teamCapacity}%</div>
            <div className="text-sm text-slate-400 mb-2">Team Capacity</div>
            <div className="flex items-center text-xs">
              <Activity className="w-3 h-3 text-blue-400 mr-1" />
              <span className="text-blue-400">Optimal utilization</span>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">89%</div>
            <div className="text-sm text-slate-400 mb-2">Goal Achievement</div>
            <div className="flex items-center text-xs">
              <Target className="w-3 h-3 text-green-400 mr-1" />
              <span className="text-green-400">Above target</span>
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
                placeholder="Search team members..."
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
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="coordinator">Coordinator</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>

            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <FileText className="w-4 h-4" />
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
            {selectedMembers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">{selectedMembers.length} selected</span>
                <button
                  onClick={() => handleBulkAction('message')}
                  className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30 transition-all"
                >
                  Message
                </button>
                <button
                  onClick={() => handleBulkAction('assign')}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-all"
                >
                  Assign
                </button>
              </div>
            )}
            <button className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all">
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </motion.div>

        {/* Team Member Grid */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredMembers.map((member, index) => {
                const RoleIcon = getRoleIcon(member.role)
                return (
                  <motion.div
                    key={member.id}
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
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleMemberSelection(member.id)}
                          className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.avatar}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role.replace('_', ' ')}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-slate-300 mb-2">{member.department}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{member.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {new Date(member.joinDate).getFullYear()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{member.performance.successfulHires}</div>
                        <div className="text-xs text-slate-400">Hires</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{member.performance.avgTimeToHire}d</div>
                        <div className="text-xs text-slate-400">Avg. Time</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Goal Progress</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(member.performance.currentProgress)}`}>
                          {member.performance.currentProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-1000"
                          style={{ width: `${member.performance.currentProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-400">
                          {member.workload.activeCandidates} active candidates
                        </span>
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-slate-400 text-sm">Enhanced team coordination with real-time communication and task management</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance Tracking</h3>
              <p className="text-slate-400 text-sm">Comprehensive performance monitoring with goal tracking and analytics</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Role Management</h3>
              <p className="text-slate-400 text-sm">Advanced permission system with role-based access and security controls</p>
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
