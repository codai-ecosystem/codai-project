// Mock all 3D components to avoid canvas dependencies
import React from 'react';

const MockComponent = ({ children, ...props }) => (
  <div data-testid="mock-3d-component" {...props}>
    {children}
  </div>
);

export const HeroSection3D = MockComponent;
export const ProjectBentoGrid = MockComponent;
export const InteractiveNodes = MockComponent;
export const AnimatedBackground = MockComponent;
export const DynamicCursor = MockComponent;
export const ParticleSystem = MockComponent;
export const EcosystemVisualizer = MockComponent;
export const ConnectionMap = MockComponent;
export const ProjectCard3D = MockComponent;

export default MockComponent;