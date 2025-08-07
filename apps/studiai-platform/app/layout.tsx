import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'StudiAI - Advanced Educational AI Platform',
    template: '%s | StudiAI'
  },
  description: 'StudiAI is the most advanced educational AI platform offering personalized learning, academic tutoring, course creation, and study assistance powered by cutting-edge artificial intelligence.',
  keywords: [
    'StudiAI', 'education AI', 'learning platform', 'academic tutoring', 'personalized learning',
    'study assistance', 'course creation', 'educational technology', 'AI tutoring', 'academic excellence',
    'online learning', 'study AI', 'educational AI', 'learning management', 'academic support'
  ],
  authors: [{ name: 'CODAI Team', url: 'https://codai.ro' }],
  creator: 'CODAI',
  publisher: 'StudiAI Platform',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studiai.ro',
    siteName: 'StudiAI',
    title: 'StudiAI - Advanced Educational AI Platform',
    description: 'Transform your learning experience with StudiAI\'s powerful AI-driven educational tools, personalized tutoring, and comprehensive study assistance.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StudiAI - Educational AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudiAI - Advanced Educational AI Platform',
    description: 'Transform your learning experience with StudiAI\'s powerful AI-driven educational tools and personalized tutoring.',
    images: ['/twitter-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://studiai.ro'),
  alternates: {
    canonical: 'https://studiai.ro',
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'StudiAI',
              url: 'https://studiai.ro',
              logo: 'https://studiai.ro/logo.png',
              description: 'Advanced Educational AI Platform for personalized learning and academic excellence',
              foundingDate: '2024',
              founder: {
                '@type': 'Organization',
                name: 'CODAI'
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'support@studiai.ro'
              },
              sameAs: [
                'https://twitter.com/StudiAI',
                'https://linkedin.com/company/studiai'
              ]
            })
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <div className="relative min-h-screen">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

