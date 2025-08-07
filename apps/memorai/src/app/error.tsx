'use client'

import React from 'react';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 text-sm mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-red-500 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mr-4"
          >
            Try Again
          </button>
          
          <a 
            href="/"
            className="inline-block bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go Home
          </a>
          
          <div className="text-sm text-slate-500 mt-4">
            <a 
              href="/contact"
              className="text-red-600 hover:text-red-700 underline"
            >
              Report this issue
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

