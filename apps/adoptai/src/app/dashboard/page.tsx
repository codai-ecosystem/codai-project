'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Core Pet Adoption Icons
    Heart,
    Dog,
    Cat,
    PawPrint,
    MapPin,
    Star,

    // Metrics and Status Icons
    TrendingUp,
    CheckCircle2,
    Zap,

    // Dashboard Navigation
    Search,
    MessageSquare,
    Bell,

    // Pet Care Icons
    Award
} from 'lucide-react'

// Enhanced Adoption Dashboard Interfaces
interface AdoptionMetrics {
    totalPets: number
    availablePets: number
    matchesToday: number
    adoptionsThisWeek: number
    averageMatchScore: number
    activeApplications: number
    favoritePets: number
    profileViews: number
}

interface MatchedPet {
    id: string
    name: string
    breed: string
    age: string
    type: 'dog' | 'cat' | 'other'
    location: string
    matchScore: number
    image: string
    characteristics: string[]
    shelter: string
    isUrgent: boolean
}

interface RecentActivity {
    id: string
    type: 'match' | 'application' | 'message' | 'favorite'
    title: string
    description: string
    timestamp: string
    petName?: string
    status: 'pending' | 'approved' | 'in_review' | 'completed'
}

export default function AdoptaiDashboard() {
    // Enhanced Adoption Dashboard State
    const [metrics, setMetrics] = useState<AdoptionMetrics>({
        totalPets: 2847,
        availablePets: 1456,
        matchesToday: 12,
        adoptionsThisWeek: 34,
        averageMatchScore: 87.5,
        activeApplications: 3,
        favoritePets: 8,
        profileViews: 247
    })

    // Featured Matched Pets
    const [matchedPets] = useState<MatchedPet[]>([
        {
            id: '1',
            name: 'Luna',
            breed: 'Golden Retriever',
            age: '2 years',
            type: 'dog',
            location: 'Bucharest, Romania',
            matchScore: 94,
            image: '/pets/luna.jpg',
            characteristics: ['Friendly', 'Active', 'Good with kids'],
            shelter: 'Happy Paws Shelter',
            isUrgent: false
        },
        {
            id: '2',
            name: 'Felix',
            breed: 'British Shorthair',
            age: '3 years',
            type: 'cat',
            location: 'Cluj-Napoca, Romania',
            matchScore: 91,
            image: '/pets/felix.jpg',
            characteristics: ['Calm', 'Independent', 'Affectionate'],
            shelter: 'Feline Friends Rescue',
            isUrgent: true
        },
        {
            id: '3',
            name: 'Max',
            breed: 'Labrador Mix',
            age: '4 years',
            type: 'dog',
            location: 'Timișoara, Romania',
            matchScore: 89,
            image: '/pets/max.jpg',
            characteristics: ['Loyal', 'Gentle', 'Well-trained'],
            shelter: 'Second Chance Animal Shelter',
            isUrgent: false
        },
        {
            id: '4',
            name: 'Mia',
            breed: 'Persian',
            age: '1 year',
            type: 'cat',
            location: 'Iași, Romania',
            matchScore: 86,
            image: '/pets/mia.jpg',
            characteristics: ['Playful', 'Cuddly', 'Indoor cat'],
            shelter: 'Loving Paws Foundation',
            isUrgent: false
        }
    ])

    // Recent Activities
    const [recentActivity] = useState<RecentActivity[]>([
        {
            id: '1',
            type: 'match',
            title: 'New Perfect Match!',
            description: 'Luna is a 94% match for your family profile',
            timestamp: '2 hours ago',
            petName: 'Luna',
            status: 'pending'
        },
        {
            id: '2',
            type: 'application',
            title: 'Application Update',
            description: 'Your application for Max is under review',
            timestamp: '1 day ago',
            petName: 'Max',
            status: 'in_review'
        },
        {
            id: '3',
            type: 'message',
            title: 'Message from Shelter',
            description: 'Happy Paws Shelter sent you a message about Luna',
            timestamp: '2 days ago',
            petName: 'Luna',
            status: 'pending'
        },
        {
            id: '4',
            type: 'favorite',
            title: 'Pet Added to Favorites',
            description: 'You favorited Felix from Feline Friends Rescue',
            timestamp: '3 days ago',
            petName: 'Felix',
            status: 'completed'
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                profileViews: prev.profileViews + Math.floor(Math.random() * 3),
                matchesToday: prev.matchesToday + (Math.random() > 0.9 ? 1 : 0),
                averageMatchScore: Math.min(100, Math.max(75, prev.averageMatchScore + (Math.random() - 0.5) * 2))
            }))
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    // Dashboard Summary Cards
    const summaryCards = [
        {
            title: 'Available Pets',
            value: metrics.availablePets.toLocaleString(),
            change: '+142 this week',
            changeType: 'increase' as const,
            icon: PawPrint,
            color: 'blue',
            description: 'Pets ready for adoption'
        },
        {
            title: 'Perfect Matches',
            value: metrics.matchesToday.toString(),
            change: '+5 today',
            changeType: 'increase' as const,
            icon: Heart,
            color: 'red',
            description: 'AI-powered compatibility matches'
        },
        {
            title: 'Match Score',
            value: `${metrics.averageMatchScore.toFixed(1)}%`,
            change: '+2.3% avg',
            changeType: 'increase' as const,
            icon: Star,
            color: 'yellow',
            description: 'Your average compatibility rating'
        },
        {
            title: 'Active Applications',
            value: metrics.activeApplications.toString(),
            change: '2 pending review',
            changeType: 'neutral' as const,
            icon: CheckCircle2,
            color: 'green',
            description: 'Adoption applications in process'
        }
    ]

    // Quick Actions for Pet Adoption
    const quickActions = [
        {
            title: 'Find Pets',
            description: 'Browse available pets near you',
            icon: Search,
            color: 'blue',
            route: '/discovery'
        },
        {
            title: 'AI Matching',
            description: 'Get personalized pet recommendations',
            icon: Zap,
            color: 'purple'
        },
        {
            title: 'My Applications',
            description: 'Track adoption applications',
            icon: CheckCircle2,
            color: 'green',
            badge: metrics.activeApplications
        },
        {
            title: 'Favorites',
            description: 'View your favorite pets',
            icon: Heart,
            color: 'red',
            badge: metrics.favoritePets
        },
        {
            title: 'Messages',
            description: 'Chat with shelters',
            icon: MessageSquare,
            color: 'indigo'
        },
        {
            title: 'Pet Care Guide',
            description: 'Learn about pet care',
            icon: Award,
            color: 'emerald'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Enhanced Header with Pet Adoption Focus */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl mx-6 mt-6 p-8 text-white shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Heart className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">ADOPTAI Dashboard</h1>
                            <p className="text-blue-100 text-lg">AI-Powered Pet Adoption Platform</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Profile Views</p>
                            <p className="text-2xl font-bold">{metrics.profileViews}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">This Week Adoptions</p>
                            <p className="text-2xl font-bold">{metrics.adoptionsThisWeek}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 p-3 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Adoption Progress Indicator */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Your Adoption Journey</span>
                        <span className="text-sm text-blue-200">Step 3 of 5</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full w-3/5"></div>
                    </div>
                    <p className="text-xs text-blue-200 mt-2">Complete your profile to improve matches</p>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {summaryCards.map((card, index) => {
                    const IconComponent = card.icon
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                                    <IconComponent className={`h-6 w-6 text-${card.color}-600`} />
                                </div>
                                <div className={`flex items-center space-x-1 text-sm ${card.changeType === 'increase' ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {card.changeType === 'increase' && <TrendingUp className="h-4 w-4" />}
                                    <span className="font-medium">{card.change}</span>
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                            <p className="text-xs text-gray-600">{card.description}</p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

                {/* Perfect Matches Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                                <Heart className="h-6 w-6 text-red-500" />
                                <span>Perfect Matches for You</span>
                            </h2>
                            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {matchedPets.map((pet, index) => (
                                <motion.div
                                    key={pet.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 relative"
                                >
                                    {pet.isUrgent && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                            Urgent
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                {pet.type === 'dog' ? (
                                                    <Dog className="h-8 w-8 text-blue-600" />
                                                ) : pet.type === 'cat' ? (
                                                    <Cat className="h-8 w-8 text-purple-600" />
                                                ) : (
                                                    <PawPrint className="h-8 w-8 text-green-600" />
                                                )}
                                            </div>
                                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                {pet.matchScore}%
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                                            <p className="text-sm text-gray-600">{pet.breed}, {pet.age}</p>
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <MapPin className="h-3 w-3" />
                                                <span>{pet.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {pet.characteristics.map((trait, i) => (
                                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {trait}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{pet.shelter}</span>
                                        <div className="flex space-x-2">
                                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Heart className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <MessageSquare className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon
                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-colors text-center relative"
                                    >
                                        {action.badge && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                {action.badge}
                                            </span>
                                        )}
                                        <IconComponent className={`h-6 w-6 text-${action.color}-600 mx-auto mb-2`} />
                                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className={`p-2 rounded-lg ${activity.type === 'match' ? 'bg-red-100' :
                                            activity.type === 'application' ? 'bg-green-100' :
                                                activity.type === 'message' ? 'bg-blue-100' :
                                                    'bg-purple-100'
                                        }`}>
                                        {activity.type === 'match' && <Heart className="h-4 w-4 text-red-600" />}
                                        {activity.type === 'application' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                        {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                                        {activity.type === 'favorite' && <Star className="h-4 w-4 text-purple-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                        <p className="text-xs text-gray-600">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
