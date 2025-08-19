import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Heart,
    Mail,
    MessageCircle,
    Bell,
    Gift,
    Star,
    Award,
    Calendar,
    Send,
    UserPlus,
    TrendingUp,
    Target,
    Zap,
    Coffee,
    Clock,
    Phone,
    Globe,
    Settings,
    Filter,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Copy,
    Download
} from 'lucide-react'

interface Donor {
    id: string
    name: string
    email: string
    phone?: string
    totalDonated: number
    lastDonation: string
    donationCount: number
    averageDonation: number
    engagementScore: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    preferredContact: 'email' | 'phone' | 'sms'
    interests: string[]
    source: string
    status: 'active' | 'lapsed' | 'new'
}

interface EngagementCampaign {
    id: string
    title: string
    type: 'newsletter' | 'thank_you' | 'update' | 'appeal' | 'event'
    status: 'draft' | 'scheduled' | 'sent'
    targetAudience: string
    sentDate?: string
    recipients: number
    openRate: number
    clickRate: number
    responseRate: number
}

interface DonorEngagementProps {
    donors: Donor[]
    campaigns: EngagementCampaign[]
}

export function DonorEngagement({ donors, campaigns }: DonorEngagementProps) {
    const [activeView, setActiveView] = useState<'overview' | 'donors' | 'campaigns' | 'automation'>('overview')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTier, setSelectedTier] = useState<string>('all')
    const [showNewCampaign, setShowNewCampaign] = useState(false)

    const [newCampaign, setNewCampaign] = useState({
        title: '',
        type: 'newsletter' as const,
        targetAudience: 'all',
        subject: '',
        content: '',
        scheduled: '',
        personalizeContent: true,
        trackEngagement: true,
        followUpEnabled: false
    })

    const donorTiers = [
        { value: 'bronze', label: 'Bronze', color: 'bg-amber-600', min: 0, max: 500 },
        { value: 'silver', label: 'Silver', color: 'bg-gray-400', min: 500, max: 1500 },
        { value: 'gold', label: 'Gold', color: 'bg-yellow-500', min: 1500, max: 5000 },
        { value: 'platinum', label: 'Platinum', color: 'bg-purple-600', min: 5000, max: Infinity }
    ]

    const campaignTypes = [
        { value: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Regular updates and stories' },
        { value: 'thank_you', label: 'Thank You', icon: Heart, description: 'Gratitude messages' },
        { value: 'update', label: 'Impact Update', icon: TrendingUp, description: 'Progress reports' },
        { value: 'appeal', label: 'Donation Appeal', icon: Target, description: 'Fundraising requests' },
        { value: 'event', label: 'Event Invitation', icon: Calendar, description: 'Event announcements' }
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getTierInfo = (tier: string) => {
        return donorTiers.find(t => t.value === tier) || donorTiers[0]
    }

    const getEngagementColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        if (score >= 40) return 'text-orange-600'
        return 'text-red-600'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700'
            case 'lapsed':
                return 'bg-yellow-100 text-yellow-700'
            case 'new':
                return 'bg-blue-100 text-blue-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getDonorSegments = () => {
        const segments = {
            new: donors.filter(d => d.status === 'new').length,
            active: donors.filter(d => d.status === 'active').length,
            lapsed: donors.filter(d => d.status === 'lapsed').length,
            major: donors.filter(d => d.totalDonated >= 5000).length,
            recurring: donors.filter(d => d.donationCount >= 3).length
        }
        return segments
    }

    const handleCreateCampaign = () => {
        console.log('Creating campaign:', newCampaign)
        setShowNewCampaign(false)
        setNewCampaign({
            title: '',
            type: 'newsletter',
            targetAudience: 'all',
            subject: '',
            content: '',
            scheduled: '',
            personalizeContent: true,
            trackEngagement: true,
            followUpEnabled: false
        })
    }

    const renderOverview = () => {
        const segments = getDonorSegments()

        return (
            <div className="space-y-6">
                {/* Engagement Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-2 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-900">{donors.length}</div>
                                <div className="text-sm text-blue-700">Total Donors</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-500 p-2 rounded-lg">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-900">{segments.active}</div>
                                <div className="text-sm text-green-700">Active Donors</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-500 p-2 rounded-lg">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-900">{segments.major}</div>
                                <div className="text-sm text-purple-700">Major Donors</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-orange-500 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-900">
                                    {((campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length) || 0).toFixed(1)}%
                                </div>
                                <div className="text-sm text-orange-700">Avg Response Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donor Segmentation */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Donor Engagement Segments</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {donorTiers.map((tier, index) => {
                            const tierDonors = donors.filter(d => d.tier === tier.value)
                            const avgEngagement = tierDonors.length > 0
                                ? tierDonors.reduce((sum, d) => sum + d.engagementScore, 0) / tierDonors.length
                                : 0

                            return (
                                <motion.div
                                    key={tier.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className={`${tier.color} p-2 rounded-lg`}>
                                            <Award className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{tier.label}</h4>
                                            <p className="text-xs text-gray-600">
                                                {tier.min === 0 ? `Up to ${tier.max}` :
                                                    tier.max === Infinity ? `Over ${tier.min}` :
                                                        `${tier.min} - ${tier.max}`} RON
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Donors</span>
                                            <span className="font-medium text-gray-900">{tierDonors.length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Avg Engagement</span>
                                            <span className={`font-medium ${getEngagementColor(avgEngagement)}`}>
                                                {avgEngagement.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Recent Campaigns */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Campaigns</h3>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowNewCampaign(true)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                        >
                            <Send className="h-4 w-4" />
                            <span>New Campaign</span>
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {campaigns.slice(0, 5).map((campaign, index) => {
                            const typeInfo = campaignTypes.find(t => t.value === campaign.type) || campaignTypes[0]

                            return (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-green-500 p-2 rounded-lg text-white">
                                            <typeInfo.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{campaign.title}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>{campaign.recipients} recipients</span>
                                                <span>{campaign.openRate.toFixed(1)}% open rate</span>
                                                <span>{campaign.responseRate.toFixed(1)}% response</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent'
                                                ? 'bg-green-100 text-green-700'
                                                : campaign.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {campaign.status}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    const renderDonors = () => {
        const filteredDonors = donors.filter(donor => {
            const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                donor.email.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesTier = selectedTier === 'all' || donor.tier === selectedTier
            return matchesSearch && matchesTier
        })

        return (
            <div className="space-y-6">
                {/* Filters and Search */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Donor Management</h3>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search donors..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={selectedTier}
                                onChange={(e) => setSelectedTier(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Tiers</option>
                                {donorTiers.map(tier => (
                                    <option key={tier.value} value={tier.value}>
                                        {tier.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Donors List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                    <div className="space-y-4">
                        {filteredDonors.map((donor, index) => (
                            <motion.div
                                key={donor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {donor.name.charAt(0)}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getTierInfo(donor.tier).color} rounded-full border-2 border-white`} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h4 className="font-bold text-gray-900">{donor.name}</h4>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
                                                {donor.status}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>{donor.email}</span>
                                            <span>•</span>
                                            <span>{donor.donationCount} donations</span>
                                            <span>•</span>
                                            <span>Last: {formatDate(donor.lastDonation)}</span>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm mt-1">
                                            <span className="text-gray-600">Total: </span>
                                            <span className="font-medium text-gray-900">{formatCurrency(donor.totalDonated)}</span>
                                            <span className="text-gray-600">Avg: </span>
                                            <span className="font-medium text-gray-900">{formatCurrency(donor.averageDonation)}</span>
                                            <span className="text-gray-600">Engagement: </span>
                                            <span className={`font-medium ${getEngagementColor(donor.engagementScore)}`}>
                                                {donor.engagementScore}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Mail className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderCampaigns = () => (
        <div className="space-y-6">
            {/* Campaign Creation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Engagement Campaigns</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNewCampaign(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Send className="h-4 w-4" />
                        <span>Create Campaign</span>
                    </motion.button>
                </div>

                {/* Campaign Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaignTypes.map((type, index) => (
                        <motion.button
                            key={type.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setNewCampaign(prev => ({ ...prev, type: type.value as any }))
                                setShowNewCampaign(true)
                            }}
                            className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-left"
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="bg-green-500 p-2 rounded-lg text-white">
                                    <type.icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-gray-900">{type.label}</span>
                            </div>
                            <p className="text-sm text-gray-600">{type.description}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Campaign History */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Campaign History</h3>

                <div className="space-y-4">
                    {campaigns.map((campaign, index) => {
                        const typeInfo = campaignTypes.find(t => t.value === campaign.type) || campaignTypes[0]

                        return (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-500 p-3 rounded-lg text-white">
                                            <typeInfo.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-1">{campaign.title}</h4>
                                            <p className="text-gray-600 text-sm mb-2">{typeInfo.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Target: {campaign.targetAudience}</span>
                                                <span>Recipients: {campaign.recipients}</span>
                                                {campaign.sentDate && (
                                                    <span>Sent: {formatDate(campaign.sentDate)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent'
                                                ? 'bg-green-100 text-green-700'
                                                : campaign.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {campaign.status}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                {campaign.status === 'sent' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-blue-700">Open Rate</span>
                                                <span className="font-bold text-blue-900">{campaign.openRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                                                <div
                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                    style={{ width: `${campaign.openRate}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-green-700">Click Rate</span>
                                                <span className="font-bold text-green-900">{campaign.clickRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                                                <div
                                                    className="bg-green-500 h-1.5 rounded-full"
                                                    style={{ width: `${campaign.clickRate}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-purple-700">Response Rate</span>
                                                <span className="font-bold text-purple-900">{campaign.responseRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                                                <div
                                                    className="bg-purple-500 h-1.5 rounded-full"
                                                    style={{ width: `${campaign.responseRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

    const renderAutomation = () => (
        <div className="space-y-6">
            {/* Automation Rules */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Automation Rules</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Zap className="h-4 w-4" />
                        <span>New Rule</span>
                    </motion.button>
                </div>

                <div className="space-y-4">
                    {[
                        {
                            title: 'Welcome New Donors',
                            trigger: 'First donation made',
                            action: 'Send welcome email with impact story',
                            status: 'active',
                            triggered: 23
                        },
                        {
                            title: 'Thank Major Donors',
                            trigger: 'Donation > 1000 RON',
                            action: 'Send personalized thank you with phone call',
                            status: 'active',
                            triggered: 7
                        },
                        {
                            title: 'Re-engage Lapsed Donors',
                            trigger: 'No donation in 6 months',
                            action: 'Send re-engagement campaign',
                            status: 'active',
                            triggered: 45
                        },
                        {
                            title: 'Birthday Greetings',
                            trigger: 'Donor birthday',
                            action: 'Send birthday wishes with donation match offer',
                            status: 'paused',
                            triggered: 12
                        }
                    ].map((rule, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{rule.title}</h4>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Trigger:</span> {rule.trigger}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Action:</span> {rule.action}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Triggered {rule.triggered} times this month
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${rule.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {rule.status}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Automation Templates */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Automation Templates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            title: 'Donor Journey',
                            description: 'Complete automation sequence for new donors',
                            steps: ['Welcome email', 'Impact update', 'Thank you call', 'Feedback request'],
                            icon: UserPlus
                        },
                        {
                            title: 'Retention Campaign',
                            description: 'Re-engage donors at risk of lapsing',
                            steps: ['Warning signal', 'Personal outreach', 'Special offer', 'Final appeal'],
                            icon: Heart
                        },
                        {
                            title: 'Stewardship Program',
                            description: 'Ongoing engagement for major donors',
                            steps: ['Quarterly reports', 'Exclusive events', 'Personal meetings', 'Legacy planning'],
                            icon: Award
                        },
                        {
                            title: 'Event Follow-up',
                            description: 'Post-event engagement sequence',
                            steps: ['Thank you note', 'Photo sharing', 'Feedback survey', 'Next event invite'],
                            icon: Calendar
                        }
                    ].map((template, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="bg-green-500 p-3 rounded-lg text-white">
                                    <template.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{template.title}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {template.steps.map((step, stepIndex) => (
                                    <div key={stepIndex} className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                                            {stepIndex + 1}
                                        </div>
                                        <span className="text-sm text-gray-700">{step}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors font-medium"
                            >
                                Use Template
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/50 p-1 rounded-xl">
                {[
                    { id: 'overview', label: 'Overview', icon: Users },
                    { id: 'donors', label: 'Donor Management', icon: Heart },
                    { id: 'campaigns', label: 'Campaigns', icon: Send },
                    { id: 'automation', label: 'Automation', icon: Zap }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${activeView === tab.id
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
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeView === 'overview' && renderOverview()}
                {activeView === 'donors' && renderDonors()}
                {activeView === 'campaigns' && renderCampaigns()}
                {activeView === 'automation' && renderAutomation()}
            </motion.div>
        </div>
    )
}
