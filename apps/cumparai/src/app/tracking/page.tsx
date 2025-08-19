'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  Bell,
  Target,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Settings,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  LineChart,
  ArrowDown,
  ArrowUp,
  Percent,
  Zap,
  ShoppingCart,
  Heart,
  Tag,
  Bookmark,
  Share2,
  Download,
  RefreshCw,
  X,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  AlertTriangle,
  TrendingFlat,
  Activity,
  PieChart,
  BarChart2,
  Sparkles,
  Brain,
  Package,
  Users,
  Globe,
  ShieldCheck,
  Smartphone,
  Mail,
  MessageSquare,
  PhoneCall,
  Headphones,
  Laptop,
  Monitor,
  Camera,
  Watch,
  Gamepad2,
  Home,
  Car,
  Shirt,
  Book,
  Dumbbell,
  Palette
} from 'lucide-react'

interface PriceAlert {
  id: string
  product: {
    id: string
    name: string
    brand: string
    image: string
    category: string
    currentPrice: number
    url: string
  }
  targetPrice: number
  alertType: 'price_drop' | 'target_reached' | 'back_in_stock' | 'discount_available'
  isActive: boolean
  createdDate: Date
  lastTriggered?: Date
  timesTriggered: number
  notificationMethods: ('email' | 'push' | 'sms')[]
  aiPrediction?: {
    likelihood: number
    timeframe: string
    confidence: number
  }
}

interface PriceHistory {
  id: string
  productId: string
  price: number
  date: Date
  source: string
  isPromotion: boolean
  retailer: string
}

interface PriceTrend {
  productId: string
  trend: 'decreasing' | 'increasing' | 'stable'
  changePercent: number
  changeAmount: number
  timeframe: '24h' | '7d' | '30d' | '90d'
  prediction: {
    nextPrice: number
    confidence: number
    timeframe: string
  }
}

interface TrackedProduct {
  id: string
  name: string
  brand: string
  image: string
  category: string
  currentPrice: number
  originalPrice: number
  lowestPrice: number
  highestPrice: number
  averagePrice: number
  priceHistory: PriceHistory[]
  alerts: PriceAlert[]
  trend: PriceTrend
  savings: number
  isWatching: boolean
  addedDate: Date
  lastChecked: Date
  checkFrequency: 'hourly' | 'daily' | 'weekly'
  retailers: string[]
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'
  rating: number
  reviews: number
}

