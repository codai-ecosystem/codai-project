'use client'

import React from 'react';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemorAIPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard as the main entry point
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to MemorAI Dashboard...</p>
      </div>
    </div>
  );
}

