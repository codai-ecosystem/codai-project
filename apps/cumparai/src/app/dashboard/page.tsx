'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Heart,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  Tag,
  Gift,
  Bell,
  User,
  Settings,
  RefreshCw,
  ArrowRight,
  Eye,
  ShoppingCart,
  Percent,
  Target,
  Award,
  TrendingDown,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  MapPin,
  Calendar,
  Plus,
  Minus,
  ExternalLink,
  Bookmark,
  Share2,
  MessageCircle,
  ThumbsUp,
  MoreHorizontal
} from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviews: number
  image: string
  category: string
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'
  isRecommended: boolean
  isTrending: boolean
  isWishlisted: boolean
  tags: string[]
  description: string
}

interface Deal {
  id: string
  title: string
  description: string
  discount: number
  validUntil: Date
  category: string
  productsCount: number
  isLimited: boolean
}

interface AIRecommendation {
  id: string
  type: 'product' | 'deal' | 'category' | 'brand'
  title: string
  reason: string
  confidence: number
  products?: Product[]
  action: string
}

export default function ShoppingDashboard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories', count: 1247 },
    { id: 'electronics', name: 'Electronics', count: 234 },
    { id: 'fashion', name: 'Fashion', count: 567 },
    { id: 'home', name: 'Home & Garden', count: 189 },
    { id: 'books', name: 'Books', count: 123 },
    { id: 'sports', name: 'Sports', count: 89 },
    { id: 'beauty', name: 'Beauty', count: 145 }
  ]

  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Smart Wireless Headphones',
      brand: 'TechSound Pro',
      price: 299.99,
      originalPrice: 399.99,
      discount: 25,
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      category: 'electronics',
      availability: 'in_stock',
      isRecommended: true,
      isTrending: true,
      isWishlisted: false,
      tags: ['wireless', 'noise-cancelling', 'premium'],
      description: 'Premium wireless headphones with active noise cancellation'
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      brand: 'EcoWear',
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      rating: 4.6,
      reviews: 567,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
      category: 'fashion',
      availability: 'in_stock',
      isRecommended: true,
      isTrending: false,
      isWishlisted: true,
      tags: ['organic', 'sustainable', 'comfortable'],
      description: 'Comfortable organic cotton t-shirt in various colors'
    },
    {
      id: '3',
      name: 'Smart Home Security Camera',
      brand: 'SecureView',
      price: 199.99,
      rating: 4.7,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300',
      category: 'electronics',
      availability: 'low_stock',
      isRecommended: false,
      isTrending: true,
      isWishlisted: false,
      tags: ['smart', 'security', 'wifi'],
      description: 'WiFi-enabled security camera with night vision'
    },
    {
      id: '4',
      name: 'Professional Coffee Maker',
      brand: 'BrewMaster',
      price: 449.99,
      originalPrice: 549.99,
      discount: 18,
      rating: 4.9,
      reviews: 334,
      image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300',
      category: 'home',
      availability: 'in_stock',
      isRecommended: true,
      isTrending: false,
      isWishlisted: true,
      tags: ['professional', 'espresso', 'premium'],
      description: 'Professional-grade espresso and coffee maker'
    }
  ]

  const activeDeals: Deal[] = [
    {
      id: '1',
      title: 'Electronics Flash Sale',
      description: 'Up to 40% off on selected electronics',
      discount: 40,
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
      category: 'electronics',
      productsCount: 127,
      isLimited: true
    },
    {
      id: '2',
      title: 'Fashion Weekend Special',
      description: 'Buy 2 Get 1 Free on fashion items',
      discount: 33,
      validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      category: 'fashion',
      productsCount: 89,
      isLimited: false
    },
    {
      id: '3',
      title: 'Home & Garden Clearance',
      description: 'Huge savings on home improvement items',
      discount: 30,
      validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      category: 'home',
      productsCount: 234,
      isLimited: false
    }
  ]

  const aiRecommendations: AIRecommendation[] = [
    {
      id: '1',
      type: 'product',
      title: 'Perfect Match for Your Wishlist',
      reason: 'Based on your saved items and browsing history',
      confidence: 94,
      action: 'View Recommendations'
    },
    {
      id: '2',
      type: 'deal',
      title: 'Limited Time Offer',
      reason: 'Price drop on items you\'ve been watching',
      confidence: 87,
      action: 'Check Deals'
    },
    {
      id: '3',
      type: 'category',
      title: 'Trending in Electronics',
      reason: 'Popular items in your favorite categories',
      confidence: 91,
      action: 'Explore Category'
    }
  ]

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimeRemaining = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'In Stock'
      case 'low_stock': return 'Low Stock'
      case 'out_of_stock': return 'Out of Stock'
      default: return 'Unknown'
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CumparAI</h1>
              <p className="text-sm text-gray-500">AI-Powered Shopping Assistant</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-96 pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <motion.button
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
              Filters
            </motion.button>
          </div>
        </div>

        {/* Shopping Stats */}
        <div className="mt-4 grid grid-cols-6 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Products</span>
              <Package className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">1,247</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Deals</span>
              <Tag className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{activeDeals.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Wishlist</span>
              <Heart className="h-4 w-4 text-pink-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">23</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cart Items</span>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">7</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Savings</span>
              <Target className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">$247</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time</span>
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {currentTime?.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) || '--:--'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-180px)]">
        {/* Sidebar */}
        <div className="w-72 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <div className="space-y-6">
            {/* Categories */}
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
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-medium text-gray-500">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className="bg-white/80 rounded-lg p-3 border border-gray-200">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${rec.confidence > 90 ? 'bg-green-500' : rec.confidence > 80 ? 'bg-yellow-500' : 'bg-orange-500'}`} />
                        <span className="text-xs text-gray-500">{rec.confidence}% match</span>
                      </div>
                      <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Active Deals Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🔥 Hot Deals</h2>
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                View All Deals
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {activeDeals.map((deal) => (
                <motion.div
                  key={deal.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Percent className="h-5 w-5 text-red-600" />
                      </div>
                      {deal.isLimited && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Limited Time
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-red-600">-{deal.discount}%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{deal.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{deal.productsCount} products</span>
                    <span className="text-orange-600 font-medium">
                      {formatTimeRemaining(deal.validUntil)} left
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Products Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">✨ Featured Products</h2>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Best Match</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Newest</option>
                </select>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View All Products
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isRecommended && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          AI Pick
                        </span>
                      )}
                      {product.isTrending && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </span>
                      )}
                      {product.discount && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button className={`p-2 rounded-full transition-all ${product.isWishlisted
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-white/80 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                        }`}>
                        <Heart className="h-4 w-4" fill={product.isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                      <button className="p-2 bg-white/80 text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(product.availability)}`}>
                        {getAvailabilityText(product.availability)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {product.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <motion.button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>CumparAI Shopping Platform • AI-Powered Product Discovery • Smart Deal Alerts</span>
            <span>Personalized Recommendations • Price Tracking • Secure Shopping</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                <Zap className="h-4 w-4" />
                AI Enhanced
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                Secure
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <TrendingUp className="h-4 w-4" />
                Trending
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
