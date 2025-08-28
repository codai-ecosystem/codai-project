'use client'

import React, { ReactNode, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useMotion } from '@/contexts/MotionContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { LayoutProps } from '../types'

/**
 * Main Layout Component
 * Provides the foundational structure and context for the entire scrollytelling experience
 */
export const Layout: React.FC<LayoutProps & { children: ReactNode }> = ({
  children,
  className,
  theme: initialTheme,
  language: initialLanguage,
  reduceMotion: initialReduceMotion,
  showDebug = false,
  testId = 'main-layout',
  ...props
}) => {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { prefersReducedMotion } = useMotion()

  // Initialize context values from props
  useEffect(() => {
    if (initialTheme && initialTheme !== 'auto') {
      setTheme(initialTheme)
    }
  }, [initialTheme, setTheme])

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage)
    }
  }, [initialLanguage, setLanguage])

  useEffect(() => {
    // Motion preferences are auto-detected, no need to manually set
    if (initialReduceMotion !== undefined) {
      console.log('Motion preference:', initialReduceMotion)
    }
  }, [initialReduceMotion])

  // Detect system preferences
  useEffect(() => {
    // Detect system color scheme
    if (initialTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light')
      }
      
      setTheme(mediaQuery.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [initialTheme, setTheme])

  useEffect(() => {
    // Motion preferences handled by MotionContext
    console.log('System motion preference detected')
  }, [initialReduceMotion])

  return (
    <div
      data-testid={testId}
      className={cn(
        // Base layout styles
        'min-h-screen w-full overflow-x-hidden',
        
        // Theme classes
        theme === 'dark' ? 'dark' : '',
        
        // Motion classes
        prefersReducedMotion ? 'reduce-motion' : '',
        
        // Debug styles
        showDebug && 'debug-mode',
        
        // Language-specific styles
        language === 'ro' && 'lang-ro',
        
        // Custom className
        className
      )}
      data-theme={theme}
      data-language={language}
      data-reduce-motion={prefersReducedMotion}
      {...props}
    >
      {/* CSS Variables for runtime theme switching */}
      <style jsx>{`
        :root {
          --theme: ${theme};
          --language: ${language};
          --reduce-motion: ${prefersReducedMotion ? '1' : '0'};
        }
      `}</style>
      
      {/* Debug overlay */}
      {showDebug && (
        <div className="fixed top-4 right-4 z-[9999] bg-black/80 text-white p-3 rounded-lg text-sm font-mono">
          <div>Theme: {theme}</div>
          <div>Language: {language}</div>
          <div>Reduced Motion: {prefersReducedMotion ? 'ON' : 'OFF'}</div>
          <div>Viewport: {typeof window !== 'undefined' && `${window.innerWidth}x${window.innerHeight}`}</div>
        </div>
      )}
      
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[10000] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-transform focus:scale-105"
      >
        {language === 'ro' ? 'Sari la conținut' : 'Skip to content'}
      </a>
      
      {/* Main content */}
      <main
        id="main-content"
        className="relative w-full"
        role="main"
        aria-label={language === 'ro' ? 'Conținut principal' : 'Main content'}
      >
        {children}
      </main>
    </div>
  )
}

Layout.displayName = 'Layout'