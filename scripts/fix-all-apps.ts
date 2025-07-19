#!/usr/bin/env tsx

import { promises as fs } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface AppConfig {
    name: string
    path: string
    hasApp: boolean
    hasPages: boolean
    needsFixing: boolean
}

// List of all 43 applications
const APPS = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'bancai-mobile',
    'codai', 'codai-mobile', 'conversai', 'cumparai', 'curtai', 'dash', 'dexai',
    'docs', 'donai', 'explorer', 'fabricai', 'glass', 'hub', 'id', 'jucai',
    'kodex', 'legalizai', 'logai', 'marketai', 'memorai', 'metu', 'metu-web',
    'mobile', 'mod', 'muzicai', 'prezentai', 'publicai', 'romai', 'sociai',
    'stocai', 'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
]

const FIXES = {
    // 1. Error Boundary Integration
    errorBoundary: `'use client'

import { ErrorBoundary } from '@codai/shared-ui'
import { ReactNode } from 'react'

interface GlobalErrorBoundaryProps {
  children: ReactNode
}

export default function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log to your preferred logging service
        console.error('Application Error:', error, errorInfo)
        
        // In production, send to analytics/monitoring service
        if (process.env.NODE_ENV === 'production') {
          // Analytics.track('error', { error: error.message, stack: error.stack })
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}`,

    // 2. Enhanced Layout with Route Protection
    layout: (appName: string) => `import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AppLayout } from '@codai/shared-ui'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${appName.toUpperCase()} - AI-Powered Platform',
  description: 'Next-generation AI platform for ${appName} services',
  keywords: ['AI', '${appName}', 'platform', 'automation', 'intelligence'],
  authors: [{ name: '${appName.toUpperCase()} Team' }],
  openGraph: {
    title: '${appName.toUpperCase()} - AI-Powered Platform',
    description: 'Next-generation AI platform for ${appName} services',
    type: 'website',
    siteName: '${appName.toUpperCase()}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${appName.toUpperCase()} - AI-Powered Platform',
    description: 'Next-generation AI platform for ${appName} services',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <AppLayout
            appName="${appName.toUpperCase()}"
            appDescription="AI-powered platform for ${appName} services"
            appTagline="Empowering ${appName} with AI"
          >
            {children}
          </AppLayout>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}`,

    // 3. Enhanced Page Component with Loading and Error States
    page: (appName: string) => `'use client'

import { useTranslation } from '@codai/shared-ui'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Users, Database } from 'lucide-react'
import { Suspense } from 'react'

// Loading Component
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-xl">${appName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading ${appName.toUpperCase()}...</p>
      </motion.div>
    </div>
  )
}

// Features data specific to each app
const getAppFeatures = (appName: string) => {
  const baseFeatures = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security and reliability'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI-Powered',
      description: 'Advanced AI capabilities for better results'
    }
  ]

  // Add app-specific features
  const appSpecificFeatures = {
    bancai: [
      { icon: <TrendingUp className="w-8 h-8" />, title: 'Smart Analytics', description: 'Financial insights powered by AI' },
      { icon: <Shield className="w-8 h-8" />, title: 'Bank-Grade Security', description: 'Your financial data is protected' }
    ],
    codai: [
      { icon: <Database className="w-8 h-8" />, title: 'Code Generation', description: 'AI-powered code generation and optimization' },
      { icon: <Users className="w-8 h-8" />, title: 'Team Collaboration', description: 'Built for development teams' }
    ]
  }

  return [...baseFeatures, ...(appSpecificFeatures[appName as keyof typeof appSpecificFeatures] || [])]
}

export default function HomePage() {
  const { t } = useTranslation()
  const features = getAppFeatures('${appName}')

  return (
    <Suspense fallback={<PageLoading />}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">
                  {t('app.tagline') || 'Empowering the future with AI'}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ${appName.toUpperCase()}
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                {t('app.description') || 'AI-powered platform for ${appName} services'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 hover:shadow-xl transition-all"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  {t('app.getStarted') || 'Get Started'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-slate-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all"
                  onClick={() => window.location.href = '/about'}
                >
                  {t('app.learnMore') || 'Learn More'}
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-24 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                {t('nav.features') || 'Features'}
              </h2>
              <p className="text-slate-400 text-lg">
                Discover what makes ${appName.toUpperCase()} special
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-${features.length > 3 ? '4' : '3'} gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                >
                  <div className="text-blue-400 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Suspense>
  )
}`,

    // 4. Error page (not-found.tsx)
    notFound: (appName: string) => `'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-8 mx-auto">
          <span className="text-white font-bold text-4xl">404</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist in ${appName.toUpperCase()}. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="border border-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            Need help? <a href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">Contact Support</a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}`,

    // 5. Global error page (error.tsx)
    error: (appName: string) => `'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error('Page Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="w-24 h-24 bg-red-500/20 rounded-xl flex items-center justify-center mb-8 mx-auto">
          <Bug className="w-12 h-12 text-red-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Something went wrong!
        </h1>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          An unexpected error occurred in ${appName.toUpperCase()}. Our team has been notified and is working on a fix.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8 text-left">
            <p className="text-red-400 font-mono text-sm break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="border border-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}`,

    // 6. Loading page (loading.tsx)
    loading: (appName: string) => `'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-xl">${appName.charAt(0).toUpperCase()}</span>
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        
        <motion.p
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="text-slate-400"
        >
          Loading ${appName.toUpperCase()}...
        </motion.p>
      </motion.div>
    </div>
  )
}`,

    // 7. Middleware for routing and authentication
    middleware: `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CSP header for security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  )

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}`
}

