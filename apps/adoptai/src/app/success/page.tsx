'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Navigation and Action Icons
    ArrowLeft,
    ArrowRight,
    Share2,
    Heart,
    MessageSquare,
    Calendar,
    Play,
    Pause,

    // Success and Achievement Icons
    Star,
    Award,
    Trophy,
    Medal,
    Crown,
    Sparkles,
    CheckCircle2,
    HeartHandshake,

    // Pet and Family Icons
    Dog,
    Cat,
    PawPrint,
    Users,
    User,
    Baby,
    Home,

    // Media and Content Icons
    Camera,
    Video,
    Image,
    PlayCircle,
    Quote,
    BookOpen,
    FileText,

    // Interaction Icons
    ThumbsUp,
    MessageCircle,
    Send,
    Plus,
    Edit3,
    Flag,

    // Time and Date Icons
    Clock,
    MapPin,
    Globe,
    Zap,

    // Social Icons
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    Link2
} from 'lucide-react'

// Success Stories Interfaces
interface AdoptionStory {
    id: string
    title: string
    petName: string
    petBreed: string
    petSpecies: 'dog' | 'cat' | 'other'
    adopter: {
        name: string
        location: string
        family: {
            adults: number
            children: number
            otherPets: number
        }
    }
    adoptionDate: Date
    story: string
    highlights: string[]
    challenges?: string[]
    outcome: string
    photos: Array<{
        id: string
        url: string
        caption?: string
        beforeAdoption: boolean
        featured: boolean
    }>
    video?: {
        url: string
        thumbnail: string
        duration: number
        title: string
    }
    updates: Array<{
        date: Date
        update: string
        photos?: string[]
    }>
    metrics: {
        happinessScore: number
        healthImprovement: number
        behaviorImprovement: number
        familyBonding: number
    }
    tags: string[]
    featured: boolean
    verified: boolean
    shelter: string
}

interface ImpactMetrics {
    totalAdoptions: number
    adoptionRate: number
    returnRate: number
    averageAdoptionTime: number
    successStories: number
    happyFamilies: number
    petsSaved: number
    volunteersEngaged: number
}

interface TestimonialVideo {
    id: string
    title: string
    thumbnail: string
    duration: number
    adopter: string
    petName: string
    views: number
    featured: boolean
}

