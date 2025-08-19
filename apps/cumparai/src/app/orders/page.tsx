'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Star,
  Download,
  Receipt,
  CreditCard,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Headphones,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Eye,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Bookmark,
  Flag,
  AlertTriangle,
  Shield,
  Lock,
  Unlock,
  FileText,
  Image,
  Link,
  Tag,
  User,
  Building,
  Globe,
  Mail,
  Smartphone,
  Car,
  Plane,
  Ship,
  Train,
  Home,
  Store,
  Warehouse,
  Factory,
  ShoppingBag,
  ShoppingCart,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Reply,
  Forward,
  Archive,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Move,
  Resize,
  Crop,
  Layers,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  Zap,
  Lightning,
  Flash,
  Sparkles,
  Award,
  Medal,
  Trophy,
  Crown,
  Gem,
  Diamond,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Info,
  HelpCircle,
  Settings
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  orderDate: Date
  expectedDelivery?: Date
  actualDelivery?: Date
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount?: number
  currency: string
  paymentMethod: {
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer'
    last4?: string
    brand?: string
  }
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
    phone?: string
  }
  billingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  items: OrderItem[]
  tracking?: TrackingInfo
  retailer: {
    name: string
    logo: string
    website: string
    support: {
      phone?: string
      email?: string
      chat?: boolean
    }
  }
  notes?: string
  invoiceUrl?: string
  receiptUrl?: string
  returnWindow?: {
    expiresAt: Date
    policy: string
  }
}

interface OrderItem {
  id: string
  productId: string
  name: string
  brand: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  sku: string
  category: string
  variant?: {
    size?: string
    color?: string
    style?: string
  }
  warranty?: {
    duration: string
    type: string
    provider: string
  }
  canReturn: boolean
  canReview: boolean
  reviewed: boolean
  rating?: number
  review?: string
}

interface TrackingInfo {
  carrier: string
  trackingNumber: string
  trackingUrl: string
  currentStatus: string
  currentLocation?: string
  estimatedDelivery: Date
  updates: TrackingUpdate[]
}

interface TrackingUpdate {
  id: string
  status: string
  description: string
  location: string
  timestamp: Date
  isDelivered?: boolean
  hasIssue?: boolean
}

interface OrderFilter {
  status: string[]
  dateRange: {
    start?: Date
    end?: Date
  }
  retailer: string[]
  priceRange: {
    min?: number
    max?: number
  }
  category: string[]
}

