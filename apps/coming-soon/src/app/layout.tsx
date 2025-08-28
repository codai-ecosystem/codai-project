import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import I18nProvider from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { generateHomeMetadata } from '@/lib/seo/metadata';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
    fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = generateHomeMetadata();

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                {/* Performance Optimization */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//fonts.gstatic.com" />
                
                {/* Resource Hints */}
                <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="prefetch" href="/api/health" />
                <link rel="prefetch" href="/api/metrics" />
                
                {/* Critical CSS Preload */}
                <link rel="preload" href="/styles/critical.css" as="style" />
                <link rel="stylesheet" href="/styles/critical.css" />
                
                {/* PWA Enhancements */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="CODAI" />
                <meta name="application-name" content="CODAI" />
                <meta name="msapplication-TileColor" content="#6366f1" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                <meta name="theme-color" content="#6366f1" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
                
                {/* Performance & Security */}
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="referrer" content="origin-when-cross-origin" />
                <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; media-src 'self' https:; object-src 'none'; frame-src 'none';" />
                
                {/* Structured Data Preload */}
                <link rel="preload" href="/api/structured-data" as="fetch" crossOrigin="anonymous" />
                
                {/* Performance Monitoring */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', () => {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(registration => console.log('SW registered'))
                                        .catch(error => console.log('SW registration failed'));
                                });
                            }
                        `,
                    }}
                />
                
                {/* Dark Mode Prevention of Flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    if (typeof window === 'undefined') return;
                                    var theme = localStorage.getItem('codai-theme');
                                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                        document.documentElement.classList.add('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className={`${inter.className} antialiased`}>
                <ThemeProvider defaultTheme="dark" storageKey="codai-theme">
                    <I18nProvider>
                        {children}
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}