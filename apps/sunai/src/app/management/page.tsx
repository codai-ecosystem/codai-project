'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Sun,
  Zap,
  Battery,
  Home,
  Building,
  Cpu,
  Power,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Gauge,
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Maximize2,
  Grid3X3,
  Lightbulb,
  AirVent,
  Thermometer,
  Wifi,
  Monitor,
  HardDrive,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react'

interface EnergyConsumer {
  id: string
  name: string
  type: 'hvac' | 'lighting' | 'appliances' | 'electronics' | 'water_heating' | 'ev_charging'
  consumption: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'standby' | 'scheduled' | 'offline'
  efficiency: number
  schedulable: boolean
  currentLoad: number
  maxLoad: number
}

interface GridConnection {
  id: string
  name: string
  type: 'solar' | 'grid' | 'battery' | 'generator'
  capacity: number
  currentOutput: number
  status: 'online' | 'offline' | 'maintenance'
  efficiency: number
}

interface EnergySchedule {
  id: string
  name: string
  device: string
  startTime: string
  duration: number
  energyRequired: number
  priority: number
  status: 'scheduled' | 'running' | 'completed' | 'cancelled'
}

export default function EnergyManagement() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('consumption')
  const [selectedTimeRange, setSelectedTimeRange] = useState('today')
  const [autoOptimization, setAutoOptimization] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Energy consumption data
  const [energyConsumers] = useState<EnergyConsumer[]>([
    {
      id: '1',
      name: 'HVAC System',
      type: 'hvac',
      consumption: 12.5,
      priority: 'critical',
      status: 'active',
      efficiency: 89.2,
      schedulable: true,
      currentLoad: 12.5,
      maxLoad: 18.0
    },
    {
      id: '2',
      name: 'Main Lighting',
      type: 'lighting',
      consumption: 3.2,
      priority: 'high',
      status: 'active',
      efficiency: 95.8,
      schedulable: true,
      currentLoad: 3.2,
      maxLoad: 8.5
    },
    {
      id: '3',
      name: 'Kitchen Appliances',
      type: 'appliances',
      consumption: 4.8,
      priority: 'medium',
      status: 'standby',
      efficiency: 87.3,
      schedulable: true,
      currentLoad: 1.2,
      maxLoad: 15.0
    },
    {
      id: '4',
      name: 'Electronics & IT',
      type: 'electronics',
      consumption: 6.7,
      priority: 'high',
      status: 'active',
      efficiency: 92.1,
      schedulable: false,
      currentLoad: 6.7,
      maxLoad: 12.0
    },
    {
      id: '5',
      name: 'Water Heating',
      type: 'water_heating',
      consumption: 8.3,
      priority: 'medium',
      status: 'scheduled',
      efficiency: 84.5,
      schedulable: true,
      currentLoad: 0,
      maxLoad: 12.0
    },
    {
      id: '6',
      name: 'EV Charging Station',
      type: 'ev_charging',
      consumption: 0,
      priority: 'low',
      status: 'standby',
      efficiency: 96.2,
      schedulable: true,
      currentLoad: 0,
      maxLoad: 22.0
    }
  ])

  // Grid connections data
  const [gridConnections] = useState<GridConnection[]>([
    {
      id: '1',
      name: 'Solar Array',
      type: 'solar',
      capacity: 45.0,
      currentOutput: 32.8,
      status: 'online',
      efficiency: 94.2
    },
    {
      id: '2',
      name: 'Grid Connection',
      type: 'grid',
      capacity: 100.0,
      currentOutput: 12.5,
      status: 'online',
      efficiency: 98.5
    },
    {
      id: '3',
      name: 'Battery Storage',
      type: 'battery',
      capacity: 25.0,
      currentOutput: 0,
      status: 'online',
      efficiency: 91.8
    },
    {
      id: '4',
      name: 'Backup Generator',
      type: 'generator',
      capacity: 30.0,
      currentOutput: 0,
      status: 'offline',
      efficiency: 78.5
    }
  ])

  // Energy schedule data
  const [energySchedule] = useState<EnergySchedule[]>([
    {
      id: '1',
      name: 'Water Heater Morning',
      device: 'Water Heating',
      startTime: '06:00',
      duration: 120,
      energyRequired: 8.3,
      priority: 2,
      status: 'completed'
    },
    {
      id: '2',
      name: 'EV Charging Overnight',
      device: 'EV Charging Station',
      startTime: '23:00',
      duration: 480,
      energyRequired: 45.0,
      priority: 1,
      status: 'scheduled'
    },
    {
      id: '3',
      name: 'Pool Pump Cycle',
      device: 'Pool Equipment',
      startTime: '14:00',
      duration: 180,
      energyRequired: 5.2,
      priority: 3,
      status: 'running'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'consumption', name: 'Consumption Overview', icon: Gauge },
    { id: 'optimization', name: 'Load Optimization', icon: TrendingUp },
    { id: 'scheduling', name: 'Smart Scheduling', icon: Calendar },
    { id: 'grid', name: 'Grid Management', icon: Grid3X3 },
    { id: 'automation', name: 'Automation Rules', icon: Settings },
    { id: 'storage', name: 'Energy Storage', icon: Battery }
  ]

  const getConsumerIcon = (type: string) => {
    switch (type) {
      case 'hvac': return AirVent
      case 'lighting': return Lightbulb
      case 'appliances': return Home
      case 'electronics': return Monitor
      case 'water_heating': return Thermometer
      case 'ev_charging': return Zap
      default: return Power
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'standby': return 'text-yellow-500'
      case 'scheduled': return 'text-blue-500'
      case 'offline': return 'text-red-500'
      case 'online': return 'text-green-500'
      case 'maintenance': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalConsumption = energyConsumers.reduce((sum, consumer) => sum + consumer.currentLoad, 0)
  const totalCapacity = gridConnections.reduce((sum, connection) => sum + connection.capacity, 0)
  const totalOutput = gridConnections.reduce((sum, connection) => sum + connection.currentOutput, 0)
  const gridEfficiency = totalOutput > 0 ? (totalConsumption / totalOutput) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-yellow-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Energy Management
                  </h1>
                  <p className="text-sm text-gray-600">Power Optimization & Control</p>
                </div>
              </Link>
            </div>

            {/* Energy Metrics */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">
                  {totalConsumption.toFixed(1)} kW
                </div>
                <div className="text-xs text-gray-500">Current Load</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  {totalOutput.toFixed(1)} kW
                </div>
                <div className="text-xs text-gray-500">Total Output</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {gridEfficiency.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Grid Efficiency</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto Optimize:</span>
                <button
                  onClick={() => setAutoOptimization(!autoOptimization)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoOptimization ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoOptimization ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-yellow-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'consumption' && (
            <motion.div
              key="consumption"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Energy Flow Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Consumption */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Current Consumption</h3>
                    <Gauge className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {totalConsumption.toFixed(1)} kW
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Real-time usage</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalConsumption / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {((totalConsumption / 50) * 100).toFixed(1)}% of capacity
                    </div>
                  </div>
                </div>

                {/* Power Sources */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Power Sources</h3>
                    <Grid3X3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    {gridConnections.filter(conn => conn.currentOutput > 0).map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Sun className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-sm">{connection.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{connection.currentOutput} kW</div>
                          <div className="text-xs text-gray-500">{connection.efficiency}% eff</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Energy Balance */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Energy Balance</h3>
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Generation</span>
                      <span className="font-bold text-green-600">+{totalOutput.toFixed(1)} kW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Consumption</span>
                      <span className="font-bold text-red-600">-{totalConsumption.toFixed(1)} kW</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">Net Balance</span>
                        <span className={`font-bold ${(totalOutput - totalConsumption) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(totalOutput - totalConsumption) >= 0 ? '+' : ''}{(totalOutput - totalConsumption).toFixed(1)} kW
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Consumption Breakdown */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Device Consumption</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                    >
                      {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {energyConsumers.map((consumer) => {
                    const Icon = getConsumerIcon(consumer.type)
                    return (
                      <motion.div
                        key={consumer.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 bg-gray-50/70 rounded-lg border border-gray-200/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{consumer.name}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(consumer.priority)}`}>
                                  {consumer.priority}
                                </span>
                                <span className={`text-sm ${getStatusColor(consumer.status)}`}>
                                  {consumer.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="font-bold text-gray-800">{consumer.currentLoad.toFixed(1)} kW</div>
                              <div className="text-xs text-gray-500">Current Load</div>
                            </div>

                            {showAdvanced && (
                              <>
                                <div className="text-right">
                                  <div className="font-bold text-blue-600">{consumer.efficiency.toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">Efficiency</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-600">{consumer.maxLoad.toFixed(1)} kW</div>
                                  <div className="text-xs text-gray-500">Max Load</div>
                                </div>
                              </>
                            )}

                            <div className="flex items-center space-x-2">
                              {consumer.schedulable && (
                                <button className="p-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded">
                                  <Calendar className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded">
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {showAdvanced && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Load Distribution</span>
                              <span className="text-gray-600">{((consumer.currentLoad / consumer.maxLoad) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(consumer.currentLoad / consumer.maxLoad) * 100}%` }}
                              ></div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-6 text-white cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-6 h-6" />
                    <h4 className="font-semibold">Optimize Now</h4>
                  </div>
                  <p className="text-sm opacity-90">Apply AI-driven load optimization</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-6 h-6" />
                    <h4 className="font-semibold">Smart Schedule</h4>
                  </div>
                  <p className="text-sm opacity-90">Create energy-efficient schedules</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl p-6 text-white cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Battery className="w-6 h-6" />
                    <h4 className="font-semibold">Storage Control</h4>
                  </div>
                  <p className="text-sm opacity-90">Manage battery charging cycles</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'optimization' && (
            <motion.div
              key="optimization"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Load Optimization Dashboard */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Load Optimization Dashboard</h3>
                <div className="h-80 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Advanced Load Optimization</p>
                    <p className="text-sm">AI-powered consumption optimization interface</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add other tab content as needed */}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-yellow-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Gauge className="w-6 h-6" />
                <h4 className="font-semibold">Real-time Monitoring</h4>
              </div>
              <p className="text-sm opacity-90">Live energy consumption tracking and optimization</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="w-6 h-6" />
                <h4 className="font-semibold">AI Optimization</h4>
              </div>
              <p className="text-sm opacity-90">Intelligent load balancing and efficiency improvements</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Grid3X3 className="w-6 h-6" />
                <h4 className="font-semibold">Grid Integration</h4>
              </div>
              <p className="text-sm opacity-90">Smart grid management and energy distribution</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
