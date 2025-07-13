'use client';

import { notFound } from 'next/navigation';

import { validateClientEnv } from '@/lib/env';

export default function EnvTestPage() {
  // Only allow env test page in development
  if (process.env['NODE_ENV'] === 'production') {
    notFound();
  }

  let envData: unknown = null;
  let rawEnv: Record<string, string | undefined> = {};

  try {
    envData = validateClientEnv();
    rawEnv = {
      NEXT_PUBLIC_FIREBASE_ENABLED: process.env['NEXT_PUBLIC_FIREBASE_ENABLED'],
    };
  } catch (error) {
    envData = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    rawEnv = {};
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Environment Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Raw Environment</h2>
          <pre className="rounded bg-gray-100 p-4">
            {JSON.stringify(rawEnv, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Validated Environment</h2>
          <pre className="rounded bg-gray-100 p-4">
            {JSON.stringify(envData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
