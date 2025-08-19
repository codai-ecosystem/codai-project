import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Calendar, Heart, Users, Target } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  currency: string
  date: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  type: 'one-time' | 'recurring'
}

interface DonationOverviewCardsProps {
  donations: Donation[]
}

export function DonationOverviewCards({ donations }: DonationOverviewCardsProps) {
  // Calculate metrics
  const totalDonated = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0)

  const thisMonthDonations = donations.filter(d => {
    const donationDate = new Date(d.date)
    const now = new Date()
    return donationDate.getMonth() === now.getMonth() &&
      donationDate.getFullYear() === now.getFullYear() &&
      d.status === 'completed'
  })

  const thisMonthTotal = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0)
  const recurringDonations = donations.filter(d => d.type === 'recurring' && d.status === 'completed')
  const campaignsSupported = [...new Set(donations.map(d => d.campaignId))].length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Donated',
      value: formatCurrency(totalDonated),
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'green',
      description: 'All-time donations'
    },
    {
      title: 'This Month',
      value: formatCurrency(thisMonthTotal),
      change: `${thisMonthDonations.length} donations`,
      changeType: 'neutral' as const,
      icon: Calendar,
      color: 'blue',
      description: 'Current month total'
    },
    {
      title: 'Recurring Donations',
      value: `${recurringDonations.length}`,
      change: formatCurrency(recurringDonations.reduce((sum, d) => sum + d.amount, 0)),
      changeType: 'increase' as const,
      icon: Target,
      color: 'purple',
      description: 'Active subscriptions'
    },
    {
      title: 'Campaigns Supported',
      value: `${campaignsSupported}`,
      change: '+2 this month',
      changeType: 'increase' as const,
      icon: Heart,
      color: 'pink',
      description: 'Different causes helped'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-violet-600',
      pink: 'from-pink-500 to-rose-600'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.green
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-r ${getColorClasses(card.color)} p-3 rounded-xl`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${card.changeType === 'increase' ? 'text-green-600' :
                  card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                {card.changeType === 'increase' && <TrendingUp className="h-3 w-3" />}
                <span className="font-medium">{card.change}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <div>
                <p className="font-medium text-gray-700">{card.title}</p>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
