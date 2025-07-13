import React from 'react';

function App() {
  console.log('🌐 METU Web App Loading!');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">METU Voice AI</h1>
        <p className="text-slate-300 mb-8">
          Intelligent Conversational Assistant - Next.js 14.2.25 Security Update Complete
        </p>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Security Status</h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Updated to Next.js 14.2.25 - Security vulnerabilities resolved</span>
          </div>
        </div>
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Phase 2 Configuration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Next.js Security Updates: Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>TypeScript Configuration: Fixed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Build Validation: In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