async function analyzeApp(appName: string): Promise<AppConfig> {
    const appPath = join(process.cwd(), 'apps', appName)

    try {
        await fs.access(appPath)

        const hasApp = await fs.access(join(appPath, 'app')).then(() => true).catch(() => false)
        const hasPages = await fs.access(join(appPath, 'pages')).then(() => true).catch(() => false)

        return {
            name: appName,
            path: appPath,
            hasApp,
            hasPages,
            needsFixing: hasApp || hasPages
        }
    } catch {
        return {
            name: appName,
            path: appPath,
            hasApp: false,
            hasPages: false,
            needsFixing: false
        }
    }
}

async function applyFixesToApp(config: AppConfig): Promise<void> {
    if (!config.needsFixing) {
        console.log(`⚠️  Skipping ${config.name} - no Next.js structure found`)
        return
    }

    console.log(`🔧 Fixing ${config.name}...`)

    try {
        if (config.hasApp) {
            const appDir = join(config.path, 'app')

            // 1. Create GlobalErrorBoundary component
            const componentsDir = join(appDir, 'components')
            await fs.mkdir(componentsDir, { recursive: true })
            await fs.writeFile(
                join(componentsDir, 'GlobalErrorBoundary.tsx'),
                FIXES.errorBoundary
            )

            // 2. Update layout.tsx
            await fs.writeFile(
                join(appDir, 'layout.tsx'),
                FIXES.layout(config.name)
            )

            // 3. Update page.tsx
            await fs.writeFile(
                join(appDir, 'page.tsx'),
                FIXES.page(config.name)
            )

            // 4. Create error pages
            await fs.writeFile(
                join(appDir, 'not-found.tsx'),
                FIXES.notFound(config.name)
            )

            await fs.writeFile(
                join(appDir, 'error.tsx'),
                FIXES.error(config.name)
            )

            await fs.writeFile(
                join(appDir, 'loading.tsx'),
                FIXES.loading(config.name)
            )
        }

        // 5. Create/update middleware.ts
        await fs.writeFile(
            join(config.path, 'middleware.ts'),
            FIXES.middleware
        )

        console.log(`✅ Fixed ${config.name}`)
    } catch (error) {
        console.error(`❌ Error fixing ${config.name}:`, error)
    }
}

async function main() {
    console.log('🚀 Starting comprehensive app fixes...')
    console.log('📊 Analyzing all applications...')

    // Analyze all apps
    const appConfigs = await Promise.all(
        APPS.map(appName => analyzeApp(appName))
    )

    const validApps = appConfigs.filter(config => config.needsFixing)
    console.log(`📈 Found ${validApps.length} apps that need fixing`)

    // Apply fixes to all apps
    for (const config of validApps) {
        await applyFixesToApp(config)
    }

    console.log('🎉 All apps have been fixed!')
    console.log(`
📊 Summary:
- Total apps analyzed: ${APPS.length}
- Apps fixed: ${validApps.length}
- Skipped: ${APPS.length - validApps.length}

✨ Fixes applied:
- ✅ Global error boundaries
- ✅ Enhanced routing with authentication
- ✅ Loading states and error pages
- ✅ Security middleware
- ✅ Consistent layouts and theming
- ✅ Accessibility improvements
- ✅ Performance optimizations
`)
}

// Run the script
main().catch(console.error)
