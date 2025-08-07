'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Users, Shield, TrendingUp, FileText, Database,
  BarChart3, AlertCircle, CheckCircle, Clock, Eye, Vote,
  MessageSquare, Calendar, Settings, RefreshCw, Download,
  Search, Filter, Bell, Globe, Zap, ArrowUp, ArrowDown,
  Activity, PieChart, Target, Award
} from 'lucide-react'

interface CivicMetrics {
  totalCitizens: number
  activeServices: number
  transparencyScore: number
  publicSatisfaction: number
  responseTime: string
  dataRequests: number
  publicMeetings: number
  policyChanges: number
}

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'maintenance' | 'offline'
  users: number
  uptime: number
  lastUpdate: string
}

interface PublicData {
  category: string
  records: number
  lastUpdated: string
  accessCount: number
  format: string
}

export default function PublicAIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [civicMetrics, setCivicMetrics] = useState<CivicMetrics>({
    totalCitizens: 847623,
    activeServices: 47,
    transparencyScore: 94.7,
    publicSatisfaction: 89.2,
    responseTime: '2.4h',
    dataRequests: 1247,
    publicMeetings: 23,
    policyChanges: 8
  })

  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([
    {
      id: 'permits',
      name: 'Building Permits',
      status: 'operational',
      users: 1847,
      uptime: 99.8,
      lastUpdate: '2 min ago'
    },
    {
      id: 'tax-services',
      name: 'Tax Services',
      status: 'operational',
      users: 3926,
      uptime: 99.9,
      lastUpdate: '1 min ago'
    },
    {
      id: 'voting',
      name: 'Voting Portal',
      status: 'maintenance',
      users: 0,
      uptime: 95.2,
      lastUpdate: '15 min ago'
    },
    {
      id: 'public-records',
      name: 'Public Records',
      status: 'operational',
      users: 2534,
      uptime: 99.5,
      lastUpdate: '3 min ago'
    }
  ])

  const [publicData, setPublicData] = useState<PublicData[]>([
    {
      category: 'Budget & Finance',
      records: 12847,
      lastUpdated: '2025-08-07',
      accessCount: 3926,
      format: 'JSON, CSV'
    },
    {
      category: 'Public Safety',
      records: 8534,
      lastUpdated: '2025-08-07',
      accessCount: 2187,
      format: 'JSON, XML'
    },
    {
      category: 'Transportation',
      records: 15672,
      lastUpdated: '2025-08-06',
      accessCount: 1843,
      format: 'CSV, API'
    },
    {
      category: 'Environmental',
      records: 6789,
      lastUpdated: '2025-08-07',
      accessCount: 1256,
      format: 'JSON, PDF'
    }
  ])

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setCivicMetrics(prev => ({
        ...prev,
        dataRequests: prev.dataRequests + Math.floor(Math.random() * 3),
        publicSatisfaction: Math.min(100, prev.publicSatisfaction + (Math.random() - 0.5) * 0.1)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'services', label: 'Services', icon: Users },
    { id: 'transparency', label: 'Transparency', icon: Eye },
    { id: 'engagement', label: 'Engagement', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'data', label: 'Public Data', icon: Database }
  ]

  const quickActions = [
    {
      title: 'Government Services',
      description: 'AI-powered government service automation',
      icon: Building2,
      color: 'from-teal-500 to-cyan-500',
      href: '/government-services'
    },
    {
      title: 'Transparency Portal',
      description: 'Data transparency and accountability',
      icon: Eye,
      color: 'from-blue-500 to-indigo-500',
      href: '/transparency-portal'
    },
    {
      title: 'Citizen Engagement',
      description: 'Public participation and feedback',
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
      href: '/citizen-engagement'
    },
    {
      title: 'Policy Analytics',
      description: 'AI-driven policy analysis',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      href: '/policy-analytics'
    },
    {
      title: 'Public Data',
      description: 'Open data visualization',
      icon: Database,
      color: 'from-purple-500 to-pink-500',
      href: '/public-data'
    },
    {
      title: 'Settings',
      description: 'Platform configuration',
      icon: Settings,
      color: 'from-pink-500 to-rose-500',
      href: '/settings'
    }
  ]

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
                  PublicAI Dashboard
                </h1>
                <p className="text-sm text-gray-600">Civic AI & Public Sector Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{civicMetrics.totalCitizens.toLocaleString()} Citizens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{civicMetrics.transparencyScore}% Transparency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{civicMetrics.activeServices} Services</span>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Sync Data
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
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
            {/* Civic Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Citizens</p>
                    <p className="text-2xl font-bold text-gray-900">{civicMetrics.totalCitizens.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.3% from last month</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                    <p className="text-2xl font-bold text-gray-900">{civicMetrics.activeServices}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">All operational</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transparency Score</p>
                    <p className="text-2xl font-bold text-gray-900">{civicMetrics.transparencyScore}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+1.2% this week</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Public Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{civicMetrics.publicSatisfaction.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Above target</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <motion.div
                      key={action.title}
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6 hover:shadow-lg transition-all cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Data Requests</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="font-medium text-gray-900">Budget Reports</p>
                        <p className="text-sm text-gray-600">Financial transparency request</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Safety Statistics</p>
                        <p className="text-sm text-gray-600">Public safety data request</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">15 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">Meeting Minutes</p>
                        <p className="text-sm text-gray-600">City council transparency</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">1 hour ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-4">
                  {serviceStatuses.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          service.status === 'operational' ? 'bg-green-500' :
                          service.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.users.toLocaleString()} active users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{service.uptime}%</p>
                        <p className="text-xs text-gray-500">{service.lastUpdate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Government Services</h2>
                <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh Status
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceStatuses.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'operational' ? 'bg-green-100 text-green-800' :
                        service.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {service.status}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Users</span>
                        <span className="text-sm font-medium">{service.users.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="text-sm font-medium">{service.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Update</span>
                        <span className="text-sm font-medium">{service.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional tabs would be implemented here */}
        {activeTab !== 'overview' && activeTab !== 'services' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Features</h3>
            <p className="text-gray-600 mb-6">Advanced {activeTab} features are being implemented for the PublicAI platform.</p>
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
              <h3 className="text-lg font-semibold mb-2">Civic Engagement</h3>
              <p className="text-teal-100 text-sm">Connect citizens with government services through AI-powered platforms.</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Eye className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Transparency</h3>
              <p className="text-blue-100 text-sm">Promote open government through accessible data and accountability.</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Innovation</h3>
              <p className="text-indigo-100 text-sm">Leverage artificial intelligence to improve public service delivery.</p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
