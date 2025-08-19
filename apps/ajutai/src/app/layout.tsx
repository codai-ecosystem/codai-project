import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AjutaiLayout from '@/components/layout/AjutaiLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AJUTAI - Intelligent Help & Support Platform',
  description: 'Transform your customer service with AI-powered support tools, seamless integrations, and comprehensive analytics. Experience the future of customer support with AJUTAI.',
  keywords: 'customer support, help desk, AI support, live chat, knowledge base, support tickets, customer service platform',
  authors: [{ name: 'AJUTAI Team' }],
  openGraph: {
    title: 'AJUTAI - Intelligent Help & Support Platform',
    description: 'Transform your customer service with AI-powered support tools and seamless integrations.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AJUTAI - Intelligent Help & Support Platform',
    description: 'Transform your customer service with AI-powered support tools and seamless integrations.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AjutaiLayout>
          {children}
        </AjutaiLayout>
      </body>
    </html>
  )
}

