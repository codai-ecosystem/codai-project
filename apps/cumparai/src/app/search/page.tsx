'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  Heart,
  TrendingUp,
  Zap,
  Tag,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  MapPin,
  Clock,
  Eye,
  ShoppingCart,
  Compare,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Target,
  Award,
  Bookmark,
  Share2,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  Package,
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingDown,
  BarChart3
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
  subcategory: string
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'
  isRecommended: boolean
  isTrending: boolean
  isWishlisted: boolean
  isCompared: boolean
  tags: string[]
  description: string
  features: string[]
  seller: string
  shippingTime: string
  priceHistory: { date: string; price: number }[]
  aiScore: number
  sustainability: 'high' | 'medium' | 'low'
}

interface FilterOptions {
  categories: { id: string; name: string; count: number }[]
  brands: { id: string; name: string; count: number }[]
  priceRanges: { min: number; max: number; label: string }[]
  ratings: { min: number; label: string }[]
  features: { id: string; name: string; count: number }[]
}

export default function ProductSearchDiscovery() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<any>({})
  const [comparedProducts, setComparedProducts] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const filterOptions: FilterOptions = {
    categories: [
      { id: 'electronics', name: 'Electronics', count: 234 },
      { id: 'fashion', name: 'Fashion', count: 567 },
      { id: 'home', name: 'Home & Garden', count: 189 },
      { id: 'books', name: 'Books', count: 123 },
      { id: 'sports', name: 'Sports', count: 89 },
      { id: 'beauty', name: 'Beauty', count: 145 },
      { id: 'automotive', name: 'Automotive', count: 78 },
      { id: 'health', name: 'Health', count: 156 }
    ],
    brands: [
      { id: 'apple', name: 'Apple', count: 45 },
      { id: 'samsung', name: 'Samsung', count: 67 },
      { id: 'nike', name: 'Nike', count: 89 },
      { id: 'adidas', name: 'Adidas', count: 76 },
      { id: 'sony', name: 'Sony', count: 54 },
      { id: 'lg', name: 'LG', count: 43 }
    ],
    priceRanges: [
      { min: 0, max: 25, label: 'Under $25' },
      { min: 25, max: 50, label: '$25 - $50' },
      { min: 50, max: 100, label: '$50 - $100' },
      { min: 100, max: 250, label: '$100 - $250' },
      { min: 250, max: 500, label: '$250 - $500' },
      { min: 500, max: 9999, label: 'Over $500' }
    ],
    ratings: [
      { min: 4.5, label: '4.5+ Stars' },
      { min: 4.0, label: '4.0+ Stars' },
      { min: 3.5, label: '3.5+ Stars' },
      { min: 3.0, label: '3.0+ Stars' }
    ],
    features: [
      { id: 'free_shipping', name: 'Free Shipping', count: 892 },
      { id: 'prime_eligible', name: 'Prime Eligible', count: 567 },
      { id: 'same_day', name: 'Same Day Delivery', count: 234 },
      { id: 'returns', name: 'Easy Returns', count: 723 },
      { id: 'warranty', name: 'Extended Warranty', count: 345 },
      { id: 'eco_friendly', name: 'Eco-Friendly', count: 178 }
    ]
  }

  const products: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: 1199,
      originalPrice: 1299,
      discount: 8,
      rating: 4.8,
      reviews: 2847,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      category: 'electronics',
      subcategory: 'smartphones',
      availability: 'in_stock',
      isRecommended: true,
      isTrending: true,
      isWishlisted: false,
      isCompared: false,
      tags: ['flagship', '5G', 'camera', 'premium'],
      description: 'The most advanced iPhone with Pro camera system',
      features: ['48MP Camera', '5G', 'A17 Pro Chip', 'Titanium Design'],
      seller: 'Apple Store',
      shippingTime: '1-2 days',
      priceHistory: [
        { date: '2024-01-01', price: 1299 },
        { date: '2024-01-15', price: 1249 },
        { date: '2024-02-01', price: 1199 }
      ],
      aiScore: 95,
      sustainability: 'medium'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 1099,
      originalPrice: 1199,
      discount: 8,
      rating: 4.7,
      reviews: 1934,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
      category: 'electronics',
      subcategory: 'smartphones',
      availability: 'in_stock',
      isRecommended: true,
      isTrending: true,
      isWishlisted: true,
      isCompared: false,
      tags: ['android', 'S Pen', 'camera', 'premium'],
      description: 'Ultimate Android flagship with S Pen and AI features',
      features: ['200MP Camera', 'S Pen', 'AI Features', '5000mAh Battery'],
      seller: 'Samsung Official',
      shippingTime: '1-3 days',
      priceHistory: [
        { date: '2024-01-01', price: 1199 },
        { date: '2024-01-20', price: 1149 },
        { date: '2024-02-05', price: 1099 }
      ],
      aiScore: 92,
      sustainability: 'high'
    },
    {
      id: '3',
      name: 'MacBook Pro 14"',
      brand: 'Apple',
      price: 1999,
      originalPrice: 2199,
      discount: 9,
      rating: 4.9,
      reviews: 1567,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      category: 'electronics',
      subcategory: 'laptops',
      availability: 'low_stock',
      isRecommended: true,
      isTrending: false,
      isWishlisted: false,
      isCompared: true,
      tags: ['laptop', 'M3 Pro', 'creative', 'professional'],
      description: 'Professional laptop for creative professionals',
      features: ['M3 Pro Chip', '18GB RAM', '512GB SSD', 'Liquid Retina Display'],
      seller: 'Apple Store',
      shippingTime: '3-5 days',
      priceHistory: [
        { date: '2024-01-01', price: 2199 },
        { date: '2024-01-10', price: 2099 },
        { date: '2024-02-01', price: 1999 }
      ],
      aiScore: 97,
      sustainability: 'medium'
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 349,
      originalPrice: 399,
      discount: 13,
      rating: 4.6,
      reviews: 3421,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: 'electronics',
      subcategory: 'audio',
      availability: 'in_stock',
      isRecommended: false,
      isTrending: true,
      isWishlisted: true,
      isCompared: false,
      tags: ['wireless', 'noise-cancelling', 'premium', 'travel'],
      description: 'Industry-leading noise canceling headphones',
      features: ['30h Battery', 'Noise Canceling', 'Touch Controls', 'Quick Charge'],
      seller: 'Sony Official',
      shippingTime: '2-4 days',
      priceHistory: [
        { date: '2024-01-01', price: 399 },
        { date: '2024-01-25', price: 379 },
        { date: '2024-02-10', price: 349 }
      ],
      aiScore: 89,
      sustainability: 'high'
    },
    {
      id: '5',
      name: 'Nike Air Max 270',
      brand: 'Nike',
      price: 150,
      originalPrice: 180,
      discount: 17,
      rating: 4.4,
      reviews: 2156,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category: 'fashion',
      subcategory: 'shoes',
      availability: 'in_stock',
      isRecommended: false,
      isTrending: false,
      isWishlisted: false,
      isCompared: false,
      tags: ['running', 'lifestyle', 'comfortable', 'trendy'],
      description: 'Comfortable lifestyle sneakers with Max Air cushioning',
      features: ['Max Air Unit', 'Mesh Upper', 'Rubber Outsole', 'Lifestyle Design'],
      seller: 'Nike Store',
      shippingTime: '3-5 days',
      priceHistory: [
        { date: '2024-01-01', price: 180 },
        { date: '2024-01-15', price: 165 },
        { date: '2024-02-05', price: 150 }
      ],
      aiScore: 84,
      sustainability: 'medium'
    },
    {
      id: '6',
      name: 'Instant Pot Duo Plus',
      brand: 'Instant Pot',
      price: 99,
      originalPrice: 129,
      discount: 23,
      rating: 4.7,
      reviews: 4521,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      category: 'home',
      subcategory: 'kitchen',
      availability: 'in_stock',
      isRecommended: true,
      isTrending: false,
      isWishlisted: false,
      isCompared: false,
      tags: ['kitchen', 'multi-cooker', 'healthy', 'time-saving'],
      description: '9-in-1 electric pressure cooker with smart programs',
      features: ['9-in-1 Functions', 'Smart Programs', '6qt Capacity', 'Safety Features'],
      seller: 'Instant Pot',
      shippingTime: '2-3 days',
      priceHistory: [
        { date: '2024-01-01', price: 129 },
        { date: '2024-01-20', price: 119 },
        { date: '2024-02-08', price: 99 }
      ],
      aiScore: 91,
      sustainability: 'high'
    }
  ]

  const aiSearchSuggestions = [
    'Best smartphones under $800',
    'Noise-cancelling headphones for travel',
    'Eco-friendly kitchen appliances',
    'Premium wireless earbuds',
    'Gaming laptops with RTX graphics',
    'Sustainable fashion brands'
  ]

  useEffect(() => {
    if (searchQuery.length > 2) {
      const suggestions = aiSearchSuggestions.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setAiSuggestions(suggestions)
    } else {
      setAiSuggestions([])
    }
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)])
    }
  }

  const toggleCompare = (productId: string) => {
    setComparedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else if (prev.length < 3) {
        return [...prev, productId]
      }
      return prev
    })
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSustainabilityColor = (sustainability: string) => {
    switch (sustainability) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Enhanced Search Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {products.length} products found
              </span>

              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {Object.keys(selectedFilters).length > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                    {Object.keys(selectedFilters).length}
                  </span>
                )}
              </motion.button>

              {comparedProducts.length > 0 && (
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Compare className="h-4 w-4" />
                  Compare ({comparedProducts.length})
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="relevance">Best Match</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest First</option>
                <option value="ai_score">AI Score</option>
              </select>

              <div className="flex items-center bg-white/60 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-200px)]">
        {/* Advanced Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white/60 backdrop-blur-sm border-r border-gray-200 overflow-y-auto"
            >
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setSelectedFilters({})}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300 text-orange-600" />
                        <span className="flex-1">{category.name}</span>
                        <span className="text-gray-400">({category.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Brands</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300 text-orange-600" />
                        <span className="flex-1">{brand.name}</span>
                        <span className="text-gray-400">({brand.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {filterOptions.priceRanges.map((range, index) => (
                      <label key={index} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="priceRange" className="text-orange-600" />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Customer Rating</h4>
                  <div className="space-y-2">
                    {filterOptions.ratings.map((rating, index) => (
                      <label key={index} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="rating" className="text-orange-600" />
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{rating.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Features Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Features</h4>
                  <div className="space-y-2">
                    {filterOptions.features.map((feature) => (
                      <label key={feature.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300 text-orange-600" />
                        <span className="flex-1">{feature.name}</span>
                        <span className="text-gray-400">({feature.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">AI Recommendations</span>
                  </div>
                  <p className="text-xs text-orange-600 mb-2">
                    Based on your preferences and search history
                  </p>
                  <div className="space-y-1">
                    <button className="w-full text-left text-xs text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-100">
                      Show products with high AI scores
                    </button>
                    <button className="w-full text-left text-xs text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-100">
                      Filter by sustainability rating
                    </button>
                    <button className="w-full text-left text-xs text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-100">
                      Show trending in your interests
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Display */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
            {products.map((product) => (
              <motion.div
                key={product.id}
                className={`bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${viewMode === 'list' ? 'flex' : ''
                  }`}
                whileHover={{ y: -2 }}
                layout
              >
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'}`}
                  />

                  {/* Product Badges */}
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
                    <span className={`px-2 py-1 text-xs rounded-full ${getSustainabilityColor(product.sustainability)}`}>
                      {product.sustainability === 'high' ? '🌱 Eco' : product.sustainability === 'medium' ? '🌿 Good' : '⚠️ Low'} Sustainability
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button className={`p-2 rounded-full transition-all ${product.isWishlisted
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-white/80 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                      }`}>
                      <Heart className="h-4 w-4" fill={product.isWishlisted ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      onClick={() => toggleCompare(product.id)}
                      className={`p-2 rounded-full transition-all ${comparedProducts.includes(product.id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-white/80 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                    >
                      <Compare className="h-4 w-4" />
                    </button>

                    <button className="p-2 bg-white/80 text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* AI Score Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <Target className="h-3 w-3 text-orange-500" />
                      <span className="text-xs font-medium text-gray-700">AI: {product.aiScore}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(product.availability)}`}>
                      {product.availability === 'in_stock' ? 'In Stock' :
                        product.availability === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {product.tags.slice(0, viewMode === 'list' ? 4 : 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">{product.shippingTime}</span>
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

          {/* Load More Button */}
          <div className="flex justify-center mt-8">
            <motion.button
              className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="h-4 w-4" />
              Load More Products
            </motion.button>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Advanced Product Discovery • AI-Powered Search • Smart Filters</span>
            <span>Product Comparison • Price Tracking • Personalized Results</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                <Search className="h-4 w-4" />
                Smart Search
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <Compare className="h-4 w-4" />
                Product Compare
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Target className="h-4 w-4" />
                AI Scoring
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
