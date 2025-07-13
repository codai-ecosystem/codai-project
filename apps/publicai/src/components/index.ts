// Barrel exports for all components
// This allows for cleaner imports like: import { Button, Card } from '@/components'

// UI Components
export * from './ui';

// Layout Components
export { Header } from './layout/Header';
export { Footer } from './layout/Footer';
export { Layout } from './layout/Layout';
export { Section } from './layout/Section';

// Theme Components
export { ThemeToggle } from './theme/ThemeToggle';

// PWA Components
export { PWAInstaller } from './pwa/PWAInstaller';

// Examples
export { FileUploader } from './examples/FileUploader';
export { UserTable } from './examples/UserTable';

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';
