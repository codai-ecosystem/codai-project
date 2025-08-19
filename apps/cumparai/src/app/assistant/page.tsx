'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  ShoppingCart,
  Heart,
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
  Bookmark,
  ExternalLink,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Image,
  FileText,
  Package,
  DollarSign,
  Target,
  Clock,
  Zap,
  Gift,
  Percent,
  Award,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Camera as CameraIcon,
  Gamepad2,
  Home,
  Car,
  Shirt,
  Book,
  Dumbbell,
  Palette,
  Utensils,
  Baby,
  PawPrint,
  Flower,
  Plane,
  Music,
  Film,
  Coffee,
  ChefHat,
  Briefcase,
  GraduationCap,
  Heart as HeartIcon,
  Sun,
  Moon,
  Cloud,
  Wind,
  Snowflake,
  Brain,
  Eye,
  Fingerprint,
  Lock,
  Key,
  CreditCard,
  Truck,
  Store,
  Users,
  UserCheck,
  MessageCircle,
  PhoneCall,
  Video,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer,
  Stopwatch,
  Alarm,
  TrendingFlat,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Move,
  Grid,
  List,
  Layout,
  Sidebar,
  Menu,
  X,
  Plus,
  Minus,
  Edit3,
  Save,
  Download,
  Upload,
  Archive,
  Trash2,
  Delete,
  FolderOpen,
  File,
  Folder,
  Tag,
  Tags
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: MessageAttachment[]
  recommendations?: ProductRecommendation[]
  actions?: MessageAction[]
  metadata?: {
    confidence?: number
    sources?: string[]
    category?: string
    intent?: string
  }
}

interface MessageAttachment {
  id: string
  type: 'image' | 'document' | 'link' | 'product'
  url: string
  title?: string
  description?: string
  thumbnail?: string
}

interface ProductRecommendation {
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
  features: string[]
  pros: string[]
  cons: string[]
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'
  shipping: string
  returnPolicy: string
  warranty: string
  retailer: string
  url: string
  aiScore: number
  matchReason: string
  similarProducts?: string[]
}

interface MessageAction {
  id: string
  type: 'add_to_cart' | 'add_to_wishlist' | 'compare' | 'share' | 'set_alert' | 'view_details'
  label: string
  icon: React.ComponentType<any>
  productId?: string
  url?: string
  data?: any
}

interface ChatSuggestion {
  id: string
  text: string
  category: string
  icon: React.ComponentType<any>
}

interface AIPersonality {
  id: string
  name: string
  description: string
  avatar: string
  specialization: string[]
  tone: 'friendly' | 'professional' | 'casual' | 'expert'
  responseStyle: 'detailed' | 'concise' | 'balanced'
}

