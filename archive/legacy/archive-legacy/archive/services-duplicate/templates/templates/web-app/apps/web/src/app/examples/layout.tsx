'use client';

import type { JSX } from 'react';

import { Layout } from '@/components/layout/Layout';

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </Layout>
  );
}
