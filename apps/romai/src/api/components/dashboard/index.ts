/**
 * RomAI Dashboard Components - Barrel Exports
 * Microsoft React patterns with backward compatibility
 */

// Main consolidated component
export { default as TrainingDashboard } from './TrainingDashboard';

// Feature modules
export { default as AGIMetricsModule } from './AGIMetricsModule';
export { default as TrainingProgressModule } from './TrainingProgressModule';
export { default as IntelligenceTestModule } from './IntelligenceTestModule';

// Shared layout
export { default as DashboardLayout } from './DashboardLayout';

// Backward compatibility exports for existing imports
export { TrainingDashboard as RomAITrainingDashboard };
export { TrainingDashboard as AGITrainingDashboard };
export { TrainingDashboard as SimpleTrainingDashboard };
export { TrainingDashboard as RealAGITrainingDashboard };
export { TrainingDashboard as ArtificialGeneralIntelligenceTrainingDashboard };
export { TrainingDashboard as RealArtificialGeneralIntelligenceTrainingDashboard };

// Default export for convenience
export default TrainingDashboard;