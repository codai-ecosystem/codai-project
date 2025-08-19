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
    Phone,
    Mail,

    // Pet Information Icons
    Dog,
    Cat,
    PawPrint,
    Award,
    Shield,
    Activity,
    Clock,
    MapPin,

    // Health and Care Icons
    Stethoscope,
    Syringe,
    Pill,
    HeartHandshake,
    Thermometer,
    Eye,

    // Personality and Traits Icons
    Smile,
    Zap,
    Users,
    Home,
    Play,
    Star,
    Sun,
    Moon,

    // Media and Gallery Icons
    Camera,
    Video,
    Image,
    PlayCircle,
    Download,
    Maximize2,

    // Information and Details Icons
    Info,
    FileText,
    CheckCircle2,
    AlertCircle,
    Bookmark,
    Flag,
    Edit3,
    X,

    // Social and Interaction Icons
    ThumbsUp,
    MessageCircle,
    UserPlus,
    Gift,
    Sparkles
} from 'lucide-react'

// Pet Profile Interfaces
interface PetPhoto {
    id: string
    url: string
    caption?: string
    isMain: boolean
    uploadDate: Date
    photographer?: string
}

interface PetVideo {
    id: string
    url: string
    thumbnail: string
    title: string
    duration: number
    description?: string
    uploadDate: Date
}

interface HealthRecord {
    id: string
    type: 'vaccination' | 'checkup' | 'medication' | 'surgery' | 'treatment'
    title: string
    date: Date
    veterinarian: string
    clinic: string
    notes: string
    documents?: string[]
    nextDue?: Date
}

interface BehaviorAssessment {
    category: string
    rating: number // 1-5 scale
    notes: string
    assessedBy: string
    assessmentDate: Date
}

interface AdoptionHistory {
    id: string
    status: 'available' | 'pending' | 'adopted' | 'returned' | 'hold'
    date: Date
    notes?: string
    adopter?: {
        name: string
        contact: string
    }
    reason?: string
}

interface ShelterInfo {
    id: string
    name: string
    address: string
    phone: string
    email: string
    website?: string
    contactPerson: string
    operatingHours: string
    specialPrograms: string[]
}

interface DetailedPetProfile {
    // Basic Information
    id: string
    name: string
    species: 'dog' | 'cat' | 'other'
    breed: string
    mixBreed?: string[]
    age: {
        years: number
        months: number
    }
    birthDate?: Date
    gender: 'male' | 'female'
    size: 'small' | 'medium' | 'large' | 'extra-large'
    weight: number
    color: string[]

    // Physical Characteristics
    physicalTraits: {
        eyeColor: string
        coatType: string
        coatLength: string
        distinctiveMarks: string[]
        microchipped: boolean
        microchipId?: string
        spayedNeutered: boolean
    }

    // Health Information
    healthStatus: {
        overall: 'excellent' | 'good' | 'fair' | 'needs_attention'
        vaccinations: {
            upToDate: boolean
            lastUpdated: Date
            nextDue?: Date
        }
        healthIssues: string[]
        medications: Array<{
            name: string
            dosage: string
            frequency: string
            reason: string
        }>
        allergies: string[]
        specialNeeds: string[]
    }

    // Personality & Behavior
    personality: {
        energyLevel: number // 1-5
        socialability: number // 1-5
        trainability: number // 1-5
        independence: number // 1-5
        playfulness: number // 1-5
        affection: number // 1-5
        protectiveness: number // 1-5
        adaptability: number // 1-5
    }

    // Compatibility
    compatibility: {
        goodWithKids: boolean
        kidAgeRange?: string
        goodWithDogs: boolean
        goodWithCats: boolean
        goodWithSmallAnimals: boolean
        apartmentFriendly: boolean
        requiresYard: boolean
        exerciseNeeds: 'low' | 'medium' | 'high'
        groomingNeeds: 'low' | 'medium' | 'high'
    }

    // Shelter Information
    shelterInfo: ShelterInfo
    arrivalDate: Date
    adoptionFee: number
    sponsorshipAvailable: boolean

    // Media
    photos: PetPhoto[]
    videos: PetVideo[]

    // Records
    healthRecords: HealthRecord[]
    behaviorAssessments: BehaviorAssessment[]
    adoptionHistory: AdoptionHistory[]

    // Story & Background
    story: string
    background?: string
    specialStory?: string
    favoriteToys: string[]
    favoriteActivities: string[]
    quirks: string[]

