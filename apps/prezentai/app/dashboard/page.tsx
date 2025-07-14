import { LiveDashboard } from '@/components/sections/LiveDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Live Dashboard - PREZENTAI.RO',
    description: 'Real-time monitoring and analytics for the CODAI ecosystem',
    robots: 'noindex, nofollow' // Keep dashboard private
}

export default function DashboardPage() {
    return <LiveDashboard />
}
