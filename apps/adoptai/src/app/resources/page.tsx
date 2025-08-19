'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Navigation and Action Icons
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    Search,
    Filter,
    BookOpen,
    FileText,
    Play,

    // Resource Type Icons
    Book,
    Video,
    Download,
    Link,
    Image,
    Mic,
    Headphones,
    Monitor,
    Smartphone,

    // Pet Care Icons
    Heart,
    Stethoscope,
    Activity,
    Shield,
    Scissors,
    Pill,
    Home,
    Car,

    // Training and Behavior Icons
    Target,
    Award,
    Users,
    User,
    Brain,
    Zap,
    Clock,
    CheckCircle2,

    // Emergency and Safety Icons
    Phone,
    AlertTriangle,
    MapPin,
    Calendar,
    Bell,
    Thermometer,

    // Category Icons
    Dog,
    Cat,
    PawPrint,
    Baby,
    Sparkles,
    Star,
    HelpCircle,

    // Interaction Icons
    ThumbsUp,
    MessageSquare,
    Share2,
    Bookmark,
    Plus,
    Minus,
    X,

    // Time and Progress Icons
    Timer,
    RotateCcw,
    TrendingUp,
    BarChart3
} from 'lucide-react'

// Resource Interfaces
interface ResourceItem {
    id: string
    title: string
    description: string
    type: 'guide' | 'video' | 'article' | 'checklist' | 'podcast' | 'infographic' | 'course' | 'tool'
    category: 'health' | 'training' | 'nutrition' | 'safety' | 'behavior' | 'grooming' | 'emergency' | 'legal' | 'financial'
    petTypes: Array<'dog' | 'cat' | 'both'>
    ageGroups: Array<'puppy' | 'kitten' | 'adult' | 'senior' | 'all'>
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration: number // in minutes
    format: 'pdf' | 'video' | 'audio' | 'interactive' | 'web' | 'downloadable'
    url?: string
    downloadUrl?: string
    thumbnail: string
    author: string
    publishDate: Date
    views: number
    rating: number
    tags: string[]
    featured: boolean
    premium: boolean
    language: string
}

interface ResourceCategory {
    id: string
    name: string
    description: string
    icon: React.ElementType
    color: string
    bgColor: string
    count: number
}

interface SupportContact {
    type: 'phone' | 'email' | 'chat' | 'emergency'
    label: string
    value: string
    availability: string
    description: string
}

