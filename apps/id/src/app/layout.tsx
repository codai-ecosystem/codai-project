import type { Metadata } from 'next'
import { Header } from '../components/ui/Header'
import { Footer } from '../components/ui/Footer'
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
      <body className="min-h-screen flex flex-col bg-gray-50 animate-auth-fade-in animate-container">
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>
        <Header
          title="CODAI ID"
          subtitle="Enterprise Identity & Authentication"
          navigation={[
            { href: "/", label: "Home" },
            { href: "/auth/signin", label: "Sign In" },
            { href: "/auth/signup", label: "Sign Up" }
          ]}
          variant="default"
        />
        <main id="main-content" className="flex-1 animate-container" role="main">
          {children}
        </main>
        <Footer
          brandText="CODAI ID"
          copyrightText="© 2024 CODAI Ecosystem. All rights reserved."
          variant="default"
          sections={[
            {
              title: "Identity Services",
              links: [
                { label: "Sign In", href: "/auth/signin" },
                { label: "Sign Up", href: "/auth/signup" },
                { label: "Password Reset", href: "/auth/forgot-password" },
                { label: "Account Settings", href: "/settings" }
              ]
            },
            {
              title: "Support",
              links: [
                { label: "Help Center", href: "/help" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact Us", href: "/contact" }
              ]
            }
          ]}
        />
      </body>
    </html>
  )
}

