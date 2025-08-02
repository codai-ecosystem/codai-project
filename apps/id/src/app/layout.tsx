import type { Metadata } from 'next'
import { Header, Footer } from '@codai/shared-ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'ID - CODAI Ecosystem',
  description: 'Enterprise Identity & Authentication Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
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
        <main className="flex-1" role="main">
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
