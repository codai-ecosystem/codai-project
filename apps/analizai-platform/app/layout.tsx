import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AnalizAI - Advanced Business Analytics AI Platform',
  description: 'Transform your business with AI-powered analytics, data insights, and intelligent reporting. AnalizAI provides comprehensive business intelligence solutions for data-driven decision making.',
  keywords: ['business analytics', 'ai analytics', 'data insights', 'business intelligence', 'reporting', 'dashboard', 'data science', 'analizai'],
  authors: [{ name: 'CODAI Team' }],
  creator: 'CODAI',
  publisher: 'AnalizAI Platform',
  robots: 'index, follow',
  openGraph: {
    title: 'AnalizAI - Advanced Business Analytics AI Platform',
    description: 'Transform your business with AI-powered analytics, data insights, and intelligent reporting.',
    url: 'https://analizai.ro',
    siteName: 'AnalizAI',
    images: [
      {
        url: '/analizai-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalizAI - Business Analytics AI Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnalizAI - Advanced Business Analytics AI Platform',
    description: 'Transform your business with AI-powered analytics, data insights, and intelligent reporting.',
    creator: '@analizai',
    images: ['/analizai-twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://analizai.ro',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gradient-to-br from-gray-50 via-cyan-50 to-purple-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
