import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kodex - CodaiChain Protocol & Smart Contract Platform',
  description: 'Advanced smart contract development platform for CodaiChain protocol with AI-powered code analysis and deployment tools',
  keywords: ['smart contracts', 'blockchain', 'codaichain', 'solidity', 'development'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
