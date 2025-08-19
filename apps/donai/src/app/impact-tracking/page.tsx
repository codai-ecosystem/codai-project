'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Users,
  Heart,
  Award,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Share2,
  Filter,
  Search,
  Zap,
  CheckCircle,
  Clock,
  TreePine,
  GraduationCap,
  Stethoscope,
  Home,
  HandHeart,
  Baby
} from 'lucide-react'

// Import modular components
import { ImpactOverviewCards } from './components/ImpactOverviewCards'
import { ImpactTimeline } from './components/ImpactTimeline'
import { CampaignImpactCards } from './components/CampaignImpactCards'
import { ImpactMetrics } from './components/ImpactMetrics'
import { BeneficiaryStories } from './components/BeneficiaryStories'
import { ImpactMap } from './components/ImpactMap'

// TypeScript interfaces
interface ImpactData {
  id: string
  campaignId: string
  campaignTitle: string
  organization: string
  category: string
  totalDonated: number
  beneficiariesReached: number
  goalAchieved: number
  impactScore: number
  measurableOutcomes: MeasurableOutcome[]
  stories: BeneficiaryStory[]
  updates: ImpactUpdate[]
  location: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'ongoing'
  transparencyScore: number
  verificationLevel: 'verified' | 'pending' | 'unverified'
}

interface MeasurableOutcome {
  id: string
  metric: string
  value: number
  unit: string
  target: number
  description: string
  verified: boolean
  lastUpdated: string
}

interface BeneficiaryStory {
  id: string
  title: string
  description: string
  beneficiaryName: string
  location: string
  image: string
  impact: string
  date: string
  verified: boolean
}

interface ImpactUpdate {
  id: string
  title: string
  description: string
  date: string
  metrics: MeasurableOutcome[]
  photos: string[]
  verified: boolean
}

