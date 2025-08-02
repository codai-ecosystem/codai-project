import { Request } from 'express';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      responseBuilder: {
        success: (data: any) => any;
        error: (message: string, code?: number) => any;
        created: (data: any) => any;
        deleted: () => any;
      };
      user?: any;
      session?: any;
    }
  }
}

export interface AppStats {
  totalUsers: number
  activeNow: number
  performance: number
  uptime: number
  dataProcessed: number
  efficiency: number
  responseTime: number
  throughput: number
}

export interface FeatureData {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'inactive' | 'pending'
  progress: number
  color: string
}

export interface LiveMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  color: string
}