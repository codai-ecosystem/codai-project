import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AcasaiLayout from '@/components/layout/AcasaiLayout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AcasAI - Smart Home Automation Platform | CODAI Ecosystem',
  description: 'Comprehensive smart home automation platform with IoT integration, intelligent device management, energy optimization, and security monitoring. Transform your home into an intelligent living space.',
  keywords: [
    'smart home',
    'home automation',
    'IoT platform',
    'device management',
    'energy optimization',
    'home security',
    'intelligent automation',
    'smart devices',
    'climate control',
    'home monitoring'
  ],
  authors: [{ name: 'CODAI Ecosystem' }],
  creator: 'AcasAI Platform',
  publisher: 'CODAI',
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
    locale: 'ro_RO',
    alternateLocale: ['en_US'],
    url: 'https://acasai.codai.ro',
    siteName: 'AcasAI Smart Home Platform',
    title: 'AcasAI - Smart Home Automation Platform',
    description: 'Transform your home with intelligent automation, energy optimization, and comprehensive security monitoring.',
    images: [
      {
        url: '/api/og-image',
        width: 1200,
        height: 630,
        alt: 'AcasAI Smart Home Automation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@codai_platform',
    creator: '@acasai_home',
    title: 'AcasAI - Smart Home Automation Platform',
    description: 'Intelligent home automation with IoT integration and energy optimization.',
    images: ['/api/og-image'],
  },
  alternates: {
    canonical: 'https://acasai.codai.ro',
    languages: {
      'ro-RO': 'https://acasai.codai.ro',
      'en-US': 'https://acasai.codai.ro/en',
    },
  },
  other: {
    'application-name': 'AcasAI',
    'apple-mobile-web-app-title': 'AcasAI',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#2563eb',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#2563eb',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <AcasaiLayout>
          {children}
        </AcasaiLayout>
      </body>
    </html>
  )
}
