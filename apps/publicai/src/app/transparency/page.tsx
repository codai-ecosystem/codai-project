'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Eye, FileText, Download, Search, Filter, Calendar,
  Building2, Users, DollarSign, BarChart3, TrendingUp,
  Shield, Lock, Unlock, CheckCircle, AlertCircle,
  Database, Globe, Clock, Award, Target, Activity,
  PieChart, LineChart, MapPin, Phone, Mail, ExternalLink,
  RefreshCw, ArrowRight, Info, Star, Bookmark,
  Gavel, Book, Archive, DocumentIcon, Briefcase
} from 'lucide-react'

interface TransparencyMetric {
  id: string
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  description: string
}

interface PublicRecord {
  id: string
  title: string
  category: string
  department: string
  datePublished: string
  size: string
  downloads: number
  type: 'budget' | 'contract' | 'meeting' | 'report' | 'policy' | 'data'
  accessLevel: 'public' | 'restricted' | 'confidential'
  lastUpdated: string
}

interface BudgetAllocation {
  department: string
  allocated: number
  spent: number
  percentage: number
  color: string
}

interface ContractData {
  id: string
  vendor: string
  amount: number
  category: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'pending'
}

export default function TransparencyPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [dateRange, setDateRange] = useState('last30days')

  const [transparencyScore, setTransparencyScore] = useState(94.7)
  const [metrics, setMetrics] = useState<TransparencyMetric[]>([
    {
      id: 'open-data',
      title: 'Open Data Sets',
      value: '2,847',
      change: '+12.3%',
      changeType: 'positive',
      icon: Database,
      color: 'from-teal-500 to-cyan-500',
      description: 'Publicly available datasets across all departments'
    },
    {
      id: 'public-records',
      title: 'Public Records',
      value: '15,692',
      change: '+8.7%',
      changeType: 'positive',
      icon: FileText,
      color: 'from-blue-500 to-indigo-500',
      description: 'Accessible government documents and records'
    },
    {
      id: 'budget-transparency',
      title: 'Budget Transparency',
      value: '98.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-cyan-500 to-blue-500',
      description: 'Financial information accessibility score'
    },
    {
      id: 'response-time',
      title: 'Avg Response Time',
      value: '2.3 days',
      change: '-15.6%',
      changeType: 'positive',
      icon: Clock,
      color: 'from-indigo-500 to-purple-500',
      description: 'Average time to respond to information requests'
    }
  ])

  const [publicRecords, setPublicRecords] = useState<PublicRecord[]>([
    {
      id: 'budget-2025',
      title: '2025 Annual Budget Report',
      category: 'Financial',
      department: 'Finance',
      datePublished: '2025-01-15',
      size: '12.4 MB',
      downloads: 15847,
      type: 'budget',
      accessLevel: 'public',
      lastUpdated: '2025-08-01'
    },
    {
      id: 'city-council-aug',
      title: 'August City Council Meeting Minutes',
      category: 'Governance',
      department: 'City Council',
      datePublished: '2025-08-05',
      size: '2.1 MB',
      downloads: 3247,
      type: 'meeting',
      accessLevel: 'public',
      lastUpdated: '2025-08-05'
    },
    {
      id: 'infrastructure-contracts',
      title: 'Infrastructure Development Contracts Q2',
      category: 'Procurement',
      department: 'Public Works',
      datePublished: '2025-07-28',
      size: '8.7 MB',
      downloads: 5632,
      type: 'contract',
      accessLevel: 'public',
      lastUpdated: '2025-07-30'
    },
    {
      id: 'housing-policy',
      title: 'Affordable Housing Policy Update',
      category: 'Policy',
      department: 'Housing Authority',
      datePublished: '2025-07-20',
      size: '4.2 MB',
      downloads: 8934,
      type: 'policy',
      accessLevel: 'public',
      lastUpdated: '2025-07-25'
    },
    {
      id: 'traffic-data',
      title: 'Monthly Traffic Pattern Analysis',
      category: 'Transportation',
      department: 'Transportation',
      datePublished: '2025-07-15',
      size: '15.6 MB',
      downloads: 2156,
      type: 'data',
      accessLevel: 'public',
      lastUpdated: '2025-07-31'
    },
    {
      id: 'environmental-report',
      title: 'Environmental Impact Assessment 2025',
      category: 'Environment',
      department: 'Environmental Services',
      datePublished: '2025-06-30',
      size: '22.3 MB',
      downloads: 7823,
      type: 'report',
      accessLevel: 'public',
      lastUpdated: '2025-07-15'
    }
  ])

  const [budgetData, setBudgetData] = useState<BudgetAllocation[]>([
    { department: 'Education', allocated: 45000000, spent: 43200000, percentage: 96, color: 'bg-teal-500' },
    { department: 'Healthcare', allocated: 38000000, spent: 35600000, percentage: 93.7, color: 'bg-blue-500' },
    { department: 'Infrastructure', allocated: 32000000, spent: 28800000, percentage: 90, color: 'bg-cyan-500' },
    { department: 'Public Safety', allocated: 28000000, spent: 26320000, percentage: 94, color: 'bg-indigo-500' },
    { department: 'Transportation', allocated: 22000000, spent: 19800000, percentage: 90, color: 'bg-purple-500' },
    { department: 'Parks & Recreation', allocated: 15000000, spent: 13500000, percentage: 90, color: 'bg-teal-400' }
  ])

  const categories = [
    { id: 'all', label: 'All Categories', count: publicRecords.length },
    { id: 'Financial', label: 'Financial', count: publicRecords.filter(r => r.category === 'Financial').length },
    { id: 'Governance', label: 'Governance', count: publicRecords.filter(r => r.category === 'Governance').length },
    { id: 'Procurement', label: 'Procurement', count: publicRecords.filter(r => r.category === 'Procurement').length },
    { id: 'Policy', label: 'Policy', count: publicRecords.filter(r => r.category === 'Policy').length },
    { id: 'Transportation', label: 'Transportation', count: publicRecords.filter(r => r.category === 'Transportation').length },
    { id: 'Environment', label: 'Environment', count: publicRecords.filter(r => r.category === 'Environment').length }
  ]

  const departments = [
    'all', 'Finance', 'City Council', 'Public Works', 'Housing Authority',
    'Transportation', 'Environmental Services', 'Education', 'Healthcare'
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'records', label: 'Public Records', icon: FileText },
    { id: 'budget', label: 'Budget Tracking', icon: DollarSign },
    { id: 'contracts', label: 'Contracts', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return DollarSign
      case 'contract': return Briefcase
      case 'meeting': return Users
      case 'report': return FileText
      case 'policy': return Book
      case 'data': return Database
      default: return DocumentIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'from-green-500 to-teal-500'
      case 'contract': return 'from-blue-500 to-indigo-500'
      case 'meeting': return 'from-purple-500 to-pink-500'
      case 'report': return 'from-cyan-500 to-blue-500'
      case 'policy': return 'from-indigo-500 to-purple-500'
      case 'data': return 'from-teal-500 to-cyan-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const filteredRecords = publicRecords.filter(record => {
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory
    const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesDepartment && matchesSearch
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTransparencyScore(prev => Math.min(100, prev + (Math.random() - 0.5) * 0.1))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Enhanced Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-teal-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Transparency Portal
                </h1>
                <p className="text-sm text-gray-600">Open Government Data & Public Records</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Transparency Score: {transparencyScore.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{publicRecords.length} Public Records</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Update Data
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-1">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Transparency Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${metric.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                          metric.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {metric.change}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    <p className="text-gray-600 text-sm">{metric.description}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Access Dashboard */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('budget')}
                >
                  <DollarSign className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Budget Transparency</h3>
                  <p className="text-teal-100 text-sm mb-4">Real-time budget tracking and spending analysis</p>
                  <div className="flex items-center text-sm">
                    <span>View Budget Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('contracts')}
                >
                  <Briefcase className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Public Contracts</h3>
                  <p className="text-blue-100 text-sm mb-4">Government contracts and procurement data</p>
                  <div className="flex items-center text-sm">
                    <span>Browse Contracts</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('records')}
                >
                  <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Public Records</h3>
                  <p className="text-indigo-100 text-sm mb-4">Comprehensive government document archive</p>
                  <div className="flex items-center text-sm">
                    <span>Search Records</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transparency Updates</h2>
              <div className="space-y-4">
                {publicRecords.slice(0, 5).map((record, index) => {
                  const TypeIcon = getTypeIcon(record.type)
                  return (
                    <motion.div
                      key={record.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(record.type)} rounded-lg flex items-center justify-center`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{record.title}</h3>
                          <p className="text-gray-600 text-sm">{record.department} • {record.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{record.downloads.toLocaleString()} downloads</span>
                        <button className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg hover:bg-teal-200 transition-colors">
                          <Download className="w-4 h-4 inline mr-1" />
                          Download
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search public records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label} ({category.count})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRecords.map((record, index) => {
                const TypeIcon = getTypeIcon(record.type)
                return (
                  <motion.div
                    key={record.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6 hover:shadow-lg transition-all cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(record.type)} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${record.accessLevel === 'public' ? 'bg-green-100 text-green-800' :
                          record.accessLevel === 'restricted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {record.accessLevel}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{record.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{record.department} • {record.category}</p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Published:</span>
                        <span>{new Date(record.datePublished).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{record.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span>{record.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(record.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                        <Download className="w-4 h-4 inline mr-2" />
                        Download
                      </button>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Department Budget Allocation & Spending</h2>
              <div className="space-y-6">
                {budgetData.map((dept, index) => (
                  <motion.div
                    key={dept.department}
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">{dept.department}</h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          ${dept.spent.toLocaleString()} / ${dept.allocated.toLocaleString()}
                        </p>
                        <p className="text-lg font-bold text-gray-900">{dept.percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className={`h-3 rounded-full ${dept.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs placeholder */}
        {!['overview', 'records', 'budget'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Portal</h3>
            <p className="text-gray-600 mb-6">Advanced {activeTab} transparency features are being implemented.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
              Coming Soon
            </button>
          </motion.div>
        )}
      </div>

      {/* Modern Footer */}
      <motion.footer
        className="bg-white/80 backdrop-blur-sm border-t border-teal-200/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Eye className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Open Government</h3>
              <p className="text-teal-100 text-sm">Committed to transparency and citizen access to information.</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Shield className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Data Security</h3>
              <p className="text-blue-100 text-sm">Ensuring privacy while maintaining maximum transparency.</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Database className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Open Data</h3>
              <p className="text-indigo-100 text-sm">Machine-readable data for research and innovation.</p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
