'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Sun,
  BarChart3,
  Battery,
  Zap,
  Cloud,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Calendar,
  Clock,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Home,
  Building2,
  Factory
} from 'lucide-react'

interface SolarSystemData {
  id: string
  name: string
  currentProduction: number
  dailyProduction: number
  efficiency: number
  status: 'optimal' | 'warning' | 'maintenance'
  location: string
  panels: number
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  cloudCover: number
  uvIndex: number
  forecast: string
}

interface EnergyMetrics {
  currentGeneration: number
  dailyGeneration: number
  monthlyGeneration: number
  totalSavings: number
  co2Avoided: number
  gridExport: number
}

export default function SunAIDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('today')

  // Real-time data simulation
  const [energyMetrics, setEnergyMetrics] = useState<EnergyMetrics>({
    currentGeneration: 8.5,
    dailyGeneration: 42.3,
    monthlyGeneration: 1247.8,
    totalSavings: 15420,
    co2Avoided: 12.8,
    gridExport: 3.2
  })

  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    cloudCover: 15,
    uvIndex: 8,
    forecast: 'Optimal solar conditions'
  })

  const [solarSystems] = useState<SolarSystemData[]>([
    {
      id: '1',
      name: 'Main Residential System',
      currentProduction: 8.5,
      dailyProduction: 42.3,
      efficiency: 94.2,
      status: 'optimal',
      location: 'Rooftop North',
      panels: 24
    },
    {
      id: '2',
      name: 'Commercial Building A',
      currentProduction: 15.8,
      dailyProduction: 89.7,
      efficiency: 91.8,
      status: 'optimal',
      location: 'Building Complex',
      panels: 48
    },
    {
      id: '3',
      name: 'Backup Solar Array',
      currentProduction: 3.2,
      dailyProduction: 18.9,
      efficiency: 87.5,
      status: 'warning',
      location: 'Ground Mount',
      panels: 12
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Simulate real-time energy data updates
      setEnergyMetrics(prev => ({
        ...prev,
        currentGeneration: Math.max(0, prev.currentGeneration + (Math.random() - 0.5) * 0.5),
        dailyGeneration: prev.dailyGeneration + (Math.random() * 0.1),
        gridExport: Math.max(0, prev.gridExport + (Math.random() - 0.5) * 0.3)
      }))
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Sun },
    { id: 'production', name: 'Production', icon: Zap },
    { id: 'systems', name: 'Systems', icon: Activity },
    { id: 'weather', name: 'Weather', icon: Cloud },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'insights', name: 'AI Insights', icon: Lightbulb }
  ]

  const timeRanges = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-emerald-400'
      case 'warning': return 'text-yellow-400'
      case 'maintenance': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return CheckCircle
      case 'warning': return AlertTriangle
      case 'maintenance': return Settings
      default: return Activity
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-yellow-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  SunAI Dashboard
                </h1>
                <p className="text-sm text-gray-600">Solar Energy Intelligence Platform</p>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">
                  {energyMetrics.currentGeneration.toFixed(1)} kW
                </div>
                <div className="text-xs text-gray-500">Current Generation</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  {energyMetrics.dailyGeneration.toFixed(1)} kWh
                </div>
                <div className="text-xs text-gray-500">Today's Production</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600">
                  94.2%
                </div>
                <div className="text-xs text-gray-500">System Efficiency</div>
              </div>
            </div>

            {/* Time Display */}
            <div className="text-right text-sm text-gray-600">
              <div className="font-medium">{currentTime.toLocaleDateString()}</div>
              <div className="text-xs">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-yellow-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
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

            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedTimeRange(range.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === range.id
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Energy Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {energyMetrics.currentGeneration.toFixed(1)} kW
                      </div>
                      <div className="text-sm text-gray-600">Current Generation</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+5.2% vs yesterday</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {energyMetrics.dailyGeneration.toFixed(1)} kWh
                      </div>
                      <div className="text-sm text-gray-600">Today's Production</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+8.7% vs average</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        ${energyMetrics.totalSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Savings</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+12.3% this month</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {energyMetrics.co2Avoided.toFixed(1)} tons
                      </div>
                      <div className="text-sm text-gray-600">CO₂ Avoided</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">Environmental impact</span>
                  </div>
                </motion.div>
              </div>

              {/* Solar Systems Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Systems Status */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Solar Systems</h3>
                    <Link 
                      href="/maintenance"
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {solarSystems.map((system) => {
                      const StatusIcon = getStatusIcon(system.status)
                      return (
                        <div key={system.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className={`w-5 h-5 ${getStatusColor(system.status)}`} />
                            <div>
                              <div className="font-medium text-gray-800">{system.name}</div>
                              <div className="text-sm text-gray-500">{system.location} • {system.panels} panels</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-yellow-600">{system.currentProduction} kW</div>
                            <div className="text-sm text-gray-500">{system.efficiency}% efficiency</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Weather Conditions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Weather Conditions</h3>
                    <Link 
                      href="/weather"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      Forecast <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Thermometer className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-semibold text-gray-800">{weatherData.temperature}°C</div>
                        <div className="text-sm text-gray-500">Temperature</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-semibold text-gray-800">{weatherData.humidity}%</div>
                        <div className="text-sm text-gray-500">Humidity</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Wind className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-semibold text-gray-800">{weatherData.windSpeed} km/h</div>
                        <div className="text-sm text-gray-500">Wind Speed</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Cloud className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-semibold text-gray-800">{weatherData.cloudCover}%</div>
                        <div className="text-sm text-gray-500">Cloud Cover</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">{weatherData.forecast}</div>
                    <div className="text-xs text-blue-600 mt-1">UV Index: {weatherData.uvIndex}/10</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/analytics">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Solar Analytics</h4>
                        <p className="text-sm text-gray-600">Energy production analysis</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/energy-management">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                        <Battery className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Energy Management</h4>
                        <p className="text-sm text-gray-600">Optimize consumption</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/maintenance">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Maintenance</h4>
                        <p className="text-sm text-gray-600">System monitoring</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'production' && (
            <motion.div
              key="production"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Production Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy Production Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {energyMetrics.currentGeneration.toFixed(1)} kW
                    </div>
                    <div className="text-sm text-gray-600">Current Production</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {energyMetrics.dailyGeneration.toFixed(1)} kWh
                    </div>
                    <div className="text-sm text-gray-600">Today's Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {energyMetrics.monthlyGeneration.toFixed(1)} kWh
                    </div>
                    <div className="text-sm text-gray-600">Monthly Total</div>
                  </div>
                </div>
              </div>

              {/* Production Chart Placeholder */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Trends</h3>
                <div className="h-64 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Interactive production chart will be displayed here</p>
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
                <BarChart3 className="w-6 h-6" />
                <h4 className="font-semibold">Solar Analytics</h4>
              </div>
              <p className="text-sm opacity-90">Advanced energy production analysis and forecasting</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Lightbulb className="w-6 h-6" />
                <h4 className="font-semibold">AI Optimization</h4>
              </div>
              <p className="text-sm opacity-90">Smart energy management and efficiency recommendations</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Activity className="w-6 h-6" />
                <h4 className="font-semibold">Real-time Monitoring</h4>
              </div>
              <p className="text-sm opacity-90">Live system performance and health monitoring</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
