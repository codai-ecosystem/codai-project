import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'CODAI Mobile',
    description: 'CODAI Mobile Application',
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
