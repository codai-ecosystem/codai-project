'use client'

import React, { useState } from 'react'
import {
  Music,
  Play,
  Pause,
  Heart,
  Share2,
  Download,
  Plus,
  TrendingUp,
  Star,
  Clock,
  Users,
  Mic,
  Radio,
  Headphones,
  Globe,
  Compass,
  Filter,
  Search,
  Shuffle,
  SkipForward,
  Volume2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Zap,
  Sparkles,
  Calendar,
  Award,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function DiscoverPage() {
  const [activeGenre, setActiveGenre] = useState('all')
  const [activeMood, setActiveMood] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTrack, setSelectedTrack] = useState(null)

  const discoverStats = [
    { icon: Globe, label: 'New Releases', value: '847', change: '+23', color: 'text-blue-600' },
    { icon: TrendingUp, label: 'Trending Tracks', value: '156', change: '+12', color: 'text-green-600' },
    { icon: Star, label: 'Featured Artists', value: '89', change: '+5', color: 'text-purple-600' },
    { icon: Radio, label: 'Radio Stations', value: '234', change: '+8', color: 'text-pink-600' }
  ]

  const genres = [
    { id: 'all', name: 'All Genres', count: 2847, color: 'from-purple-500 to-pink-500' },
    { id: 'electronic', name: 'Electronic', count: 567, color: 'from-blue-500 to-purple-500' },
    { id: 'ambient', name: 'Ambient', count: 423, color: 'from-green-500 to-blue-500' },
    { id: 'classical', name: 'Classical', count: 345, color: 'from-indigo-500 to-purple-500' },
    { id: 'jazz', name: 'Jazz', count: 289, color: 'from-yellow-500 to-orange-500' },
    { id: 'rock', name: 'Rock', count: 456, color: 'from-red-500 to-pink-500' },
    { id: 'hip-hop', name: 'Hip Hop', count: 234, color: 'from-orange-500 to-red-500' },
    { id: 'pop', name: 'Pop', count: 533, color: 'from-pink-500 to-purple-500' }
  ]

  const moods = [
    { id: 'all', name: 'All Moods', emoji: '🎵' },
    { id: 'energetic', name: 'Energetic', emoji: '⚡' },
    { id: 'calm', name: 'Calm', emoji: '🌙' },
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'focus', name: 'Focus', emoji: '🧠' },
    { id: 'romantic', name: 'Romantic', emoji: '💕' },
    { id: 'melancholic', name: 'Melancholic', emoji: '🌧️' },
    { id: 'epic', name: 'Epic', emoji: '🎬' }
  ]

  const featuredTracks = [
    {
      id: 1,
      title: 'Digital Horizons',
      artist: 'AI Composer X',
      genre: 'Electronic',
      mood: 'Energetic',
      duration: '4:23',
      plays: '2.4K',
      likes: 189,
      isNew: true,
      isTrending: true,
      quality: 'Premium',
      artwork: '🌅',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      title: 'Ethereal Dreams',
      artist: 'Neural Soundscape',
      genre: 'Ambient',
      mood: 'Calm',
      duration: '6:15',
      plays: '1.8K',
      likes: 234,
      isNew: false,
      isTrending: true,
      quality: 'High',
      artwork: '☁️',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 3,
      title: 'Quantum Beats',
      artist: 'Future Bass AI',
      genre: 'Electronic',
      mood: 'Energetic',
      duration: '3:47',
      plays: '3.1K',
      likes: 456,
      isNew: true,
      isTrending: true,
      quality: 'Premium',
      artwork: '⚛️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      title: 'Midnight Symphony',
      artist: 'Classical AI',
      genre: 'Classical',
      mood: 'Romantic',
      duration: '8:32',
      plays: '1.2K',
      likes: 167,
      isNew: false,
      isTrending: false,
      quality: 'High',
      artwork: '🌙',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 5,
      title: 'Urban Flow',
      artist: 'Street Beats AI',
      genre: 'Hip Hop',
      mood: 'Energetic',
      duration: '3:28',
      plays: '2.7K',
      likes: 345,
      isNew: true,
      isTrending: true,
      quality: 'Premium',
      artwork: '🏙️',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 6,
      title: 'Ocean Waves',
      artist: 'Nature AI',
      genre: 'Ambient',
      mood: 'Calm',
      duration: '12:00',
      plays: '4.5K',
      likes: 678,
      isNew: false,
      isTrending: true,
      quality: 'Premium',
      artwork: '🌊',
      color: 'from-blue-500 to-teal-500'
    }
  ]

  const radioStations = [
    {
      id: 1,
      name: 'AI Hits Radio',
      description: 'Latest AI-generated chart toppers',
      listeners: '12.4K',
      genre: 'Mixed',
      artwork: '📻',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 2,
      name: 'Chill AI Lounge',
      description: 'Relaxing ambient AI music',
      listeners: '8.7K',
      genre: 'Ambient',
      artwork: '🛋️',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 3,
      name: 'Electronic Pulse',
      description: 'High-energy electronic beats',
      listeners: '15.2K',
      genre: 'Electronic',
      artwork: '⚡',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 4,
      name: 'Focus Flow',
      description: 'AI music for deep concentration',
      listeners: '6.9K',
      genre: 'Instrumental',
      artwork: '🧠',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  const trendingArtists = [
    {
      id: 1,
      name: 'AI Composer X',
      followers: '45.2K',
      tracks: 234,
      genre: 'Electronic',
      verified: true,
      avatar: '🤖',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      name: 'Neural Soundscape',
      followers: '32.8K',
      tracks: 189,
      genre: 'Ambient',
      verified: true,
      avatar: '🧠',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 3,
      name: 'Future Bass AI',
      followers: '67.1K',
      tracks: 156,
      genre: 'Electronic',
      verified: true,
      avatar: '🎵',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      name: 'Classical AI',
      followers: '28.9K',
      tracks: 87,
      genre: 'Classical',
      verified: true,
      avatar: '🎼',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Discover
                </h1>
                <p className="text-sm text-gray-600">Explore new AI-generated music</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search artists, tracks, genres..."
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
        {/* Discovery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {discoverStats.map((stat, index) => (
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

        {/* Genre Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`relative overflow-hidden rounded-xl p-4 text-center transition-all ${activeGenre === genre.id
                    ? 'ring-2 ring-purple-500 scale-105'
                    : 'hover:scale-105'
                  }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80`}></div>
                <div className="relative z-10 text-white">
                  <h3 className="font-semibold text-sm mb-1">{genre.name}</h3>
                  <p className="text-xs opacity-90">{genre.count} tracks</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Mood</h2>
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${activeMood === mood.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="font-medium text-sm">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Tracks */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Featured Tracks</h2>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl bg-white border border-purple-100 hover:border-purple-200 transition-all hover:shadow-lg">
                  {/* Track Cover */}
                  <div className={`h-40 bg-gradient-to-br ${track.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/90">
                      {track.artwork}
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {track.isNew && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          NEW
                        </span>
                      )}
                      {track.isTrending && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          🔥 TRENDING
                        </span>
                      )}
                      <span className="bg-black/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {track.quality}
                      </span>
                    </div>
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                        <Play className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{track.title}</h3>
                        <p className="text-gray-600 text-sm">{track.artist}</p>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{track.genre}</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{track.mood}</span>
                      <span>{track.duration}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          {track.plays}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {track.likes}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-1.5 text-gray-600 hover:text-blue-600 rounded transition-colors">
                          <Share2 className="h-3 w-3" />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors">
                          <Download className="h-3 w-3" />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:text-purple-600 rounded transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Radio Stations & Trending Artists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radio Stations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Radio Stations</h2>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {radioStations.map((station, index) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-purple-50 transition-colors group cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${station.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                    {station.artwork}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{station.name}</h3>
                    <p className="text-gray-600 text-sm">{station.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {station.listeners} listening
                      </span>
                      <span>{station.genre}</span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trending Artists */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Trending AI Artists</h2>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {trendingArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-purple-50 transition-colors group cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${artist.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                    {artist.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                      {artist.verified && (
                        <Award className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{artist.genre}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span>{artist.followers} followers</span>
                      <span>{artist.tracks} tracks</span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
                      Follow
                    </button>
                  </div>
                </motion.div>
              ))}
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
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MuzicAI Discover
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Explore the future of AI-generated music
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors">New Releases</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Trending</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Radio Stations</a>
              <a href="#" className="hover:text-purple-600 transition-colors">AI Artists</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
