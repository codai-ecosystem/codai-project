'use client';

import { notFound } from 'next/navigation';

import { isFirebaseEnabled } from '@/lib/env';

export default function DebugPage() {
  // Only allow debug page in development
  if (process.env['NODE_ENV'] === 'production') {
    notFound();
  }

  const firebaseEnabled = isFirebaseEnabled();

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Debug Information</h1>
      <div className="space-y-2">
        <p>
          <strong>Firebase Enabled:</strong>{' '}
          {firebaseEnabled ? 'true' : 'false'}
        </p>
        <p>
          <strong>NEXT_PUBLIC_FIREBASE_ENABLED:</strong>{' '}
          {process.env['NEXT_PUBLIC_FIREBASE_ENABLED'] || 'undefined'}
        </p>
        <p>
          <strong>All NEXT_PUBLIC env vars:</strong>
        </p>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(
            Object.entries(process.env).filter(([key]) =>
              key.startsWith('NEXT_PUBLIC_')
            ),
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
