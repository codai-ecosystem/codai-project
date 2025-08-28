import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MotionProvider } from '@/contexts/MotionContext';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
    fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
    title: 'CODAI - The AI Renaissance',
    description: 'Experience the future of AI with CODAI',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                <meta name="theme-color" content="#6366f1" />
            </head>
            <body className={`${inter.className} antialiased`}>
                <ThemeProvider defaultTheme="dark">
                    <MotionProvider>
                        {children}
                    </MotionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}