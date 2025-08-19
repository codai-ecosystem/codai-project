import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConversAILayout from './components/ConversAILayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ConversAI - Professional Email Platform',
  description: 'AI-powered professional email management platform with intelligent features and seamless communication tools',
  keywords: 'email, communication, AI, professional, productivity, ConversAI, CODAI',
  authors: [{ name: 'CODAI Team' }],
  creator: 'CODAI Ecosystem',
  publisher: 'CODAI',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
  openGraph: {
    title: 'ConversAI - Professional Email Platform',
    description: 'AI-powered professional email management with intelligent automation and seamless communication',
    type: 'website',
    locale: 'en_US',
    siteName: 'ConversAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConversAI - Professional Email Platform',
    description: 'AI-powered professional email management with intelligent automation',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.className} h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 antialiased`}>
        <ConversAILayout>
          {children}
        </ConversAILayout>
      </body>
    </html>
  )
}
