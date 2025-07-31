import type { JSX } from 'react';
import type { ReactNode } from 'react';

import { Footer } from './Footer';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function Layout({
  children,
  showHeader = true,
  showFooter = true,
  className,
}: LayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader ? <Header /> : null}
      <main role="main" className={className ?? 'flex-1'}>
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
