import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Heart, DollarSign, CreditCard, Calendar, MessageSquare, Eye, EyeOff } from 'lucide-react'

interface QuickDonateModalProps {
  onClose: () => void
}

export function QuickDonateModal({ onClose }: QuickDonateModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const predefinedAmounts = [50, 100, 250, 500, 1000]

  const recentCampaigns = [
    { id: 'camp1', title: 'Emergency Relief for Flood Victims', organization: 'Red Cross Romania' },
    { id: 'camp2', title: 'Build Schools for Rural Children', organization: 'Children\'s Future Foundation' },
    { id: 'camp3', title: 'Medical Equipment for Rural Hospital', organization: 'Healthcare Heroes' }
  ]

  const paymentMethods = [
    { id: 'card1', name: 'Visa ****4532', type: 'card' },
    { id: 'card2', name: 'Mastercard ****8901', type: 'card' },
    { id: 'paypal', name: 'PayPal Account', type: 'paypal' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle donation submission
    console.log('Donation submitted:', {
      amount,
      selectedCampaign,
      paymentMethod,
      isRecurring,
      frequency,
      message,
      isAnonymous
    })
    onClose()
  }

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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Donate</h2>
                <p className="text-sm text-gray-600">Make a quick donation to support a cause</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Donation Amount
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((presetAmount) => (
                  <motion.button
                    key={presetAmount}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAmount(presetAmount.toString())}
                    className={`p-3 border rounded-lg font-medium transition-all duration-200 ${amount === presetAmount.toString()
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300'
                      }`}
                  >
                    {formatCurrency(presetAmount)}
                  </motion.button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Campaign
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a campaign</option>
                {recentCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title} - {campaign.organization}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{method.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recurring Donation */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Make this a recurring donation</span>
                  <p className="text-sm text-gray-600">Support this cause on a regular basis</p>
                </div>
              </label>

              {isRecurring && (
                <div className="mt-4">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Optional Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  placeholder="Leave a message of support..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Anonymous Donation */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  {isAnonymous ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900">Donate anonymously</span>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!amount || !selectedCampaign || !paymentMethod}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {amount ? `Donate ${formatCurrency(parseInt(amount) || 0)}` : 'Donate'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
