'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Heart,
    Star,
    ArrowLeft,
    Plus,
    Filter,
    Search,
    Bookmark,
    Share2,
    Coffee,
    Music,
    Camera,
    Gamepad2,
    Utensils,
    Palette,
    Mountain,
    Film,
    BookOpen,
    Zap,
    Trophy,
    TrendingUp,
    ThumbsUp,
    MessageCircle,
    Eye,
    UserPlus,
    Settings,
    Globe,
    Navigation,
    ChevronRight,
    Tag,
    Sparkles,
    PartyPopper
} from 'lucide-react'
import Link from 'next/link'

interface EventCategory {
    id: string
    name: string
    icon: React.ReactNode
    color: string
    count: number
}

interface DateEvent {
    id: string
    title: string
    description: string
    category: string
    date: string
    time: string
    location: string
    price: number
    maxParticipants: number
    currentParticipants: number
    rating: number
    reviews: number
    image: string
    tags: string[]
    isPopular: boolean
    isFeatured: boolean
    hostName: string
    hostRating: number
    difficulty: 'Easy' | 'Moderate' | 'Challenging'
    ageRange: string
    duration: string
}

interface CreatedEvent {
    id: string
    title: string
    date: string
    participants: number
    status: 'upcoming' | 'ongoing' | 'completed'
    category: string
}

const CurtAIEventsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'discover' | 'created' | 'joined'>('discover')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price' | 'rating'>('date')
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const categories: EventCategory[] = [
        { id: 'all', name: 'All Events', icon: <Globe className="w-5 h-5" />, color: 'text-gray-600', count: 47 },
        { id: 'dining', name: 'Dining', icon: <Utensils className="w-5 h-5" />, color: 'text-orange-600', count: 12 },
        { id: 'entertainment', name: 'Entertainment', icon: <Film className="w-5 h-5" />, color: 'text-purple-600', count: 8 },
        { id: 'outdoor', name: 'Outdoor', icon: <Mountain className="w-5 h-5" />, color: 'text-green-600', count: 9 },
        { id: 'culture', name: 'Culture', icon: <Palette className="w-5 h-5" />, color: 'text-blue-600', count: 7 },
        { id: 'nightlife', name: 'Nightlife', icon: <Music className="w-5 h-5" />, color: 'text-pink-600', count: 6 },
        { id: 'active', name: 'Active', icon: <Zap className="w-5 h-5" />, color: 'text-yellow-600', count: 5 }
    ]

    const events: DateEvent[] = [
        {
            id: '1',
            title: 'Wine Tasting & Sunset Dinner',
            description: 'Experience an intimate evening of wine tasting paired with a romantic sunset dinner at our rooftop venue.',
            category: 'dining',
            date: '2025-08-15',
            time: '18:00',
            location: 'Sky Lounge, Downtown',
            price: 85,
            maxParticipants: 20,
            currentParticipants: 14,
            rating: 4.8,
            reviews: 156,
            image: '/api/placeholder/400/250',
            tags: ['Romantic', 'Wine', 'Sunset', 'Upscale'],
            isPopular: true,
            isFeatured: true,
            hostName: 'Elena Rodriguez',
            hostRating: 4.9,
            difficulty: 'Easy',
            ageRange: '25-40',
            duration: '3 hours'
        },
        {
            id: '2',
            title: 'Cooking Class: Italian Romance',
            description: 'Learn to cook authentic Italian dishes together in this hands-on cooking experience designed for couples.',
            category: 'dining',
            date: '2025-08-16',
            time: '19:30',
            location: 'Culinary Studio, Little Italy',
            price: 75,
            maxParticipants: 16,
            currentParticipants: 10,
            rating: 4.7,
            reviews: 89,
            image: '/api/placeholder/400/250',
            tags: ['Cooking', 'Italian', 'Hands-on', 'Interactive'],
            isPopular: false,
            isFeatured: false,
            hostName: 'Marco Antonelli',
            hostRating: 4.8,
            difficulty: 'Moderate',
            ageRange: '22-45',
            duration: '2.5 hours'
        },
        {
            id: '3',
            title: 'Jazz Night & Cocktails',
            description: 'Enjoy an evening of smooth jazz music while sipping craft cocktails in an intimate setting.',
            category: 'nightlife',
            date: '2025-08-17',
            time: '20:00',
            location: 'Blue Note Lounge, Arts District',
            price: 45,
            maxParticipants: 30,
            currentParticipants: 22,
            rating: 4.6,
            reviews: 203,
            image: '/api/placeholder/400/250',
            tags: ['Jazz', 'Cocktails', 'Music', 'Intimate'],
            isPopular: true,
            isFeatured: false,
            hostName: 'Sarah Johnson',
            hostRating: 4.7,
            difficulty: 'Easy',
            ageRange: '28-50',
            duration: '4 hours'
        },
        {
            id: '4',
            title: 'Hiking & Picnic Adventure',
            description: 'Explore scenic trails and enjoy a romantic picnic with breathtaking views of the city.',
            category: 'outdoor',
            date: '2025-08-18',
            time: '09:00',
            location: 'Griffith Park Trails',
            price: 35,
            maxParticipants: 24,
            currentParticipants: 18,
            rating: 4.9,
            reviews: 127,
            image: '/api/placeholder/400/250',
            tags: ['Hiking', 'Nature', 'Picnic', 'Adventure'],
            isPopular: false,
            isFeatured: true,
            hostName: 'David Chen',
            hostRating: 4.9,
            difficulty: 'Moderate',
            ageRange: '24-42',
            duration: '5 hours'
        },
        {
            id: '5',
            title: 'Art Gallery Opening Night',
            description: 'Discover contemporary art and meet fellow art enthusiasts at this exclusive gallery opening.',
            category: 'culture',
            date: '2025-08-19',
            time: '18:30',
            location: 'Modern Art Gallery, SoHo',
            price: 25,
            maxParticipants: 40,
            currentParticipants: 28,
            rating: 4.5,
            reviews: 94,
            image: '/api/placeholder/400/250',
            tags: ['Art', 'Gallery', 'Contemporary', 'Networking'],
            isPopular: false,
            isFeatured: false,
            hostName: 'Alexandra Kim',
            hostRating: 4.6,
            difficulty: 'Easy',
            ageRange: '26-45',
            duration: '2 hours'
        }
    ]

    const myCreatedEvents: CreatedEvent[] = [
        { id: '1', title: 'Beach Volleyball Tournament', date: '2025-08-20', participants: 16, status: 'upcoming', category: 'active' },
        { id: '2', title: 'Coffee Shop Book Club', date: '2025-08-14', participants: 8, status: 'completed', category: 'culture' },
        { id: '3', title: 'Rooftop Dance Party', date: '2025-08-16', participants: 12, status: 'ongoing', category: 'nightlife' }
    ]

    const filteredEvents = events.filter(event => {
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
    })

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        switch (sortBy) {
            case 'popularity':
                return b.rating - a.rating
            case 'price':
                return a.price - b.price
            case 'rating':
                return b.rating - a.rating
            case 'date':
            default:
                return new Date(a.date).getTime() - new Date(b.date).getTime()
        }
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800'
            case 'ongoing': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800'
            case 'Moderate': return 'bg-yellow-100 text-yellow-800'
            case 'Challenging': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-8 shadow-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Events & Activities</h1>
                                <p className="text-pink-100">Discover Amazing Date Experiences</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Create Event</span>
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">47</div>
                            <div className="text-pink-100 text-sm">Available Events</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-pink-100 text-sm">Events Joined</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-pink-100 text-sm">Events Created</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">4.8</div>
                            <div className="text-pink-100 text-sm">Avg Rating</div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'discover', label: 'Discover Events', icon: <Search className="w-4 h-4" /> },
                            { id: 'created', label: 'My Events', icon: <Plus className="w-4 h-4" /> },
                            { id: 'joined', label: 'Joined Events', icon: <Users className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 flex-1 justify-center ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Discover Events Tab */}
                {activeTab === 'discover' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Search and Filters */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search events, activities, or interests..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        <option value="date">Sort by Date</option>
                                        <option value="popularity">Sort by Popularity</option>
                                        <option value="price">Sort by Price</option>
                                        <option value="rating">Sort by Rating</option>
                                    </select>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Filters</span>
                                    </button>
                                </div>
                            </div>

                            {/* Category Filters */}
                            <div className="flex flex-wrap gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${selectedCategory === category.id
                                                ? 'bg-pink-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700'
                                            }`}
                                    >
                                        <span className={category.color}>{category.icon}</span>
                                        <span className="font-medium">{category.name}</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                            {category.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Featured Events */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <Sparkles className="w-6 h-6 text-pink-500" />
                                <h2 className="text-xl font-bold text-gray-900">Featured Events</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {sortedEvents.filter(event => event.isFeatured).map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative bg-gradient-to-r from-pink-500 to-red-500 rounded-xl p-6 text-white overflow-hidden"
                                    >
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                                                Featured
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                                <p className="text-pink-100 text-sm line-clamp-2">{event.description}</p>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-2xl font-bold">${event.price}</div>
                                                <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                                    Join Event
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* All Events Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">All Events</h2>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{sortedEvents.length} events found</span>
                                    <div className="border-l border-gray-300 pl-3 ml-3">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                                                <div className="bg-current rounded-sm"></div>
                                                <div className="bg-current rounded-sm"></div>
                                                <div className="bg-current rounded-sm"></div>
                                                <div className="bg-current rounded-sm"></div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            <div className="w-4 h-4 space-y-1">
                                                <div className="h-1 bg-current rounded"></div>
                                                <div className="h-1 bg-current rounded"></div>
                                                <div className="h-1 bg-current rounded"></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                {sortedEvents.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${viewMode === 'list' ? 'flex' : ''
                                            }`}
                                    >
                                        {/* Event Image */}
                                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
                                            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center">
                                                <Camera className="w-12 h-12 text-pink-400" />
                                            </div>

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col space-y-2">
                                                {event.isPopular && (
                                                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                        Popular
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(event.difficulty)}`}>
                                                    {event.difficulty}
                                                </span>
                                            </div>

                                            <div className="absolute top-3 right-3 flex space-x-2">
                                                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                                    <Bookmark className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                                    <Share2 className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                                                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="text-xl font-bold text-pink-600">${event.price}</div>
                                                    <div className="text-xs text-gray-500">per person</div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                    <Clock className="w-4 h-4 ml-2" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                                                </div>
                                            </div>

                                            {/* Rating and Host */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{event.rating}</span>
                                                    <span className="text-xs text-gray-500">({event.reviews})</span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Hosted by <span className="font-medium">{event.hostName}</span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {event.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {event.tags.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{event.tags.length - 3} more</span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-3">
                                                <button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium">
                                                    Join Event
                                                </button>
                                                <button className="p-2 border border-gray-300 rounded-lg hover:border-pink-300 hover:text-pink-600 transition-colors">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Created Events Tab */}
                {activeTab === 'created' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">My Created Events</h2>
                                <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium flex items-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Create New Event</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {myCreatedEvents.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-pink-100 rounded-lg">
                                                <Calendar className="w-6 h-6 text-pink-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                    <span>{event.participants} participants</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Joined Events Tab */}
                {activeTab === 'joined' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Events You've Joined</h2>

                            <div className="text-center py-12">
                                <PartyPopper className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Joined Events Yet</h3>
                                <p className="text-gray-600 mb-6">
                                    Start joining events to meet amazing people and create memorable experiences!
                                </p>
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium"
                                >
                                    Discover Events
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Users className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Meet Like-Minded People</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Connect with singles who share your interests and passions
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Join Community
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Heart className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Memorable Experiences</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Create lasting memories through unique and engaging activities
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Browse Events
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Sparkles className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">AI-Matched Activities</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Get personalized event recommendations based on your preferences
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Get Recommendations
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-8 border-t border-white/20">
                        <p className="text-pink-100">
                            © 2025 CurtAI - AI-Powered Dating Events & Activities. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default CurtAIEventsPage
