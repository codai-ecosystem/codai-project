'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthProvider'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface GuestRouteProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    redirectTo?: string
}

const GuestRouteInner: React.FC<GuestRouteProps> = ({
    children,
    fallback,
    redirectTo = '/dashboard'
}) => {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Check for return URL from query params
            const returnUrl = searchParams.get('returnUrl')
            const destination = returnUrl ? decodeURIComponent(returnUrl) : redirectTo
            router.push(destination)
        }
    }, [isAuthenticated, isLoading, router, searchParams, redirectTo])

    if (isLoading) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-lg">Loading...</span>
            </div>
        )
    }

    if (isAuthenticated) {
        return null
    }

    return <>{children}</>
}

export const GuestRoute: React.FC<GuestRouteProps> = (props) => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-lg">Loading...</span>
            </div>
        }>
            <GuestRouteInner {...props} />
        </Suspense>
    )
}
