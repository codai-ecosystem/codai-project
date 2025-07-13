'use client'

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code,
  Cpu,
  Activity,
  Users,
  Zap,
  Brain,
  Server,
  Globe,
  BarChart3,
  Layers,
  Clock,
  Shield,
  Monitor,
  Terminal,
  Rocket,
  Cloud,
  GitBranch,
  Workflow
} from 'lucide-react'
import EmbeddedAide from '../components/EmbeddedAide'
import UnifiedFinancialDashboard from '../components/UnifiedFinancialDashboard'
import TradingDashboard from '../components/TradingDashboard'
import EnhancedMemoraiIntegration from '../components/EnhancedMemoraiIntegration'
import { EnterpriseComplianceDashboard } from '../components/EnterpriseComplianceDashboard'
import { ProductionDeploymentDashboard } from '../components/ProductionDeploymentDashboard'

const inter = Inter({ subsets: ['latin'] })

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'loading'
  port: number
  url: string
  type: string
}

export default function CodaiPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'aide' | 'services' | 'monitoring' | 'finance' | 'trading' | 'memorai' | 'enterprise' | 'deployment'>('overview')
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'MEMORAI', status: 'online', port: 4031, url: 'http://localhost:4031', type: 'Database' },
    { name: 'LOGAI', status: 'online', port: 4032, url: 'http://localhost:4032', type: 'Auth' },
    { name: 'AIDE', status: 'online', port: 4002, url: 'http://localhost:4002', type: 'Development' },
    { name: 'BANCAI', status: 'online', port: 4033, url: 'http://localhost:4033', type: 'Finance' },
    { name: 'WALLET', status: 'online', port: 4034, url: 'http://localhost:4034', type: 'Wallet' },
    { name: 'X TRADING', status: 'online', port: 4039, url: 'http://localhost:4039', type: 'Trading' }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Check service health status
    const checkServices = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await fetch(`${service.url}/health`)
            if (response.ok) {
              return { ...service, status: 'online' as const }
            }
          } catch (error) {
            // Service offline
          }
          return { ...service, status: 'offline' as const }
        })
      )
      setServices(updatedServices)
    }

    checkServices()
    const interval = setInterval(checkServices, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const openAIDE = () => {
    window.open('http://localhost:4002', '_blank')
  }

  const openService = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className={inter.className}>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -50, 20, 0],
                scale: [1, 1.1, 0.9, 1]
              }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{
                x: [0, -30, 20, 0],
                y: [0, 30, -20, 0],
                scale: [1, 0.9, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{
                x: [0, 20, -30, 0],
                y: [0, -20, 30, 0],
                scale: [1, 1.05, 0.95, 1]
              }}
              transition={{ duration: 9, repeat: Infinity, delay: 2 }}
            />
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6">
          <nav className="flex items-center justify-between">
            <motion.div
              className="text-2xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              CODAI
            </motion.div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-sm text-slate-300">
                  Port 4030 • {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </nav>
        </header>

        {/* Tab Navigation */}
        <div className="relative z-10 container mx-auto px-4 mb-8">
          <div className="flex justify-center space-x-1 bg-white/10 backdrop-blur-lg rounded-xl p-1 max-w-4xl mx-auto">
            {(['overview', 'aide', 'services', 'monitoring', 'finance', 'trading', 'memorai', 'enterprise', 'deployment'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === tab
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <h1 className="text-6xl font-bold mb-6">
                    <span className="gradient-text animate-gradient-x">
                      CODAI
                    </span>
                  </h1>
                  <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                    Central Platform & AIDE Hub. Build software just by talking to AI.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-blue-400">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">AI Development Environment Active</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <motion.button
                    onClick={openAIDE}
                    className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Terminal className="w-12 h-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Launch AIDE</h3>
                    <p className="text-slate-400">Start coding with AI assistance</p>
                  </motion.button>

                  <motion.button
                    onClick={() => openService('http://localhost:4031')}
                    className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Server className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">MEMORAI</h3>
                    <p className="text-slate-400">AI Memory & Database</p>
                  </motion.button>

                  <motion.button
                    onClick={() => openService('http://localhost:4032')}
                    className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield className="w-12 h-12 text-green-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">LOGAI</h3>
                    <p className="text-slate-400">Authentication Hub</p>
                  </motion.button>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <motion.div className="data-card" whileHover={{ scale: 1.02, rotateY: 5 }}>
                    <Brain className="w-12 h-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">AI-First Development</h3>
                    <p className="text-slate-400">Describe your project, get working code. Chat-driven development for everyone.</p>
                  </motion.div>

                  <motion.div className="data-card" whileHover={{ scale: 1.02, rotateY: 5 }}>
                    <Workflow className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ecosystem Integration</h3>
                    <p className="text-slate-400">Seamless connection between all Codai services with unified authentication.</p>
                  </motion.div>

                  <motion.div className="data-card" whileHover={{ scale: 1.02, rotateY: 5 }}>
                    <Rocket className="w-12 h-12 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
                    <p className="text-slate-400">New project in 30 seconds. Deploy to any subdomain with secure agent signing.</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'aide' && (
              <motion.div
                key="aide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <Terminal className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-4xl font-bold mb-4">AIDE Development Environment</h2>
                    <p className="text-xl text-slate-300">AI-powered coding assistant for conversational software development</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Embedded AIDE Interface */}
                    <div className="lg:col-span-1">
                      <EmbeddedAide />
                    </div>

                    {/* Feature Information */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-card p-6">
                        <Code className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Chat-Driven Development</h3>
                        <ul className="space-y-2 text-slate-300">
                          <li>• Describe your project in natural language</li>
                          <li>• AI generates working code in real-time</li>
                          <li>• Iterative refinement through conversation</li>
                          <li>• Support for multiple programming languages</li>
                        </ul>
                      </div>

                      <div className="glass-card p-6">
                        <GitBranch className="w-8 h-8 text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">GitHub Integration</h3>
                        <ul className="space-y-2 text-slate-300">
                          <li>• Built-in GitHub Copilot support</li>
                          <li>• Automatic repository creation</li>
                          <li>• Version control integration</li>
                          <li>• Collaborative development features</li>
                        </ul>
                      </div>

                      <div className="glass-card p-6">
                        <Cloud className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Instant Deployment</h3>
                        <ul className="space-y-2 text-slate-300">
                          <li>• One-click deployment to Vercel</li>
                          <li>• Automatic CI/CD pipeline setup</li>
                          <li>• Custom domain configuration</li>
                          <li>• Environment management</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <motion.button
                      onClick={openAIDE}
                      className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Open Full AIDE Environment
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-12">
                  <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold mb-4">Ecosystem Services</h2>
                  <p className="text-xl text-slate-300">Interconnected AI services for the modern web</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <motion.div
                      key={service.name}
                      className="glass-card p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                      onClick={() => openService(service.url)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">{service.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${service.status === 'online' ? 'bg-emerald-400' :
                            service.status === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                          } animate-pulse`}></div>
                      </div>
                      <p className="text-slate-400 mb-2">{service.type}</p>
                      <p className="text-sm text-slate-500">Port: {service.port}</p>
                      <div className="mt-4">
                        <span className={`px-2 py-1 rounded text-xs ${service.status === 'online' ? 'bg-emerald-500/20 text-emerald-300' :
                            service.status === 'offline' ? 'bg-red-500/20 text-red-300' :
                              'bg-yellow-500/20 text-yellow-300'
                          }`}>
                          {service.status.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'monitoring' && (
              <motion.div
                key="monitoring"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-12">
                  <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold mb-4">System Monitoring</h2>
                  <p className="text-xl text-slate-300">Real-time health and performance metrics</p>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  <div className="metric-card">
                    <div className="text-2xl font-bold text-blue-400">99.9%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-2xl font-bold text-emerald-400">&lt;50ms</div>
                    <div className="text-sm text-slate-400">Response</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-2xl font-bold text-purple-400">{services.filter(s => s.status === 'online').length}</div>
                    <div className="text-sm text-slate-400">Online Services</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-2xl font-bold text-yellow-400">24/7</div>
                    <div className="text-sm text-slate-400">Available</div>
                  </div>
                </div>

                {/* Service Status Details */}
                <div className="glass-card p-6">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                    Service Health Status
                  </h3>

                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${service.status === 'online' ? 'bg-emerald-400' :
                              service.status === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                            }`}></div>
                          <div>
                            <div className="font-semibold">{service.name}</div>
                            <div className="text-sm text-slate-400">{service.type} Service</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-300">Port {service.port}</div>
                          <div className={`text-sm ${service.status === 'online' ? 'text-emerald-400' :
                              service.status === 'offline' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                            {service.status === 'online' ? 'Operational' :
                              service.status === 'offline' ? 'Offline' : 'Loading'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UnifiedFinancialDashboard />
              </motion.div>
            )}
            {activeTab === 'trading' && (
              <motion.div
                key="trading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TradingDashboard />
              </motion.div>
            )}

            {activeTab === 'memorai' && (
              <motion.div
                key="memorai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedMemoraiIntegration />
              </motion.div>
            )}

            {activeTab === 'enterprise' && (
              <motion.div
                key="enterprise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EnterpriseComplianceDashboard />
              </motion.div>
            )}

            {activeTab === 'deployment' && (
              <motion.div
                key="deployment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductionDeploymentDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}