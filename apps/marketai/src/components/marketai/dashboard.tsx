'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Store, TrendingUp, Users, ShoppingCart, Package, Star, Activity, DollarSign } from 'lucide-react'

interface MarketStats {
    totalAgents: number
    totalModules: number
    activeTraders: number
    dailyVolume: string
    topCategories: Array<{ name: string; count: number }>
    featured: Array<{ name: string; rating: number; price: string }>
}

export default function MarketaiDashboard() {
    const marketStats: MarketStats = {
        totalAgents: 847,
        totalModules: 1256,
        activeTraders: 342,
        dailyVolume: '45,780 COINS',
        topCategories: [
            { name: 'Data Processing', count: 124 },
            { name: 'NLP Models', count: 98 },
            { name: 'Computer Vision', count: 76 },
            { name: 'Trading Bots', count: 65 }
        ],
        featured: [
            { name: 'GPT-4 Wrapper', rating: 4.8, price: '150 COINS' },
            { name: 'Sentiment Analyzer', rating: 4.6, price: '89 COINS' },
            { name: 'Chart Reader AI', rating: 4.9, price: '200 COINS' }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Store className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">MarketAI</h1>
                            <p className="text-gray-600">Marketplace for AI Agents & Modules</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Market Status: Active
                    </Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 border-0 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Agents</p>
                                <p className="text-2xl font-bold text-gray-900">{marketStats.totalAgents.toLocaleString()}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Modules</p>
                                <p className="text-2xl font-bold text-gray-900">{marketStats.totalModules.toLocaleString()}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Traders</p>
                                <p className="text-2xl font-bold text-gray-900">{marketStats.activeTraders.toLocaleString()}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Daily Volume</p>
                                <p className="text-2xl font-bold text-gray-900">{marketStats.dailyVolume}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-orange-500" />
                        </div>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Categories */}
                    <Card className="p-6 border-0 shadow-sm lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
                        </div>
                        <div className="space-y-3">
                            {marketStats.topCategories.map((category, index) => (
                                <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-900">{category.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{category.count} items</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Featured Items */}
                    <Card className="p-6 border-0 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <Star className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Featured</h3>
                        </div>
                        <div className="space-y-4">
                            {marketStats.featured.map((item) => (
                                <div key={item.name} className="p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                                        <Badge variant="secondary" className="text-xs">{item.price}</Badge>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600">{item.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Market Activity */}
                <Card className="p-6 border-0 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Recent Market Activity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">New Agent Published</span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">AutoTrader Pro v2.1</p>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-800">High Volume Trade</span>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">Data Processor sold for 500 COINS</p>
                        </div>

                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm font-medium text-purple-800">New Category</span>
                            </div>
                            <p className="text-sm text-purple-700 mt-1">Image Recognition added</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
