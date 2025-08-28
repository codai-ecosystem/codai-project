/**
 * API Integration Test Page
 * Live testing page for the API integration layer
 */

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const LiveApiTest = dynamic(() => import('../components/LiveApiTest'), { 
  ssr: false,
  loading: () => <div className="p-6 text-center">Loading API Integration Tests...</div>
});

const ApiIntegrationDemo = dynamic(() => import('../components/ApiIntegrationDemo'), { 
  ssr: false,
  loading: () => <div className="p-6 text-center">Loading API Demo...</div>
});

export default function ApiTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚀 CODAI API Integration Testing
          </h1>
          <p className="text-lg text-gray-600">
            Live testing and demonstration of the API integration layer
          </p>
        </div>

        {/* Live Tests Section */}
        <section className="mb-12">
          <LiveApiTest />
        </section>

        {/* Comprehensive Demo Section */}
        <section>
          <ApiIntegrationDemo />
        </section>
      </div>
    </div>
  );
}