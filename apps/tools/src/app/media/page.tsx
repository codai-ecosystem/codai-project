'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, Image, Music, Mic, Camera, Film, Volume2, VolumeX,
  Play, Pause, SkipForward, SkipBack, Maximize, Minimize,
  Download, Upload, Copy, Save, Trash2, Eye, EyeOff, Grid, LayoutList,
  Search, Star, Clock, Settings, RefreshCw, Plus, Edit3, Check, X,
  FileVideo, FileImage, FileAudio, Headphones, MonitorSpeaker,
  Scissors, RotateCw, Crop, Palette, Layers, Sliders, Sparkles,
  ArrowRight, ChevronDown, Filter, Zap, Target, Globe, Hash,
  AlertCircle, CheckCircle, Info, TrendingUp, BarChart3, PieChart
} from 'lucide-react'

// TypeScript Interfaces
interface MediaTool {
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
  supportedFormats: string[]
  outputFormats: string[]
  maxFileSize: string
}

interface MediaMetrics {
  totalTools: number
  activeUsers: string
  processedToday: string
  avgProcessingTime: string
  successRate: number
  popularFormat: string
}

interface MediaProcessingJob {
  id: string
  tool: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  fileSize: string
  fileName: string
  outputSize?: string
  duration?: string
}

interface MediaCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
}

interface MediaPlayer {
  file: File | null
  url: string
  type: 'image' | 'video' | 'audio' | null
  duration: number
  currentTime: number
  volume: number
  playing: boolean
  muted: boolean
  dimensions?: { width: number; height: number }
}

