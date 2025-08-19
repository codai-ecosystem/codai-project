'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Megaphone,
    Plus,
    Users,
    Calendar,
    Target,
    Share2,
    Zap,
    Search,
    Filter,
    TrendingUp,
    Heart,
    Gift,
    UserPlus,
    Award,
    Settings
} from 'lucide-react'

// Import modular components
import { CampaignCreator } from './components/CampaignCreator'
import { P2PFundraisingTools } from './components/P2PFundraisingTools'
import { EventManagement } from './components/EventManagement'
import { SocialSharing } from './components/SocialSharing'
import { FundraisingAnalytics } from './components/FundraisingAnalytics'
import { DonorEngagement } from './components/DonorEngagement'

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

interface FundraisingEvent {
    id: string
    name: string
    type: 'gala' | 'marathon' | 'auction' | 'concert' | 'conference' | 'workshop'
    date: string
    location: string
    capacity: number
    registered: number
    ticketPrice: number
    expectedRevenue: number
    status: 'planning' | 'active' | 'completed' | 'cancelled'
    campaignId?: string
}

interface P2PFundraiser {
    id: string
    fundraiserName: string
    campaignId: string
    campaignTitle: string
    goal: number
    raised: number
    donorCount: number
    shareCount: number
    profileImage?: string
    personalStory: string
    createdDate: string
    lastActivity: string
    rank: number
}

