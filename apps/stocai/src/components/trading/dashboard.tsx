'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Bot } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Stock {
    symbol: string
    price: number
    change: number
    changePercent: number
}

interface MarketIndex {
    name: string
    value: number
    change: number
    changePercent: number
}

export function TradingDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [marketData] = useState<MarketIndex[]>([
        { name: 'S&P 500', value: 4731.23, change: 12.45, changePercent: 0.26 },
        { name: 'DOW JONES', value: 36585.06, change: -89.22, changePercent: -0.24 },
        { name: 'NASDAQ', value: 14689.3, change: 156.78, changePercent: 1.08 }
    ])

    const [portfolio] = useState({
        totalValue: 487234.50,
        todayGain: 2845.67,
        todayGainPercent: 0.59
    })

    const [watchlist] = useState<Stock[]>([
        { symbol: 'AAPL', price: 182.41, change: 2.34, changePercent: 1.3 },
        { symbol: 'GOOGL', price: 138.21, change: -1.45, changePercent: -1.04 },
        { symbol: 'MSFT', price: 374.58, change: 5.67, changePercent: 1.54 },
        { symbol: 'AMZN', price: 153.37, change: -2.1, changePercent: -1.35 },
        { symbol: 'TSLA', price: 238.45, change: 12.34, changePercent: 5.46 }
    ])

    const [aiInsights] = useState([
        'Based on current market trends, technology stocks show strong momentum for Q4.',
        'Consider taking profits on TSLA position given recent volatility patterns.',
        'Energy sector presenting oversold opportunities in current market cycle.',
        'Federal Reserve policy decisions likely to impact bond yields next week.'
    ])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatPercent = (percent: number) => {
        return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">STOCAI</h1>
                        <p className="text-slate-600">AI-Powered Trading Intelligence Platform</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500">Market Status</div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-green-600">Markets Open</span>
                        </div>
                        <div className="text-xs text-slate-400">{currentTime.toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>

            {/* Market Indices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {marketData.map((index) => (
                    <Card key={index.name} className="bg-white shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">{index.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-slate-900">
                                    {index.value.toLocaleString()}
                                </div>
                                <div className={`flex items-center gap-1 ${index.change >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {index.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="font-semibold">
                                        {formatPercent(index.changePercent)}
                                    </span>
                                </div>
                            </div>
                            <div className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Portfolio Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-sm opacity-90">Total Value</div>
                                <div className="text-3xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
                            </div>
                            <div>
                                <div className="text-sm opacity-90">Today's Gain</div>
                                <div className="text-2xl font-bold text-green-300">
                                    +{formatCurrency(portfolio.todayGain)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm opacity-90">Return</div>
                                <div className="text-2xl font-bold text-green-300">
                                    {formatPercent(portfolio.todayGainPercent)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                            Buy Stock
                        </Button>
                        <Button variant="outline" className="w-full">
                            Sell Position
                        </Button>
                        <Button variant="outline" className="w-full">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Watchlist and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Watchlist */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Watchlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {watchlist.map((stock) => (
                                <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <div>
                                        <div className="font-semibold text-slate-900">{stock.symbol}</div>
                                        <div className="text-sm text-slate-600">{formatCurrency(stock.price)}</div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={stock.change >= 0 ? "default" : "destructive"} className={
                                            stock.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }>
                                            {formatPercent(stock.changePercent)}
                                        </Badge>
                                        <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            AI Trading Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {aiInsights.map((insight, index) => (
                                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                                    <div className="text-sm text-slate-700">{insight}</div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                            Get More Insights
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

