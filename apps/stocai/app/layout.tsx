import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'STOCAI - AI-Powered Inventory Management',
  description: 'Transform your inventory management with intelligent stock tracking, demand forecasting, and automated supply chain optimization.',
  keywords: ['AI', 'inventory', 'stock management', 'supply chain', 'warehouse', 'forecasting'],
  authors: [{ name: 'CODAI Team' }],
  metadataBase: new URL('https://stocai.ro'),
  openGraph: {
    title: 'STOCAI - AI-Powered Inventory Management',
    description: 'Transform your inventory with intelligent management solutions',
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
