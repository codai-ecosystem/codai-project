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
    variable: '--font-inter'
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