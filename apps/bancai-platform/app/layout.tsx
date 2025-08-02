import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'BancAI - Financial AI Platform',
  description: 'Advanced AI solutions for banking, finance, and fintech companies',
  keywords: 'AI, banking, finance, fintech, artificial intelligence, financial analysis',
  authors: [{ name: 'CODAI Ecosystem' }],
  creator: 'CODAI Ecosystem',
  publisher: 'BancAI',
  robots: 'index, follow',
  openGraph: {
    title: 'BancAI - Financial AI Platform',
    description: 'Advanced AI solutions for banking, finance, and fintech companies',
    url: 'https://bancai.ro',
    siteName: 'BancAI',
    images: [
      {
        url: 'https://bancai.ro/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BancAI Financial AI Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BancAI - Financial AI Platform',
    description: 'Advanced AI solutions for banking, finance, and fintech companies',
    images: ['https://bancai.ro/twitter-image.jpg'],
    creator: '@bancai_ro',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
      </body>
    </html>
  )
}
