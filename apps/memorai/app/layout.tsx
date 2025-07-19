import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MEMORAI - AI-Powered Memory Enhancement Platform',
  description: 'Transform your cognitive abilities with AI-driven memory enhancement and intelligent knowledge storage',
  keywords: ['AI', 'memory enhancement', 'cognitive improvement', 'learning optimization', 'memorai'],
  authors: [{ name: 'CODAI Team' }],
  openGraph: {
    title: 'MEMORAI - Memory Enhancement Intelligence',
    description: 'Boost your cognitive memory capabilities with advanced AI technology',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
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