export default function ResourcesPage() {
    // State Management
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedPetType, setSelectedPetType] = useState<'all' | 'dog' | 'cat'>('all')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([])

    // Sample Resource Categories
    const resourceCategories: ResourceCategory[] = [
        {
            id: 'health',
            name: 'Health & Medical',
            description: 'Veterinary care, vaccinations, and health monitoring guides',
            icon: Stethoscope,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            count: 24
        },
        {
            id: 'training',
            name: 'Training & Behavior',
            description: 'Training techniques, behavior modification, and obedience guides',
            icon: Target,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            count: 18
        },
        {
            id: 'nutrition',
            name: 'Nutrition & Diet',
            description: 'Feeding guidelines, diet plans, and nutritional requirements',
            icon: Heart,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            count: 15
        },
        {
            id: 'safety',
            name: 'Safety & Emergency',
            description: 'Emergency procedures, first aid, and pet safety protocols',
            icon: Shield,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            count: 12
        },
        {
            id: 'behavior',
            name: 'Behavior & Psychology',
            description: 'Understanding pet behavior and psychological well-being',
            icon: Brain,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            count: 16
        },
        {
            id: 'grooming',
            name: 'Grooming & Care',
            description: 'Grooming techniques, hygiene, and physical care routines',
            icon: Scissors,
            color: 'text-pink-600',
            bgColor: 'bg-pink-100',
            count: 10
        }
    ]

    // Sample Resources Data
    const resourceItems: ResourceItem[] = [
        {
            id: '1',
            title: 'Complete Puppy Training Guide',
            description: 'Comprehensive guide covering house training, basic commands, socialization, and common puppy behaviors. Perfect for first-time dog owners.',
            type: 'guide',
            category: 'training',
            petTypes: ['dog'],
            ageGroups: ['puppy'],
            difficulty: 'beginner',
            duration: 45,
            format: 'pdf',
            downloadUrl: '/resources/puppy-training-guide.pdf',
            thumbnail: '/placeholder-puppy-training.jpg',
            author: 'Dr. Elena Popescu, Certified Dog Trainer',
            publishDate: new Date('2025-01-15'),
            views: 2847,
            rating: 4.8,
            tags: ['house-training', 'socialization', 'basic-commands', 'first-time-owners'],
            featured: true,
            premium: false,
            language: 'Romanian'
        },
        {
            id: '2',
            title: 'Emergency First Aid for Pets',
            description: 'Critical first aid procedures every pet owner should know. Includes step-by-step instructions for common emergencies.',
            type: 'video',
            category: 'safety',
            petTypes: ['both'],
            ageGroups: ['all'],
            difficulty: 'intermediate',
            duration: 25,
            format: 'video',
            url: '/videos/pet-first-aid.mp4',
            thumbnail: '/placeholder-first-aid.jpg',
            author: 'Dr. Andrei Georgescu, Emergency Veterinarian',
            publishDate: new Date('2024-12-10'),
            views: 5692,
            rating: 4.9,
            tags: ['emergency', 'first-aid', 'life-saving', 'essential'],
            featured: true,
            premium: false,
            language: 'Romanian'
        },
        {
            id: '3',
            title: 'Senior Cat Care Essentials',
            description: 'Specialized care guide for aging cats including health monitoring, comfort measures, and quality of life considerations.',
            type: 'article',
            category: 'health',
            petTypes: ['cat'],
            ageGroups: ['senior'],
            difficulty: 'intermediate',
            duration: 20,
            format: 'web',
            url: '/articles/senior-cat-care',
            thumbnail: '/placeholder-senior-cat.jpg',
            author: 'Dr. Maria Ionescu, Feline Specialist',
            publishDate: new Date('2025-01-20'),
            views: 1456,
            rating: 4.7,
            tags: ['senior-pets', 'aging', 'health-monitoring', 'comfort'],
            featured: false,
            premium: false,
            language: 'Romanian'
        },
        {
            id: '4',
            title: 'Pet Nutrition Calculator Tool',
            description: 'Interactive tool to calculate proper portion sizes and nutritional requirements based on your pet\'s age, weight, and activity level.',
            type: 'tool',
            category: 'nutrition',
            petTypes: ['both'],
            ageGroups: ['all'],
            difficulty: 'beginner',
            duration: 10,
            format: 'interactive',
            url: '/tools/nutrition-calculator',
            thumbnail: '/placeholder-nutrition-tool.jpg',
            author: 'AdoptAI Nutrition Team',
            publishDate: new Date('2024-11-30'),
            views: 3421,
            rating: 4.6,
            tags: ['nutrition', 'calculator', 'portions', 'interactive'],
            featured: true,
            premium: false,
            language: 'Romanian'
        },
        {
            id: '5',
            title: 'Understanding Dog Body Language',
            description: 'Learn to interpret your dog\'s body language signals to better understand their emotions and prevent behavioral issues.',
            type: 'infographic',
            category: 'behavior',
            petTypes: ['dog'],
            ageGroups: ['all'],
            difficulty: 'beginner',
            duration: 15,
            format: 'downloadable',
            downloadUrl: '/resources/dog-body-language.pdf',
            thumbnail: '/placeholder-body-language.jpg',
            author: 'Romanian Dog Behavior Institute',
            publishDate: new Date('2024-12-25'),
            views: 4123,
            rating: 4.8,
            tags: ['body-language', 'communication', 'behavior', 'understanding'],
            featured: false,
            premium: false,
            language: 'Romanian'
        }
    ]

    // Sample Support Contacts
    const supportContacts: SupportContact[] = [
        {
            type: 'emergency',
            label: 'Emergency Veterinary Line',
            value: '+40 21 123 4567',
            availability: '24/7',
            description: 'Immediate veterinary emergency assistance'
        },
        {
            type: 'phone',
            label: 'General Support',
            value: '+40 21 987 6543',
            availability: 'Mon-Fri 9:00-18:00',
            description: 'General questions and adoption support'
        },
        {
            type: 'email',
            label: 'Training Support',
            value: 'training@adoptai.ro',
            availability: 'Response within 24h',
            description: 'Training and behavior guidance'
        },
        {
            type: 'chat',
            label: 'Live Chat',
            value: 'Available on website',
            availability: 'Mon-Fri 10:00-17:00',
            description: 'Real-time assistance and quick questions'
        }
    ]

    // Filter resources
    const filteredResources = resourceItems.filter(resource => {
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
        const matchesPetType = selectedPetType === 'all' ||
            resource.petTypes.includes(selectedPetType as any) ||
            resource.petTypes.includes('both')
        const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty
        const matchesSearch = searchQuery === '' ||
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesCategory && matchesPetType && matchesDifficulty && matchesSearch
    })

    // Toggle bookmark
    const toggleBookmark = (resourceId: string) => {
        setBookmarkedItems(prev =>
            prev.includes(resourceId)
                ? prev.filter(id => id !== resourceId)
                : [...prev, resourceId]
        )
    }

    // Get type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'guide': return Book
            case 'video': return Video
            case 'article': return FileText
            case 'checklist': return CheckCircle2
            case 'podcast': return Headphones
            case 'infographic': return Image
            case 'course': return Monitor
            case 'tool': return Smartphone
            default: return FileText
        }
    }

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Resources & Support</h1>
                            <p className="text-blue-100 text-lg">Everything you need for successful pet ownership</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-200">Available Resources</p>
                            <p className="text-3xl font-bold">{resourceItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search resources, guides, and tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                            </button>

                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-gray-100 pt-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
                                        <select
                                            value={selectedPetType}
                                            onChange={(e) => setSelectedPetType(e.target.value as any)}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Pets</option>
                                            <option value="dog">Dogs</option>
                                            <option value="cat">Cats</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                                        <select
                                            value={selectedDifficulty}
                                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Levels</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory('all')
                                                    setSelectedPetType('all')
                                                    setSelectedDifficulty('all')
                                                    setSearchQuery('')
                                                }}
                                                className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                                            >
                                                Clear All
                                            </button>
                                            <button
                                                onClick={() => setSelectedCategory('emergency')}
                                                className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                                            >
                                                Emergency
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Resource Categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`p-4 rounded-xl border transition-all ${selectedCategory === 'all'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="text-center">
                            <BookOpen className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium text-sm">All</div>
                            <div className="text-xs opacity-75">{resourceItems.length}</div>
                        </div>
                    </button>

                    {resourceCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-4 rounded-xl border transition-all ${selectedCategory === category.id
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <category.icon className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium text-sm">{category.name}</div>
                                <div className="text-xs opacity-75">{category.count}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Featured Resources */}
                {selectedCategory === 'all' && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                        <div className="flex items-center space-x-2 mb-6">
                            <Star className="h-6 w-6 text-yellow-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Featured Resources</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resourceItems.filter(item => item.featured).map((resource) => {
                                const TypeIcon = getTypeIcon(resource.type)
                                return (
                                    <div key={resource.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <TypeIcon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{resource.title}</h3>
                                                    <p className="text-sm text-gray-600">{resource.author}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleBookmark(resource.id)}
                                                className={`p-1 rounded ${bookmarkedItems.includes(resource.id) ? 'text-blue-600' : 'text-gray-400'
                                                    }`}
                                            >
                                                <Bookmark className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>{formatDuration(resource.duration)}</span>
                                                <span className="flex items-center space-x-1">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span>{resource.rating}</span>
                                                </span>
                                                <span>{resource.views} views</span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                                {resource.format === 'downloadable' ? 'Download' : 'View Resource'}
                                            </button>
                                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <Share2 className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Resources Grid/List */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {selectedCategory === 'all' ? 'All Resources' :
                                resourceCategories.find(c => c.id === selectedCategory)?.name || 'Resources'}
                        </h2>
                        <span className="text-sm text-gray-500">{filteredResources.length} resources found</span>
                    </div>

                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {filteredResources.map((resource) => {
                            const TypeIcon = getTypeIcon(resource.type)

                            if (viewMode === 'list') {
                                return (
                                    <div key={resource.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                        <img
                                            src={resource.thumbnail}
                                            alt={resource.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{resource.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-1">{resource.author}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <span className="text-sm text-gray-500">{formatDuration(resource.duration)}</span>
                                                    <button
                                                        onClick={() => toggleBookmark(resource.id)}
                                                        className={`p-1 rounded ${bookmarkedItems.includes(resource.id) ? 'text-blue-600' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <Bookmark className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <motion.div
                                    key={resource.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                                        <img
                                            src={resource.thumbnail}
                                            alt={resource.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                            {resource.type}
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                            {formatDuration(resource.duration)}
                                        </div>
                                        {resource.premium && (
                                            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                                Premium
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <TypeIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{resource.title}</h3>
                                                <p className="text-sm text-gray-600">{resource.author}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleBookmark(resource.id)}
                                            className={`p-1 rounded ${bookmarkedItems.includes(resource.id) ? 'text-blue-600' : 'text-gray-400'
                                                }`}
                                        >
                                            <Bookmark className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {resource.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-3 w-3 text-yellow-400" />
                                            <span>{resource.rating}</span>
                                        </div>
                                        <span>{resource.views} views</span>
                                        <span className={`px-2 py-1 rounded text-xs ${resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                                resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {resource.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                            {resource.format === 'downloadable' ? 'Download' : 'Access Resource'}
                                        </button>
                                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <ExternalLink className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {filteredResources.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </div>

                {/* Support & Contact */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center space-x-2 mb-6">
                        <HelpCircle className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Need Additional Support?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {supportContacts.map((contact) => (
                            <div key={contact.type} className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {contact.type === 'emergency' && <AlertTriangle className="h-8 w-8 text-red-600" />}
                                    {contact.type === 'phone' && <Phone className="h-8 w-8 text-blue-600" />}
                                    {contact.type === 'email' && <MessageSquare className="h-8 w-8 text-green-600" />}
                                    {contact.type === 'chat' && <Users className="h-8 w-8 text-purple-600" />}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2">{contact.label}</h3>
                                <p className="text-blue-600 font-medium mb-2">{contact.value}</p>
                                <p className="text-sm text-gray-600 mb-2">{contact.availability}</p>
                                <p className="text-xs text-gray-500">{contact.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Can't find what you're looking for?</h3>
                        <p className="text-gray-600 mb-4">
                            Our team is always adding new resources and guides. Let us know what you need!
                        </p>
                        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                            Request New Resource
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
