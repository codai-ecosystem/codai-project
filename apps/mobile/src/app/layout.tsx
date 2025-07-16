import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mobile - Mobile App Experience',
    description: 'Cross-platform mobile application development',
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
