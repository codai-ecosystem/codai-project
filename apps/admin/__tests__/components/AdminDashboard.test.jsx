/**
 * 🧪 Admin Dashboard Component Tests
 * Testing main admin dashboard functionality
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../../src/components/AdminDashboard';

const mockDashboardData = {
  overview: {
    totalUsers: 1250,
    activeProjects: 320,
    systemHealth: 98.5,
    recentAlerts: 3
  },
  recentActivity: [
    { id: 1, user: 'john.doe@codai.com', action: 'Created project', timestamp: '2025-01-21T10:30:00Z' },
    { id: 2, user: 'jane.smith@codai.com', action: 'Updated user profile', timestamp: '2025-01-21T10:25:00Z' },
    { id: 3, user: 'admin@codai.com', action: 'System maintenance', timestamp: '2025-01-21T09:45:00Z' }
  ],
  quickActions: [
    { id: 'create-user', label: 'Create User', icon: 'user-plus' },
    { id: 'system-backup', label: 'System Backup', icon: 'backup' },
    { id: 'send-announcement', label: 'Send Announcement', icon: 'megaphone' }
  ],
  systemMetrics: {
    cpu: 45.2,
    memory: 68.7,
    storage: 34.5,
    networkIO: 2.1
  }
};

// Mock services
jest.mock('../../src/services/dashboardService', () => ({
  getDashboardData: jest.fn().mockResolvedValue(mockDashboardData),
  performQuickAction: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../src/services/notificationService', () => ({
  getNotifications: jest.fn().mockResolvedValue([
    { id: 1, type: 'info', message: 'System backup completed', timestamp: '2025-01-21T08:00:00Z' }
  ]),
  markAsRead: jest.fn().mockResolvedValue({ success: true })
}));

// Mock router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with overview cards', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument(); // Total users
      expect(screen.getByText('320')).toBeInTheDocument(); // Active projects
      expect(screen.getByText('98.5%')).toBeInTheDocument(); // System health
      expect(screen.getByText('3')).toBeInTheDocument(); // Recent alerts
    });
  });

  test('displays recent activity feed', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('john.doe@codai.com')).toBeInTheDocument();
      expect(screen.getByText('Created project')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@codai.com')).toBeInTheDocument();
      expect(screen.getByText('Updated user profile')).toBeInTheDocument();
    });
  });

  test('shows quick action buttons', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument();
      expect(screen.getByText('System Backup')).toBeInTheDocument();
      expect(screen.getByText('Send Announcement')).toBeInTheDocument();
    });
  });

  test('executes quick actions', async () => {
    const dashboardService = require('../../src/services/dashboardService');
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('quick-action-create-user'));
    
    await waitFor(() => {
      expect(dashboardService.performQuickAction).toHaveBeenCalledWith('create-user');
    });
  });

  test('displays system metrics with visual indicators', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      const metricsSection = screen.getByTestId('system-metrics');
      expect(within(metricsSection).getByText('45.2%')).toBeInTheDocument(); // CPU
      expect(within(metricsSection).getByText('68.7%')).toBeInTheDocument(); // Memory
      expect(within(metricsSection).getByText('34.5%')).toBeInTheDocument(); // Storage
    });
  });

  test('refreshes dashboard data', async () => {
    const dashboardService = require('../../src/services/dashboardService');
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('refresh-dashboard-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('refresh-dashboard-btn'));
    
    await waitFor(() => {
      expect(dashboardService.getDashboardData).toHaveBeenCalledTimes(2);
    });
  });

  test('navigates to detailed views', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('view-all-users-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('view-all-users-btn'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
  });

  test('shows notifications panel', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('notifications-toggle'));
    
    await waitFor(() => {
      expect(screen.getByText('System backup completed')).toBeInTheDocument();
    });
  });

  test('marks notifications as read', async () => {
    const notificationService = require('../../src/services/notificationService');
    render(<AdminDashboard />);
    
    // Open notifications panel
    fireEvent.click(screen.getByTestId('notifications-toggle'));
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('mark-read-1'));
    
    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(1);
    });
  });

  test('filters activity by type', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('activity-filter')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByTestId('activity-filter'), {
      target: { value: 'user-actions' }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Created project')).toBeInTheDocument();
      expect(screen.getByText('Updated user profile')).toBeInTheDocument();
      expect(screen.queryByText('System maintenance')).not.toBeInTheDocument();
    });
  });

  test('shows system health alerts', async () => {
    const criticalData = {
      ...mockDashboardData,
      systemMetrics: { cpu: 95.5, memory: 89.2, storage: 85.0, networkIO: 8.5 }
    };
    
    jest.doMock('../../src/services/dashboardService', () => ({
      getDashboardData: jest.fn().mockResolvedValue(criticalData)
    }));
    
    const CriticalDashboard = require('../../src/components/AdminDashboard').default;
    render(<CriticalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('critical-alert-cpu')).toBeInTheDocument();
      expect(screen.getByTestId('critical-alert-memory')).toBeInTheDocument();
      expect(screen.getByTestId('critical-alert-storage')).toBeInTheDocument();
    });
  });

  test('exports dashboard data', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('export-data-btn')).toBeInTheDocument();
    });
    
    // Mock file download
    const createElementSpy = jest.spyOn(document, 'createElement');
    const mockAnchor = { click: jest.fn(), href: '', download: '' };
    createElementSpy.mockReturnValue(mockAnchor);
    
    fireEvent.click(screen.getByTestId('export-data-btn'));
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  test('handles loading state', () => {
    jest.doMock('../../src/services/dashboardService', () => ({
      getDashboardData: jest.fn().mockImplementation(() => new Promise(() => {}))
    }));
    
    const LoadingDashboard = require('../../src/components/AdminDashboard').default;
    render(<LoadingDashboard />);
    
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    jest.doMock('../../src/services/dashboardService', () => ({
      getDashboardData: jest.fn().mockRejectedValue(new Error('Failed to load dashboard'))
    }));
    
    const ErrorDashboard = require('../../src/components/AdminDashboard').default;
    render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load dashboard/i)).toBeInTheDocument();
    });
  });

  test('auto-refreshes data at intervals', async () => {
    const dashboardService = require('../../src/services/dashboardService');
    render(<AdminDashboard />);
    
    // Fast-forward time to trigger auto-refresh
    jest.advanceTimersByTime(60000); // 1 minute
    
    await waitFor(() => {
      expect(dashboardService.getDashboardData).toHaveBeenCalledTimes(2);
    });
  });

  test('responsive layout for mobile devices', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<AdminDashboard />);
    
    expect(screen.getByTestId('dashboard-container')).toHaveClass('mobile-layout');
  });

  test('keyboard navigation support', async () => {
    render(<AdminDashboard />);
    
    await waitFor(() => {
      const firstQuickAction = screen.getByTestId('quick-action-create-user');
      firstQuickAction.focus();
    });
    
    // Test Tab navigation
    fireEvent.keyDown(document.activeElement, { key: 'Tab' });
    
    expect(screen.getByTestId('quick-action-system-backup')).toHaveFocus();
  });
});
