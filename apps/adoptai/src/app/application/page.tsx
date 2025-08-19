'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Process and Flow Icons
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Send,
    ArrowRight,
    ArrowLeft,

    // Document and Form Icons
    Upload,
    Image,
    FileCheck,
    Paperclip,
    Camera,
    Scan,

    // People and Contact Icons
    User,
    Users,
    Phone,
    Mail,
    MapPin,
    Calendar,

    // Verification Icons
    Shield,
    Award,
    CheckSquare,
    Eye,
    Lock,
    Key,

    // Pet Related Icons
    Heart,
    Dog,
    Cat,
    PawPrint,
    Home,
    Activity,

    // Action Icons
    Save,
    Download,
    Share2,
    MessageSquare,
    Info,
    Plus,
    X,
    Edit3
} from 'lucide-react'

// Application Process Interfaces
interface ApplicationStep {
    id: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'rejected'
    required: boolean
    estimatedTime: string
    completedAt?: Date
}

interface ApplicationForm {
    // Personal Information
    personalInfo: {
        firstName: string
        lastName: string
        email: string
        phone: string
        dateOfBirth: string
        address: {
            street: string
            city: string
            county: string
            postalCode: string
        }
        idNumber: string
    }

    // Housing Information
    housingInfo: {
        type: 'apartment' | 'house' | 'farm'
        ownership: 'owned' | 'rented' | 'family'
        hasYard: boolean
        yardSize?: 'small' | 'medium' | 'large'
        landlordPermission?: boolean
        rentAgreement?: File[]
    }

    // Family Information
    familyInfo: {
        householdMembers: Array<{
            name: string
            age: number
            relationship: string
            petExperience: boolean
        }>
        hasChildren: boolean
        childrenAges: number[]
        childrenPetExperience: boolean
    }

    // Pet Experience
    petExperience: {
        previousPets: Array<{
            type: string
            breed: string
            yearsOwned: number
            outcome: string
        }>
        currentPets: Array<{
            type: string
            breed: string
            age: number
            vaccinated: boolean
            spayedNeutered: boolean
        }>
        veterinarian: {
            name: string
            clinic: string
            phone: string
            yearsUsing: number
        }
    }

    // Financial Information
    financialInfo: {
        monthlyIncome: number
        petBudget: number
        emergencyFund: number
        hasInsurance: boolean
        insuranceProvider?: string
    }

    // References
    references: Array<{
        name: string
        relationship: string
        phone: string
        email: string
        yearsKnown: number
    }>

    // Documents
    documents: {
        idDocument: File[]
        addressProof: File[]
        incomeProof: File[]
        vetRecords: File[]
        landlordPermission?: File[]
        photos: File[]
    }

    // Commitment Questions
    commitmentQuestions: {
        reasonForAdoption: string
        timeCommitment: string
        vacationPlans: string
        movingPlans: string
        behaviorChallenges: string
        financialChallenges: string
        surrenderCircumstances: string
    }
}

interface ApplicationStatus {
    id: string
    status: 'draft' | 'submitted' | 'under_review' | 'additional_info_needed' | 'approved' | 'rejected'
    submittedAt?: Date
    reviewedAt?: Date
    completedAt?: Date
    reviewerNotes: string[]
    nextSteps: string[]
    timeline: Array<{
        date: Date
        action: string
        status: string
        notes?: string
    }>
}

