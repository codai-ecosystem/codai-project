'use client';

import { useAuth } from '@/components';
import { MainDashboard } from '@/components';
import { LoginForm } from '@/components';
import { LoadingPage } from '@/components';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <MainDashboard />;
}
