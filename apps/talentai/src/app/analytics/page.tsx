'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Star,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  Mail,
  Phone
} from 'lucide-react'

interface AnalyticsMetrics {
  overview: {
    totalCandidates: number
    activeJobs: number
    hiredThisMonth: number
    averageTimeToHire: number
    conversionRate: number
    costPerHire: number
    qualityOfHire: number
    candidateSatisfaction: number
  }
  trends: {
    applicationsThisWeek: { value: number; change: number }
    hiresThisWeek: { value: number; change: number }
    timeToHireWeek: { value: number; change: number }
    qualityScoreWeek: { value: number; change: number }
  }
  pipeline: Array<{
    stage: string
    current: number
    previous: number
    conversionRate: number
  }>
  sources: Array<{
    name: string
    applications: number
    hires: number
    cost: number
    quality: number
  }>
  performance: Array<{
    recruiter: string
    totalCandidates: number
    hires: number
    avgTimeToHire: number
    satisfaction: number
  }>
  demographics: {
    experience: Array<{ level: string; count: number; percentage: number }>
    locations: Array<{ city: string; count: number; percentage: number }>
    skills: Array<{ skill: string; demand: number; supply: number }>
    salaryRanges: Array<{ range: string; count: number; avgTime: number }>
  }
}

type TimeRange = '7d' | '30d' | '90d' | '1y'
type ReportType = 'overview' | 'pipeline' | 'sources' | 'performance' | 'demographics'

