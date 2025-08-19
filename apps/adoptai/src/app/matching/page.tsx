'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // AI and Matching Icons
    Zap,
    Brain,
    Target,
    TrendingUp,
    BarChart3,
    Sparkles,

    // Pet and Profile Icons
    Heart,
    Dog,
    Cat,
    PawPrint,
    User,
    Users,
    Home,

    // Assessment Icons
    CheckCircle2,
    XCircle,
    Clock,
    Star,
    Award,

    // Action Icons
    RefreshCw,
    Send,
    Download,
    Share2,
    MessageSquare,
    ArrowRight,

    // Lifestyle Icons
    MapPin,
    Calendar,
    Activity,
    Shield,
    Smile
} from 'lucide-react'

// AI Matching System Interfaces
interface UserProfile {
    id?: string
    livingSpace?: 'apartment' | 'house' | 'farm'
    hasYard?: boolean
    householdSize?: number
    hasChildren?: boolean
    childrenAges?: number[]
    hasOtherPets?: boolean
    otherPetTypes?: string[]
    experienceLevel?: 'beginner' | 'intermediate' | 'expert'
    activityLevel?: 'low' | 'medium' | 'high'
    timeAvailable?: number // hours per day
    budget?: {
        adoption: number
        monthly: number
    }
    preferredTraits?: string[]
    dealBreakers?: string[]
    workSchedule?: 'home' | 'office' | 'hybrid' | 'travel'
    lifestyle?: 'quiet' | 'active' | 'social' | 'outdoor'
    // Index signature for quiz responses
    [key: string]: any
}

interface CompatibilityScore {
    overall: number
    livingSpace: number
    lifestyle: number
    experience: number
    timeCommitment: number
    financial: number
    family: number
    personality: number
}

interface MatchRecommendation {
    petId: string
    petName: string
    petBreed: string
    petType: 'dog' | 'cat' | 'other'
    compatibilityScore: CompatibilityScore
    reasons: string[]
    concerns: string[]
    recommendation: 'excellent' | 'good' | 'fair' | 'poor'
    confidenceLevel: number
}

interface QuizQuestion {
    id: string
    category: string
    question: string
    type: 'single' | 'multiple' | 'scale' | 'number'
    options?: string[]
    min?: number
    max?: number
    required: boolean
}

