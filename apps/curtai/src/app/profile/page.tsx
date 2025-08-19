'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Camera,
    Edit3,
    Save,
    Shield,
    Heart,
    Coffee,
    Star,
    Plus,
    X,
    Check,
    Settings,
    ChevronRight,
    Info,
    Award,
    Sparkles,
    Lock,
    Phone,
    Mail,
    ArrowLeft,
    Image as ImageIcon,
    Trash2,
    Zap
} from 'lucide-react'
import Link from 'next/link'

// TypeScript interfaces for profile management
interface UserProfile {
    id: string
    firstName: string
    lastName: string
    age: number
    email: string
    phone: string
    location: {
        city: string
        state: string
        country: string
        coordinates: { lat: number; lng: number }
    }
    bio: string
    occupation: string
    company: string
    education: {
        institution: string
        degree: string
        graduationYear: number
    }
    height: string
    relationshipGoals: string
    interests: string[]
    dealBreakers: string[]
    lifestyle: {
        smoking: 'never' | 'sometimes' | 'regularly'
        drinking: 'never' | 'socially' | 'regularly'
        exercise: 'never' | 'sometimes' | 'regularly'
        diet: 'anything' | 'vegetarian' | 'vegan' | 'pescatarian'
        pets: 'love' | 'like' | 'allergic' | 'none'
        children: 'have' | 'want' | 'dont_want' | 'maybe'
    }
    personalityTraits: {
        openness: number
        conscientiousness: number
        extraversion: number
        agreeableness: number
        neuroticism: number
    }
    photos: ProfilePhoto[]
    verification: {
        email: boolean
        phone: boolean
        identity: boolean
        photos: boolean
    }
    privacy: {
        showAge: boolean
        showLocation: boolean
        showLastActive: boolean
        allowMessages: 'everyone' | 'matches' | 'premium'
        profileVisibility: 'public' | 'restricted' | 'private'
    }
    subscription: {
        type: 'free' | 'premium' | 'elite'
        expiresAt: string
        features: string[]
    }
    createdAt: string
    lastActive: string
}

interface ProfilePhoto {
    id: string
    url: string
    caption?: string
    isMain: boolean
    order: number
    uploadedAt: string
    status: 'pending' | 'approved' | 'rejected'
    moderationNotes?: string
}

interface PersonalityAssessment {
    question: string
    options: { value: number; label: string }[]
    trait: keyof UserProfile['personalityTraits']
}

