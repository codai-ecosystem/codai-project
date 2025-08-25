import React from 'react'
import './lib/i18n/config';
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'CODAI Web App',
    description: 'Modern web application built with CODAI ecosystem',
    keywords: ['CODAI', 'AI', 'Web App', 'Next.js'],
    authors: [{ name: 'CODAI Team' }],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3b82f6',
}


// Initialize i18n for controlai-dashboard
// This import must be before any components that use translations

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
                </Providers>
            </body>
        </html>
    )
}

