/**
 * React 19 Testing Compatibility Layer
 * Ensures React hooks work properly in the testing environment
 */

import React from 'react'

// Ensure React is globally available for hooks
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.React = React
  // @ts-ignore  
  globalThis.useState = React.useState
  // @ts-ignore
  globalThis.useEffect = React.useEffect
  // @ts-ignore
  globalThis.useCallback = React.useCallback
  // @ts-ignore
  globalThis.useMemo = React.useMemo
}

// Patch React for compatibility
export const patchReactForTesting = () => {
  // Ensure all React hooks are available on React object
  if (React && typeof React.useState === 'function') {
    // React is already properly loaded, no patching needed
    return
  }
  
  // If React hooks are missing, this indicates a version compatibility issue
  console.warn('React hooks compatibility issue detected. Attempting to patch...')
}

export default React