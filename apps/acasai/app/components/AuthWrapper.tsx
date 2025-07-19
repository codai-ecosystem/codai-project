'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      // Check for auth token in localStorage
      const token = localStorage.getItem('auth_token')
      const isLoggedIn = !!token
      
      setIsAuthenticated(isLoggedIn)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Route protection logic
  useEffect(() => {
    if (isLoading || !pathname) return

    const publicRoutes = ['/landing', '/auth/login', '/auth/register', '/auth/forgot-password']
    const isPublicRoute = publicRoutes.includes(pathname)

    // If on root path, redirect based on auth status
    if (pathname === '/') {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/landing')
      }
      return
    }

    // If authenticated and on public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.push('/dashboard')
      return
    }

    // If not authenticated and on protected route, redirect to landing
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/landing')
      return
    }
  }, [isAuthenticated, pathname, router, isLoading])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading acasai...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}