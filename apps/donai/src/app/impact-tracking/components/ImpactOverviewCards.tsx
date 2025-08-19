import React from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, Target, TrendingUp, Award, CheckCircle } from 'lucide-react'

interface TotalMetrics {
  totalDonated: number
  totalBeneficiaries: number
  activeCampaigns: number
  averageImpactScore: number
  completedOutcomes: number
}

interface ImpactData {
  id: string
  totalDonated: number
  beneficiariesReached: number
  impactScore: number
  status: 'active' | 'completed' | 'ongoing'
}

interface ImpactOverviewCardsProps {
  impactData: ImpactData[]
  totalMetrics: TotalMetrics
}

export function ImpactOverviewCards({ impactData, totalMetrics }: ImpactOverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Impact Value',
      value: formatCurrency(totalMetrics.totalDonated),
      change: '+15.2%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'green',
      description: 'Total donation value creating impact'
    },
    {
      title: 'Lives Impacted',
      value: totalMetrics.totalBeneficiaries.toLocaleString(),
      change: `+${Math.round(totalMetrics.totalBeneficiaries * 0.12)} this month`,
      changeType: 'increase' as const,
      icon: Users,
      color: 'blue',
      description: 'People directly benefiting from donations'
    },
    {
      title: 'Impact Score',
      value: totalMetrics.averageImpactScore.toFixed(1),
      change: '+0.3 points',
      changeType: 'increase' as const,
      icon: Award,
      color: 'purple',
      description: 'Average effectiveness rating'
    },
    {
      title: 'Goals Achieved',
      value: `${totalMetrics.completedOutcomes}`,
      change: `${totalMetrics.activeCampaigns} active`,
      changeType: 'neutral' as const,
      icon: Target,
      color: 'orange',
      description: 'Measurable outcomes completed'
    },
    {
      title: 'Success Rate',
      value: `${Math.round((totalMetrics.completedOutcomes / Math.max(impactData.length * 3, 1)) * 100)}%`,
      change: '+5% vs last quarter',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'emerald',
      description: 'Campaign goal completion rate'
    },
    {
      title: 'Growth Trend',
      value: '+24%',
      change: 'Year over year',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Impact growth trajectory'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-violet-600',
      orange: 'from-orange-500 to-amber-600',
      emerald: 'from-emerald-500 to-teal-600',
      indigo: 'from-indigo-500 to-purple-600'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.green
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
