/**
 * Hub Dashboard Components - Barrel Exports
 * Microsoft React patterns with backward compatibility
 */

// Main consolidated component
export { default as HubDashboard } from './HubDashboard';

// Feature modules
export { default as ServiceMonitorModule } from './ServiceMonitorModule';
export { default as NetworkTopologyModule } from './NetworkTopologyModule';
export { default as GestureControlsModule } from './GestureControlsModule';

// Shared layout
export { default as DashboardLayout } from './DashboardLayout';

// Backward compatibility exports for existing imports
export { HubDashboard as BasicHubDashboard };
export { HubDashboard as EnhancedHubDashboard };
export { HubDashboard as GestureEnabledHubDashboard };
export { HubDashboard as EnhancedHubDashboardSimple };
export { HubDashboard as GestureEnhancedHubDashboard };

// Default export for convenience
export default HubDashboard;