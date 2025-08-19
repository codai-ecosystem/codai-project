'use client'

import React, { useState } from 'react'
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Shuffle,
  Repeat,
  Heart,
  Share2,
  Download,
  Plus,
  Mic,
  Waveform,
  Clock,
  Users,
  TrendingUp,
  Library,
  Radio,
  Headphones,
  Sparkles,
  BarChart3,
  Filter,
  Search,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function MuzicAIDashboard() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  const quickStats = [
    { icon: Music, label: 'Generated Tracks', value: '2,847', change: '+12%', color: 'text-pink-600' },
    { icon: Users, label: 'Active Listeners', value: '45.2K', change: '+8%', color: 'text-blue-600' },
    { icon: Clock, label: 'Total Hours', value: '1,234', change: '+15%', color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Engagement Rate', value: '87.3%', change: '+5%', color: 'text-green-600' }
  ]

  const recentTracks = [
    {
      id: 1,
      title: 'Cosmic Dreams',
      artist: 'AI Creator',
      genre: 'Ambient',
      duration: '3:45',
      plays: '12.5K',
      artwork: '🌌'
    },
    {
      id: 2,
      title: 'Electric Pulse',
      artist: 'Neural Net',
      genre: 'Electronic',
      duration: '4:12',
      plays: '8.7K',
      artwork: '⚡'
    },
    {
      id: 3,
      title: 'Ocean Waves',
      artist: 'Deep Mind',
      genre: 'Nature',
      duration: '5:23',
      plays: '15.3K',
      artwork: '🌊'
    },
    {
      id: 4,
      title: 'Urban Beat',
      artist: 'City AI',
      genre: 'Hip Hop',
      duration: '3:28',
      plays: '9.1K',
      artwork: '🏙️'
    }
  ]

  const currentlyPlaying = {
    title: 'Ethereal Journey',
    artist: 'AI Composer',
    album: 'Digital Dreams',
    duration: '4:32',
    progress: 65,
    artwork: '🎵'
  }

  const aiFeatures = [
    {
      title: 'Generate Music',
      description: 'Create original tracks using AI',
      icon: Sparkles,
      action: 'Generate',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      title: 'Voice to Music',
      description: 'Transform voice into melodies',
      icon: Mic,
      action: 'Record',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    },
    {
      title: 'Audio Analysis',
      description: 'Analyze and enhance tracks',
      icon: Waveform,
      action: 'Analyze',
      color: 'bg-gradient-to-r from-green-500 to-blue-500'
    },
    {
      title: 'Smart Playlists',
      description: 'AI-curated music collections',
      icon: Library,
      action: 'Create',
      color: 'bg-gradient-to-r from-pink-500 to-red-500'
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'player', label: 'AI Player', icon: Play },
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'library', label: 'Library', icon: Library }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MuzicAI
                </h1>
                <p className="text-sm text-gray-600">AI Music Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search music, artists, genres..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white w-64"
                />
              </div>
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
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

            {/* AI Features */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Music Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {aiFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className={`${feature.color} rounded-xl p-6 mb-4 group-hover:scale-105 transition-transform`}>
                      <feature.icon className="h-8 w-8 text-white mx-auto" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                    <button className="text-purple-600 font-medium hover:text-purple-700">
                      {feature.action} →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Tracks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tracks</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-purple-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl">
                      {track.artwork}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{track.title}</h3>
                      <p className="text-gray-600 text-sm">{track.artist} • {track.genre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 font-medium">{track.plays} plays</p>
                      <p className="text-sm text-gray-600">{track.duration}</p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-600 hover:text-purple-600 rounded-lg">
                        <Play className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'player' && (
          <div className="space-y-8">
            {/* Main Player */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-purple-100">
              <div className="text-center mb-8">
                <div className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl text-white">
                  {currentlyPlaying.artwork}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentlyPlaying.title}</h2>
                <p className="text-gray-600 mb-1">{currentlyPlaying.artist}</p>
                <p className="text-gray-500 text-sm">{currentlyPlaying.album}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${currentlyPlaying.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>2:58</span>
                  <span>{currentlyPlaying.duration}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-6 mb-8">
                <button className="p-3 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all">
                  <Shuffle className="h-5 w-5" />
                </button>
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
                  <Repeat className="h-5 w-5" />
                </button>
              </div>

              {/* Volume and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-gray-600" />
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Queue */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Up Next</h3>
              <div className="space-y-3">
                {recentTracks.slice(0, 3).map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      {track.artwork}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{track.title}</h4>
                      <p className="text-gray-600 text-sm">{track.artist}</p>
                    </div>
                    <span className="text-gray-600 text-sm">{track.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="space-y-8">
            {/* AI Generation Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-purple-100">
              <div className="text-center mb-8">
                <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Music Generator</h2>
                <p className="text-gray-600">Create original music with artificial intelligence</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>Ambient</option>
                      <option>Electronic</option>
                      <option>Classical</option>
                      <option>Hip Hop</option>
                      <option>Rock</option>
                      <option>Jazz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>Energetic</option>
                      <option>Calm</option>
                      <option>Happy</option>
                      <option>Melancholic</option>
                      <option>Epic</option>
                      <option>Romantic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>30 seconds</option>
                      <option>1 minute</option>
                      <option>2 minutes</option>
                      <option>3 minutes</option>
                      <option>5 minutes</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instruments</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Piano', 'Guitar', 'Drums', 'Synth', 'Violin', 'Bass'].map((instrument) => (
                        <label key={instrument} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="ml-2 text-sm text-gray-700">{instrument}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the music you want to create..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg">
                  Generate Music
                </button>
              </div>
            </div>

            {/* Generation History */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Generations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border border-purple-100 rounded-lg p-4 hover:border-purple-200 transition-colors">
                    <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center text-white text-2xl">
                      🎵
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Generated Track {item}</h4>
                    <p className="text-gray-600 text-sm mb-3">Electronic • Energetic • 2:30</p>
                    <div className="flex items-center space-x-2">
                      <button className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
                        Play
                      </button>
                      <button className="p-2 text-gray-600 hover:text-purple-600 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-8">
            {/* Library Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 text-center">
                <Music className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">2,847</h3>
                <p className="text-gray-600 text-sm">Total Tracks</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 text-center">
                <Library className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">156</h3>
                <p className="text-gray-600 text-sm">Playlists</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">1,234</h3>
                <p className="text-gray-600 text-sm">Liked Songs</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">523h</h3>
                <p className="text-gray-600 text-sm">Listening Time</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Plus className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Create Playlist</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Radio className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Start Radio</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Headphones className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Browse Genres</span>
                </button>
              </div>
            </div>

            {/* Recently Played */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Played</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentTracks.map((track) => (
                  <div key={track.id} className="group cursor-pointer">
                    <div className="w-full aspect-square bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center text-white text-4xl group-hover:scale-105 transition-transform">
                      {track.artwork}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{track.title}</h4>
                    <p className="text-gray-600 text-sm truncate">{track.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MuzicAI
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              AI-powered music creation and streaming platform
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Support</a>
              <a href="#" className="hover:text-purple-600 transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
