'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Database,
  Search,
  Filter,
  Download,
  Settings,
  Plus,
  Eye,
  Activity,
  Zap,
  Target,
  PieChart,
  LineChart,
  Users,
  DollarSign
} from 'lucide-react'

// Component imports would be from a design system
const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'blue' }: any) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {change && (
          <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'}`}>
            {changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '→'} {change}
          </p>
        )}
      </div>
      <Icon className={`h-8 w-8 text-${color}-600`} />
    </div>
  </div>
)

const InsightCard = ({ insight }: { insight: any }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <Brain className="h-5 w-5 text-purple-600" />
        <span className={`px-2 py-1 text-xs rounded-full ${
          insight.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
          insight.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {insight.priority}
        </span>
      </div>
      <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{insight.category}</span>
      <span>{insight.type.replace('_', ' ')}</span>
    </div>
  </div>
)

const ChartPlaceholder = ({ title, type }: { title: string; type: string }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-2">
        {type === 'line' && <LineChart className="h-4 w-4 text-gray-400" />}
        {type === 'bar' && <BarChart3 className="h-4 w-4 text-gray-400" />}
        {type === 'pie' && <PieChart className="h-4 w-4 text-gray-400" />}
        <Settings className="h-4 w-4 text-gray-400 cursor-pointer" />
      </div>
    </div>
    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{title} Visualization</p>
        <p className="text-xs text-gray-400">Real-time data integration</p>
      </div>
    </div>
  </div>
)

export default function AnalizaiDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [insights, setInsights] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial data
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch insights
      const insightsResponse = await fetch('/api/insights?limit=6')
      const insightsData = await insightsResponse.json()
      
      if (insightsData.success) {
        setInsights(insightsData.insights)
      }

      // Mock metrics data
      setMetrics({
        totalRevenue: { value: '€245,670', change: '+12.5%', changeType: 'increase' },
        activeUsers: { value: '12,847', change: '+8.2%', changeType: 'increase' },
        conversionRate: { value: '3.24%', change: '-0.1%', changeType: 'decrease' },
        avgSessionTime: { value: '4m 32s', change: '+15.3%', changeType: 'increase' }
      })

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'insights', name: 'AI Insights', icon: Brain },
    { id: 'queries', name: 'Data Explorer', icon: Database },
    { id: 'reports', name: 'Reports', icon: Target },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">ANALIZAI</h1>
                <span className="text-sm text-gray-500">Analytics & Business Intelligence</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="h-5 w-5" />
              </button>
              
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Query</span>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={metrics.totalRevenue?.value || '€0'}
                change={metrics.totalRevenue?.change}
                changeType={metrics.totalRevenue?.changeType}
                color="green"
              />
              <StatCard
                icon={Users}
                title="Active Users"
                value={metrics.activeUsers?.value || '0'}
                change={metrics.activeUsers?.change}
                changeType={metrics.activeUsers?.changeType}
                color="blue"
              />
              <StatCard
                icon={Target}
                title="Conversion Rate"
                value={metrics.conversionRate?.value || '0%'}
                change={metrics.conversionRate?.change}
                changeType={metrics.conversionRate?.changeType}
                color="purple"
              />
              <StatCard
                icon={Activity}
                title="Avg Session Time"
                value={metrics.avgSessionTime?.value || '0s'}
                change={metrics.avgSessionTime?.change}
                changeType={metrics.avgSessionTime?.changeType}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartPlaceholder title="Revenue Trends" type="line" />
              <ChartPlaceholder title="User Acquisition" type="bar" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ChartPlaceholder title="Traffic Sources" type="pie" />
              <ChartPlaceholder title="Conversion Funnel" type="bar" />
              <ChartPlaceholder title="User Engagement" type="line" />
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
              <div className="flex items-center space-x-4">
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option value="">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Generate Insights</span>
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map((insight, index) => (
                  <InsightCard key={insight.id || index} insight={insight} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">AI Insights Engine</h3>
                <p className="text-gray-600 mb-4">Discover patterns, trends, and optimization opportunities with AI-powered analytics</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Data Explorer</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Query</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Advanced Data Querying</h3>
              <p className="text-gray-600 mb-4">Connect to multiple data sources and run complex analytics queries</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <Database className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">SQL Queries</p>
                  <p className="text-xs text-gray-500">PostgreSQL, MySQL, etc.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Analytics APIs</p>
                  <p className="text-xs text-gray-500">Google Analytics, Mixpanel</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Real-time Data</p>
                  <p className="text-xs text-gray-500">Live dashboards</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Automated Reports</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Report</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Scheduled Reporting</h3>
              <p className="text-gray-600 mb-4">Generate and distribute automated reports to stakeholders</p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Create Report
              </button>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Smart Alerts</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Alert</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Intelligent Monitoring</h3>
              <p className="text-gray-600 mb-4">Set up automated alerts for anomalies, thresholds, and business events</p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Configure Alerts
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
