'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  Underline, Copy, Download, Upload, Hash, Quote, List, CheckSquare,
  Code, Search, Replace, Scissors, RotateCcw, Eye, EyeOff, 
  Zap, Clock, Star, ArrowRight, Filter, Grid, LayoutList,
  Settings, RefreshCw, Save, Trash2, Plus, Edit3, Check, X
} from 'lucide-react'

// TypeScript Interfaces
interface TextTool {
  id: string
  name: string
  description: string
  category: string
  icon: any
  usage: number
  rating: number
  lastUsed: string
  processing: boolean
  featured: boolean
}

interface TextMetrics {
  totalTools: number
  activeUsers: string
  processedToday: string
  avgProcessingTime: string
  successRate: number
  popularCategory: string
}

interface ProcessingJob {
  id: string
  tool: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  inputSize: string
  outputSize?: string
}

interface TextCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
}

export default function TextToolsPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [activeProcessor, setActiveProcessor] = useState<string | null>(null)

  // Mock Data
  const textMetrics: TextMetrics = {
    totalTools: 12,
    activeUsers: '2,847',
    processedToday: '8,423',
    avgProcessingTime: '0.8s',
    successRate: 99.2,
    popularCategory: 'Formatting'
  }

  const categories: TextCategory[] = [
    {
      id: 'formatting',
      name: 'Text Formatting',
      count: 4,
      icon: Type,
      color: 'text-blue-600',
      description: 'Format, style, and beautify text content'
    },
    {
      id: 'conversion',
      name: 'Text Conversion',
      count: 3,
      icon: RefreshCw,
      color: 'text-green-600',
      description: 'Convert between different text formats'
    },
    {
      id: 'analysis',
      name: 'Text Analysis',
      count: 3,
      icon: Search,
      color: 'text-purple-600',
      description: 'Analyze and extract insights from text'
    },
    {
      id: 'utilities',
      name: 'Text Utilities',
      count: 2,
      icon: Settings,
      color: 'text-orange-600',
      description: 'General text processing utilities'
    }
  ]

  const textTools: TextTool[] = [
    {
      id: 'formatter',
      name: 'Text Formatter',
      description: 'Format and beautify text with proper spacing, capitalization, and structure',
      category: 'formatting',
      icon: Type,
      usage: 2456,
      rating: 4.8,
      lastUsed: '2 mins ago',
      processing: false,
      featured: true
    },
    {
      id: 'case-converter',
      name: 'Case Converter',
      description: 'Convert text between different cases: UPPER, lower, Title, camelCase, etc.',
      category: 'formatting',
      icon: AlignLeft,
      usage: 1847,
      rating: 4.7,
      lastUsed: '5 mins ago',
      processing: false,
      featured: true
    },
    {
      id: 'word-counter',
      name: 'Word Counter',
      description: 'Count words, characters, paragraphs, and analyze reading time',
      category: 'analysis',
      icon: Hash,
      usage: 1523,
      rating: 4.6,
      lastUsed: '8 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'markdown-converter',
      name: 'Markdown Converter',
      description: 'Convert between Markdown and HTML with preview functionality',
      category: 'conversion',
      icon: Code,
      usage: 1234,
      rating: 4.9,
      lastUsed: '12 mins ago',
      processing: false,
      featured: true
    },
    {
      id: 'text-differ',
      name: 'Text Differ',
      description: 'Compare two texts and highlight differences with detailed analysis',
      category: 'analysis',
      icon: Search,
      usage: 987,
      rating: 4.5,
      lastUsed: '15 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'regex-tester',
      name: 'Regex Tester',
      description: 'Test and validate regular expressions with real-time matching',
      category: 'utilities',
      icon: Replace,
      usage: 756,
      rating: 4.4,
      lastUsed: '18 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'text-cleaner',
      name: 'Text Cleaner',
      description: 'Remove unwanted characters, whitespace, and format inconsistencies',
      category: 'formatting',
      icon: Scissors,
      usage: 645,
      rating: 4.3,
      lastUsed: '22 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'base64-encoder',
      name: 'Base64 Encoder',
      description: 'Encode and decode text to/from Base64 format with validation',
      category: 'conversion',
      icon: Code,
      usage: 534,
      rating: 4.2,
      lastUsed: '25 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'url-encoder',
      name: 'URL Encoder',
      description: 'Encode and decode URLs with special character handling',
      category: 'conversion',
      icon: Code,
      usage: 423,
      rating: 4.1,
      lastUsed: '28 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'duplicate-remover',
      name: 'Duplicate Remover',
      description: 'Remove duplicate lines and words from text with sorting options',
      category: 'utilities',
      icon: Trash2,
      usage: 312,
      rating: 4.0,
      lastUsed: '32 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'lorem-generator',
      name: 'Lorem Generator',
      description: 'Generate Lorem Ipsum placeholder text with custom parameters',
      category: 'formatting',
      icon: Plus,
      usage: 287,
      rating: 3.9,
      lastUsed: '35 mins ago',
      processing: false,
      featured: false
    },
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Format, validate, and beautify JSON with syntax highlighting',
      category: 'analysis',
      icon: Code,
      usage: 201,
      rating: 4.7,
      lastUsed: '38 mins ago',
      processing: false,
      featured: false
    }
  ]

  const processingJobs: ProcessingJob[] = [
    {
      id: '1',
      tool: 'Text Formatter',
      status: 'processing',
      progress: 75,
      startTime: '2 mins ago',
      inputSize: '2.4 KB'
    },
    {
      id: '2',
      tool: 'Markdown Converter',
      status: 'completed',
      progress: 100,
      startTime: '5 mins ago',
      inputSize: '1.8 KB',
      outputSize: '3.2 KB'
    },
    {
      id: '3',
      tool: 'Word Counter',
      status: 'completed',
      progress: 100,
      startTime: '8 mins ago',
      inputSize: '956 B',
      outputSize: 'Analysis'
    }
  ]

  // Filter tools based on search and category
  const filteredTools = textTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Process text with selected tool
  const processText = (toolId: string) => {
    setActiveProcessor(toolId)
    // Simulate processing
    setTimeout(() => {
      setOutputText(`Processed with ${textTools.find(t => t.id === toolId)?.name}: ${inputText}`)
      setActiveProcessor(null)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Enhanced Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <FileText className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Text Tools</h1>
                      <p className="text-blue-100 text-lg">Advanced Text Processing & Formatting Utilities</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{textMetrics.totalTools}</div>
                        <div className="text-blue-100 text-sm">Text Tools</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{textMetrics.processedToday}</div>
                        <div className="text-blue-100 text-sm">Processed Today</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{textMetrics.successRate}%</div>
                        <div className="text-blue-100 text-sm">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text Processor Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Quick Text Processor</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg: {textMetrics.avgProcessingTime}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your text here to process..."
                    className="w-full h-32 p-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {inputText.length} characters, {inputText.split(/\s+/).filter(w => w.length > 0).length} words
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Upload className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setInputText('')}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Text</label>
                  <textarea
                    value={outputText}
                    readOnly
                    placeholder="Processed text will appear here..."
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {outputText.length} characters, {outputText.split(/\s+/).filter(w => w.length > 0).length} words
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(outputText)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        disabled={!outputText}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" disabled={!outputText}>
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search text tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex bg-white/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Categories Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {categories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
                      selectedCategory === category.id 
                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg' 
                        : 'bg-white/70 backdrop-blur-sm border-white/50 hover:border-blue-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className={`h-8 w-8 ${
                        selectedCategory === category.id ? 'text-white' : category.color
                      }`} />
                      <div className={`text-right ${
                        selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="text-2xl font-bold">{category.count}</div>
                        <div className={`text-sm ${
                          selectedCategory === category.id ? 'text-blue-100' : 'text-gray-600'
                        }`}>Tools</div>
                      </div>
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${
                      selectedCategory === category.id ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Text Tools Grid */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Text Processing Tools</h3>
                    <div className="text-sm text-gray-600">{filteredTools.length} tools</div>
                  </div>
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTools.map((tool, index) => {
                        const IconComponent = tool.icon
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="group p-6 bg-white/50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-200">
                                  <IconComponent className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {tool.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span className="text-xs text-gray-600">{tool.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-600">{tool.usage} uses</span>
                                  </div>
                                </div>
                              </div>
                              {tool.featured && (
                                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                                  Featured
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Last used: {tool.lastUsed}</span>
                              <button
                                onClick={() => processText(tool.id)}
                                disabled={!inputText || activeProcessor === tool.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {activeProcessor === tool.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-4 w-4" />
                                    Process
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTools.map((tool, index) => {
                        const IconComponent = tool.icon
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                                <p className="text-sm text-gray-600">{tool.description}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">{tool.rating}</span>
                                  </div>
                                  <span className="text-xs text-gray-600">{tool.usage} uses</span>
                                  <span className="text-xs text-gray-500">Last used: {tool.lastUsed}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => processText(tool.id)}
                              disabled={!inputText || activeProcessor === tool.id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {activeProcessor === tool.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4" />
                                  Process
                                </>
                              )}
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Processing Queue */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Processing Queue</h3>
                    <RefreshCw className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {processingJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-4 bg-white/50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{job.tool}</h4>
                            <p className="text-xs text-gray-600">Started {job.startTime}</p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                            {job.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {job.status === 'failed' && <X className="h-3 w-3 mr-1" />}
                            {job.status}
                          </div>
                        </div>
                        
                        {job.status === 'processing' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Input: {job.inputSize}</span>
                          {job.outputSize && <span>Output: {job.outputSize}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-lg font-semibold text-gray-900">{textMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing</span>
                      <span className="text-lg font-semibold text-gray-900">{textMetrics.avgProcessingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{textMetrics.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Popular Category</span>
                      <span className="text-lg font-semibold text-blue-600">{textMetrics.popularCategory}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Modern Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Type className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Text Processing</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Advanced algorithms for intelligent text analysis and transformation.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Learn More
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Processing</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Lightning-fast text processing with real-time preview and validation.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Try Now
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Settings className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Custom Tools</h3>
                <p className="text-green-100 text-sm mb-4">
                  Create custom text processing workflows with our advanced tool builder.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Build Tools
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
