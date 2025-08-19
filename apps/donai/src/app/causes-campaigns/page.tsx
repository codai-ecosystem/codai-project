'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  Heart,
  Target,
  Users,
  Globe,
  Calendar,
  MapPin,
  Star,
  Award,
  TrendingUp,
  Clock,
  DollarSign,
  Share2,
  Bookmark,
  Eye,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Upload,
  Camera,
  FileText,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Flag,
  Shield,
  Verified,
  HandHeart,
  TreePine,
  GraduationCap,
  Stethoscope,
  Home,
  Utensils,
  Shirt,
  Baby,
  Waves,
  Building
} from 'lucide-react'

// TypeScript interfaces for Causes & Campaigns data
interface Category {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  count: number
  description: string
}

interface Campaign {
  id: string
  title: string
  description: string
  longDescription: string
  organization: string
  organizationId: string
  category: string
  goal: number
  raised: number
  donors: number
  daysLeft: number
  startDate: string
  endDate: string
  image: string
  images: string[]
  urgent: boolean
  verified: boolean
  featured: boolean
  location: string
  country: string
  tags: string[]
  updates: number
  rating: number
  transparency: number
  impact: string
  beneficiaries: number
  createdBy: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  socialShares: number
  views: number
  bookmarks: number
}

interface Organization {
  id: string
  name: string
  description: string
  verified: boolean
  rating: number
  totalRaised: number
  activeCampaigns: number
  completedCampaigns: number
  established: string
  location: string
  website: string
  logo: string
  category: string
}

