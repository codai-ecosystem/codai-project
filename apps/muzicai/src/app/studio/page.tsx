'use client'

import React, { useState } from 'react'
import { 
  Music, 
  Play, 
  Pause, 
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Mic,
  Headphones,
  Waveform,
  Settings,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  Zap,
  Sparkles,
  Clock,
  Layers,
  Sliders,
  Equalizer,
  Filter,
  Search,
  Folder,
  File,
  Edit,
  Share2,
  Eye,
  EyeOff,
  VolumeX,
  Volume1,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Target,
  Gauge
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function StudioPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentProject, setCurrentProject] = useState('Untitled Project')
  const [activeTrack, setActiveTrack] = useState(1)
  const [masterVolume, setMasterVolume] = useState(75)
  const [selectedTool, setSelectedTool] = useState('select')

  const studioStats = [
    { icon: File, label: 'Active Projects', value: '12', change: '+3', color: 'text-purple-600' },
    { icon: Clock, label: 'Studio Time', value: '47h', change: '+8h', color: 'text-blue-600' },
    { icon: Waveform, label: 'Tracks Created', value: '156', change: '+23', color: 'text-green-600' },
    { icon: Download, label: 'Exports', value: '89', change: '+12', color: 'text-pink-600' }
  ]

  const tracks = [
    {
      id: 1,
      name: 'Main Melody',
      instrument: 'AI Synth',
      volume: 85,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      color: 'bg-purple-500',
      waveform: [30, 45, 60, 40, 70, 55, 35, 80, 25, 65, 45, 75, 50, 85, 40, 60]
    },
    {
      id: 2,
      name: 'Bass Line',
      instrument: 'AI Bass',
      volume: 70,
      pan: -20,
      muted: false,
      solo: false,
      recording: false,
      color: 'bg-blue-500',
      waveform: [80, 75, 85, 70, 90, 65, 80, 75, 85, 70, 80, 75, 85, 70, 80, 75]
    },
    {
      id: 3,
      name: 'Drums',
      instrument: 'AI Drums',
      volume: 90,
      pan: 0,
      muted: false,
      solo: false,
      recording: true,
      color: 'bg-red-500',
      waveform: [95, 20, 90, 25, 95, 20, 90, 25, 95, 20, 90, 25, 95, 20, 90, 25]
    },
    {
      id: 4,
      name: 'Ambient Pad',
      instrument: 'AI Strings',
      volume: 60,
      pan: 15,
      muted: true,
      solo: false,
      recording: false,
      color: 'bg-green-500',
      waveform: [40, 50, 45, 55, 40, 50, 45, 55, 40, 50, 45, 55, 40, 50, 45, 55]
    }
  ]

  const aiTools = [
    {
      id: 'generate',
      name: 'AI Generate',
      description: 'Create new musical elements',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'enhance',
      name: 'AI Enhance',
      description: 'Improve existing tracks',
      icon: Zap,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'master',
      name: 'AI Master',
      description: 'Professional mastering',
      icon: Target,
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'mix',
      name: 'AI Mix',
      description: 'Intelligent mixing',
      icon: Sliders,
      color: 'from-pink-500 to-red-500'
    }
  ]

  const recentProjects = [
    {
      id: 1,
      name: 'Ethereal Journey',
      lastModified: '2 hours ago',
      duration: '4:32',
      tracks: 8,
      status: 'In Progress',
      artwork: '🌌'
    },
    {
      id: 2,
      name: 'Urban Vibes',
      lastModified: '1 day ago',
      duration: '3:45',
      tracks: 6,
      status: 'Complete',
      artwork: '🏙️'
    },
    {
      id: 3,
      name: 'Ocean Dreams',
      lastModified: '3 days ago',
      duration: '6:15',
      tracks: 12,
      status: 'Mixing',
      artwork: '🌊'
    }
  ]

  const instruments = [
    { name: 'AI Piano', category: 'Keys', icon: '🎹' },
    { name: 'AI Guitar', category: 'Strings', icon: '🎸' },
    { name: 'AI Drums', category: 'Percussion', icon: '🥁' },
    { name: 'AI Synth', category: 'Electronic', icon: '🎛️' },
    { name: 'AI Violin', category: 'Orchestral', icon: '🎻' },
    { name: 'AI Bass', category: 'Low End', icon: '🎸' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Waveform className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Studio
                </h1>
                <p className="text-sm text-gray-600">Create AI-powered music</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Project:</span>
                <input
                  type="text"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  className="bg-gray-100 border-0 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Studio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {studioStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Studio Interface */}
          <div className="xl:col-span-3 space-y-6">
            {/* Transport Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Transport</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>00:02:34</span>
                  <span className="mx-2">|</span>
                  <span>120 BPM</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-6 mb-6">
                <button className="p-3 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all">
                  <SkipBack className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transition-transform shadow-lg"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </button>
                <button className="p-3 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all">
                  <SkipForward className="h-6 w-6" />
                </button>
                <button className="p-3 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all">
                  <Square className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Mic className="h-6 w-6" />
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-gray-600">0:00</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full w-1/3"></div>
                    <div className="absolute top-0 left-1/3 w-1 h-2 bg-white border border-purple-600 rounded-full transform -translate-x-1/2"></div>
                  </div>
                  <span className="text-xs text-gray-600">4:32</span>
                </div>
              </div>
            </div>

            {/* Track Mixer */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tracks</h2>
                <div className="flex items-center space-x-2">
                  <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Track
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`border rounded-lg p-4 transition-all ${
                      activeTrack === track.id 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Track Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded ${track.color}`}></div>
                          <span className="font-medium text-gray-900">{track.name}</span>
                          <span className="text-sm text-gray-600">{track.instrument}</span>
                          {track.recording && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs">REC</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Waveform */}
                        <div className="flex items-end space-x-1 h-8">
                          {track.waveform.map((height, index) => (
                            <div
                              key={index}
                              className={`${track.color} rounded-sm transition-all hover:opacity-80`}
                              style={{ height: `${height}%`, width: '4px' }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Track Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveTrack(track.id)}
                          className={`p-2 rounded transition-colors ${
                            track.muted 
                              ? 'text-red-600 bg-red-50' 
                              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {track.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                        <button
                          className={`p-2 rounded transition-colors ${
                            track.solo 
                              ? 'text-yellow-600 bg-yellow-50' 
                              : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                        >
                          <Headphones className="h-4 w-4" />
                        </button>
                        <div className="w-16">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={track.volume}
                            className="w-full"
                          />
                          <div className="text-xs text-center text-gray-600">{track.volume}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tools */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Studio Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiTools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className={`bg-gradient-to-r ${tool.color} rounded-xl p-6 mb-3 group-hover:shadow-lg transition-all`}>
                      <tool.icon className="h-8 w-8 text-white mx-auto" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                    <p className="text-gray-600 text-sm">{tool.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Projects */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Projects</h3>
                <button className="text-purple-600 hover:text-purple-700 text-sm">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div key={project.id} className="p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg">
                        {project.artwork}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.lastModified}</div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{project.duration}</span>
                          <span>•</span>
                          <span>{project.tracks} tracks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruments */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4">AI Instruments</h3>
              <div className="space-y-2">
                {instruments.map((instrument, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <span className="text-lg">{instrument.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{instrument.name}</div>
                      <div className="text-xs text-gray-600">{instrument.category}</div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4">Master</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Volume</span>
                    <span className="text-sm font-medium">{masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-purple-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                    <Save className="h-4 w-4 inline mr-1" />
                    Save
                  </button>
                  <button className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4 inline mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Waveform className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MuzicAI Studio
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Professional AI music production suite
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors">Tutorials</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Templates</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Support</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Community</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
