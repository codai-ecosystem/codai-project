'use client'

import { useState, useEffect } from 'react'

interface ServiceStatus {
    name: string
    status: 'online' | 'offline' | 'error' | 'maintenance'
    uptime: string
    requests: number
    domain: string
    tier: string
}

export default function Dashboard() {
    const [services, setServices] = useState<ServiceStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTier, setSelectedTier] = useState<string>('all')

    useEffect(() => {
        // Simulate API call to get service statuses
        const fetchServiceStatus = async () => {
            // Mock data - in production this would come from your monitoring API
            const mockServices: ServiceStatus[] = [
                { name: 'Codai Platform', status: 'online', uptime: '99.9%', requests: 12543, domain: 'codai.ro', tier: 'foundation' },
                { name: 'Memorai', status: 'online', uptime: '99.8%', requests: 8934, domain: 'memorai.ro', tier: 'foundation' },
                { name: 'Logai', status: 'online', uptime: '99.7%', requests: 15632, domain: 'logai.ro', tier: 'foundation' },
                { name: 'X API Gateway', status: 'online', uptime: '99.9%', requests: 25678, domain: 'x.codai.ro', tier: 'foundation' },
                { name: 'Bancai', status: 'online', uptime: '99.5%', requests: 3421, domain: 'bancai.ro', tier: 'business' },
                { name: 'Wallet', status: 'online', uptime: '99.6%', requests: 5234, domain: 'wallet.codai.ro', tier: 'business' },
                { name: 'Fabricai', status: 'online', uptime: '99.4%', requests: 7865, domain: 'fabricai.ro', tier: 'specialized' },
                { name: 'Studiai', status: 'online', uptime: '99.3%', requests: 9876, domain: 'studiai.ro', tier: 'specialized' },
                { name: 'Sociai', status: 'online', uptime: '99.2%', requests: 6543, domain: 'sociai.ro', tier: 'specialized' },
                { name: 'Cumparai', status: 'online', uptime: '99.1%', requests: 4321, domain: 'cumparai.ro', tier: 'specialized' },
                { name: 'Publicai', status: 'online', uptime: '99.0%', requests: 2109, domain: 'publicai.ro', tier: 'specialized' }
            ]

            setServices(mockServices)
            setLoading(false)
        }

        fetchServiceStatus()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'offline': return 'bg-red-500'
            case 'error': return 'bg-red-600'
            case 'maintenance': return 'bg-yellow-500'
            default: return 'bg-gray-500'
        }
    }

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'foundation': return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'business': return 'bg-green-100 text-green-800 border-green-300'
            case 'specialized': return 'bg-purple-100 text-purple-800 border-purple-300'
            default: return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    const filteredServices = selectedTier === 'all'
        ? services
        : services.filter(service => service.tier === selectedTier)

    const totalRequests = services.reduce((sum, service) => sum + service.requests, 0)
    const averageUptime = services.length > 0
        ? (services.reduce((sum, service) => sum + parseFloat(service.uptime), 0) / services.length).toFixed(1)
        : '0.0'

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Services</p>
                            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                            <p className="text-xs text-gray-500">Across all tiers</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900">2,847</p>
                            <p className="text-xs text-green-600">+12% from last month</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Last 24 hours</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">System Health</p>
                            <p className="text-2xl font-bold text-green-600">{averageUptime}%</p>
                            <p className="text-xs text-gray-500">Average uptime</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'foundation', 'business', 'specialized'].map((tier) => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedTier === tier
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                    {tier === 'all' ? services.length : services.filter(s => s.tier === tier).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Service Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredServices.map((service) => (
                            <div key={service.name} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                    </svg>
                                    {service.domain}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Uptime</span>
                                        <span className="font-medium">{service.uptime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Requests</span>
                                        <span className="font-medium">{service.requests.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Tier</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierColor(service.tier)}`}>
                                            {service.tier}
                                        </span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    Manage Service
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
