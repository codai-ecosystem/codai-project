import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CumparAI - AI Shopping & Comparison Platform',
  description: 'AI-powered shopping and price comparison platform for smart consumers. Find the best deals, compare prices, and make informed purchasing decisions.',
  keywords: ['AI', 'shopping', 'price comparison', 'deals', 'smart shopping', 'e-commerce'],
  authors: [{ name: 'CodAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' }
  ],
  openGraph: {
    title: 'CumparAI - AI Shopping & Comparison Platform',
    description: 'AI-powered shopping and price comparison platform for smart consumers',
    url: 'https://cumparai.codai.app',
    siteName: 'CumparAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CumparAI - AI Shopping & Comparison Platform'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CumparAI - AI Shopping & Comparison Platform',
    description: 'AI-powered shopping and price comparison platform for smart consumers',
    creator: '@codai',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 antialiased`}
        suppressHydrationWarning={true}
      >
        <div className="min-h-screen relative">
          {/* Global Background Pattern */}
          <div
            className="fixed inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Global Loading Indicator */}
          <div id="global-loading" className="hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl flex items-center gap-4">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-900 dark:text-white font-medium">Loading...</span>
            </div>
          </div>

          {/* Toast Container */}
          <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
        </div>
      </body>
    </html>
  )
}
