import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'MarketAI - Marketplace for AI Agents & Modules',
    description: 'Discover, trade, and deploy AI agents and modules',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
