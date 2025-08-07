import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CODAI - AI-Native Development Platform',
  description: 'The future of software development with AI integration',
  keywords: ['AI', 'development', 'coding', 'automation', 'software'],
  authors: [{ name: 'CODAI Team' }],
  openGraph: {
    title: 'CODAI - AI-Native Development Platform',
    description: 'The future of software development with AI integration',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

