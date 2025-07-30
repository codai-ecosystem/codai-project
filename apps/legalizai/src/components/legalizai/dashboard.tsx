'use client'

import { useState } from 'react'

export function LegalizaiDashboard() {
    const [stats] = useState({
        activeCases: 156,
        complianceScore: 94.2,
        billableHours: 2847,
        revenue: 1247000
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                            <span className="text-xl font-bold">⚖️</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">LEGALIZAI</h1>
                            <p className="text-slate-600">AI Legal & Compliance Management Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                            System Compliant
                        </div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            Legal Operations Active
                        </div>
                    </div>
                </div>

                {/* Core Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-white/60 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-slate-600">Active Cases</h3>
                            <span className="text-blue-600">⚖️</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{stats.activeCases}</div>
                            <p className="text-xs text-slate-500">+12% from last month</p>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white/60 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-slate-600">Compliance Score</h3>
                            <span className="text-green-600">🛡️</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{stats.complianceScore}%</div>
                            <p className="text-xs text-slate-500">Excellent rating</p>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white/60 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-slate-600">Billable Hours</h3>
                            <span className="text-purple-600">⏰</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{stats.billableHours.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">This quarter</p>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white/60 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-slate-600">Revenue</h3>
                            <span className="text-emerald-600">💰</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">${(stats.revenue / 1000).toFixed(0)}K</div>
                            <p className="text-xs text-slate-500">YTD performance</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="rounded-lg border bg-white/60 backdrop-blur-sm shadow-lg">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                            <span>🛡️</span>
                            Legal Operations Center
                        </h3>
                        <p className="text-sm text-slate-600">Comprehensive legal case management and compliance monitoring</p>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="font-semibold">Recent Cases</h3>
                                <div className="space-y-2">
                                    <div className="p-3 rounded-lg bg-slate-50/50">
                                        <p className="font-medium">Enterprise Software License Agreement</p>
                                        <p className="text-sm text-slate-600">TechCorp Industries • Due: 2024-02-15</p>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1">
                                            Active
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50/50">
                                        <p className="font-medium">GDPR Compliance Audit</p>
                                        <p className="text-sm text-slate-600">DataFlow Solutions • Due: 2024-01-30</p>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1">
                                            Pending
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold">Compliance Metrics</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm">Data Privacy (GDPR)</span>
                                            <span className="text-sm font-medium">98%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="h-2 rounded-full bg-green-500" style={{ width: '98%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm">Financial Compliance</span>
                                            <span className="text-sm font-medium">96%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="h-2 rounded-full bg-green-500" style={{ width: '96%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm">Contract Management</span>
                                            <span className="text-sm font-medium">88%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="h-2 rounded-full bg-blue-500" style={{ width: '88%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg h-10 px-4 py-2">
                        📄 New Case
                    </button>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-200 hover:bg-slate-50 h-10 px-4 py-2">
                        🔍 Legal Research
                    </button>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-200 hover:bg-slate-50 h-10 px-4 py-2">
                        🛡️ Compliance Audit
                    </button>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-200 hover:bg-slate-50 h-10 px-4 py-2">
                        🏢 Client Portal
                    </button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>LEGALIZAI - AI Legal & Compliance Management Platform</p>
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-green-200 text-green-700">
                                🛡️ Compliant & Secure
                            </div>
                            <p>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
