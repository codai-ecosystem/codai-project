'use client'

import React from 'react';

import { useEffect, useState } from 'react';

interface ApiStatus {
  status: 'checking' | 'connected' | 'error';
  message: string;
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    status: 'checking',
    message: 'Checking API connection...'
  });

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('https://api.memorai.ro/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          setApiStatus({
            status: 'connected',
            message: 'MemorAI MCP Server connected successfully!'
          });
        } else {
          setApiStatus({
            status: 'error',
            message: `API returned status: ${response.status}`
          });
        }
      } catch (error) {
        setApiStatus({
          status: 'error',
          message: 'Failed to connect to MemorAI MCP Server'
        });
      }
    };

    checkApiConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            MemorAI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            AI-Powered Memory & Knowledge Management Platform
          </p>

          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Backend API Status
            </h2>
            <div className={`flex items-center justify-center p-4 rounded-lg ${apiStatus.status === 'connected'
                ? 'bg-green-100 border border-green-300 text-green-800'
                : apiStatus.status === 'error'
                  ? 'bg-red-100 border border-red-300 text-red-800'
                  : 'bg-yellow-100 border border-yellow-300 text-yellow-800'
              }`}>
              <div className={`w-3 h-3 rounded-full mr-3 ${apiStatus.status === 'connected'
                  ? 'bg-green-500'
                  : apiStatus.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`}></div>
              <span className="font-medium">{apiStatus.message}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Memory Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Store, organize, and retrieve information with AI-powered search and categorization.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                MCP Protocol
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Model Context Protocol integration for seamless AI agent communication.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Knowledge Graph
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build intelligent connections between concepts and data points.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Access Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

