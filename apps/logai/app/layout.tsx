import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LogAI - AI Logging & Analytics Platform',
  description: 'Advanced AI-powered logging and analytics platform for system monitoring and insights',
  keywords: ['AI', 'logging', 'analytics', 'monitoring', 'insights', 'platform'],
  authors: [{ name: 'CodAI Platform' }],
  openGraph: {
    title: 'LogAI - AI Logging & Analytics Platform',
    description: 'Advanced AI-powered logging and analytics platform for system monitoring and insights',
    type: 'website',
    locale: 'en_US',
    siteName: 'LogAI Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogAI - AI Logging & Analytics Platform',
    description: 'Advanced AI-powered logging and analytics platform for system monitoring and insights',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="/favicon.ico"
        />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
          {children}
        </div>
      </body>
    </html>
  )
}