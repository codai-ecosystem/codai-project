import type { Metadata } from 'next';
import type { JSX } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard - METU Template',
  description: 'User dashboard with analytics and quick actions',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">{children}</div>
    </div>
  );
}