    // Adoption Information
    adoptionRequirements: string[]
    idealFamily: string
    notSuitableFor: string[]

    // Engagement
    viewCount: number
    favoriteCount: number
    inquiryCount: number
    shareCount: number
    lastUpdated: Date
}

export default function PetProfilesPage() {
    // Profile State
    const [selectedPet, setSelectedPet] = useState<string>('1')
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'behavior' | 'media' | 'history'>('overview')
    const [showGallery, setShowGallery] = useState(false)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
    const [isFavorited, setIsFavorited] = useState(false)
    const [showContactForm, setShowContactForm] = useState(false)

    // Sample Pet Profiles Data
    const petProfiles: DetailedPetProfile[] = [
        {
            id: '1',
            name: 'Luna',
            species: 'dog',
            breed: 'Golden Retriever',
            age: { years: 3, months: 6 },
            birthDate: new Date('2021-02-15'),
            gender: 'female',
            size: 'large',
            weight: 28,
            color: ['golden', 'cream'],

            physicalTraits: {
                eyeColor: 'brown',
                coatType: 'double-coat',
                coatLength: 'medium',
                distinctiveMarks: ['white chest patch', 'black nose'],
                microchipped: true,
                microchipId: 'RO123456789',
                spayedNeutered: true
            },

            healthStatus: {
                overall: 'excellent',
                vaccinations: {
                    upToDate: true,
                    lastUpdated: new Date('2025-06-15'),
                    nextDue: new Date('2026-06-15')
                },
                healthIssues: [],
                medications: [],
                allergies: [],
                specialNeeds: []
            },

            personality: {
                energyLevel: 4,
                socialability: 5,
                trainability: 5,
                independence: 3,
                playfulness: 4,
                affection: 5,
                protectiveness: 3,
                adaptability: 4
            },

            compatibility: {
                goodWithKids: true,
                kidAgeRange: 'all ages',
                goodWithDogs: true,
                goodWithCats: true,
                goodWithSmallAnimals: true,
                apartmentFriendly: false,
                requiresYard: true,
                exerciseNeeds: 'high',
                groomingNeeds: 'medium'
            },

            shelterInfo: {
                id: 'shelter1',
                name: 'Bucharest Animal Rescue',
                address: 'Str. Animalelor 123, București',
                phone: '+40 21 123 4567',
                email: 'adopt@bucurestirescue.ro',
                contactPerson: 'Maria Ionescu',
                operatingHours: 'Luni-Vineri: 9-17, Sâmbătă: 10-16',
                specialPrograms: ['Senior adoption discounts', 'Foster-to-adopt', 'Pet therapy visits']
            },

            arrivalDate: new Date('2025-01-15'),
            adoptionFee: 350,
            sponsorshipAvailable: true,

            photos: [
                {
                    id: 'p1',
                    url: '/placeholder-golden-1.jpg',
                    caption: 'Luna playing in the yard',
                    isMain: true,
                    uploadDate: new Date('2025-08-01')
                },
                {
                    id: 'p2',
                    url: '/placeholder-golden-2.jpg',
                    caption: 'Luna with her favorite toy',
                    isMain: false,
                    uploadDate: new Date('2025-08-01')
                },
                {
                    id: 'p3',
                    url: '/placeholder-golden-3.jpg',
                    caption: 'Luna during training session',
                    isMain: false,
                    uploadDate: new Date('2025-08-01')
                }
            ],

            videos: [
                {
                    id: 'v1',
                    url: '/placeholder-video-1.mp4',
                    thumbnail: '/placeholder-video-thumb-1.jpg',
                    title: 'Luna playing fetch',
                    duration: 45,
                    description: 'Watch Luna show off her fetching skills!',
                    uploadDate: new Date('2025-08-01')
                }
            ],

            healthRecords: [
                {
                    id: 'h1',
                    type: 'vaccination',
                    title: 'Annual Vaccination',
                    date: new Date('2025-06-15'),
                    veterinarian: 'Dr. Ana Popescu',
                    clinic: 'Clinica Veterinară Central',
                    notes: 'Full vaccination panel completed. Pet in excellent health.',
                    nextDue: new Date('2026-06-15')
                },
                {
                    id: 'h2',
                    type: 'checkup',
                    title: 'Health Check & Spaying',
                    date: new Date('2025-01-20'),
                    veterinarian: 'Dr. Mihai Georgescu',
                    clinic: 'Bucharest Animal Hospital',
                    notes: 'Spaying procedure completed successfully. Full recovery expected in 2 weeks.'
                }
            ],

            behaviorAssessments: [
                {
                    category: 'Social Interaction',
                    rating: 5,
                    notes: 'Excellent with people and other dogs. Very friendly and outgoing.',
                    assessedBy: 'Trainer Sarah Johnson',
                    assessmentDate: new Date('2025-07-15')
                },
                {
                    category: 'Training Response',
                    rating: 5,
                    notes: 'Quick learner, responds well to positive reinforcement.',
                    assessedBy: 'Trainer Sarah Johnson',
                    assessmentDate: new Date('2025-07-15')
                }
            ],

            adoptionHistory: [
                {
                    id: 'ah1',
                    status: 'available',
                    date: new Date('2025-08-01'),
                    notes: 'Ready for adoption after completing health and behavior assessments'
                }
            ],

            story: 'Luna came to us after her elderly owner could no longer care for her. She is a gentle, loving dog who has been well-cared for and trained. Luna loves playing fetch, going for walks, and cuddling on the couch. She would make an excellent family pet and is especially good with children.',

            background: 'Luna was surrendered by her owner due to health issues that prevented proper care. She has lived in a home environment and is fully house-trained.',

            favoriteToys: ['Tennis balls', 'Rope toys', 'Stuffed animals'],
            favoriteActivities: ['Playing fetch', 'Swimming', 'Long walks', 'Cuddling'],
            quirks: ['Tilts head when confused', 'Brings her food bowl when hungry', 'Loves to carry sticks'],

            adoptionRequirements: [
                'Fenced yard required',
                'Experience with large dogs preferred',
                'Time for daily exercise and training',
                'Commitment to regular grooming'
            ],

            idealFamily: 'An active family with children who can provide plenty of exercise and attention. Luna would thrive in a home with a yard where she can play and explore.',

            notSuitableFor: ['Apartment living', 'Families with very young children under 3', 'First-time dog owners'],

            viewCount: 1247,
            favoriteCount: 89,
            inquiryCount: 23,
            shareCount: 45,
            lastUpdated: new Date('2025-08-08')
        }
    ]

    const currentPet = petProfiles.find(pet => pet.id === selectedPet) || petProfiles[0]

    // Handle photo gallery
    const openGallery = (photoIndex: number) => {
        setSelectedPhotoIndex(photoIndex)
        setShowGallery(true)
    }

    const nextPhoto = () => {
        setSelectedPhotoIndex((prev) =>
            prev < currentPet.photos.length - 1 ? prev + 1 : 0
        )
    }

    const prevPhoto = () => {
        setSelectedPhotoIndex((prev) =>
            prev > 0 ? prev - 1 : currentPet.photos.length - 1
        )
    }

    // Get personality bar color
    const getPersonalityColor = (value: number) => {
        if (value >= 4) return 'bg-green-500'
        if (value >= 3) return 'bg-blue-500'
        if (value >= 2) return 'bg-yellow-500'
        return 'bg-gray-400'
    }

    // Format age
    const formatAge = (age: { years: number; months: number }) => {
        if (age.years === 0) return `${age.months} months`
        if (age.months === 0) return `${age.years} year${age.years > 1 ? 's' : ''}`
        return `${age.years} year${age.years > 1 ? 's' : ''}, ${age.months} month${age.months > 1 ? 's' : ''}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Pet Profiles</h1>
                            <p className="text-blue-100 text-lg">Detailed information about pets available for adoption</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-200">Total Views</p>
                            <p className="text-3xl font-bold">{currentPet.viewCount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Profile Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Pet Header Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <img
                                            src={currentPet.photos[0]?.url || '/placeholder-pet.jpg'}
                                            alt={currentPet.name}
                                            className="w-24 h-24 rounded-full object-cover cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                                            onClick={() => openGallery(0)}
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full">
                                            {currentPet.species === 'dog' ? <Dog className="h-4 w-4" /> : <Cat className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentPet.name}</h2>
                                        <div className="flex items-center space-x-4 text-gray-600 mb-2">
                                            <span className="flex items-center space-x-1">
                                                <PawPrint className="h-4 w-4" />
                                                <span>{currentPet.breed}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatAge(currentPet.age)}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{currentPet.shelterInfo.name}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                Available for Adoption
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                {currentPet.size} • {currentPet.gender}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setIsFavorited(!isFavorited)}
                                        className={`p-3 rounded-lg transition-colors ${isFavorited
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowContactForm(true)}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        Inquire About {currentPet.name}
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{currentPet.favoriteCount}</div>
                                    <div className="text-sm text-gray-500">Favorites</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{currentPet.inquiryCount}</div>
                                    <div className="text-sm text-gray-500">Inquiries</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{currentPet.shareCount}</div>
                                    <div className="text-sm text-gray-500">Shares</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{currentPet.adoptionFee} RON</div>
                                    <div className="text-sm text-gray-500">Adoption Fee</div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="bg-white rounded-2xl shadow-lg">
                            <div className="border-b border-gray-100">
                                <div className="flex space-x-8 px-6">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: Info },
                                        { id: 'health', label: 'Health Records', icon: Stethoscope },
                                        { id: 'behavior', label: 'Personality & Behavior', icon: Smile },
                                        { id: 'media', label: 'Photos & Videos', icon: Camera },
                                        { id: 'history', label: 'History', icon: FileText }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${activeTab === tab.id
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

                            {/* Tab Content */}
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'overview' && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Story */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-3">Luna's Story</h3>
                                                <p className="text-gray-700 leading-relaxed">{currentPet.story}</p>
                                                {currentPet.background && (
                                                    <p className="text-gray-600 mt-3 text-sm">{currentPet.background}</p>
                                                )}
                                            </div>

                                            {/* Personality Traits */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Personality Traits</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {Object.entries(currentPet.personality).map(([trait, value]) => (
                                                        <div key={trait} className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                                {trait.replace(/([A-Z])/g, ' $1').trim()}
                                                            </span>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full ${getPersonalityColor(value)}`}
                                                                        style={{ width: `${(value / 5) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm text-gray-600 w-6">{value}/5</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Compatibility */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Compatibility</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        {[
                                                            { label: 'Good with Kids', value: currentPet.compatibility.goodWithKids },
                                                            { label: 'Good with Dogs', value: currentPet.compatibility.goodWithDogs },
                                                            { label: 'Good with Cats', value: currentPet.compatibility.goodWithCats },
                                                            { label: 'Apartment Friendly', value: currentPet.compatibility.apartmentFriendly }
                                                        ].map((item) => (
                                                            <div key={item.label} className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-700">{item.label}</span>
                                                                {item.value ? (
                                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700">Exercise Needs</span>
                                                            <span className="text-sm font-medium text-blue-600 capitalize">
                                                                {currentPet.compatibility.exerciseNeeds}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700">Grooming Needs</span>
                                                            <span className="text-sm font-medium text-purple-600 capitalize">
                                                                {currentPet.compatibility.groomingNeeds}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700">Size</span>
                                                            <span className="text-sm font-medium text-green-600 capitalize">
                                                                {currentPet.size} ({currentPet.weight} kg)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Favorites & Quirks */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">Favorite Activities</h4>
                                                    <div className="space-y-2">
                                                        {currentPet.favoriteActivities.map((activity, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <Play className="h-4 w-4 text-blue-500" />
                                                                <span className="text-sm text-gray-700">{activity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">Special Quirks</h4>
                                                    <div className="space-y-2">
                                                        {currentPet.quirks.map((quirk, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <Sparkles className="h-4 w-4 text-purple-500" />
                                                                <span className="text-sm text-gray-700">{quirk}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'health' && (
                                        <motion.div
                                            key="health"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Health Status Overview */}
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Shield className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-green-900">Overall Health: Excellent</h3>
                                                        <p className="text-sm text-green-700">All vaccinations up to date, no known health issues</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Health Records */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Health Records</h3>
                                                <div className="space-y-4">
                                                    {currentPet.healthRecords.map((record) => (
                                                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">{record.title}</h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        {record.date.toLocaleDateString()} • {record.veterinarian} at {record.clinic}
                                                                    </p>
                                                                </div>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${record.type === 'vaccination' ? 'bg-blue-100 text-blue-800' :
                                                                        record.type === 'checkup' ? 'bg-green-100 text-green-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {record.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{record.notes}</p>
                                                            {record.nextDue && (
                                                                <p className="text-sm text-blue-600 mt-2">
                                                                    Next due: {record.nextDue.toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'behavior' && (
                                        <motion.div
                                            key="behavior"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Behavior Assessments */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Assessments</h3>
                                                <div className="space-y-4">
                                                    {currentPet.behaviorAssessments.map((assessment, index) => (
                                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold text-gray-900">{assessment.category}</h4>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="flex space-x-1">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star
                                                                                key={star}
                                                                                className={`h-4 w-4 ${star <= assessment.rating
                                                                                        ? 'text-yellow-400 fill-current'
                                                                                        : 'text-gray-300'
                                                                                    }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm text-gray-600">{assessment.rating}/5</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mb-2">{assessment.notes}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Assessed by {assessment.assessedBy} on {assessment.assessmentDate.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'media' && (
                                        <motion.div
                                            key="media"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Photo Gallery */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Photo Gallery</h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {currentPet.photos.map((photo, index) => (
                                                        <div
                                                            key={photo.id}
                                                            onClick={() => openGallery(index)}
                                                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                                                        >
                                                            <img
                                                                src={photo.url}
                                                                alt={photo.caption || `${currentPet.name} photo ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {photo.isMain && (
                                                                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                                                    Main
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                                                <Maximize2 className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Videos */}
                                            {currentPet.videos.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Videos</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {currentPet.videos.map((video) => (
                                                            <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all">
                                                                <img
                                                                    src={video.thumbnail}
                                                                    alt={video.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                                                    <PlayCircle className="h-12 w-12 text-white" />
                                                                </div>
                                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                                                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'history' && (
                                        <motion.div
                                            key="history"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Adoption History */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Adoption Timeline</h3>
                                                <div className="space-y-4">
                                                    {currentPet.adoptionHistory.map((event) => (
                                                        <div key={event.id} className="flex items-start space-x-4">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-medium text-gray-900 capitalize">{event.status.replace('_', ' ')}</h4>
                                                                    <span className="text-sm text-gray-500">{event.date.toLocaleDateString()}</span>
                                                                </div>
                                                                {event.notes && (
                                                                    <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shelter Information */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Shelter</h3>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-900 mb-2">{currentPet.shelterInfo.name}</h4>
                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <p className="flex items-center space-x-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{currentPet.shelterInfo.address}</span>
                                                        </p>
                                                        <p className="flex items-center space-x-2">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{currentPet.shelterInfo.phone}</span>
                                                        </p>
                                                        <p className="flex items-center space-x-2">
                                                            <Mail className="h-4 w-4" />
                                                            <span>{currentPet.shelterInfo.email}</span>
                                                        </p>
                                                        <p className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{currentPet.shelterInfo.operatingHours}</span>
                                                        </p>
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium text-gray-700 mb-1">Contact Person:</p>
                                                        <p className="text-sm text-gray-600">{currentPet.shelterInfo.contactPerson}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Adoption Requirements */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Adoption Requirements</h3>
                            <div className="space-y-3">
                                {currentPet.adoptionRequirements.map((requirement, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{requirement}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ideal Family */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Ideal Family</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">{currentPet.idealFamily}</p>
                        </div>

                        {/* Contact Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Take Action</h3>
                            <div className="space-y-3">
                                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                                    Schedule Meet & Greet
                                </button>
                                <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium">
                                    Apply to Adopt
                                </button>
                                <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                                    Sponsor {currentPet.name}
                                </button>
                                <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                    Share Profile
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Profile Views:</span>
                                    <span className="font-medium">{currentPet.viewCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Time at Shelter:</span>
                                    <span className="font-medium">{Math.floor((Date.now() - currentPet.arrivalDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium">{currentPet.lastUpdated.toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                        onClick={() => setShowGallery(false)}
                    >
                        <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={currentPet.photos[selectedPhotoIndex]?.url}
                                alt={currentPet.photos[selectedPhotoIndex]?.caption}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />

                            {/* Navigation Buttons */}
                            <button
                                onClick={prevPhoto}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                            >
                                <ArrowRight className="h-6 w-6" />
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowGallery(false)}
                                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {/* Photo Info */}
                            {currentPet.photos[selectedPhotoIndex]?.caption && (
                                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                                    <p className="text-center">{currentPet.photos[selectedPhotoIndex].caption}</p>
                                </div>
                            )}

                            {/* Photo Counter */}
                            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                                {selectedPhotoIndex + 1} / {currentPet.photos.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
