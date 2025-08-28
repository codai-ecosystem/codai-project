import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodAI Dashboard',
  description: 'Comprehensive AI-powered development platform',
  keywords: 'AI, development, dashboard, codai, artificial intelligence',
  authors: [{ name: 'CodAI Team' }],
  creator: 'CodAI',
  publisher: 'CodAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:4250'),
  openGraph: {
    title: 'CodAI Dashboard',
    description: 'Comprehensive AI-powered development platform',
    url: 'http://localhost:4250',
    siteName: 'CodAI',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'codai-dashboard-verification',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}