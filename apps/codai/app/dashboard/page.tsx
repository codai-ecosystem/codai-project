'use client'

import { Zap, Users, Settings, BarChart3, Plus, Shield, Code, Terminal } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Code className="h-8 w-8 text-blue-400" />
              CODAI Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Code Intelligence Platform</p>
          </div>

          <div className="flex items-center gap-3">
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
                  <p className="text-green-400 text-xs">+{stat.change.value}% from last month</p>
                </div>
                <div className="text-blue-400">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-blue-200" />
                <div>
                  <h3 className="font-semibold text-white">AI Code Assistant</h3>
                  <p className="text-blue-200 text-sm">Start coding with AI help</p>
                </div>
              </div>
            </button>

            <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-purple-200" />
                <div>
                  <h3 className="font-semibold text-white">Code Analysis</h3>
                  <p className="text-purple-200 text-sm">Analyze code quality</p>
                </div>
              </div>
            </button>

            <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-green-200" />
                <div>
                  <h3 className="font-semibold text-white">New Project</h3>
                  <p className="text-green-200 text-sm">Create new project</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
