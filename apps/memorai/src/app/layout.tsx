import React from 'react';
import { locales } from '@/i18n';
import type { Locale } from '@/i18n';

// This is the root layout that handles locale routing
// The actual app layout is in [locale]/layout.tsx

type Props = {
  children: React.ReactNode;
  params: { locale?: Locale };
};

// Generate metadata for all locales
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({ children }: Props) {
  return children;
}

