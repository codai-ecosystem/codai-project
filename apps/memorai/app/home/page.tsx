'use client'

import { ProtectedRoute, HomePage } from '@codai/shared-ui'
import { Brain, Database, Search, BookOpen } from 'lucide-react'

export default function HomePageAuthenticated() {
    const quickActions = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: 'Memory Training',
            description: 'Start a cognitive enhancement session',
            action: () => window.location.href = '/memories',
            variant: 'gradient' as const
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: 'Knowledge Base',
            description: 'Browse your stored memories',
            action: () => window.location.href = '/data',
            variant: 'secondary' as const
        },
        {
            icon: <Search className="w-6 h-6" />,
            title: 'Smart Search',
            description: 'Find memories with AI search',
            action: () => window.location.href = '/search',
            variant: 'outline' as const
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: 'Learning Path',
            description: 'Continue your optimization journey',
            action: () => window.location.href = '/analytics',
            variant: 'default' as const
        }
    ]

    const recentActivity = [
        {
            title: 'Completed memory training session',
            description: 'Improved recall speed by 15%',
            time: '2 hours ago',
            type: 'success' as const
        },
        {
            title: 'Smart search: "AI algorithms"',
            description: 'Found 24 relevant memories',
            time: '4 hours ago',
            type: 'info' as const
        },
        {
            title: 'Added new knowledge cluster',
            description: 'Machine Learning concepts',
            time: '1 day ago',
            type: 'success' as const
        }
    ]

    return (
        <ProtectedRoute>
            <HomePage
                appName="MEMORAI"
                appDescription="Enhance your cognitive abilities with AI-powered memory enhancement"
                quickActions={quickActions}
                recentActivity={recentActivity}
                onViewDashboard={() => window.location.href = '/dashboard'}
                brandColor="purple"
            />
        </ProtectedRoute>
    )
}
