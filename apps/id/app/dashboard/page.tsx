'use client'

import { Users, Settings, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">ID Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">567</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-900">Healthy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Authentication Service Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Login API</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Register API</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Token Validation</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Logout API</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
