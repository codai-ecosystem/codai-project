'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Code2,
  Brain,
  TrendingUp,
  Users,
  Zap,
  GitBranch,
  Clock,
  Star,
  Activity,
  Database,
  Server,
  Terminal
} from 'lucide-react'

interface ProjectStats {
  id: string
  name: string
  language: string
  commits: number
  contributors: number
  lastUpdate: string
  status: 'active' | 'completed' | 'paused'
  aiAssistance: number
}

interface SystemMetrics {
  activeProjects: number
  totalLines: number
  aiSuggestions: number
  testsGenerated: number
  bugsFixed: number
  performance: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeProjects: 12,
    totalLines: 156892,
    aiSuggestions: 2847,
    testsGenerated: 1205,
    bugsFixed: 432,
    performance: 94.7
  })

  const [recentProjects] = useState<ProjectStats[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      language: 'TypeScript',
      commits: 247,
      contributors: 5,
      lastUpdate: '2 hours ago',
      status: 'active',
      aiAssistance: 87
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      language: 'React Native',
      commits: 189,
      contributors: 3,
      lastUpdate: '4 hours ago',
      status: 'active',
      aiAssistance: 92
    },
    {
      id: '3',
      name: 'ML Analytics Dashboard',
      language: 'Python',
      commits: 156,
      contributors: 4,
      lastUpdate: '1 day ago',
      status: 'completed',
      aiAssistance: 78
    },
    {
      id: '4',
      name: 'Blockchain Wallet',
      language: 'Solidity',
      commits: 98,
      contributors: 2,
      lastUpdate: '2 days ago',
      status: 'active',
      aiAssistance: 95
    }
  ])

  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 47,
    codeGeneration: 156,
    systemLoad: 23.4
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        activeUsers: Math.floor(Math.random() * 20) + 40,
        codeGeneration: Math.floor(Math.random() * 50) + 150,
        systemLoad: Math.random() * 20 + 20
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500'
      case 'completed': return 'bg-blue-500'
      case 'paused': return 'bg-amber-500'
      default: return 'bg-slate-500'
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
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
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
            <h1 className="text-3xl font-bold text-white mb-2">CodAI Dashboard</h1>
            <p className="text-slate-400">AI-Powered Development Environment</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">System Optimal</span>
            </div>
            <Link
              href="/projects"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              New Project
            </Link>
          </div>
        </motion.div>

        {/* Real-time Metrics Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Users</p>
                <motion.p
                  key={realtimeData.activeUsers}
                  initial={{ scale: 1.2, color: "#60a5fa" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  className="text-2xl font-bold text-white"
                >
                  {realtimeData.activeUsers}
                </motion.p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Code Generated</p>
                <motion.p
                  key={realtimeData.codeGeneration}
                  initial={{ scale: 1.2, color: "#34d399" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  className="text-2xl font-bold text-white"
                >
                  {realtimeData.codeGeneration.toLocaleString()}
                </motion.p>
              </div>
              <Code2 className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Load</p>
                <motion.p
                  key={realtimeData.systemLoad}
                  initial={{ scale: 1.2, color: "#f59e0b" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  className="text-2xl font-bold text-white"
                >
                  {realtimeData.systemLoad.toFixed(1)}%
                </motion.p>
              </div>
              <Activity className="w-8 h-8 text-amber-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">AI Performance</p>
                <p className="text-2xl font-bold text-white">{metrics.performance}%</p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
              <Link href="/projects" className="text-blue-400 hover:text-blue-300 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                      <div>
                        <h3 className="font-medium text-white">{project.name}</h3>
                        <p className="text-sm text-slate-400">{project.language}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{project.commits}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.contributors}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Brain className="w-4 h-4" />
                        <span>{project.aiAssistance}%</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Last updated {project.lastUpdate}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* System Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* AI Assistant Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">AI Assistant</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Suggestions Today</span>
                  <span className="text-white font-medium">{metrics.aiSuggestions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Tests Generated</span>
                  <span className="text-white font-medium">{metrics.testsGenerated.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Bugs Fixed</span>
                  <span className="text-white font-medium">{metrics.bugsFixed}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/assistant"
                  className="block w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span className="text-white">AI Assistant</span>
                  </div>
                </Link>
                <Link
                  href="/analytics"
                  className="block w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Analytics</span>
                  </div>
                </Link>
                <Link
                  href="/terminal"
                  className="block w-full p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span className="text-white">Terminal</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">CPU Usage</span>
                  <span className="text-emerald-400 font-medium">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Memory</span>
                  <span className="text-blue-400 font-medium">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Storage</span>
                  <span className="text-purple-400 font-medium">45%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
