'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthProvider'
import { LandingPage } from '../pages/LandingPage'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'

interface AppRoutingProps {
    appName: string
    appDescription?: string
    appTagline?: string
    features?: Array<{
        title: string
        description: string
        icon: React.ReactNode
        status?: 'active' | 'beta' | 'coming-soon'
    }>
    brandColor?: string
    dashboardComponent?: React.ComponentType<any>
    homeComponent?: React.ComponentType<any>
    children?: React.ReactNode
}

export const AppRouting: React.FC<AppRoutingProps> = ({
    appName,
    appDescription,
    appTagline,
    features,
    brandColor,
    dashboardComponent: DashboardComponent,
    homeComponent: HomeComponent,
    children
}) => {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    // Root path logic
    if (pathname === '/') {
        if (isAuthenticated) {
            router.push('/home')
            return null
        } else {
            return (
                <GuestRoute>
                    <LandingPage
                        appName={appName}
                        appDescription={appDescription}
                        appTagline={appTagline}
                        features={features}
                        brandColor={brandColor}
                        onGetStarted={() => router.push('/signup')}
                        onSignIn={() => router.push('/login')}
                        onSignUp={() => router.push('/signup')}
                    />
                </GuestRoute>
            )
        }
    }

    // Dashboard route
    if (pathname === '/dashboard') {
        return (
            <ProtectedRoute>
                {DashboardComponent ? <DashboardComponent /> : children}
            </ProtectedRoute>
        )
    }

    // Home route (authenticated)
    if (pathname === '/home') {
        return (
            <ProtectedRoute>
                {HomeComponent ? <HomeComponent /> : children}
            </ProtectedRoute>
        )
    }

    // Default behavior for other routes
    return <>{children}</>
}