export default function AnalyticsPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [activeReport, setActiveReport] = useState<ReportType>('overview')
  const [isLoading, setIsLoading] = useState(false)

  const [analyticsData] = useState<AnalyticsMetrics>({
    overview: {
      totalCandidates: 2847,
      activeJobs: 24,
      hiredThisMonth: 43,
      averageTimeToHire: 18.5,
      conversionRate: 34.2,
      costPerHire: 3450,
      qualityOfHire: 87.3,
      candidateSatisfaction: 4.6
    },
    trends: {
      applicationsThisWeek: { value: 127, change: 12.5 },
      hiresThisWeek: { value: 8, change: -5.2 },
      timeToHireWeek: { value: 16.2, change: -8.7 },
      qualityScoreWeek: { value: 89.1, change: 3.4 }
    },
    pipeline: [
      { stage: 'Application', current: 2847, previous: 2654, conversionRate: 100 },
      { stage: 'Screening', current: 1423, previous: 1387, conversionRate: 50.0 },
      { stage: 'Interview', current: 568, previous: 542, conversionRate: 19.9 },
      { stage: 'Assessment', current: 284, previous: 267, conversionRate: 10.0 },
      { stage: 'Offer', current: 142, previous: 134, conversionRate: 5.0 },
      { stage: 'Hired', current: 97, previous: 89, conversionRate: 3.4 }
    ],
    sources: [
      { name: 'LinkedIn', applications: 1247, hires: 45, cost: 2800, quality: 89.2 },
      { name: 'Company Website', applications: 854, hires: 32, cost: 1200, quality: 92.1 },
      { name: 'Job Boards', applications: 456, hires: 12, cost: 4200, quality: 78.5 },
      { name: 'Referrals', applications: 290, hires: 21, cost: 950, quality: 94.7 }
    ],
    performance: [
      { recruiter: 'Sarah Johnson', totalCandidates: 456, hires: 23, avgTimeToHire: 15.2, satisfaction: 4.8 },
      { recruiter: 'Mike Chen', totalCandidates: 389, hires: 19, avgTimeToHire: 17.8, satisfaction: 4.6 },
      { recruiter: 'Emily Davis', totalCandidates: 367, hires: 18, avgTimeToHire: 19.3, satisfaction: 4.5 },
      { recruiter: 'David Wilson', totalCandidates: 298, hires: 14, avgTimeToHire: 21.1, satisfaction: 4.3 }
    ],
    demographics: {
      experience: [
        { level: '0-2 years', count: 1124, percentage: 39.5 },
        { level: '3-5 years', count: 854, percentage: 30.0 },
        { level: '6-10 years', count: 568, percentage: 19.9 },
        { level: '10+ years', count: 301, percentage: 10.6 }
      ],
      locations: [
        { city: 'San Francisco', count: 643, percentage: 22.6 },
        { city: 'New York', count: 512, percentage: 18.0 },
        { city: 'Austin', count: 341, percentage: 12.0 },
        { city: 'Seattle', count: 298, percentage: 10.5 }
      ],
      skills: [
        { skill: 'JavaScript', demand: 89, supply: 67 },
        { skill: 'React', demand: 85, supply: 72 },
        { skill: 'Python', demand: 78, supply: 81 },
        { skill: 'Node.js', demand: 76, supply: 65 }
      ],
      salaryRanges: [
        { range: '$60k-80k', count: 745, avgTime: 22.3 },
        { range: '$80k-120k', count: 1156, avgTime: 18.7 },
        { range: '$120k-160k', count: 623, avgTime: 15.2 },
        { range: '$160k+', count: 323, avgTime: 12.8 }
      ]
    }
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  const exportReport = () => {
    console.log('Exporting report for:', activeReport, 'timeRange:', timeRange)
  }

  const formatTrend = (change: number) => ({
    value: Math.abs(change).toFixed(1),
    isPositive: change >= 0,
    icon: change >= 0 ? TrendingUp : TrendingDown,
    color: change >= 0 ? 'text-green-400' : 'text-red-400'
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
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Analytics & Reports
                  </h1>
                  <p className="text-xs text-slate-400">Comprehensive recruitment performance insights</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{analyticsData.overview.totalCandidates.toLocaleString()} Candidates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{analyticsData.overview.hiredThisMonth} Hired This Month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{analyticsData.overview.conversionRate}% Conversion</span>
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
        {/* Controls */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              {(['overview', 'pipeline', 'sources', 'performance', 'demographics'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveReport(type)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    activeReport === type
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </motion.div>

        {/* Overview Dashboard */}
        <AnimatePresence mode="wait">
          {activeReport === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glassmorphism p-6 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{analyticsData.overview.totalCandidates.toLocaleString()}</div>
                  <div className="text-sm text-slate-400 mb-2">Total Candidates</div>
                  <div className="flex items-center text-xs">
                    {(() => {
                      const trend = formatTrend(analyticsData.trends.applicationsThisWeek.change)
                      const Icon = trend.icon
                      return (
                        <>
                          <Icon className={`w-3 h-3 mr-1 ${trend.color}`} />
                          <span className={trend.color}>+{trend.value}% this week</span>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="glassmorphism p-6 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{analyticsData.overview.hiredThisMonth}</div>
                  <div className="text-sm text-slate-400 mb-2">Hired This Month</div>
                  <div className="flex items-center text-xs">
                    {(() => {
                      const trend = formatTrend(analyticsData.trends.hiresThisWeek.change)
                      const Icon = trend.icon
                      return (
                        <>
                          <Icon className={`w-3 h-3 mr-1 ${trend.color}`} />
                          <span className={trend.color}>{trend.isPositive ? '+' : ''}{trend.value}% vs last week</span>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="glassmorphism p-6 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{analyticsData.overview.averageTimeToHire}</div>
                  <div className="text-sm text-slate-400 mb-2">Avg. Days to Hire</div>
                  <div className="flex items-center text-xs">
                    {(() => {
                      const trend = formatTrend(-analyticsData.trends.timeToHireWeek.change)
                      const Icon = trend.icon
                      return (
                        <>
                          <Icon className={`w-3 h-3 mr-1 ${trend.color}`} />
                          <span className={trend.color}>{Math.abs(analyticsData.trends.timeToHireWeek.change).toFixed(1)} days faster</span>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="glassmorphism p-6 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{analyticsData.overview.conversionRate}%</div>
                  <div className="text-sm text-slate-400 mb-2">Conversion Rate</div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-green-400">Above industry avg</span>
                  </div>
                </div>
              </div>

              {/* Pipeline Funnel */}
              <div className="glassmorphism rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recruitment Pipeline</h3>
                <div className="space-y-4">
                  {analyticsData.pipeline.map((stage, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{stage.stage}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-300">{stage.current.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">({stage.conversionRate.toFixed(1)}%)</span>
                          <span className={`text-xs ${stage.current > stage.previous ? 'text-green-400' : 'text-red-400'}`}>
                            {stage.current > stage.previous ? '+' : ''}{stage.current - stage.previous}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(stage.current / analyticsData.pipeline[0].current) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glassmorphism rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Cost & Quality Metrics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">${analyticsData.overview.costPerHire.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">Cost per Hire</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{analyticsData.overview.qualityOfHire}%</div>
                      <div className="text-sm text-slate-400">Quality of Hire</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-lg font-medium text-white mb-2">{analyticsData.overview.candidateSatisfaction}/5.0</div>
                    <div className="text-sm text-slate-400 mb-2">Candidate Satisfaction</div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.floor(analyticsData.overview.candidateSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glassmorphism rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Top Performing Sources</h3>
                  <div className="space-y-4">
                    {analyticsData.sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                          <span className="text-sm text-white">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{source.hires} hires</div>
                          <div className="text-xs text-slate-400">{source.quality.toFixed(1)}% quality</div>
                        </div>
                      </div>
                    ))}
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-slate-400 text-sm">Live performance tracking with automated insights and trend analysis</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Custom Reports</h3>
              <p className="text-slate-400 text-sm">Generate detailed reports with advanced filtering and export capabilities</p>
            </motion.div>
            
            <motion.div
              className="glassmorphism p-6 rounded-xl border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Predictive Insights</h3>
              <p className="text-slate-400 text-sm">AI-powered forecasting for recruitment planning and optimization</p>
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
