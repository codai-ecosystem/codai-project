'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Image, Camera, Crop, Palette, Layers, Filter, Download, Upload, 
  RotateCw, ZoomIn, ZoomOut, Move, Square, Circle, Triangle,
  Sliders, Contrast, Brightness4, Blur, Sharpen, Droplets,
  Scissors, Copy, Save, Trash2, Eye, EyeOff, Grid, LayoutList,
  Search, Star, Clock, Settings, RefreshCw, Plus, Edit3,
  Wand2, Sparkles, Target, Maximize2, Minimize2, ArrowRight
} from 'lucide-react'

// TypeScript Interfaces
interface ImageTool {
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

interface ImageMetrics {
  totalTools: number
  activeUsers: string
  processedToday: string
  avgProcessingTime: string
  successRate: number
  popularFormat: string
}

interface ImageProcessingJob {
  id: string
  tool: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  inputFile: string
  outputFile?: string
  fileSize: string
}

interface ImageCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
}

interface ImagePreview {
  original: string | null
  processed: string | null
  width: number
  height: number
  size: string
}

export default function ImageToolsPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<ImagePreview>({
    original: null,
    processed: null,
    width: 0,
    height: 0,
    size: '0 KB'
  })
  const [activeProcessor, setActiveProcessor] = useState<string | null>(null)
  const [processingOptions, setProcessingOptions] = useState({
    quality: 85,
    width: 0,
    height: 0,
    format: 'jpg'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock Data
  const imageMetrics: ImageMetrics = {
    totalTools: 8,
    activeUsers: '1,647',
    processedToday: '5,234',
    avgProcessingTime: '2.3s',
    successRate: 97.8,
    popularFormat: 'JPEG'
  }

  const categories: ImageCategory[] = [
    {
      id: 'editing',
      name: 'Image Editing',
      count: 3,
      icon: Edit3,
      color: 'text-blue-600',
      description: 'Crop, resize, rotate, and enhance images'
    },
    {
      id: 'filters',
      name: 'Filters & Effects',
      count: 2,
      icon: Filter,
      color: 'text-purple-600',
      description: 'Apply artistic filters and visual effects'
    },
    {
      id: 'conversion',
      name: 'Format Conversion',
      count: 2,
      icon: RefreshCw,
      color: 'text-green-600',
      description: 'Convert between different image formats'
    },
    {
      id: 'optimization',
      name: 'Optimization',
      count: 1,
      icon: Target,
      color: 'text-orange-600',
      description: 'Compress and optimize image file sizes'
    }
  ]

  const imageTools: ImageTool[] = [
    {
      id: 'image-resizer',
      name: 'Image Resizer',
      description: 'Resize images while maintaining aspect ratio and quality',
      category: 'editing',
      icon: Maximize2,
      usage: 3456,
      rating: 4.9,
      lastUsed: '3 mins ago',
      processing: false,
      featured: true,
      inputFormats: ['JPG', 'PNG', 'WEBP', 'BMP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'image-cropper',
      name: 'Smart Cropper',
      description: 'Crop images with intelligent content detection and custom ratios',
      category: 'editing',
      icon: Crop,
      usage: 2847,
      rating: 4.8,
      lastUsed: '6 mins ago',
      processing: false,
      featured: true,
      inputFormats: ['JPG', 'PNG', 'WEBP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'format-converter',
      name: 'Format Converter',
      description: 'Convert images between different formats with quality control',
      category: 'conversion',
      icon: RefreshCw,
      usage: 2134,
      rating: 4.7,
      lastUsed: '9 mins ago',
      processing: false,
      featured: true,
      inputFormats: ['JPG', 'PNG', 'WEBP', 'BMP', 'GIF', 'TIFF'],
      outputFormats: ['JPG', 'PNG', 'WEBP', 'BMP', 'GIF']
    },
    {
      id: 'image-compressor',
      name: 'Image Compressor',
      description: 'Reduce file size while preserving visual quality',
      category: 'optimization',
      icon: Target,
      usage: 1876,
      rating: 4.6,
      lastUsed: '12 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['JPG', 'PNG', 'WEBP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'blur-effect',
      name: 'Blur & Sharpen',
      description: 'Apply blur or sharpening effects with customizable intensity',
      category: 'filters',
      icon: Blur,
      usage: 1543,
      rating: 4.5,
      lastUsed: '15 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['JPG', 'PNG', 'WEBP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'brightness-contrast',
      name: 'Brightness & Contrast',
      description: 'Adjust brightness, contrast, and color balance',
      category: 'editing',
      icon: Brightness4,
      usage: 1234,
      rating: 4.4,
      lastUsed: '18 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['JPG', 'PNG', 'WEBP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'artistic-filters',
      name: 'Artistic Filters',
      description: 'Apply artistic effects like oil painting, sketch, and vintage',
      category: 'filters',
      icon: Palette,
      usage: 987,
      rating: 4.3,
      lastUsed: '22 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['JPG', 'PNG', 'WEBP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'batch-processor',
      name: 'Batch Processor',
      description: 'Process multiple images simultaneously with the same settings',
      category: 'conversion',
      icon: Layers,
      usage: 756,
      rating: 4.2,
      lastUsed: '25 mins ago',
      processing: false,
      featured: false,
      inputFormats: ['JPG', 'PNG', 'WEBP', 'BMP'],
      outputFormats: ['JPG', 'PNG', 'WEBP']
    }
  ]

  const processingJobs: ImageProcessingJob[] = [
    {
      id: '1',
      tool: 'Image Resizer',
      status: 'processing',
      progress: 60,
      startTime: '1 min ago',
      inputFile: 'landscape.jpg',
      fileSize: '2.4 MB'
    },
    {
      id: '2',
      tool: 'Format Converter',
      status: 'completed',
      progress: 100,
      startTime: '4 mins ago',
      inputFile: 'portrait.png',
      outputFile: 'portrait.jpg',
      fileSize: '1.8 MB'
    },
    {
      id: '3',
      tool: 'Image Compressor',
      status: 'completed',
      progress: 100,
      startTime: '7 mins ago',
      inputFile: 'banner.png',
      outputFile: 'banner_compressed.png',
      fileSize: '856 KB'
    }
  ]

  // Filter tools based on search and category
  const filteredTools = imageTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const img = new Image()
          img.onload = () => {
            setImagePreview({
              original: e.target!.result as string,
              processed: null,
              width: img.width,
              height: img.height,
              size: formatFileSize(file.size)
            })
          }
          img.src = e.target.result as string
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Process image with selected tool
  const processImage = (toolId: string) => {
    if (!selectedFile) return
    
    setActiveProcessor(toolId)
    // Simulate processing
    setTimeout(() => {
      setImagePreview(prev => ({
        ...prev,
        processed: prev.original // In real implementation, this would be the processed image
      }))
      setActiveProcessor(null)
    }, 3000)
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
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Image className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Image Tools</h1>
                      <p className="text-purple-100 text-lg">Advanced Image Processing & Editing Suite</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{imageMetrics.totalTools}</div>
                        <div className="text-purple-100 text-sm">Image Tools</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{imageMetrics.processedToday}</div>
                        <div className="text-purple-100 text-sm">Processed Today</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{imageMetrics.successRate}%</div>
                        <div className="text-purple-100 text-sm">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image Upload & Preview Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Image Processor</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg: {imageMetrics.avgProcessingTime}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    {imagePreview.original ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={imagePreview.original} 
                          alt="Preview" 
                          className="w-full h-full object-contain rounded-xl"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                          {imagePreview.width} × {imagePreview.height}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-center">
                          <p className="text-gray-600 mb-2">Click to upload an image</p>
                          <p className="text-sm text-gray-400">JPG, PNG, WEBP up to 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {selectedFile && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                          <p className="text-sm text-gray-600">
                            {imagePreview.size} • {imagePreview.width} × {imagePreview.height}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedFile(null)
                            setImagePreview({ original: null, processed: null, width: 0, height: 0, size: '0 KB' })
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Preview Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processed Image</label>
                  <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                    {imagePreview.processed ? (
                      <img 
                        src={imagePreview.processed} 
                        alt="Processed" 
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-center">
                        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Processed image will appear here</p>
                      </div>
                    )}
                  </div>
                  
                  {imagePreview.processed && (
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                    </div>
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
                      placeholder="Search image tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:text-gray-900'
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
                        ? 'bg-purple-500 text-white border-purple-600 shadow-lg' 
                        : 'bg-white/70 backdrop-blur-sm border-white/50 hover:border-purple-300 hover:shadow-lg'
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
                          selectedCategory === category.id ? 'text-purple-100' : 'text-gray-600'
                        }`}>Tools</div>
                      </div>
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${
                      selectedCategory === category.id ? 'text-purple-100' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Image Tools Grid */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Image Processing Tools</h3>
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
                            className="group p-6 bg-white/50 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200">
                                  <IconComponent className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
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
                                <span key={format} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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
                                onClick={() => processImage(tool.id)}
                                disabled={!selectedFile || activeProcessor === tool.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {activeProcessor === tool.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="h-4 w-4" />
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
                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-purple-600" />
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
                                      <span key={format} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {format}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => processImage(tool.id)}
                              disabled={!selectedFile || activeProcessor === tool.id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {activeProcessor === tool.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <Wand2 className="h-4 w-4" />
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
                            <p className="text-xs text-gray-600">{job.inputFile}</p>
                            <p className="text-xs text-gray-500">Started {job.startTime}</p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status === 'completed' && <Download className="h-3 w-3 mr-1" />}
                            {job.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
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
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Size: {job.fileSize}</span>
                          {job.outputFile && (
                            <button className="text-blue-500 hover:text-blue-600">
                              Download
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Image Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-lg font-semibold text-gray-900">{imageMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing</span>
                      <span className="text-lg font-semibold text-gray-900">{imageMetrics.avgProcessingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{imageMetrics.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Popular Format</span>
                      <span className="text-lg font-semibold text-purple-600">{imageMetrics.popularFormat}</span>
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
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Sparkles className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Enhancement</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Intelligent image processing with machine learning algorithms for optimal results.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Learn More
                </button>
              </div>

              <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Layers className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Batch Processing</h3>
                <p className="text-pink-100 text-sm mb-4">
                  Process hundreds of images simultaneously with consistent quality and speed.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Try Batch
                </button>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Optimization</h3>
                <p className="text-red-100 text-sm mb-4">
                  Automatically optimize file sizes while preserving visual quality for web and print.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Optimize Now
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
