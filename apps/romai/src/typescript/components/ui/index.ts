// UI Component Types for RomAI TypeScript Components

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'training' | 'idle' | 'error' | 'operational' | 'degraded' | 'down';
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number | string;
  trend?: 'up' | 'down' | 'stable' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  format?: 'percentage' | 'number' | 'currency';
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface AGIMetrics {
  trainingProgress: number;
  learningRate: number;
  accuracy: number;
  loss: number;
  epochs: number;
}

export interface CapabilityScores {
  reasoning: number;
  creativity: number;
  problemSolving: number;
  languageUnderstanding: number;
  multimodalProcessing: number;
}

export interface SafetyMetrics {
  alignmentScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  safetyChecks: {
    name: string;
    passed: boolean;
    score: number;
  }[];
}

export interface TrainingData {
  epoch: number;
  loss: number;
  accuracy: number;
  timestamp: Date;
}

// Re-export everything
export * from './components';
