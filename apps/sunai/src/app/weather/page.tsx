'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Eye,
  Thermometer,
  Droplets,
  Gauge,
  Zap,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Satellite,
  BarChart3,
  LineChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Share2,
  Filter,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Target,
  Brain,
  Compass,
  Sunrise,
  Sunset,
  Moon,
  Star,
  Lightbulb,
  Battery
} from 'lucide-react'

interface WeatherData {
  timestamp: string
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  uvIndex: number
  solarIrradiance: number
  visibility: number
  pressure: number
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'overcast' | 'rainy' | 'stormy'
}

interface SolarForecast {
  date: string
  expectedProduction: number
  confidence: number
  peakTime: string
  weatherImpact: number
  efficiency: number
  recommendation: string
}

interface WeatherAlert {
  id: string
  type: 'weather' | 'production' | 'maintenance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  duration: number
  impact: string
}

export default function WeatherIntelligence() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('current')
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')
  const [showSatellite, setShowSatellite] = useState(false)

  // Current weather data
  const [currentWeather] = useState<WeatherData>({
    timestamp: new Date().toISOString(),
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    windDirection: 225,
    cloudCover: 15,
    uvIndex: 8,
    solarIrradiance: 850,
    visibility: 15,
    pressure: 1013.2,
    condition: 'sunny'
  })

  // 7-day forecast data
  const [weatherForecast] = useState<WeatherData[]>([
    { timestamp: '2025-08-07', temperature: 24, humidity: 65, windSpeed: 12, windDirection: 225, cloudCover: 15, uvIndex: 8, solarIrradiance: 850, visibility: 15, pressure: 1013.2, condition: 'sunny' },
    { timestamp: '2025-08-08', temperature: 26, humidity: 58, windSpeed: 8, windDirection: 180, cloudCover: 25, uvIndex: 9, solarIrradiance: 780, visibility: 12, pressure: 1015.8, condition: 'partly_cloudy' },
    { timestamp: '2025-08-09', temperature: 22, humidity: 72, windSpeed: 15, windDirection: 270, cloudCover: 65, uvIndex: 5, solarIrradiance: 420, visibility: 8, pressure: 1008.5, condition: 'cloudy' },
    { timestamp: '2025-08-10', temperature: 19, humidity: 85, windSpeed: 18, windDirection: 290, cloudCover: 95, uvIndex: 2, solarIrradiance: 180, visibility: 5, pressure: 1005.2, condition: 'rainy' },
    { timestamp: '2025-08-11', temperature: 25, humidity: 60, windSpeed: 10, windDirection: 200, cloudCover: 35, uvIndex: 7, solarIrradiance: 720, visibility: 14, pressure: 1012.8, condition: 'partly_cloudy' },
    { timestamp: '2025-08-12', temperature: 27, humidity: 55, windSpeed: 6, windDirection: 160, cloudCover: 10, uvIndex: 9, solarIrradiance: 920, visibility: 18, pressure: 1016.5, condition: 'sunny' },
    { timestamp: '2025-08-13', temperature: 28, humidity: 52, windSpeed: 5, windDirection: 140, cloudCover: 5, uvIndex: 10, solarIrradiance: 950, visibility: 20, pressure: 1018.2, condition: 'sunny' }
  ])

  // Solar production forecast
  const [solarForecast] = useState<SolarForecast[]>([
    { date: '2025-08-07', expectedProduction: 42.3, confidence: 95, peakTime: '12:30', weatherImpact: 5, efficiency: 94.2, recommendation: 'Optimal conditions for solar generation' },
    { date: '2025-08-08', expectedProduction: 38.7, confidence: 88, peakTime: '12:45', weatherImpact: 12, efficiency: 91.5, recommendation: 'Slight cloud cover may reduce peak output' },
    { date: '2025-08-09', expectedProduction: 28.4, confidence: 72, peakTime: '13:15', weatherImpact: 35, efficiency: 85.3, recommendation: 'Cloudy conditions will significantly impact production' },
    { date: '2025-08-10', expectedProduction: 15.2, confidence: 85, peakTime: '14:00', weatherImpact: 68, efficiency: 72.1, recommendation: 'Rain expected - minimal solar generation' },
    { date: '2025-08-11', expectedProduction: 36.8, confidence: 91, peakTime: '12:20', weatherImpact: 18, efficiency: 89.7, recommendation: 'Improving conditions with good production potential' },
    { date: '2025-08-12', expectedProduction: 45.1, confidence: 97, peakTime: '12:15', weatherImpact: 3, efficiency: 96.8, recommendation: 'Excellent solar conditions - maximum efficiency expected' },
    { date: '2025-08-13', expectedProduction: 47.2, confidence: 98, peakTime: '12:10', weatherImpact: 2, efficiency: 97.5, recommendation: 'Perfect solar weather - optimal generation day' }
  ])

  // Weather alerts
  const [weatherAlerts] = useState<WeatherAlert[]>([
    {
      id: '1',
      type: 'weather',
      severity: 'medium',
      title: 'Rain Expected Tomorrow',
      description: 'Moderate rainfall predicted for Aug 10th will reduce solar production by ~65%',
      timestamp: '2025-08-09T14:30:00Z',
      duration: 18,
      impact: 'Solar production may drop to 15.2 kWh'
    },
    {
      id: '2',
      type: 'production',
      severity: 'low',
      title: 'Optimal Conditions Ahead',
      description: 'Excellent solar weather forecasted for Aug 12-13 with 97%+ efficiency',
      timestamp: '2025-08-11T09:00:00Z',
      duration: 48,
      impact: 'Expected production increase of 20%'
    },
    {
      id: '3',
      type: 'maintenance',
      severity: 'high',
      title: 'Pre-Storm Inspection Recommended',
      description: 'Strong winds (18 km/h) expected - panel inspection advised',
      timestamp: '2025-08-09T16:00:00Z',
      duration: 12,
      impact: 'Preventive maintenance window available'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'current', name: 'Current Conditions', icon: Sun },
    { id: 'forecast', name: 'Weather Forecast', icon: Calendar },
    { id: 'solar', name: 'Solar Predictions', icon: Zap },
    { id: 'impact', name: 'Impact Analysis', icon: BarChart3 },
    { id: 'alerts', name: 'Weather Alerts', icon: AlertTriangle },
    { id: 'satellite', name: 'Satellite View', icon: Satellite }
  ]

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return Sun
      case 'partly_cloudy': return Cloud
      case 'cloudy': return Cloud
      case 'overcast': return Cloud
      case 'rainy': return CloudRain
      case 'stormy': return CloudRain
      default: return Sun
    }
  }

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'text-yellow-500'
      case 'partly_cloudy': return 'text-blue-500'
      case 'cloudy': return 'text-gray-500'
      case 'overcast': return 'text-gray-600'
      case 'rainy': return 'text-blue-600'
      case 'stormy': return 'text-indigo-600'
      default: return 'text-yellow-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTime = (time: string) => {
    return new Date(`2025-08-07T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

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
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Weather Intelligence
                  </h1>
                  <p className="text-sm text-gray-600">AI-Powered Solar Forecasting</p>
                </div>
              </Link>
            </div>

            {/* Weather Summary */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold text-gray-800">{currentWeather.temperature}°C</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold text-gray-800">{currentWeather.humidity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-gray-800">{currentWeather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-600">{currentWeather.solarIrradiance} W/m²</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
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
          {activeTab === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Current Weather Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Weather Card */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-yellow-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center ${getWeatherColor(currentWeather.condition)}`}>
                        {React.createElement(getWeatherIcon(currentWeather.condition), { className: "w-8 h-8 text-white" })}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800">{currentWeather.temperature}°C</h2>
                        <p className="text-lg text-gray-600 capitalize">{currentWeather.condition.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">Optimal solar conditions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Solar Irradiance</div>
                      <div className="text-2xl font-bold text-yellow-600">{currentWeather.solarIrradiance} W/m²</div>
                      <div className="text-sm text-green-600">95% of maximum</div>
                    </div>
                  </div>

                  {/* Weather Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-blue-600">{currentWeather.humidity}%</div>
                      <div className="text-sm text-gray-600">Humidity</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Wind className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-gray-600">{currentWeather.windSpeed} km/h</div>
                      <div className="text-sm text-gray-600">Wind Speed</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                      <Gauge className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-indigo-600">{currentWeather.pressure} hPa</div>
                      <div className="text-sm text-gray-600">Pressure</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <Sun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-orange-600">{currentWeather.uvIndex}</div>
                      <div className="text-sm text-gray-600">UV Index</div>
                    </div>
                  </div>
                </div>

                {/* Solar Impact Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Solar Impact</h3>
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">Excellent</div>
                      <div className="text-sm text-gray-600">Generation Conditions</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expected Production</span>
                        <span className="font-bold text-yellow-600">42.3 kWh</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Peak Time</span>
                        <span className="font-bold text-orange-600">12:30 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Efficiency</span>
                        <span className="font-bold text-green-600">94.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Weather Impact</span>
                        <span className="font-bold text-green-600">Minimal (-5%)</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">Cloud Coverage</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2 rounded-full"
                          style={{ width: `${currentWeather.cloudCover}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{currentWeather.cloudCover}% cloud cover</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sun Path and Timeline */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Solar Timeline Today</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Sunrise className="w-4 h-4" />
                      <span>06:15 AM</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Sunset className="w-4 h-4" />
                      <span>07:42 PM</span>
                    </div>
                  </div>
                </div>

                {/* Solar Path Visualization */}
                <div className="h-32 bg-gradient-to-r from-blue-50 via-yellow-50 to-orange-50 rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-blue-200 via-yellow-200 to-orange-200 rounded"></div>
                  </div>

                  {/* Sun position indicator */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Sun className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Time markers */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>06:00</span>
                    <span>09:00</span>
                    <span className="font-bold text-yellow-600">12:30</span>
                    <span>15:00</span>
                    <span>18:00</span>
                  </div>
                </div>

                {/* Current Time and Production */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <div className="font-bold text-yellow-600">{currentTime.toLocaleTimeString()}</div>
                    <div className="text-sm text-gray-600">Current Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="font-bold text-green-600">32.8 kW</div>
                    <div className="text-sm text-gray-600">Current Generation</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-orange-600">67.2 kW</div>
                    <div className="text-sm text-gray-600">Peak Potential</div>
                  </div>
                </div>
              </div>

              {/* Weather Alerts */}
              {weatherAlerts.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Active Weather Alerts</h3>
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>

                  <div className="space-y-3">
                    {weatherAlerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm mt-1">{alert.description}</div>
                            <div className="text-xs mt-2 opacity-75">{alert.impact}</div>
                          </div>
                          <div className="text-xs opacity-75 ml-4">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Link
                      href="#alerts"
                      onClick={() => setActiveTab('alerts')}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                    >
                      View All Alerts <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 7-Day Weather Forecast */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">7-Day Weather Forecast</h3>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weatherForecast.map((day, index) => {
                    const WeatherIcon = getWeatherIcon(day.condition)
                    const isToday = index === 0
                    return (
                      <motion.div
                        key={day.timestamp}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border text-center ${isToday
                            ? 'bg-yellow-50 border-yellow-300 shadow-md'
                            : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div className={`font-medium mb-2 ${isToday ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {isToday ? 'Today' : new Date(day.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center`}>
                          <WeatherIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-gray-800 mb-1">{day.temperature}°C</div>
                        <div className="text-xs text-gray-500 mb-2 capitalize">{day.condition.replace('_', ' ')}</div>
                        <div className="text-xs text-yellow-600 font-medium">{day.solarIrradiance} W/m²</div>
                      </motion.div>
                    )
                  })}
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
                <Eye className="w-6 h-6" />
                <h4 className="font-semibold">Weather Intelligence</h4>
              </div>
              <p className="text-sm opacity-90">AI-powered weather analysis for optimal solar forecasting</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Brain className="w-6 h-6" />
                <h4 className="font-semibold">Predictive Analytics</h4>
              </div>
              <p className="text-sm opacity-90">Advanced forecasting models for solar production optimization</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Satellite className="w-6 h-6" />
                <h4 className="font-semibold">Real-time Monitoring</h4>
              </div>
              <p className="text-sm opacity-90">Continuous weather tracking and solar impact assessment</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
