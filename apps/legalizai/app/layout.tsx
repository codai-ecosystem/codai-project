import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LEGALIZAI - AI-Powered Legal Compliance Platform',
  description: 'Transform your legal operations with intelligent compliance monitoring, document analysis, and automated risk assessment for comprehensive legal management.',
  keywords: ['AI', 'legal', 'compliance', 'contracts', 'risk assessment', 'legal tech'],
  authors: [{ name: 'CODAI Team' }],
  metadataBase: new URL('https://legalizai.ro'),
  openGraph: {
    title: 'LEGALIZAI - AI-Powered Legal Compliance',
    description: 'Transform your legal operations with intelligent compliance',
    type: 'website',
    locale: 'en_US',
  },
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
        <I18nProvider defaultLanguage="en">
          <AuthProvider
            apiBaseUrl="/api"
            redirectTo="/dashboard"
            loginPath="/login"
          >
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
              {children}
            </div>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
