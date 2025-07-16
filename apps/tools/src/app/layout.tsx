import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tools - AI Utilities & Standalone Tools',
    description: 'Essential AI utilities and development tools',
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
