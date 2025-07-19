'use client'

import { HomePage } from '@codai/shared-ui'
import { Home, Shield, Wifi, Zap, Activity, Settings, BarChart3, Plus } from 'lucide-react'

export default function AcasaiHomePage() {
    const quickActions = [
        {
            title: 'Control Devices',
            description: 'Manage all your smart home devices from one place',
            action: () => window.location.href = '/devices',
            icon: <Home className="h-5 w-5" />,
            variant: 'default' as const
        },
        {
            title: 'Security Center',
            description: 'Monitor your home security and safety systems',
            action: () => window.location.href = '/security',
            icon: <Shield className="h-5 w-5" />,
            variant: 'secondary' as const
        },
        {
            title: 'Automation Rules',
            description: 'Create and manage smart automation rules',
            action: () => window.location.href = '/automation',
            icon: <Zap className="h-5 w-5" />,
            variant: 'outline' as const
        }
    ]

    const recentActivity = [
        {
            title: 'Living Room Lights',
            description: 'Automatically dimmed for movie night',
            time: '5 minutes ago',
            type: 'success' as const
        },
        {
            title: 'Security System',
            description: 'Armed for night mode automatically',
            time: '15 minutes ago',
            type: 'info' as const
        },
        {
            title: 'Temperature Adjusted',
            description: 'AC adjusted to your preferred sleep temperature',
            time: '1 hour ago',
            type: 'success' as const
        }
    ]

    const navigation = [
        {
            label: 'Home',
            href: '/home',
            active: true,
            icon: <Home className="h-4 w-4" />
        },
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: <BarChart3 className="h-4 w-4" />
        },
        {
            label: 'Devices',
            href: '/devices',
            icon: <Wifi className="h-4 w-4" />
        },
        {
            label: 'Security',
            href: '/security',
            icon: <Shield className="h-4 w-4" />
        },
        {
            label: 'Automation',
            href: '/automation',
            icon: <Zap className="h-4 w-4" />
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: <Settings className="h-4 w-4" />
        }
    ]

    return (
        <HomePage
            appName="ACASAI"
            appDescription="Your smart home is running smoothly with 15 devices connected and 8 automation rules active."
            quickActions={quickActions}
            recentActivity={recentActivity}
            navigation={navigation}
            onViewDashboard={() => window.location.href = '/dashboard'}
            onLogout={() => window.location.href = '/login'}
            brandColor="blue"
        />
    )
}
