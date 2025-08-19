import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    Megaphone,
    Target,
    Calendar,
    Users,
    Image,
    Video,
    FileText,
    Settings,
    Eye,
    Save,
    Share2,
    TrendingUp
} from 'lucide-react'

interface Campaign {
    id: string
    title: string
    description: string
    goal: number
    raised: number
    type: 'standard' | 'peer-to-peer' | 'event' | 'recurring'
    category: string
    status: 'draft' | 'active' | 'paused' | 'completed'
    startDate: string
    endDate: string
    organizerId: string
    organizerName: string
    participantCount: number
    donorCount: number
    averageDonation: number
    lastActivity: string
    imageUrl?: string
}

interface CampaignCreatorProps {
    campaigns: Campaign[]
    onCampaignCreate?: (campaign: Partial<Campaign>) => void
}

export function CampaignCreator({ campaigns, onCampaignCreate }: CampaignCreatorProps) {
    const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'drafts'>('builder')
    const [campaignData, setCampaignData] = useState({
        title: '',
        description: '',
        goal: '',
        category: 'general',
        type: 'standard' as const,
        startDate: '',
        endDate: '',
        story: '',
        mediaFiles: [] as File[],
        tags: [] as string[],
        publicVisible: true,
        allowComments: true,
        emailUpdates: true
    })

    const categories = [
        { value: 'emergency', label: 'Emergency Relief', icon: '🚨', description: 'Urgent assistance for crisis situations' },
        { value: 'education', label: 'Education', icon: '🎓', description: 'Educational programs and scholarships' },
        { value: 'healthcare', label: 'Healthcare', icon: '🏥', description: 'Medical treatment and health initiatives' },
        { value: 'environment', label: 'Environment', icon: '🌱', description: 'Environmental protection and sustainability' },
        { value: 'community', label: 'Community', icon: '🏘️', description: 'Local community development projects' },
        { value: 'children', label: 'Children', icon: '👶', description: 'Child welfare and protection programs' },
        { value: 'elderly', label: 'Elderly Care', icon: '👴', description: 'Support for elderly populations' },
        { value: 'general', label: 'General', icon: '❤️', description: 'Other charitable causes' }
    ]

    const campaignTypes = [
        {
            type: 'standard',
            label: 'Standard Campaign',
            icon: <Megaphone className="h-5 w-5" />,
            description: 'Traditional fundraising campaign managed by your organization',
            features: ['Organization management', 'Direct donations', 'Progress tracking', 'Donor communication']
        },
        {
            type: 'peer-to-peer',
            label: 'Peer-to-Peer',
            icon: <Users className="h-5 w-5" />,
            description: 'Enable supporters to create personal fundraising pages',
            features: ['Individual fundraiser pages', 'Social sharing tools', 'Leaderboards', 'Team challenges']
        },
        {
            type: 'event',
            label: 'Event Campaign',
            icon: <Calendar className="h-5 w-5" />,
            description: 'Fundraising campaign tied to a specific event',
            features: ['Event management', 'Registration system', 'Ticketing integration', 'Live updates']
        },
        {
            type: 'recurring',
            label: 'Recurring Donations',
            icon: <TrendingUp className="h-5 w-5" />,
            description: 'Ongoing monthly or quarterly donation campaigns',
            features: ['Subscription management', 'Automatic processing', 'Donor retention tools', 'Impact reporting']
        }
    ]

    const templates = [
        {
            id: 'emergency-flood',
            title: 'Emergency Flood Relief',
            category: 'emergency',
            description: 'Template for urgent flood disaster relief campaigns',
            goal: 100000,
            duration: 30
        },
        {
            id: 'school-supplies',
            title: 'Back to School Supplies',
            category: 'education',
            description: 'Educational supplies fundraising template',
            goal: 25000,
            duration: 60
        },
        {
            id: 'medical-treatment',
            title: 'Medical Treatment Fund',
            category: 'healthcare',
            description: 'Individual medical treatment fundraising',
            goal: 50000,
            duration: 90
        }
    ]

    const handleInputChange = (field: string, value: any) => {
        setCampaignData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleFileUpload = (files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files)
            setCampaignData(prev => ({
                ...prev,
                mediaFiles: [...prev.mediaFiles, ...newFiles]
            }))
        }
    }

    const handleTagAdd = (tag: string) => {
        if (tag && !campaignData.tags.includes(tag)) {
            setCampaignData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }))
        }
    }

    const handleTagRemove = (tagToRemove: string) => {
        setCampaignData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const calculateProgress = (raised: number, goal: number) => {
        return Math.min((raised / goal) * 100, 100)
    }

    const renderCampaignBuilder = () => (
        <div className="space-y-8">
            {/* Campaign Type Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Campaign Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaignTypes.map((type) => (
                        <motion.div
                            key={type.type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleInputChange('type', type.type)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${campaignData.type === type.type
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-green-300'
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${campaignData.type === type.type ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {type.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">{type.label}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                                    <div className="space-y-1">
                                        {type.features.map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                                                <div className="w-1 h-1 bg-green-400 rounded-full" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
                        <input
                            type="text"
                            value={campaignData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter a compelling campaign title..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                        <textarea
                            value={campaignData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Brief description of your campaign..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fundraising Goal</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">RON</span>
                                <input
                                    type="number"
                                    value={campaignData.goal}
                                    onChange={(e) => handleInputChange('goal', e.target.value)}
                                    placeholder="50000"
                                    className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={campaignData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.icon} {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={campaignData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={campaignData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Story */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Story</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tell Your Story</label>
                        <textarea
                            value={campaignData.story}
                            onChange={(e) => handleInputChange('story', e.target.value)}
                            placeholder="Share the compelling story behind your campaign. Why is this cause important? How will donations make a difference? Personal stories and specific examples help donors connect with your mission..."
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Tip: Include specific examples, personal stories, and clear explanations of how funds will be used.
                        </p>
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Media Files</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                            <div className="space-y-2">
                                <div className="flex justify-center space-x-2">
                                    <Image className="h-8 w-8 text-gray-400" />
                                    <Video className="h-8 w-8 text-gray-400" />
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600">Drag and drop files here, or click to browse</p>
                                <p className="text-xs text-gray-500">
                                    Supported formats: JPG, PNG, MP4, PDF (Max 10MB each)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,.pdf"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    className="hidden"
                                    id="media-upload"
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-pointer hover:bg-green-200 transition-colors"
                                >
                                    Choose Files
                                </label>
                            </div>
                        </div>

                        {/* File List */}
                        {campaignData.mediaFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {campaignData.mediaFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">{file.name}</span>
                                            <span className="text-xs text-gray-500">
                                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setCampaignData(prev => ({
                                                    ...prev,
                                                    mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
                                                }))
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Settings</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={campaignData.publicVisible}
                                onChange={(e) => handleInputChange('publicVisible', e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Public Visibility</span>
                                <p className="text-xs text-gray-500">Campaign appears in public listings</p>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={campaignData.allowComments}
                                onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Allow Comments</span>
                                <p className="text-xs text-gray-500">Donors can leave public comments</p>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={campaignData.emailUpdates}
                                onChange={(e) => handleInputChange('emailUpdates', e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Email Updates</span>
                                <p className="text-xs text-gray-500">Send progress updates to donors</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        <span>Save Draft</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                    </motion.button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                    <Share2 className="h-4 w-4" />
                    <span>Launch Campaign</span>
                </motion.button>
            </div>
        </div>
    )

    const renderTemplates = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Campaign Templates</h3>
                <p className="text-gray-600">Start with a proven template and customize to your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">{template.title}</h4>
                                <p className="text-sm text-gray-600">{template.description}</p>
                            </div>
                            <span className="text-lg">
                                {categories.find(c => c.value === template.category)?.icon}
                            </span>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Suggested Goal:</span>
                                <span className="font-medium">{formatCurrency(template.goal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">{template.duration} days</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setCampaignData(prev => ({
                                    ...prev,
                                    title: template.title,
                                    category: template.category,
                                    goal: template.goal.toString()
                                }))
                                setActiveTab('builder')
                            }}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                        >
                            Use This Template
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    )

    const renderDrafts = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Draft Campaigns</h3>
                <p className="text-gray-600">Continue working on your saved drafts</p>
            </div>

            <div className="grid gap-4">
                {campaigns.filter(c => c.status === 'draft').map((campaign, index) => (
                    <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2">{campaign.title}</h4>
                                <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Goal: {formatCurrency(campaign.goal)}</span>
                                    <span>Category: {campaign.category}</span>
                                    <span>Last edited: {new Date(campaign.lastActivity).toLocaleDateString('ro-RO')}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                >
                                    Continue Editing
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                                >
                                    Publish
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {campaigns.filter(c => c.status === 'draft').length === 0 && (
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No draft campaigns found</p>
                    <p className="text-sm text-gray-500">Start creating a new campaign to see drafts here</p>
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/50 p-1 rounded-xl">
                {[
                    { id: 'builder', label: 'Campaign Builder', icon: Plus },
                    { id: 'templates', label: 'Templates', icon: FileText },
                    { id: 'drafts', label: 'Drafts', icon: Save }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${activeTab === tab.id
                                ? 'bg-white text-green-600 shadow-md'
                                : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'builder' && renderCampaignBuilder()}
                {activeTab === 'templates' && renderTemplates()}
                {activeTab === 'drafts' && renderDrafts()}
            </motion.div>
        </div>
    )
}
