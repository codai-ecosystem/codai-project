import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MemoraiSessionProvider from '../components/providers/MemoraiSessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MEMORAI - AI Memory & Database Core (Enterprise)',
  description: 'AI Memory & Database Core - Modern, animated, real-time AI platform with enterprise SSO integration',
  keywords: ['AI', 'platform', 'memorai', 'modern', 'real-time', 'enterprise', 'sso'],
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
      <body className={inter.className}>
        <MemoraiSessionProvider>
          {children}
        </MemoraiSessionProvider>
      </body>
    </html>
  )
}