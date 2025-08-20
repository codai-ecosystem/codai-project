/**
 * Theme Provider for CODAI Ecosystem
 * Supports light/dark/system themes with app-specific branding
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { colors, type AppName } from '../config/design-tokens'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
    theme: Theme
    resolvedTheme: 'light' | 'dark'
    appName: AppName
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeConfig | undefined>(undefined)

interface ThemeProviderProps {
    children: React.ReactNode
    appName: AppName
    defaultTheme?: Theme
    enableSystem?: boolean
    enableTransitions?: boolean
    storageKey?: string
}

export function ThemeProvider({
    children,
    appName,
    defaultTheme = 'system',
    enableSystem = true,
    enableTransitions = true,
    storageKey = 'codai-theme',
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme)
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

    // Initialize theme from storage or system preference
    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            setThemeState(stored)
        } else if (enableSystem) {
            setThemeState('system')
        }
    }, [storageKey, enableSystem])

    // Update resolved theme when theme or system preference changes
    useEffect(() => {
        const updateResolvedTheme = () => {
            let resolved: 'light' | 'dark' = 'light'

            if (theme === 'system' && enableSystem) {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            } else if (theme === 'dark') {
                resolved = 'dark'
            }

            setResolvedTheme(resolved)

            // Update document classes and CSS variables
            updateDocumentTheme(resolved, appName)
        }

        updateResolvedTheme()

        // Listen for system theme changes
        if (theme === 'system' && enableSystem) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            mediaQuery.addEventListener('change', updateResolvedTheme)
            return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
        }
    }, [theme, enableSystem, appName])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem(storageKey, newTheme)
    }

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
        } else if (theme === 'dark') {
            setTheme(enableSystem ? 'system' : 'light')
        } else {
            setTheme('light')
        }
    }

    const contextValue: ThemeConfig = {
        theme,
        resolvedTheme,
        appName,
        setTheme,
        toggleTheme,
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            <div
                className={`codai-theme-${appName} ${enableTransitions ? 'transition-colors duration-300' : ''}`}
                data-theme={resolvedTheme}
                data-app={appName}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeConfig {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

// Update document theme classes and CSS variables
function updateDocumentTheme(theme: 'light' | 'dark', appName: AppName) {
    const root = document.documentElement

    // Remove previous theme classes
    root.classList.remove('light', 'dark')

    // Add current theme class
    root.classList.add(theme)

    // Update CSS custom properties for the current app
    const appColors = colors.apps[appName]

    if (theme === 'dark') {
        // Dark theme CSS variables
        root.style.setProperty('--background', colors.gray[950])
        root.style.setProperty('--foreground', colors.gray[50])
        root.style.setProperty('--muted', colors.gray[900])
        root.style.setProperty('--muted-foreground', colors.gray[400])
        root.style.setProperty('--popover', colors.gray[900])
        root.style.setProperty('--popover-foreground', colors.gray[50])
        root.style.setProperty('--card', colors.gray[900])
        root.style.setProperty('--card-foreground', colors.gray[50])
        root.style.setProperty('--border', colors.gray[800])
        root.style.setProperty('--input', colors.gray[800])
        root.style.setProperty('--primary', appColors[500])
        root.style.setProperty('--primary-foreground', colors.gray[50])
        root.style.setProperty('--secondary', colors.gray[800])
        root.style.setProperty('--secondary-foreground', colors.gray[200])
        root.style.setProperty('--accent', colors.gray[800])
        root.style.setProperty('--accent-foreground', colors.gray[200])
        root.style.setProperty('--destructive', colors.semantic.error[500])
        root.style.setProperty('--destructive-foreground', colors.gray[50])
        root.style.setProperty('--ring', appColors[500])
        root.style.setProperty('--radius', '0.5rem')
    } else {
        // Light theme CSS variables
        root.style.setProperty('--background', colors.gray[50])
        root.style.setProperty('--foreground', colors.gray[950])
        root.style.setProperty('--muted', colors.gray[100])
        root.style.setProperty('--muted-foreground', colors.gray[600])
        root.style.setProperty('--popover', colors.gray[50])
        root.style.setProperty('--popover-foreground', colors.gray[950])
        root.style.setProperty('--card', colors.gray[50])
        root.style.setProperty('--card-foreground', colors.gray[950])
        root.style.setProperty('--border', colors.gray[200])
        root.style.setProperty('--input', colors.gray[200])
        root.style.setProperty('--primary', appColors[500])
        root.style.setProperty('--primary-foreground', colors.gray[50])
        root.style.setProperty('--secondary', colors.gray[100])
        root.style.setProperty('--secondary-foreground', colors.gray[900])
        root.style.setProperty('--accent', colors.gray[100])
        root.style.setProperty('--accent-foreground', colors.gray[900])
        root.style.setProperty('--destructive', colors.semantic.error[500])
        root.style.setProperty('--destructive-foreground', colors.gray[50])
        root.style.setProperty('--ring', appColors[500])
        root.style.setProperty('--radius', '0.5rem')
    }

    // Set app-specific primary color
    root.style.setProperty('--app-primary', appColors[500])
    root.style.setProperty('--app-primary-50', appColors[50])
    root.style.setProperty('--app-primary-100', appColors[100])
    root.style.setProperty('--app-primary-200', appColors[200])
    root.style.setProperty('--app-primary-300', appColors[300])
    root.style.setProperty('--app-primary-400', appColors[400])
    root.style.setProperty('--app-primary-500', appColors[500])
    root.style.setProperty('--app-primary-600', appColors[600])
    root.style.setProperty('--app-primary-700', appColors[700])
    root.style.setProperty('--app-primary-800', appColors[800])
    root.style.setProperty('--app-primary-900', appColors[900])
    root.style.setProperty('--app-primary-950', appColors[950])
}

// Theme selector component
interface ThemeSelectorProps {
    className?: string
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
    const { theme, setTheme, toggleTheme } = useTheme()

    return (
        <div className={`theme-selector ${className}`}>
            <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                title={`Current theme: ${theme}. Click to toggle.`}
            >
                {theme === 'light' && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
                {theme === 'dark' && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
                {theme === 'system' && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        </div>
    )
}

export { ThemeProvider as default }
