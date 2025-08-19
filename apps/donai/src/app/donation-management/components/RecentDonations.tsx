import React from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Heart, ExternalLink, Download } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  currency: string
  campaignTitle: string
  organization: string
  date: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  receiptUrl: string
  category: string
}

interface RecentDonationsProps {
  donations: Donation[]
}

export function RecentDonations({ donations }: RecentDonationsProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50'
      case 'pending':
        return 'text-yellow-700 bg-yellow-50'
      case 'failed':
        return 'text-red-700 bg-red-50'
      case 'refunded':
        return 'text-gray-700 bg-gray-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Donations</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-green-600 hover:text-green-700 font-medium text-sm"
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-4">
        {donations.map((donation, index) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                <Heart className="h-4 w-4 text-white" />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-900 line-clamp-1">
                  {donation.campaignTitle}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{donation.organization}</span>
                  <span>•</span>
                  <span>{formatDate(donation.date)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrency(donation.amount)}</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(donation.status)}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                  title="Download Receipt"
                >
                  <Download className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                  title="View Campaign"
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {donations.length === 0 && (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recent donations found</p>
          <p className="text-sm text-gray-500 mt-2">Your donation history will appear here</p>
        </div>
      )}
    </div>
  )
}
