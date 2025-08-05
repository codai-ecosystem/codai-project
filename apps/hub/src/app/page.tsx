'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';

interface ServiceStatus {
  name: string;
  port: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  url: string;
}

export default function HubDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Admin Dashboard',
      port: '4007',
      status: 'active',
      description: 'System administration and user management',
      url: 'http://localhost:4007'
    },
    {
      name: 'ID Service',
      port: '4004',
      status: 'active',
      description: 'Authentication and identity management',
      url: 'http://localhost:4004'
    },
    {
      name: 'API Gateway',
      port: '4003',
      status: 'active',
      description: 'Request routing and load balancing',
      url: 'http://localhost:4003'
    },
    {
      name: 'CBD Database',
      port: '4180',
      status: 'active',
      description: 'Universal data platform',
      url: 'http://localhost:4180'
    },
    {
      name: 'MemorAI',
      port: '4006',
      status: 'active',
      description: 'AI memory and context management',
      url: 'http://localhost:4006'
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Simulate service status check
    const checkServices = async () => {
      setIsLoading(true);
      // In a real implementation, you would check each service's health endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdate(new Date().toLocaleString());
      setIsLoading(false);
    };

    checkServices();
    const interval = setInterval(checkServices, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const activeServices = services.filter(s => s.status === 'active').length;
  const totalServices = services.length;

  return (
    <>
      <Head>
        <title>CODAI Hub - Service Orchestration Dashboard</title>
        <meta name="description" content="CODAI Hub service orchestration and integration platform for managing all ecosystem services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header role="banner" className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  CODAI Hub
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Service orchestration and integration platform
                </p>
              </div>

              {/* Status overview */}
              <div className="flex items-center space-x-4">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  role="status"
                  aria-live="polite"
                  aria-label={`${activeServices} of ${totalServices} services active`}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></span>
                  {activeServices}/{totalServices} Services Active
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Refresh service status"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" role="main" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Loading state */}
          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              aria-label="Loading service status"
              className="flex items-center justify-center py-8"
            >
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600 dark:text-gray-300">Loading service status...</span>
            </div>
          )}

          {/* Service grid */}
          {!isLoading && (
            <section aria-labelledby="services-heading">
              <h2 id="services-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Service Status Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <article
                    key={service.name}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    data-testid={`${service.name.toLowerCase().replace(/\s+/g, '-')}-service-card`}
                  >
                    <div className="p-6">
                      <header className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {service.description}
                        </p>
                      </header>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Port:</span>
                          <span className="text-sm font-mono text-gray-900 dark:text-white">{service.port}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${service.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : service.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            role="status"
                            aria-label={`${service.name} status is ${service.status}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1 ${service.status === 'active' ? 'bg-green-500' :
                                  service.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
                                }`}
                              aria-hidden="true"
                            ></span>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
                          aria-label={`Open ${service.name} in new tab`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Access Service
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Last update info */}
          {!isLoading && lastUpdate && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: <time dateTime={lastUpdate}>{lastUpdate}</time>
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer role="contentinfo" className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              CODAI Hub v1.0.0 - Service orchestration and integration platform
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}