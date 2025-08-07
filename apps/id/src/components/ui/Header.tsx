import React from 'react'
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle: string;
  navigation: Array<{ href: string; label: string }>;
  variant: string;
}

export function Header({ title, subtitle, navigation, variant }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🆔</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </Link>
          </div>

          <nav className="flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

