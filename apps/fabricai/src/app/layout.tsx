import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import FabricaiLayout from '@/components/layout/FabricaiLayout'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'FabricAI - Smart Manufacturing Platform | CODAI Ecosystem',
  description: 'Advanced AI-powered manufacturing platform with real-time production monitoring, quality control, predictive maintenance, and supply chain optimization. Part of the CODAI ecosystem.',
  keywords: [
    'manufacturing',
    'AI',
    'production monitoring',
    'quality control',
    'predictive maintenance',
    'supply chain',
    'industrial automation',
    'smart factory',
    'manufacturing analytics',
    'production optimization',
    'CODAI'
  ],
  authors: [{ name: 'CODAI Team' }],
  creator: 'CODAI',
  publisher: 'CODAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fabricai.codai.ro'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FabricAI - Smart Manufacturing Platform',
    description: 'Advanced AI-powered manufacturing platform with real-time production monitoring, quality control, and predictive maintenance.',
    url: 'https://fabricai.codai.ro',
    siteName: 'FabricAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FabricAI - Smart Manufacturing Platform',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FabricAI - Smart Manufacturing Platform',
    description: 'Advanced AI-powered manufacturing platform with real-time production monitoring and quality control.',
    images: ['/twitter-image.png'],
    creator: '@codai_ai',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': '#ea580c',
    'color-scheme': 'light',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'FabricAI',
    'application-name': 'FabricAI',
    'msapplication-TileColor': '#ea580c',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Manufacturing Industry Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'FabricAI',
              description: 'Advanced AI-powered manufacturing platform with real-time production monitoring, quality control, and predictive maintenance.',
              url: 'https://fabricai.codai.ro',
              author: {
                '@type': 'Organization',
                name: 'CODAI',
                url: 'https://codai.ro'
              },
              applicationCategory: 'Manufacturing Software',
              operatingSystem: 'Web-based',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'RON'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '127'
              }
            })
          }}
        />

        {/* Manufacturing Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'FabricAI',
              description: 'Smart Manufacturing Platform',
              url: 'https://fabricai.codai.ro',
              logo: 'https://fabricai.codai.ro/logo.png',
              sameAs: [
                'https://codai.ro',
                'https://github.com/codai-ai'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+40-XXX-XXX-XXX',
                contactType: 'Manufacturing Support',
                availableLanguage: ['Romanian', 'English']
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50`}>
        <FabricaiLayout>
          {children}
        </FabricaiLayout>
      </body>
    </html>
  )
}