export default function ApplicationProcessPage() {
    // Application State
    const [currentStep, setCurrentStep] = useState(0)
    const [applicationForm, setApplicationForm] = useState<Partial<ApplicationForm>>({})
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({
        id: 'app_' + Date.now(),
        status: 'draft',
        reviewerNotes: [],
        nextSteps: [],
        timeline: []
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [activeTab, setActiveTab] = useState<'form' | 'status' | 'documents'>('form')

    // Application Steps Configuration
    const applicationSteps: ApplicationStep[] = [
        {
            id: 'personal',
            title: 'Personal Information',
            description: 'Basic personal details and contact information',
            status: 'completed',
            required: true,
            estimatedTime: '5 minutes',
            completedAt: new Date()
        },
        {
            id: 'housing',
            title: 'Housing Situation',
            description: 'Information about your living arrangements',
            status: 'completed',
            required: true,
            estimatedTime: '5 minutes',
            completedAt: new Date()
        },
        {
            id: 'family',
            title: 'Family & Household',
            description: 'Details about family members and their pet experience',
            status: 'in_progress',
            required: true,
            estimatedTime: '10 minutes'
        },
        {
            id: 'experience',
            title: 'Pet Experience',
            description: 'Your history with pets and veterinary information',
            status: 'pending',
            required: true,
            estimatedTime: '15 minutes'
        },
        {
            id: 'financial',
            title: 'Financial Information',
            description: 'Budget and financial planning for pet care',
            status: 'pending',
            required: true,
            estimatedTime: '5 minutes'
        },
        {
            id: 'references',
            title: 'References',
            description: 'Personal references who can vouch for your pet care',
            status: 'pending',
            required: true,
            estimatedTime: '10 minutes'
        },
        {
            id: 'documents',
            title: 'Document Upload',
            description: 'Required documents and verification materials',
            status: 'pending',
            required: true,
            estimatedTime: '10 minutes'
        },
        {
            id: 'commitment',
            title: 'Commitment Questions',
            description: 'Detailed questions about your adoption commitment',
            status: 'pending',
            required: true,
            estimatedTime: '15 minutes'
        },
        {
            id: 'review',
            title: 'Review & Submit',
            description: 'Final review of your application before submission',
            status: 'pending',
            required: true,
            estimatedTime: '5 minutes'
        }
    ]

    // Sample Application Status Data
    const sampleTimeline = [
        {
            date: new Date('2025-08-01'),
            action: 'Application Started',
            status: 'initiated',
            notes: 'Application form created and personal information section completed'
        },
        {
            date: new Date('2025-08-02'),
            action: 'Housing Information Added',
            status: 'in_progress',
            notes: 'Housing details and living situation documented'
        },
        {
            date: new Date('2025-08-05'),
            action: 'Family Information Updated',
            status: 'in_progress',
            notes: 'Household members and family situation added'
        },
        {
            date: new Date('2025-08-08'),
            action: 'Pending Completion',
            status: 'draft',
            notes: 'Pet experience, references, and documents still needed'
        }
    ]

    // Handle form updates
    const updateForm = (section: keyof ApplicationForm, data: any) => {
        setApplicationForm(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }))
    }

    // Handle step navigation
    const nextStep = () => {
        if (currentStep < applicationSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = (stepIndex: number) => {
        setCurrentStep(stepIndex)
    }

    // Handle form submission
    const submitApplication = async () => {
        setIsSubmitting(true)

        // Simulate submission process
        await new Promise(resolve => setTimeout(resolve, 2000))

        setApplicationStatus(prev => ({
            ...prev,
            status: 'submitted',
            submittedAt: new Date(),
            timeline: [
                ...prev.timeline,
                {
                    date: new Date(),
                    action: 'Application Submitted',
                    status: 'submitted',
                    notes: 'Complete application submitted for review'
                }
            ]
        }))

        setIsSubmitting(false)
        setShowConfirmation(true)
    }

    // Get step status icon
    const getStepIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-600" />
            case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />
            case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />
            default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
        }
    }

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    if (showConfirmation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-lg"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for submitting your adoption application. Our team will review it within 3-5 business days and contact you with next steps.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Application ID:</strong> {applicationStatus.id}
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Submitted:</strong> {applicationStatus.submittedAt?.toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('status')}
                            className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            Track Status
                        </button>
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Continue
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Adoption Application</h1>
                            <p className="text-blue-100 text-lg">Complete your pet adoption application step by step</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-200">Application ID</p>
                            <p className="text-lg font-mono">{applicationStatus.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'form'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Application Form
                        </button>
                        <button
                            onClick={() => setActiveTab('status')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'status'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Status & Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'documents'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Documents & Requirements
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'form' && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                        >
                            {/* Progress Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Progress</h3>
                                    <div className="space-y-4">
                                        {applicationSteps.map((step, index) => (
                                            <div
                                                key={step.id}
                                                onClick={() => goToStep(index)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${currentStep === index
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {getStepIcon(step.status)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${currentStep === index ? 'text-blue-900' : 'text-gray-900'
                                                            }`}>
                                                            {step.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{step.estimatedTime}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Overall Progress */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                            <span className="text-sm text-gray-500">
                                                {Math.round((applicationSteps.filter(s => s.status === 'completed').length / applicationSteps.length) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(applicationSteps.filter(s => s.status === 'completed').length / applicationSteps.length) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <div className="mb-8">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{applicationSteps[currentStep].title}</h2>
                                                <p className="text-gray-600">{applicationSteps[currentStep].description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{applicationSteps[currentStep].estimatedTime}</span>
                                            </span>
                                            {applicationSteps[currentStep].required && (
                                                <span className="flex items-center space-x-1 text-red-500">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>Required</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dynamic Form Content Based on Current Step */}
                                    <div className="space-y-6">
                                        {currentStep === 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter your first name"
                                                        defaultValue="Alexandru"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter your last name"
                                                        defaultValue="Popescu"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="your.email@example.com"
                                                        defaultValue="alexandru.popescu@email.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="+40 xxx xxx xxx"
                                                        defaultValue="+40 721 234 567"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 1 && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Housing Type</label>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {['Apartment', 'House', 'Farm/Rural'].map((type) => (
                                                            <label key={type} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                                <input type="radio" name="housing-type" className="mr-3" defaultChecked={type === 'House'} />
                                                                <span>{type}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you have a yard?</label>
                                                    <div className="flex space-x-4">
                                                        <label className="flex items-center">
                                                            <input type="radio" name="yard" className="mr-2" defaultChecked />
                                                            <span>Yes, large yard</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="yard" className="mr-2" />
                                                            <span>Yes, small yard</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="radio" name="yard" className="mr-2" />
                                                            <span>No yard</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Household Members</label>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                                            <User className="h-5 w-5 text-gray-500" />
                                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                                <input type="text" placeholder="Name" className="p-2 border rounded" defaultValue="Maria Popescu" />
                                                                <input type="number" placeholder="Age" className="p-2 border rounded" defaultValue="35" />
                                                                <select className="p-2 border rounded" defaultValue="spouse">
                                                                    <option value="spouse">Spouse</option>
                                                                    <option value="child">Child</option>
                                                                    <option value="parent">Parent</option>
                                                                    <option value="other">Other</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                                                            <Plus className="h-4 w-4" />
                                                            <span>Add Family Member</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Placeholder for other steps */}
                                        {currentStep > 2 && (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Form Section In Development</h3>
                                                <p className="text-gray-500">This section will contain the form fields for {applicationSteps[currentStep].title.toLowerCase()}.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={prevStep}
                                            disabled={currentStep === 0}
                                            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            <span>Previous</span>
                                        </button>

                                        <div className="flex space-x-3">
                                            <button className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors">
                                                Save Draft
                                            </button>
                                            {currentStep === applicationSteps.length - 1 ? (
                                                <button
                                                    onClick={submitApplication}
                                                    disabled={isSubmitting}
                                                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-medium"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span>Submitting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4" />
                                                            <span>Submit Application</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={nextStep}
                                                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                                                >
                                                    <span>Next Step</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'status' && (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Status Overview */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Status</h2>

                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
                                            <p className="text-gray-600">Application is being completed</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                Draft
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 mb-4">Timeline</h4>
                                        {sampleTimeline.map((item, index) => (
                                            <div key={index} className="flex items-start space-x-4">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-medium text-gray-900">{item.action}</h5>
                                                        <span className="text-sm text-gray-500">{item.date.toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Completed Steps:</span>
                                            <span className="font-medium">3/9</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Est. Time Left:</span>
                                            <span className="font-medium">45 minutes</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Documents:</span>
                                            <span className="font-medium">0/5 uploaded</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start space-x-2">
                                            <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                            <span>Complete pet experience section</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                            <span>Upload required documents</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                            <span>Provide three references</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'documents' && (
                        <motion.div
                            key="documents"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Documents</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { name: 'Valid ID Document', status: 'pending', required: true, description: 'Government-issued photo ID' },
                                        { name: 'Proof of Address', status: 'pending', required: true, description: 'Utility bill or lease agreement' },
                                        { name: 'Proof of Income', status: 'pending', required: true, description: 'Recent pay stubs or tax returns' },
                                        { name: 'Veterinary Records', status: 'pending', required: false, description: 'Records for current pets (if any)' },
                                        { name: 'Landlord Permission', status: 'pending', required: false, description: 'If renting property' },
                                        { name: 'Home Photos', status: 'pending', required: false, description: 'Interior and exterior photos' }
                                    ].map((doc, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                                                {doc.required && (
                                                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Required</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                                            <div className="flex items-center space-x-3">
                                                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                                                    <Upload className="h-4 w-4" />
                                                    <span>Upload</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700">
                                                    <Camera className="h-4 w-4" />
                                                    <span>Take Photo</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
