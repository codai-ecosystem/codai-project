import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RomAI Control Panel - Romanian Intelligence Platform',
  description: 'Advanced Romanian AI platform with multi-cloud infrastructure - part of the CODAI ecosystem',
  keywords: 'Romanian AI, RomAI, Control Panel, Artificial Intelligence, Romania, CODAI',
  authors: [{ name: 'CODAI Ecosystem' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'RomAI Control Panel',
    description: 'Advanced Romanian AI platform with multi-cloud infrastructure',
    url: 'https://romcp.ro',
    siteName: 'RomAI',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RomAI Control Panel',
    description: 'Advanced Romanian AI platform',
    creator: '@codai_ecosystem',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className="antialiased bg-white dark:bg-slate-900 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}