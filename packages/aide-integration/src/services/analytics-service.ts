import { z } from 'zod';

// Analytics service integration schema
export const AnalyticsEventSchema = z.object({
  eventType: z.enum(['project_created', 'project_published', 'user_action', 'error', 'performance']),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  data: z.record(z.unknown()).optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export interface AnalyticsService {
  track(event: AnalyticsEvent): Promise<void>;
  getUserMetrics(userId: string): Promise<UserMetrics>;
  getProjectMetrics(projectId: string): Promise<ProjectMetrics>;
  getDashboardData(timeRange?: TimeRange): Promise<DashboardData>;
}

export interface UserMetrics {
  projectsCreated: number;
  projectsPublished: number;
  totalActiveTime: number;
  lastActiveAt: Date;
}

export interface ProjectMetrics {
  views: number;
  deployments: number;
  collaborators: number;
  lastModified: Date;
}

export interface DashboardData {
  totalProjects: number;
  activeUsers: number;
  deploymentsToday: number;
  performanceMetrics: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export interface TimeRange {
  start: Date;
  end: Date;
}
