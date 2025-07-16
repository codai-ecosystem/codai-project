/**
 * 🎯 AIDE Dashboard Component
 * Main dashboard interface for the AI Development Environment
 */

import React, { useState, useEffect } from 'react';

interface DashboardProps {
  title?: string;
  content?: string;
  data?: any[];
  onClick?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  title = "AIDE Dashboard", 
  content = "Welcome to AI Development Environment",
  data = [],
  onClick,
  onSubmit
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState('active');

  const handleButtonClick = () => {
    setState('clicked');
    if (onClick) {
      onClick();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitted');
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setState('enter-pressed');
    }
  };

  return (
    <main 
      role="main" 
      data-testid="dashboard"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
      aria-label="AIDE Dashboard"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600">
            {content}
          </p>
        </header>

        {/* Navigation */}
        <nav aria-label="Dashboard navigation" className="mb-6">
          <ul role="menubar" className="flex space-x-4">
            <li role="none">
              <a 
                href="#overview" 
                role="menuitem"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                tabIndex={0}
              >
                Overview
              </a>
            </li>
            <li role="none">
              <a 
                href="#projects" 
                role="menuitem"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                tabIndex={0}
              >
                Projects
              </a>
            </li>
          </ul>
        </nav>

        {/* Interactive Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Button Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <button
              onClick={handleButtonClick}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Primary action button"
            >
              Primary Action
            </button>
            <div data-testid="state-display" className="mt-2 text-sm text-gray-600">
              State: {state}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <form onSubmit={handleFormSubmit} role="form" aria-label="Dashboard settings">
              <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                Search Projects
              </label>
              <input
                id="search-input"
                type="text"
                role="textbox"
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter search terms..."
                aria-describedby="search-help"
              />
              <p id="search-help" className="text-xs text-gray-500 mt-1">
                Use keywords to find your projects
              </p>
              <button
                type="submit"
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Data Display */}
        {data && data.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Data Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.slice(0, 6).map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-200 rounded-lg"
                  role="article"
                >
                  <h3 className="font-medium text-gray-900">
                    Item {index + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {typeof item === 'object' ? JSON.stringify(item).substring(0, 50) + '...' : String(item)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Characters Display */}
        {content && content.includes('!@#$%^&*()_+-=[]{}|;:,.<>?') && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Special Content</h3>
            <p className="text-yellow-700">
              {content}
            </p>
          </div>
        )}

        {/* Accessibility Features */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Dashboard state updates will be announced here
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
