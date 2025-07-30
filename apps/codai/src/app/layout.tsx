import type { Metadata } from 'next';
import './globals.css';
import CodaiSessionProvider from '../components/providers/CodaiSessionProvider';

export const metadata: Metadata = {
  title: 'Codai - CODAI Ecosystem Enterprise',
  description: 'AI-native development environment with enterprise SSO integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CodaiSessionProvider>
          {children}
        </CodaiSessionProvider>
      </body>
    </html>
  );
}