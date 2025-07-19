import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BANCAI - AI-Powered Smart Banking Platform',
  description: 'Transform your financial future with intelligent banking, investment insights, and seamless digital payment solutions.',
  keywords: ['AI', 'banking', 'fintech', 'investment', 'digital payments', 'financial intelligence'],
  authors: [{ name: 'CODAI Team' }],
  metadataBase: new URL('https://bancai.ro'),
  openGraph: {
    title: 'BANCAI - AI-Powered Smart Banking',
    description: 'Transform your financial future with intelligent banking solutions',
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
