/**
 * Components Index
 * Export all components for the CODAI coming soon experience
 */

// Pages
export { ComingSoonPage } from './pages/ComingSoonPage';

// Chapters
export * from './chapters';

// UI Components (explicit exports to avoid conflicts)
export { Button, Typography, Input, Loader } from './ui';
export { Card as UICard } from './ui'; // Renamed to avoid conflict with layout Card

// Layout Components  
export { Container, Section, Grid, FlexLayout, AspectRatio } from './layout';
export { Card as LayoutCard } from './layout'; // Renamed to avoid conflict with UI Card

// Scroll Components
export { ScrollProgress, ScrollSection, ScrollObserver } from './scroll';

// Interactive Components
// export { InteractiveElement } from './interactions';

// Types (using type-only exports)
export type * from './types';