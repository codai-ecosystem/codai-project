import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { LogAIProvider } from '../context/LogAIContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DonAI - Blockchain Donation Platform | CODAI',
  description: 'Transparent blockchain donations with AI-powered cause matching for Romanian charities',
  keywords: ['donations', 'blockchain', 'ai', 'romania', 'charity', 'transparency'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <LogAIProvider appName="donai">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {children}
          </div>
        </LogAIProvider>
      </body>
    </html>
  )
}
