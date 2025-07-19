import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ACASAI - AI-Powered Smart Home Platform',
  description: 'Advanced AI platform for smart home automation and intelligent living solutions',
  keywords: ['AI', 'smart home', 'automation', 'IoT', 'intelligent living', 'acasai'],
  authors: [{ name: 'CODAI Team' }],
  openGraph: {
    title: 'ACASAI - Smart Home Intelligence',
    description: 'Transform your home with AI-powered automation and intelligence',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e293b',
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
