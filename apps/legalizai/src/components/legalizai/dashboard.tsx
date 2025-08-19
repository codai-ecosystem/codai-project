'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@codai/shared-ui'
import {
    Scale,
    Shield,
    Clock,
    DollarSign,
    FileText,
    Search,
    AlertShield,
    Building,
    Activity,
    TrendingUp,
    Calendar,
    CheckCircle
} from 'lucide-react'

// TypeScript interfaces for legal data structures
interface LegalStats {
    activeCases: number
    complianceScore: number
    billableHours: number
    revenue: number
}

interface CaseItem {
    id: string
    title: string
    client: string
    dueDate: string
    status: 'active' | 'pending' | 'completed'
    priority: 'high' | 'medium' | 'low'
}

interface ComplianceMetric {
    category: string
    score: number
    status: 'excellent' | 'good' | 'needs-improvement'
}

export function LegalizaiDashboard() {
    const [stats] = useState<LegalStats>({
        activeCases: 156,
        complianceScore: 94.2,
        billableHours: 2847,
        revenue: 1247000
    })

    const [recentCases] = useState<CaseItem[]>([
        {
            id: '1',
            title: 'Enterprise Software License Agreement',
            client: 'TechCorp Industries',
            dueDate: '2024-02-15',
            status: 'active',
            priority: 'high'
        },
        {
            id: '2',
            title: 'GDPR Compliance Audit',
            client: 'DataFlow Solutions',
            dueDate: '2024-01-30',
            status: 'pending',
            priority: 'medium'
        }
    ])

    const [complianceMetrics] = useState<ComplianceMetric[]>([
        { category: 'Data Privacy (GDPR)', score: 98, status: 'excellent' },
        { category: 'Financial Compliance', score: 96, status: 'excellent' },
        { category: 'Contract Management', score: 88, status: 'good' }
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                            <Scale className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                                LEGALIZAI
                            </h1>
                            <p className="text-lg text-slate-600">AI Legal & Compliance Management Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            System Compliant
                        </Badge>
                        <Badge variant="outline">
                            <Activity className="mr-1 h-3 w-3" />
                            Legal Operations Active
                        </Badge>
                    </div>
                </div>

                {/* Core Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Cases</CardTitle>
                            <Scale className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                {stats.activeCases}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Compliance Score</CardTitle>
                            <Shield className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                                {stats.complianceScore}%
                            </div>
                            <p className="text-xs text-slate-500">Excellent rating</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Billable Hours</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
                                {stats.billableHours.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">This quarter</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                                ${(stats.revenue / 1000).toFixed(0)}K
                            </div>
                            <p className="text-xs text-slate-500">YTD performance</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Legal Operations Center */}
                <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                            <AlertShield className="h-6 w-6 text-blue-600" />
                            Legal Operations Center
                        </CardTitle>
                        <CardDescription>
                            Comprehensive legal case management and compliance monitoring
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Recent Cases */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Recent Cases
                                </h3>
                                <div className="space-y-3">
                                    {recentCases.map((caseItem) => (
                                        <Card key={caseItem.id} className="bg-slate-50/50">
                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-medium text-slate-900">{caseItem.title}</h4>
                                                        <Badge
                                                            variant={caseItem.status === 'active' ? 'default' : 'outline'}
                                                            className={
                                                                caseItem.status === 'active'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : ''
                                                            }
                                                        >
                                                            {caseItem.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600 flex items-center gap-1">
                                                        <Building className="h-3 w-3" />
                                                        {caseItem.client}
                                                    </p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Due: {caseItem.dueDate}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Compliance Metrics */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Compliance Metrics
                                </h3>
                                <div className="space-y-4">
                                    {complianceMetrics.map((metric, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{metric.category}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        metric.status === 'excellent'
                                                            ? 'bg-green-100 text-green-800'
                                                            : metric.status === 'good'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                    }
                                                >
                                                    {metric.score}%
                                                </Badge>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${metric.status === 'excellent'
                                                            ? 'bg-green-500'
                                                            : metric.status === 'good'
                                                                ? 'bg-blue-500'
                                                                : 'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${metric.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
                        <FileText className="mr-2 h-4 w-4" />
                        New Case
                    </Button>
                    <Button variant="outline" className="hover:bg-slate-50">
                        <Search className="mr-2 h-4 w-4" />
                        Legal Research
                    </Button>
                    <Button variant="outline" className="hover:bg-slate-50">
                        <AlertShield className="mr-2 h-4 w-4" />
                        Compliance Audit
                    </Button>
                    <Button variant="outline" className="hover:bg-slate-50">
                        <Building className="mr-2 h-4 w-4" />
                        Client Portal
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p className="flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            LEGALIZAI - AI Legal & Compliance Management Platform
                        </p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                                <Shield className="mr-1 h-3 w-3" />
                                Compliant & Secure
                            </Badge>
                            <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

