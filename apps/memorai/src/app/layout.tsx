import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MEMORAI - AI Memory & Database Core',
  description: 'AI Memory & Database Core - Modern, animated, real-time AI platform',
  keywords: ['AI', 'platform', 'memorai', 'modern', 'real-time'],
  authors: [{ name: 'Codai Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}