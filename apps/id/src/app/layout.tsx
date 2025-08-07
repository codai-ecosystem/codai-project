import React from 'react'
import type { Metadata } from 'next'
import { SharedEcosystemNavigation } from '@codai/shared-components'
import Script from 'next/script'
import './globals.css'
import '../styles/animation-enhancements.css'

export const metadata: Metadata = {
  title: 'CODAI ID - Enterprise Identity & Authentication Platform',
  description: 'Secure identity and authentication services for the CODAI ecosystem with enterprise-grade security',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('✅ ID Service SW registered: ', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('❌ ID Service SW registration failed: ', error);
                  });
              });
            }
          `}
        </Script>
      </head>
      <body className="min-h-screen flex bg-gray-50">
        <SharedEcosystemNavigation
          appName="ID"
          currentPath="/"
          navigationItems={[
            { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
            { name: 'Authentication', href: '/auth', icon: 'Shield' },
            { name: 'Users', href: '/users', icon: 'Users' },
            { name: 'Sessions', href: '/sessions', icon: 'Clock' },
            { name: 'Security', href: '/security', icon: 'Lock' },
            { name: 'Audit Logs', href: '/audit', icon: 'FileText' },
            { name: 'Settings', href: '/settings', icon: 'Settings' }
          ]}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}


