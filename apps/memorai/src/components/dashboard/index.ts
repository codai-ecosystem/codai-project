/**
 * Dashboard Components Index
 * Barrel exports for consolidated MemorAI dashboard components following Microsoft patterns
 */

// Main dashboard component
export { default as MemoryDashboard } from './MemoryDashboard';

// Feature modules
export { default as DashboardLayout } from './DashboardLayout';
export { default as MemoryAnalytics } from './MemoryAnalytics';
export { default as AIInsights } from './AIInsights';
export { default as MemoryManagement } from './MemoryManagement';

// Backward compatibility - export main dashboard as default for existing imports
export { default } from './MemoryDashboard';