export default function SuccessStoriesPage() {
    // State Management
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'dogs' | 'cats' | 'special-needs' | 'seniors'>('all')
    const [selectedStory, setSelectedStory] = useState<string | null>(null)
    const [showVideoModal, setShowVideoModal] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<TestimonialVideo | null>(null)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [showSubmissionForm, setShowSubmissionForm] = useState(false)
    const [activeView, setActiveView] = useState<'stories' | 'metrics' | 'testimonials'>('stories')

    // Sample Success Stories Data
    const successStories: AdoptionStory[] = [
        {
            id: '1',
            title: 'From Shelter to Family Guardian',
            petName: 'Max',
            petBreed: 'German Shepherd Mix',
            petSpecies: 'dog',
            adopter: {
                name: 'Familia Popescu',
                location: 'București, România',
                family: {
                    adults: 2,
                    children: 2,
                    otherPets: 0
                }
            },
            adoptionDate: new Date('2024-12-15'),
            story: 'Max came to us as a scared, underweight dog who had been abandoned. The Popescu family saw past his rough exterior and gave him the love he desperately needed. Within months, Max transformed into a confident, protective family dog who absolutely adores the children. He now serves as both a beloved pet and a gentle guardian for the family.',
            highlights: [
                'Gained 15kg of healthy weight',
                'Became protective of family children',
                'Learned 15+ commands in Romanian and English',
                'Overcame severe separation anxiety',
                'Now certified as a therapy dog'
            ],
            challenges: [
                'Initial fear of men due to past trauma',
                'Resource guarding behavior with food',
                'Severe separation anxiety'
            ],
            outcome: 'Max is now a confident, healthy dog who brings immense joy to his family. He has even started visiting local schools as a therapy dog, helping children learn about responsible pet ownership.',
            photos: [
                {
                    id: 'p1',
                    url: '/placeholder-max-before.jpg',
                    caption: 'Max when he first arrived at the shelter',
                    beforeAdoption: true,
                    featured: false
                },
                {
                    id: 'p2',
                    url: '/placeholder-max-family.jpg',
                    caption: 'Max with his new family',
                    beforeAdoption: false,
                    featured: true
                },
                {
                    id: 'p3',
                    url: '/placeholder-max-therapy.jpg',
                    caption: 'Max working as a therapy dog',
                    beforeAdoption: false,
                    featured: false
                }
            ],
            video: {
                url: '/placeholder-max-video.mp4',
                thumbnail: '/placeholder-max-video-thumb.jpg',
                duration: 120,
                title: 'Max\'s Transformation Journey'
            },
            updates: [
                {
                    date: new Date('2025-06-01'),
                    update: 'Max completed his therapy dog certification and had his first school visit!',
                    photos: ['/placeholder-max-cert.jpg']
                },
                {
                    date: new Date('2025-03-15'),
                    update: 'Max celebrated his first birthday with his forever family. He\'s grown so much!',
                    photos: ['/placeholder-max-birthday.jpg']
                }
            ],
            metrics: {
                happinessScore: 98,
                healthImprovement: 95,
                behaviorImprovement: 92,
                familyBonding: 100
            },
            tags: ['transformation', 'therapy-dog', 'family-guardian', 'special-needs'],
            featured: true,
            verified: true,
            shelter: 'Bucharest Animal Rescue'
        },
        {
            id: '2',
            title: 'Senior Cat Finds Perfect Retirement Home',
            petName: 'Whiskers',
            petBreed: 'Persian Mix',
            petSpecies: 'cat',
            adopter: {
                name: 'Elena Georgescu',
                location: 'Cluj-Napoca, România',
                family: {
                    adults: 1,
                    children: 0,
                    otherPets: 1
                }
            },
            adoptionDate: new Date('2025-01-20'),
            story: 'Whiskers, a 12-year-old Persian mix, was surrendered when his elderly owner moved to assisted living. Many people overlooked him due to his age, but Elena saw the perfect companion. Whiskers brought calm and comfort to Elena\'s life, proving that senior pets make wonderful companions.',
            highlights: [
                'Provided emotional support during Elena\'s recovery from surgery',
                'Became best friends with Elena\'s other cat, Luna',
                'Maintained excellent health with proper senior care',
                'Brings daily joy and routine to Elena\'s life'
            ],
            outcome: 'Whiskers has found his perfect retirement home where he\'s spoiled with love, proper medical care, and a warm sunny spot by the window. He and Elena are inseparable.',
            photos: [
                {
                    id: 'p4',
                    url: '/placeholder-whiskers-shelter.jpg',
                    caption: 'Whiskers waiting for adoption',
                    beforeAdoption: true,
                    featured: false
                },
                {
                    id: 'p5',
                    url: '/placeholder-whiskers-home.jpg',
                    caption: 'Whiskers in his favorite sunny spot',
                    beforeAdoption: false,
                    featured: true
                }
            ],
            updates: [
                {
                    date: new Date('2025-07-01'),
                    update: 'Whiskers just had his 6-month checkup and the vet says he\'s thriving! His coat is shinier than ever.',
                }
            ],
            metrics: {
                happinessScore: 95,
                healthImprovement: 88,
                behaviorImprovement: 90,
                familyBonding: 98
            },
            tags: ['senior-pet', 'emotional-support', 'perfect-match'],
            featured: true,
            verified: true,
            shelter: 'Cluj Animal Sanctuary'
        },
        {
            id: '3',
            title: 'Special Needs Pup Becomes Adventure Buddy',
            petName: 'Buddy',
            petBreed: 'Border Collie Mix',
            petSpecies: 'dog',
            adopter: {
                name: 'Andrei și Cristina Dumitrescu',
                location: 'Brașov, România',
                family: {
                    adults: 2,
                    children: 1,
                    otherPets: 0
                }
            },
            adoptionDate: new Date('2024-10-05'),
            story: 'Buddy was born with a missing front leg, but that never slowed him down. The Dumitrescu family, avid hikers, saw his spirit and knew he\'d be perfect for their adventures. Buddy now joins them on mountain hikes and has become an inspiration to many.',
            highlights: [
                'Completed multiple mountain hikes in the Carpathians',
                'Became a social media sensation for adaptive pets',
                'Inspired other families to adopt special needs pets',
                'Learned to use adaptive equipment for longer hikes'
            ],
            outcome: 'Buddy proves daily that disabilities don\'t define limitations. He\'s living his best life exploring Romania\'s beautiful landscapes with his adventure-loving family.',
            photos: [
                {
                    id: 'p6',
                    url: '/placeholder-buddy-hike.jpg',
                    caption: 'Buddy conquering mountain trails',
                    beforeAdoption: false,
                    featured: true
                }
            ],
            updates: [
                {
                    date: new Date('2025-08-01'),
                    update: 'Buddy just completed his biggest hike yet - reaching the peak of Omu! He\'s such an inspiration.',
                }
            ],
            metrics: {
                happinessScore: 100,
                healthImprovement: 92,
                behaviorImprovement: 95,
                familyBonding: 100
            },
            tags: ['special-needs', 'adventure', 'inspiration', 'three-legged'],
            featured: true,
            verified: true,
            shelter: 'Brașov Pet Rescue'
        }
    ]

    // Sample Impact Metrics
    const impactMetrics: ImpactMetrics = {
        totalAdoptions: 1247,
        adoptionRate: 89,
        returnRate: 3.2,
        averageAdoptionTime: 28,
        successStories: 342,
        happyFamilies: 1189,
        petsSaved: 2456,
        volunteersEngaged: 156
    }

    // Sample Testimonial Videos
    const testimonialVideos: TestimonialVideo[] = [
        {
            id: 'v1',
            title: 'Max\'s First Year - A Transformation Story',
            thumbnail: '/placeholder-video-thumb-max.jpg',
            duration: 180,
            adopter: 'Familia Popescu',
            petName: 'Max',
            views: 15420,
            featured: true
        },
        {
            id: 'v2',
            title: 'Senior Pet Adoption: Whiskers\' Golden Years',
            thumbnail: '/placeholder-video-thumb-whiskers.jpg',
            duration: 120,
            adopter: 'Elena Georgescu',
            petName: 'Whiskers',
            views: 8930,
            featured: true
        },
        {
            id: 'v3',
            title: 'Three-Legged Buddy Conquers Mountains',
            thumbnail: '/placeholder-video-thumb-buddy.jpg',
            duration: 240,
            adopter: 'Andrei și Cristina Dumitrescu',
            petName: 'Buddy',
            views: 23650,
            featured: true
        }
    ]

    // Filter stories by category
    const filteredStories = successStories.filter(story => {
        if (selectedCategory === 'all') return true
        if (selectedCategory === 'dogs') return story.petSpecies === 'dog'
        if (selectedCategory === 'cats') return story.petSpecies === 'cat'
        if (selectedCategory === 'special-needs') return story.tags.includes('special-needs')
        if (selectedCategory === 'seniors') return story.tags.includes('senior-pet')
        return true
    })

    // Get story details
    const selectedStoryData = selectedStory ? successStories.find(s => s.id === selectedStory) : null

    // Handle video modal
    const openVideoModal = (video: TestimonialVideo) => {
        setSelectedVideo(video)
        setShowVideoModal(true)
    }

    // Format duration
    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // Get metric color
    const getMetricColor = (value: number) => {
        if (value >= 95) return 'text-green-600'
        if (value >= 85) return 'text-blue-600'
        if (value >= 75) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Success Stories</h1>
                            <p className="text-blue-100 text-lg">Celebrating the joy of successful pet adoptions</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-200">Happy Families</p>
                            <p className="text-3xl font-bold">{impactMetrics.happyFamilies.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex space-x-8">
                        {[
                            { id: 'stories', label: 'Success Stories', icon: Heart },
                            { id: 'metrics', label: 'Impact Metrics', icon: Trophy },
                            { id: 'testimonials', label: 'Video Testimonials', icon: PlayCircle }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id as any)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${activeView === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    {activeView === 'stories' && (
                        <motion.div
                            key="stories"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Category Filter */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Browse Stories by Category</h2>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { id: 'all', label: 'All Stories', count: successStories.length },
                                        { id: 'dogs', label: 'Dog Adoptions', count: successStories.filter(s => s.petSpecies === 'dog').length },
                                        { id: 'cats', label: 'Cat Adoptions', count: successStories.filter(s => s.petSpecies === 'cat').length },
                                        { id: 'special-needs', label: 'Special Needs', count: successStories.filter(s => s.tags.includes('special-needs')).length },
                                        { id: 'seniors', label: 'Senior Pets', count: successStories.filter(s => s.tags.includes('senior-pet')).length }
                                    ].map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id as any)}
                                            className={`px-4 py-2 rounded-lg border transition-colors ${selectedCategory === category.id
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {category.label} ({category.count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Story */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Crown className="h-6 w-6 text-yellow-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Featured Success Story</h2>
                                </div>

                                {filteredStories.filter(s => s.featured)[0] && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div>
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                    {filteredStories[0].petSpecies === 'dog' ? (
                                                        <Dog className="h-8 w-8 text-blue-600" />
                                                    ) : (
                                                        <Cat className="h-8 w-8 text-purple-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{filteredStories[0].title}</h3>
                                                    <p className="text-gray-600">{filteredStories[0].petName} • {filteredStories[0].petBreed}</p>
                                                    <p className="text-sm text-gray-500">{filteredStories[0].adopter.name} • {filteredStories[0].adopter.location}</p>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 leading-relaxed mb-4">{filteredStories[0].story}</p>

                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">
                                                        Adopted {filteredStories[0].adoptionDate.toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">{filteredStories[0].shelter}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {filteredStories[0].tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setSelectedStory(filteredStories[0].id)}
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                                            >
                                                Read Full Story
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {filteredStories[0].photos.slice(0, 4).map((photo) => (
                                                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.caption}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {photo.beforeAdoption && (
                                                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                                            Before
                                                        </div>
                                                    )}
                                                    {photo.featured && !photo.beforeAdoption && (
                                                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                                                            After
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* All Stories Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStories.map((story) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                        onClick={() => setSelectedStory(story.id)}
                                    >
                                        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                                            <img
                                                src={story.photos.find(p => p.featured)?.url || story.photos[0]?.url}
                                                alt={story.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {story.verified && (
                                                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                {story.petSpecies === 'dog' ? (
                                                    <Dog className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <Cat className="h-5 w-5 text-purple-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{story.petName}</h3>
                                                <p className="text-sm text-gray-600">{story.petBreed}</p>
                                            </div>
                                        </div>

                                        <h4 className="font-semibold text-gray-900 mb-2">{story.title}</h4>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{story.story}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${star <= Math.round(story.metrics.happinessScore / 20)
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {Math.floor((Date.now() - story.adoptionDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Call to Action */}
                            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-8 mt-8 text-white text-center">
                                <h2 className="text-2xl font-bold mb-4">Share Your Success Story</h2>
                                <p className="text-blue-100 mb-6">
                                    Has one of our pets brought joy to your family? We'd love to hear your story and celebrate your success!
                                </p>
                                <button
                                    onClick={() => setShowSubmissionForm(true)}
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                >
                                    Submit Your Story
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'metrics' && (
                        <motion.div
                            key="metrics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Adoptions', value: impactMetrics.totalAdoptions, icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
                                    { label: 'Success Rate', value: `${impactMetrics.adoptionRate}%`, icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
                                    { label: 'Happy Families', value: impactMetrics.happyFamilies, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
                                    { label: 'Lives Saved', value: impactMetrics.petsSaved, icon: Award, color: 'text-green-600', bgColor: 'bg-green-100' }
                                ].map((metric, index) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg text-center"
                                    >
                                        <div className={`w-16 h-16 ${metric.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                            <metric.icon className={`h-8 w-8 ${metric.color}`} />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">
                                            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                                        </div>
                                        <div className="text-gray-600">{metric.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Detailed Analytics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Adoption Insights</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Average Adoption Time</span>
                                            <span className="font-medium">{impactMetrics.averageAdoptionTime} days</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Return Rate</span>
                                            <span className="font-medium text-green-600">{impactMetrics.returnRate}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Success Stories Shared</span>
                                            <span className="font-medium">{impactMetrics.successStories}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Active Volunteers</span>
                                            <span className="font-medium">{impactMetrics.volunteersEngaged}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Success Metrics Distribution</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Happiness Score', value: 95, color: 'bg-yellow-500' },
                                            { label: 'Health Improvement', value: 89, color: 'bg-green-500' },
                                            { label: 'Behavior Progress', value: 91, color: 'bg-blue-500' },
                                            { label: 'Family Bonding', value: 97, color: 'bg-purple-500' }
                                        ].map((metric) => (
                                            <div key={metric.label}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                                                    <span className={`text-sm font-medium ${getMetricColor(metric.value)}`}>
                                                        {metric.value}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        className={`h-2 rounded-full ${metric.color}`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${metric.value}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'testimonials' && (
                        <motion.div
                            key="testimonials"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {testimonialVideos.map((video) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <div
                                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer mb-4"
                                            onClick={() => openVideoModal(video)}
                                        >
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center hover:bg-opacity-20 transition-all">
                                                <PlayCircle className="h-16 w-16 text-white" />
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                                {formatDuration(video.duration)}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {video.adopter} shares the story of {video.petName}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1">
                                                <PlayCircle className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{video.views.toLocaleString()} views</span>
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                Watch Story
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {showVideoModal && selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                        onClick={() => setShowVideoModal(false)}
                    >
                        <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-black rounded-lg overflow-hidden">
                                <video
                                    className="w-full h-auto"
                                    controls
                                    autoPlay
                                    poster={selectedVideo.thumbnail}
                                >
                                    <source src="/placeholder-video.mp4" type="video/mp4" />
                                </video>
                            </div>

                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                                <h3 className="font-bold mb-2">{selectedVideo.title}</h3>
                                <p className="text-sm">{selectedVideo.adopter} • {selectedVideo.views.toLocaleString()} views</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Add the missing X import at the top
const X = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
