import React from 'react';
import { MetuClientRouter } from './components/MetuClientRouter';
import './App.css';

/**
 * METU - Main Application Entry Point
 * 
 * This is the root component that uses the MetuClientRouter to intelligently
 * detect the platform/environment and load the appropriate client:
 * 
 * - Desktop: MetuDesktopClient (Electron with system integration)
 * - Mobile Web: MetuWebMobileClient (PWA with touch optimization)
 * - Web: Standard web interface
 * 
 * The router handles platform detection, capability assessment, and
 * automatic client selection for optimal user experience.
 */
export default function App() {
  return (
    <div className="metu-app">
      <MetuClientRouter />
    </div>
  );
}
