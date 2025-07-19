'use client'

import { ProtectedRoute, HomePage } from '@codai/shared-ui'
import { Activity, Search, AlertTriangle, BarChart3 } from 'lucide-react'

export default function HomePageAuthenticated() {
    const quickActions = [
        {
            icon: <Activity className="w-6 h-6" />,
            title: 'Live Monitor',
            description: 'View real-time log streams',
            action: () => window.location.href = '/monitor',
            variant: 'gradient' as const
        },
        {
            icon: <Search className="w-6 h-6" />,
            title: 'Search Logs',
            description: 'Query historical log data',
            action: () => window.location.href = '/search',
            variant: 'secondary' as const
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: 'Alerts',
            description: 'Manage alerts and notifications',
            action: () => window.location.href = '/alerts',
            variant: 'outline' as const
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Analytics',
            description: 'View performance metrics',
            action: () => window.location.href = '/analytics',
            variant: 'default' as const
        }
    ]

    const recentActivity = [
        {
            title: 'Critical error detected',
            description: 'Database connection failure in production',
            time: '5 minutes ago',
            type: 'error' as const
        },
        {
            title: 'Performance alert resolved',
            description: 'API response time back to normal',
            time: '15 minutes ago',
            type: 'success' as const
        },
        {
            title: 'New anomaly pattern identified',
            description: 'Unusual traffic spike in user authentication',
            time: '1 hour ago',
            type: 'warning' as const
        }
    ]

    return (
        <ProtectedRoute>
            <HomePage
                appName="LOGAI"
                appDescription="Monitor and analyze your systems with AI-powered log intelligence"
                quickActions={quickActions}
                recentActivity={recentActivity}
                onViewDashboard={() => window.location.href = '/dashboard'}
                brandColor="blue"
            />
        </ProtectedRoute>
    )
}
