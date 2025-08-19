'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Search and Filter Icons
    Search,
    Filter,
    MapPin,
    Calendar,
    Heart,
    Star,

    // Pet Type Icons
    Dog,
    Cat,
    PawPrint,

    // Status and Action Icons
    Eye,
    MessageSquare,
    Share2,
    Clock,
    CheckCircle2,
    AlertCircle,

    // Filter Category Icons
    Home,
    Users,
    Activity,
    Award,
    Zap,

    // Sort and View Icons
    Grid3X3,
    List,
    SlidersHorizontal,
    ArrowUpDown
} from 'lucide-react'

// Enhanced Pet Discovery Interfaces
interface PetProfile {
    id: string
    name: string
    breed: string
    age: string
    ageInMonths: number
    type: 'dog' | 'cat' | 'other'
    gender: 'male' | 'female'
    size: 'small' | 'medium' | 'large' | 'extra-large'
    location: string
    distance: number
    description: string
    characteristics: string[]
    healthStatus: string
    vaccinationStatus: string
    spayedNeutered: boolean
    goodWithKids: boolean
    goodWithPets: boolean
    energy: 'low' | 'medium' | 'high'
    training: 'none' | 'basic' | 'advanced'
    adoptionFee: number
    shelter: {
        name: string
        rating: number
        verified: boolean
    }
    images: string[]
    dateAdded: string
    isUrgent: boolean
    isFeatured: boolean
    matchScore?: number
    viewCount: number
    favoriteCount: number
    adoptionHistory: string
}

interface FilterState {
    searchTerm: string
    petType: string
    age: string
    size: string
    gender: string
    location: string
    maxDistance: number
    maxFee: number
    characteristics: string[]
    healthRequirements: string[]
    sortBy: string
    viewMode: 'grid' | 'list'
    showFavoritesOnly: boolean
    showFeaturedOnly: boolean
    showUrgentOnly: boolean
}

