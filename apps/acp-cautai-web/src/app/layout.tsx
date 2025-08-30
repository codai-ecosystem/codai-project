import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { AuthProvider } from '@/lib/auth-context'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ACP CAUTAI - Master Admin Dashboard',
    template: '%s | ACP CAUTAI'
  },
  description: 'Advanced Control Panel for CAUTAI system administration, user management, and system monitoring.',
  keywords: [
    'admin dashboard', 'system administration', 'CAUTAI admin', 'master admin', 
    'user management', 'system monitoring', 'ACP', 'control panel'
  ],
  authors: [{ name: 'CAUTAI Team' }],
  creator: 'CAUTAI',
  publisher: 'CAUTAI',
  robots: {
    index: false, // Admin panel should not be indexed
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acp.cautai.ro',
    siteName: 'ACP CAUTAI',
    title: 'ACP CAUTAI - Master Admin Dashboard',
    description: 'Advanced Control Panel for CAUTAI system administration, user management, and system monitoring.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Prevent zoom on admin interface
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
  icons: {
    icon: '/admin-favicon.ico',
    shortcut: '/admin-favicon-16x16.png',
    apple: '/admin-apple-touch-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ACP CAUTAI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        {/* Security headers for admin panel */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <div className="relative flex min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}