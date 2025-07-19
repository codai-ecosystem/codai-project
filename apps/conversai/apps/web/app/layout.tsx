import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CONVERSAI - Intelligent Conversation Platform',
  description: 'Advanced AI-powered conversations and chat management',
  keywords: ['AI', 'Chat', 'Conversations', 'CONVERSAI', 'CODAI'],
  authors: [{ name: 'CODAI Ecosystem' }],
  openGraph: {
    title: 'CONVERSAI - Intelligent Conversation Platform',
    description: 'Advanced AI-powered conversations and chat management',
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
      <body className="antialiased">{children}</body>
    </html>
  )
}
