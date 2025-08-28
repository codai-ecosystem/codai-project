import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale, getLocaleConfig } from '@/i18n';
import Providers from "@/components/providers";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// Generate metadata for each locale
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  
  if (!locales.includes(locale)) {
    return {};
  }

  const localeConfig = getLocaleConfig(locale);

  return {
    title: locale === 'en' 
      ? "MemorAI - AI-Powered Memory Management"
      : "MemorAI - Managementul Memoriei cu AI",
    description: locale === 'en'
      ? "Intelligent memory management with vector-based storage and semantic search"
      : "Management inteligent al memoriei cu stocare bazată pe vectori și căutare semantică",
    metadataBase: new URL('https://memorai.codai.dev'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'ro': '/ro',
      },
    },
    openGraph: {
      title: locale === 'en' 
        ? "MemorAI - AI-Powered Memory Management"
        : "MemorAI - Managementul Memoriei cu AI",
      description: locale === 'en'
        ? "Intelligent memory management with vector-based storage and semantic search"
        : "Management inteligent al memoriei cu stocare bazată pe vectori și căutare semantică",
      url: `https://memorai.codai.dev/${locale}`,
      siteName: 'MemorAI',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'en' 
        ? "MemorAI - AI-Powered Memory Management"
        : "MemorAI - Managementul Memoriei cu AI",
      description: locale === 'en'
        ? "Intelligent memory management with vector-based storage and semantic search"
        : "Management inteligent al memoriei cu stocare bazată pe vectori și căutare semantică",
    },
  };
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = params.locale as Locale;

  // Validate that the incoming locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  const localeConfig = getLocaleConfig(locale);
  
  // Fetch messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale} dir={localeConfig.dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <main>
              {children}
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}