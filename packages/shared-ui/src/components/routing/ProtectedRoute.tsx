'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthProvider'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    redirectTo?: string
    requiredPermissions?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    fallback,
    redirectTo = '/login',
    requiredPermissions = []
}) => {
    const { isAuthenticated, isLoading, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Store the attempted URL for redirect after login
                const returnUrl = encodeURIComponent(pathname)
                router.push(`${redirectTo}?returnUrl=${returnUrl}`)
                return
            }

            // Check permissions if required
            if (requiredPermissions.length > 0 && user) {
                const hasPermission = requiredPermissions.every(permission =>
                    user.permissions?.includes(permission)
                )

                if (!hasPermission) {
                    router.push('/unauthorized')
                    return
                }
            }
        }
    }, [isAuthenticated, isLoading, user, router, pathname, redirectTo, requiredPermissions])

    if (isLoading) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-lg">Loading...</span>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (requiredPermissions.length > 0 && user) {
        const hasPermission = requiredPermissions.every(permission =>
            user.permissions?.includes(permission)
        )

        if (!hasPermission) {
            return null
        }
    }

    return <>{children}</>
}
