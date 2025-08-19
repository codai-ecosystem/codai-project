import { Inter } from 'next/font/google'
import AdoptaiLayout from '@/components/layout/AdoptaiLayout'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap'
})

export const metadata = {
    title: 'ADOPTAI - AI-Powered Pet Adoption Platform',
    description: 'Connect pets with loving families using intelligent matching algorithms. Find your perfect companion through our comprehensive AI-powered pet adoption platform.',
    keywords: 'pet adoption, AI matching, dogs, cats, animal rescue, pet compatibility, adoption platform, animal welfare',
    authors: [{ name: 'CODAI Ecosystem' }],
    creator: 'CODAI Ecosystem',
    publisher: 'CODAI Ecosystem',

    // Open Graph metadata for social sharing
    openGraph: {
        title: 'ADOPTAI - AI-Powered Pet Adoption Platform',
        description: 'Connect pets with loving families using intelligent matching algorithms',
        url: 'https://adoptai.codai.ro',
        siteName: 'ADOPTAI',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'ADOPTAI Pet Adoption Platform'
            }
        ],
        locale: 'ro_RO',
        type: 'website'
    },

    // Twitter Card metadata
    twitter: {
        card: 'summary_large_image',
        title: 'ADOPTAI - AI-Powered Pet Adoption Platform',
        description: 'Connect pets with loving families using intelligent matching algorithms',
        images: ['/twitter-image.jpg'],
        creator: '@codai_ecosystem'
    },

    // Additional metadata
    category: 'Animal Welfare',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    },

    // Mobile app metadata
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1
    },

    // PWA metadata
    manifest: '/manifest.json',

    // Verification
    verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code'
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ro" className={`${inter.variable} font-sans`}>
            <head>
                {/* Preconnect to external domains for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Favicon and app icons */}
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

                {/* Theme color for mobile browsers */}
                <meta name="theme-color" content="#3B82F6" />
                <meta name="color-scheme" content="light" />

                {/* Schema.org structured data for pet adoption platform */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "ADOPTAI",
                            "description": "AI-Powered Pet Adoption Platform connecting pets with loving families",
                            "url": "https://adoptai.codai.ro",
                            "applicationCategory": "AnimalWelfare",
                            "operatingSystem": "Web Browser",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "RON"
                            },
                            "creator": {
                                "@type": "Organization",
                                "name": "CODAI Ecosystem",
                                "url": "https://codai.ro"
                            },
                            "featureList": [
                                "AI-powered pet matching",
                                "Comprehensive pet profiles",
                                "Adoption application tracking",
                                "Shelter communication tools",
                                "Pet care resources"
                            ]
                        })
                    }}
                />
            </head>
            <body className={`${inter.className} antialiased bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`}>
                {/* Main Application Layout */}
                <AdoptaiLayout>
                    {children}
                </AdoptaiLayout>

                {/* Analytics and tracking scripts would go here */}
                {/* Note: Add your analytics scripts here for production */}
            </body>
        </html>
    )
}
