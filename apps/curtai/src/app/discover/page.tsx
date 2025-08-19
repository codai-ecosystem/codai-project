'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    X,
    Star,
    MapPin,
    User,
    Shield,
    Coffee,
    Camera,
    Music,
    Book,
    Dumbbell,
    Paintbrush,
    Plane,
    Sparkles,
    Filter,
    Settings,
    Target,
    MessageCircle,
    TrendingUp,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    SortAsc,
    Grid,
    List,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// TypeScript interfaces for advanced matching system
interface AdvancedProfile {
    id: string
    name: string
    age: number
    location: string
    distance: number
    compatibility: number
    profileImages: string[]
    currentImageIndex: number
    verified: boolean
    bio: string
    interests: string[]
    occupation: string
    education: string
    height: string
    lookingFor: string
    relationshipType: 'serious' | 'casual' | 'friendship' | 'unsure'
    personalityTraits: {
        openness: number
        conscientiousness: number
        extraversion: number
        agreeableness: number
        neuroticism: number
    }
    lifestyle: {
        smoking: 'never' | 'sometimes' | 'regularly'
        drinking: 'never' | 'socially' | 'regularly'
        exercise: 'never' | 'sometimes' | 'regularly'
        diet: 'anything' | 'vegetarian' | 'vegan' | 'pescatarian'
    }
    dealBreakers: string[]
    lastActive: string
    isOnline: boolean
    mutualFriends: number
    photos: { url: string; caption?: string }[]
}

interface MatchingFilters {
    ageRange: [number, number]
    maxDistance: number
    minCompatibility: number
    relationshipType: string[]
    interests: string[]
    lifestyle: {
        smoking: string[]
        drinking: string[]
        exercise: string[]
    }
    verified: boolean
    onlineOnly: boolean
}

interface DiscoverMetrics {
    todayViews: number
    newMatches: number
    potentialMatches: number
    aiRecommendations: number
}

