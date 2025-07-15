'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Search,
  Network,
  BarChart3,
  Clock,
  Star,
  TrendingUp,
  Users,
  FileText,
  Lightbulb,
  Activity,
  Zap,
  Database,
  Globe,
  Link as LinkIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Eye,
  Heart,
  Share,
  MoreVertical,
  Bookmark,
  Calendar,
  Tag
} from 'lucide-react'

// Memory Card Component
export const MemoryCard = ({ memory, index }: { memory: any, index: number }) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${memory.typeColor}`}>
            <memory.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
              {memory.title}
            </h3>
            <p className="text-slate-400 text-sm">{memory.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${memory.importanceColor}`} />
          <button className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{memory.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{memory.timestamp}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Network className="w-3 h-3" />
            <span>{memory.connections} connections</span>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {memory.tags.slice(0, 2).map((tag: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Stats Card Component
export const StatsCard = ({ stat, index }: { stat: any, index: number }) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 text-sm mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${stat.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.trend > 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(stat.trend)}%</span>
            </div>
            <span className="text-slate-400 text-sm">vs last week</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

// Knowledge Graph Preview Component
export const KnowledgeGraphPreview = () => {
  const nodes = [
    { id: 1, x: 150, y: 100, size: 20, color: 'from-purple-500 to-pink-500', label: 'AI Research' },
    { id: 2, x: 300, y: 150, size: 16, color: 'from-blue-500 to-cyan-500', label: 'Machine Learning' },
    { id: 3, x: 100, y: 200, size: 18, color: 'from-emerald-500 to-teal-500', label: 'Project Planning' },
    { id: 4, x: 250, y: 250, size: 14, color: 'from-yellow-500 to-orange-500', label: 'Team Meeting' },
    { id: 5, x: 350, y: 80, size: 12, color: 'from-red-500 to-pink-500', label: 'Code Review' }
  ]

  const connections = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 2, to: 5 }
  ]

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Knowledge Graph</h3>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
          View Full Graph
        </button>
      </div>

      <div className="relative h-64 bg-slate-900/50 rounded-lg overflow-hidden">
        <svg className="w-full h-full">
          {/* Connections */}
          {connections.map((connection, index) => {
            const fromNode = nodes.find(n => n.id === connection.from)
            const toNode = nodes.find(n => n.id === connection.to)
            if (!fromNode || !toNode) return null

            return (
              <motion.line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="rgba(147, 51, 234, 0.3)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node, index) => (
            <motion.g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                className={`fill-current bg-gradient-to-r ${node.color}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.2 }}
              />
              <motion.text
                x={node.x}
                y={node.y - node.size - 10}
                textAnchor="middle"
                className="fill-white text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {node.label}
              </motion.text>
            </motion.g>
          ))}
        </svg>
      </div>
    </motion.div>
  )
}

// Recent Activity Component
export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'memory_created',
      title: 'Added new research findings',
      description: 'Created memory about AI model optimization techniques',
      timestamp: '2 minutes ago',
      icon: Brain,
      color: 'text-purple-400'
    },
    {
      id: 2,
      type: 'connection_made',
      title: 'Connected related memories',
      description: 'Linked project planning with team meeting notes',
      timestamp: '15 minutes ago',
      icon: Network,
      color: 'text-blue-400'
    },
    {
      id: 3,
      type: 'insight_generated',
      title: 'Generated insight',
      description: 'Found pattern in code review feedback across projects',
      timestamp: '1 hour ago',
      icon: Lightbulb,
      color: 'text-yellow-400'
    },
    {
      id: 4,
      type: 'search_performed',
      title: 'Searched memories',
      description: 'Found 12 relevant memories for "machine learning deployment"',
      timestamp: '2 hours ago',
      icon: Search,
      color: 'text-emerald-400'
    }
  ]

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start space-x-4 p-3 hover:bg-white/5 rounded-lg transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{activity.title}</p>
              <p className="text-slate-400 text-sm">{activity.description}</p>
              <p className="text-slate-500 text-xs mt-1">{activity.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Quick Insights Component
export const QuickInsights = () => {
  const insights = [
    {
      id: 1,
      title: 'Memory Pattern Detected',
      description: 'You tend to create more technical memories on Tuesdays and Thursdays',
      type: 'pattern',
      confidence: 0.87,
      icon: Target
    },
    {
      id: 2,
      title: 'Connection Opportunity',
      description: 'Recent meeting notes could be linked to your project documentation',
      type: 'suggestion',
      confidence: 0.92,
      icon: LinkIcon
    },
    {
      id: 3,
      title: 'Knowledge Gap',
      description: 'Consider adding more memories about deployment strategies',
      type: 'recommendation',
      confidence: 0.74,
      icon: Lightbulb
    }
  ]

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          AI Insights
        </h3>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
          Generate More
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <insight.icon className="w-4 h-4 text-purple-400" />
                <h4 className="text-white font-medium text-sm">{insight.title}</h4>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-emerald-400 text-xs">
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-3">{insight.description}</p>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg hover:bg-purple-500/30 transition-colors">
                Apply
              </button>
              <button className="px-3 py-1 bg-white/10 text-slate-300 text-xs rounded-lg hover:bg-white/15 transition-colors">
                Dismiss
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Memory Performance Chart Component
export const MemoryPerformanceChart = () => {
  const data = [
    { day: 'Mon', memories: 12, connections: 8, insights: 2 },
    { day: 'Tue', memories: 18, connections: 15, insights: 4 },
    { day: 'Wed', memories: 8, connections: 6, insights: 1 },
    { day: 'Thu', memories: 22, connections: 18, insights: 5 },
    { day: 'Fri', memories: 15, connections: 12, insights: 3 },
    { day: 'Sat', memories: 5, connections: 3, insights: 1 },
    { day: 'Sun', memories: 9, connections: 7, insights: 2 }
  ]

  const maxValue = Math.max(...data.map(d => Math.max(d.memories, d.connections, d.insights)))

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Weekly Performance</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-slate-300">Memories</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-slate-300">Connections</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-slate-300">Insights</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => (
            <div key={item.day} className="flex-1 flex flex-col items-center">
              <div className="flex items-end space-x-1 h-32 mb-2">
                <motion.div
                  className="bg-purple-500 rounded-t"
                  style={{ width: '8px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.memories / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                />
                <motion.div
                  className="bg-blue-500 rounded-t"
                  style={{ width: '8px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.connections / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.6 }}
                />
                <motion.div
                  className="bg-yellow-500 rounded-t"
                  style={{ width: '8px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.insights / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                />
              </div>
              <span className="text-slate-400 text-xs">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
