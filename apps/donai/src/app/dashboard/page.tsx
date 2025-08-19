'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Globe,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Search,
  Share2,
  Bookmark,
  Eye,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  Gift,
  HandHeart,
  Zap,
  Star,
  Clock,
  MapPin,
  Users2
} from 'lucide-react'

// TypeScript interfaces for DonAI data structures
interface DonationMetrics {
  totalDonated: number
  totalDonors: number
  activeCampaigns: number
  impactScore: number
  donationsThisMonth: number
  monthlyGrowth: number
  averageDonation: number
  repeatDonors: number
}

interface Campaign {
  id: string
  title: string
  organization: string
  category: string
  raised: number
  goal: number
  donors: number
  daysLeft: number
  image: string
  urgent: boolean
  verified: boolean
  description: string
  impact: string
}

interface RecentDonation {
  id: string
  campaign: string
  amount: number
  donor: string
  date: string
  type: 'one-time' | 'recurring'
  status: 'completed' | 'pending' | 'failed'
}

interface ImpactStory {
  id: string
  title: string
  organization: string
  impact: string
  beneficiaries: number
  image: string
  location: string
  date: string
}

export default function DonAIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for donations metrics
  const [metrics, setMetrics] = useState<DonationMetrics>({
    totalDonated: 124750.00,
    totalDonors: 2847,
    activeCampaigns: 47,
    impactScore: 94.7,
    donationsThisMonth: 23450.00,
    monthlyGrowth: 18.3,
    averageDonation: 43.82,
    repeatDonors: 1678
  })

  // Mock data for featured campaigns
  const [campaigns] = useState<Campaign[]>([
    {
      id: 'camp1',
      title: 'Emergency Relief for Flood Victims',
      organization: 'Red Cross Romania',
      category: 'Emergency Relief',
      raised: 45600,
      goal: 75000,
      donors: 892,
      daysLeft: 12,
      image: '/api/placeholder/300/200',
      urgent: true,
      verified: true,
      description: 'Providing immediate relief to families affected by recent flooding',
      impact: '1,200 families helped'
    },
    {
      id: 'camp2',
      title: 'Education for Rural Children',
      organization: 'Children\'s Future Foundation',
      category: 'Education',
      raised: 28400,
      goal: 50000,
      donors: 456,
      daysLeft: 25,
      image: '/api/placeholder/300/200',
      urgent: false,
      verified: true,
      description: 'Building schools and providing educational resources in rural areas',
      impact: '500 children educated'
    },
    {
      id: 'camp3',
      title: 'Medical Equipment for Hospital',
      organization: 'Healthcare Heroes',
      category: 'Healthcare',
      raised: 67200,
      goal: 80000,
      donors: 1234,
      daysLeft: 8,
      image: '/api/placeholder/300/200',
      urgent: true,
      verified: true,
      description: 'Purchasing critical medical equipment for local hospital',
      impact: '2,000 patients served'
    },
    {
      id: 'camp4',
      title: 'Clean Water Project',
      organization: 'Water for Life',
      category: 'Environment',
      raised: 34800,
      goal: 60000,
      donors: 678,
      daysLeft: 18,
      image: '/api/placeholder/300/200',
      urgent: false,
      verified: true,
      description: 'Installing water purification systems in underserved communities',
      impact: '800 people served'
    }
  ])

  // Mock data for recent donations
  const [recentDonations] = useState<RecentDonation[]>([
    {
      id: 'don1',
      campaign: 'Emergency Relief for Flood Victims',
      amount: 150.00,
      donor: 'Maria Popescu',
      date: '2025-08-08T10:30:00Z',
      type: 'one-time',
      status: 'completed'
    },
    {
      id: 'don2',
      campaign: 'Education for Rural Children',
      amount: 50.00,
      donor: 'Alexandru Ionescu',
      date: '2025-08-08T09:15:00Z',
      type: 'recurring',
      status: 'completed'
    },
    {
      id: 'don3',
      campaign: 'Medical Equipment for Hospital',
      amount: 200.00,
      donor: 'Elena Gheorghe',
      date: '2025-08-08T08:45:00Z',
      type: 'one-time',
      status: 'completed'
    },
    {
      id: 'don4',
      campaign: 'Clean Water Project',
      amount: 75.00,
      donor: 'Andrei Munteanu',
      date: '2025-08-08T08:20:00Z',
      type: 'recurring',
      status: 'pending'
    }
  ])

  // Mock data for impact stories
  const [impactStories] = useState<ImpactStory[]>([
    {
      id: 'story1',
      title: 'Fresh Water Transforms Village Life',
      organization: 'Water for Life',
      impact: 'Access to clean water reduced disease by 80%',
      beneficiaries: 350,
      image: '/api/placeholder/300/200',
      location: 'Rural Teleorman',
      date: '2025-08-05'
    },
    {
      id: 'story2',
      title: 'School Graduation Celebration',
      organization: 'Children\'s Future Foundation',
      impact: 'First graduating class from new rural school',
      beneficiaries: 45,
      image: '/api/placeholder/300/200',
      location: 'Maramureș County',
      date: '2025-08-03'
    },
    {
      id: 'story3',
      title: 'Life-Saving Surgery Success',
      organization: 'Healthcare Heroes',
      impact: 'New equipment enabled complex cardiac surgery',
      beneficiaries: 1,
      image: '/api/placeholder/300/200',
      location: 'Cluj-Napoca Hospital',
      date: '2025-08-01'
    }
  ])

  // Simulated data refresh
  const handleRefresh = async () => {
    setRefreshing(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update metrics with slight variations
    setMetrics(prev => ({
      ...prev,
      totalDonated: prev.totalDonated + Math.random() * 1000,
      totalDonors: prev.totalDonors + Math.floor(Math.random() * 10),
      donationsThisMonth: prev.donationsThisMonth + Math.random() * 500,
      monthlyGrowth: prev.monthlyGrowth + (Math.random() - 0.5) * 2
    }))

    setRefreshing(false)
  }

  // Format currency for Romanian locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Calculate progress percentage
  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  // Tab navigation options
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Active Campaigns', icon: Target },
    { id: 'donations', label: 'Recent Donations', icon: DollarSign },
    { id: 'impact', label: 'Impact Stories', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'trending', label: 'Trending Causes', icon: TrendingUp }
  ]

  // Campaign categories for filtering
  const categories = [
    'all', 'Emergency Relief', 'Education', 'Healthcare',
    'Environment', 'Animal Welfare', 'Community Development'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    DonAI Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">Charitable Giving & Impact Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{metrics.totalDonors.toLocaleString()}</span>
                  <span className="text-gray-500">donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{metrics.activeCampaigns}</span>
                  <span className="text-gray-500">campaigns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-teal-600" />
                  <span className="font-medium">{metrics.impactScore}%</span>
                  <span className="text-gray-500">impact</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {refreshing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Refresh</span>
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabbed Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-green-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                      ? 'border-green-500 text-green-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Donated</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalDonated)}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium ml-1">
                        {formatPercentage(metrics.monthlyGrowth)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">this month</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Donors</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalDonors.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Users2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium ml-1">
                        {metrics.repeatDonors.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">returning</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-teal-100 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.activeCampaigns}</p>
                    <div className="flex items-center mt-2">
                      <Target className="h-4 w-4 text-teal-500" />
                      <span className="text-sm text-teal-600 font-medium ml-1">
                        {formatCurrency(metrics.averageDonation)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">average</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-500 to-green-600 p-3 rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Impact Score</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.impactScore}%</p>
                    <div className="flex items-center mt-2">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium ml-1">
                        Excellent
                      </span>
                      <span className="text-sm text-gray-500 ml-1">rating</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Featured Campaigns Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Featured Campaigns</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Campaign</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {campaigns.slice(0, 4).map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                        <Heart className="h-16 w-16 text-green-500 opacity-20" />
                      </div>
                      {campaign.urgent && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          Urgent
                        </div>
                      )}
                      {campaign.verified && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full">
                          <Award className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                          {campaign.title}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {campaign.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                            transition={{ duration: 1, delay: 0.2 * index }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{campaign.donors} donors</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{campaign.daysLeft} days left</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">by {campaign.organization}</span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                            >
                              Donate Now
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Impact Stories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Donations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Donations</h3>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentDonations.slice(0, 4).map((donation, index) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 bg-green-50/50 rounded-xl border border-green-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                          <Gift className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{donation.donor}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{donation.campaign}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{new Date(donation.date).toLocaleString('ro-RO')}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full ${donation.type === 'recurring'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                              }`}>
                              {donation.type === 'recurring' ? 'Recurring' : 'One-time'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(donation.amount)}
                        </p>
                        <div className={`text-xs px-2 py-1 rounded-full ${donation.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                          {donation.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Impact Stories */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Impact Stories</h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {impactStories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg flex-shrink-0">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{story.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{story.impact}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{story.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{story.beneficiaries} beneficiaries</span>
                              </div>
                            </div>
                            <span>{new Date(story.date).toLocaleDateString('ro-RO')}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Other tabs content placeholders */}
        {activeTab !== 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100 shadow-lg text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 mb-6">
              This section will be implemented in the next development phase with comprehensive features for {activeTab}.
            </p>
            <div className="inline-flex items-center space-x-2 text-green-600">
              <Zap className="h-5 w-5" />
              <span className="font-medium">Coming Soon</span>
            </div>
          </motion.div>
        )}
      </main>

      {/* Enhanced Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/60 backdrop-blur-sm border-t border-green-100 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl"
            >
              <HandHeart className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Start Donating</h3>
              <p className="text-green-100 text-sm mb-4">
                Make a difference today with your contribution to causes you care about.
              </p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Explore Causes
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl"
            >
              <Globe className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Global Impact</h3>
              <p className="text-emerald-100 text-sm mb-4">
                Track the worldwide impact of your donations and see real change happen.
              </p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                View Impact
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-teal-500 to-green-600 text-white p-6 rounded-2xl"
            >
              <Award className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Verified Organizations</h3>
              <p className="text-teal-100 text-sm mb-4">
                All organizations are verified for transparency and trust in every donation.
              </p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Learn More
              </button>
            </motion.div>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-green-200">
            <p className="text-gray-600 text-sm">
              © 2025 DonAI - Charitable Giving Platform. Part of the CODAI Ecosystem.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