export default function MediaToolsPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeProcessor, setActiveProcessor] = useState<string | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [mediaPlayer, setMediaPlayer] = useState<MediaPlayer>({
    file: null,
    url: '',
    type: null,
    duration: 0,
    currentTime: 0,
    volume: 1,
    playing: false,
    muted: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Mock Data
  const mediaMetrics: MediaMetrics = {
    totalTools: 9,
    activeUsers: '3,247',
    processedToday: '12,589',
    avgProcessingTime: '2.3s',
    successRate: 94.8,
    popularFormat: 'MP4'
  }

  const categories: MediaCategory[] = [
    {
      id: 'video',
      name: 'Video Processing',
      count: 3,
      icon: Video,
      color: 'text-red-600',
      description: 'Video editing and conversion tools'
    },
    {
      id: 'image',
      name: 'Image Editing',
      count: 3,
      icon: Image,
      color: 'text-green-600',
      description: 'Image manipulation and enhancement'
    },
    {
      id: 'audio',
      name: 'Audio Processing',
      count: 2,
      icon: Music,
      color: 'text-blue-600',
      description: 'Audio editing and conversion tools'
    },
    {
      id: 'streaming',
      name: 'Live Streaming',
      count: 1,
      icon: Camera,
      color: 'text-purple-600',
      description: 'Live streaming and broadcast tools'
    }
  ]

  const mediaTools: MediaTool[] = [
    {
      id: 'video-converter',
      name: 'Video Converter',
      description: 'Convert videos between formats with customizable quality settings',
      category: 'video',
      icon: FileVideo,
      usage: 4567,
      rating: 4.9,
      lastUsed: '1 min ago',
      processing: false,
      featured: true,
      supportedFormats: ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV'],
      outputFormats: ['MP4', 'AVI', 'MOV', 'WebM', 'GIF'],
      maxFileSize: '500MB'
    },
    {
      id: 'video-editor',
      name: 'Video Editor',
      description: 'Basic video editing with trim, crop, and filter capabilities',
      category: 'video',
      icon: Scissors,
      usage: 3894,
      rating: 4.7,
      lastUsed: '3 mins ago',
      processing: false,
      featured: true,
      supportedFormats: ['MP4', 'AVI', 'MOV', 'WebM'],
      outputFormats: ['MP4', 'WebM', 'GIF'],
      maxFileSize: '200MB'
    },
    {
      id: 'video-compressor',
      name: 'Video Compressor',
      description: 'Reduce video file size while maintaining quality',
      category: 'video',
      icon: Minimize,
      usage: 2756,
      rating: 4.6,
      lastUsed: '5 mins ago',
      processing: false,
      featured: false,
      supportedFormats: ['MP4', 'AVI', 'MOV', 'WMV'],
      outputFormats: ['MP4', 'WebM'],
      maxFileSize: '1GB'
    },
    {
      id: 'image-resizer',
      name: 'Image Resizer',
      description: 'Resize images with intelligent scaling and aspect ratio preservation',
      category: 'image',
      icon: Maximize,
      usage: 5432,
      rating: 4.8,
      lastUsed: '2 mins ago',
      processing: false,
      featured: true,
      supportedFormats: ['JPG', 'PNG', 'WebP', 'BMP', 'TIFF'],
      outputFormats: ['JPG', 'PNG', 'WebP', 'PDF'],
      maxFileSize: '50MB'
    },
    {
      id: 'image-enhancer',
      name: 'Image Enhancer',
      description: 'AI-powered image enhancement with noise reduction and sharpening',
      category: 'image',
      icon: Sparkles,
      usage: 3267,
      rating: 4.7,
      lastUsed: '4 mins ago',
      processing: false,
      featured: true,
      supportedFormats: ['JPG', 'PNG', 'WebP', 'TIFF'],
      outputFormats: ['JPG', 'PNG', 'WebP'],
      maxFileSize: '25MB'
    },
    {
      id: 'image-effects',
      name: 'Image Effects',
      description: 'Apply filters, effects, and artistic transformations to images',
      category: 'image',
      icon: Palette,
      usage: 2845,
      rating: 4.5,
      lastUsed: '7 mins ago',
      processing: false,
      featured: false,
      supportedFormats: ['JPG', 'PNG', 'WebP', 'BMP'],
      outputFormats: ['JPG', 'PNG', 'WebP'],
      maxFileSize: '30MB'
    },
    {
      id: 'audio-converter',
      name: 'Audio Converter',
      description: 'Convert audio files between different formats and quality levels',
      category: 'audio',
      icon: FileAudio,
      usage: 2134,
      rating: 4.6,
      lastUsed: '6 mins ago',
      processing: false,
      featured: false,
      supportedFormats: ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG'],
      outputFormats: ['MP3', 'WAV', 'AAC', 'OGG'],
      maxFileSize: '100MB'
    },
    {
      id: 'audio-editor',
      name: 'Audio Editor',
      description: 'Edit audio with trim, fade, and noise reduction capabilities',
      category: 'audio',
      icon: Sliders,
      usage: 1876,
      rating: 4.4,
      lastUsed: '9 mins ago',
      processing: false,
      featured: false,
      supportedFormats: ['MP3', 'WAV', 'FLAC', 'AAC'],
      outputFormats: ['MP3', 'WAV', 'AAC'],
      maxFileSize: '50MB'
    },
    {
      id: 'stream-recorder',
      name: 'Stream Recorder',
      description: 'Record live streams and webcam footage with customizable settings',
      category: 'streaming',
      icon: Film,
      usage: 1543,
      rating: 4.3,
      lastUsed: '12 mins ago',
      processing: false,
      featured: false,
      supportedFormats: ['WebRTC', 'RTMP', 'HLS'],
      outputFormats: ['MP4', 'WebM', 'FLV'],
      maxFileSize: 'Unlimited'
    }
  ]

  const processingJobs: MediaProcessingJob[] = [
    {
      id: '1',
      tool: 'Video Converter',
      status: 'processing',
      progress: 78,
      startTime: '3 mins ago',
      fileSize: '125.4 MB',
      fileName: 'presentation.mp4',
      duration: '00:12:34'
    },
    {
      id: '2',
      tool: 'Image Enhancer',
      status: 'completed',
      progress: 100,
      startTime: '8 mins ago',
      fileSize: '15.2 MB',
      fileName: 'photo_batch.zip',
      outputSize: '18.7 MB'
    },
    {
      id: '3',
      tool: 'Audio Converter',
      status: 'completed',
      progress: 100,
      startTime: '15 mins ago',
      fileSize: '45.8 MB',
      fileName: 'podcast_episode.wav',
      outputSize: '12.3 MB',
      duration: '00:32:15'
    }
  ]

  // Filter tools based on search and category
  const filteredTools = mediaTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle file upload and preview
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      let type: 'image' | 'video' | 'audio' | null = null
      
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'
      else if (file.type.startsWith('audio/')) type = 'audio'
      
      setMediaPlayer({
        file,
        url,
        type,
        duration: 0,
        currentTime: 0,
        volume: 1,
        playing: false,
        muted: false
      })
      setShowPlayer(true)
    }
  }

  // Media player controls
  const togglePlay = () => {
    if (mediaPlayer.type === 'video' && videoRef.current) {
      if (mediaPlayer.playing) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    } else if (mediaPlayer.type === 'audio' && audioRef.current) {
      if (mediaPlayer.playing) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
    setMediaPlayer(prev => ({ ...prev, playing: !prev.playing }))
  }

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !mediaPlayer.muted
    if (audioRef.current) audioRef.current.muted = !mediaPlayer.muted
    setMediaPlayer(prev => ({ ...prev, muted: !prev.muted }))
  }

  const updateVolume = (volume: number) => {
    if (videoRef.current) videoRef.current.volume = volume
    if (audioRef.current) audioRef.current.volume = volume
    setMediaPlayer(prev => ({ ...prev, volume }))
  }

  // Process media with selected tool
  const processMedia = (toolId: string) => {
    if (!mediaPlayer.file) return
    setActiveProcessor(toolId)
    // Simulate processing
    setTimeout(() => {
      setActiveProcessor(null)
    }, 4000)
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
                      <Video className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Media Tools</h1>
                      <p className="text-purple-100 text-lg">Professional Media Processing & Enhancement Suite</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{mediaMetrics.totalTools}</div>
                        <div className="text-purple-100 text-sm">Media Tools</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{mediaMetrics.processedToday}</div>
                        <div className="text-purple-100 text-sm">Processed Today</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{mediaMetrics.successRate}%</div>
                        <div className="text-purple-100 text-sm">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Media Player Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Media Player & Processor</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Media
                  </button>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg: {mediaMetrics.avgProcessingTime}</span>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {showPlayer && mediaPlayer.file ? (
                <div className="space-y-4">
                  {/* Media Preview */}
                  <div className="bg-black rounded-xl overflow-hidden relative">
                    {mediaPlayer.type === 'image' && (
                      <img
                        src={mediaPlayer.url}
                        alt="Preview"
                        className="w-full max-h-96 object-contain"
                      />
                    )}
                    {mediaPlayer.type === 'video' && (
                      <video
                        ref={videoRef}
                        src={mediaPlayer.url}
                        className="w-full max-h-96"
                        onLoadedMetadata={(e) => {
                          const target = e.target as HTMLVideoElement
                          setMediaPlayer(prev => ({ 
                            ...prev, 
                            duration: target.duration,
                            dimensions: { width: target.videoWidth, height: target.videoHeight }
                          }))
                        }}
                        onTimeUpdate={(e) => {
                          const target = e.target as HTMLVideoElement
                          setMediaPlayer(prev => ({ ...prev, currentTime: target.currentTime }))
                        }}
                      />
                    )}
                    {mediaPlayer.type === 'audio' && (
                      <div className="flex items-center justify-center h-48 bg-gradient-to-r from-purple-900 to-pink-900">
                        <div className="text-center text-white">
                          <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h4 className="text-lg font-semibold">{mediaPlayer.file.name}</h4>
                          <p className="text-purple-200">Audio File</p>
                        </div>
                        <audio
                          ref={audioRef}
                          src={mediaPlayer.url}
                          onLoadedMetadata={(e) => {
                            const target = e.target as HTMLAudioElement
                            setMediaPlayer(prev => ({ ...prev, duration: target.duration }))
                          }}
                          onTimeUpdate={(e) => {
                            const target = e.target as HTMLAudioElement
                            setMediaPlayer(prev => ({ ...prev, currentTime: target.currentTime }))
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Media Controls */}
                  {(mediaPlayer.type === 'video' || mediaPlayer.type === 'audio') && (
                    <div className="bg-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={togglePlay}
                            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                          >
                            {mediaPlayer.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={toggleMute}
                            className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                          >
                            {mediaPlayer.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={mediaPlayer.volume}
                            onChange={(e) => updateVolume(parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.floor(mediaPlayer.currentTime)}s / {Math.floor(mediaPlayer.duration)}s
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${(mediaPlayer.currentTime / mediaPlayer.duration) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* File Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">File Name:</span>
                        <p className="font-medium truncate">{mediaPlayer.file.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">File Size:</span>
                        <p className="font-medium">{formatFileSize(mediaPlayer.file.size)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium">{mediaPlayer.file.type}</p>
                      </div>
                      {mediaPlayer.dimensions && (
                        <div>
                          <span className="text-gray-600">Dimensions:</span>
                          <p className="font-medium">{mediaPlayer.dimensions.width}x{mediaPlayer.dimensions.height}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Media File</h4>
                  <p className="text-gray-600 mb-4">Drag and drop or click to select images, videos, or audio files</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Choose File
                  </button>
                </div>
              )}
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
                      placeholder="Search media tools..."
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
              
              {/* Media Tools Grid */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Media Processing Tools</h3>
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
                              {tool.supportedFormats.slice(0, 3).map(format => (
                                <span key={format} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {format}
                                </span>
                              ))}
                              {tool.supportedFormats.length > 3 && (
                                <span className="text-xs text-gray-500">+{tool.supportedFormats.length - 3}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                <div>Max: {tool.maxFileSize}</div>
                                <div>Last used: {tool.lastUsed}</div>
                              </div>
                              <button
                                onClick={() => processMedia(tool.id)}
                                disabled={!mediaPlayer.file || activeProcessor === tool.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                                  <span className="text-xs text-gray-600">Max: {tool.maxFileSize}</span>
                                  <div className="flex gap-1">
                                    {tool.supportedFormats.slice(0, 2).map(format => (
                                      <span key={format} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                        {format}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => processMedia(tool.id)}
                              disabled={!mediaPlayer.file || activeProcessor === tool.id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <p className="text-xs text-gray-600 truncate">{job.fileName}</p>
                            <p className="text-xs text-gray-500">Started {job.startTime}</p>
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
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Size: {job.fileSize}</span>
                          {job.outputSize && (
                            <button className="text-purple-600 hover:text-purple-700">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Media Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-lg font-semibold text-gray-900">{mediaMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing</span>
                      <span className="text-lg font-semibold text-gray-900">{mediaMetrics.avgProcessingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{mediaMetrics.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Popular Format</span>
                      <span className="text-lg font-semibold text-purple-600">{mediaMetrics.popularFormat}</span>
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
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Film className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Enhancement</h3>
                <p className="text-red-100 text-sm mb-4">
                  Intelligent media processing with automatic quality enhancement and optimization.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Enhance Media
                </button>
              </div>

              <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Camera className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Streaming</h3>
                <p className="text-pink-100 text-sm mb-4">
                  Professional live streaming tools with real-time processing and broadcast features.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Start Streaming
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Sparkles className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Batch Processing</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Process multiple files simultaneously with queue management and progress tracking.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Process Batch
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
