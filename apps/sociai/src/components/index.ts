// Barrel exports for all components
// This allows for cleaner imports like: import { Button, Card } from '@/components'

// UI Components
export * from './ui';

// Layout Components
export { Header } from './layout/Header';
export { Footer } from './layout/Footer';
export { Layout } from './layout/Layout';
export { Section } from './layout/Section';

// Form Components
export { LoginForm } from './forms/LoginForm';
export { RegisterForm } from './forms/RegisterForm';
export { ForgotPasswordForm } from './forms/ForgotPasswordForm';

// Auth Components - temporarily disabled due to missing auth setup
// export { AuthGuard } from './auth/AuthGuard';

// Theme Components
export { ThemeToggle } from './theme/ThemeToggle';

// I18n Components
export { LanguageSwitcher } from './i18n/LanguageSwitcher';

// PWA Components
export { PWAInstaller } from './pwa/PWAInstaller';

// Examples
export { FileUploader } from './examples/FileUploader';
export { UserTable } from './examples/UserTable';

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';
