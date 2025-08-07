import React from 'react'
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { JSX } from 'react';

import { ThemeProvider } from '../context/ThemeContext';
import { LogAIProvider } from '../context/LogAIContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DEXAI - Dicționar Explicativ cu Inteligență Artificială',
  description: 'Platformă modernă pentru explorarea limbii române cu puterea AI. Definiții precise, etimologii și exemple contextuale.',
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  ),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LogAIProvider appName="dexai">
            {children}
          </LogAIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

