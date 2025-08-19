import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Quote, MapPin, Calendar, Users, Star, ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface Beneficiary {
  id: string
  name: string
  age?: number
  location: string
  photoUrl?: string
  story: string
  campaignId: string
  campaignTitle: string
  organization: string
  impactReceived: string
  dateHelped: string
  category: string
  verified: boolean
  videoUrl?: string
}

interface BeneficiaryStoriesProps {
  stories: Beneficiary[]
  compact?: boolean
  featuredOnly?: boolean
}

export function BeneficiaryStories({ stories, compact = false, featuredOnly = false }: BeneficiaryStoriesProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showVideo, setShowVideo] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(stories.map(s => s.category)))]

  const filteredStories = selectedCategory === 'all'
    ? stories
    : stories.filter(s => s.category === selectedCategory)

  const displayStories = featuredOnly
    ? filteredStories.filter(s => s.verified).slice(0, 3)
    : compact
      ? filteredStories.slice(0, 3)
      : filteredStories

  const currentStory = displayStories[currentStoryIndex]

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % displayStories.length)
  }

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + displayStories.length) % displayStories.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emergency':
        return '🚨'
      case 'education':
        return '🎓'
      case 'healthcare':
        return '🏥'
      case 'environment':
        return '🌱'
      case 'community':
        return '🏘️'
      case 'children':
        return '👶'
      case 'elderly':
        return '👴'
      default:
        return '❤️'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (displayStories.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No beneficiary stories found</p>
          <p className="text-sm text-gray-500">Stories will appear here as beneficiaries share their experiences</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Beneficiary Stories</h3>
            <p className="text-sm text-gray-600">Real impact from the people we help</p>
          </div>
        </div>

        {!compact && !featuredOnly && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Featured story carousel */}
      {displayStories.length > 0 && !compact && (
        <div className="mb-6">
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-start space-x-4">
              {/* Profile section */}
              <div className="flex-shrink-0">
                {currentStory.photoUrl ? (
                  <img
                    src={currentStory.photoUrl}
                    alt={currentStory.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg">
                    {getInitials(currentStory.name)}
                  </div>
                )}
              </div>

              {/* Story content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-gray-900">{currentStory.name}</h4>
                      {currentStory.age && (
                        <span className="text-sm text-gray-600">({currentStory.age} ani)</span>
                      )}
                      {currentStory.verified && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{currentStory.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(currentStory.dateHelped)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">{getCategoryIcon(currentStory.category)}</span>
                      <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        {currentStory.category}
                      </span>
                    </div>
                  </div>

                  {currentStory.videoUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowVideo(currentStory.id)}
                      className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      <span>Video</span>
                    </motion.button>
                  )}
                </div>

                <blockquote className="border-l-4 border-green-400 pl-4 italic text-gray-700 mb-4">
                  <Quote className="h-4 w-4 text-green-400 mb-2" />
                  "{currentStory.story}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Impact received:</span> {currentStory.impactReceived}
                  </div>
                  <div className="text-sm text-gray-500">
                    via {currentStory.campaignTitle} • {currentStory.organization}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            {displayStories.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevStory}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextStory}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </motion.button>
              </>
            )}
          </div>

          {/* Story indicators */}
          {displayStories.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {displayStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentStoryIndex ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact story grid */}
      {compact && (
        <div className="grid gap-4">
          {displayStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-start space-x-3">
                {story.photoUrl ? (
                  <img
                    src={story.photoUrl}
                    alt={story.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(story.name)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{story.name}</h4>
                    {story.verified && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    "{story.story}"
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{getCategoryIcon(story.category)}</span>
                    <span>{story.location}</span>
                    <span>•</span>
                    <span>{formatDate(story.dateHelped)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Beneficiary Story Video</h3>
              <button
                onClick={() => setShowVideo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-center">Video player would be embedded here</p>
            </div>
          </div>
        </div>
      )}

      {compact && displayStories.length > 3 && (
        <div className="text-center pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View {displayStories.length - 3} more stories
          </motion.button>
        </div>
      )}
    </div>
  )
}