export default function ProfileManagement() {
    const [activeTab, setActiveTab] = useState('basic')
    const [isEditing, setIsEditing] = useState(false)
    const [showPersonalityTest, setShowPersonalityTest] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState<UserProfile>({
        id: 'user-123',
        firstName: 'Ana',
        lastName: 'Popescu',
        age: 28,
        email: 'ana.popescu@email.com',
        phone: '+40 722 123 456',
        location: {
            city: 'Bucharest',
            state: 'Bucharest',
            country: 'Romania',
            coordinates: { lat: 44.4268, lng: 26.1025 }
        },
        bio: 'Adventure seeker with a passion for photography and travel. I love exploring new cultures, trying exotic cuisines, and capturing life\'s beautiful moments. Looking for someone who shares my enthusiasm for life and can be my partner in all adventures.',
        occupation: 'Senior Marketing Manager',
        company: 'Digital Ventures SRL',
        education: {
            institution: 'Academy of Economic Studies',
            degree: 'Master in Marketing',
            graduationYear: 2019
        },
        height: '168 cm',
        relationshipGoals: 'Looking for a serious long-term relationship leading to marriage',
        interests: ['Photography', 'Travel', 'Cooking', 'Hiking', 'Art', 'Music', 'Dancing', 'Yoga'],
        dealBreakers: ['Smoking', 'Dishonesty', 'No ambition', 'Closed-mindedness'],
        lifestyle: {
            smoking: 'never',
            drinking: 'socially',
            exercise: 'regularly',
            diet: 'vegetarian',
            pets: 'love',
            children: 'want'
        },
        personalityTraits: {
            openness: 88,
            conscientiousness: 92,
            extraversion: 75,
            agreeableness: 85,
            neuroticism: 25
        },
        photos: [
            {
                id: 'photo-1',
                url: '/api/placeholder/400/600',
                caption: 'Sunset photography session in Cappadocia',
                isMain: true,
                order: 1,
                uploadedAt: '2025-01-15T10:30:00Z',
                status: 'approved'
            },
            {
                id: 'photo-2',
                url: '/api/placeholder/400/600',
                caption: 'Hiking adventure in the Carpathian Mountains',
                isMain: false,
                order: 2,
                uploadedAt: '2025-01-10T14:20:00Z',
                status: 'approved'
            },
            {
                id: 'photo-3',
                url: '/api/placeholder/400/600',
                caption: 'Cooking class in Tuscany',
                isMain: false,
                order: 3,
                uploadedAt: '2025-01-05T16:45:00Z',
                status: 'pending'
            }
        ],
        verification: {
            email: true,
            phone: true,
            identity: false,
            photos: true
        },
        privacy: {
            showAge: true,
            showLocation: true,
            showLastActive: true,
            allowMessages: 'matches',
            profileVisibility: 'public'
        },
        subscription: {
            type: 'premium',
            expiresAt: '2025-12-15T00:00:00Z',
            features: ['Unlimited likes', 'See who liked you', 'Advanced filters', 'Read receipts']
        },
        createdAt: '2024-06-15T09:00:00Z',
        lastActive: '2025-08-09T12:30:00Z'
    })

    const [tempProfile, setTempProfile] = useState<UserProfile>(profile)

    const personalityQuestions: PersonalityAssessment[] = [
        {
            question: "I enjoy exploring new ideas and experiences",
            options: [
                { value: 20, label: "Strongly Disagree" },
                { value: 40, label: "Disagree" },
                { value: 60, label: "Neutral" },
                { value: 80, label: "Agree" },
                { value: 100, label: "Strongly Agree" }
            ],
            trait: 'openness'
        },
        {
            question: "I am very organized and detail-oriented",
            options: [
                { value: 20, label: "Strongly Disagree" },
                { value: 40, label: "Disagree" },
                { value: 60, label: "Neutral" },
                { value: 80, label: "Agree" },
                { value: 100, label: "Strongly Agree" }
            ],
            trait: 'conscientiousness'
        },
        {
            question: "I enjoy being the center of attention",
            options: [
                { value: 20, label: "Strongly Disagree" },
                { value: 40, label: "Disagree" },
                { value: 60, label: "Neutral" },
                { value: 80, label: "Agree" },
                { value: 100, label: "Strongly Agree" }
            ],
            trait: 'extraversion'
        }
    ]

    const availableInterests = [
        'Photography', 'Travel', 'Cooking', 'Hiking', 'Art', 'Music', 'Dancing', 'Yoga',
        'Reading', 'Movies', 'Gaming', 'Sports', 'Fitness', 'Nature', 'Wine', 'Coffee',
        'Theater', 'Museums', 'Concerts', 'Technology', 'Fashion', 'Design', 'Writing',
        'Volunteering', 'Meditation', 'Camping', 'Cycling', 'Swimming', 'Running'
    ]

    const handleSaveProfile = () => {
        setProfile(tempProfile)
        setIsEditing(false)
    }

    const handleCancelEdit = () => {
        setTempProfile(profile)
        setIsEditing(false)
    }

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            // In a real app, you'd upload to a server
            const newPhoto: ProfilePhoto = {
                id: `photo-${Date.now()}`,
                url: URL.createObjectURL(files[0]),
                isMain: tempProfile.photos.length === 0,
                order: tempProfile.photos.length + 1,
                uploadedAt: new Date().toISOString(),
                status: 'pending'
            }
            setTempProfile(prev => ({
                ...prev,
                photos: [...prev.photos, newPhoto]
            }))
        }
    }

    const handleDeletePhoto = (photoId: string) => {
        setTempProfile(prev => ({
            ...prev,
            photos: prev.photos.filter(photo => photo.id !== photoId)
        }))
    }

    const handleSetMainPhoto = (photoId: string) => {
        setTempProfile(prev => ({
            ...prev,
            photos: prev.photos.map(photo => ({
                ...photo,
                isMain: photo.id === photoId
            }))
        }))
    }

    const handleInterestToggle = (interest: string) => {
        setTempProfile(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }))
    }

    const getVerificationProgress = () => {
        const verifications = Object.values(profile.verification)
        const completed = verifications.filter(Boolean).length
        return (completed / verifications.length) * 100
    }

    const getPersonalityColor = (score: number) => {
        if (score >= 80) return 'bg-green-500'
        if (score >= 60) return 'bg-blue-500'
        if (score >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getPhotoStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'rejected': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
        { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
        { id: 'interests', label: 'Interests', icon: <Heart className="w-4 h-4" /> },
        { id: 'lifestyle', label: 'Lifestyle', icon: <Coffee className="w-4 h-4" /> },
        { id: 'personality', label: 'Personality', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'verification', label: 'Verification', icon: <Shield className="w-4 h-4" /> },
        { id: 'privacy', label: 'Privacy', icon: <Lock className="w-4 h-4" /> }
    ]

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
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Link href="/curtai" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Profile Management</h1>
                                <p className="text-pink-100">Create your perfect dating profile</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-pink-100">Profile Completion</div>
                                <div className="text-xl font-bold">{Math.round(getVerificationProgress())}%</div>
                            </div>
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <Save className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                )}
                                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span className="font-medium">{tab.label}</span>
                                        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === tab.id ? 'rotate-90' : ''
                                            }`} />
                                    </button>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-8 p-4 bg-gradient-to-r from-pink-100 to-red-100 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-3">Profile Stats</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Photos</span>
                                        <span className="font-medium">{profile.photos.length}/6</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Interests</span>
                                        <span className="font-medium">{profile.interests.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Verification</span>
                                        <span className="font-medium">{Math.round(getVerificationProgress())}%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <User className="w-6 h-6 text-pink-600" />
                                        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                value={tempProfile.firstName}
                                                onChange={(e) => setTempProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={tempProfile.lastName}
                                                onChange={(e) => setTempProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                            <input
                                                type="number"
                                                value={tempProfile.age}
                                                onChange={(e) => setTempProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                                            <input
                                                type="text"
                                                value={tempProfile.height}
                                                onChange={(e) => setTempProfile(prev => ({ ...prev, height: e.target.value }))}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            value={tempProfile.bio}
                                            onChange={(e) => setTempProfile(prev => ({ ...prev, bio: e.target.value }))}
                                            disabled={!isEditing}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="Tell potential matches about yourself..."
                                        />
                                        <p className="text-sm text-gray-500 mt-1">{tempProfile.bio.length}/500 characters</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                                            <input
                                                type="text"
                                                value={tempProfile.occupation}
                                                onChange={(e) => setTempProfile(prev => ({ ...prev, occupation: e.target.value }))}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                                            <input
                                                type="text"
                                                value={tempProfile.company}
                                                onChange={(e) => setTempProfile(prev => ({ ...prev, company: e.target.value }))}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Goals</label>
                                        <textarea
                                            value={tempProfile.relationshipGoals}
                                            onChange={(e) => setTempProfile(prev => ({ ...prev, relationshipGoals: e.target.value }))}
                                            disabled={!isEditing}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="What are you looking for in a relationship?"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Photos Tab */}
                            {activeTab === 'photos' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <Camera className="w-6 h-6 text-pink-600" />
                                            <h2 className="text-2xl font-bold text-gray-900">Photo Management</h2>
                                        </div>
                                        {isEditing && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors flex items-center space-x-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Add Photo</span>
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        multiple
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {tempProfile.photos.map((photo) => (
                                            <motion.div
                                                key={photo.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative group"
                                            >
                                                <div className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden">
                                                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
                                                        <ImageIcon className="w-16 h-16 text-white/30" />
                                                    </div>

                                                    {/* Photo Status Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhotoStatusColor(photo.status)}`}>
                                                            {photo.status}
                                                        </span>
                                                    </div>

                                                    {/* Main Photo Badge */}
                                                    {photo.isMain && (
                                                        <div className="absolute top-3 right-3">
                                                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                                                                <Star className="w-3 h-3" />
                                                                <span>Main</span>
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Photo Controls */}
                                                    {isEditing && (
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                                            {!photo.isMain && (
                                                                <button
                                                                    onClick={() => handleSetMainPhoto(photo.id)}
                                                                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                                                    title="Set as main photo"
                                                                >
                                                                    <Star className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                                title="Edit photo"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePhoto(photo.id)}
                                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                                title="Delete photo"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Photo Caption */}
                                                {photo.caption && (
                                                    <p className="text-sm text-gray-600 mt-2 text-center">{photo.caption}</p>
                                                )}
                                            </motion.div>
                                        ))}

                                        {/* Add Photo Placeholder */}
                                        {tempProfile.photos.length < 6 && isEditing && (
                                            <motion.button
                                                onClick={() => fileInputRef.current?.click()}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-pink-400 hover:bg-pink-50 transition-colors"
                                            >
                                                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-gray-500 font-medium">Add Photo</span>
                                                <span className="text-xs text-gray-400 mt-1">Max 6 photos</span>
                                            </motion.button>
                                        )}
                                    </div>

                                    {/* Photo Tips */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-start space-x-3">
                                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold text-blue-900 mb-2">Photo Tips</h3>
                                                <ul className="text-sm text-blue-800 space-y-1">
                                                    <li>• Use high-quality, well-lit photos</li>
                                                    <li>• Include a clear face shot as your main photo</li>
                                                    <li>• Show your personality and interests</li>
                                                    <li>• Avoid group photos or sunglasses in main photo</li>
                                                    <li>• All photos must be approved by our moderation team</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Interests Tab */}
                            {activeTab === 'interests' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Heart className="w-6 h-6 text-pink-600" />
                                        <h2 className="text-2xl font-bold text-gray-900">Interests & Hobbies</h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {availableInterests.map((interest) => (
                                            <motion.button
                                                key={interest}
                                                onClick={() => isEditing && handleInterestToggle(interest)}
                                                disabled={!isEditing}
                                                whileHover={isEditing ? { scale: 1.05 } : {}}
                                                whileTap={isEditing ? { scale: 0.95 } : {}}
                                                className={`p-3 rounded-xl border-2 transition-all duration-200 ${tempProfile.interests.includes(interest)
                                                        ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
                                                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <span className="text-sm font-medium">{interest}</span>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                                        <h3 className="font-semibold text-pink-900 mb-2">Selected Interests ({tempProfile.interests.length})</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tempProfile.interests.map((interest) => (
                                                <span
                                                    key={interest}
                                                    className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm flex items-center space-x-1"
                                                >
                                                    <span>{interest}</span>
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => handleInterestToggle(interest)}
                                                            className="hover:bg-pink-600 rounded-full p-0.5"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lifestyle Tab */}
                            {activeTab === 'lifestyle' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Coffee className="w-6 h-6 text-pink-600" />
                                        <h2 className="text-2xl font-bold text-gray-900">Lifestyle Preferences</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(tempProfile.lifestyle).map(([key, value]) => (
                                            <div key={key} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 capitalize">
                                                    {key === 'pets' ? 'Attitude toward pets' : key}
                                                </label>
                                                <select
                                                    value={value}
                                                    onChange={(e) => setTempProfile(prev => ({
                                                        ...prev,
                                                        lifestyle: { ...prev.lifestyle, [key]: e.target.value }
                                                    }))}
                                                    disabled={!isEditing}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                                >
                                                    {key === 'smoking' && (
                                                        <>
                                                            <option value="never">Never</option>
                                                            <option value="sometimes">Sometimes</option>
                                                            <option value="regularly">Regularly</option>
                                                        </>
                                                    )}
                                                    {key === 'drinking' && (
                                                        <>
                                                            <option value="never">Never</option>
                                                            <option value="socially">Socially</option>
                                                            <option value="regularly">Regularly</option>
                                                        </>
                                                    )}
                                                    {key === 'exercise' && (
                                                        <>
                                                            <option value="never">Never</option>
                                                            <option value="sometimes">Sometimes</option>
                                                            <option value="regularly">Regularly</option>
                                                        </>
                                                    )}
                                                    {key === 'diet' && (
                                                        <>
                                                            <option value="anything">Anything</option>
                                                            <option value="vegetarian">Vegetarian</option>
                                                            <option value="vegan">Vegan</option>
                                                            <option value="pescatarian">Pescatarian</option>
                                                        </>
                                                    )}
                                                    {key === 'pets' && (
                                                        <>
                                                            <option value="love">Love them</option>
                                                            <option value="like">Like them</option>
                                                            <option value="allergic">Allergic</option>
                                                            <option value="none">Don't want pets</option>
                                                        </>
                                                    )}
                                                    {key === 'children' && (
                                                        <>
                                                            <option value="have">Have children</option>
                                                            <option value="want">Want children</option>
                                                            <option value="dont_want">Don't want children</option>
                                                            <option value="maybe">Maybe someday</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Personality Tab */}
                            {activeTab === 'personality' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <Sparkles className="w-6 h-6 text-pink-600" />
                                            <h2 className="text-2xl font-bold text-gray-900">Personality Profile</h2>
                                        </div>
                                        <button
                                            onClick={() => setShowPersonalityTest(true)}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Zap className="w-4 h-4" />
                                            <span>Retake Test</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {Object.entries(profile.personalityTraits).map(([trait, score]) => (
                                            <div key={trait} className="bg-gray-50 rounded-xl p-4 text-center">
                                                <div className="mb-3">
                                                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${getPersonalityColor(score)}`}>
                                                        <span className="text-white font-bold text-lg">{score}</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 capitalize mb-1">{trait}</h3>
                                                <div className={`w-full h-2 rounded-full ${getPersonalityColor(score)} mb-2`}></div>
                                                <p className="text-xs text-gray-600">
                                                    {score >= 80 ? 'Very High' : score >= 60 ? 'High' : score >= 40 ? 'Moderate' : 'Low'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                                        <h3 className="font-semibold text-purple-900 mb-3">Your Personality Summary</h3>
                                        <p className="text-purple-800 text-sm leading-relaxed">
                                            Based on your personality assessment, you demonstrate high levels of openness to new experiences
                                            and conscientiousness in your approach to life. Your moderate extraversion suggests you enjoy
                                            social interactions while also valuing personal time. Your high agreeableness indicates you're
                                            cooperative and trusting, while your low neuroticism shows emotional stability.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Verification Tab */}
                            {activeTab === 'verification' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Shield className="w-6 h-6 text-pink-600" />
                                        <h2 className="text-2xl font-bold text-gray-900">Account Verification</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(profile.verification).map(([type, verified]) => (
                                            <div key={type} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {type === 'email' && <Mail className="w-5 h-5" />}
                                                        {type === 'phone' && <Phone className="w-5 h-5" />}
                                                        {type === 'identity' && <User className="w-5 h-5" />}
                                                        {type === 'photos' && <Camera className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 capitalize">{type} Verification</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {type === 'email' && 'Verify your email address'}
                                                            {type === 'phone' && 'Verify your phone number'}
                                                            {type === 'identity' && 'Verify your identity with government ID'}
                                                            {type === 'photos' && 'Verify your photos are authentic'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {verified ? (
                                                        <span className="flex items-center space-x-1 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                                                            <Check className="w-4 h-4" />
                                                            <span>Verified</span>
                                                        </span>
                                                    ) : (
                                                        <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors">
                                                            Verify Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-start space-x-3">
                                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold text-blue-900 mb-2">Verification Benefits</h3>
                                                <ul className="text-sm text-blue-800 space-y-1">
                                                    <li>• Increase your profile trustworthiness</li>
                                                    <li>• Get more matches and responses</li>
                                                    <li>• Access to verified-only features</li>
                                                    <li>• Priority in search results</li>
                                                    <li>• Enhanced security and safety</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Lock className="w-6 h-6 text-pink-600" />
                                        <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-4">Profile Visibility</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { value: 'showAge', label: 'Show my age on profile' },
                                                    { value: 'showLocation', label: 'Show my location' },
                                                    { value: 'showLastActive', label: 'Show when I was last active' }
                                                ].map((setting) => (
                                                    <label key={setting.value} className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={tempProfile.privacy[setting.value as keyof typeof tempProfile.privacy] as boolean}
                                                            onChange={(e) => setTempProfile(prev => ({
                                                                ...prev,
                                                                privacy: { ...prev.privacy, [setting.value]: e.target.checked }
                                                            }))}
                                                            disabled={!isEditing}
                                                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                        />
                                                        <span className="text-gray-700">{setting.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-4">Communication Settings</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Who can message me</label>
                                                    <select
                                                        value={tempProfile.privacy.allowMessages}
                                                        onChange={(e) => setTempProfile(prev => ({
                                                            ...prev,
                                                            privacy: { ...prev.privacy, allowMessages: e.target.value as any }
                                                        }))}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                                    >
                                                        <option value="everyone">Everyone</option>
                                                        <option value="matches">My matches only</option>
                                                        <option value="premium">Premium members only</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile visibility</label>
                                                    <select
                                                        value={tempProfile.privacy.profileVisibility}
                                                        onChange={(e) => setTempProfile(prev => ({
                                                            ...prev,
                                                            privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
                                                        }))}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                                                    >
                                                        <option value="public">Public - visible to everyone</option>
                                                        <option value="restricted">Restricted - visible to potential matches</option>
                                                        <option value="private">Private - only visible when I like someone</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Personality Test Modal */}
            <AnimatePresence>
                {showPersonalityTest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPersonalityTest(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Personality Assessment</h2>
                                <button
                                    onClick={() => setShowPersonalityTest(false)}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <p className="text-purple-800 text-sm">
                                        This assessment helps us understand your personality to provide better matches.
                                        Answer honestly for the best results.
                                    </p>
                                </div>

                                {personalityQuestions.map((question, index) => (
                                    <div key={index} className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">{question.question}</h3>
                                        <div className="space-y-2">
                                            {question.options.map((option) => (
                                                <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`question-${index}`}
                                                        value={option.value}
                                                        className="text-pink-600 focus:ring-pink-500"
                                                    />
                                                    <span className="text-gray-700">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setShowPersonalityTest(false)}
                                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
                                        Save Assessment
                                    </button>
                                </div>
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
                            <Shield className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Profile Security</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Your profile data is encrypted and securely stored
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Learn More
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Sparkles className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Our AI continuously optimizes your profile for better matches
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Optimize Now
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Award className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Profile Boost</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Complete your profile to increase visibility and matches
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Get Boost
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
