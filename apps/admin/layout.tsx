/**
 * 🏗️ Layout Component
 * Enterprise layout wrapper for ADMIN platform
 */

'use client';

import { ReactNode } from 'react';

interface LayoutProps {
    children?: ReactNode;
    title?: string;
    className?: string;
}

export default function Layout(props: LayoutProps = {}) {
    const {
        children = null,
        title = 'ADMIN Dashboard',
        className = ''
    } = props;
    return (
        <html lang="en">
            <head>
                <title>{title}</title>
                <meta name="description" content="Enterprise admin dashboard" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* Open Graph tags */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content="Enterprise admin dashboard" />
                <meta property="og:type" content="website" />
                {/* Twitter Card tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content="Enterprise admin dashboard" />
            </head>
            <body className={`min-h-screen bg-gray-50 ${className}`}>
                {/* Navigation Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">
                                    ADMIN
                                </h1>
                            </div>

                            <nav className="hidden md:flex space-x-8">
                                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Analytics
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Settings
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500">
                            © 2025 ADMIN Platform. All rights reserved.
                        </p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
