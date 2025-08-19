'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  List,
  Plus,
  Star,
  Trash2,
  Edit3,
  Share2,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  MoreHorizontal,
  ShoppingCart,
  Eye,
  Tag,
  Calendar,
  Clock,
  Users,
  Gift,
  Bookmark,
  Check,
  X,
  Copy,
  ExternalLink,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Package,
  Truck,
  Bell,
  Settings,
  FolderPlus,
  Folder,
  Archive,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Move,
  Layers
} from 'lucide-react'

interface ShoppingItem {
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
  addedDate: Date
  priority: 'high' | 'medium' | 'low'
  notes: string
  tags: string[]
  priceAlert?: number
  isOnSale: boolean
  aiScore: number
  quantity?: number
}

interface ShoppingList {
  id: string
  name: string
  description: string
  items: ShoppingItem[]
  isPublic: boolean
  isShared: boolean
  collaborators: string[]
  createdDate: Date
  updatedDate: Date
  category: 'wishlist' | 'shopping' | 'gift' | 'compare' | 'favorites'
  color: string
  icon: string
  totalValue: number
  itemsCount: number
}

export default function ShoppingListsWishlist() {
  const [selectedList, setSelectedList] = useState<string>('wishlist')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [filterBy, setFilterBy] = useState('all')
  const [showCreateList, setShowCreateList] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const shoppingLists: ShoppingList[] = [
    {
      id: 'wishlist',
      name: 'My Wishlist',
      description: 'Items I want to buy someday',
      items: [],
      isPublic: false,
      isShared: false,
      collaborators: [],
      createdDate: new Date('2024-01-15'),
      updatedDate: new Date(),
      category: 'wishlist',
      color: 'pink',
      icon: 'heart',
      totalValue: 1847.93,
      itemsCount: 12
    },
    {
      id: 'holiday-gifts',
      name: 'Holiday Gifts 2024',
      description: 'Gift ideas for family and friends',
      items: [],
      isPublic: false,
      isShared: true,
      collaborators: ['partner', 'sister'],
      createdDate: new Date('2024-01-20'),
      updatedDate: new Date(),
      category: 'gift',
      color: 'green',
      icon: 'gift',
      totalValue: 567.45,
      itemsCount: 8
    },
    {
      id: 'tech-upgrades',
      name: 'Tech Upgrades',
      description: 'Electronics and gadgets I need',
      items: [],
      isPublic: false,
      isShared: false,
      collaborators: [],
      createdDate: new Date('2024-02-01'),
      updatedDate: new Date(),
      category: 'shopping',
      color: 'blue',
      icon: 'zap',
      totalValue: 2340.99,
      itemsCount: 6
    },
    {
      id: 'home-improvement',
      name: 'Home Improvement',
      description: 'Items for home renovation project',
      items: [],
      isPublic: true,
      isShared: true,
      collaborators: ['spouse'],
      createdDate: new Date('2024-01-25'),
      updatedDate: new Date(),
      category: 'shopping',
      color: 'orange',
      icon: 'package',
      totalValue: 1234.56,
      itemsCount: 15
    }
  ]

  const wishlistItems: ShoppingItem[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: 1199,
      originalPrice: 1299,
      discount: 8,
      rating: 4.8,
      reviews: 2847,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
      category: 'electronics',
      availability: 'in_stock',
      addedDate: new Date('2024-01-20'),
      priority: 'high',
      notes: 'Waiting for better deal',
      tags: ['flagship', '5G', 'camera'],
      priceAlert: 1100,
      isOnSale: true,
      aiScore: 95,
      quantity: 1
    },
    {
      id: '2',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 349,
      originalPrice: 399,
      discount: 13,
      rating: 4.6,
      reviews: 3421,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      category: 'electronics',
      availability: 'in_stock',
      addedDate: new Date('2024-01-25'),
      priority: 'medium',
      notes: 'For travel',
      tags: ['wireless', 'noise-cancelling'],
      priceAlert: 300,
      isOnSale: true,
      aiScore: 89
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
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
      category: 'electronics',
      availability: 'low_stock',
      addedDate: new Date('2024-02-01'),
      priority: 'high',
      notes: 'For work upgrade',
      tags: ['laptop', 'M3 Pro', 'professional'],
      priceAlert: 1800,
      isOnSale: false,
      aiScore: 97
    },
    {
      id: '4',
      name: 'Nike Air Max 270',
      brand: 'Nike',
      price: 150,
      originalPrice: 180,
      discount: 17,
      rating: 4.4,
      reviews: 2156,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      category: 'fashion',
      availability: 'in_stock',
      addedDate: new Date('2024-02-05'),
      priority: 'low',
      notes: 'Casual wear',
      tags: ['running', 'lifestyle'],
      isOnSale: true,
      aiScore: 84
    }
  ]

  const getListIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart': return <Heart className="h-5 w-5" />
      case 'gift': return <Gift className="h-5 w-5" />
      case 'zap': return <Zap className="h-5 w-5" />
      case 'package': return <Package className="h-5 w-5" />
      default: return <List className="h-5 w-5" />
    }
  }

  const getListColor = (color: string) => {
    switch (color) {
      case 'pink': return 'bg-pink-100 text-pink-600'
      case 'green': return 'bg-green-100 text-green-600'
      case 'blue': return 'bg-blue-100 text-blue-600'
      case 'orange': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600'
      case 'medium': return 'bg-yellow-100 text-yellow-600'
      case 'low': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const selectedListData = shoppingLists.find(list => list.id === selectedList)

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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-red-600 text-white">
              <Heart className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Lists & Wishlist</h1>
              <p className="text-sm text-gray-500">Organize and manage your shopping desires</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items in lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <motion.button
              onClick={() => setShowCreateList(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-lg hover:from-pink-600 hover:to-red-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              New List
            </motion.button>
          </div>
        </div>

        {/* List Stats */}
        <div className="mt-4 grid grid-cols-5 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Lists</span>
              <List className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{shoppingLists.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Items</span>
              <Package className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {shoppingLists.reduce((sum, list) => sum + list.itemsCount, 0)}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Value</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              ${shoppingLists.reduce((sum, list) => sum + list.totalValue, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shared Lists</span>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {shoppingLists.filter(list => list.isShared).length}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price Alerts</span>
              <Bell className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {wishlistItems.filter(item => item.priceAlert).length}
            </p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-180px)]">
        {/* Lists Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCreateList(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create New List
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <Upload className="h-4 w-4" />
                  Import List
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <Download className="h-4 w-4" />
                  Export Lists
                </button>
              </div>
            </div>

            {/* My Lists */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">My Lists</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  {shoppingLists.length}
                </span>
              </div>
              <div className="space-y-1">
                {shoppingLists.map((list) => (
                  <motion.button
                    key={list.id}
                    onClick={() => setSelectedList(list.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${selectedList === list.id
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    whileHover={{ x: 2 }}
                  >
                    <div className={`p-1 rounded ${getListColor(list.color)}`}>
                      {getListIcon(list.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{list.name}</p>
                        <div className="flex items-center gap-1">
                          {list.isShared && <Users className="h-3 w-3 text-blue-500" />}
                          {list.isPublic && <ExternalLink className="h-3 w-3 text-green-500" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{list.itemsCount} items</span>
                        <span>${list.totalValue.toFixed(0)}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">AI Insights</span>
              </div>
              <div className="space-y-2 text-xs text-orange-600">
                <p>💡 3 items in your wishlist are currently on sale</p>
                <p>📈 Average price dropped 8% this week</p>
                <p>🎯 2 items reached your price alerts</p>
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  View All Insights →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* List Header */}
          <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getListColor(selectedListData?.color || 'gray')}`}>
                  {getListIcon(selectedListData?.icon || 'list')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedListData?.name}</h2>
                  <p className="text-sm text-gray-500">{selectedListData?.description}</p>
                </div>
                {selectedListData?.isShared && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    <Users className="h-3 w-3" />
                    Shared with {selectedListData.collaborators.length}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="price">Price</option>
                  <option value="priority">Priority</option>
                  <option value="aiScore">AI Score</option>
                  <option value="name">Name</option>
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

                <motion.button
                  onClick={() => setShowShareDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </motion.button>

                <button className="p-2 text-gray-600 hover:text-gray-700">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <span className="text-sm text-blue-700">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-all">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-all">
                  <Move className="h-4 w-4" />
                  Move to List
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-all">
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="ml-auto p-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Items Grid/List */}
          <div className="p-6">
            <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${viewMode === 'list' ? 'flex' : ''
                    } ${selectedItems.includes(item.id) ? 'ring-2 ring-orange-500' : ''}`}
                  whileHover={{ y: -2 }}
                  layout
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-32 flex-shrink-0' : ''}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'}`}
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {item.isOnSale && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          -{item.discount}%
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                    </div>

                    {/* Selection checkbox */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => toggleItemSelection(item.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedItems.includes(item.id)
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white/80 border-gray-300 hover:border-orange-400'
                          }`}
                      >
                        {selectedItems.includes(item.id) && <Check className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* AI Score */}
                    <div className="absolute bottom-2 left-2">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <Target className="h-3 w-3 text-orange-500" />
                        <span className="text-xs font-medium text-gray-700">{item.aiScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{item.brand}</p>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {viewMode === 'list' && item.notes && (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(item.availability)}`}>
                        {item.availability === 'in_stock' ? 'In Stock' :
                          item.availability === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({item.reviews})</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">${item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                        )}
                      </div>
                      {item.priceAlert && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Bell className="h-3 w-3" />
                          Alert at ${item.priceAlert}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Added {formatDate(item.addedDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:text-red-600 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 transition-all">
                          <Share2 className="h-4 w-4" />
                        </button>
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

            {/* Empty State */}
            {wishlistItems.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items in this list yet</h3>
                <p className="text-gray-500 mb-4">Start adding products you love to organize your shopping</p>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search className="h-5 w-5" />
                  Browse Products
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create List Modal */}
      <AnimatePresence>
        {showCreateList && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-96 mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New List</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Birthday Gifts"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="What's this list for?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Wishlist</option>
                    <option>Shopping List</option>
                    <option>Gift List</option>
                    <option>Comparison</option>
                    <option>Favorites</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600" />
                    <span className="text-sm text-gray-700">Make public</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600" />
                    <span className="text-sm text-gray-700">Allow sharing</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateList(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateList(false)}
                >
                  Create List
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
            <span>Smart List Management • AI-Powered Organization • Price Tracking</span>
            <span>Collaborative Shopping • List Sharing • Purchase Planning</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                <Heart className="h-4 w-4" />
                Wishlist
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <Users className="h-4 w-4" />
                Collaborative
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Bell className="h-4 w-4" />
                Smart Alerts
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
