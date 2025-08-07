'use client'

import React from 'react';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HubPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading CODAI Hub Dashboard...</p>
      </div>
    </div>
  );
}

