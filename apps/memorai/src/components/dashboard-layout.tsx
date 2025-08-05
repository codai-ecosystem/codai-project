/**
 * Memory Dashboard Layout (Simplified for Production)
 * 
 * Simplified layout without notification provider to avoid build issues
 */

'use client';

import React from 'react';
// import { NotificationProvider } from '@/components/notifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