export default function ImpactTrackingPage() {
  const [activeView, setActiveView] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Mock impact data
  const [impactData] = useState<ImpactData[]>([
    {
      id: 'impact1',
      campaignId: 'camp1',
      campaignTitle: 'Emergency Relief for Flood Victims in Teleorman',
      organization: 'Red Cross Romania',
      category: 'emergency',
      totalDonated: 45600,
      beneficiariesReached: 1200,
      goalAchieved: 85,
      impactScore: 9.2,
      measurableOutcomes: [
        {
          id: 'outcome1',
          metric: 'Emergency Shelters Provided',
          value: 450,
          unit: 'shelters',
          target: 500,
          description: 'Temporary shelters for displaced families',
          verified: true,
          lastUpdated: '2025-08-06'
        },
        {
          id: 'outcome2',
          metric: 'Food Packages Distributed',
          value: 2400,
          unit: 'packages',
          target: 3000,
          description: 'Weekly food packages for affected families',
          verified: true,
          lastUpdated: '2025-08-05'
        },
        {
          id: 'outcome3',
          metric: 'Medical Consultations',
          value: 890,
          unit: 'consultations',
          target: 1000,
          description: 'Medical check-ups and treatments provided',
          verified: true,
          lastUpdated: '2025-08-04'
        }
      ],
      stories: [
        {
          id: 'story1',
          title: 'Maria\'s Family Finds Safety',
          description: 'After losing their home to flooding, Maria and her three children found shelter and support through the emergency relief program.',
          beneficiaryName: 'Maria T.',
          location: 'Teleorman County',
          image: '/api/placeholder/300/200',
          impact: 'Safe shelter for 4 family members',
          date: '2025-08-01',
          verified: true
        }
      ],
      updates: [
        {
          id: 'update1',
          title: 'Week 2: Shelter Construction Progress',
          description: 'Construction of temporary shelters is progressing well. 450 shelters now operational.',
          date: '2025-08-06',
          metrics: [],
          photos: ['/api/placeholder/400/300'],
          verified: true
        }
      ],
      location: 'Teleorman County, Romania',
      startDate: '2025-07-25',
      status: 'active',
      transparencyScore: 96,
      verificationLevel: 'verified'
    },
    {
      id: 'impact2',
      campaignId: 'camp2',
      campaignTitle: 'Build Schools for Rural Children in Maramureș',
      organization: 'Children\'s Future Foundation',
      category: 'education',
      totalDonated: 28400,
      beneficiariesReached: 500,
      goalAchieved: 68,
      impactScore: 8.7,
      measurableOutcomes: [
        {
          id: 'outcome4',
          metric: 'Schools Under Construction',
          value: 2,
          unit: 'schools',
          target: 3,
          description: 'Modern school buildings being constructed',
          verified: true,
          lastUpdated: '2025-08-03'
        },
        {
          id: 'outcome5',
          metric: 'Students Enrolled',
          value: 340,
          unit: 'students',
          target: 500,
          description: 'Children enrolled in the new educational program',
          verified: true,
          lastUpdated: '2025-08-02'
        },
        {
          id: 'outcome6',
          metric: 'Teachers Trained',
          value: 15,
          unit: 'teachers',
          target: 20,
          description: 'Local teachers trained in modern teaching methods',
          verified: true,
          lastUpdated: '2025-08-01'
        }
      ],
      stories: [
        {
          id: 'story2',
          title: 'Ana Dreams of Becoming a Doctor',
          description: 'With access to quality education, 12-year-old Ana can now pursue her dream of becoming a doctor.',
          beneficiaryName: 'Ana M.',
          location: 'Maramureș County',
          image: '/api/placeholder/300/200',
          impact: 'Access to quality education',
          date: '2025-07-28',
          verified: true
        }
      ],
      updates: [],
      location: 'Maramureș County, Romania',
      startDate: '2025-07-01',
      status: 'ongoing',
      transparencyScore: 94,
      verificationLevel: 'verified'
    },
    {
      id: 'impact3',
      campaignId: 'camp3',
      campaignTitle: 'Medical Equipment for Rural Hospital',
      organization: 'Healthcare Heroes',
      category: 'healthcare',
      totalDonated: 67200,
      beneficiariesReached: 2000,
      goalAchieved: 92,
      impactScore: 9.5,
      measurableOutcomes: [
        {
          id: 'outcome7',
          metric: 'Medical Equipment Installed',
          value: 8,
          unit: 'equipment',
          target: 10,
          description: 'Modern medical equipment now operational',
          verified: true,
          lastUpdated: '2025-08-05'
        },
        {
          id: 'outcome8',
          metric: 'Patients Treated',
          value: 1450,
          unit: 'patients',
          target: 2000,
          description: 'Patients who received improved medical care',
          verified: true,
          lastUpdated: '2025-08-04'
        },
        {
          id: 'outcome9',
          metric: 'Surgery Success Rate',
          value: 98,
          unit: 'percentage',
          target: 95,
          description: 'Improved surgical outcomes with new equipment',
          verified: true,
          lastUpdated: '2025-08-03'
        }
      ],
      stories: [],
      updates: [],
      location: 'Hunedoara County, Romania',
      startDate: '2025-07-10',
      status: 'ongoing',
      transparencyScore: 98,
      verificationLevel: 'verified'
    }
  ])

  // View options
  const viewOptions = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'campaigns', name: 'Campaign Impact', icon: Target },
    { id: 'metrics', name: 'Detailed Metrics', icon: TrendingUp },
    { id: 'stories', name: 'Beneficiary Stories', icon: Heart },
    { id: 'timeline', name: 'Impact Timeline', icon: Calendar },
    { id: 'map', name: 'Impact Map', icon: Globe }
  ]

  // Calculate total impact metrics
  const totalMetrics = {
    totalDonated: impactData.reduce((sum, data) => sum + data.totalDonated, 0),
    totalBeneficiaries: impactData.reduce((sum, data) => sum + data.beneficiariesReached, 0),
    activeCampaigns: impactData.filter(data => data.status === 'active').length,
    averageImpactScore: impactData.reduce((sum, data) => sum + data.impactScore, 0) / impactData.length,
    completedOutcomes: impactData.reduce((sum, data) =>
      sum + data.measurableOutcomes.filter(outcome => outcome.value >= outcome.target).length, 0
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
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
                    Impact Tracking
                  </h1>
                  <p className="text-sm text-gray-500">Measure and visualize donation impact</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{totalMetrics.totalBeneficiaries.toLocaleString()}</span>
                  <span className="text-gray-500">beneficiaries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{totalMetrics.averageImpactScore.toFixed(1)}</span>
                  <span className="text-gray-500">avg impact score</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <span className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-green-200">
            {viewOptions.map((option) => {
              const Icon = option.icon
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView(option.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeView === option.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="emergency">Emergency Relief</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="environment">Environment</option>
              <option value="poverty">Poverty Relief</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search impact data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'overview' && (
            <div className="space-y-6">
              <ImpactOverviewCards impactData={impactData} totalMetrics={totalMetrics} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CampaignImpactCards impactData={impactData.slice(0, 3)} />
                <ImpactTimeline impactData={impactData} compact={true} />
              </div>
            </div>
          )}

          {activeView === 'campaigns' && (
            <CampaignImpactCards impactData={impactData} expanded={true} />
          )}

          {activeView === 'metrics' && (
            <ImpactMetrics impactData={impactData} />
          )}

          {activeView === 'stories' && (
            <BeneficiaryStories impactData={impactData} />
          )}

          {activeView === 'timeline' && (
            <ImpactTimeline impactData={impactData} expanded={true} />
          )}

          {activeView === 'map' && (
            <ImpactMap impactData={impactData} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
