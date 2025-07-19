'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface AuthUser {
    id: string
    email: string
    name: string
    role?: string
    avatar?: string
}

export interface AuthConfig {
    landingPage: string        // "/" - for non-authenticated users  
    homePage: string          // "/home" - authenticated default
    dashboardPage: string     // "/dashboard" - app-specific dashboard
    loginRedirect: string     // Where to redirect after login
    logoutRedirect: string    // Where to redirect after logout
}

const defaultAuthConfig: AuthConfig = {
    landingPage: '/',
    homePage: '/home',
    dashboardPage: '/dashboard',
    loginRedirect: '/dashboard',
    logoutRedirect: '/'
}

export function useAuth(config: Partial<AuthConfig> = {}) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const authConfig = { ...defaultAuthConfig, ...config }

    // Check authentication status
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true)
            // Try to get user from session/cookie/localStorage
            const sessionUser = getSessionUser()

            if (sessionUser) {
                setUser(sessionUser)
                setIsAuthenticated(true)
            } else {
                // Try to refresh session from API
                const response = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include'
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                    setIsAuthenticated(true)
                    setSessionUser(userData)
                } else {
                    setUser(null)
                    setIsAuthenticated(false)
                    clearSession()
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setUser(null)
            setIsAuthenticated(false)
            clearSession()
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include'
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
                setIsAuthenticated(true)
                setSessionUser(userData)

                // Redirect to intended page or dashboard
                const intendedUrl = getIntendedUrl() || authConfig.loginRedirect
                router.push(intendedUrl)

                return { success: true, user: userData }
            } else {
                const error = await response.json()
                return { success: false, error: error.message }
            }
        } catch (error) {
            console.error('Login failed:', error)
            return { success: false, error: 'Login failed. Please try again.' }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            setIsLoading(true)
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setUser(null)
            setIsAuthenticated(false)
            clearSession()
            router.push(authConfig.logoutRedirect)
            setIsLoading(false)
        }
    }

    const signup = async (userData: {
        name: string
        email: string
        password: string
        confirmPassword: string
    }) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include'
            })

            if (response.ok) {
                const newUser = await response.json()
                setUser(newUser)
                setIsAuthenticated(true)
                setSessionUser(newUser)

                router.push(authConfig.loginRedirect)
                return { success: true, user: newUser }
            } else {
                const error = await response.json()
                return { success: false, error: error.message }
            }
        } catch (error) {
            console.error('Signup failed:', error)
            return { success: false, error: 'Signup failed. Please try again.' }
        } finally {
            setIsLoading(false)
        }
    }

    // Session management helpers
    const getSessionUser = (): AuthUser | null => {
        try {
            const stored = localStorage.getItem('codai_user')
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    }

    const setSessionUser = (user: AuthUser) => {
        localStorage.setItem('codai_user', JSON.stringify(user))
    }

    const clearSession = () => {
        localStorage.removeItem('codai_user')
        localStorage.removeItem('codai_intended_url')
    }

    const setIntendedUrl = (url: string) => {
        localStorage.setItem('codai_intended_url', url)
    }

    const getIntendedUrl = (): string | null => {
        const url = localStorage.getItem('codai_intended_url')
        if (url) {
            localStorage.removeItem('codai_intended_url')
        }
        return url
    }

    // Route protection
    const requireAuth = () => {
        if (!isLoading && !isAuthenticated) {
            setIntendedUrl(pathname)
            router.push(authConfig.landingPage)
        }
    }

    const requireGuest = () => {
        if (!isLoading && isAuthenticated) {
            router.push(authConfig.dashboardPage)
        }
    }

    const getRedirectUrl = () => {
        if (isAuthenticated) {
            return authConfig.dashboardPage
        } else {
            return authConfig.landingPage
        }
    }

    return {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        signup,
        requireAuth,
        requireGuest,
        getRedirectUrl,
        checkAuthStatus,
        config: authConfig
    }
}

export default useAuth