export default function FundraisingToolsPage() {
    const [activeView, setActiveView] = useState<'overview' | 'campaigns' | 'p2p' | 'events' | 'social' | 'analytics' | 'engagement'>('overview')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState<string>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Sample data
    const campaigns: Campaign[] = [
        {
            id: '1',
            title: 'Ajutor pentru Familiile Afectate de Inundații',
            description: 'Campanie de urgență pentru susținerea familiilor afectate de inundațiile din Moldova',
            goal: 250000,
            raised: 187350,
            type: 'standard',
            category: 'emergency',
            status: 'active',
            startDate: '2025-08-01',
            endDate: '2025-09-01',
            organizerId: 'org-1',
            organizerName: 'Crucea Roșie România',
            participantCount: 45,
            donorCount: 892,
            averageDonation: 210,
            lastActivity: '2025-08-08T10:30:00Z',
            imageUrl: '/api/placeholder/400/200'
        },
        {
            id: '2',
            title: 'Biblioteci Digitale pentru Școli Rurale',
            description: 'Echiparea școlilor din mediul rural cu biblioteci digitale moderne',
            goal: 150000,
            raised: 89400,
            type: 'peer-to-peer',
            category: 'education',
            status: 'active',
            startDate: '2025-07-15',
            endDate: '2025-10-15',
            organizerId: 'org-2',
            organizerName: 'Fundația Educație Pentru Toți',
            participantCount: 78,
            donorCount: 456,
            averageDonation: 196,
            lastActivity: '2025-08-08T09:15:00Z'
        },
        {
            id: '3',
            title: 'Maratonul Speranței București 2025',
            description: 'Eveniment caritabil de alergare pentru susținerea cercetării medicale',
            goal: 500000,
            raised: 345600,
            type: 'event',
            category: 'healthcare',
            status: 'active',
            startDate: '2025-06-01',
            endDate: '2025-09-15',
            organizerId: 'org-3',
            organizerName: 'Fundația Cercetare Medicală',
            participantCount: 234,
            donorCount: 1245,
            averageDonation: 278,
            lastActivity: '2025-08-08T11:45:00Z'
        }
    ]

    const events: FundraisingEvent[] = [
        {
            id: '1',
            name: 'Gala Caritabilă de Toamnă',
            type: 'gala',
            date: '2025-09-20',
            location: 'Palatul Parlamentului, București',
            capacity: 500,
            registered: 342,
            ticketPrice: 250,
            expectedRevenue: 125000,
            status: 'active',
            campaignId: '1'
        },
        {
            id: '2',
            name: 'Concert pentru Educație',
            type: 'concert',
            date: '2025-08-25',
            location: 'Sala Palatului, București',
            capacity: 1200,
            registered: 876,
            ticketPrice: 75,
            expectedRevenue: 90000,
            status: 'active',
            campaignId: '2'
        }
    ]

    const p2pFundraisers: P2PFundraiser[] = [
        {
            id: '1',
            fundraiserName: 'Maria Popescu',
            campaignId: '2',
            campaignTitle: 'Biblioteci Digitale pentru Școli Rurale',
            goal: 5000,
            raised: 3420,
            donorCount: 28,
            shareCount: 156,
            personalStory: 'Sunt profesoară într-o școală rurală și știu cât de importante sunt resursele educaționale moderne.',
            createdDate: '2025-07-20',
            lastActivity: '2025-08-08T08:20:00Z',
            rank: 1
        },
        {
            id: '2',
            fundraiserName: 'Alexandru Ionescu',
            campaignId: '3',
            campaignTitle: 'Maratonul Speranței București 2025',
            goal: 3000,
            raised: 2890,
            donorCount: 34,
            shareCount: 89,
            personalStory: 'Alerg pentru mama mea care a învins cancerul cu ajutorul cercetării medicale.',
            createdDate: '2025-06-15',
            lastActivity: '2025-08-08T07:30:00Z',
            rank: 2
        }
    ]

    const viewOptions = [
        { id: 'overview', label: 'Overview', icon: TrendingUp, description: 'Fundraising dashboard and summary' },
        { id: 'campaigns', label: 'Campaign Creator', icon: Megaphone, description: 'Create and manage campaigns' },
        { id: 'p2p', label: 'P2P Fundraising', icon: Users, description: 'Peer-to-peer fundraising tools' },
        { id: 'events', label: 'Event Management', icon: Calendar, description: 'Organize fundraising events' },
        { id: 'social', label: 'Social Sharing', icon: Share2, description: 'Social media integration' },
        { id: 'analytics', label: 'Analytics', icon: Target, description: 'Performance insights' },
        { id: 'engagement', label: 'Donor Engagement', icon: Heart, description: 'Donor relationship management' }
    ]

    const filterOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'standard', label: 'Standard Campaigns' },
        { value: 'peer-to-peer', label: 'P2P Campaigns' },
        { value: 'event', label: 'Event Campaigns' },
        { value: 'recurring', label: 'Recurring Campaigns' }
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const getProgressPercentage = (raised: number, goal: number) => {
        return Math.min((raised / goal) * 100, 100)
    }

    const getCampaignTypeIcon = (type: string) => {
        switch (type) {
            case 'peer-to-peer':
                return <Users className="h-4 w-4" />
            case 'event':
                return <Calendar className="h-4 w-4" />
            case 'recurring':
                return <Zap className="h-4 w-4" />
            default:
                return <Megaphone className="h-4 w-4" />
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'emergency':
                return '🚨'
            case 'education':
                return '🎓'
            case 'healthcare':
                return '🏥'
            case 'environment':
                return '🌱'
            case 'community':
                return '🏘️'
            default:
                return '❤️'
        }
    }

    const renderOverviewView = () => (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200"
                >
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Megaphone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Campaigns</p>
                            <p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'active').length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-green-600">+2 this month</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
                >
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">P2P Fundraisers</p>
                            <p className="text-2xl font-bold text-gray-900">{p2pFundraisers.length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-blue-600">5 new this week</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
                >
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Upcoming Events</p>
                            <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'active').length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-purple-600">Next: Aug 25</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
                >
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Raised</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(campaigns.reduce((sum, c) => sum + c.raised, 0))}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-orange-600">74% of goal</p>
                </motion.div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Campaigns</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Campaign</span>
                    </motion.button>
                </div>

                <div className="grid gap-4">
                    {campaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-lg">{getCategoryIcon(campaign.category)}</span>
                                        <h4 className="font-bold text-gray-900">{campaign.title}</h4>
                                        <div className="flex items-center space-x-1 text-green-600">
                                            {getCampaignTypeIcon(campaign.type)}
                                            <span className="text-xs font-medium capitalize">{campaign.type.replace('-', ' ')}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-3">{campaign.description}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                    {campaign.status}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex-1 mr-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${getProgressPercentage(campaign.raised, campaign.goal)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}% reached</span>
                                        <span>{Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-3 w-3" />
                                        <span>{campaign.donorCount} donors</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <UserPlus className="h-3 w-3" />
                                        <span>{campaign.participantCount} participants</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Gift className="h-3 w-3" />
                                        <span>Avg: {formatCurrency(campaign.averageDonation)}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">{campaign.organizerName}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Top P2P Fundraisers */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top P2P Fundraisers</h3>
                <div className="space-y-4">
                    {p2pFundraisers.map((fundraiser, index) => (
                        <motion.div
                            key={fundraiser.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${fundraiser.rank === 1 ? 'bg-yellow-500' :
                                        fundraiser.rank === 2 ? 'bg-gray-400' :
                                            'bg-orange-400'
                                    }`}>
                                    {fundraiser.rank}
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {fundraiser.fundraiserName.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{fundraiser.fundraiserName}</h4>
                                <p className="text-sm text-gray-600">{fundraiser.campaignTitle}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                    <span>{formatCurrency(fundraiser.raised)} raised</span>
                                    <span>{fundraiser.donorCount} donors</span>
                                    <span>{fundraiser.shareCount} shares</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {((fundraiser.raised / fundraiser.goal) * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">of goal</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                            <Megaphone className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Fundraising Tools
                            </h1>
                            <p className="text-gray-600">Create campaigns, engage donors, and amplify your impact</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {viewOptions.map((option) => (
                            <motion.button
                                key={option.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveView(option.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeView === option.id
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                        : 'bg-white/80 text-gray-700 hover:bg-white border border-green-100'
                                    }`}
                            >
                                <option.icon className="h-4 w-4" />
                                <span className="font-medium">{option.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns, fundraisers, events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                            >
                                {filterOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeView === 'overview' && renderOverviewView()}
                    {activeView === 'campaigns' && <CampaignCreator campaigns={campaigns} />}
                    {activeView === 'p2p' && <P2PFundraisingTools fundraisers={p2pFundraisers} campaigns={campaigns} />}
                    {activeView === 'events' && <EventManagement events={events} campaigns={campaigns} />}
                    {activeView === 'social' && <SocialSharing campaigns={campaigns} />}
                    {activeView === 'analytics' && <FundraisingAnalytics campaigns={campaigns} events={events} />}
                    {activeView === 'engagement' && <DonorEngagement campaigns={campaigns} />}
                </motion.div>

                {/* Create Campaign Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Campaign</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setActiveView('campaigns')
                                            setShowCreateModal(false)
                                        }}
                                        className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all"
                                    >
                                        <Megaphone className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                        <div className="text-sm font-medium text-gray-900">Standard Campaign</div>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setActiveView('p2p')
                                            setShowCreateModal(false)
                                        }}
                                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all"
                                    >
                                        <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                        <div className="text-sm font-medium text-gray-900">P2P Campaign</div>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setActiveView('events')
                                            setShowCreateModal(false)
                                        }}
                                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all"
                                    >
                                        <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                        <div className="text-sm font-medium text-gray-900">Event Campaign</div>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-yellow-100 transition-all"
                                    >
                                        <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                                        <div className="text-sm font-medium text-gray-900">Recurring Campaign</div>
                                    </motion.button>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(false)}
                                className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
