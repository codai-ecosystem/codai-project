import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '../../lib/utils'

export interface AppShellProps {
  children: React.ReactNode
  className?: string
  appName: string
  showHeader?: boolean
  showFooter?: boolean
  variant?: 'landing' | 'dashboard' | 'auth' | 'minimal' | 'home'
  user?: {
    name: string
    email: string
    avatar?: string
  } | null
  isAuthenticated?: boolean
  onLogout?: () => void
  navigation?: Array<{
    label: string
    href: string
    active?: boolean
    icon?: React.ReactNode
  }>
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(({
  children,
  className,
  appName,
  showHeader = true,
  showFooter = true,
  variant = 'landing',
  user = null,
  isAuthenticated = false,
  onLogout,
  navigation = [],
  ...props
}, ref) => {
  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen flex flex-col"

    switch (variant) {
      case 'landing':
        return cn(baseClasses, "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900")
      case 'dashboard':
        return cn(baseClasses, "bg-background")
      case 'auth':
        return cn(baseClasses, "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900")
      case 'minimal':
        return cn(baseClasses, "bg-background")
      case 'home':
        return cn(baseClasses, "bg-background")
      default:
        return baseClasses
    }
  }

  const getHeaderVariant = () => {
    switch (variant) {
      case 'landing':
        return 'glass'
      case 'dashboard':
        return 'elevated'
      case 'auth':
        return 'minimal'
      case 'minimal':
        return 'minimal'
      case 'home':
        return 'elevated'
      default:
        return 'default'
    }
  }

  return (
    <div
      ref={ref}
      className={cn(getLayoutClasses(), className)}
      {...props}
    >
      {showHeader && (
        <Header
          title={appName}
          variant={getHeaderVariant()}
          navigation={navigation}
          actions={
            isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user.name}
                </span>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              variant === 'landing' && (
                <div className="flex items-center gap-2">
                  <a
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href="/auth/register"
                    className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Sign Up
                  </a>
                </div>
              )
            )
          }
        />
      )}

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {showFooter && variant !== 'auth' && (
        <Footer />
      )}
    </div>
  )
})

AppShell.displayName = "AppShell"

export { AppShell }
