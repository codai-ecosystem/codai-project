'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import logger from '../../src/lib/logger'
import {
  Plus,
  Search,
  Filter,
  GitBranch,
  Users,
  Clock,
  Star,
  MoreVertical,
  Code2,
  Database,
  Globe,
  Smartphone,
  Brain,
  Zap
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  language: string
  framework: string
  type: 'web' | 'mobile' | 'api' | 'ml' | 'blockchain'
  status: 'active' | 'completed' | 'paused' | 'archived'
  commits: number
  contributors: number
  stars: number
  lastUpdate: string
  aiAssistance: number
  progress: number
  tags: string[]
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Log page load
  useEffect(() => {
    logger.logUserAction('page-visit', {
      module: 'projects',
      context: {
        page: 'projects',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    })
  }, [])

  // Enhanced search handler with logging
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value.length > 2) {
      logger.logUserAction('project-search', {
        module: 'projects',
        context: {
          searchTerm: value,
          page: 'projects'
        }
      })
    }
  }

  // Enhanced filter handlers with logging
  const handleTypeFilterChange = (value: string) => {
    setFilterType(value)
    logger.logUserAction('filter-change', {
      module: 'projects',
      context: {
        filterType: 'type',
        filterValue: value,
        page: 'projects'
      }
    })
  }

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value)
    logger.logUserAction('filter-change', {
      module: 'projects',
      context: {
        filterType: 'status',
        filterValue: value,
        page: 'projects'
      }
    })
  }

  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Modern e-commerce platform with AI-powered recommendations',
      language: 'TypeScript',
      framework: 'Next.js',
      type: 'web',
      status: 'active',
      commits: 247,
      contributors: 5,
      stars: 89,
      lastUpdate: '2 hours ago',
      aiAssistance: 87,
      progress: 75,
      tags: ['e-commerce', 'ai', 'payments']
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application with biometric authentication',
      language: 'React Native',
      framework: 'Expo',
      type: 'mobile',
      status: 'active',
      commits: 189,
      contributors: 3,
      stars: 156,
      lastUpdate: '4 hours ago',
      aiAssistance: 92,
      progress: 68,
      tags: ['fintech', 'security', 'mobile']
    },
    {
      id: '3',
      name: 'ML Analytics Dashboard',
      description: 'Machine learning analytics platform for business intelligence',
      language: 'Python',
      framework: 'FastAPI',
      type: 'ml',
      status: 'completed',
      commits: 156,
      contributors: 4,
      stars: 203,
      lastUpdate: '1 day ago',
      aiAssistance: 78,
      progress: 100,
      tags: ['ml', 'analytics', 'dashboard']
    },
    {
      id: '4',
      name: 'Blockchain Wallet',
      description: 'Decentralized wallet with multi-chain support',
      language: 'Solidity',
      framework: 'Hardhat',
      type: 'blockchain',
      status: 'active',
      commits: 98,
      contributors: 2,
      stars: 67,
      lastUpdate: '2 days ago',
      aiAssistance: 95,
      progress: 45,
      tags: ['blockchain', 'defi', 'wallet']
    },
    {
      id: '5',
      name: 'API Gateway Service',
      description: 'Microservices API gateway with load balancing',
      language: 'Go',
      framework: 'Gin',
      type: 'api',
      status: 'active',
      commits: 134,
      contributors: 3,
      stars: 45,
      lastUpdate: '3 days ago',
      aiAssistance: 73,
      progress: 82,
      tags: ['api', 'microservices', 'gateway']
    },
    {
      id: '6',
      name: 'Social Media App',
      description: 'Modern social media platform with real-time messaging',
      language: 'TypeScript',
      framework: 'React',
      type: 'web',
      status: 'paused',
      commits: 78,
      contributors: 2,
      stars: 23,
      lastUpdate: '1 week ago',
      aiAssistance: 64,
      progress: 35,
      tags: ['social', 'messaging', 'realtime']
    }
  ])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || project.type === filterType
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500'
      case 'completed': return 'bg-blue-500'
      case 'paused': return 'bg-amber-500'
      case 'archived': return 'bg-slate-500'
      default: return 'bg-slate-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return <Globe className="w-5 h-5" />
      case 'mobile': return <Smartphone className="w-5 h-5" />
      case 'api': return <Database className="w-5 h-5" />
      case 'ml': return <Brain className="w-5 h-5" />
      case 'blockchain': return <Zap className="w-5 h-5" />
      default: return <Code2 className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'web': return 'text-blue-400'
      case 'mobile': return 'text-emerald-400'
      case 'api': return 'text-purple-400'
      case 'ml': return 'text-pink-400'
      case 'blockchain': return 'text-amber-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-slate-400">Manage your development projects</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Types</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="api">API</option>
              <option value="ml">ML</option>
              <option value="blockchain">Blockchain</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${getTypeColor(project.type)}`}>
                    {getTypeIcon(project.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-sm text-slate-400">{project.framework}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm text-white font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <GitBranch className="w-4 h-4" />
                    <span>{project.commits}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{project.contributors}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{project.stars}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400">{project.aiAssistance}%</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-xs text-slate-300 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-slate-500">Updated {project.lastUpdate}</span>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs rounded-md transition-colors">
                    View
                  </button>
                  <button className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-md transition-colors">
                    Open
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No projects found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Project
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
