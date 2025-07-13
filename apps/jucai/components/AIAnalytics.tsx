import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Brain,
  Activity,
  Zap,
  ChevronRight,
  Calendar,
  Award
} from 'lucide-react'

interface AnalyticsData {
  playerStats: {
    totalPlayers: string
    activeNow: string
    newToday: string
    retention: string
  }
  gameMetrics: {
    avgSessionTime: string
    completionRate: string
    difficulty: string
    aiAccuracy: string
  }
  performance: {
    latency: string
    uptime: string
    errorRate: string
    aiResponse: string
  }
}

interface AIAnalyticsProps {
  data?: AnalyticsData
}

const defaultData: AnalyticsData = {
  playerStats: {
    totalPlayers: '2,547,832',
    activeNow: '45,231',
    newToday: '1,847',
    retention: '89.2%'
  },
  gameMetrics: {
    avgSessionTime: '47 min',
    completionRate: '73.5%',
    difficulty: 'Adaptive',
    aiAccuracy: '97.8%'
  },
  performance: {
    latency: '12ms',
    uptime: '99.98%',
    errorRate: '0.02%',
    aiResponse: '1.2s'
  }
}

export default function AIAnalytics({ data = defaultData }: AIAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview')

  const metricCards = [
    {
      id: 'players',
      title: 'Total Players',
      value: data.playerStats.totalPlayers,
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'active',
      title: 'Active Now',
      value: data.playerStats.activeNow,
      change: '+5.7%',
      trend: 'up',
      icon: Activity,
      color: 'green'
    },
    {
      id: 'session',
      title: 'Avg Session',
      value: data.gameMetrics.avgSessionTime,
      change: '+8.1%',
      trend: 'up',
      icon: Clock,
      color: 'purple'
    },
    {
      id: 'ai',
      title: 'AI Accuracy',
      value: data.gameMetrics.aiAccuracy,
      change: '+0.3%',
      trend: 'up',
      icon: Brain,
      color: 'pink'
    }
  ]

  const aiInsights = [
    {
      id: '1',
      title: 'Player Behavior Pattern',
      description: 'AI detected 15% increase in strategic gameplay during peak hours',
      impact: 'High',
      category: 'Behavioral',
      confidence: 94
    },
    {
      id: '2',
      title: 'Difficulty Optimization',
      description: 'Dynamic difficulty adjustment improved player retention by 23%',
      impact: 'Medium',
      category: 'Engagement',
      confidence: 87
    },
    {
      id: '3',
      title: 'Content Recommendation',
      description: 'New AI-generated levels show 31% higher completion rates',
      impact: 'High',
      category: 'Content',
      confidence: 92
    },
    {
      id: '4',
      title: 'Performance Prediction',
      description: 'Server load prediction accuracy increased to 98.5%',
      impact: 'Low',
      category: 'Technical',
      confidence: 96
    }
  ]

  const performanceData = [
    { name: 'Response Time', value: data.performance.aiResponse, status: 'excellent' },
    { name: 'Uptime', value: data.performance.uptime, status: 'excellent' },
    { name: 'Error Rate', value: data.performance.errorRate, status: 'excellent' },
    { name: 'Latency', value: data.performance.latency, status: 'good' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-400/20'
      case 'good': return 'text-yellow-400 bg-yellow-400/20'
      case 'warning': return 'text-orange-400 bg-orange-400/20'
      case 'critical': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-400 bg-red-400/20'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'Low': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          AI Gaming Analytics
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Advanced insights powered by artificial intelligence
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer gaming-float"
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{metric.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-300 font-medium text-sm">{metric.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-card rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <span>AI Insights</span>
          </h3>
          <button className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white">
            View All
          </button>
        </div>

        <div className="grid gap-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-white font-semibold">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </span>
                  <span className="text-xs text-gray-400">{insight.category}</span>
                </div>
                <p className="text-gray-300 text-sm">{insight.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-400">Confidence:</span>
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-medium">{insight.confidence}%</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span>System Performance</span>
          </h3>

          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">{item.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold">{item.value}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gaming Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Gaming Statistics</span>
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Player Retention</span>
                <span className="text-white font-semibold">{data.playerStats.retention}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-[89%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Completion Rate</span>
                <span className="text-white font-semibold">{data.gameMetrics.completionRate}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[73.5%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">AI Accuracy</span>
                <span className="text-white font-semibold">{data.gameMetrics.aiAccuracy}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-[97.8%]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <button className="glass-button px-6 py-3 rounded-xl font-semibold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Schedule Report</span>
        </button>
        <button className="glass-button px-6 py-3 rounded-xl font-semibold text-white flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Set Goals</span>
        </button>
        <button className="glass-button px-6 py-3 rounded-xl font-semibold text-white flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>View Achievements</span>
        </button>
      </motion.div>
    </div>
  )
}
