'use client'

import React, { useState, useEffect, useCallback } from "react"
import { cn } from "../../lib/utils"
import { Header, type HeaderProps } from "./Header"
import { Footer, type FooterProps } from "./Footer"

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: Partial<HeaderProps> | false
  footer?: Partial<FooterProps> | false
  sidebar?: React.ReactNode | false
  variant?: 'default' | 'full-width' | 'centered'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({
    className,
    children,
    header = {},
    footer = {},
    sidebar = false,
    variant = 'default',
    maxWidth = 'full',
    ...props
  }, ref) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [language, setLanguage] = useState<'en' | 'ro'>('en')

    // Theme and language handlers
    const handleThemeToggle = useCallback(() => {
      const newTheme = theme === 'light' ? 'dark' : 'light'
      setTheme(newTheme)

      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      }
    }, [theme])

    const handleLanguageToggle = useCallback(() => {
      setLanguage(prev => prev === 'en' ? 'ro' : 'en')
    }, [])

    const handleMenuToggle = useCallback(() => {
      setSidebarOpen(prev => !prev)
    }, [])

    // Apply initial theme
    useEffect(() => {
      if (typeof document !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = prefersDark ? 'dark' : 'light'
        setTheme(initialTheme)
        document.documentElement.classList.toggle('dark', initialTheme === 'dark')
      }
    }, [])

    const containerClasses = {
      'default': 'container mx-auto px-4',
      'full-width': 'w-full px-4',
      'centered': 'container mx-auto px-4 max-w-4xl'
    }

    const maxWidthClasses = {
      'sm': 'max-w-screen-sm',
      'md': 'max-w-screen-md',
      'lg': 'max-w-screen-lg',
      'xl': 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      'full': 'max-w-none'
    }

    return (
      <div
        ref={ref}
        className={cn("min-h-screen flex flex-col", className)}
        {...props}
      >
        {/* Header */}
        {header !== false && (
          <Header
            theme={theme}
            language={language}
            onThemeToggle={handleThemeToggle}
            onLanguageToggle={handleLanguageToggle}
            onMenuToggle={sidebar ? handleMenuToggle : undefined}
            {...(typeof header === 'object' ? header : {})}
          />
        )}

        {/* Main content area */}
        <div className="flex flex-1">
          {/* Sidebar */}
          {sidebar && (
            <>
              {/* Mobile sidebar overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Sidebar */}
              <aside
                className={cn(
                  "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto",
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
              >
                <div className="flex flex-col h-full">
                  {/* Sidebar header */}
                  <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
                    <span className="font-semibold">Menu</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-md hover:bg-accent"
                    >
                      ×
                    </button>
                  </div>

                  {/* Sidebar content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {sidebar}
                  </div>
                </div>
              </aside>
            </>
          )}

          {/* Main content */}
          <main
            className={cn(
              "flex-1 flex flex-col",
              variant !== 'full-width' && containerClasses[variant],
              maxWidth !== 'full' && maxWidthClasses[maxWidth]
            )}
          >
            {children}
          </main>
        </div>

        {/* Footer */}
        {footer !== false && (
          <Footer
            {...(typeof footer === 'object' ? footer : {})}
          />
        )}
      </div>
    )
  }
)

Layout.displayName = "Layout"

export { Layout }
