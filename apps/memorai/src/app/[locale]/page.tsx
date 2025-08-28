'use client'

import React from 'react';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Locale } from '@/i18n';

export default function LocaleHomePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params['locale'] as Locale;
  const t = useTranslations('common');

  useEffect(() => {
    // Redirect to dashboard with proper locale
    router.push(`/${locale}/dashboard`);
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loading')}...</p>
        <p className="text-sm text-gray-500 mt-2">
          {locale === 'en' ? 'Redirecting to MemorAI Dashboard...' : 'Redirecționare către Tabloul de Bord MemorAI...'}
        </p>
      </div>
    </div>
  );
}