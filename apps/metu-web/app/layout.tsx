import React from 'react';
import { Inter, JetBrains_Mono, Lexend } from 'next/font/google';

import '../src/styles/globals.css';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata = {
  title: 'METU Voice AI - Intelligent Conversational Assistant',
  description: 'METU is an advanced voice AI assistant providing intelligent conversations, voice recognition, and real-time responses.',
  keywords: 'voice AI, conversational assistant, speech recognition, artificial intelligence',
  authors: [{ name: 'CODAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0f172a',

  openGraph: {
    title: 'METU Voice AI',
    description: 'Intelligent Conversational Assistant',
    type: 'website',
    url: 'https://metu.codai.app',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'METU Voice AI',
    description: 'Intelligent Conversational Assistant',
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${lexend.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
