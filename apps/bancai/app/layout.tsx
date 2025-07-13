import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { BancaiLayout } from '../layout/BancaiLayout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bancai - AI Banking & Finance Platform',
  description: 'Intelligent financial services and analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: any
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <BancaiLayout>
          {children}
        </BancaiLayout>
      </body>
    </html>
  )
}
