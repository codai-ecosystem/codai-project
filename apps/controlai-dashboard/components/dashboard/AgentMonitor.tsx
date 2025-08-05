'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bot,
  User,
  Globe
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  type: 'ai' | 'human' | 'hybrid'
  status: 'online' | 'offline' | 'busy' | 'idle'
  workload: number
  efficiency: number
  currentTasks: number
  completedTasks: number
  specializations: string[]
  lastActive: string
}

interface AgentMonitorProps {
  agents?: Agent[]
  data?: any
  loading?: boolean
  maxItems?: number
  showStatusOnly?: boolean
  className?: string
}

const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'AI Coordinator',
    type: 'ai',
    status: 'online',
    workload: 85,
    efficiency: 94,
    currentTasks: 12,
    completedTasks: 147,
    specializations: ['Task Management', 'Resource Allocation'],
    lastActive: '2024-02-01T12:30:00Z'
  },
  {
    id: 'agent-002',
    name: 'Data Processor',
    type: 'ai',
    status: 'busy',
    workload: 72,
    efficiency: 88,
    currentTasks: 8,
    completedTasks: 203,
    specializations: ['Data Analysis', 'Pattern Recognition'],
    lastActive: '2024-02-01T12:25:00Z'
  },
  {
    id: 'agent-003',
    name: 'Security Guardian',
    type: 'ai',
    status: 'online',
    workload: 45,
    efficiency: 96,
    currentTasks: 5,
    completedTasks: 89,
    specializations: ['Security Monitoring', 'Threat Detection'],
    lastActive: '2024-02-01T12:28:00Z'
  },
  {
    id: 'agent-004',
    name: 'Quality Assurance',
    type: 'ai',
    status: 'idle',
    workload: 20,
    efficiency: 91,
    currentTasks: 2,
    completedTasks: 156,
    specializations: ['Testing', 'Code Review'],
    lastActive: '2024-02-01T11:45:00Z'
  },
  {
    id: 'agent-005',
    name: 'Human Supervisor',
    type: 'human',
    status: 'online',
    workload: 60,
    efficiency: 87,
    currentTasks: 8,
    completedTasks: 67,
    specializations: ['Project Management', 'Strategic Planning'],
    lastActive: '2024-02-01T12:35:00Z'
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    case 'busy': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    case 'idle': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    case 'offline': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'online': return CheckCircle2
    case 'busy': return Clock
    case 'idle': return Activity
    case 'offline': return AlertTriangle
    default: return Activity
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'ai': return Bot
    case 'human': return User
    case 'hybrid': return Globe
    default: return Bot
  }
}

export function AgentMonitor({ 
  agents = mockAgents, 
  data, 
  loading = false, 
  maxItems, 
  showStatusOnly = false, 
  className = '' 
}: AgentMonitorProps) {
  // Use data if provided, otherwise use agents prop or mock data
  const displayAgents = data?.agents || agents || mockAgents
  const limitedAgents = maxItems ? displayAgents.slice(0, maxItems) : displayAgents

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getAgentsByStatus = (status: string) => {
    return displayAgents.filter(agent => agent.status === status)
  }

  const getAverageEfficiency = () => {
    if (displayAgents.length === 0) return 0
    return Math.round(displayAgents.reduce((sum, agent) => sum + agent.efficiency, 0) / displayAgents.length)
  }

  const getTotalActiveAgents = () => {
    return displayAgents.filter(agent => agent.status === 'online' || agent.status === 'busy').length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Agent Monitor
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getTotalActiveAgents()} active
          </span>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {limitedAgents.map((agent, index) => {
          const StatusIcon = getStatusIcon(agent.status)
          const TypeIcon = getTypeIcon(agent.type)
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Agent Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <TypeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {agent.type} Agent
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(agent.status)}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="capitalize">{agent.status}</span>
                  </span>
                </div>
              </div>

              {/* Agent Stats */}
              <div className="p-6">
                {/* Workload */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Workload
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {agent.workload}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.workload}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        agent.workload > 80 ? 'bg-red-500' :
                        agent.workload > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Efficiency */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Efficiency
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {agent.efficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.efficiency}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                      className="bg-blue-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Task Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {agent.currentTasks}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Current
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {agent.completedTasks}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Completed
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {!showStatusOnly && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specializations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.specializations.slice(0, 2).map((spec, specIndex) => (
                        <span
                          key={specIndex}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {agent.specializations.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded">
                          +{agent.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Active */}
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Last active: {new Date(agent.lastActive).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Stats */}
      {!showStatusOnly && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {getAgentsByStatus('online').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Busy</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getAgentsByStatus('busy').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Efficiency</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getAverageEfficiency()}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-purple-600">
                  {displayAgents.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
