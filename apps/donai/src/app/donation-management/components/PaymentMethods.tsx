import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Shield, Star, Edit, Trash2, CheckCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'paypal' | 'crypto'
  name: string
  last4?: string
  expiry?: string
  isDefault: boolean
  verified: boolean
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
}

export function PaymentMethods({ paymentMethods }: PaymentMethodsProps) {
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-6 w-6" />
      case 'paypal':
        return <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>
      case 'bank':
        return <div className="w-6 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">B</div>
      case 'crypto':
        return <div className="w-6 h-6 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">₿</div>
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const getMethodColor = (type: string, isDefault: boolean) => {
    if (isDefault) return 'from-green-500 to-emerald-600'

    switch (type) {
      case 'card':
        return 'from-blue-500 to-cyan-600'
      case 'paypal':
        return 'from-blue-600 to-blue-700'
      case 'bank':
        return 'from-green-600 to-green-700'
      case 'crypto':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-gray-600 mt-1">Manage your payment methods for donations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <span className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Payment Method</span>
          </span>
        </motion.button>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`bg-gradient-to-r ${getMethodColor(method.type, method.isDefault)} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/80">
                {getMethodIcon(method.type)}
              </div>
              <div className="flex items-center space-x-2">
                {method.verified && (
                  <div className="bg-white/20 p-1 rounded-full">
                    <Shield className="h-3 w-3" />
                  </div>
                )}
                {method.isDefault && (
                  <div className="bg-white/20 p-1 rounded-full">
                    <Star className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-white/70">Payment Method</p>
                <p className="font-semibold">{method.name}</p>
              </div>

              {method.last4 && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Card Number</p>
                    <p className="font-mono">•••• •••• •••• {method.last4}</p>
                  </div>
                  {method.expiry && (
                    <div>
                      <p className="text-sm text-white/70">Expires</p>
                      <p className="font-mono">{method.expiry}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                      Default
                    </span>
                  )}
                  {method.verified && (
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                    title="Edit Method"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/20 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                    title="Remove Method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Payment Method Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * paymentMethods.length }}
          whileHover={{ scale: 1.02 }}
          className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-green-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-green-400 transition-all duration-300 cursor-pointer"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mb-4">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Add New Method</h3>
          <p className="text-sm text-gray-600">Add a payment method for faster donations</p>
        </motion.div>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Security & Privacy</h4>
            <p className="text-sm text-blue-700 mt-1">
              All payment information is securely encrypted and stored using industry-standard security protocols.
              We never store your complete card details on our servers.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