export default function PriceTrackingAlerts() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<TrackedProduct | null>(null)

  const categories = [
    { id: 'all', name: 'All Categories', icon: Package, count: 24 },
    { id: 'electronics', name: 'Electronics', icon: Smartphone, count: 8 },
    { id: 'computers', name: 'Computers', icon: Laptop, count: 5 },
    { id: 'fashion', name: 'Fashion', icon: Shirt, count: 4 },
    { id: 'home', name: 'Home & Garden', icon: Home, count: 3 },
    { id: 'sports', name: 'Sports', icon: Dumbbell, count: 2 },
    { id: 'books', name: 'Books', icon: Book, count: 2 }
  ]

  const trackedProducts: TrackedProduct[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
      category: 'electronics',
      currentPrice: 1149,
      originalPrice: 1299,
      lowestPrice: 1099,
      highestPrice: 1349,
      averagePrice: 1224,
      priceHistory: [],
      alerts: [],
      trend: {
        productId: '1',
        trend: 'decreasing',
        changePercent: -11.5,
        changeAmount: -150,
        timeframe: '30d',
        prediction: {
          nextPrice: 1089,
          confidence: 87,
          timeframe: '7-14 days'
        }
      },
      savings: 150,
      isWatching: true,
      addedDate: new Date('2024-01-15'),
      lastChecked: new Date(),
      checkFrequency: 'daily',
      retailers: ['Apple Store', 'Amazon', 'Best Buy', 'Target'],
      availability: 'in_stock',
      rating: 4.8,
      reviews: 2847
    },
    {
      id: '2',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      category: 'electronics',
      currentPrice: 329,
      originalPrice: 399,
      lowestPrice: 299,
      highestPrice: 429,
      averagePrice: 364,
      priceHistory: [],
      alerts: [],
      trend: {
        productId: '2',
        trend: 'stable',
        changePercent: -0.3,
        changeAmount: -1,
        timeframe: '7d',
        prediction: {
          nextPrice: 315,
          confidence: 72,
          timeframe: '2-3 weeks'
        }
      },
      savings: 70,
      isWatching: true,
      addedDate: new Date('2024-01-20'),
      lastChecked: new Date(),
      checkFrequency: 'daily',
      retailers: ['Sony Store', 'Amazon', 'Best Buy'],
      availability: 'in_stock',
      rating: 4.6,
      reviews: 3421
    },
    {
      id: '3',
      name: 'MacBook Pro 14"',
      brand: 'Apple',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
      category: 'computers',
      currentPrice: 1899,
      originalPrice: 2199,
      lowestPrice: 1799,
      highestPrice: 2299,
      averagePrice: 2049,
      priceHistory: [],
      alerts: [],
      trend: {
        productId: '3',
        trend: 'increasing',
        changePercent: 3.2,
        changeAmount: 59,
        timeframe: '7d',
        prediction: {
          nextPrice: 1950,
          confidence: 91,
          timeframe: '1-2 weeks'
        }
      },
      savings: 300,
      isWatching: true,
      addedDate: new Date('2024-02-01'),
      lastChecked: new Date(),
      checkFrequency: 'hourly',
      retailers: ['Apple Store', 'Amazon', 'B&H Photo'],
      availability: 'low_stock',
      rating: 4.9,
      reviews: 1567
    }
  ]

  const priceAlerts: PriceAlert[] = [
    {
      id: '1',
      product: {
        id: '1',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
        category: 'electronics',
        currentPrice: 1149,
        url: '/product/1'
      },
      targetPrice: 1100,
      alertType: 'target_reached',
      isActive: true,
      createdDate: new Date('2024-01-15'),
      lastTriggered: new Date('2024-02-05'),
      timesTriggered: 2,
      notificationMethods: ['email', 'push'],
      aiPrediction: {
        likelihood: 85,
        timeframe: '7-14 days',
        confidence: 87
      }
    },
    {
      id: '2',
      product: {
        id: '2',
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        category: 'electronics',
        currentPrice: 329,
        url: '/product/2'
      },
      targetPrice: 300,
      alertType: 'price_drop',
      isActive: true,
      createdDate: new Date('2024-01-20'),
      timesTriggered: 0,
      notificationMethods: ['email', 'push', 'sms'],
      aiPrediction: {
        likelihood: 72,
        timeframe: '2-3 weeks',
        confidence: 78
      }
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-600" />
      case 'stable': return <TrendingFlat className="h-4 w-4 text-gray-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'decreasing': return 'text-green-600 bg-green-100'
      case 'increasing': return 'text-red-600 bg-red-100'
      case 'stable': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'target_reached': return <Target className="h-4 w-4 text-green-600" />
      case 'price_drop': return <TrendingDown className="h-4 w-4 text-blue-600" />
      case 'back_in_stock': return <Package className="h-4 w-4 text-purple-600" />
      case 'discount_available': return <Percent className="h-4 w-4 text-orange-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'target_reached': return 'text-green-600 bg-green-100'
      case 'price_drop': return 'text-blue-600 bg-blue-100'
      case 'back_in_stock': return 'text-purple-600 bg-purple-100'
      case 'discount_available': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <TrendingDown className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Price Tracking & Alerts</h1>
              <p className="text-sm text-gray-500">AI-powered price monitoring and smart alerts</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracked products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <motion.button
              onClick={() => setShowCreateAlert(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              Add Product
            </motion.button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="mt-4 grid grid-cols-6 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tracked Products</span>
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{trackedProducts.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Alerts</span>
              <Bell className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {priceAlerts.filter(alert => alert.isActive).length}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Savings</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              ${trackedProducts.reduce((sum, product) => sum + product.savings, 0)}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price Drops</span>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {trackedProducts.filter(p => p.trend.trend === 'decreasing').length}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Predictions</span>
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {priceAlerts.filter(alert => alert.aiPrediction && alert.aiPrediction.likelihood > 80).length}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Confidence</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(priceAlerts.reduce((sum, alert) => sum + (alert.aiPrediction?.confidence || 0), 0) / priceAlerts.length)}%
            </p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-180px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div>
              <div className="space-y-1">
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'tracked', name: 'Tracked Products', icon: Eye },
                  { id: 'alerts', name: 'Price Alerts', icon: Bell },
                  { id: 'analytics', name: 'Analytics', icon: LineChart },
                  { id: 'settings', name: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${selectedTab === tab.id
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all ${selectedCategory === category.id
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">AI Price Insights</span>
              </div>
              <div className="space-y-2 text-xs text-orange-600">
                <p>📉 3 products predicted to drop 15% this week</p>
                <p>⚡ iPhone 15 Pro Max: 87% chance of price drop</p>
                <p>🎯 2 target prices likely to be reached</p>
                <p>📊 Market trend: Electronics declining 8%</p>
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  View Full Analysis →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Price Trends Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Price Trends Overview</h3>
                  <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Price trend chart visualization</p>
                    <p className="text-sm text-gray-400">Interactive chart showing price history and predictions</p>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                  <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {priceAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={alert.product.image}
                        alt={alert.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getAlertTypeColor(alert.alertType)}`}>
                            {alert.alertType.replace('_', ' ')}
                          </span>
                          {alert.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900">{alert.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Target: ${alert.targetPrice} • Current: ${alert.product.currentPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        {alert.aiPrediction && (
                          <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                            <Brain className="h-3 w-3" />
                            {alert.aiPrediction.likelihood}% likely
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          {alert.lastTriggered ? formatTimeAgo(alert.lastTriggered) : 'Not triggered'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Savings Opportunities */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Savings Opportunities</h3>
                  <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {trackedProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current</span>
                          <span className="font-medium">${product.currentPrice}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lowest</span>
                          <span className="font-medium text-green-600">${product.lowestPrice}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Savings</span>
                          <span className="font-medium text-green-600">${product.savings}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-between">
                          <span className="text-sm text-gray-600">Trend</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(product.trend.trend)}
                            <span className={`text-sm font-medium ${product.trend.trend === 'decreasing' ? 'text-green-600' :
                                product.trend.trend === 'increasing' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                              {product.trend.changePercent > 0 ? '+' : ''}{product.trend.changePercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'tracked' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tracked Products</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="savings">Most Savings</option>
                    <option value="trend">Best Trends</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {trackedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTrendColor(product.trend.trend)}`}>
                          {getTrendIcon(product.trend.trend)}
                          <span className="ml-1">{product.trend.changePercent > 0 ? '+' : ''}{product.trend.changePercent}%</span>
                        </span>
                        {product.savings > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ${product.savings} saved
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <button className="p-2 bg-white/80 text-gray-600 rounded-full hover:text-red-600 transition-all">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current</span>
                          <p className="font-semibold text-lg">${product.currentPrice}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Lowest</span>
                          <p className="font-semibold text-green-600">${product.lowestPrice}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Average</span>
                          <p className="font-medium">${product.averagePrice}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Highest</span>
                          <p className="font-medium text-red-600">${product.highestPrice}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-gray-500">({product.reviews})</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Checked {formatTimeAgo(product.lastChecked)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {product.checkFrequency}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {product.retailers.length} stores
                          </span>
                        </div>
                        <motion.button
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Bell className="h-4 w-4" />
                          Set Alert
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Price Alerts</h2>
                <motion.button
                  onClick={() => setShowCreateAlert(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-5 w-5" />
                  Create Alert
                </motion.button>
              </div>

              <div className="space-y-4">
                {priceAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <img
                        src={alert.product.image}
                        alt={alert.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getAlertTypeColor(alert.alertType)}`}>
                            {getAlertTypeIcon(alert.alertType)}
                            {alert.alertType.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${alert.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{alert.product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{alert.product.brand}</p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-500">Target Price</span>
                            <p className="font-semibold text-green-600">${alert.targetPrice}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Current Price</span>
                            <p className="font-semibold">${alert.product.currentPrice}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Times Triggered</span>
                            <p className="font-semibold">{alert.timesTriggered}</p>
                          </div>
                        </div>

                        {alert.aiPrediction && (
                          <div className="bg-purple-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-700">AI Prediction</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-xs text-purple-600">Likelihood</span>
                                <p className="font-medium text-purple-700">{alert.aiPrediction.likelihood}%</p>
                              </div>
                              <div>
                                <span className="text-xs text-purple-600">Timeframe</span>
                                <p className="font-medium text-purple-700">{alert.aiPrediction.timeframe}</p>
                              </div>
                              <div>
                                <span className="text-xs text-purple-600">Confidence</span>
                                <p className="font-medium text-purple-700">{alert.aiPrediction.confidence}%</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-600">Notifications:</span>
                          {alert.notificationMethods.map((method) => (
                            <span key={method} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {method === 'email' && <Mail className="h-3 w-3 inline mr-1" />}
                              {method === 'push' && <Smartphone className="h-3 w-3 inline mr-1" />}
                              {method === 'sms' && <MessageSquare className="h-3 w-3 inline mr-1" />}
                              {method}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Created {formatDate(alert.createdDate)}</span>
                          {alert.lastTriggered && (
                            <span>Last triggered {formatTimeAgo(alert.lastTriggered)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 transition-all">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-96 mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Price Alert</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/product"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Price drops below target</option>
                    <option>Any price drop</option>
                    <option>Back in stock</option>
                    <option>Discount available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notifications</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-orange-600" defaultChecked />
                      <span className="text-sm text-gray-700">Email notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-orange-600" defaultChecked />
                      <span className="text-sm text-gray-700">Push notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-orange-600" />
                      <span className="text-sm text-gray-700">SMS notifications</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateAlert(false)}
                >
                  Create Alert
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>AI-Powered Price Tracking • Smart Alerts • Predictive Analysis</span>
            <span>Real-time Monitoring • Multi-Store Comparison • Savings Optimization</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                <TrendingDown className="h-4 w-4" />
                Price Tracking
              </div>
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                <Bell className="h-4 w-4" />
                Smart Alerts
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Brain className="h-4 w-4" />
                AI Predictions
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
