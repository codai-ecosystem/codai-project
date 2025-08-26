import React from 'react'
import type { Metadata } from 'next';
import '../lib/i18n/config';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import EcosystemNavigation from '../components/EcosystemNavigation';

export const metadata: Metadata = {
  title: 'CODAI Platform - AI Development Environment',
  description: 'AI-powered development platform with integrated authentication and role-based access control',
};


// Initialize i18n for codai
// This import must be before any components that use translations

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <EcosystemNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
