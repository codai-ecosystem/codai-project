// 🪝 CODAI ECOSYSTEM - SHARED HOOKS
// Reusable React hooks for ecosystem-wide functionality

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
    CodAIApp,
    User,
    Memory,
    Transaction,
    Project,
    APIResponse
} from '@codai/shared-types'
import {
    ecosystemService,
    authService,
    dataSyncService,
    financialService,
    memoryService,
    projectService
} from '@codai/shared-services'

// ==================== ECOSYSTEM HOOKS ====================

export function useEcosystem() {
    const [apps, setApps] = useState<CodAIApp[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const discoverApps = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const discoveredApps = await ecosystemService.discoverApps()
            setApps(discoveredApps)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to discover apps')
        } finally {
            setLoading(false)
        }
    }, [])

    const callApp = useCallback(async <T = unknown>(
        appId: string,
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        data?: unknown
    ): Promise<APIResponse<T>> => {
        return ecosystemService.callApp<T>(appId, endpoint, method, data)
    }, [])

    useEffect(() => {
        discoverApps()

        const interval = setInterval(discoverApps, 30000) // Refresh every 30 seconds
        return () => clearInterval(interval)
    }, [discoverApps])

    return {
        apps,
        loading,
        error,
        refresh: discoverApps,
        callApp
    }
}

export function useEcosystemEvents() {
    const [events, setEvents] = useState<Array<{ type: string; data: unknown; timestamp: string }>>([])

    useEffect(() => {
        const handleEvent = (type: string) => (data: unknown) => {
            setEvents(prev => [
                ...prev.slice(-99), // Keep only last 100 events
                {
                    type,
                    data,
                    timestamp: new Date().toISOString()
                }
            ])
        }

        // Register for key ecosystem events
        const eventTypes = [
            'app:registered',
            'app:updated',
            'user:login',
            'user:logout',
            'transaction:created',
            'memory:stored',
            'project:created'
        ]

        eventTypes.forEach(eventType => {
            ecosystemService.on(eventType, handleEvent(eventType))
        })

        return () => {
            // Cleanup would go here in a real implementation
        }
    }, [])

    return { events }
}

// ==================== AUTHENTICATION HOOKS ====================

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const login = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true)
            setError(null)
            const loggedInUser = await authService.login(email, password)
            setUser(loggedInUser)
            ecosystemService.emit('user:login', loggedInUser)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await authService.logout()
            setUser(null)
            ecosystemService.emit('user:logout', {})
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed')
        }
    }, [])

    useEffect(() => {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        setLoading(false)
    }, [])

    return {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user
    }
}

// ==================== DATA SYNC HOOKS ====================

export function useRealTimeData<T>(
    key: string,
    fetcher: () => Promise<T>,
    interval = 5000
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setError(null)
            const result = await fetcher()
            setData(result)
            setLastUpdated(new Date())
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }, [fetcher])

    useEffect(() => {
        fetchData()

        const intervalId = setInterval(fetchData, interval)
        return () => clearInterval(intervalId)
    }, [fetchData, interval])

    useEffect(() => {
        dataSyncService.connect()

        const handleUpdate = (eventData: unknown) => {
            if (eventData && typeof eventData === 'object' && 'key' in eventData) {
                if ((eventData as { key: string }).key === key) {
                    fetchData()
                }
            }
        }

        ecosystemService.on(`data:updated:${key}`, handleUpdate)

        return () => {
            dataSyncService.disconnect()
        }
    }, [key, fetchData])

    return {
        data,
        loading,
        error,
        lastUpdated,
        refresh: fetchData
    }
}

// ==================== FINANCIAL HOOKS ====================

export function useAccounts(userId: string) {
    const fetcher = useCallback(async () => {
        const response = await financialService.getAccounts(userId)
        return response.data
    }, [userId])

    return useRealTimeData('accounts', fetcher, 10000)
}

export function useTransactions(accountId: string) {
    const fetcher = useCallback(async () => {
        const response = await financialService.getTransactions(accountId)
        return response.data
    }, [accountId])

    return useRealTimeData('transactions', fetcher, 5000)
}

export function useBalance(accountIds: string[]) {
    const [balances, setBalances] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBalances = async () => {
            setLoading(true)
            const balancePromises = accountIds.map(async (accountId) => {
                try {
                    const response = await financialService.getAccounts(accountId)
                    return { accountId, balance: response.data?.balance || 0 }
                } catch {
                    return { accountId, balance: 0 }
                }
            })

            const results = await Promise.all(balancePromises)
            const balanceMap = results.reduce((acc, { accountId, balance }) => {
                acc[accountId] = balance
                return acc
            }, {} as Record<string, number>)

            setBalances(balanceMap)
            setLoading(false)
        }

        if (accountIds.length > 0) {
            fetchBalances()
        }
    }, [accountIds])

    return { balances, loading }
}

// ==================== MEMORY HOOKS ====================

export function useMemories(userId: string, type?: string) {
    const fetcher = useCallback(async () => {
        const response = await memoryService.getMemories(userId, type)
        return response.data
    }, [userId, type])

    return useRealTimeData('memories', fetcher, 15000)
}

export function useMemorySearch() {
    const [results, setResults] = useState<Memory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const search = useCallback(async (query: string, limit = 10) => {
        if (!query.trim()) {
            setResults([])
            return
        }

        try {
            setLoading(true)
            setError(null)
            const response = await memoryService.searchMemories(query, limit)
            setResults(response.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed')
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    return { results, loading, error, search }
}

// ==================== PROJECT HOOKS ====================

export function useProjects(userId: string) {
    const fetcher = useCallback(async () => {
        const response = await projectService.getProjects(userId)
        return response.data
    }, [userId])

    return useRealTimeData('projects', fetcher, 20000)
}

export function useProjectAnalytics(projectId: string) {
    const fetcher = useCallback(async () => {
        const response = await projectService.getProjectAnalytics(projectId)
        return response.data
    }, [projectId])

    return useRealTimeData(`project-analytics-${projectId}`, fetcher, 30000)
}

// ==================== UTILITY HOOKS ====================

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            return initialValue
        }
    })

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error(`Error saving to localStorage:`, error)
        }
    }, [key, storedValue])

    return [storedValue, setValue] as const
}

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>()

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        function tick() {
            savedCallback.current?.()
        }
        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}

export function useOnline() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine)

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)

        return () => {
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
        }
    }, [])

    return isOnline
}

// ==================== FORM HOOKS ====================

export function useForm<T extends Record<string, unknown>>(
    initialValues: T,
    onSubmit?: (values: T) => void | Promise<void>
) {
    const [values, setValues] = useState<T>(initialValues)
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const setValue = useCallback((name: keyof T, value: unknown) => {
        setValues(prev => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }, [errors])

    const setError = useCallback((name: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [name]: error }))
    }, [])

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!onSubmit) return

        try {
            setIsSubmitting(true)
            await onSubmit(values)
        } catch (error) {
            console.error('Form submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }, [values, onSubmit])

    const reset = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setIsSubmitting(false)
    }, [initialValues])

    return {
        values,
        errors,
        isSubmitting,
        setValue,
        setError,
        handleSubmit,
        reset
    }
}
