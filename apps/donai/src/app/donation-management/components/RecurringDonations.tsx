import React from 'react'
import { motion } from 'framer-motion'
import { Repeat, Calendar, Pause, Play, Edit, Trash2, DollarSign } from 'lucide-react'

interface RecurringDonation {
  id: string
  amount: number
  currency: string
  campaignTitle: string
  organization: string
  frequency: 'monthly' | 'quarterly' | 'yearly'
  nextPayment: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  type: 'one-time' | 'recurring'
}

interface RecurringDonationsProps {
  donations: RecurringDonation[]
  expanded?: boolean
}

export function RecurringDonations({ donations, expanded = false }: RecurringDonationsProps) {
  const recurringDonations = donations.filter(d => d.type === 'recurring')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const getFrequencyColor = (frequency: string) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-700',
      quarterly: 'bg-purple-100 text-purple-700',
      yearly: 'bg-green-100 text-green-700'
    }
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-2 rounded-lg">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recurring Donations</h3>
            <p className="text-sm text-gray-600">{recurringDonations.length} active subscriptions</p>
          </div>
        </div>
        {!expanded && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Manage All
          </motion.button>
        )}
      </div>

      {expanded && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Set Up New Recurring Donation
            </motion.button>
          </div>
          <div className="text-sm text-gray-600">
            Total monthly commitment: {formatCurrency(
              recurringDonations
                .filter(d => d.frequency === 'monthly')
                .reduce((sum, d) => sum + d.amount, 0)
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {recurringDonations.map((donation, index) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="border border-purple-100 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-2 rounded-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{donation.campaignTitle}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{donation.organization}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(donation.frequency!)}`}>
                      {getFrequencyLabel(donation.frequency!)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(donation.amount)}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Next: {formatDate(donation.nextPayment!)}</span>
                  </div>
                </div>

                {expanded && (
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors duration-200"
                      title="Pause Donation"
                    >
                      <Pause className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Edit Donation"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Cancel Donation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {recurringDonations.length === 0 && (
        <div className="text-center py-8">
          <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No recurring donations set up</p>
          <p className="text-sm text-gray-500 mb-4">Set up recurring donations to support causes continuously</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Set Up Recurring Donation
          </motion.button>
        </div>
      )}
    </div>
  )
}
