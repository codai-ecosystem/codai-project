import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Trophy,
    Share2,
    Target,
    TrendingUp,
    Star,
    Award,
    ChevronRight,
    ExternalLink,
    Heart,
    MessageCircle,
    Copy,
    UserPlus,
    Crown
} from 'lucide-react'

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

interface Campaign {
    id: string
    title: string
    description: string
    goal: number
    raised: number
    type: 'standard' | 'peer-to-peer' | 'event' | 'recurring'
    category: string
    status: 'draft' | 'active' | 'paused' | 'completed'
}

interface P2PFundraisingToolsProps {
    fundraisers: P2PFundraiser[]
    campaigns: Campaign[]
}

export function P2PFundraisingTools({ fundraisers, campaigns }: P2PFundraisingToolsProps) {
    const [activeView, setActiveView] = useState<'leaderboard' | 'tools' | 'templates' | 'analytics'>('leaderboard')
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all')

    const p2pCampaigns = campaigns.filter(c => c.type === 'peer-to-peer')

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const calculateProgress = (raised: number, goal: number) => {
        return Math.min((raised / goal) * 100, 100)
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Award className="h-5 w-5 text-gray-400" />
            case 3:
                return <Award className="h-5 w-5 text-orange-400" />
            default:
                return <Trophy className="h-4 w-4 text-gray-400" />
        }
    }

    const renderLeaderboard = () => (
        <div className="space-y-6">
            {/* Top Performers */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Top Fundraisers</h3>
                    <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="all">All Campaigns</option>
                        {p2pCampaigns.map(campaign => (
                            <option key={campaign.id} value={campaign.id}>
                                {campaign.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Podium View for Top 3 */}
                <div className="flex justify-center items-end space-x-4 mb-8">
                    {fundraisers.slice(0, 3).map((fundraiser, index) => {
                        const position = index + 1
                        const height = position === 1 ? 'h-24' : position === 2 ? 'h-20' : 'h-16'
                        const bgColor = position === 1 ? 'from-yellow-400 to-yellow-600' :
                            position === 2 ? 'from-gray-300 to-gray-500' :
                                'from-orange-300 to-orange-500'

                        return (
                            <motion.div
                                key={fundraiser.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className={`flex flex-col items-center ${position !== 1 ? 'mt-4' : ''}`}
                            >
                                <div className="relative mb-2">
                                    {fundraiser.profileImage ? (
                                        <img
                                            src={fundraiser.profileImage}
                                            alt={fundraiser.fundraiserName}
                                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${bgColor} flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg`}>
                                            {getInitials(fundraiser.fundraiserName)}
                                        </div>
                                    )}
                                    <div className="absolute -top-2 -right-2">
                                        {getRankIcon(position)}
                                    </div>
                                </div>

                                <div className={`bg-gradient-to-t ${bgColor} ${height} w-20 rounded-t-lg flex flex-col justify-end p-2`}>
                                    <div className="text-white text-center">
                                        <div className="font-bold text-sm">{fundraiser.fundraiserName.split(' ')[0]}</div>
                                        <div className="text-xs">{formatCurrency(fundraiser.raised)}</div>
                                    </div>
                                </div>

                                <div className="text-center mt-2">
                                    <div className="text-xs text-gray-600">
                                        {((fundraiser.raised / fundraiser.goal) * 100).toFixed(0)}% of goal
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Full Leaderboard */}
                <div className="space-y-3">
                    {fundraisers.map((fundraiser, index) => (
                        <motion.div
                            key={fundraiser.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`p-4 rounded-xl border transition-all ${index < 3
                                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                                    : 'bg-gradient-to-r from-gray-50 to-green-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${fundraiser.rank === 1 ? 'bg-yellow-500' :
                                            fundraiser.rank === 2 ? 'bg-gray-400' :
                                                fundraiser.rank === 3 ? 'bg-orange-400' :
                                                    'bg-blue-500'
                                        }`}>
                                        {fundraiser.rank}
                                    </div>

                                    {fundraiser.profileImage ? (
                                        <img
                                            src={fundraiser.profileImage}
                                            alt={fundraiser.fundraiserName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {getInitials(fundraiser.fundraiserName)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{fundraiser.fundraiserName}</h4>
                                    <p className="text-sm text-gray-600 mb-1">{fundraiser.campaignTitle}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>Goal: {formatCurrency(fundraiser.goal)}</span>
                                        <span>{fundraiser.donorCount} donors</span>
                                        <span>{fundraiser.shareCount} shares</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatCurrency(fundraiser.raised)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {calculateProgress(fundraiser.raised, fundraiser.goal).toFixed(1)}%
                                    </div>
                                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full"
                                            style={{ width: `${Math.min(calculateProgress(fundraiser.raised, fundraiser.goal), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Campaign Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {fundraisers.length}
                        </div>
                        <div className="text-sm text-gray-600">Active Fundraisers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {formatCurrency(fundraisers.reduce((sum, f) => sum + f.raised, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total Raised</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {((fundraisers.reduce((sum, f) => sum + f.raised, 0) / fundraisers.reduce((sum, f) => sum + f.goal, 0)) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Average Progress</div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderTools = () => (
        <div className="space-y-6">
            {/* Fundraiser Tools */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Fundraiser Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-blue-500 p-2 rounded-lg">
                                <Share2 className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Social Sharing Kit</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Pre-designed social media templates and sharing tools for fundraisers
                        </p>
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                                Download Kit
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-white text-blue-500 border border-blue-500 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                            >
                                Preview
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-green-500 p-2 rounded-lg">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Goal Setting Guide</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Best practices for setting realistic and achievable fundraising goals
                        </p>
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                            >
                                View Guide
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-white text-green-500 border border-green-500 rounded-lg text-sm hover:bg-green-50 transition-colors"
                            >
                                Calculator
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-purple-500 p-2 rounded-lg">
                                <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Communication Templates</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Email and message templates for reaching out to potential donors
                        </p>
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                            >
                                Browse Templates
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-white text-purple-500 border border-purple-500 rounded-lg text-sm hover:bg-purple-50 transition-colors"
                            >
                                Customize
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-orange-500 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Progress Tracking</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Monitor your fundraising progress and optimize your strategy
                        </p>
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                            >
                                View Dashboard
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-white text-orange-500 border border-orange-500 rounded-lg text-sm hover:bg-orange-50 transition-colors"
                            >
                                Analytics
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                        <UserPlus className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Invite Fundraisers</div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                        <Share2 className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Share Campaign</div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all"
                    >
                        <Trophy className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Create Challenge</div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
                    >
                        <Heart className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Send Thanks</div>
                    </motion.button>
                </div>
            </div>
        </div>
    )

    const renderTemplates = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">P2P Templates</h3>
                <p className="text-gray-600">Ready-to-use templates for peer-to-peer fundraising pages</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    {
                        id: 'birthday',
                        title: 'Birthday Fundraiser',
                        description: 'Celebrate your birthday by raising funds for a cause you care about',
                        preview: '🎂',
                        features: ['Personal story section', 'Gift replacement message', 'Progress tracking', 'Social sharing']
                    },
                    {
                        id: 'memorial',
                        title: 'Memorial Campaign',
                        description: 'Honor someone special by continuing their legacy through giving',
                        preview: '🕊️',
                        features: ['Memorial tribute', 'Memory sharing', 'Family coordination', 'Tribute messages']
                    },
                    {
                        id: 'challenge',
                        title: 'Personal Challenge',
                        description: 'Complete a personal challenge while raising funds',
                        preview: '🏃‍♂️',
                        features: ['Challenge tracking', 'Milestone updates', 'Sponsor levels', 'Achievement badges']
                    },
                    {
                        id: 'team',
                        title: 'Team Fundraiser',
                        description: 'Coordinate fundraising efforts with friends, family, or colleagues',
                        preview: '👥',
                        features: ['Team leaderboard', 'Collaborative goals', 'Team messaging', 'Joint updates']
                    },
                    {
                        id: 'corporate',
                        title: 'Corporate Challenge',
                        description: 'Engage employees in workplace giving initiatives',
                        preview: '🏢',
                        features: ['Department competition', 'Corporate matching', 'Employee engagement', 'Progress dashboard']
                    },
                    {
                        id: 'event',
                        title: 'Event Fundraiser',
                        description: 'Fundraise around a specific event or milestone',
                        preview: '🎉',
                        features: ['Event countdown', 'Registration integration', 'Live updates', 'Photo sharing']
                    }
                ].map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">{template.preview}</div>
                            <h4 className="font-bold text-gray-900 mb-1">{template.title}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                            {template.features.map((feature, i) => (
                                <div key={i} className="flex items-center space-x-2 text-xs text-gray-600">
                                    <div className="w-1 h-1 bg-green-400 rounded-full" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                            >
                                Use Template
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">P2P Performance Analytics</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {fundraisers.length}
                        </div>
                        <div className="text-sm text-gray-600">Active Fundraisers</div>
                        <div className="text-xs text-green-600 mt-1">+12% this month</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {formatCurrency(fundraisers.reduce((sum, f) => sum + f.raised, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total P2P Raised</div>
                        <div className="text-xs text-blue-600 mt-1">+28% this month</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {(fundraisers.reduce((sum, f) => sum + f.raised, 0) / fundraisers.length).toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Avg per Fundraiser</div>
                        <div className="text-xs text-purple-600 mt-1">+15% this month</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                            {fundraisers.reduce((sum, f) => sum + f.shareCount, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Shares</div>
                        <div className="text-xs text-orange-600 mt-1">+42% this month</div>
                    </div>
                </div>

                {/* Top Performing Campaigns */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Top Performing P2P Campaigns</h4>
                    <div className="space-y-3">
                        {p2pCampaigns.map((campaign, index) => {
                            const campaignFundraisers = fundraisers.filter(f => f.campaignId === campaign.id)
                            const totalRaised = campaignFundraisers.reduce((sum, f) => sum + f.raised, 0)
                            const progress = (totalRaised / campaign.goal) * 100

                            return (
                                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900">{campaign.title}</h5>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                            <span>{campaignFundraisers.length} fundraisers</span>
                                            <span>{formatCurrency(totalRaised)} raised</span>
                                            <span>{progress.toFixed(1)}% of goal</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/50 p-1 rounded-xl">
                {[
                    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                    { id: 'tools', label: 'Tools & Resources', icon: Target },
                    { id: 'templates', label: 'Templates', icon: Copy },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                {activeView === 'leaderboard' && renderLeaderboard()}
                {activeView === 'tools' && renderTools()}
                {activeView === 'templates' && renderTemplates()}
                {activeView === 'analytics' && renderAnalytics()}
            </motion.div>
        </div>
    )
}
