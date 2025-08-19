import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, TrendingUp, Users, MapPin } from 'lucide-react'

interface ImpactUpdate {
  id: string
  title: string
  description: string
  date: string
  verified: boolean
}

interface ImpactData {
  id: string
  campaignTitle: string
  organization: string
  category: string
  beneficiariesReached: number
  updates: ImpactUpdate[]
  location: string
  startDate: string
  status: 'active' | 'completed' | 'ongoing'
}

interface ImpactTimelineProps {
  impactData: ImpactData[]
  compact?: boolean
  expanded?: boolean
}

export function ImpactTimeline({ impactData, compact = false, expanded = false }: ImpactTimelineProps) {
  // Create timeline events from all campaigns
  const timelineEvents = impactData.flatMap(campaign => [
    // Campaign start event
    {
      id: `start-${campaign.id}`,
      title: `Campaign Started: ${campaign.campaignTitle}`,
      description: `${campaign.organization} launched this ${campaign.category} campaign`,
      date: campaign.startDate,
      type: 'campaign-start' as const,
      campaign: campaign.campaignTitle,
      organization: campaign.organization,
      location: campaign.location,
      verified: true,
      beneficiaries: campaign.beneficiariesReached
    },
    // Campaign updates
    ...campaign.updates.map(update => ({
      id: update.id,
      title: update.title,
      description: update.description,
      date: update.date,
      type: 'update' as const,
      campaign: campaign.campaignTitle,
      organization: campaign.organization,
      location: campaign.location,
      verified: update.verified,
      beneficiaries: 0
    }))
  ]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const displayEvents = compact ? timelineEvents.slice(0, 5) : timelineEvents

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'campaign-start':
        return <TrendingUp className="h-4 w-4" />
      case 'update':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'campaign-start':
        return 'bg-blue-500'
      case 'update':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (campaign: string) => {
    if (campaign.toLowerCase().includes('emergency')) return '🚨'
    if (campaign.toLowerCase().includes('school')) return '🎓'
    if (campaign.toLowerCase().includes('medical')) return '🏥'
    if (campaign.toLowerCase().includes('water')) return '🌱'
    return '❤️'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Impact Timeline</h3>
            <p className="text-sm text-gray-600">Recent impact updates and milestones</p>
          </div>
        </div>
        {compact && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View Full Timeline
          </motion.button>
        )}
      </div>

      <div className="space-y-6">
        {displayEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="relative flex items-start space-x-4"
          >
            {/* Timeline connector */}
            {index < displayEvents.length - 1 && (
              <div className="absolute left-5 top-12 w-0.5 h-16 bg-gray-200" />
            )}

            {/* Event icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
              {getEventIcon(event.type)}
            </div>

            {/* Event content */}
            <div className="flex-1 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(event.campaign)}</span>
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    {event.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{event.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                    {event.beneficiaries > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{event.beneficiaries.toLocaleString()} beneficiaries</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {event.organization}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {event.type === 'campaign-start' ? 'Started' : 'Updated'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('ro-RO', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {displayEvents.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No timeline events found</p>
          <p className="text-sm text-gray-500">Impact updates will appear here as campaigns progress</p>
        </div>
      )}

      {compact && displayEvents.length >= 5 && (
        <div className="text-center pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Show {timelineEvents.length - 5} more events
          </motion.button>
        </div>
      )}
    </div>
  )
}
