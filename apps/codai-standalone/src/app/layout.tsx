import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CODAI - AI-Powered Development Platform',
  description: 'Advanced AI development platform with integrated services and collaboration tools',
  keywords: ['AI', 'development', 'platform', 'collaboration', 'automation'],
  authors: [{ name: 'CODAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f8fafc',
        color: '#1e293b'
      }}>
        {children}
      </body>
    </html>
  )
}

