import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'CODAI Web App',
    description: 'Modern web application built with CODAI ecosystem',
    keywords: ['CODAI', 'AI', 'Web App', 'Next.js'],
    authors: [{ name: 'CODAI Team' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#3b82f6',
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
                </Providers>
            </body>
        </html>
    )
}
