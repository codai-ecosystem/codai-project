'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Brain } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check for manual authentication cookie
    const isAuthenticated = document.cookie.includes('memorai-auth=authenticated');

    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  }, [router]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to MemorAI
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Checking authentication...
        </p>
      </div>
    </div>
  );
}
