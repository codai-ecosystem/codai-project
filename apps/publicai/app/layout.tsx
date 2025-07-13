import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PUBLICAI - Civic AI & Transparency Tools',
  description: 'Civic AI & Transparency Tools - Modern, animated, real-time AI platform',
  keywords: ['AI', 'platform', 'publicai', 'modern', 'real-time'],
  authors: [{ name: 'Codai Team' }],
  viewport: 'width=device-width, initial-scale=1',
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