/**
 * @fileoverview ROMCP Web Frontend - Home page with search interface
 * @author Cautai Team
 * @version 1.0.0
 */

import { SearchInterface } from '@/components/SearchInterface';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Search Interface */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🔍 Search with AI
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience the future of search - powered by artificial intelligence
            </p>
          </div>
          <SearchInterface />
        </div>
      </section>
      
      {/* Features Section */}
      <Features />
    </main>
  );
}