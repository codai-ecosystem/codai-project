'use client'

import React, { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Award,
  Brain,
  BookOpen,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Activity,
  PieChart,
  LineChart,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Search,
  Grid,
  List,
  Settings,
  Info,
  ExternalLink,
  Share2,
  FileText,
  Bookmark,
  Heart,
  MessageCircle,
  ThumbsUp,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Signal,
  Navigation,
  MapPin,
  Timer,
  Gauge,
  Layers,
  Code,
  Palette,
  Calculator,
  Microscope,
  Music,
  Camera,
  Video,
  Headphones,
  Gamepad2,
  Puzzle,
  Lightbulb,
  Rocket,
  Shield,
  Lock,
  Key,
  Mail,
  Phone,
  Map,
  Flag,
  Tag,
  Hash,
  AtSign,
  Percent,
  DollarSign
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [viewMode, setViewMode] = useState('overview')

  const analyticsStats = [
    {
      icon: Users,
      label: 'Total Learners',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active students this month'
    },
    {
      icon: BookOpen,
      label: 'Course Completions',
      value: '1,234',
      change: '+8.3%',
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Courses completed this month'
    },
    {
      icon: Clock,
      label: 'Study Hours',
      value: '89.5K',
      change: '+15.7%',
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total learning time logged'
    },
    {
      icon: Award,
      label: 'Certificates Earned',
      value: '856',
      change: '+22.1%',
      trend: 'up',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Certificates issued this month'
    },
    {
      icon: Target,
      label: 'Goal Achievement',
      value: '78%',
      change: '+5.2%',
      trend: 'up',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Students meeting learning goals'
    },
    {
      icon: TrendingUp,
      label: 'Engagement Rate',
      value: '94.2%',
      change: '+3.8%',
      trend: 'up',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Daily active user engagement'
    }
  ]

  const timeRanges = [
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: '90d', name: 'Last 90 Days' },
    { id: '1y', name: 'Last Year' }
  ]

  const coursePerformance = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals',
      category: 'AI/ML',
      enrollments: 234,
      completions: 187,
      completionRate: 79.9,
      averageScore: 8.7,
      studyHours: 1247,
      satisfaction: 4.8,
      trend: 'up',
      change: '+12%'
    },
    {
      id: 2,
      title: 'React Development Mastery',
      category: 'Web Development',
      enrollments: 189,
      completions: 156,
      completionRate: 82.5,
      averageScore: 8.9,
      studyHours: 1089,
      satisfaction: 4.9,
      trend: 'up',
      change: '+8%'
    },
    {
      id: 3,
      title: 'Data Science with Python',
      category: 'Data Science',
      enrollments: 167,
      completions: 123,
      completionRate: 73.7,
      averageScore: 8.4,
      studyHours: 1456,
      satisfaction: 4.6,
      trend: 'down',
      change: '-3%'
    },
    {
      id: 4,
      title: 'UX/UI Design Principles',
      category: 'Design',
      enrollments: 145,
      completions: 134,
      completionRate: 92.4,
      averageScore: 9.1,
      studyHours: 978,
      satisfaction: 4.9,
      trend: 'up',
      change: '+15%'
    },
    {
      id: 5,
      title: 'Digital Marketing Strategy',
      category: 'Marketing',
      enrollments: 123,
      completions: 98,
      completionRate: 79.7,
      averageScore: 8.5,
      studyHours: 756,
      satisfaction: 4.7,
      trend: 'up',
      change: '+6%'
    }
  ]

  const learningPaths = [
    {
      id: 1,
      name: 'AI Engineer Track',
      students: 89,
      avgProgress: 67,
      completions: 23,
      estimatedTime: '6 months',
      satisfactionScore: 4.8,
      trend: 'up'
    },
    {
      id: 2,
      name: 'Full Stack Developer',
      students: 156,
      avgProgress: 72,
      completions: 45,
      estimatedTime: '8 months',
      satisfactionScore: 4.7,
      trend: 'up'
    },
    {
      id: 3,
      name: 'Data Scientist',
      students: 134,
      avgProgress: 58,
      completions: 34,
      estimatedTime: '10 months',
      satisfactionScore: 4.6,
      trend: 'stable'
    }
  ]

  const engagementMetrics = [
    { day: 'Mon', sessions: 1247, duration: 3.2, completions: 89 },
    { day: 'Tue', sessions: 1456, duration: 3.8, completions: 156 },
    { day: 'Wed', sessions: 1323, duration: 3.5, completions: 134 },
    { day: 'Thu', sessions: 1589, duration: 4.1, completions: 167 },
    { day: 'Fri', sessions: 1234, duration: 2.9, completions: 123 },
    { day: 'Sat', sessions: 987, duration: 2.1, completions: 98 },
    { day: 'Sun', sessions: 876, duration: 1.8, completions: 76 }
  ]

  const topPerformers = [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: '👩‍💻',
      coursesCompleted: 12,
      totalHours: 247,
      averageScore: 9.4,
      streak: 45,
      certificates: 8,
      level: 'Expert'
    },
    {
      id: 2,
      name: 'Alex Rodriguez',
      avatar: '👨‍💼',
      coursesCompleted: 10,
      totalHours: 198,
      averageScore: 9.1,
      streak: 32,
      certificates: 6,
      level: 'Advanced'
    },
    {
      id: 3,
      name: 'Emily Watson',
      avatar: '👩‍🔬',
      coursesCompleted: 8,
      totalHours: 189,
      averageScore: 8.9,
      streak: 28,
      certificates: 5,
      level: 'Advanced'
    }
  ]

  const deviceAnalytics = [
    { device: 'Desktop', percentage: 45, users: 1281, color: 'bg-blue-500' },
    { device: 'Mobile', percentage: 35, users: 996, color: 'bg-green-500' },
    { device: 'Tablet', percentage: 20, users: 569, color: 'bg-purple-500' }
  ]

  const geographicData = [
    { country: 'United States', users: 1247, percentage: 43.8, growth: '+12%' },
    { country: 'Canada', users: 456, percentage: 16.0, growth: '+8%' },
    { country: 'United Kingdom', users: 387, percentage: 13.6, growth: '+15%' },
    { country: 'Germany', users: 298, percentage: 10.5, growth: '+6%' },
    { country: 'Australia', users: 234, percentage: 8.2, growth: '+18%' },
    { country: 'Other', users: 225, percentage: 7.9, growth: '+10%' }
  ]

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Analytics
                </h1>
                <p className="text-sm text-gray-600">Track progress and performance insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                {timeRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <RefreshCw className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {analyticsStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: Grid },
              { id: 'courses', name: 'Course Performance', icon: BookOpen },
              { id: 'engagement', name: 'Engagement', icon: Activity },
              { id: 'geographic', name: 'Geographic', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${viewMode === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Learning Paths Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Learning Paths Performance</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{path.name}</h4>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(path.trend)}
                        <span className="text-sm text-gray-600">{path.students} students</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium text-gray-900">{path.avgProgress}%</span>
                        <p>Avg Progress</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{path.completions}</span>
                        <p>Completions</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${path.avgProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Est. {path.estimatedTime}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{path.satisfactionScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Leaderboard
                </button>
              </div>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-500 w-6">#{index + 1}</div>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                        {performer.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{performer.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {performer.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>{performer.coursesCompleted} courses</div>
                        <div>{performer.totalHours}h studied</div>
                        <div>{performer.averageScore}/10 avg</div>
                        <div>{performer.streak} day streak</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{performer.certificates}</div>
                      <div className="text-xs text-gray-500">certificates</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Engagement Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Engagement</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Sessions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Completions</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-4">
                {engagementMetrics.map((metric, index) => (
                  <div key={metric.day} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{metric.day}</div>
                    <div className="relative">
                      <div
                        className="bg-blue-100 rounded-t mx-auto mb-1"
                        style={{
                          height: `${(metric.sessions / 1600) * 100}px`,
                          width: '24px'
                        }}
                      ></div>
                      <div
                        className="bg-purple-500 rounded-t mx-auto"
                        style={{
                          height: `${(metric.completions / 200) * 60}px`,
                          width: '24px'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-700 mt-2 font-medium">{metric.sessions}</div>
                    <div className="text-xs text-gray-500">{metric.duration}h avg</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'courses' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Course Performance Analysis</h3>
                <div className="flex items-center space-x-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Categories</option>
                    <option>AI/ML</option>
                    <option>Web Development</option>
                    <option>Data Science</option>
                    <option>Design</option>
                  </select>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Export Report
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Study Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coursePerformance.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{course.enrollments}</div>
                        <div className="text-sm text-gray-500">{course.completions} completed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{course.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-900">{course.averageScore}/10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.studyHours.toLocaleString()}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-900">{course.satisfaction}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor(course.trend)}`}>
                          {getTrendIcon(course.trend)}
                          <span>{course.change}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Device Analytics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Usage</h3>
              <div className="space-y-4">
                {deviceAnalytics.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${device.color}`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{device.device}</div>
                        <div className="text-xs text-gray-500">{device.users.toLocaleString()} users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{device.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                {deviceAnalytics.map((device) => (
                  <div key={device.device} className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${device.color}`}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time-based Engagement */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Learning Hours</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { time: '6-9 AM', activity: 'High', percentage: 85, color: 'bg-green-500' },
                  { time: '9-12 PM', activity: 'Very High', percentage: 95, color: 'bg-blue-500' },
                  { time: '12-3 PM', activity: 'Medium', percentage: 65, color: 'bg-yellow-500' },
                  { time: '3-6 PM', activity: 'High', percentage: 80, color: 'bg-purple-500' },
                  { time: '6-9 PM', activity: 'Very High', percentage: 90, color: 'bg-indigo-500' },
                  { time: '9-12 AM', activity: 'Low', percentage: 35, color: 'bg-gray-400' },
                  { time: '12-3 AM', activity: 'Very Low', percentage: 15, color: 'bg-gray-300' },
                  { time: '3-6 AM', activity: 'Very Low', percentage: 10, color: 'bg-gray-200' }
                ].map((slot, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{slot.time}</div>
                    <div
                      className={`${slot.color} rounded-lg mx-auto mb-2`}
                      style={{
                        height: `${slot.percentage}px`,
                        width: '32px'
                      }}
                    ></div>
                    <div className="text-xs font-medium text-gray-900">{slot.activity}</div>
                    <div className="text-xs text-gray-500">{slot.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'geographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Geographic Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>
              <div className="space-y-4">
                {geographicData.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                        🌍
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{country.country}</div>
                        <div className="text-xs text-gray-500">{country.users.toLocaleString()} users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{country.percentage}%</div>
                      <div className="text-xs text-green-600">{country.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Preferences */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Language Preferences</h3>
              <div className="space-y-4">
                {[
                  { language: 'English', percentage: 78, users: 2218, flag: '🇺🇸' },
                  { language: 'Spanish', percentage: 12, users: 341, flag: '🇪🇸' },
                  { language: 'French', percentage: 5, users: 142, flag: '🇫🇷' },
                  { language: 'German', percentage: 3, users: 85, flag: '🇩🇪' },
                  { language: 'Other', percentage: 2, users: 57, flag: '🌍' }
                ].map((lang) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lang.language}</div>
                        <div className="text-xs text-gray-500">{lang.users.toLocaleString()} users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{lang.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Analytics
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Data-driven insights for enhanced learning experiences
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Performance Reports</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Export Data</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Analytics API</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
