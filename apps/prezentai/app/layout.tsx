import './globals.css'
import type { Metadata } from 'next'
import { Inter, Source_Sans_3 } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap'
})

const sourceSans = Source_Sans_3({
    subsets: ['latin'],
    variable: '--font-source-sans',
    display: 'swap'
})

export const metadata: Metadata = {
    title: 'PREZENTAI.RO - AI Ecosystem Portfolio',
    description: 'Premium portfolio showcasing our revolutionary AI ecosystem with 30+ cutting-edge applications and services.',
    keywords: ['AI ecosystem', 'portfolio', 'artificial intelligence', 'technology showcase', 'CODAI', 'innovation'],
    authors: [{ name: 'CODAI Ecosystem Team' }],
    creator: 'CODAI Ecosystem',
    publisher: 'CODAI Ecosystem',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://prezentai.ro',
        siteName: 'PREZENTAI.RO',
        title: 'PREZENTAI.RO - AI Ecosystem Portfolio',
        description: 'Premium portfolio showcasing our revolutionary AI ecosystem with 30+ cutting-edge applications.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'PREZENTAI.RO - AI Ecosystem Portfolio',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PREZENTAI.RO - AI Ecosystem Portfolio',
        description: 'Premium portfolio showcasing our revolutionary AI ecosystem with 30+ cutting-edge applications.',
        images: ['/og-image.jpg'],
    },
    viewport: 'width=device-width, initial-scale=1',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${sourceSans.variable}`} suppressHydrationWarning>
            <body className="antialiased">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
