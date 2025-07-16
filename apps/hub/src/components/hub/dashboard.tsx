'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Network,
    Activity,
    Layers,
    Cpu,
    GitBranch,
    Settings,
    BarChart3,
    Link,
    Target,
    Zap,
    Globe,
    Server,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react'

interface HubStats {
    connectedServices: number
    totalIntegrations: number
    activeWorkflows: number
    dataProcessed: string
    uptime: string
    responseTime: number
}

interface ServiceConnection {
    name: string
    status: 'connected' | 'disconnected' | 'warning'
    type: 'api' | 'database' | 'service' | 'webhook'
    lastSync: string
    dataPoints: number
}

export function HubDashboard() {
    const [stats] = useState<HubStats>({
        connectedServices: 24,
        totalIntegrations: 156,
        activeWorkflows: 18,
        dataProcessed: '2.4TB',
        uptime: '99.9%',
        responseTime: 45
    })

    const serviceConnections: ServiceConnection[] = [
        { name: 'CODAI Core API', status: 'connected', type: 'api', lastSync: '2 min ago', dataPoints: 15420 },
        { name: 'Analytics DB', status: 'connected', type: 'database', lastSync: '5 min ago', dataPoints: 8932 },
        { name: 'User Service', status: 'warning', type: 'service', lastSync: '12 min ago', dataPoints: 3456 },
        { name: 'Webhook Processor', status: 'connected', type: 'webhook', lastSync: '1 min ago', dataPoints: 7821 },
        { name: 'AI Service Gateway', status: 'connected', type: 'api', lastSync: '3 min ago', dataPoints: 12456 },
        { name: 'Data Pipeline', status: 'disconnected', type: 'service', lastSync: '45 min ago', dataPoints: 0 }
    ]

    const activeWorkflows = [
        { name: 'User Data Sync', status: 'running', progress: 85, eta: '2 min' },
        { name: 'AI Model Training', status: 'running', progress: 34, eta: '1h 23m' },
        { name: 'Report Generation', status: 'queued', progress: 0, eta: 'Waiting' },
        { name: 'Data Backup', status: 'completed', progress: 100, eta: 'Done' }
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'disconnected': return <AlertCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-700 border-green-200'
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'disconnected': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getWorkflowStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-blue-100 text-blue-700'
            case 'completed': return 'bg-green-100 text-green-700'
            case 'queued': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg">
                            <Network className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">HUB</h1>
                            <p className="text-slate-600">Codai Integration & Automation Center</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <Activity className="mr-1 h-3 w-3" />
                            All Systems Operational
                        </Badge>
                        <Badge variant="outline">v2.1.3</Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Connected Services</CardTitle>
                            <Link className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.connectedServices}</div>
                            <p className="text-xs text-slate-500">Active integrations</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Integrations</CardTitle>
                            <Layers className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalIntegrations}</div>
                            <p className="text-xs text-slate-500">Configured connections</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Workflows</CardTitle>
                            <GitBranch className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.activeWorkflows}</div>
                            <p className="text-xs text-slate-500">Running processes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Data Processed</CardTitle>
                            <BarChart3 className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.dataProcessed}</div>
                            <p className="text-xs text-slate-500">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">System Uptime</CardTitle>
                            <Server className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.uptime}</div>
                            <p className="text-xs text-slate-500">Last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Response Time</CardTitle>
                            <Zap className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.responseTime}ms</div>
                            <p className="text-xs text-slate-500">Average latency</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Service Connections */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-purple-600" />
                                Service Connections
                            </CardTitle>
                            <CardDescription>Active service integrations and their status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {serviceConnections.map((service, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                            {service.type === 'api' ? <Globe className="h-4 w-4" /> :
                                                service.type === 'database' ? <Server className="h-4 w-4" /> :
                                                    service.type === 'service' ? <Cpu className="h-4 w-4" /> :
                                                        <Link className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900">{service.name}</p>
                                                <Badge variant="outline" className={getStatusColor(service.status)}>
                                                    {getStatusIcon(service.status)}
                                                    <span className="ml-1 capitalize">{service.status}</span>
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500">{service.dataPoints.toLocaleString()} data points • {service.lastSync}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Active Workflows */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Active Workflows
                            </CardTitle>
                            <CardDescription>Currently running automation workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeWorkflows.map((workflow, index) => (
                                <div key={index} className="p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-slate-900">{workflow.name}</p>
                                            <Badge variant="outline" className={getWorkflowStatusColor(workflow.status)}>
                                                {workflow.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500">ETA: {workflow.eta}</p>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${workflow.progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{workflow.progress}% complete</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure Integration
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Activity className="mr-2 h-4 w-4" />
                        View Workflows
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics Dashboard
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Target className="mr-2 h-4 w-4" />
                        Monitoring
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>HUB - Codai Integration & Automation Center</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Integration Ready
                            </Badge>
                            <p>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
