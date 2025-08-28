import React from 'react'
import type { Metadata } from 'next';
import MainNavigation from '../components/navigation/main_navigation';
import { ThemeProvider } from '../components/theme/theme-provider';
import './lib/i18n/config';
import './globals.css';

export const metadata: Metadata = {
  title: 'RomAI AGI Platform - Advanced Romanian Intelligence System',
  description: 'Professional AGI platform with advanced Romanian language processing, cultural understanding, and autonomous reasoning capabilities',
  keywords: 'Romanian AI, RomAI, AGI, Artificial General Intelligence, Romania, Language Processing, Cultural AI, CODAI',
  authors: [{ name: 'CODAI Ecosystem' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'RomAI AGI Platform',
    description: 'Advanced Romanian Intelligence System with Autonomous Reasoning',
    url: 'https://romcp.ro',
    siteName: 'RomAI AGI',
    locale: 'ro_RO',
    type: 'website',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'RomAI AGI Platform'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RomAI AGI Platform',
    description: 'Advanced Romanian Intelligence System',
    creator: '@codai_ecosystem',
    images: ['/og-image.jpg']
  },
};


// Initialize i18n for romai
// This import must be before any components that use translations

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </head>
      <body className="antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-all duration-300">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Navigation Sidebar */}
            <MainNavigation />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Header Bar */}
              <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      RomAI AGI Platform
                    </h2>
                    <div className="hidden md:flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Production Ready
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Real-time status indicators */}
                    <div className="hidden md:flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Server</p>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Online
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">AGI Status</p>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Active
                        </span>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Training</p>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          Idle
                        </span>
                      </div>
                    </div>

                    {/* Theme toggle placeholder */}
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      🌙
                    </button>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
                <div className="h-full">
                  {children}
                </div>
              </main>

              {/* Footer */}
              <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    RomAI AGI Platform v2.0 • Real Intelligence, Real Data, Real Results
                  </div>
                  <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                    <span>Port 6101</span>
                    <span>•</span>
                    <span>Last Updated: {new Date().toLocaleTimeString('ro-RO')}</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