export default function PetDiscoveryPage() {
    // Enhanced Filter State
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        petType: 'all',
        age: 'all',
        size: 'all',
        gender: 'all',
        location: '',
        maxDistance: 50,
        maxFee: 1000,
        characteristics: [],
        healthRequirements: [],
        sortBy: 'relevance',
        viewMode: 'grid',
        showFavoritesOnly: false,
        showFeaturedOnly: false,
        showUrgentOnly: false
    })

    // Sample Pet Profiles Data
    const [petProfiles] = useState<PetProfile[]>([
        {
            id: '1',
            name: 'Luna',
            breed: 'Golden Retriever',
            age: '2 years',
            ageInMonths: 24,
            type: 'dog',
            gender: 'female',
            size: 'large',
            location: 'Bucharest, Romania',
            distance: 5.2,
            description: 'Luna is a gentle and loving Golden Retriever who adores children and gets along well with other pets. She\'s house-trained, knows basic commands, and would make a perfect family companion.',
            characteristics: ['Friendly', 'Active', 'Good with kids', 'House-trained', 'Obedient'],
            healthStatus: 'Excellent',
            vaccinationStatus: 'Up to date',
            spayedNeutered: true,
            goodWithKids: true,
            goodWithPets: true,
            energy: 'high',
            training: 'advanced',
            adoptionFee: 300,
            shelter: {
                name: 'Happy Paws Shelter',
                rating: 4.8,
                verified: true
            },
            images: ['/pets/luna-1.jpg', '/pets/luna-2.jpg'],
            dateAdded: '2025-01-10',
            isUrgent: false,
            isFeatured: true,
            matchScore: 94,
            viewCount: 156,
            favoriteCount: 23,
            adoptionHistory: 'First-time adoption'
        },
        {
            id: '2',
            name: 'Felix',
            breed: 'British Shorthair',
            age: '3 years',
            ageInMonths: 36,
            type: 'cat',
            gender: 'male',
            size: 'medium',
            location: 'Cluj-Napoca, Romania',
            distance: 12.8,
            description: 'Felix is a calm and affectionate British Shorthair who loves quiet environments. He\'s perfect for someone looking for a gentle, independent companion who enjoys cuddles on his own terms.',
            characteristics: ['Calm', 'Independent', 'Affectionate', 'Indoor cat', 'Low maintenance'],
            healthStatus: 'Good',
            vaccinationStatus: 'Up to date',
            spayedNeutered: true,
            goodWithKids: true,
            goodWithPets: false,
            energy: 'low',
            training: 'basic',
            adoptionFee: 200,
            shelter: {
                name: 'Feline Friends Rescue',
                rating: 4.6,
                verified: true
            },
            images: ['/pets/felix-1.jpg'],
            dateAdded: '2025-01-08',
            isUrgent: true,
            isFeatured: false,
            matchScore: 91,
            viewCount: 89,
            favoriteCount: 15,
            adoptionHistory: 'Previous owner moved abroad'
        },
        {
            id: '3',
            name: 'Max',
            breed: 'Labrador Mix',
            age: '4 years',
            ageInMonths: 48,
            type: 'dog',
            gender: 'male',
            size: 'large',
            location: 'Timișoara, Romania',
            distance: 25.3,
            description: 'Max is a loyal and gentle Labrador mix who\'s great with children and other dogs. He\'s well-trained, loves outdoor activities, and is looking for an active family to share adventures with.',
            characteristics: ['Loyal', 'Gentle', 'Well-trained', 'Active', 'Social'],
            healthStatus: 'Excellent',
            vaccinationStatus: 'Up to date',
            spayedNeutered: true,
            goodWithKids: true,
            goodWithPets: true,
            energy: 'medium',
            training: 'advanced',
            adoptionFee: 250,
            shelter: {
                name: 'Second Chance Animal Shelter',
                rating: 4.7,
                verified: true
            },
            images: ['/pets/max-1.jpg', '/pets/max-2.jpg', '/pets/max-3.jpg'],
            dateAdded: '2025-01-05',
            isUrgent: false,
            isFeatured: false,
            matchScore: 89,
            viewCount: 234,
            favoriteCount: 41,
            adoptionHistory: 'Rescue from streets'
        },
        {
            id: '4',
            name: 'Mia',
            breed: 'Persian',
            age: '1 year',
            ageInMonths: 12,
            type: 'cat',
            gender: 'female',
            size: 'small',
            location: 'Iași, Romania',
            distance: 45.7,
            description: 'Mia is a playful and cuddly Persian kitten who loves attention and being pampered. She\'s perfect for someone who wants a beautiful, affectionate companion that enjoys indoor living.',
            characteristics: ['Playful', 'Cuddly', 'Indoor cat', 'Attention-loving', 'Beautiful'],
            healthStatus: 'Excellent',
            vaccinationStatus: 'Up to date',
            spayedNeutered: true,
            goodWithKids: true,
            goodWithPets: true,
            energy: 'medium',
            training: 'none',
            adoptionFee: 350,
            shelter: {
                name: 'Loving Paws Foundation',
                rating: 4.9,
                verified: true
            },
            images: ['/pets/mia-1.jpg'],
            dateAdded: '2025-01-12',
            isUrgent: false,
            isFeatured: true,
            matchScore: 86,
            viewCount: 78,
            favoriteCount: 19,
            adoptionHistory: 'Surrendered by family'
        },
        {
            id: '5',
            name: 'Rocky',
            breed: 'German Shepherd Mix',
            age: '5 years',
            ageInMonths: 60,
            type: 'dog',
            gender: 'male',
            size: 'extra-large',
            location: 'Constanța, Romania',
            distance: 35.1,
            description: 'Rocky is a protective and intelligent German Shepherd mix who would make an excellent guard dog. He\'s loyal, well-trained, and looking for an experienced owner who can provide structure and exercise.',
            characteristics: ['Protective', 'Intelligent', 'Loyal', 'Needs exercise', 'Experienced owner needed'],
            healthStatus: 'Good',
            vaccinationStatus: 'Up to date',
            spayedNeutered: true,
            goodWithKids: false,
            goodWithPets: false,
            energy: 'high',
            training: 'advanced',
            adoptionFee: 400,
            shelter: {
                name: 'Guardian Angels Pet Rescue',
                rating: 4.5,
                verified: true
            },
            images: ['/pets/rocky-1.jpg', '/pets/rocky-2.jpg'],
            dateAdded: '2025-01-03',
            isUrgent: true,
            isFeatured: false,
            viewCount: 45,
            favoriteCount: 8,
            adoptionHistory: 'Owner moved to apartment'
        }
    ])

    const [displayedPets, setDisplayedPets] = useState<PetProfile[]>(petProfiles)
    const [favoritePets, setFavoritePets] = useState<string[]>(['1', '4'])
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

    // Filter Logic
    useEffect(() => {
        let filtered = petProfiles.filter(pet => {
            // Search term filter
            if (filters.searchTerm && !pet.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
                !pet.breed.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
                !pet.characteristics.some(char => char.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
                return false
            }

            // Type filter
            if (filters.petType !== 'all' && pet.type !== filters.petType) return false

            // Age filter
            if (filters.age !== 'all') {
                if (filters.age === 'young' && pet.ageInMonths > 12) return false
                if (filters.age === 'adult' && (pet.ageInMonths <= 12 || pet.ageInMonths > 84)) return false
                if (filters.age === 'senior' && pet.ageInMonths <= 84) return false
            }

            // Size filter
            if (filters.size !== 'all' && pet.size !== filters.size) return false

            // Gender filter
            if (filters.gender !== 'all' && pet.gender !== filters.gender) return false

            // Distance filter
            if (pet.distance > filters.maxDistance) return false

            // Fee filter
            if (pet.adoptionFee > filters.maxFee) return false

            // Special filters
            if (filters.showFavoritesOnly && !favoritePets.includes(pet.id)) return false
            if (filters.showFeaturedOnly && !pet.isFeatured) return false
            if (filters.showUrgentOnly && !pet.isUrgent) return false

            return true
        })

        // Sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'relevance':
                    return (b.matchScore || 0) - (a.matchScore || 0)
                case 'newest':
                    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
                case 'oldest':
                    return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
                case 'price-low':
                    return a.adoptionFee - b.adoptionFee
                case 'price-high':
                    return b.adoptionFee - a.adoptionFee
                case 'distance':
                    return a.distance - b.distance
                case 'popularity':
                    return b.viewCount - a.viewCount
                default:
                    return 0
            }
        })

        setDisplayedPets(filtered)
    }, [filters, petProfiles, favoritePets])

    // Toggle Favorite
    const toggleFavorite = (petId: string) => {
        setFavoritePets(prev =>
            prev.includes(petId)
                ? prev.filter(id => id !== petId)
                : [...prev, petId]
        )
    }

    // Filter Options
    const characteristicOptions = [
        'Friendly', 'Active', 'Good with kids', 'Good with pets', 'House-trained',
        'Calm', 'Independent', 'Affectionate', 'Playful', 'Loyal', 'Gentle',
        'Protective', 'Intelligent', 'Low maintenance', 'Indoor only'
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Page Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Discovery</h1>
                            <p className="text-gray-600">Find your perfect companion with AI-powered matching</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{displayedPets.length} pets found</span>
                            <button
                                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Quick Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search pets by name, breed, or traits..."
                                value={filters.searchTerm}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={filters.petType}
                            onChange={(e) => setFilters(prev => ({ ...prev, petType: e.target.value }))}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Pet Types</option>
                            <option value="dog">Dogs</option>
                            <option value="cat">Cats</option>
                            <option value="other">Other Pets</option>
                        </select>

                        <select
                            value={filters.age}
                            onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Ages</option>
                            <option value="young">Young (under 1 year)</option>
                            <option value="adult">Adult (1-7 years)</option>
                            <option value="senior">Senior (7+ years)</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="relevance">Best Match</option>
                            <option value="newest">Newest First</option>
                            <option value="distance">Closest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="popularity">Most Popular</option>
                        </select>
                    </div>

                    {/* Quick Filter Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, showFeaturedOnly: !prev.showFeaturedOnly }))}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.showFeaturedOnly
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Star className="h-3 w-3 inline mr-1" />
                            Featured
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, showUrgentOnly: !prev.showUrgentOnly }))}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.showUrgentOnly
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            Urgent
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, showFavoritesOnly: !prev.showFavoritesOnly }))}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.showFavoritesOnly
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Heart className="h-3 w-3 inline mr-1" />
                            Favorites
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">View:</span>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
                                className={`p-2 rounded-lg transition-colors ${filters.viewMode === 'grid'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                                className={`p-2 rounded-lg transition-colors ${filters.viewMode === 'list'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pet Profiles Grid/List */}
            <div className="max-w-7xl mx-auto p-6">
                {filters.viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedPets.map((pet, index) => (
                            <motion.div
                                key={pet.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative ${pet.isUrgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                                    } ${pet.isFeatured ? 'border-2 border-yellow-300' : 'border border-gray-100'
                                    }`}
                            >
                                {/* Pet Image Placeholder */}
                                <div className="relative mb-4">
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                        {pet.type === 'dog' ? (
                                            <Dog className="h-16 w-16 text-blue-600" />
                                        ) : pet.type === 'cat' ? (
                                            <Cat className="h-16 w-16 text-purple-600" />
                                        ) : (
                                            <PawPrint className="h-16 w-16 text-green-600" />
                                        )}
                                    </div>

                                    {/* Status Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col space-y-1">
                                        {pet.isFeatured && (
                                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                <Star className="h-3 w-3 inline mr-1" />
                                                Featured
                                            </span>
                                        )}
                                        {pet.isUrgent && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                <AlertCircle className="h-3 w-3 inline mr-1" />
                                                Urgent
                                            </span>
                                        )}
                                    </div>

                                    {/* Match Score */}
                                    {pet.matchScore && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                                            {pet.matchScore}% match
                                        </div>
                                    )}

                                    {/* Favorite Button */}
                                    <button
                                        onClick={() => toggleFavorite(pet.id)}
                                        className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                                    >
                                        <Heart className={`h-4 w-4 ${favoritePets.includes(pet.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                                            }`} />
                                    </button>
                                </div>

                                {/* Pet Information */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                                        <p className="text-gray-600">{pet.breed}, {pet.age}</p>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{pet.distance}km away</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye className="h-3 w-3" />
                                            <span>{pet.viewCount}</span>
                                        </div>
                                    </div>

                                    {/* Characteristics */}
                                    <div className="flex flex-wrap gap-1">
                                        {pet.characteristics.slice(0, 3).map((trait, i) => (
                                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {trait}
                                            </span>
                                        ))}
                                        {pet.characteristics.length > 3 && (
                                            <span className="text-xs text-gray-500">+{pet.characteristics.length - 3} more</span>
                                        )}
                                    </div>

                                    {/* Adoption Fee */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-green-600">{pet.adoptionFee} RON</span>
                                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                                            <Award className="h-3 w-3" />
                                            <span>{pet.shelter.rating}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                            View Profile
                                        </button>
                                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <MessageSquare className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Share2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-4">
                        {displayedPets.map((pet, index) => (
                            <motion.div
                                key={pet.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${pet.isUrgent ? 'ring-1 ring-red-500' : ''
                                    }`}
                            >
                                <div className="flex items-center space-x-6">
                                    {/* Pet Image */}
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                            {pet.type === 'dog' ? (
                                                <Dog className="h-8 w-8 text-blue-600" />
                                            ) : pet.type === 'cat' ? (
                                                <Cat className="h-8 w-8 text-purple-600" />
                                            ) : (
                                                <PawPrint className="h-8 w-8 text-green-600" />
                                            )}
                                        </div>
                                        {pet.matchScore && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                {pet.matchScore}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Pet Information */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                                                <p className="text-gray-600">{pet.breed}, {pet.age}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {pet.isFeatured && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                        Featured
                                                    </span>
                                                )}
                                                {pet.isUrgent && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pet.description}</p>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {pet.characteristics.slice(0, 5).map((trait, i) => (
                                                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{pet.distance}km away</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Added {pet.dateAdded}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Award className="h-3 w-3" />
                                                    <span>{pet.shelter.name} ({pet.shelter.rating}★)</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <span className="text-lg font-bold text-green-600">{pet.adoptionFee} RON</span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => toggleFavorite(pet.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Heart className={`h-4 w-4 ${favoritePets.includes(pet.id) ? 'fill-current' : ''
                                                            }`} />
                                                    </button>
                                                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {displayedPets.length === 0 && (
                    <div className="text-center py-12">
                        <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No pets found</h3>
                        <p className="text-gray-500">Try adjusting your filters to find more pets</p>
                    </div>
                )}
            </div>
        </div>
    )
}
