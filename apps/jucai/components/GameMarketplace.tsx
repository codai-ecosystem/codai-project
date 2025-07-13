import React from 'react'
import { motion } from 'framer-motion'
import { Star, Download, Users, Gamepad2, Trophy, Zap } from 'lucide-react'

interface Game {
  id: string
  title: string
  description: string
  rating: number
  downloads: string
  players: string
  category: string
  price: string
  image: string
  tags: string[]
  developer: string
}

interface GameMarketplaceProps {
  games?: Game[]
}

const defaultGames: Game[] = [
  {
    id: '1',
    title: 'AI Strategy Commander',
    description: 'AI-powered real-time strategy game with intelligent opponents and dynamic campaigns.',
    rating: 4.8,
    downloads: '2.3M',
    players: '450K',
    category: 'Strategy',
    price: '$29.99',
    image: '/api/placeholder/300/200',
    tags: ['AI', 'Strategy', 'Multiplayer'],
    developer: 'Neural Games Studios'
  },
  {
    id: '2',
    title: 'Quantum Quest',
    description: 'Puzzle adventure game featuring quantum mechanics and AI-generated levels.',
    rating: 4.6,
    downloads: '1.8M',
    players: '320K',
    category: 'Puzzle',
    price: '$19.99',
    image: '/api/placeholder/300/200',
    tags: ['Puzzle', 'Adventure', 'AI-Generated'],
    developer: 'Quantum Interactive'
  },
  {
    id: '3',
    title: 'Neural Racing',
    description: 'High-speed racing with AI-driven physics and adaptive difficulty.',
    rating: 4.9,
    downloads: '3.1M',
    players: '680K',
    category: 'Racing',
    price: '$24.99',
    image: '/api/placeholder/300/200',
    tags: ['Racing', 'AI Physics', 'Competitive'],
    developer: 'Velocity AI Labs'
  },
  {
    id: '4',
    title: 'AI Dungeon Master',
    description: 'Procedurally generated RPG with AI dungeon master and dynamic storytelling.',
    rating: 4.7,
    downloads: '1.5M',
    players: '280K',
    category: 'RPG',
    price: '$34.99',
    image: '/api/placeholder/300/200',
    tags: ['RPG', 'Procedural', 'AI Storytelling'],
    developer: 'Mythic AI Games'
  },
  {
    id: '5',
    title: 'Smart City Builder',
    description: 'City simulation with AI citizens and intelligent urban planning algorithms.',
    rating: 4.5,
    downloads: '1.2M',
    players: '200K',
    category: 'Simulation',
    price: '$22.99',
    image: '/api/placeholder/300/200',
    tags: ['Simulation', 'AI Citizens', 'Strategy'],
    developer: 'Urban AI Studios'
  },
  {
    id: '6',
    title: 'Cyber Combat Arena',
    description: 'Futuristic FPS with AI-powered combat analysis and training.',
    rating: 4.8,
    downloads: '2.7M',
    players: '520K',
    category: 'Action',
    price: '$39.99',
    image: '/api/placeholder/300/200',
    tags: ['FPS', 'AI Training', 'Competitive'],
    developer: 'CyberForge Entertainment'
  }
]

export default function GameMarketplace({ games = defaultGames }: GameMarketplaceProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Strategy': 'from-blue-500 to-purple-500',
      'Puzzle': 'from-green-500 to-teal-500',
      'Racing': 'from-red-500 to-orange-500',
      'RPG': 'from-purple-500 to-pink-500',
      'Simulation': 'from-yellow-500 to-orange-500',
      'Action': 'from-red-500 to-pink-500'
    }
    return colors[category] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="space-y-8">
      {/* Marketplace Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
          AI Gaming Marketplace
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Discover next-generation games powered by artificial intelligence
        </p>
      </motion.div>

      {/* Featured Game */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative gaming-border rounded-2xl overflow-hidden"
      >
        <div className="gaming-border-inner">
          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="w-full lg:w-1/2">
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-24 h-24 text-white opacity-50" />
                </div>
                <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  FEATURED
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold text-white">{games[0].title}</h3>
              <p className="text-gray-300 text-lg">{games[0].description}</p>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{games[0].rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">{games[0].downloads}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">{games[0].players}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {games[0].tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-green-400">{games[0].price}</span>
                <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all font-semibold text-lg gaming-pulse">
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.slice(1).map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="group game-card glass-card rounded-2xl overflow-hidden"
          >
            {/* Game Image */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <Gamepad2 className="w-16 h-16 text-white opacity-30" />
              </div>
              <div className={`absolute top-3 left-3 bg-gradient-to-r ${getCategoryColor(game.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                {game.category}
              </div>
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-sm font-semibold">
                {game.price}
              </div>
            </div>

            {/* Game Info */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">by {game.developer}</p>
              </div>

              <p className="text-gray-300 text-sm line-clamp-2">
                {game.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-semibold">{game.rating}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{game.downloads}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{game.players}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {game.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-white/10 text-white px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full glass-button text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all">
                Install Game
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
      >
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">500+</h3>
          <p className="text-gray-300">AI-Powered Games</p>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">2.5M+</h3>
          <p className="text-gray-300">Active Players</p>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">99.9%</h3>
          <p className="text-gray-300">AI Accuracy</p>
        </div>
      </motion.div>
    </div>
  )
}
