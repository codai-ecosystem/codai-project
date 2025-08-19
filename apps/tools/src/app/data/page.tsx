'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Database, BarChart3, PieChart, LineChart, TrendingUp, Filter,
  Download, Upload, Copy, Save, Trash2, Eye, EyeOff, Grid, LayoutList,
  Search, Star, Clock, Settings, RefreshCw, Plus, Edit3, Check, X,
  Table, FileSpreadsheet, Calculator, Zap, Target, Layers, Globe,
  ArrowUpDown, ArrowLeftRight, Split, Merge, Hash, Percent,
  AlertCircle, CheckCircle, Info, Sparkles, ArrowRight, ChevronDown
} from 'lucide-react'

// TypeScript Interfaces
interface DataTool {
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
  inputFormats: string[]
  outputFormats: string[]
}

interface DataMetrics {
  totalTools: number
  activeUsers: string
  processedToday: string
  avgProcessingTime: string
  successRate: number
  popularFormat: string
}

interface DataProcessingJob {
  id: string
  tool: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  dataSize: string
  recordCount: number
  outputSize?: string
}

interface DataCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
}

interface DataProcessor {
  inputData: string
  outputData: string
  format: string
  delimiter: string
  hasHeaders: boolean
  preview: any[]
  columns: string[]
  rowCount: number
}