export default function OrderManagement() {
  const [selectedTab, setSelectedTab] = useState('all_orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<OrderFilter>({
    status: [],
    dateRange: {},
    retailer: [],
    priceRange: {},
    category: []
  })

  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001547',
      status: 'shipped',
      orderDate: new Date('2024-02-10'),
      expectedDelivery: new Date('2024-02-15'),
      total: 1299.99,
      subtotal: 1199.99,
      tax: 100.00,
      shipping: 0,
      currency: 'USD',
      paymentMethod: {
        type: 'credit_card',
        last4: '4242',
        brand: 'Visa'
      },
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US',
        phone: '+1 (555) 123-4567'
      },
      billingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      },
      items: [
        {
          id: '1',
          productId: 'iphone-15-pro-max',
          name: 'iPhone 15 Pro Max',
          brand: 'Apple',
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
          price: 1199.99,
          quantity: 1,
          sku: 'APL-IPH15PM-256-TBL',
          category: 'Electronics',
          variant: {
            size: '256GB',
            color: 'Titanium Blue'
          },
          warranty: {
            duration: '1 year',
            type: 'Limited Warranty',
            provider: 'Apple'
          },
          canReturn: true,
          canReview: true,
          reviewed: false
        }
      ],
      tracking: {
        carrier: 'FedEx',
        trackingNumber: '1234567890123456',
        trackingUrl: 'https://fedex.com/track/1234567890123456',
        currentStatus: 'In Transit',
        currentLocation: 'Oakland, CA',
        estimatedDelivery: new Date('2024-02-15'),
        updates: [
          {
            id: '1',
            status: 'Shipped',
            description: 'Package shipped from fulfillment center',
            location: 'Cupertino, CA',
            timestamp: new Date('2024-02-11T09:00:00Z')
          },
          {
            id: '2',
            status: 'In Transit',
            description: 'Package in transit to destination',
            location: 'Oakland, CA',
            timestamp: new Date('2024-02-12T14:30:00Z')
          }
        ]
      },
      retailer: {
        name: 'Apple Store',
        logo: '🍎',
        website: 'apple.com',
        support: {
          phone: '1-800-APL-CARE',
          email: 'support@apple.com',
          chat: true
        }
      },
      returnWindow: {
        expiresAt: new Date('2024-02-25'),
        policy: '14-day return policy'
      },
      invoiceUrl: '/invoice/ORD-2024-001547'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-001523',
      status: 'delivered',
      orderDate: new Date('2024-02-05'),
      expectedDelivery: new Date('2024-02-08'),
      actualDelivery: new Date('2024-02-08'),
      total: 329.99,
      subtotal: 299.99,
      tax: 25.00,
      shipping: 5.00,
      currency: 'USD',
      paymentMethod: {
        type: 'paypal'
      },
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      },
      billingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      },
      items: [
        {
          id: '2',
          productId: 'sony-wh1000xm5',
          name: 'Sony WH-1000XM5 Wireless Headphones',
          brand: 'Sony',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
          price: 299.99,
          quantity: 1,
          sku: 'SNY-WH1000XM5-BLK',
          category: 'Electronics',
          variant: {
            color: 'Black'
          },
          warranty: {
            duration: '2 years',
            type: 'International Warranty',
            provider: 'Sony'
          },
          canReturn: true,
          canReview: true,
          reviewed: true,
          rating: 5,
          review: 'Amazing noise cancellation and sound quality!'
        }
      ],
      retailer: {
        name: 'Best Buy',
        logo: '🛒',
        website: 'bestbuy.com',
        support: {
          phone: '1-888-BEST-BUY',
          email: 'support@bestbuy.com',
          chat: true
        }
      },
      returnWindow: {
        expiresAt: new Date('2024-02-22'),
        policy: '15-day return policy'
      }
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-001489',
      status: 'cancelled',
      orderDate: new Date('2024-01-28'),
      total: 2199.99,
      subtotal: 2199.99,
      tax: 0,
      shipping: 0,
      currency: 'USD',
      paymentMethod: {
        type: 'credit_card',
        last4: '8888',
        brand: 'MasterCard'
      },
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      },
      billingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      },
      items: [
        {
          id: '3',
          productId: 'macbook-pro-14',
          name: 'MacBook Pro 14"',
          brand: 'Apple',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
          price: 2199.99,
          quantity: 1,
          sku: 'APL-MBP14-512-SG',
          category: 'Computers',
          variant: {
            size: '512GB',
            color: 'Space Gray'
          },
          canReturn: false,
          canReview: false,
          reviewed: false
        }
      ],
      retailer: {
        name: 'Apple Store',
        logo: '🍎',
        website: 'apple.com',
        support: {
          phone: '1-800-APL-CARE',
          email: 'support@apple.com',
          chat: true
        }
      },
      notes: 'Cancelled due to shipping delay'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'processing': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />
      case 'returned': return <RefreshCw className="h-5 w-5 text-orange-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-purple-100 text-purple-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'returned': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />
      case 'paypal':
        return <DollarSign className="h-4 w-4" />
      case 'apple_pay':
        return <Smartphone className="h-4 w-4" />
      case 'google_pay':
        return <Smartphone className="h-4 w-4" />
      case 'bank_transfer':
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getOrderStats = () => {
    const total = orders.length
    const delivered = orders.filter(o => o.status === 'delivered').length
    const shipped = orders.filter(o => o.status === 'shipped').length
    const processing = orders.filter(o => o.status === 'processing').length
    const cancelled = orders.filter(o => o.status === 'cancelled').length
    const totalSpent = orders
      .filter(o => ['delivered', 'shipped', 'processing'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0)

    return { total, delivered, shipped, processing, cancelled, totalSpent }
  }

  const stats = getOrderStats()

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
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-sm text-gray-500">Track orders, manage returns, and view purchase history</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-3 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:text-orange-600'
                  }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:text-orange-600'
                  }`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-white/60 border border-gray-200 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition-all"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="mt-4 grid grid-cols-6 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Orders</span>
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Delivered</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{stats.delivered}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Transit</span>
              <Truck className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{stats.shipped}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing</span>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{stats.processing}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{stats.cancelled}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Spent</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats.totalSpent)}
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
                  { id: 'all_orders', name: 'All Orders', icon: Package, count: stats.total },
                  { id: 'delivered', name: 'Delivered', icon: CheckCircle, count: stats.delivered },
                  { id: 'shipped', name: 'Shipped', icon: Truck, count: stats.shipped },
                  { id: 'processing', name: 'Processing', icon: RefreshCw, count: stats.processing },
                  { id: 'cancelled', name: 'Cancelled', icon: XCircle, count: stats.cancelled },
                  { id: 'returns', name: 'Returns', icon: RefreshCw, count: 0 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${selectedTab === tab.id
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="h-4 w-4" />
                      {tab.name}
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { icon: Search, label: 'Track Package', action: 'track' },
                  { icon: RefreshCw, label: 'Start Return', action: 'return' },
                  { icon: Download, label: 'Download Receipt', action: 'receipt' },
                  { icon: MessageSquare, label: 'Contact Support', action: 'support' },
                  { icon: Star, label: 'Leave Review', action: 'review' },
                  { icon: Share2, label: 'Share Order', action: 'share' }
                ].map((item) => (
                  <button
                    key={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-all"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Recent Activity</span>
              </div>
              <div className="space-y-2 text-xs text-orange-600">
                <p>📦 iPhone 15 Pro Max shipped</p>
                <p>✅ Sony headphones delivered</p>
                <p>❌ MacBook order cancelled</p>
                <p>📝 Review submitted for headphones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{order.retailer.logo}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {order.retailer.name} • {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <img
                            key={item.id}
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-white"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {order.items[0].name}
                          {order.items.length > 1 && ` and ${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} item{order.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Payment</span>
                        <div className="flex items-center gap-2 mt-1">
                          {getPaymentIcon(order.paymentMethod.type)}
                          <span className="font-medium">
                            {order.paymentMethod.brand}
                            {order.paymentMethod.last4 && ` ••••${order.paymentMethod.last4}`}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Shipping To</span>
                        <p className="font-medium mt-1">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Expected Delivery</span>
                        <p className="font-medium mt-1">
                          {order.expectedDelivery ? formatDate(order.expectedDelivery) : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tracking</span>
                        <div className="mt-1">
                          {order.tracking ? (
                            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                              <ExternalLink className="h-3 w-3" />
                              {order.tracking.trackingNumber.slice(-6)}
                            </button>
                          ) : (
                            <span className="text-gray-500">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        {order.tracking && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm">
                            <Truck className="h-4 w-4" />
                            Track Package
                          </button>
                        )}
                        {order.invoiceUrl && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm">
                            <Receipt className="h-4 w-4" />
                            Invoice
                          </button>
                        )}
                        {order.status === 'delivered' && order.items.some(item => item.canReturn) && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all text-sm">
                            <RefreshCw className="h-4 w-4" />
                            Return
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.retailer.support.chat && (
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition-all">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-600 hover:text-orange-600 transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{order.retailer.logo}</span>
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={order.items[0].image}
                        alt={order.items[0].name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{order.items[0].name}</h4>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-semibold">{formatCurrency(order.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date</span>
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                      {order.expectedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected</span>
                          <span>{formatDate(order.expectedDelivery)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all text-sm">
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{selectedOrder.retailer.logo}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                    <p className="text-gray-600">
                      {selectedOrder.retailer.name} • {formatDate(selectedOrder.orderDate)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-600 hover:text-gray-700 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                {/* Order Status and Tracking */}
                {selectedOrder.tracking && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-900">Tracking Information</h3>
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <ExternalLink className="h-4 w-4" />
                        Track on {selectedOrder.tracking.carrier}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {selectedOrder.tracking.updates.map((update, index) => (
                        <div key={update.id} className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{update.status}</p>
                            <p className="text-sm text-gray-600">{update.description}</p>
                            <p className="text-xs text-gray-500">
                              {update.location} • {update.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-gray-600">{item.brand}</p>
                          {item.variant && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              {item.variant.color && <span>Color: {item.variant.color}</span>}
                              {item.variant.size && <span>Size: {item.variant.size}</span>}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-semibold">{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {item.canReview && !item.reviewed && (
                            <button className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all text-sm">
                              <Star className="h-4 w-4" />
                              Review
                            </button>
                          )}
                          {item.reviewed && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < (item.rating || 0) ? 'fill-current' : ''}`} />
                              ))}
                            </div>
                          )}
                          {item.canReturn && (
                            <button className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all text-sm">
                              <RefreshCw className="h-4 w-4" />
                              Return
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress.street}</p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                      </p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress.country}</p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-gray-600 mt-2">{selectedOrder.shippingAddress.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatCurrency(selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      {selectedOrder.discount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Order Tracking • Purchase History • Return Management</span>
            <span>Multi-Store Orders • Real-time Updates • Customer Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                <Package className="h-4 w-4" />
                Order Management
              </div>
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                <Truck className="h-4 w-4" />
                Live Tracking
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                Order History
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
