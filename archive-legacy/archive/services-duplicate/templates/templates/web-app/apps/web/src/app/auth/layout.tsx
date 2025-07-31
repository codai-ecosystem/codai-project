import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): ReactNode {
  return children;
}
