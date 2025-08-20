/**
 * Enhanced Theme Provider with app-specific themes and dark/light mode support
 * Supports all 46 CODAI ecosystem applications with unique gradient themes
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { appThemes, type AppName, type AppThemeConfig, generateAppCSSVariables } from '../../config/enhanced-app-themes'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
    appName: AppName
    themeMode: ThemeMode
    isDark: boolean
    themeConfig: AppThemeConfig
    setThemeMode: (mode: ThemeMode) => void
    setAppName: (appName: AppName) => void
    cssVariables: Record<string, string>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
    appName: AppName
    defaultThemeMode?: ThemeMode
    storageKey?: string
}

export function EnhancedThemeProvider({
    children,
    appName,
    defaultThemeMode = 'system',
    storageKey = 'codai-theme-preference'
}: ThemeProviderProps) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode)
    const [isDark, setIsDark] = useState(false)
    const [currentAppName, setCurrentAppName] = useState<AppName>(appName)

    // Load theme preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey)
            if (stored && ['light', 'dark', 'system'].includes(stored)) {
                setThemeModeState(stored as ThemeMode)
            }
        }
    }, [storageKey])

    // Handle system theme detection and changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const updateTheme = () => {
            if (themeMode === 'system') {
                setIsDark(mediaQuery.matches)
            } else {
                setIsDark(themeMode === 'dark')
            }
        }

        updateTheme()

        const listener = () => {
            if (themeMode === 'system') {
                setIsDark(mediaQuery.matches)
            }
        }

        mediaQuery.addEventListener('change', listener)
        return () => mediaQuery.removeEventListener('change', listener)
    }, [themeMode])

    // Apply theme to document root
    useEffect(() => {
        const root = document.documentElement
        const themeConfig = appThemes[currentAppName]
        const cssVars = generateAppCSSVariables(currentAppName, isDark)

        // Apply CSS custom properties
        Object.entries(cssVars).forEach(([property, value]) => {
            root.style.setProperty(property, value as string)
        })

        // Apply theme class
        root.className = `theme-${currentAppName} ${isDark ? 'dark' : 'light'}`

        // Set data attributes for styling
        root.setAttribute('data-theme', isDark ? 'dark' : 'light')
        root.setAttribute('data-app', currentAppName)

        // Apply background gradient
        document.body.style.background = cssVars['--gradient-primary']

        return () => {
            // Cleanup on unmount
            Object.keys(cssVars).forEach(property => {
                root.style.removeProperty(property)
            })
        }
    }, [currentAppName, isDark])

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode)
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, mode)
        }
    }

    const setAppName = (name: AppName) => {
        setCurrentAppName(name)
    }

    const themeConfig = appThemes[currentAppName]
    const cssVariables = generateAppCSSVariables(currentAppName, isDark)

    const contextValue: ThemeContextType = {
        appName: currentAppName,
        themeMode,
        isDark,
        themeConfig,
        setThemeMode,
        setAppName,
        cssVariables
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within an EnhancedThemeProvider')
    }
    return context
}

// Theme selector component
export function ThemeSelector() {
    const { themeMode, setThemeMode } = useTheme()

    return (
        <div className="theme-selector flex items-center gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <span className="text-sm font-medium text-white/80">Theme:</span>
            <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
                className="px-3 py-1 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    )
}

// App selector component (for admin/development use)
export function AppSelector() {
    const { appName, setAppName } = useTheme()

    return (
        <div className="app-selector flex items-center gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <span className="text-sm font-medium text-white/80">App:</span>
            <select
                value={appName}
                onChange={(e) => setAppName(e.target.value as AppName)}
                className="px-3 py-1 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
                {Object.entries(appThemes).map(([key, theme]) => (
                    <option key={key} value={key}>
                        {(theme as AppThemeConfig).displayName}
                    </option>
                ))}
            </select>
        </div>
    )
}

// Utility component for app-specific styling
export function AppThemeWrapper({
    children,
    className = ''
}: {
    children: ReactNode
    className?: string
}) {
    const { appName, isDark } = useTheme()

    return (
        <div
            className={`app-theme-wrapper theme-${appName} ${isDark ? 'dark' : 'light'} ${className}`}
            data-app={appName}
            data-theme={isDark ? 'dark' : 'light'}
        >
            {children}
        </div>
    )
}

export default EnhancedThemeProvider
