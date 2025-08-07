'use client'

import React, { useState } from 'react'
import { 
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  Award,
  Star,
  TrendingUp,
  Target,
  Brain,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  PlayCircle,
  FileText,
  Bookmark,
  MessageSquare,
  Bell,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Edit,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Zap,
  Globe,
  Headphones,
  Video,
  Image,
  Coffee
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const studyStats = [
    { icon: BookOpen, label: 'Total Courses', value: '156', change: '+12', color: 'text-blue-600' },
    { icon: Users, label: 'Active Students', value: '2,847', change: '+189', color: 'text-green-600' },
    { icon: Award, label: 'Certificates', value: '1,234', change: '+45', color: 'text-purple-600' },
    { icon: Clock, label: 'Study Hours', value: '89.5K', change: '+1.2K', color: 'text-orange-600' }
  ]

  const recentCourses = [
    {
      id: 1,
      title: 'Advanced Machine Learning',
      instructor: 'Dr. AI Smith',
      progress: 85,
      totalLessons: 24,
      completedLessons: 20,
      nextLesson: 'Neural Networks Deep Dive',
      difficulty: 'Advanced',
      rating: 4.9,
      students: 1247,
      duration: '8 weeks',
      category: 'AI/ML',
      thumbnail: '🤖',
      lastAccessed: '2 hours ago'
    },
    {
      id: 2,
      title: 'React Development Mastery',
      instructor: 'Prof. React Pro',
      progress: 60,
      totalLessons: 18,
      completedLessons: 11,
      nextLesson: 'Context API & Hooks',
      difficulty: 'Intermediate',
      rating: 4.8,
      students: 2156,
      duration: '6 weeks',
      category: 'Web Dev',
      thumbnail: '⚛️',
      lastAccessed: '1 day ago'
    },
    {
      id: 3,
      title: 'Data Science Fundamentals',
      instructor: 'Dr. Data Analyst',
      progress: 30,
      totalLessons: 20,
      completedLessons: 6,
      nextLesson: 'Statistical Analysis',
      difficulty: 'Beginner',
      rating: 4.7,
      students: 3421,
      duration: '10 weeks',
      category: 'Data Science',
      thumbnail: '📊',
      lastAccessed: '3 days ago'
    }
  ]

  const quickActions = [
    { name: 'Start New Course', icon: PlayCircle, color: 'from-blue-500 to-blue-600', description: 'Browse course catalog' },
    { name: 'Join Study Group', icon: Users, color: 'from-green-500 to-green-600', description: 'Collaborative learning' },
    { name: 'Practice Quiz', icon: Brain, color: 'from-purple-500 to-purple-600', description: 'Test your knowledge' },
    { name: 'AI Tutor Chat', icon: MessageSquare, color: 'from-pink-500 to-pink-600', description: 'Get instant help' },
    { name: 'Study Schedule', icon: Calendar, color: 'from-indigo-500 to-indigo-600', description: 'Plan your learning' },
    { name: 'Progress Analytics', icon: BarChart3, color: 'from-orange-500 to-orange-600', description: 'Track performance' }
  ]

  const studyMetrics = [
    { label: 'Weekly Goal', value: '12h', completed: '8.5h', percentage: 71, icon: Target, color: 'text-blue-600' },
    { label: 'Current Streak', value: '15 days', trend: '+3', percentage: 88, icon: Activity, color: 'text-green-600' },
    { label: 'Focus Score', value: '92%', trend: '+5%', percentage: 92, icon: Brain, color: 'text-purple-600' },
    { label: 'Course Completion', value: '78%', trend: '+12%', percentage: 78, icon: Award, color: 'text-orange-600' }
  ]

  const upcomingLessons = [
    {
      id: 1,
      course: 'Advanced Machine Learning',
      lesson: 'Neural Networks Deep Dive',
      time: 'Today, 2:00 PM',
      duration: '45 min',
      type: 'video',
      instructor: 'Dr. AI Smith'
    },
    {
      id: 2,
      course: 'React Development',
      lesson: 'Context API & Hooks',
      time: 'Tomorrow, 10:00 AM',
      duration: '60 min',
      type: 'interactive',
      instructor: 'Prof. React Pro'
    },
    {
      id: 3,
      course: 'Data Science',
      lesson: 'Statistical Analysis',
      time: 'Friday, 3:00 PM',
      duration: '50 min',
      type: 'lecture',
      instructor: 'Dr. Data Analyst'
    }
  ]

  const achievements = [
    { name: 'Fast Learner', description: 'Completed 5 courses in 30 days', icon: '⚡', earned: true },
    { name: 'Quiz Master', description: 'Scored 100% in 10 quizzes', icon: '🎯', earned: true },
    { name: 'Study Streak', description: '30-day learning streak', icon: '🔥', earned: false, progress: 50 },
    { name: 'Knowledge Sharer', description: 'Helped 25 students', icon: '🤝', earned: false, progress: 80 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StudiAI Dashboard
                </h1>
                <p className="text-sm text-gray-600">AI-powered education platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Study Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {studyStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-blue-100 mb-8">
          <nav className="flex space-x-1">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'courses', name: 'My Courses', icon: BookOpen },
              { id: 'progress', name: 'Progress', icon: TrendingUp },
              { id: 'achievements', name: 'Achievements', icon: Award },
              { id: 'schedule', name: 'Schedule', icon: Calendar },
              { id: 'community', name: 'Community', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Dashboard Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.name}
                      whileHover={{ scale: 1.05 }}
                      className="group cursor-pointer"
                    >
                      <div className={`bg-gradient-to-r ${action.color} rounded-xl p-6 text-white group-hover:shadow-lg transition-all`}>
                        <action.icon className="h-8 w-8 mb-3" />
                        <h3 className="font-semibold mb-1">{action.name}</h3>
                        <p className="text-white/80 text-sm">{action.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Courses */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}`}>
                  {recentCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all group cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                          {course.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                              course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {course.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span>•</span>
                            <span>{course.duration}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{course.rating}</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Next: <span className="font-medium">{course.nextLesson}</span>
                            </div>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                              Continue
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Metrics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studyMetrics.map((metric, index) => (
                    <div key={metric.label} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <metric.icon className={`h-5 w-5 ${metric.color}`} />
                          <span className="font-medium text-gray-900">{metric.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{metric.value}</div>
                          {metric.trend && (
                            <div className="text-sm text-green-600">{metric.trend}</div>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            metric.percentage >= 80 ? 'bg-green-500' :
                            metric.percentage >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${metric.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Lessons */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Lessons</h3>
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{lesson.lesson}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lesson.type === 'video' ? 'bg-blue-100 text-blue-800' :
                          lesson.type === 'interactive' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {lesson.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{lesson.course}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{lesson.time}</span>
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View Full Schedule
                </button>
              </div>

              {/* Achievements */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={achievement.name} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                        {!achievement.earned && achievement.progress && (
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Tips */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="h-5 w-5" />
                  <h3 className="font-semibold">AI Study Tip</h3>
                </div>
                <p className="text-sm text-white/90 mb-4">
                  Take regular breaks every 25 minutes to improve focus and retention. Your brain processes information better with periodic rest.
                </p>
                <button className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-white/30 transition-colors">
                  More Tips
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tab contents can be implemented similarly */}
        {activeTab !== 'overview' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-blue-100 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - Coming Soon
            </h3>
            <p className="text-gray-600">
              This section is under development. Check back soon for updates!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Platform
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Empowering education through artificial intelligence
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Courses</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Instructors</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Community</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
