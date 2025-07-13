'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Eye,
  Filter,
  Search,
  Server,
  Settings,
  TrendingUp,
  Users,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'

export default function LogAIDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    logsPerMinute: 0,
    errorsPerMinute: 0,
    avgResponseTime: 0,
    activeApps: 0,
    totalLogs: 0,
    errorRate: 0,
    activeUsers: 0
  })

  const [logs, setLogs] = useState([
    {
      id: '1',
      timestamp: new Date(),
      level: 'INFO' as const,
      app: 'codai',
      message: 'User authentication successful',
      userId: 'user_123'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30000),
      level: 'ERROR' as const,
      app: 'romai',
      message: 'AI processing timeout',
      userId: 'user_456'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60000),
      level: 'WARN' as const,
      app: 'dexai',
      message: 'Dictionary lookup slow response',
      userId: 'user_789'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 90000),
      level: 'INFO' as const,
      app: 'conversai',
      message: 'Email sent successfully',
      userId: 'user_101'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 120000),
      level: 'INFO' as const,
      app: 'donai',
      message: 'Donation processed successfully',
      userId: 'user_202'
    }
  ])

  const applicationStats = [
    { name: 'CODAI', logs: 12543, errors: 23, avgResponse: 145, status: 'healthy' },
    { name: 'RomAI', logs: 8721, errors: 45, avgResponse: 892, status: 'warning' },
    { name: 'DexAI', logs: 5432, errors: 12, avgResponse: 234, status: 'healthy' },
    { name: 'ConversAI', logs: 3245, errors: 8, avgResponse: 156, status: 'healthy' },
    { name: 'DonAI', logs: 2156, errors: 5, avgResponse: 189, status: 'healthy' }
  ]

  const aiInsights = [
    {
      type: 'anomaly',
      title: 'Creștere neobișnuită a erorilor',
      description: 'RomAI are o rată de erori de 3x peste normal în ultima oră',
      confidence: 85,
      actionable: true
    },
    {
      type: 'prediction',
      title: 'Degradare potențială performanță',
      description: 'Timpul de răspuns pentru AI processing crește progresiv',
      confidence: 72,
      actionable: true
    },
    {
      type: 'pattern',
      title: 'Utilizare crescută weekend',
      description: 'ConversAI are trafic cu 40% mai mare în weekenduri',
      confidence: 95,
      actionable: false
    }
  ]

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        ...prev,
        logsPerMinute: Math.floor(Math.random() * 100) + 50,
        errorsPerMinute: Math.floor(Math.random() * 5),
        avgResponseTime: Math.floor(Math.random() * 200) + 100,
        activeApps: 5,
        totalLogs: prev.totalLogs + Math.floor(Math.random() * 10) + 5,
        errorRate: Math.random() * 2,
        activeUsers: Math.floor(Math.random() * 50) + 200
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50'
      case 'WARN': return 'text-yellow-600 bg-yellow-50'
      case 'INFO': return 'text-blue-600 bg-blue-50'
      case 'DEBUG': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="w-4 h-4" />
      case 'WARN': return <AlertCircle className="w-4 h-4" />
      case 'INFO': return <Info className="w-4 h-4" />
      case 'DEBUG': return <CheckCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LogAI Universal</h1>
                <p className="text-xs text-gray-500">CODAI Ecosystem Monitoring</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'logs', label: 'Logs', icon: Eye },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Real-time Metrics */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-time Monitoring</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">{realtimeMetrics.logsPerMinute}</span>
                  </div>
                  <div className="text-sm text-gray-600">Logs/min</div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <span className="text-2xl font-bold text-gray-900">{realtimeMetrics.errorsPerMinute}</span>
                  </div>
                  <div className="text-sm text-gray-600">Errors/min</div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{realtimeMetrics.avgResponseTime}ms</span>
                  </div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900">{realtimeMetrics.activeUsers}</span>
                  </div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Application Status</h2>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">CODAI Ecosystem Health</h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {applicationStats.map((app) => (
                    <div key={app.name} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{app.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{app.name}</div>
                          <div className="text-sm text-gray-600">{app.logs.toLocaleString()} logs today</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900">{app.errors}</div>
                          <div className="text-xs text-gray-600">Errors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900">{app.avgResponse}ms</div>
                          <div className="text-xs text-gray-600">Avg Response</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status === 'healthy' ? 'Sănătos' : app.status === 'warning' ? 'Atenționare' : 'Eroare'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h2>

              <div className="grid md:grid-cols-3 gap-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-900 capitalize">{insight.type}</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {insight.confidence}% confidence
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{insight.description}</p>

                    {insight.actionable && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Vizualizează detalii →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Live Logs</h2>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Caută în logs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getLevelColor(log.level)}`}>
                          {getLevelIcon(log.level)}
                          <span>{log.level}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-semibold text-gray-900">{log.app}</span>
                            <span className="text-sm text-gray-500">
                              {log.timestamp.toLocaleTimeString('ro-RO')}
                            </span>
                          </div>
                          <div className="text-gray-700 mb-1">{log.message}</div>
                          {log.userId && (
                            <div className="text-xs text-gray-500">User: {log.userId}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Charts will be implemented with Recharts library
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Alert Management</h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Active Alerts</h3>
              <div className="text-gray-500">No active alerts</div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">LogAI Configuration</h3>
              <div className="text-gray-500">Configuration options will be implemented</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