export default function CausesCampaignsPage() {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    urgent: false,
    verified: false,
    featured: false,
    nearCompletion: false,
    newCampaigns: false
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  // Category definitions with icons and colors
  const categories: Category[] = [
    {
      id: 'all',
      name: 'All Causes',
      icon: Globe,
      color: 'text-gray-600',
      count: 147,
      description: 'All active campaigns and causes'
    },
    {
      id: 'emergency',
      name: 'Emergency Relief',
      icon: AlertCircle,
      color: 'text-red-600',
      count: 23,
      description: 'Urgent disaster relief and emergency assistance'
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      color: 'text-blue-600',
      count: 34,
      description: 'Educational programs and school support'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: Stethoscope,
      color: 'text-green-600',
      count: 28,
      description: 'Medical assistance and health programs'
    },
    {
      id: 'environment',
      name: 'Environment',
      icon: TreePine,
      color: 'text-emerald-600',
      count: 19,
      description: 'Environmental protection and sustainability'
    },
    {
      id: 'poverty',
      name: 'Poverty Relief',
      icon: HandHeart,
      color: 'text-purple-600',
      count: 15,
      description: 'Poverty alleviation and basic needs support'
    },
    {
      id: 'housing',
      name: 'Housing',
      icon: Home,
      color: 'text-orange-600',
      count: 12,
      description: 'Housing assistance and shelter programs'
    },
    {
      id: 'children',
      name: 'Children',
      icon: Baby,
      color: 'text-pink-600',
      count: 16,
      description: 'Child welfare and protection programs'
    }
  ]

  // Mock campaign data
  const [campaigns] = useState<Campaign[]>([
    {
      id: 'camp1',
      title: 'Emergency Relief for Flood Victims in Teleorman',
      description: 'Providing immediate relief supplies, temporary shelter, and medical assistance to families affected by severe flooding in Teleorman County.',
      longDescription: 'Recent severe flooding in Teleorman County has displaced over 500 families and damaged critical infrastructure. Our emergency response team is providing immediate relief including food, water, temporary shelter, medical care, and essential supplies. We are also working on long-term recovery plans including home rebuilding assistance.',
      organization: 'Red Cross Romania',
      organizationId: 'org1',
      category: 'emergency',
      goal: 75000,
      raised: 45600,
      donors: 892,
      daysLeft: 12,
      startDate: '2025-07-25',
      endDate: '2025-08-20',
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      urgent: true,
      verified: true,
      featured: true,
      location: 'Teleorman County',
      country: 'Romania',
      tags: ['emergency', 'flooding', 'shelter', 'medical-aid'],
      updates: 8,
      rating: 4.9,
      transparency: 96,
      impact: '1,200 families helped, 450 emergency shelters provided',
      beneficiaries: 1200,
      createdBy: 'Red Cross Romania',
      status: 'active',
      socialShares: 2847,
      views: 15670,
      bookmarks: 890
    },
    {
      id: 'camp2',
      title: 'Build Schools for Rural Children in Maramureș',
      description: 'Constructing modern educational facilities and providing learning resources for children in remote villages of Maramureș County.',
      longDescription: 'Many children in rural Maramureș lack access to quality education due to inadequate school facilities. This project aims to build 3 modern schools, equip them with computers and learning materials, and train local teachers. The project will serve 500+ children across 12 villages.',
      organization: 'Children\'s Future Foundation',
      organizationId: 'org2',
      category: 'education',
      goal: 50000,
      raised: 28400,
      donors: 456,
      daysLeft: 25,
      startDate: '2025-07-01',
      endDate: '2025-09-15',
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      urgent: false,
      verified: true,
      featured: true,
      location: 'Maramureș County',
      country: 'Romania',
      tags: ['education', 'rural', 'schools', 'children'],
      updates: 5,
      rating: 4.8,
      transparency: 94,
      impact: '500 children will receive quality education',
      beneficiaries: 500,
      createdBy: 'Children\'s Future Foundation',
      status: 'active',
      socialShares: 1234,
      views: 8900,
      bookmarks: 567
    },
    {
      id: 'camp3',
      title: 'Medical Equipment for Rural Hospital',
      description: 'Purchasing critical medical equipment including MRI machine, ventilators, and surgical instruments for Hunedoara County Hospital.',
      longDescription: 'The regional hospital in Hunedoara County serves over 100,000 people but lacks modern medical equipment. This campaign aims to purchase an MRI machine, 5 ventilators, modern surgical instruments, and patient monitoring systems to improve healthcare quality and save lives.',
      organization: 'Healthcare Heroes',
      organizationId: 'org3',
      category: 'healthcare',
      goal: 80000,
      raised: 67200,
      donors: 1234,
      daysLeft: 8,
      startDate: '2025-07-10',
      endDate: '2025-08-16',
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      urgent: true,
      verified: true,
      featured: true,
      location: 'Hunedoara County',
      country: 'Romania',
      tags: ['healthcare', 'medical-equipment', 'hospital', 'rural'],
      updates: 12,
      rating: 4.9,
      transparency: 98,
      impact: '2,000 patients will receive better medical care',
      beneficiaries: 2000,
      createdBy: 'Healthcare Heroes',
      status: 'active',
      socialShares: 3456,
      views: 21000,
      bookmarks: 1890
    },
    {
      id: 'camp4',
      title: 'Clean Water Systems for Disadvantaged Communities',
      description: 'Installing water purification systems and building wells in underserved communities across rural Romania.',
      longDescription: 'Access to clean drinking water remains a challenge in many rural Romanian communities. This project will install 10 water purification systems, dig 5 new wells, and train local maintenance teams. The project targets communities in Alba, Bihor, and Sălaj counties.',
      organization: 'Water for Life Romania',
      organizationId: 'org4',
      category: 'environment',
      goal: 60000,
      raised: 34800,
      donors: 678,
      daysLeft: 18,
      startDate: '2025-06-15',
      endDate: '2025-09-01',
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      urgent: false,
      verified: true,
      featured: false,
      location: 'Alba, Bihor, Sălaj Counties',
      country: 'Romania',
      tags: ['environment', 'water', 'rural', 'infrastructure'],
      updates: 6,
      rating: 4.7,
      transparency: 92,
      impact: '800 people will have access to clean water',
      beneficiaries: 800,
      createdBy: 'Water for Life Romania',
      status: 'active',
      socialShares: 890,
      views: 5600,
      bookmarks: 340
    },
    {
      id: 'camp5',
      title: 'Winter Relief Program for Homeless',
      description: 'Providing warm shelter, food, and essential supplies for homeless individuals during the winter months in Bucharest.',
      longDescription: 'With winter approaching, homeless individuals in Bucharest face life-threatening conditions. This program provides emergency shelter, hot meals, warm clothing, medical care, and social support services. We also offer job training and housing assistance programs.',
      organization: 'Bucharest Hope Center',
      organizationId: 'org5',
      category: 'poverty',
      goal: 45000,
      raised: 12300,
      donors: 234,
      daysLeft: 45,
      startDate: '2025-08-01',
      endDate: '2025-11-30',
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300'],
      urgent: false,
      verified: true,
      featured: false,
      location: 'Bucharest',
      country: 'Romania',
      tags: ['poverty', 'homeless', 'winter', 'shelter'],
      updates: 3,
      rating: 4.6,
      transparency: 89,
      impact: '200 homeless individuals will receive support',
      beneficiaries: 200,
      createdBy: 'Bucharest Hope Center',
      status: 'active',
      socialShares: 567,
      views: 3400,
      bookmarks: 178
    },
    {
      id: 'camp6',
      title: 'Orphanage Renovation and Support Program',
      description: 'Renovating living facilities and providing educational support for children in orphanages across Cluj County.',
      longDescription: 'Children in Cluj County orphanages need better living conditions and educational opportunities. This project will renovate dormitories, build study rooms, provide computers and books, and hire additional teachers and counselors for comprehensive child development.',
      organization: 'Children First Romania',
      organizationId: 'org6',
      category: 'children',
      goal: 35000,
      raised: 19800,
      donors: 387,
      daysLeft: 32,
      startDate: '2025-07-20',
      endDate: '2025-10-15',
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      urgent: false,
      verified: true,
      featured: false,
      location: 'Cluj County',
      country: 'Romania',
      tags: ['children', 'orphanage', 'education', 'renovation'],
      updates: 4,
      rating: 4.8,
      transparency: 93,
      impact: '150 children will benefit from improved facilities',
      beneficiaries: 150,
      createdBy: 'Children First Romania',
      status: 'active',
      socialShares: 723,
      views: 4200,
      bookmarks: 289
    }
  ])

  // Filter and search campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Category filter
    if (selectedCategory !== 'all' && campaign.category !== selectedCategory) {
      return false
    }

    // Search filter
    if (searchTerm && !campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !campaign.organization.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Additional filters
    if (selectedFilters.urgent && !campaign.urgent) return false
    if (selectedFilters.verified && !campaign.verified) return false
    if (selectedFilters.featured && !campaign.featured) return false
    if (selectedFilters.nearCompletion && (campaign.raised / campaign.goal) < 0.8) return false
    if (selectedFilters.newCampaigns && campaign.daysLeft < 45) return false

    return true
  })

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      case 'urgent':
        return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0)
      case 'newest':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      case 'ending-soon':
        return a.daysLeft - b.daysLeft
      case 'most-funded':
        return (b.raised / b.goal) - (a.raised / a.goal)
      case 'most-donated':
        return b.raised - a.raised
      case 'most-donors':
        return b.donors - a.donors
      default:
        return 0
    }
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  // Calculate progress percentage
  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

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
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    Causes & Campaigns
                  </h1>
                  <p className="text-sm text-gray-500">Discover and support meaningful causes</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{filteredCampaigns.length}</span>
                  <span className="text-gray-500">active campaigns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{categories.slice(1).reduce((sum, cat) => sum + cat.count, 0)}</span>
                  <span className="text-gray-500">total causes</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <span className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Campaign</span>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns, organizations, or causes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${selectedCategory === category.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm text-gray-600 border-green-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                    {category.count}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg hover:border-green-300 transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {Object.values(selectedFilters).some(Boolean) && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {Object.values(selectedFilters).filter(Boolean).length}
                  </span>
                )}
              </motion.button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="featured">Featured First</option>
                <option value="urgent">Most Urgent</option>
                <option value="newest">Newest</option>
                <option value="ending-soon">Ending Soon</option>
                <option value="most-funded">Most Funded</option>
                <option value="most-donated">Highest Amount</option>
                <option value="most-donors">Most Donors</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('grid')}
                className={`p-2 rounded-lg transition-colors duration-200 ${activeView === 'grid'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-green-50'
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('list')}
                className={`p-2 rounded-lg transition-colors duration-200 ${activeView === 'list'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-green-50'
                  }`}
              >
                <FileText className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(selectedFilters).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSelectedFilters(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Campaigns Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCampaigns.map((campaign, index) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  index={index}
                  onSelect={setSelectedCampaign}
                  formatCurrency={formatCurrency}
                  calculateProgress={calculateProgress}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCampaigns.map((campaign, index) => (
                <CampaignListItem
                  key={campaign.id}
                  campaign={campaign}
                  index={index}
                  onSelect={setSelectedCampaign}
                  formatCurrency={formatCurrency}
                  calculateProgress={calculateProgress}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {sortedCampaigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-green-100">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to discover more causes.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedFilters({
                    urgent: false,
                    verified: false,
                    featured: false,
                    nearCompletion: false,
                    newCampaigns: false
                  })
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Clear Filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          formatCurrency={formatCurrency}
          calculateProgress={calculateProgress}
        />
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

// Campaign Card Component
function CampaignCard({
  campaign,
  index,
  onSelect,
  formatCurrency,
  calculateProgress
}: {
  campaign: Campaign
  index: number
  onSelect: (campaign: Campaign) => void
  formatCurrency: (amount: number) => string
  calculateProgress: (raised: number, goal: number) => number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(campaign)}
      className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
          <Heart className="h-16 w-16 text-green-500 opacity-20" />
        </div>

        {/* Campaign Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {campaign.urgent && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
              Urgent
            </span>
          )}
          {campaign.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
              Featured
            </span>
          )}
        </div>

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
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">{campaign.rating}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle donate action
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                >
                  Donate
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Campaign List Item Component
function CampaignListItem({
  campaign,
  index,
  onSelect,
  formatCurrency,
  calculateProgress
}: {
  campaign: Campaign
  index: number
  onSelect: (campaign: Campaign) => void
  formatCurrency: (amount: number) => string
  calculateProgress: (raised: number, goal: number) => number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(campaign)}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start space-x-6">
        <div className="w-32 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Heart className="h-8 w-8 text-green-500 opacity-30" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{campaign.title}</h3>
                {campaign.verified && <Award className="h-4 w-4 text-green-500" />}
                {campaign.urgent && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-gray-600 line-clamp-2">{campaign.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>by {campaign.organization}</span>
                <span>{campaign.location}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{campaign.rating}</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-lg font-bold text-gray-900">
                {calculateProgress(campaign.raised, campaign.goal).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(campaign.raised)} raised
              </div>
              <div className="text-xs text-gray-500">
                {campaign.daysLeft} days left
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
              transition={{ duration: 1, delay: 0.1 * index }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{campaign.donors} donors</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{campaign.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="h-4 w-4" />
                <span>{campaign.socialShares} shares</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                // Handle donate action
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Donate Now
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Campaign Detail Modal Component (placeholder)
function CampaignDetailModal({
  campaign,
  onClose,
  formatCurrency,
  calculateProgress
}: {
  campaign: Campaign
  onClose: () => void
  formatCurrency: (amount: number) => string
  calculateProgress: (raised: number, goal: number) => number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
              <p className="text-gray-600">{campaign.longDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Raised</span>
                      <span className="font-medium">{formatCurrency(campaign.raised)}</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                        style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{campaign.donors} donors</span>
                      <span>{calculateProgress(campaign.raised, campaign.goal).toFixed(1)}% of {formatCurrency(campaign.goal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium"
                    >
                      Donate Now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium"
                    >
                      Share Campaign
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium"
                    >
                      Save to Favorites
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Create Campaign Modal Component (placeholder)
function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full p-6"
      >
        <div className="text-center">
          <Plus className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Campaign</h2>
          <p className="text-gray-600 mb-6">Campaign creation functionality will be implemented in the next development phase.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
