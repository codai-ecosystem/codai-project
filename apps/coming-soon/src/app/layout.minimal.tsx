import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
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
                {children}
            </body>
        </html>
    );
}