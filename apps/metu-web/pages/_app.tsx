import React from 'react'
import { Inter, JetBrains_Mono, Lexend } from 'next/font/google';
import Head from 'next/head';
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

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <title>METU Voice AI - Intelligent Conversational Assistant</title>
        <meta name="description" content="METU is an advanced voice AI assistant providing intelligent conversations, voice recognition, and real-time responses." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />

        {/* Open Graph */}
        <meta property="og:title" content="METU Voice AI" />
        <meta property="og:description" content="Intelligent Conversational Assistant" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://metu.codai.app" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="METU Voice AI" />
        <meta name="twitter:description" content="Intelligent Conversational Assistant" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <div className={`${inter.variable} ${jetbrainsMono.variable} ${lexend.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