export default function DataToolsPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeProcessor, setActiveProcessor] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [dataProcessor, setDataProcessor] = useState<DataProcessor>({
    inputData: 'Name,Age,City,Salary\nJohn Doe,28,New York,75000\nJane Smith,32,San Francisco,85000\nMike Johnson,25,Chicago,65000\nSarah Wilson,30,Boston,80000',
    outputData: '',
    format: 'csv',
    delimiter: ',',
    hasHeaders: true,
    preview: [],
    columns: [],
    rowCount: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock Data
  const dataMetrics: DataMetrics = {
    totalTools: 7,
    activeUsers: '2,156',
    processedToday: '9,847',
    avgProcessingTime: '1.8s',
    successRate: 96.7,
    popularFormat: 'CSV'
  }

  const categories: DataCategory[] = [
    {
      id: 'analysis',
      name: 'Data Analysis',
      count: 2,
      icon: BarChart3,
      color: 'text-blue-600',
      description: 'Analyze and visualize data patterns'
    },
    {
      id: 'transformation',
      name: 'Data Transformation',
      count: 2,
      icon: ArrowUpDown,
      color: 'text-green-600',
      description: 'Transform and clean data formats'
    },
    {
      id: 'conversion',
      name: 'Format Conversion',
      count: 2,
      icon: RefreshCw,
      color: 'text-purple-600',
      description: 'Convert between data formats'
    },
    {
      id: 'validation',
      name: 'Data Validation',
      count: 1,
      icon: CheckCircle,
      color: 'text-orange-600',
      description: 'Validate and verify data quality'
    }
  ]

  const dataTools: DataTool[] = [
    {
      id: 'csv-analyzer',
      name: 'CSV Analyzer',
      description: 'Analyze CSV files with statistical insights and data profiling',
      category: 'analysis',
      icon: FileSpreadsheet,
      usage: 3847,
      rating: 4.8,
      lastUsed: '2 mins ago',
      processing: false,
      featured: true,
      inputFormats: ['CSV', 'TSV', 'Excel'],
      outputFormats: ['Analysis Report', 'Charts', 'Statistics']
    },
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Format, validate, and beautify JSON data with syntax highlighting',
      category: 'transformation',
      icon: Database,
      usage: 2956,
      rating: 4.7,
      lastUsed: '5 mins ago',
      processing: false,
      featured: true,
      inputFormats: ['JSON', 'JSONL'],
      outputFormats: ['Formatted JSON', 'Minified JSON']
    },
    {
      id: 'data-converter',
      name: 'Data Converter',
      description: 'Convert between CSV, JSON, XML, and other data formats',
      category: 'conversion',
      icon: ArrowLeftRight,
      usage: 2647,
      rating: 4.6,
      lastUsed: '8 mins ago',
      processing: false,
      featured: true,
      inputFormats: ['CSV', 'JSON', 'XML', 'TSV'],
      outputFormats: ['CSV', 'JSON', 'XML', 'Excel']
    },
    {
      id: 'chart-generator',
      name: 'Chart Generator',
      description: 'Create interactive charts and visualizations from your data',
      category: 'analysis',
      icon: PieChart,
      usage: 1834,
      rating: 4.5,
      lastUsed: '12 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['CSV', 'JSON', 'Excel'],
      outputFormats: ['PNG', 'SVG', 'Interactive HTML']
    },
    {
      id: 'data-cleaner',
      name: 'Data Cleaner',
      description: 'Clean and normalize data by removing duplicates and fixing formats',
      category: 'transformation',
      icon: Filter,
      usage: 1567,
      rating: 4.4,
      lastUsed: '15 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['CSV', 'JSON', 'Excel'],
      outputFormats: ['Cleaned CSV', 'Cleaned JSON']
    },
    {
      id: 'sql-formatter',
      name: 'SQL Formatter',
      description: 'Format and beautify SQL queries with syntax highlighting',
      category: 'conversion',
      icon: Database,
      usage: 1234,
      rating: 4.3,
      lastUsed: '18 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['SQL'],
      outputFormats: ['Formatted SQL', 'Minified SQL']
    },
    {
      id: 'data-validator',
      name: 'Data Validator',
      description: 'Validate data integrity, schema compliance, and quality metrics',
      category: 'validation',
      icon: CheckCircle,
      usage: 987,
      rating: 4.2,
      lastUsed: '22 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['CSV', 'JSON', 'XML'],
      outputFormats: ['Validation Report', 'Error Log']
    }
  ]

  const processingJobs: DataProcessingJob[] = [
    {
      id: '1',
      tool: 'CSV Analyzer',
      status: 'processing',
      progress: 65,
      startTime: '2 mins ago',
      dataSize: '15.2 MB',
      recordCount: 45678
    },
    {
      id: '2',
      tool: 'Data Converter',
      status: 'completed',
      progress: 100,
      startTime: '6 mins ago',
      dataSize: '8.7 MB',
      recordCount: 23456,
      outputSize: '12.3 MB'
    },
    {
      id: '3',
      tool: 'JSON Formatter',
      status: 'completed',
      progress: 100,
      startTime: '10 mins ago',
      dataSize: '2.1 MB',
      recordCount: 5678,
      outputSize: '2.4 MB'
    }
  ]

  // Filter tools based on search and category
  const filteredTools = dataTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Parse CSV data for preview
  useEffect(() => {
    if (dataProcessor.inputData && dataProcessor.format === 'csv') {
      try {
        const lines = dataProcessor.inputData.trim().split('\n')
        const delimiter = dataProcessor.delimiter

        if (lines.length > 0) {
          const headers = dataProcessor.hasHeaders ? lines[0].split(delimiter) : []
          const dataLines = dataProcessor.hasHeaders ? lines.slice(1) : lines

          const preview = dataLines.slice(0, 5).map(line => {
            const values = line.split(delimiter)
            const row: any = {}
            if (dataProcessor.hasHeaders) {
              headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim() || ''
              })
            } else {
              values.forEach((value, index) => {
                row[`Column ${index + 1}`] = value.trim()
              })
            }
            return row
          })

          setDataProcessor(prev => ({
            ...prev,
            preview,
            columns: dataProcessor.hasHeaders ? headers.map(h => h.trim()) : preview.length > 0 ? Object.keys(preview[0]) : [],
            rowCount: dataLines.length
          }))
        }
      } catch (error) {
        console.error('Error parsing CSV:', error)
      }
    }
  }, [dataProcessor.inputData, dataProcessor.delimiter, dataProcessor.hasHeaders, dataProcessor.format])

  // Process data with selected tool
  const processData = (toolId: string) => {
    setActiveProcessor(toolId)
    // Simulate processing
    setTimeout(() => {
      const tool = dataTools.find(t => t.id === toolId)
      setDataProcessor(prev => ({
        ...prev,
        outputData: `// Processed with ${tool?.name}\n${prev.inputData}`
      }))
      setActiveProcessor(null)
    }, 3000)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setDataProcessor(prev => ({
            ...prev,
            inputData: e.target!.result as string,
            format: file.name.endsWith('.json') ? 'json' : 'csv'
          }))
        }
      }
      reader.readAsText(file)
    }
  }

  // Update data processor
  const updateDataProcessor = (field: keyof DataProcessor, value: any) => {
    setDataProcessor(prev => ({ ...prev, [field]: value }))
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
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Database className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Data Tools</h1>
                      <p className="text-cyan-100 text-lg">Advanced Data Analysis & Transformation Suite</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{dataMetrics.totalTools}</div>
                        <div className="text-cyan-100 text-sm">Data Tools</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{dataMetrics.processedToday}</div>
                        <div className="text-cyan-100 text-sm">Processed Today</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{dataMetrics.successRate}%</div>
                        <div className="text-cyan-100 text-sm">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Processor Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Data Processor</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Format:</label>
                    <select
                      value={dataProcessor.format}
                      onChange={(e) => updateDataProcessor('format', e.target.value)}
                      className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg: {dataMetrics.avgProcessingTime}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Data */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Input Data</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => updateDataProcessor('inputData', '')}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={dataProcessor.inputData}
                    onChange={(e) => updateDataProcessor('inputData', e.target.value)}
                    placeholder="Enter your data here..."
                    className="w-full h-64 p-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.xml,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {dataProcessor.format === 'csv' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={dataProcessor.hasHeaders}
                            onChange={(e) => updateDataProcessor('hasHeaders', e.target.checked)}
                            className="rounded"
                          />
                          Has Headers
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700">Delimiter:</label>
                          <select
                            value={dataProcessor.delimiter}
                            onChange={(e) => updateDataProcessor('delimiter', e.target.value)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded text-sm"
                          >
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="\t">Tab</option>
                            <option value="|">Pipe (|)</option>
                          </select>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {dataProcessor.rowCount} rows • {dataProcessor.columns.length} columns
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Data / Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {showPreview ? 'Data Preview' : 'Output Data'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(dataProcessor.outputData)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        disabled={!dataProcessor.outputData && !showPreview}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {showPreview && dataProcessor.preview.length > 0 ? (
                    <div className="h-64 bg-white/50 border border-gray-200 rounded-xl overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            {dataProcessor.columns.map((column, index) => (
                              <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataProcessor.preview.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-100">
                              {dataProcessor.columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-3 py-2 text-gray-900 border-r border-gray-100">
                                  {row[column]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <textarea
                      value={dataProcessor.outputData}
                      readOnly
                      placeholder={showPreview ? "No data to preview" : "Processed data will appear here..."}
                      className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none font-mono text-sm"
                    />
                  )}
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
                      placeholder="Search data tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-600 hover:text-gray-900'
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
                    className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${selectedCategory === category.id
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-lg'
                        : 'bg-white/70 backdrop-blur-sm border-white/50 hover:border-cyan-300 hover:shadow-lg'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className={`h-8 w-8 ${selectedCategory === category.id ? 'text-white' : category.color
                        }`} />
                      <div className={`text-right ${selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                        }`}>
                        <div className="text-2xl font-bold">{category.count}</div>
                        <div className={`text-sm ${selectedCategory === category.id ? 'text-cyan-100' : 'text-gray-600'
                          }`}>Tools</div>
                      </div>
                    </div>
                    <h3 className={`font-semibold mb-2 ${selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                      }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${selectedCategory === category.id ? 'text-cyan-100' : 'text-gray-600'
                      }`}>
                      {category.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Data Tools Grid */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Data Processing Tools</h3>
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
                            className="group p-6 bg-white/50 rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl group-hover:from-cyan-200 group-hover:to-blue-200 transition-all duration-200">
                                  <IconComponent className="h-6 w-6 text-cyan-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
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

                            <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {tool.inputFormats.slice(0, 3).map(format => (
                                <span key={format} className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                                  {format}
                                </span>
                              ))}
                              {tool.inputFormats.length > 3 && (
                                <span className="text-xs text-gray-500">+{tool.inputFormats.length - 3}</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Last used: {tool.lastUsed}</span>
                              <button
                                onClick={() => processData(tool.id)}
                                disabled={!dataProcessor.inputData.trim() || activeProcessor === tool.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-cyan-300 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-cyan-600" />
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
                                  <div className="flex gap-1">
                                    {tool.inputFormats.slice(0, 2).map(format => (
                                      <span key={format} className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                                        {format}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => processData(tool.id)}
                              disabled={!dataProcessor.inputData.trim() || activeProcessor === tool.id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Processing Queue & Stats */}
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
                            <p className="text-xs text-gray-600">{job.recordCount.toLocaleString()} records • {job.dataSize}</p>
                            <p className="text-xs text-gray-500">Started {job.startTime}</p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Size: {job.dataSize}</span>
                          {job.outputSize && (
                            <button className="text-cyan-600 hover:text-cyan-700">
                              Download ({job.outputSize})
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Stats</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-lg font-semibold text-gray-900">{dataMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing</span>
                      <span className="text-lg font-semibold text-gray-900">{dataMetrics.avgProcessingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{dataMetrics.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Popular Format</span>
                      <span className="text-lg font-semibold text-cyan-600">{dataMetrics.popularFormat}</span>
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
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
                <p className="text-cyan-100 text-sm mb-4">
                  AI-powered data analysis with statistical insights and pattern recognition.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Analyze Data
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Visualization</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Create interactive charts and dashboards from your data instantly.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Create Charts
                </button>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  Bank-grade encryption and privacy protection for sensitive data processing.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Learn Security
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
