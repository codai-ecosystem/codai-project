/**
 * METU Mobile Client - Stub for Web Build
 * 
 * This is a stub component that prevents build errors when
 * the full React Native mobile client is not used in web builds.
 */

import React from 'react';

interface MetuMobileClientProps {
  // Stub props
}

const MetuMobileClient: React.FC<MetuMobileClientProps> = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">METU Mobile Client</h2>
        <p className="text-gray-600">
          This client is designed for React Native mobile environments.
          Use the Web or Desktop client for browser-based access.
        </p>
      </div>
    </div>
  );
};

export default MetuMobileClient;