export default function DiscoverAndMatch() {
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
    const [viewMode, setViewMode] = useState<'cards' | 'grid' | 'list'>('cards')
    const [showFilters, setShowFilters] = useState(false)
    const [metrics, setMetrics] = useState<DiscoverMetrics>({
        todayViews: 127,
        newMatches: 8,
        potentialMatches: 342,
        aiRecommendations: 23
    })

    const [filters, setFilters] = useState<MatchingFilters>({
        ageRange: [22, 35],
        maxDistance: 50,
        minCompatibility: 70,
        relationshipType: ['serious', 'casual'],
        interests: [],
        lifestyle: {
            smoking: ['never'],
            drinking: ['never', 'socially'],
            exercise: ['sometimes', 'regularly']
        },
        verified: false,
        onlineOnly: false
    })

    const [profiles] = useState<AdvancedProfile[]>([
        {
            id: '1',
            name: 'Emma Rodriguez',
            age: 28,
            location: 'Bucharest, Romania',
            distance: 2,
            compatibility: 94,
            profileImages: ['/api/placeholder/400/600', '/api/placeholder/400/600', '/api/placeholder/400/600'],
            currentImageIndex: 0,
            verified: true,
            bio: 'Professional photographer who loves capturing life\'s beautiful moments. Adventure seeker with a passion for travel and coffee culture. Looking for someone who shares my love for exploring new places and trying new experiences.',
            interests: ['Photography', 'Travel', 'Coffee', 'Hiking', 'Art', 'Music'],
            occupation: 'Senior Photographer',
            education: 'University of Arts, Bucharest',
            height: '165 cm',
            lookingFor: 'Long-term relationship',
            relationshipType: 'serious',
            personalityTraits: {
                openness: 92,
                conscientiousness: 78,
                extraversion: 85,
                agreeableness: 88,
                neuroticism: 23
            },
            lifestyle: {
                smoking: 'never',
                drinking: 'socially',
                exercise: 'regularly',
                diet: 'vegetarian'
            },
            dealBreakers: ['Smoking', 'No ambition', 'Dishonesty'],
            lastActive: '2 minutes ago',
            isOnline: true,
            mutualFriends: 3,
            photos: [
                { url: '/api/placeholder/400/600', caption: 'Sunset photography session' },
                { url: '/api/placeholder/400/600', caption: 'Coffee shop adventure' },
                { url: '/api/placeholder/400/600', caption: 'Hiking in the mountains' }
            ]
        },
        {
            id: '2',
            name: 'Sofia Chen',
            age: 26,
            location: 'Cluj-Napoca, Romania',
            distance: 5,
            compatibility: 91,
            profileImages: ['/api/placeholder/400/600', '/api/placeholder/400/600'],
            currentImageIndex: 0,
            verified: true,
            bio: 'Software engineer by day, artist by night. I create digital art and love exploring the intersection of technology and creativity. Seeking someone who appreciates both logic and imagination.',
            interests: ['Programming', 'Digital Art', 'Gaming', 'Anime', 'Sci-Fi', 'Cats'],
            occupation: 'Software Engineer',
            education: 'Technical University of Cluj-Napoca',
            height: '160 cm',
            lookingFor: 'Serious relationship',
            relationshipType: 'serious',
            personalityTraits: {
                openness: 88,
                conscientiousness: 92,
                extraversion: 45,
                agreeableness: 85,
                neuroticism: 35
            },
            lifestyle: {
                smoking: 'never',
                drinking: 'socially',
                exercise: 'sometimes',
                diet: 'anything'
            },
            dealBreakers: ['Smoking', 'No intellectual curiosity'],
            lastActive: '1 hour ago',
            isOnline: true,
            mutualFriends: 1,
            photos: [
                { url: '/api/placeholder/400/600', caption: 'Working on latest project' },
                { url: '/api/placeholder/400/600', caption: 'Art gallery opening' }
            ]
        },
        {
            id: '3',
            name: 'Ana Popescu',
            age: 30,
            location: 'Timișoara, Romania',
            distance: 3,
            compatibility: 88,
            profileImages: ['/api/placeholder/400/600', '/api/placeholder/400/600', '/api/placeholder/400/600'],
            currentImageIndex: 0,
            verified: true,
            bio: 'Fitness enthusiast and nutrition coach. I believe in living a balanced life filled with good food, great workouts, and meaningful connections. Dance is my passion!',
            interests: ['Fitness', 'Nutrition', 'Dancing', 'Cooking', 'Wellness', 'Movies'],
            occupation: 'Nutrition Coach',
            education: 'Sports University Timișoara',
            height: '170 cm',
            lookingFor: 'Long-term partnership',
            relationshipType: 'serious',
            personalityTraits: {
                openness: 75,
                conscientiousness: 95,
                extraversion: 88,
                agreeableness: 90,
                neuroticism: 18
            },
            lifestyle: {
                smoking: 'never',
                drinking: 'socially',
                exercise: 'regularly',
                diet: 'anything'
            },
            dealBreakers: ['Smoking', 'Sedentary lifestyle'],
            lastActive: '3 hours ago',
            isOnline: false,
            mutualFriends: 5,
            photos: [
                { url: '/api/placeholder/400/600', caption: 'Morning workout session' },
                { url: '/api/placeholder/400/600', caption: 'Healthy cooking class' },
                { url: '/api/placeholder/400/600', caption: 'Dance competition' }
            ]
        },
        {
            id: '4',
            name: 'Maria Ionescu',
            age: 27,
            location: 'Brașov, Romania',
            distance: 1,
            compatibility: 86,
            profileImages: ['/api/placeholder/400/600', '/api/placeholder/400/600'],
            currentImageIndex: 0,
            verified: false,
            bio: 'Psychology graduate with a love for understanding human behavior. I enjoy deep conversations, wine tastings, and theater performances. Looking for an intellectual connection.',
            interests: ['Psychology', 'Wine', 'Theater', 'Reading', 'Philosophy', 'Travel'],
            occupation: 'Clinical Psychologist',
            education: 'University of Bucharest',
            height: '168 cm',
            lookingFor: 'Meaningful relationship',
            relationshipType: 'serious',
            personalityTraits: {
                openness: 95,
                conscientiousness: 82,
                extraversion: 65,
                agreeableness: 92,
                neuroticism: 42
            },
            lifestyle: {
                smoking: 'never',
                drinking: 'socially',
                exercise: 'sometimes',
                diet: 'anything'
            },
            dealBreakers: ['Closed-mindedness', 'No emotional intelligence'],
            lastActive: '5 hours ago',
            isOnline: false,
            mutualFriends: 2,
            photos: [
                { url: '/api/placeholder/400/600', caption: 'At the psychology conference' },
                { url: '/api/placeholder/400/600', caption: 'Wine tasting evening' }
            ]
        }
    ])

    const getCurrentProfile = () => profiles[currentProfileIndex]

    const handleLike = (_profileId: string) => {
        // setLikedProfiles(prev => [...prev, profileId])
        nextProfile()
    }

    const handlePass = (_profileId: string) => {
        // setPassedProfiles(prev => [...prev, profileId])
        nextProfile()
    }

    const nextProfile = () => {
        if (currentProfileIndex < profiles.length - 1) {
            setCurrentProfileIndex(prev => prev + 1)
        }
    }

    const previousProfile = () => {
        if (currentProfileIndex > 0) {
            setCurrentProfileIndex(prev => prev - 1)
        }
    }

    const nextImage = (_profile: AdvancedProfile) => {
        // const nextIndex = (profile.currentImageIndex + 1) % profile.profileImages.length
        // Note: In a real app, you'd update the state properly
    }

    const previousImage = (_profile: AdvancedProfile) => {
        // const prevIndex = profile.currentImageIndex === 0 
        //   ? profile.profileImages.length - 1 
        //   : profile.currentImageIndex - 1
        // Note: In a real app, you'd update the state properly
    }

    const getPersonalityColor = (score: number) => {
        if (score >= 80) return 'bg-green-500'
        if (score >= 60) return 'bg-blue-500'
        if (score >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getCompatibilityColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100'
        if (score >= 80) return 'text-blue-600 bg-blue-100'
        if (score >= 70) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
    }

    const getInterestIcon = (interest: string) => {
        const iconMap: { [key: string]: React.ReactNode } = {
            'Photography': <Camera className="w-4 h-4" />,
            'Travel': <Plane className="w-4 h-4" />,
            'Coffee': <Coffee className="w-4 h-4" />,
            'Music': <Music className="w-4 h-4" />,
            'Art': <Paintbrush className="w-4 h-4" />,
            'Fitness': <Dumbbell className="w-4 h-4" />,
            'Reading': <Book className="w-4 h-4" />,
            'Programming': <User className="w-4 h-4" />
        }
        return iconMap[interest] || <Star className="w-4 h-4" />
    }

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                todayViews: prev.todayViews + Math.floor(Math.random() * 2),
                potentialMatches: prev.potentialMatches + Math.floor(Math.random() * 3)
            }))
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    if (!profiles.length) return <div>Loading profiles...</div>

    const currentProfile = getCurrentProfile()

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            {/* Enhanced Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-6 shadow-xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                            <Link href="/curtai" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Target className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Discover & Match</h1>
                                <p className="text-pink-100">AI-Powered Partner Discovery</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-pink-100">Today's Views</div>
                                <div className="text-xl font-bold">{metrics.todayViews}</div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Discovery Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-pink-100 text-sm">New Matches</div>
                                    <div className="text-xl font-bold">{metrics.newMatches}</div>
                                </div>
                                <Heart className="w-6 h-6 text-pink-200" />
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-pink-100 text-sm">Potential Matches</div>
                                    <div className="text-xl font-bold">{metrics.potentialMatches}</div>
                                </div>
                                <Users className="w-6 h-6 text-pink-200" />
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-pink-100 text-sm">AI Recommendations</div>
                                    <div className="text-xl font-bold">{metrics.aiRecommendations}</div>
                                </div>
                                <Sparkles className="w-6 h-6 text-pink-200" />
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-pink-100 text-sm">Profile Progress</div>
                                    <div className="text-xl font-bold">{currentProfileIndex + 1}/{profiles.length}</div>
                                </div>
                                <TrendingUp className="w-6 h-6 text-pink-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* View Mode Controls */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white rounded-lg p-1 shadow-lg">
                            <div className="flex space-x-1">
                                {[
                                    { id: 'cards', icon: <User className="w-4 h-4" />, label: 'Cards' },
                                    { id: 'grid', icon: <Grid className="w-4 h-4" />, label: 'Grid' },
                                    { id: 'list', icon: <List className="w-4 h-4" />, label: 'List' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setViewMode(mode.id as 'cards' | 'grid' | 'list')}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${viewMode === mode.id
                                                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                            }`}
                                    >
                                        {mode.icon}
                                        <span className="text-sm font-medium">{mode.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-white text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors flex items-center space-x-2">
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                        <button className="px-4 py-2 bg-white text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors flex items-center space-x-2">
                            <SortAsc className="w-4 h-4" />
                            <span>Sort</span>
                        </button>
                    </div>
                </div>

                {/* Cards View Mode */}
                {viewMode === 'cards' && (
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md">
                            <AnimatePresence mode="wait">
                                {currentProfile && (
                                    <motion.div
                                        key={currentProfile.id}
                                        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                                    >
                                        {/* Profile Image */}
                                        <div className="relative h-96">
                                            <div
                                                className="w-full h-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center"
                                                style={{
                                                    backgroundImage: `url(${currentProfile.profileImages[currentProfile.currentImageIndex]})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                <User className="w-24 h-24 text-white/30" />
                                            </div>

                                            {/* Image Navigation */}
                                            <button
                                                onClick={() => previousImage(currentProfile)}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => nextImage(currentProfile)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>

                                            {/* Image Indicators */}
                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                {currentProfile.profileImages.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-2 h-2 rounded-full ${index === currentProfile.currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Online Status */}
                                            {currentProfile.isOnline && (
                                                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    <span>Online</span>
                                                </div>
                                            )}

                                            {/* Compatibility Score */}
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompatibilityColor(currentProfile.compatibility)}`}>
                                                    {currentProfile.compatibility}% Match
                                                </span>
                                            </div>

                                            {/* Verification Badge */}
                                            {currentProfile.verified && (
                                                <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                                                    <Shield className="w-3 h-3" />
                                                    <span>Verified</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Profile Information */}
                                        <div className="p-6">
                                            {/* Basic Info */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h2 className="text-2xl font-bold text-gray-900">
                                                        {currentProfile.name}, {currentProfile.age}
                                                    </h2>
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {currentProfile.distance}km away
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm">{currentProfile.occupation}</p>
                                                <p className="text-gray-500 text-xs">{currentProfile.location}</p>
                                            </div>

                                            {/* Bio */}
                                            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                                                {currentProfile.bio}
                                            </p>

                                            {/* Interests */}
                                            <div className="mb-4">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Interests</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {currentProfile.interests.slice(0, 6).map((interest, index) => (
                                                        <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs">
                                                            {getInterestIcon(interest)}
                                                            <span>{interest}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Personality Traits Preview */}
                                            <div className="mb-4">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Personality Match</h3>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {Object.entries(currentProfile.personalityTraits).map(([trait, score]) => (
                                                        <div key={trait} className="text-center">
                                                            <div className={`w-full h-2 rounded-full ${getPersonalityColor(score)}`}></div>
                                                            <span className="text-xs text-gray-500 capitalize">{trait.slice(0, 4)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Mutual Friends */}
                                            {currentProfile.mutualFriends > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">
                                                        {currentProfile.mutualFriends} mutual friend{currentProfile.mutualFriends > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex space-x-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handlePass(currentProfile.id)}
                                                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
                                                >
                                                    <X className="w-5 h-5" />
                                                    <span>Pass</span>
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleLike(currentProfile.id)}
                                                    className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
                                                >
                                                    <Heart className="w-5 h-5" />
                                                    <span>Like</span>
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Controls */}
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={previousProfile}
                                    disabled={currentProfileIndex === 0}
                                    className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        {currentProfileIndex + 1} of {profiles.length}
                                    </p>
                                </div>
                                <button
                                    onClick={nextProfile}
                                    disabled={currentProfileIndex === profiles.length - 1}
                                    className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid View Mode */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200"
                            >
                                <div className="relative h-64">
                                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
                                        <User className="w-16 h-16 text-white/30" />
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCompatibilityColor(profile.compatibility)}`}>
                                            {profile.compatibility}%
                                        </span>
                                    </div>
                                    {profile.verified && (
                                        <div className="absolute top-3 right-3">
                                            <Shield className="w-5 h-5 text-blue-500" />
                                        </div>
                                    )}
                                    {profile.isOnline && (
                                        <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900">{profile.name}, {profile.age}</h3>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {profile.distance}km away
                                    </p>
                                    <p className="text-xs text-gray-600 mt-2">{profile.occupation}</p>
                                    <div className="flex space-x-2 mt-3">
                                        <button
                                            onClick={() => handlePass(profile.id)}
                                            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleLike(profile.id)}
                                            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors flex items-center justify-center"
                                        >
                                            <Heart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* List View Mode */}
                {viewMode === 'list' && (
                    <div className="space-y-4">
                        {profiles.map((profile) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                                            <User className="w-10 h-10 text-white/30" />
                                        </div>
                                        {profile.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 flex items-center">
                                                    {profile.name}, {profile.age}
                                                    {profile.verified && (
                                                        <Shield className="w-4 h-4 text-blue-500 ml-1" />
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {profile.location} • {profile.distance}km away
                                                </p>
                                                <p className="text-xs text-gray-600">{profile.occupation}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(profile.compatibility)}`}>
                                                {profile.compatibility}% Match
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{profile.bio}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex flex-wrap gap-2">
                                                {profile.interests.slice(0, 3).map((interest, index) => (
                                                    <span key={index} className="px-2 py-1 bg-pink-100 text-pink-600 rounded-md text-xs">
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handlePass(profile.id)}
                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleLike(profile.id)}
                                                    className="p-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
                        onClick={() => setShowFilters(false)}
                    >
                        <motion.div
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            className="bg-white w-96 h-full p-6 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                                    </label>
                                    <input
                                        type="range"
                                        min="18"
                                        max="65"
                                        value={filters.ageRange[1]}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            ageRange: [prev.ageRange[0], parseInt(e.target.value)]
                                        }))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Distance: {filters.maxDistance}km
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={filters.maxDistance}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            maxDistance: parseInt(e.target.value)
                                        }))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Compatibility: {filters.minCompatibility}%
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={filters.minCompatibility}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            minCompatibility: parseInt(e.target.value)
                                        }))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.verified}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                verified: e.target.checked
                                            }))}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-700">Verified profiles only</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.onlineOnly}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                onlineOnly: e.target.checked
                                            }))}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-700">Online now only</span>
                                    </label>
                                </div>

                                <button className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors">
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modern Footer */}
            <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Sparkles className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">AI Matching</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Advanced compatibility analysis beyond simple swiping
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Learn More
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Target className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Smart Discovery</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Intelligent recommendations based on personality and preferences
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Start Discovering
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Shield className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Verified Profiles</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Safe and secure dating with verified profiles and privacy protection
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Get Verified
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-8 border-t border-white/20">
                        <p className="text-pink-100">
                            © 2025 CurtAI - AI-Powered Matchmaking Platform. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
