#!/usr/bin/env node

/**
 * CODAI App Template Generator
 * 
 * This script applies our shared components and authentication
 * infrastructure to any app in the CODAI ecosystem.
 * 
 * Usage: node generate-app-template.js <app-name>
 * Example: node generate-app-template.js bancai
 */

const fs = require('fs')
const path = require('path')

const appName = process.argv[2]
if (!appName) {
  console.error('Please provide an app name')
  console.error('Usage: node generate-app-template.js <app-name>')
  process.exit(1)
}

const appPath = path.join(__dirname, '..', 'apps', appName)
if (!fs.existsSync(appPath)) {
  console.error(`App directory not found: ${appPath}`)
  process.exit(1)
}

console.log(`🚀 Generating template for ${appName.toUpperCase()}...`)

// Create layout.tsx with AuthProvider
const layoutContent = `import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${appName.toUpperCase()} - AI-Powered Platform',
  description: 'Next-generation AI platform for ${appName} services',
  keywords: ['AI', '${appName}', 'platform', 'automation', 'intelligence'],
  authors: [{ name: 'CODAI Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider
          apiBaseUrl="/api"
          redirectTo="/dashboard"
          loginPath="/login"
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
`

// Create landing page using LandingPage component
const landingPageContent = `'use client'

import { LandingPage } from '@codai/shared-ui'
import { ${getAppIcons(appName)} } from 'lucide-react'

export default function HomePage() {
  const features = ${getAppFeatures(appName)}

  return (
    <LandingPage
      appName="${appName.toUpperCase()}"
      appTagline="${getAppTagline(appName)}"
      appDescription="${getAppDescription(appName)}"
      features={features}
      onGetStarted={() => window.location.href = '/signup'}
      onSignIn={() => window.location.href = '/login'}
      onSignUp={() => window.location.href = '/signup'}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      showHero={true}
      showFeatures={true}
      showCTA={true}
      brandColor="${getAppColor(appName)}"
    />
  )
}
`

// Create dashboard page using DashboardPage component
const dashboardPageContent = `'use client'

import { DashboardPage } from '@codai/shared-ui'
import { ${getAppIcons(appName)} } from 'lucide-react'

export default function Dashboard() {
  const stats = ${getAppStats(appName)}
  const quickActions = ${getAppQuickActions(appName)}
  const recentActivity = ${getAppActivity(appName)}
  const navigation = ${getAppNavigation(appName)}

  const mockUser = {
    name: "User Name",
    email: "user@${appName}.dev",
    avatar: "/placeholder-avatar.jpg"
  }

  return (
    <DashboardPage
      appName="${appName.toUpperCase()}"
      user={mockUser}
      stats={stats}
      quickActions={quickActions}
      recentActivity={recentActivity}
      navigation={navigation}
      onLogout={() => {
        console.log("Logout")
        window.location.href = '/login'
      }}
    />
  )
}
`

// Create middleware
const middlewareContent = `import { createAuthMiddleware } from '@codai/shared-ui'

export default createAuthMiddleware({
  loginUrl: '/login',
  dashboardUrl: '/dashboard',
  publicRoutes: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ],
  protectedRoutes: [
    '/dashboard',
    '/settings',
    '/profile',
    ${getAppProtectedRoutes(appName)}
  ]
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
`

// Write files
const layoutPath = path.join(appPath, 'app', 'layout.tsx')
const landingPath = path.join(appPath, 'app', 'page.tsx')
const dashboardPath = path.join(appPath, 'app', 'dashboard', 'page.tsx')
const middlewarePath = path.join(appPath, 'middleware.ts')

try {
  // Backup existing files
  if (fs.existsSync(layoutPath)) {
    fs.writeFileSync(layoutPath + '.backup', fs.readFileSync(layoutPath))
  }
  if (fs.existsSync(landingPath)) {
    fs.writeFileSync(landingPath + '.backup', fs.readFileSync(landingPath))
  }

  // Write new files
  fs.writeFileSync(layoutPath, layoutContent)
  fs.writeFileSync(landingPath, landingPageContent)

  // Create dashboard directory if it doesn't exist
  const dashboardDir = path.dirname(dashboardPath)
  if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true })
  }
  fs.writeFileSync(dashboardPath, dashboardPageContent)

  fs.writeFileSync(middlewarePath, middlewareContent)

  console.log('✅ Template files generated successfully!')
  console.log(`📁 Files created/updated:`)
  console.log(`   - ${layoutPath}`)
  console.log(`   - ${landingPath}`)
  console.log(`   - ${dashboardPath}`)
  console.log(`   - ${middlewarePath}`)

  console.log(`\\n🎯 Next steps:`)
  console.log(`   1. cd apps/${appName}`)
  console.log(`   2. pnpm install`)
  console.log(`   3. pnpm dev`)
  console.log(`   4. Visit http://localhost:3000`)

} catch (error) {
  console.error('❌ Error generating template:', error.message)
  process.exit(1)
}

