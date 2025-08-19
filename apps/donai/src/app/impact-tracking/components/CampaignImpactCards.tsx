import React from 'react'
import { motion } from 'framer-motion'
import { Target, Users, Award, CheckCircle, TrendingUp, MapPin, Calendar, Eye } from 'lucide-react'

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

interface ImpactData {
  id: string
  campaignTitle: string
  organization: string
  category: string
  totalDonated: number
  beneficiariesReached: number
  goalAchieved: number
  impactScore: number
  measurableOutcomes: MeasurableOutcome[]
  location: string
  status: 'active' | 'completed' | 'ongoing'
  transparencyScore: number
  verificationLevel: 'verified' | 'pending' | 'unverified'
}

interface CampaignImpactCardsProps {
  impactData: ImpactData[]
  expanded?: boolean
}

export function CampaignImpactCards({ impactData, expanded = false }: CampaignImpactCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'active':
        return 'bg-blue-100 text-blue-700'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return '🚨'
      case 'education':
        return '🎓'
      case 'healthcare':
        return '🏥'
      case 'environment':
        return '🌱'
      case 'poverty':
        return '🤝'
      default:
        return '❤️'
    }
  }

  const getImpactScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-100'
    if (score >= 7) return 'text-blue-600 bg-blue-100'
    if (score >= 5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6">
      {!expanded && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Campaign Impact Overview</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View All Campaigns
          </motion.button>
        </div>
      )}

      <div className={`grid grid-cols-1 ${expanded ? 'lg:grid-cols-1' : 'lg:grid-cols-1'} gap-6`}>
        {impactData.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{getCategoryIcon(campaign.category)}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{campaign.campaignTitle}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{campaign.organization}</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{campaign.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </div>
                <div className={`px-2 py-1 rounded-lg text-sm font-bold ${getImpactScoreColor(campaign.impactScore)}`}>
                  {campaign.impactScore}/10
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Donation Impact</span>
                </div>
                <p className="text-lg font-bold text-green-900">{formatCurrency(campaign.totalDonated)}</p>
                <p className="text-xs text-green-700">{campaign.goalAchieved}% of goal achieved</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Beneficiaries</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{campaign.beneficiariesReached.toLocaleString()}</p>
                <p className="text-xs text-blue-700">People directly helped</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Transparency</span>
                </div>
                <p className="text-lg font-bold text-purple-900">{campaign.transparencyScore}%</p>
                <p className="text-xs text-purple-700">Verification score</p>
              </div>
            </div>

            {/* Measurable Outcomes */}
            {campaign.measurableOutcomes.length > 0 && (
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Measurable Outcomes</span>
                </h5>

                <div className="space-y-3">
                  {campaign.measurableOutcomes.slice(0, expanded ? 10 : 3).map((outcome) => (
                    <div key={outcome.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{outcome.metric}</span>
                        <div className="flex items-center space-x-2">
                          {outcome.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-bold text-gray-900">
                            {outcome.value} / {outcome.target} {outcome.unit}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((outcome.value / outcome.target) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                          className={`h-2 rounded-full ${outcome.value >= outcome.target ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                        />
                      </div>

                      <p className="text-sm text-gray-600">{outcome.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(outcome.lastUpdated).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Impact Score: {campaign.impactScore}/10</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{campaign.verificationLevel}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
