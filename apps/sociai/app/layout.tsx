import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SociAI - AI Social Platform',
  description: 'Modern AI-powered social platform for Romanian communities',
  keywords: ['AI', 'social', 'platform', 'romanian', 'community'],
  authors: [{ name: 'CODAI Ecosystem' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
          {children}
        </div>
      </body>
    </html>
  )
}