// Helper functions for app-specific content
function getAppTagline(appName) {
  const taglines = {
    bancai: 'Smart banking with AI',
    memorai: 'AI-powered memory enhancement',
    stocai: 'Intelligent stock management',
    talentai: 'AI-driven talent acquisition',
    cumparai: 'Smart shopping assistant',
    muzicai: 'AI music generation',
    legalizai: 'Legal AI assistant',
    // Add more as needed
  }
  return taglines[appName] || `AI-powered ${appName} platform`
}

function getAppDescription(appName) {
  const descriptions = {
    bancai: 'Revolutionary banking platform powered by AI for smarter financial management',
    memorai: 'Advanced memory enhancement system using AI to improve cognitive performance',
    stocai: 'Intelligent inventory and stock management system with AI-driven insights',
    talentai: 'AI-powered talent acquisition and human resources management platform',
    cumparai: 'Smart shopping platform with AI recommendations and price optimization',
    muzicai: 'AI-powered music creation and composition platform for artists',
    legalizai: 'Comprehensive legal AI assistant for document analysis and compliance',
  }
  return descriptions[appName] || `Advanced AI platform for ${appName} services and automation`
}

function getAppColor(appName) {
  const colors = {
    bancai: 'green',
    memorai: 'purple',
    stocai: 'blue',
    talentai: 'orange',
    cumparai: 'pink',
    muzicai: 'indigo',
    legalizai: 'slate',
  }
  return colors[appName] || 'blue'
}

function getAppIcons(appName) {
  const icons = {
    bancai: 'Wallet, CreditCard, TrendingUp, Shield, Users, Zap',
    memorai: 'Brain, Database, Search, BookOpen, Users, Lightbulb',
    stocai: 'Package, BarChart3, TrendingUp, Warehouse, Users, Settings',
    talentai: 'Users, Search, TrendingUp, Award, Briefcase, Target',
    cumparai: 'ShoppingCart, Search, TrendingUp, Star, Users, Zap',
    muzicai: 'Music, Play, Headphones, Mic, Users, Sparkles',
    legalizai: 'Scale, FileText, Search, Shield, Users, Gavel',
  }
  return icons[appName] || 'Zap, Users, Settings, BarChart3, Plus, Shield'
}

function getAppFeatures(appName) {
  // This would return app-specific features array
  const icons = getAppIcons(appName).split(', ')
  const firstIcon = icons[0] || 'Zap'
  const secondIcon = icons[1] || 'Users'
  const thirdIcon = icons[2] || 'Shield'

  return `[
    {
      icon: <${firstIcon} className="w-8 h-8" />,
      title: 'AI-Powered',
      description: 'Advanced AI capabilities for ${appName} automation',
      status: 'active'
    },
    {
      icon: <${secondIcon} className="w-8 h-8" />,
      title: 'Team Collaboration',
      description: 'Built for teams and enterprise workflows',
      status: 'active'
    },
    {
      icon: <${thirdIcon} className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your data',
      status: 'active'
    }
  ]`
}

function getAppStats(appName) {
  const icons = getAppIcons(appName).split(', ')
  const firstIcon = icons[0] || 'Users'
  const secondIcon = icons[1] || 'TrendingUp'

  return `[
    {
      title: "Total Users",
      value: "1,234",
      change: { value: 12, trend: 'up' as const },
      icon: <${firstIcon} className="h-4 w-4" />
    },
    {
      title: "Active Sessions",
      value: "567",
      change: { value: 5, trend: 'up' as const },
      icon: <${secondIcon} className="h-4 w-4" />
    }
  ]`
}

function getAppQuickActions(appName) {
  const icons = getAppIcons(appName).split(', ')
  const actionIcon = icons[3] || 'Plus'

  return `[
    {
      title: "Quick Start",
      description: "Get started with ${appName}",
      action: () => console.log("Quick start"),
      icon: <${actionIcon} className="h-4 w-4" />,
      variant: 'primary' as const
    }
  ]`
}

function getAppActivity(appName) {
  return `[
    {
      title: "System Update",
      description: "${appName} system updated successfully",
      time: "2 minutes ago",
      type: 'success' as const
    }
  ]`
}

function getAppNavigation(appName) {
  const icons = getAppIcons(appName).split(', ')
  const dashIcon = icons[1] || 'BarChart3'
  const settingsIcon = icons[5] || 'Settings'

  return `[
    {
      label: "Dashboard",
      href: "/dashboard",
      active: true,
      icon: <${dashIcon} className="h-4 w-4" />
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <${settingsIcon} className="h-4 w-4" />
    }
  ]`
}

function getAppProtectedRoutes(appName) {
  const routes = {
    bancai: "'/accounts', '/transactions', '/cards'",
    memorai: "'/memories', '/analytics', '/training'",
    stocai: "'/inventory', '/reports', '/suppliers'",
    talentai: "'/candidates', '/jobs', '/interviews'",
    cumparai: "'/products', '/orders', '/recommendations'",
    muzicai: "'/compositions', '/library', '/studio'",
    legalizai: "'/documents', '/cases', '/compliance'",
  }
  return routes[appName] || "'/features', '/analytics'"
}
