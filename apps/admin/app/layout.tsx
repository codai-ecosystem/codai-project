/**
 * 🏗️ Root Layout Component
 * Enterprise layout wrapper for ADMIN platform using Next.js App Router
 */

import { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: {
        default: 'CODAI Admin Dashboard',
        template: '%s | CODAI Admin'
    },
    description: 'Enterprise administration platform for CODAI ecosystem',
    keywords: ['admin', 'dashboard', 'enterprise', 'management'],
    authors: [{ name: 'CODAI Team' }],
    creator: 'CODAI',
    publisher: 'CODAI',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://admin.codai.dev',
        title: 'CODAI Admin Dashboard',
        description: 'Enterprise administration platform for CODAI ecosystem',
        siteName: 'CODAI Admin',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CODAI Admin Dashboard',
        description: 'Enterprise administration platform for CODAI ecosystem',
        creator: '@codai',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
    },
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
            <body className="min-h-screen bg-gray-50 font-sans antialiased">
                {/* Navigation Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">
                                    CODAI Admin
                                </h1>
                            </div>

                            <nav className="hidden md:flex space-x-8">
                                <a
                                    href="/"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </a>
                                <a
                                    href="/analytics"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Analytics
                                </a>
                                <a
                                    href="/settings"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Settings
                                </a>
                                <a
                                    href="/api/health"
                                    className="text-green-600 hover:text-green-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Health
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500">
                            © 2025 CODAI Admin Platform. All rights reserved.
                        </p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
