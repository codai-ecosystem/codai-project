// Mock OptimizedParticleSystem to avoid canvas dependencies
import React from 'react';

const MockParticleSystem = ({ children, ...props }) => (
    <div data-testid="mock-particle-system" {...props}>
        {children}
    </div>
);

export default MockParticleSystem;