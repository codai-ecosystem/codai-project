import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import '../styles/animation-enhancements.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CODAI Hub - AI-Powered Central Platform',
  description: 'Centralized hub for AI services and ecosystem management with advanced coordination capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <Script src="/accessibility-enhancements.js" strategy="beforeInteractive" />
        <Script src="/modern-enhancements.js" strategy="beforeInteractive" />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('✅ Hub SW registered: ', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('❌ Hub SW registration failed: ', error);
                  });
              });
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} animate-hub-fade-in animate-container`}>
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <main id="main-content" role="main" className="animate-container">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

