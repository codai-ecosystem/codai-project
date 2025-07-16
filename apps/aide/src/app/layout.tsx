import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AIDE - AI Development Environment',
  description: 'Advanced AI-powered development assistant for the CODAI ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
