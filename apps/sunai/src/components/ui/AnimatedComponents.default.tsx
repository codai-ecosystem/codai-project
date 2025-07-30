'use client';

// Re-export all components as default export for dynamic loading
export * from './AnimatedComponents';

// Also provide a default export for dynamic imports
import * as AnimatedComponentsModule from './AnimatedComponents';

const AnimatedComponentsWrapper = () => {
    return null; // This is just a wrapper, actual usage will import specific components
};

export default AnimatedComponentsWrapper;