export default function AIShoppingAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedPersonality, setSelectedPersonality] = useState('shopie')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [chatSuggestions, setChatSuggestions] = useState<ChatSuggestion[]>([])
  const [showAttachments, setShowAttachments] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const personalities: AIPersonality[] = [
    {
      id: 'shopie',
      name: 'Shopie',
      description: 'Your friendly shopping companion who loves finding the best deals',
      avatar: '🛍️',
      specialization: ['deals', 'savings', 'general shopping'],
      tone: 'friendly',
      responseStyle: 'balanced'
    },
    {
      id: 'techie',
      name: 'Techie',
      description: 'Expert in electronics, gadgets, and technology products',
      avatar: '🤖',
      specialization: ['electronics', 'computers', 'gadgets'],
      tone: 'expert',
      responseStyle: 'detailed'
    },
    {
      id: 'fashionista',
      name: 'Fashionista',
      description: 'Style expert for fashion, beauty, and lifestyle products',
      avatar: '✨',
      specialization: ['fashion', 'beauty', 'lifestyle'],
      tone: 'casual',
      responseStyle: 'balanced'
    },
    {
      id: 'homie',
      name: 'Homie',
      description: 'Home improvement and household essentials specialist',
      avatar: '🏠',
      specialization: ['home', 'garden', 'appliances'],
      tone: 'professional',
      responseStyle: 'detailed'
    }
  ]

  const initialSuggestions: ChatSuggestion[] = [
    { id: '1', text: 'Find me a laptop under $1000', category: 'electronics', icon: Laptop },
    { id: '2', text: 'Best wireless headphones for music', category: 'electronics', icon: Headphones },
    { id: '3', text: 'I need a gift for my mom', category: 'gifts', icon: Gift },
    { id: '4', text: 'Show me running shoes on sale', category: 'sports', icon: Dumbbell },
    { id: '5', text: 'Compare iPhone vs Samsung phones', category: 'electronics', icon: Smartphone },
    { id: '6', text: 'Best coffee machine for beginners', category: 'home', icon: Coffee },
    { id: '7', text: 'Sustainable fashion brands', category: 'fashion', icon: Shirt },
    { id: '8', text: 'Help me build a gaming setup', category: 'electronics', icon: Gamepad2 }
  ]

  const welcomeMessage: Message = {
    id: 'welcome',
    type: 'assistant',
    content: `Hi! I'm ${personalities.find(p => p.id === selectedPersonality)?.name || 'Shopie'}, your AI shopping assistant! 🛍️

I'm here to help you find the perfect products, compare prices, discover deals, and make smart shopping decisions. Whether you're looking for something specific or just browsing, I can:

✨ **Find products** based on your needs and budget
🔍 **Compare options** across different brands and stores  
💰 **Track prices** and notify you of deals
🎯 **Recommend products** tailored to your preferences
📊 **Analyze reviews** and specifications
🎁 **Suggest gifts** for any occasion

What can I help you find today?`,
    timestamp: new Date(),
    metadata: {
      confidence: 1.0,
      category: 'greeting',
      intent: 'welcome'
    }
  }

  useEffect(() => {
    setMessages([welcomeMessage])
    setChatSuggestions(initialSuggestions)
  }, [selectedPersonality])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(text)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
      updateSuggestions(text)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase()

    // Simulate different response types based on input
    if (lowerInput.includes('laptop') || lowerInput.includes('computer')) {
      return {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: "I found some great laptops that match your criteria! Here are my top recommendations based on performance, value, and user reviews:",
        timestamp: new Date(),
        recommendations: [
          {
            id: '1',
            name: 'MacBook Air M2',
            brand: 'Apple',
            price: 999,
            originalPrice: 1199,
            discount: 17,
            rating: 4.8,
            reviews: 2847,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
            category: 'laptops',
            features: ['M2 Chip', '8GB RAM', '256GB SSD', '13.6" Display'],
            pros: ['Excellent battery life', 'Great performance', 'Premium build quality'],
            cons: ['Limited ports', 'Only 8GB RAM'],
            availability: 'in_stock',
            shipping: 'Free 2-day shipping',
            returnPolicy: '14-day return',
            warranty: '1-year limited',
            retailer: 'Apple Store',
            url: '/product/macbook-air-m2',
            aiScore: 94,
            matchReason: 'Perfect balance of performance and portability for your needs'
          },
          {
            id: '2',
            name: 'Dell XPS 13',
            brand: 'Dell',
            price: 849,
            originalPrice: 1099,
            discount: 23,
            rating: 4.6,
            reviews: 1923,
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300',
            category: 'laptops',
            features: ['Intel i7', '16GB RAM', '512GB SSD', '13.4" Display'],
            pros: ['More RAM', 'Great value', 'Windows compatibility'],
            cons: ['Shorter battery life', 'Fan noise under load'],
            availability: 'in_stock',
            shipping: 'Free shipping',
            returnPolicy: '30-day return',
            warranty: '1-year warranty',
            retailer: 'Dell Direct',
            url: '/product/dell-xps-13',
            aiScore: 91,
            matchReason: 'Best value with excellent specs for productivity'
          }
        ],
        actions: [
          { id: '1', type: 'compare', label: 'Compare These', icon: BarChart3 },
          { id: '2', type: 'set_alert', label: 'Set Price Alert', icon: Target },
          { id: '3', type: 'share', label: 'Share Results', icon: Share2 }
        ],
        metadata: {
          confidence: 0.95,
          sources: ['Apple Store', 'Dell Direct', 'Best Buy'],
          category: 'electronics',
          intent: 'product_search'
        }
      }
    }

    if (lowerInput.includes('headphones') || lowerInput.includes('music')) {
      return {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: "Great choice! I've found some excellent wireless headphones that are perfect for music lovers. Here are my top picks:",
        timestamp: new Date(),
        recommendations: [
          {
            id: '3',
            name: 'Sony WH-1000XM5',
            brand: 'Sony',
            price: 329,
            originalPrice: 399,
            discount: 18,
            rating: 4.7,
            reviews: 3421,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
            category: 'headphones',
            features: ['Noise Cancelling', '30hr Battery', 'Hi-Res Audio', 'Bluetooth 5.2'],
            pros: ['Best-in-class noise cancellation', 'Exceptional sound quality', 'Comfortable for long wear'],
            cons: ['Expensive', 'Not foldable'],
            availability: 'in_stock',
            shipping: 'Free next-day shipping',
            returnPolicy: '30-day return',
            warranty: '2-year warranty',
            retailer: 'Sony Store',
            url: '/product/sony-wh1000xm5',
            aiScore: 96,
            matchReason: 'Industry-leading noise cancellation and audiophile-quality sound'
          }
        ],
        metadata: {
          confidence: 0.92,
          category: 'electronics',
          intent: 'product_recommendation'
        }
      }
    }

    // Default helpful response
    return {
      id: `ai-${Date.now()}`,
      type: 'assistant',
      content: `I'd be happy to help you with that! Let me search for the best options and deals. Could you provide a bit more detail about:

• Your budget range
• Specific features you're looking for
• Preferred brands or stores
• When you need it by

This will help me give you more personalized recommendations! 🎯`,
      timestamp: new Date(),
      actions: [
        { id: '1', type: 'view_details', label: 'Browse Categories', icon: Grid },
        { id: '2', type: 'set_alert', label: 'Set Budget Alert', icon: DollarSign }
      ],
      metadata: {
        confidence: 0.8,
        category: 'general',
        intent: 'information_gathering'
      }
    }
  }

  const updateSuggestions = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()
    let newSuggestions: ChatSuggestion[] = []

    if (lowerInput.includes('laptop') || lowerInput.includes('computer')) {
      newSuggestions = [
        { id: 's1', text: 'Show me gaming laptops', category: 'electronics', icon: Gamepad2 },
        { id: 's2', text: 'Best laptops for students', category: 'electronics', icon: GraduationCap },
        { id: 's3', text: 'Compare MacBook vs Windows', category: 'electronics', icon: BarChart3 },
        { id: 's4', text: 'Lightweight laptops for travel', category: 'electronics', icon: Plane }
      ]
    } else if (lowerInput.includes('headphones')) {
      newSuggestions = [
        { id: 's1', text: 'Noise cancelling headphones', category: 'electronics', icon: VolumeX },
        { id: 's2', text: 'Best earbuds for workouts', category: 'sports', icon: Dumbbell },
        { id: 's3', text: 'Studio headphones for music', category: 'electronics', icon: Music },
        { id: 's4', text: 'Budget wireless headphones', category: 'electronics', icon: DollarSign }
      ]
    } else {
      newSuggestions = initialSuggestions.slice(0, 4)
    }

    setChatSuggestions(newSuggestions)
  }

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    handleSendMessage(suggestion.text)
  }

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode)
    if (!isVoiceMode) {
      // Start voice recognition
      setIsListening(true)
      // Simulate voice recognition
      setTimeout(() => setIsListening(false), 3000)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const currentPersonality = personalities.find(p => p.id === selectedPersonality) || personalities[0]

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-2xl">
              {currentPersonality.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Shopping Assistant</h1>
              <p className="text-sm text-gray-500">
                Chatting with {currentPersonality.name} • {currentPersonality.description}
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Personality Selector */}
            <select
              value={selectedPersonality}
              onChange={(e) => setSelectedPersonality(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              {personalities.map((personality) => (
                <option key={personality.id} value={personality.id}>
                  {personality.avatar} {personality.name}
                </option>
              ))}
            </select>

            {/* Voice Mode Toggle */}
            <motion.button
              onClick={handleVoiceToggle}
              className={`p-3 rounded-lg transition-all ${isVoiceMode
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-white/60 text-gray-600 hover:text-orange-600'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </motion.button>

            {/* Settings */}
            <motion.button
              className="p-3 bg-white/60 text-gray-600 rounded-lg hover:text-orange-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-lg">
                        {currentPersonality.avatar}
                      </div>
                    </div>
                  )}

                  <div className={`max-w-2xl ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-2xl p-4 ${message.type === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-900'
                        }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, index) => (
                          <p key={index} className={`${index === 0 ? '' : 'mt-2'} ${message.type === 'user' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {line}
                          </p>
                        ))}
                      </div>

                      {/* Recommendations */}
                      {message.recommendations && (
                        <div className="mt-4 space-y-4">
                          {message.recommendations.map((rec) => (
                            <div key={rec.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="flex gap-4">
                                <img
                                  src={rec.image}
                                  alt={rec.name}
                                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-lg">{rec.name}</h4>
                                      <p className="text-gray-600">{rec.brand}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-green-600">
                                          ${rec.price}
                                        </span>
                                        {rec.originalPrice && (
                                          <span className="text-lg text-gray-500 line-through">
                                            ${rec.originalPrice}
                                          </span>
                                        )}
                                      </div>
                                      {rec.discount && (
                                        <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                          {rec.discount}% off
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="font-medium">{rec.rating}</span>
                                      <span className="text-gray-500 text-sm">({rec.reviews})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Brain className="h-4 w-4 text-purple-500" />
                                      <span className="text-sm font-medium text-purple-600">
                                        {rec.aiScore}% match
                                      </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${rec.availability === 'in_stock' ? 'bg-green-100 text-green-700' :
                                        rec.availability === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-700'
                                      }`}>
                                      {rec.availability.replace('_', ' ')}
                                    </span>
                                  </div>

                                  <p className="text-sm text-purple-600 mb-3 italic">
                                    💡 {rec.matchReason}
                                  </p>

                                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-700">Key Features:</span>
                                      <ul className="text-gray-600 mt-1">
                                        {rec.features.slice(0, 3).map((feature, idx) => (
                                          <li key={idx}>• {feature}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Shipping & Returns:</span>
                                      <p className="text-gray-600 mt-1">{rec.shipping}</p>
                                      <p className="text-gray-600">{rec.returnPolicy}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <motion.button
                                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all text-sm"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <ShoppingCart className="h-4 w-4" />
                                      Add to Cart
                                    </motion.button>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-red-600 transition-all text-sm">
                                      <Heart className="h-4 w-4" />
                                      Wishlist
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 transition-all text-sm">
                                      <BarChart3 className="h-4 w-4" />
                                      Compare
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-green-600 transition-all text-sm">
                                      <Target className="h-4 w-4" />
                                      Price Alert
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-gray-700 transition-all text-sm">
                                      <Share2 className="h-4 w-4" />
                                      Share
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      {message.actions && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                          {message.actions.map((action) => (
                            <button
                              key={action.id}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-orange-600 transition-all text-sm"
                            >
                              <action.icon className="h-4 w-4" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 px-2">
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      {message.type === 'assistant' && message.metadata?.confidence && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Brain className="h-3 w-3" />
                          {Math.round(message.metadata.confidence * 100)}% confident
                        </div>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-lg">
                    {currentPersonality.avatar}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {currentPersonality.name} is thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Suggestions */}
          {chatSuggestions.length > 0 && (
            <div className="px-6 py-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Suggestions:</span>
                {chatSuggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/60 border border-gray-200 text-gray-600 rounded-full hover:bg-orange-100 hover:text-orange-700 hover:border-orange-200 transition-all text-sm whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <suggestion.icon className="h-4 w-4" />
                    {suggestion.text}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4 bg-white/60 backdrop-blur-sm border-t border-gray-200">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={isVoiceMode ? 'Listening...' : `Ask ${currentPersonality.name} anything about shopping...`}
                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none max-h-32"
                    rows={1}
                    disabled={isVoiceMode}
                  />
                  <button
                    onClick={handleFileUpload}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-orange-600 transition-all"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,document/*"
                  multiple
                />
              </div>
              <motion.button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Press Enter to send, Shift + Enter for new line</span>
                {isVoiceMode && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <Mic className="h-3 w-3" />
                    Voice mode active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Powered by AI</span>
                <Sparkles className="h-3 w-3 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-gray-200 p-4 flex flex-col">
          {/* AI Personality Info */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{currentPersonality.avatar}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentPersonality.name}</h3>
                <p className="text-sm text-gray-600">{currentPersonality.tone} • {currentPersonality.responseStyle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{currentPersonality.description}</p>
            <div className="flex flex-wrap gap-1">
              {currentPersonality.specialization.map((spec) => (
                <span key={spec} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Search, label: 'Product Search', action: 'search' },
                { icon: BarChart3, label: 'Compare Products', action: 'compare' },
                { icon: Target, label: 'Set Price Alert', action: 'alert' },
                { icon: Gift, label: 'Gift Finder', action: 'gifts' },
                { icon: TrendingDown, label: 'Deal Hunter', action: 'deals' },
                { icon: Heart, label: 'Wishlist Review', action: 'wishlist' }
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

          {/* Shopping Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Smartphone, label: 'Electronics' },
                { icon: Shirt, label: 'Fashion' },
                { icon: Home, label: 'Home' },
                { icon: Dumbbell, label: 'Sports' },
                { icon: Book, label: 'Books' },
                { icon: Coffee, label: 'Kitchen' },
                { icon: Gamepad2, label: 'Gaming' },
                { icon: Baby, label: 'Baby' }
              ].map((category) => (
                <button
                  key={category.label}
                  className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-all text-xs"
                >
                  <category.icon className="h-5 w-5" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tips */}
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">AI Shopping Tips</span>
            </div>
            <div className="space-y-2 text-xs text-purple-600">
              <p>💡 Be specific about your needs for better recommendations</p>
              <p>🎯 Mention your budget to find the best value options</p>
              <p>📱 Upload product images for visual search</p>
              <p>⭐ Ask about reviews and comparisons</p>
              <p>🔔 Set alerts for price drops and deals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
