'use client'

import React, { useState } from 'react'
import {
  Music,
  Play,
  Pause,
  Plus,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Clock,
  Users,
  Shuffle,
  Edit,
  Trash2,
  Copy,
  Eye,
  Star,
  Calendar,
  TrendingUp,
  Volume2,
  Mic,
  Sparkles,
  Library,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function PlaylistsPage() {
  const [viewMode, setViewMode] = useState('grid')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')

  const playlistStats = [
    { icon: Library, label: 'Total Playlists', value: '156', change: '+12', color: 'text-purple-600' },
    { icon: Music, label: 'Total Tracks', value: '2,847', change: '+45', color: 'text-blue-600' },
    { icon: Users, label: 'Shared Playlists', value: '89', change: '+8', color: 'text-green-600' },
    { icon: Heart, label: 'Liked Playlists', value: '234', change: '+15', color: 'text-red-600' }
  ]

  const playlists = [
    {
      id: 1,
      title: 'Chill Vibes',
      description: 'Perfect for relaxing evenings',
      tracks: 45,
      duration: '2h 34m',
      plays: '1.2K',
      likes: 89,
      isPublic: true,
      isLiked: true,
      lastPlayed: '2 hours ago',
      createdBy: 'You',
      genre: 'Ambient',
      mood: 'Relaxing',
      artwork: '🌙',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 2,
      title: 'Workout Pump',
      description: 'High energy tracks for your gym sessions',
      tracks: 32,
      duration: '1h 58m',
      plays: '856',
      likes: 67,
      isPublic: true,
      isLiked: false,
      lastPlayed: '1 day ago',
      createdBy: 'You',
      genre: 'Electronic',
      mood: 'Energetic',
      artwork: '💪',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Focus Deep',
      description: 'Instrumental tracks for deep work',
      tracks: 28,
      duration: '1h 45m',
      plays: '2.1K',
      likes: 156,
      isPublic: false,
      isLiked: true,
      lastPlayed: '3 hours ago',
      createdBy: 'You',
      genre: 'Classical',
      mood: 'Focused',
      artwork: '🧠',
      color: 'from-blue-500 to-teal-500'
    },
    {
      id: 4,
      title: 'Road Trip Mix',
      description: 'Feel-good songs for long drives',
      tracks: 56,
      duration: '3h 22m',
      plays: '945',
      likes: 123,
      isPublic: true,
      isLiked: true,
      lastPlayed: '5 days ago',
      createdBy: 'AI Creator',
      genre: 'Pop Rock',
      mood: 'Happy',
      artwork: '🚗',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Late Night Jazz',
      description: 'Smooth jazz for late evening sessions',
      tracks: 23,
      duration: '1h 32m',
      plays: '678',
      likes: 89,
      isPublic: false,
      isLiked: false,
      lastPlayed: '1 week ago',
      createdBy: 'You',
      genre: 'Jazz',
      mood: 'Smooth',
      artwork: '🎷',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 6,
      title: 'AI Generated Favorites',
      description: 'Best AI-created tracks collection',
      tracks: 67,
      duration: '4h 12m',
      plays: '3.4K',
      likes: 287,
      isPublic: true,
      isLiked: true,
      lastPlayed: '6 hours ago',
      createdBy: 'MuzicAI',
      genre: 'Mixed',
      mood: 'Various',
      artwork: '🤖',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const quickActions = [
    {
      title: 'Create New Playlist',
      description: 'Start with a blank playlist',
      icon: Plus,
      action: 'create',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      title: 'AI Smart Playlist',
      description: 'Let AI curate for you',
      icon: Sparkles,
      action: 'ai-create',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    },
    {
      title: 'Import Playlist',
      description: 'From Spotify, Apple Music, etc.',
      icon: Download,
      action: 'import',
      color: 'bg-gradient-to-r from-green-500 to-blue-500'
    },
    {
      title: 'Collaborative Playlist',
      description: 'Create with friends',
      icon: Users,
      action: 'collaborate',
      color: 'bg-gradient-to-r from-pink-500 to-red-500'
    }
  ]

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'public' && playlist.isPublic) ||
      (filterStatus === 'private' && !playlist.isPublic) ||
      (filterStatus === 'liked' && playlist.isLiked)
    return matchesSearch && matchesFilter
  })

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.title.localeCompare(b.title)
      case 'tracks': return b.tracks - a.tracks
      case 'duration': return b.duration.localeCompare(a.duration)
      case 'plays': return parseInt(b.plays.replace('K', '000').replace('.', '')) - parseInt(a.plays.replace('K', '000').replace('.', ''))
      case 'recent': return new Date(b.lastPlayed) - new Date(a.lastPlayed)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Library className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Playlists
                </h1>
                <p className="text-sm text-gray-600">Manage your music collections</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white w-64"
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {playlistStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-600 text-sm font-medium">+{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group cursor-pointer"
              >
                <div className={`${action.color} rounded-xl p-6 mb-4 group-hover:scale-105 transition-transform`}>
                  <action.icon className="h-8 w-8 text-white mx-auto" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Playlists</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="liked">Liked</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <SortAsc className="h-4 w-4 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recent">Recently Played</option>
                  <option value="name">Name</option>
                  <option value="tracks">Track Count</option>
                  <option value="duration">Duration</option>
                  <option value="plays">Most Played</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Playlists Grid/List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Playlists ({sortedPlaylists.length})
            </h2>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform">
              <Plus className="h-4 w-4 inline mr-2" />
              New Playlist
            </button>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br bg-white border border-purple-100 hover:border-purple-200 transition-all hover:shadow-lg">
                    {/* Playlist Cover */}
                    <div className={`h-48 bg-gradient-to-br ${playlist.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/90">
                        {playlist.artwork}
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {playlist.isLiked && (
                          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-white fill-current" />
                          </div>
                        )}
                        {!playlist.isPublic && (
                          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                          <Play className="h-8 w-8" />
                        </button>
                      </div>
                    </div>

                    {/* Playlist Info */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{playlist.title}</h3>
                          <p className="text-gray-600 text-sm">{playlist.description}</p>
                        </div>
                        <div className="ml-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>{playlist.tracks} tracks</span>
                        <span>{playlist.duration}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Play className="h-3 w-3 mr-1" />
                            {playlist.plays}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {playlist.likes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1.5 text-gray-600 hover:text-purple-600 rounded transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>By {playlist.createdBy}</span>
                          <span>{playlist.lastPlayed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${playlist.color} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                    {playlist.artwork}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{playlist.title}</h3>
                      {playlist.isLiked && <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />}
                      {!playlist.isPublic && <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                    <p className="text-gray-600 text-sm truncate">{playlist.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{playlist.tracks} tracks</span>
                      <span>{playlist.duration}</span>
                      <span>By {playlist.createdBy}</span>
                      <span>{playlist.lastPlayed}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Play className="h-3 w-3 mr-1" />
                      {playlist.plays}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {playlist.likes}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-600 hover:text-purple-600 rounded-lg">
                      <Play className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 rounded-lg">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-700 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Library className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MuzicAI Playlists
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Create, organize, and share your music collections
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors">Playlist Help</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Sharing Guide</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Import Tools</a>
              <a href="#" className="hover:text-purple-600 transition-colors">AI Curation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
