'use client'

import { Button } from '@codai/shared-ui'
import { Users, BarChart3, Plus, Settings } from 'lucide-react'

export default function Dashboard() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome to the admin panel</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                    <dd className="text-lg font-medium text-gray-900">1,234</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BarChart3 className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                                    <dd className="text-lg font-medium text-gray-900">567</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex space-x-4">
                        <Button
                            variant="default"
                            onClick={() => console.log("Quick start")}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Quick Start
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => console.log("Settings")}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
