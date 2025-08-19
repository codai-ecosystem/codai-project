'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Users, Shield, FileText, Clock, CheckCircle,
  AlertCircle, XCircle, Search, Filter, Download, Upload,
  Calendar, MapPin, Phone, Mail, CreditCard, Vote,
  Briefcase, GraduationCap, Heart, Home, Car, Scale,
  RefreshCw, ArrowRight, BarChart3, TrendingUp, Settings,
  Zap, Target, Award, Activity, Globe, Eye
} from 'lucide-react'

interface GovernmentService {
  id: string
  name: string
  category: string
  description: string
  status: 'active' | 'maintenance' | 'offline'
  users: number
  avgProcessingTime: string
  successRate: number
  icon: any
  color: string
  lastUpdate: string
  estimatedWaitTime: string
}

interface ServiceRequest {
  id: string
  serviceName: string
  applicantName: string
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  submittedDate: string
  estimatedCompletion: string
  priority: 'low' | 'medium' | 'high'
}

interface ServiceStats {
  totalRequests: number
  completedToday: number
  averageWaitTime: string
  citizenSatisfaction: number
  digitalAdoption: number
  costSavings: string
}

export default function GovernmentServices() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('services')

  const [serviceStats, setServiceStats] = useState<ServiceStats>({
    totalRequests: 15847,
    completedToday: 342,
    averageWaitTime: '2.4 hours',
    citizenSatisfaction: 94.6,
    digitalAdoption: 87.3,
    costSavings: '$2.8M'
  })

  const [services, setServices] = useState<GovernmentService[]>([
    {
      id: 'building-permits',
      name: 'Building Permits',
      category: 'Construction',
      description: 'AI-powered building permit processing with automated compliance checking',
      status: 'active',
      users: 1847,
      avgProcessingTime: '3.2 days',
      successRate: 96.7,
      icon: Building2,
      color: 'from-teal-500 to-cyan-500',
      lastUpdate: '2 min ago',
      estimatedWaitTime: '24 hours'
    },
    {
      id: 'tax-services',
      name: 'Tax Services',
      category: 'Finance',
      description: 'Intelligent tax filing and assessment with real-time calculations',
      status: 'active',
      users: 3926,
      avgProcessingTime: '1.5 hours',
      successRate: 98.9,
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-500',
      lastUpdate: '1 min ago',
      estimatedWaitTime: '2 hours'
    },
    {
      id: 'voting-registration',
      name: 'Voter Registration',
      category: 'Elections',
      description: 'Secure digital voter registration with identity verification',
      status: 'maintenance',
      users: 0,
      avgProcessingTime: '45 min',
      successRate: 99.2,
      icon: Vote,
      color: 'from-purple-500 to-pink-500',
      lastUpdate: '15 min ago',
      estimatedWaitTime: 'Under maintenance'
    },
    {
      id: 'business-licenses',
      name: 'Business Licenses',
      category: 'Business',
      description: 'Streamlined business licensing with AI compliance assistance',
      status: 'active',
      users: 892,
      avgProcessingTime: '2.8 days',
      successRate: 94.3,
      icon: Briefcase,
      color: 'from-cyan-500 to-blue-500',
      lastUpdate: '5 min ago',
      estimatedWaitTime: '48 hours'
    },
    {
      id: 'healthcare-enrollment',
      name: 'Healthcare Enrollment',
      category: 'Healthcare',
      description: 'Smart healthcare program enrollment with eligibility verification',
      status: 'active',
      users: 2534,
      avgProcessingTime: '4.1 hours',
      successRate: 97.1,
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      lastUpdate: '3 min ago',
      estimatedWaitTime: '6 hours'
    },
    {
      id: 'education-services',
      name: 'Education Services',
      category: 'Education',
      description: 'Digital education service requests and school enrollment',
      status: 'active',
      users: 1678,
      avgProcessingTime: '1.2 days',
      successRate: 95.8,
      icon: GraduationCap,
      color: 'from-indigo-500 to-purple-500',
      lastUpdate: '7 min ago',
      estimatedWaitTime: '12 hours'
    },
    {
      id: 'vehicle-registration',
      name: 'Vehicle Registration',
      category: 'Transportation',
      description: 'Automated vehicle registration and renewal services',
      status: 'active',
      users: 3241,
      avgProcessingTime: '25 min',
      successRate: 99.4,
      icon: Car,
      color: 'from-green-500 to-teal-500',
      lastUpdate: '4 min ago',
      estimatedWaitTime: '30 minutes'
    },
    {
      id: 'legal-services',
      name: 'Legal Services',
      category: 'Legal',
      description: 'AI-assisted legal document processing and court services',
      status: 'active',
      users: 1156,
      avgProcessingTime: '6.3 days',
      successRate: 91.7,
      icon: Scale,
      color: 'from-yellow-500 to-orange-500',
      lastUpdate: '12 min ago',
      estimatedWaitTime: '3-5 days'
    }
  ])

  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([
    {
      id: 'req-001',
      serviceName: 'Building Permits',
      applicantName: 'John Martinez',
      status: 'processing',
      submittedDate: '2025-08-07',
      estimatedCompletion: '2025-08-10',
      priority: 'high'
    },
    {
      id: 'req-002',
      serviceName: 'Tax Services',
      applicantName: 'Sarah Johnson',
      status: 'approved',
      submittedDate: '2025-08-07',
      estimatedCompletion: '2025-08-07',
      priority: 'medium'
    },
    {
      id: 'req-003',
      serviceName: 'Business Licenses',
      applicantName: 'Tech Innovations LLC',
      status: 'pending',
      submittedDate: '2025-08-06',
      estimatedCompletion: '2025-08-09',
      priority: 'low'
    },
    {
      id: 'req-004',
      serviceName: 'Healthcare Enrollment',
      applicantName: 'Maria Rodriguez',
      status: 'processing',
      submittedDate: '2025-08-06',
      estimatedCompletion: '2025-08-08',
      priority: 'high'
    }
  ])

  const categories = [
    { id: 'all', label: 'All Services', count: services.length },
    { id: 'Construction', label: 'Construction', count: services.filter(s => s.category === 'Construction').length },
    { id: 'Finance', label: 'Finance', count: services.filter(s => s.category === 'Finance').length },
    { id: 'Business', label: 'Business', count: services.filter(s => s.category === 'Business').length },
    { id: 'Healthcare', label: 'Healthcare', count: services.filter(s => s.category === 'Healthcare').length },
    { id: 'Education', label: 'Education', count: services.filter(s => s.category === 'Education').length },
    { id: 'Transportation', label: 'Transportation', count: services.filter(s => s.category === 'Transportation').length }
  ]

  const tabs = [
    { id: 'services', label: 'Services', icon: Building2 },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'automation', label: 'AI Automation', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setServiceStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 3),
        completedToday: prev.completedToday + Math.floor(Math.random() * 2)
      }))
    }, 10000)

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
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Government Services
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Service Automation & Efficiency</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{serviceStats.totalRequests.toLocaleString()} Requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{serviceStats.completedToday} Completed Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{serviceStats.averageWaitTime} Avg Wait</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Refresh Status
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

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Service Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.totalRequests.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% this month</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Citizen Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.citizenSatisfaction}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.1% improvement</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Digital Adoption</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.digitalAdoption}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3% growth</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.costSavings}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Annual savings</span>
                </div>
              </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <motion.div
                      key={service.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'active' ? 'bg-green-100 text-green-800' :
                            service.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {service.status}
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Users</span>
                          <span className="font-medium">{service.users.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Processing</span>
                          <span className="font-medium">{service.avgProcessingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate</span>
                          <span className="font-medium">{service.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Wait Time</span>
                          <span className="font-medium">{service.estimatedWaitTime}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                          <span>Access Service</span>
                          <ArrowRight className="w-4 h-4 inline ml-2" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs content placeholder */}
        {activeTab !== 'services' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Features</h3>
            <p className="text-gray-600 mb-6">Advanced {activeTab} features are being implemented for government service automation.</p>
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
              <Building2 className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Service Automation</h3>
              <p className="text-teal-100 text-sm">AI-powered automation reduces processing time by 75% on average.</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Smart Processing</h3>
              <p className="text-blue-100 text-sm">Intelligent workflow optimization and predictive service delivery.</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Citizen-Centric</h3>
              <p className="text-indigo-100 text-sm">Designed for maximum accessibility and user satisfaction.</p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
