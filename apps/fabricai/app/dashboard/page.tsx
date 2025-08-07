'use client'

import React from 'react'

import FabricAILayout from '../../components/layout/FabricAILayout'
import { Zap, Users, Settings, BarChart3, Plus, Shield } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: { value: 12, trend: 'up' as const },
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Active Sessions",
      value: "567",
      change: { value: 5, trend: 'up' as const },
      icon: <BarChart3 className="h-4 w-4" />
    }
  ]
  const quickActions = [
    {
      title: "Quick Start",
      description: "Get started with fabricai",
      action: () => console.log("Quick start"),
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary' as const
    }
  ]

  return (
    <FabricAILayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">FabricAI Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-green-400 text-xs">+{stat.change.value}% from last month</p>
                </div>
                <div className="text-purple-400">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-purple-200">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <p className="text-purple-200 text-sm">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </FabricAILayout>
  )
}