export default function AIMatchingPage() {
    // User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile>({})
    const [currentStep, setCurrentStep] = useState(0)
    const [isQuizComplete, setIsQuizComplete] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // Sample Quiz Questions
    const quizQuestions: QuizQuestion[] = [
        {
            id: 'living-space',
            category: 'Living Situation',
            question: 'What type of home do you live in?',
            type: 'single',
            options: ['Apartment', 'House', 'Farm/Rural Property'],
            required: true
        },
        {
            id: 'yard',
            category: 'Living Situation',
            question: 'Do you have a yard or outdoor space?',
            type: 'single',
            options: ['Yes, large yard', 'Yes, small yard', 'No yard'],
            required: true
        },
        {
            id: 'household-size',
            category: 'Family',
            question: 'How many people live in your household?',
            type: 'number',
            min: 1,
            max: 10,
            required: true
        },
        {
            id: 'children',
            category: 'Family',
            question: 'Do you have children at home?',
            type: 'single',
            options: ['No children', 'Children under 5', 'Children 5-12', 'Teenagers 13+', 'Mixed ages'],
            required: true
        },
        {
            id: 'other-pets',
            category: 'Current Pets',
            question: 'Do you currently have other pets?',
            type: 'multiple',
            options: ['No other pets', 'Dogs', 'Cats', 'Small pets (rabbits, guinea pigs)', 'Birds', 'Fish'],
            required: true
        },
        {
            id: 'experience',
            category: 'Experience',
            question: 'What is your experience level with pets?',
            type: 'single',
            options: ['First-time pet owner', 'Some experience', 'Very experienced'],
            required: true
        },
        {
            id: 'activity-level',
            category: 'Lifestyle',
            question: 'How would you describe your activity level?',
            type: 'single',
            options: ['Low - prefer quiet activities', 'Medium - some outdoor activities', 'High - very active and outdoorsy'],
            required: true
        },
        {
            id: 'time-commitment',
            category: 'Time',
            question: 'How many hours per day can you dedicate to your pet?',
            type: 'scale',
            min: 1,
            max: 12,
            required: true
        },
        {
            id: 'work-schedule',
            category: 'Lifestyle',
            question: 'What is your work situation?',
            type: 'single',
            options: ['Work from home', 'Office job (8+ hours away)', 'Hybrid (some days home)', 'Frequent travel'],
            required: true
        },
        {
            id: 'budget-adoption',
            category: 'Budget',
            question: 'What is your budget for adoption fees? (RON)',
            type: 'scale',
            min: 100,
            max: 1000,
            required: true
        },
        {
            id: 'budget-monthly',
            category: 'Budget',
            question: 'What is your monthly budget for pet care? (RON)',
            type: 'scale',
            min: 100,
            max: 1000,
            required: true
        },
        {
            id: 'preferred-traits',
            category: 'Preferences',
            question: 'What traits are most important to you?',
            type: 'multiple',
            options: ['Friendly/Social', 'Calm/Quiet', 'Active/Playful', 'Independent', 'Affectionate', 'Protective', 'Low maintenance', 'Good with kids', 'Good with other pets', 'Easy to train'],
            required: true
        }
    ]

    // Sample AI Analysis Results
    const [matchingResults, setMatchingResults] = useState<MatchRecommendation[]>([
        {
            petId: '1',
            petName: 'Luna',
            petBreed: 'Golden Retriever',
            petType: 'dog',
            compatibilityScore: {
                overall: 94,
                livingSpace: 88,
                lifestyle: 96,
                experience: 92,
                timeCommitment: 95,
                financial: 90,
                family: 98,
                personality: 94
            },
            reasons: [
                'Excellent match for active lifestyle',
                'Perfect for families with children',
                'Compatible with your experience level',
                'Fits within your time commitment',
                'Matches your preferred traits perfectly'
            ],
            concerns: [
                'Requires regular grooming',
                'May need large yard for exercise'
            ],
            recommendation: 'excellent',
            confidenceLevel: 96
        },
        {
            petId: '2',
            petName: 'Felix',
            petBreed: 'British Shorthair',
            petType: 'cat',
            compatibilityScore: {
                overall: 78,
                livingSpace: 92,
                lifestyle: 65,
                experience: 85,
                timeCommitment: 88,
                financial: 75,
                family: 80,
                personality: 72
            },
            reasons: [
                'Great for apartment living',
                'Lower maintenance requirements',
                'Good for moderate activity levels',
                'Independent nature suits work schedule'
            ],
            concerns: [
                'May not match your high activity preference',
                'Less social interaction than preferred',
                'May not be ideal with young children'
            ],
            recommendation: 'good',
            confidenceLevel: 82
        },
        {
            petId: '3',
            petName: 'Max',
            petBreed: 'Labrador Mix',
            petType: 'dog',
            compatibilityScore: {
                overall: 87,
                livingSpace: 85,
                lifestyle: 91,
                experience: 88,
                timeCommitment: 89,
                financial: 85,
                family: 92,
                personality: 86
            },
            reasons: [
                'Excellent family companion',
                'Matches your activity level well',
                'Good training potential',
                'Within budget requirements'
            ],
            concerns: [
                'May require additional exercise',
                'Potential for separation anxiety'
            ],
            recommendation: 'excellent',
            confidenceLevel: 89
        }
    ])

    // Handle Quiz Progress
    const handleQuizAnswer = (questionId: string, answer: any) => {
        setUserProfile(prev => ({
            ...prev,
            [questionId]: answer
        }))
    }

    const nextStep = () => {
        if (currentStep < quizQuestions.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            completeQuiz()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const completeQuiz = () => {
        setIsQuizComplete(true)
        setIsAnalyzing(true)

        // Simulate AI analysis
        setTimeout(() => {
            setIsAnalyzing(false)
            setShowResults(true)
        }, 3000)
    }

    const restartQuiz = () => {
        setCurrentStep(0)
        setIsQuizComplete(false)
        setIsAnalyzing(false)
        setShowResults(false)
        setUserProfile({})
    }

    // Get recommendation color
    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'excellent': return 'text-green-600 bg-green-100'
            case 'good': return 'text-blue-600 bg-blue-100'
            case 'fair': return 'text-yellow-600 bg-yellow-100'
            case 'poor': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600'
        if (score >= 75) return 'text-blue-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-md"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-6"
                    >
                        <Brain className="w-16 h-16 text-purple-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis in Progress</h2>
                    <p className="text-gray-600 mb-6">Our advanced AI is analyzing your preferences and finding the perfect pet matches...</p>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                {/* Results Header */}
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Your AI Match Results</h1>
                                <p className="text-blue-100 text-lg">Personalized recommendations based on your lifestyle and preferences</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-blue-200">Confidence Level</p>
                                <p className="text-3xl font-bold">94%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Match Results */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Recommended Matches</h2>
                                <button
                                    onClick={restartQuiz}
                                    className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Retake Assessment</span>
                                </button>
                            </div>

                            {matchingResults.map((match, index) => (
                                <motion.div
                                    key={match.petId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                {match.petType === 'dog' ? (
                                                    <Dog className="h-8 w-8 text-blue-600" />
                                                ) : match.petType === 'cat' ? (
                                                    <Cat className="h-8 w-8 text-purple-600" />
                                                ) : (
                                                    <PawPrint className="h-8 w-8 text-green-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{match.petName}</h3>
                                                <p className="text-gray-600">{match.petBreed}</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(match.recommendation)}`}>
                                                    {match.recommendation.charAt(0).toUpperCase() + match.recommendation.slice(1)} Match
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-bold ${getScoreColor(match.compatibilityScore.overall)}`}>
                                                {match.compatibilityScore.overall}%
                                            </div>
                                            <p className="text-sm text-gray-500">Overall Match</p>
                                        </div>
                                    </div>

                                    {/* Compatibility Breakdown */}
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getScoreColor(match.compatibilityScore.lifestyle)}`}>
                                                {match.compatibilityScore.lifestyle}%
                                            </div>
                                            <p className="text-xs text-gray-500">Lifestyle</p>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getScoreColor(match.compatibilityScore.family)}`}>
                                                {match.compatibilityScore.family}%
                                            </div>
                                            <p className="text-xs text-gray-500">Family</p>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getScoreColor(match.compatibilityScore.timeCommitment)}`}>
                                                {match.compatibilityScore.timeCommitment}%
                                            </div>
                                            <p className="text-xs text-gray-500">Time</p>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getScoreColor(match.compatibilityScore.financial)}`}>
                                                {match.compatibilityScore.financial}%
                                            </div>
                                            <p className="text-xs text-gray-500">Budget</p>
                                        </div>
                                    </div>

                                    {/* Reasons and Concerns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <h4 className="font-semibold text-green-700 mb-2 flex items-center space-x-1">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Why this works</span>
                                            </h4>
                                            <ul className="space-y-1">
                                                {match.reasons.slice(0, 3).map((reason, i) => (
                                                    <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                                                        <span className="text-green-500 mt-1">•</span>
                                                        <span>{reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-yellow-700 mb-2 flex items-center space-x-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Consider</span>
                                            </h4>
                                            <ul className="space-y-1">
                                                {match.concerns.map((concern, i) => (
                                                    <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                                                        <span className="text-yellow-500 mt-1">•</span>
                                                        <span>{concern}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                        <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                                            View Full Profile
                                        </button>
                                        <button className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Heart className="h-4 w-4" />
                                        </button>
                                        <button className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <MessageSquare className="h-4 w-4" />
                                        </button>
                                        <button className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Share2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Profile Summary & Actions */}
                        <div className="space-y-6">

                            {/* Profile Summary */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <User className="h-5 w-5 text-purple-600" />
                                    <span>Your Profile Summary</span>
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Living Space:</span>
                                        <span className="font-medium">House with yard</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Activity Level:</span>
                                        <span className="font-medium">High</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Experience:</span>
                                        <span className="font-medium">Intermediate</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Family:</span>
                                        <span className="font-medium">Children 5-12</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Budget:</span>
                                        <span className="font-medium">500 RON/month</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insights */}
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    <span>AI Insights</span>
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <p className="text-sm font-medium text-purple-700 mb-1">Best Match Traits</p>
                                        <p className="text-xs text-gray-600">Active, family-friendly dogs with good training potential</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <p className="text-sm font-medium text-blue-700 mb-1">Lifestyle Compatibility</p>
                                        <p className="text-xs text-gray-600">Your active lifestyle is perfect for energetic pets</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <p className="text-sm font-medium text-green-700 mb-1">Success Prediction</p>
                                        <p className="text-xs text-gray-600">96% chance of successful long-term adoption</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
                                <div className="space-y-3">
                                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                                        Schedule Meet & Greet
                                    </button>
                                    <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                        Download Report
                                    </button>
                                    <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Quiz Interface
    const currentQuestion = quizQuestions[currentStep]
    const progress = ((currentStep + 1) / quizQuestions.length) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Quiz Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">AI Matching Assessment</h1>
                        <div className="text-sm text-gray-500">
                            Question {currentStep + 1} of {quizQuestions.length}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            {/* Quiz Content */}
            <div className="max-w-4xl mx-auto p-6">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl p-8 shadow-lg"
                >
                    <div className="mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{currentQuestion.category}</h2>
                                <p className="text-gray-600">Help us understand your situation</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h3>

                        {/* Question Input */}
                        <div className="space-y-3">
                            {currentQuestion.type === 'single' && currentQuestion.options?.map((option, index) => (
                                <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        value={option}
                                        onChange={(e) => handleQuizAnswer(currentQuestion.id, e.target.value)}
                                        className="mr-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}

                            {currentQuestion.type === 'multiple' && currentQuestion.options?.map((option, index) => (
                                <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        onChange={(e) => {
                                            const current = userProfile[currentQuestion.id] as string[] || []
                                            if (e.target.checked) {
                                                handleQuizAnswer(currentQuestion.id, [...current, option])
                                            } else {
                                                handleQuizAnswer(currentQuestion.id, current.filter(item => item !== option))
                                            }
                                        }}
                                        className="mr-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}

                            {currentQuestion.type === 'scale' && (
                                <div className="p-6 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-600">{currentQuestion.min}</span>
                                        <span className="text-sm text-gray-600">{currentQuestion.max}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={currentQuestion.min}
                                        max={currentQuestion.max}
                                        onChange={(e) => handleQuizAnswer(currentQuestion.id, parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="text-center mt-2">
                                        <span className="text-lg font-bold text-blue-600">
                                            {userProfile[currentQuestion.id] || currentQuestion.min}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {currentQuestion.type === 'number' && (
                                <input
                                    type="number"
                                    min={currentQuestion.min}
                                    max={currentQuestion.max}
                                    onChange={(e) => handleQuizAnswer(currentQuestion.id, parseInt(e.target.value))}
                                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter a number"
                                />
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span>Previous</span>
                        </button>

                        <button
                            onClick={nextStep}
                            disabled={!userProfile[currentQuestion.id]}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            <span>{currentStep === quizQuestions.length - 1 ? 'Complete Assessment' : 'Next'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
