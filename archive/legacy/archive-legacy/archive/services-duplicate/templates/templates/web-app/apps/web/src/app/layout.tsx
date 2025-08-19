import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { JSX } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DevToolsProvider } from '@/providers/DevToolsProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { PWAProvider } from '@/providers/PWAProvider';
import { ToastProvider } from '@/providers/ToastProvider';

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
  title: 'METU Template - Modern Next.js Starter',
  description:
    'A modern Next.js template with Firebase, TypeScript, Tailwind CSS, and comprehensive tooling for building scalable web applications.',
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Firebase',
    'Template',
    'Starter',
  ],
  authors: [{ name: 'METU Template' }],
  creator: 'METU Template',
  publisher: 'METU Template',
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  ),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'METU Template',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'METU Template - Modern Next.js Starter',
    description:
      'A comprehensive Next.js 15 template with Firebase, TypeScript, Tailwind CSS, and modern best practices.',
    siteName: 'METU Template',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'METU Template - Modern Next.js Starter',
    description:
      'A comprehensive Next.js 15 template with Firebase, TypeScript, Tailwind CSS, and modern best practices.',
  },
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
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <NotificationProvider>
                <ToastProvider>
                  <PWAProvider>
                    <DevToolsProvider>{children}</DevToolsProvider>
                  </PWAProvider>
                </ToastProvider>
              </NotificationProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
