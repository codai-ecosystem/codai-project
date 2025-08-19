import React from 'react';
import { cn } from '../utils/cn';

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  totalCommits: number;
  weeklyCommits: number;
  totalLines: number;
  weeklyLines: number;
  totalPRs: number;
  openPRs: number;
  totalIssues: number;
  openIssues: number;
}

interface ProjectActivity {
  id: string;
  type: 'commit' | 'pr' | 'issue' | 'deployment' | 'build';
  project: string;
  title: string;
  author: string;
  timestamp: Date;
  status?: 'success' | 'pending' | 'failed';
  url?: string;
}

interface ProjectOverview {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  technology: string[];
  lastActivity: Date;
  health: 'healthy' | 'warning' | 'critical';
  metrics: {
    commits: number;
    contributors: number;
    stars: number;
    forks: number;
  };
}

interface ProjectDashboardProps {
  metrics: ProjectMetrics;
  recentActivity: ProjectActivity[];
  projects: ProjectOverview[];
  onProjectClick?: (project: ProjectOverview) => void;
  onActivityClick?: (activity: ProjectActivity) => void;
  className?: string;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  metrics,
  recentActivity,
  projects,
  onProjectClick,
  onActivityClick,
  className,
}) => {
  const getActivityIcon = (type: ProjectActivity['type']) => {
    switch (type) {
      case 'commit':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 10a2 2 0 114 0 2 2 0 01-4 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'pr':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'issue':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'deployment':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'build':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'warning':
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.activeProjects}
                <span className="text-sm text-gray-500 font-normal">/{metrics.totalProjects}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Weekly Commits</h3>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.weeklyCommits}
                <span className="text-sm text-gray-500 font-normal">/{metrics.totalCommits}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Lines Added</h3>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.weeklyLines.toLocaleString()}
                <span className="text-sm text-green-600 font-normal">+</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Open Issues</h3>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.openIssues}
                <span className="text-sm text-gray-500 font-normal">/{metrics.totalIssues}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500 mt-1">Latest updates across all projects</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => onActivityClick?.(activity)}
                    className={cn(
                      'flex items-start space-x-3 p-3 rounded-lg transition-colors',
                      onActivityClick && 'cursor-pointer hover:bg-gray-50'
                    )}
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </h4>
                        {activity.status && (
                          <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(activity.status))}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.project} • by {activity.author}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
              <p className="text-sm text-gray-500 mt-1">Active development projects</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onProjectClick?.(project)}
                    className={cn(
                      'p-4 border border-gray-200 rounded-lg transition-all',
                      onProjectClick && 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                      </div>
                      <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(project.health))}>
                        {project.health}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technology.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                      {project.technology.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{project.technology.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{project.metrics.commits} commits</span>
                      <span>{formatTimeAgo(project.lastActivity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProjectDashboard };
export type { ProjectDashboardProps, ProjectMetrics, ProjectActivity, ProjectOverview };
