import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LOGAI - AI-Powered Log Analysis Platform',
  description: 'Transform your log management with intelligent real-time analysis and comprehensive monitoring',
  keywords: ['AI', 'log analysis', 'monitoring', 'anomaly detection', 'performance analytics', 'logai'],
  authors: [{ name: 'CODAI Team' }],
  openGraph: {
    title: 'LOGAI - Intelligent Log Analysis',
    description: 'Real-time log monitoring and analysis with AI-powered insights',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <I18nProvider>
          <AuthProvider
            apiBaseUrl="/api"
            redirectTo="/home"
            loginPath="/login"
          >
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
