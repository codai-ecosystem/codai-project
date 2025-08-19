import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Share2,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    MessageCircle,
    Link2,
    Download,
    Copy,
    QrCode,
    Mail,
    Smartphone,
    Image,
    Video,
    FileText,
    Eye,
    Users,
    TrendingUp,
    Heart,
    Send,
    Calendar,
    MapPin,
    Target,
    Award,
    Star,
    Gift,
    Zap,
    Megaphone
} from 'lucide-react'

interface SocialPlatform {
    id: string
    name: string
    icon: React.ReactNode
    color: string
    connected: boolean
    followers: number
    engagement: number
    posts: number
}

interface ShareContent {
    id: string
    type: 'text' | 'image' | 'video' | 'story'
    title: string
    content: string
    image?: string
    platforms: string[]
    scheduled?: string
    status: 'draft' | 'scheduled' | 'published'
    engagement: {
        likes: number
        shares: number
        comments: number
        reach: number
    }
}

interface Campaign {
    id: string
    title: string
    goal: number
    raised: number
    status: 'active' | 'paused' | 'completed'
    url: string
}

interface SocialSharingProps {
    campaigns: Campaign[]
    shareHistory: ShareContent[]
}

export function SocialSharing({ campaigns, shareHistory }: SocialSharingProps) {
    const [activeView, setActiveView] = useState<'platforms' | 'create' | 'schedule' | 'analytics'>('platforms')
    const [selectedCampaign, setSelectedCampaign] = useState<string>('')
    const [showShareModal, setShowShareModal] = useState(false)

    const [newPost, setNewPost] = useState({
        type: 'text' as const,
        title: '',
        content: '',
        platforms: [] as string[],
        scheduled: '',
        campaignId: '',
        includeHashtags: true,
        includeLink: true,
        autoOptimize: true
    })

    const socialPlatforms: SocialPlatform[] = [
        {
            id: 'facebook',
            name: 'Facebook',
            icon: <Facebook className="h-5 w-5" />,
            color: 'bg-blue-600',
            connected: true,
            followers: 12500,
            engagement: 4.2,
            posts: 145
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: <Instagram className="h-5 w-5" />,
            color: 'bg-pink-600',
            connected: true,
            followers: 8900,
            engagement: 6.8,
            posts: 98
        },
        {
            id: 'twitter',
            name: 'Twitter',
            icon: <Twitter className="h-5 w-5" />,
            color: 'bg-blue-400',
            connected: true,
            followers: 5600,
            engagement: 3.1,
            posts: 267
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: <Linkedin className="h-5 w-5" />,
            color: 'bg-blue-700',
            connected: false,
            followers: 0,
            engagement: 0,
            posts: 0
        },
        {
            id: 'youtube',
            name: 'YouTube',
            icon: <Youtube className="h-5 w-5" />,
            color: 'bg-red-600',
            connected: true,
            followers: 3200,
            engagement: 5.4,
            posts: 24
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: <MessageCircle className="h-5 w-5" />,
            color: 'bg-green-600',
            connected: true,
            followers: 0,
            engagement: 8.9,
            posts: 56
        }
    ]

    const contentTemplates = [
        {
            id: 'donation-appeal',
            name: 'Donation Appeal',
            icon: <Heart className="h-4 w-4" />,
            template: 'Hai să fim alături de {cauza}! Fiecare donație contează și împreună putem face diferența. Donează acum: {link} #DonaiImpact #Caritate',
            platforms: ['facebook', 'instagram', 'twitter']
        },
        {
            id: 'milestone-celebration',
            name: 'Milestone Celebration',
            icon: <Award className="h-4 w-4" />,
            template: '🎉 Minunat! Am atins {procent}% din obiectivul nostru! Mulțumim tuturor donatorilor care au contribuit la {campania}. Continuăm împreună! {link}',
            platforms: ['facebook', 'instagram', 'linkedin']
        },
        {
            id: 'impact-story',
            name: 'Impact Story',
            icon: <Star className="h-4 w-4" />,
            template: 'Povestea lui {nume} ne arată că fiecare donație creează un impact real. Grație vouă, {realizare}. Să continuăm să schimbăm vieți: {link}',
            platforms: ['facebook', 'instagram', 'linkedin']
        },
        {
            id: 'event-promotion',
            name: 'Event Promotion',
            icon: <Calendar className="h-4 w-4" />,
            template: 'Te așteptăm la {eveniment} pe {data} la {locatie}! Un eveniment caritabil unde putem face diferența împreună. Detalii: {link}',
            platforms: ['facebook', 'instagram', 'twitter']
        },
        {
            id: 'urgent-appeal',
            name: 'Urgent Appeal',
            icon: <Zap className="h-4 w-4" />,
            template: '🚨 URGENT! {cauza} are nevoie de ajutorul nostru ACUM. Doar {suma} și putem {obiectiv}. Fiecare secundă contează: {link}',
            platforms: ['facebook', 'twitter', 'whatsapp']
        },
        {
            id: 'thank-you',
            name: 'Thank You Post',
            icon: <Gift className="h-4 w-4" />,
            template: 'Mulțumim din suflet tuturor donatorilor! Grație generozității voastre, {realizare}. Sunteți minunați! 💚 {link}',
            platforms: ['facebook', 'instagram', 'linkedin']
        }
    ]

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const getEngagementColor = (engagement: number) => {
        if (engagement >= 6) return 'text-green-600'
        if (engagement >= 4) return 'text-yellow-600'
        return 'text-red-600'
    }

    const handlePlatformToggle = (platformId: string) => {
        setNewPost(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platformId)
                ? prev.platforms.filter(p => p !== platformId)
                : [...prev.platforms, platformId]
        }))
    }

    const handleTemplateSelect = (template: any) => {
        setNewPost(prev => ({
            ...prev,
            content: template.template,
            platforms: template.platforms
        }))
    }

    const handleSchedulePost = () => {
        console.log('Scheduling post:', newPost)
        setShowShareModal(false)
        setNewPost({
            type: 'text',
            title: '',
            content: '',
            platforms: [],
            scheduled: '',
            campaignId: '',
            includeHashtags: true,
            includeLink: true,
            autoOptimize: true
        })
    }

    const renderPlatforms = () => (
        <div className="space-y-6">
            {/* Platform Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Connected Platforms</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShareModal(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Share2 className="h-4 w-4" />
                        <span>Create Post</span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {socialPlatforms.map((platform, index) => (
                        <motion.div
                            key={platform.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border ${platform.connected ? 'border-green-200' : 'border-gray-200'
                                } hover:shadow-lg transition-all duration-300`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`${platform.color} p-2 rounded-lg text-white`}>
                                        {platform.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{platform.name}</h4>
                                        <div className={`text-xs font-medium ${platform.connected ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                            {platform.connected ? 'Connected' : 'Not Connected'}
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${platform.connected
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                >
                                    {platform.connected ? 'Disconnect' : 'Connect'}
                                </motion.button>
                            </div>

                            {platform.connected && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Followers</span>
                                        <span className="font-medium text-gray-900">
                                            {formatNumber(platform.followers)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Engagement</span>
                                        <span className={`font-medium ${getEngagementColor(platform.engagement)}`}>
                                            {platform.engagement}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Posts</span>
                                        <span className="font-medium text-gray-900">
                                            {platform.posts}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Link2, label: 'Generate Links', color: 'bg-blue-500' },
                        { icon: QrCode, label: 'QR Codes', color: 'bg-purple-500' },
                        { icon: Download, label: 'Media Kit', color: 'bg-green-500' },
                        { icon: Megaphone, label: 'Campaigns', color: 'bg-orange-500' }
                    ].map((action, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`${action.color} text-white p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center space-y-2`}
                        >
                            <action.icon className="h-6 w-6" />
                            <span className="text-sm font-medium">{action.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderCreate = () => (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Create Social Media Post</h3>

                <div className="space-y-6">
                    {/* Campaign Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
                        <select
                            value={newPost.campaignId}
                            onChange={(e) => setNewPost(prev => ({ ...prev, campaignId: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">Select a campaign...</option>
                            {campaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.title} - {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content Templates */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Content Templates</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {contentTemplates.map((template) => (
                                <motion.button
                                    key={template.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="p-3 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-left"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="text-green-600">
                                            {template.icon}
                                        </div>
                                        <span className="font-medium text-gray-900">{template.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {template.template.substring(0, 100)}...
                                    </p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Post Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                        <textarea
                            value={newPost.content}
                            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your post content..."
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {newPost.content.length} characters
                        </div>
                    </div>

                    {/* Platform Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {socialPlatforms.filter(p => p.connected).map((platform) => (
                                <motion.button
                                    key={platform.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handlePlatformToggle(platform.id)}
                                    className={`p-3 rounded-xl border transition-all ${newPost.platforms.includes(platform.id)
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className={`${platform.color} p-1 rounded text-white`}>
                                            {platform.icon}
                                        </div>
                                        <span className="font-medium text-gray-900">{platform.name}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Post Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Post Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'text', label: 'Text Post', icon: FileText },
                                { value: 'image', label: 'Image Post', icon: Image },
                                { value: 'video', label: 'Video Post', icon: Video },
                                { value: 'story', label: 'Story', icon: Smartphone }
                            ].map((type) => (
                                <motion.button
                                    key={type.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setNewPost(prev => ({ ...prev, type: type.value as any }))}
                                    className={`p-3 rounded-xl border transition-all flex flex-col items-center space-y-1 ${newPost.type === type.value
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                >
                                    <type.icon className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Post (Optional)</label>
                        <input
                            type="datetime-local"
                            value={newPost.scheduled}
                            onChange={(e) => setNewPost(prev => ({ ...prev, scheduled: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Post Options</label>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newPost.includeHashtags}
                                    onChange={(e) => setNewPost(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Include relevant hashtags</span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newPost.includeLink}
                                    onChange={(e) => setNewPost(prev => ({ ...prev, includeLink: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Include campaign link</span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newPost.autoOptimize}
                                    onChange={(e) => setNewPost(prev => ({ ...prev, autoOptimize: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Auto-optimize for each platform</span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Save Draft
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                        >
                            <Eye className="h-4 w-4" />
                            <span>Preview</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSchedulePost}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2"
                        >
                            <Send className="h-4 w-4" />
                            <span>{newPost.scheduled ? 'Schedule' : 'Post Now'}</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderSchedule = () => (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Scheduled Posts</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveView('create')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Schedule New</span>
                    </motion.button>
                </div>

                <div className="space-y-4">
                    {shareHistory.filter(post => post.status === 'scheduled').map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-2">{post.title}</h4>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>

                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Scheduled for: Tomorrow 10:00 AM</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Share2 className="h-3 w-3" />
                                            <span>{post.platforms.length} platforms</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
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
                                        <Send className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {post.platforms.map(platformId => {
                                    const platform = socialPlatforms.find(p => p.id === platformId)
                                    return platform ? (
                                        <div key={platformId} className={`${platform.color} p-1 rounded text-white`}>
                                            {platform.icon}
                                        </div>
                                    ) : null
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderAnalytics = () => (
        <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Share2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-900">
                                {shareHistory.filter(p => p.status === 'published').length}
                            </div>
                            <div className="text-sm text-blue-700">Published Posts</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Eye className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-900">
                                {formatNumber(shareHistory.reduce((sum, p) => sum + p.engagement.reach, 0))}
                            </div>
                            <div className="text-sm text-green-700">Total Reach</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-900">
                                {formatNumber(shareHistory.reduce((sum, p) => sum + p.engagement.likes, 0))}
                            </div>
                            <div className="text-sm text-purple-700">Total Likes</div>
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
                                {((shareHistory.reduce((sum, p) => sum + p.engagement.likes + p.engagement.shares + p.engagement.comments, 0) / shareHistory.reduce((sum, p) => sum + p.engagement.reach, 1)) * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-orange-700">Engagement Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Performance</h3>
                <div className="space-y-4">
                    {socialPlatforms.filter(p => p.connected).map((platform, index) => (
                        <div key={platform.id} className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`${platform.color} p-2 rounded-lg text-white`}>
                                        {platform.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{platform.name}</h4>
                                        <p className="text-sm text-gray-600">{formatNumber(platform.followers)} followers</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${getEngagementColor(platform.engagement)}`}>
                                        {platform.engagement}%
                                    </div>
                                    <div className="text-xs text-gray-500">Engagement</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-bold text-gray-900">{platform.posts}</div>
                                    <div className="text-gray-600">Posts</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-900">
                                        {formatNumber(Math.floor(platform.followers * platform.engagement / 100))}
                                    </div>
                                    <div className="text-gray-600">Avg. Engagement</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-900">
                                        {formatNumber(Math.floor(platform.followers * 0.15))}
                                    </div>
                                    <div className="text-gray-600">Avg. Reach</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Posts Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Posts Performance</h3>
                <div className="space-y-4">
                    {shareHistory.filter(p => p.status === 'published').slice(0, 5).map((post, index) => (
                        <div key={post.id} className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{post.title}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-1">{post.content}</p>
                                </div>
                                <div className="flex space-x-2">
                                    {post.platforms.map(platformId => {
                                        const platform = socialPlatforms.find(p => p.id === platformId)
                                        return platform ? (
                                            <div key={platformId} className={`${platform.color} p-1 rounded text-white`}>
                                                {platform.icon}
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-bold text-blue-600">{formatNumber(post.engagement.reach)}</div>
                                    <div className="text-gray-600">Reach</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-red-600">{formatNumber(post.engagement.likes)}</div>
                                    <div className="text-gray-600">Likes</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">{formatNumber(post.engagement.shares)}</div>
                                    <div className="text-gray-600">Shares</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-purple-600">{formatNumber(post.engagement.comments)}</div>
                                    <div className="text-gray-600">Comments</div>
                                </div>
                            </div>
                        </div>
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
                    { id: 'platforms', label: 'Platforms', icon: Share2 },
                    { id: 'create', label: 'Create Post', icon: Edit },
                    { id: 'schedule', label: 'Schedule', icon: Calendar },
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
                {activeView === 'platforms' && renderPlatforms()}
                {activeView === 'create' && renderCreate()}
                {activeView === 'schedule' && renderSchedule()}
                {activeView === 'analytics' && renderAnalytics()}
            </motion.div>
        </div>
    )
}
