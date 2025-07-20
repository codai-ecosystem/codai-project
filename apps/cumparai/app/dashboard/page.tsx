'use client'

import { ShoppingCart, Search, TrendingUp, Star, Users, Zap, BarChart3, Plus, Settings, Package, CreditCard } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,234",
      change: { value: 12, trend: 'up' as const },
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      title: "Revenue",
      value: "$15.2K",
      change: { value: 8, trend: 'up' as const },
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-emerald-400" />
              CUMPARAI Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Smart Shopping Intelligence</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Search className="h-5 w-5 text-gray-300" />
            </button>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-emerald-400 text-xs">+{stat.change.value}% from last month</p>
                </div>
                <div className="text-emerald-400">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-left">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-emerald-200" />
                <div>
                  <h3 className="font-semibold text-white">Add Product</h3>
                  <p className="text-emerald-200 text-sm">Add new product to catalog</p>
                </div>
              </div>
            </button>

            <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-200" />
                <div>
                  <h3 className="font-semibold text-white">View Analytics</h3>
                  <p className="text-blue-200 text-sm">Analyze shopping trends</p>
                </div>
              </div>
            </button>

            <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-purple-200" />
                <div>
                  <h3 className="font-semibold text-white">Price Alerts</h3>
                  <p className="text-purple-200 text-sm">Set up price notifications</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Package className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-white font-medium">New product added</p>
                <p className="text-gray-400 text-sm">Smartphone XYZ added to electronics category</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Payment processed</p>
                <p className="text-gray-400 text-sm">Order #1234 payment completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
