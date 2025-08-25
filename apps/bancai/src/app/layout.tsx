import React from 'react'
import type { Metadata } from 'next'
import BancaiSessionProvider from '../components/BancaiSessionProvider'
import { AuthProvider } from '../lib/auth'
import BancaiNavigation from '../components/BancaiNavigation'
import './lib/i18n/config';
import './globals.css'

export const metadata: Metadata = {
  title: 'BancAI - AI Banking Platform',
  description: 'Secure AI-powered banking with enterprise SSO authentication',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BancAI'
  }
}


// Initialize i18n for bancai
// This import must be before any components that use translations

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 font-sans antialiased">
        <AuthProvider>
          <BancaiSessionProvider>
            <div className="flex h-full">
              <BancaiNavigation />
              <div className="flex-1 lg:ml-80">
                <main className="min-h-full">
                  {children}
                </main>
              </div>
            </div>
          </BancaiSessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
