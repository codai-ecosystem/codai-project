import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JucAI - AI-Native Game Platform & Marketplace',
  description: 'Revolutionary AI-powered gaming platform with intelligent game mechanics, player analytics, and marketplace features. Experience the future of gaming.',
  keywords: 'AI gaming, game platform, marketplace, artificial intelligence, gaming analytics, smart mechanics',
  openGraph: {
    title: 'JucAI - AI-Native Game Platform',
    description: 'Revolutionary AI-powered gaming platform with intelligent game mechanics and marketplace features.',
    url: 'https://jucai.ro',
    siteName: 'JucAI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JucAI - AI-Native Game Platform',
    description: 'Revolutionary AI-powered gaming platform with intelligent game mechanics and marketplace features.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
