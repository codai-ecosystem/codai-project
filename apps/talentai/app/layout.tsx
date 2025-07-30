import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, I18nProvider } from '@codai/shared-ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TALENTAI - AI-Driven Talent Acquisition & HR Management',
  description: 'Transform your human resources with intelligent talent discovery, performance analytics, and automated HR processes for optimal workforce management.',
  keywords: ['AI', 'talent acquisition', 'HR', 'recruitment', 'performance', 'workforce management'],
  authors: [{ name: 'CODAI Team' }],
  metadataBase: new URL('https://talentai.ro'),
  openGraph: {
    title: 'TALENTAI - AI-Driven Talent Acquisition',
    description: 'Transform your HR with intelligent talent solutions',
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
