/**
 * 🧪 Admin SystemStats Component Tests
 * Testing system statistics and monitoring dashboard
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemStats from '../../src/components/SystemStats';

const mockStats = {
  users: {
    total: 1250,
    active: 980,
    inactive: 270,
    growth: 12.5
  },
  projects: {
    total: 450,
    active: 320,
    completed: 130,
    growth: 8.3
  },
  system: {
    cpu: 45.2,
    memory: 68.7,
    disk: 34.5,
    uptime: 2547895
  },
  performance: {
    avgResponseTime: 125,
    successRate: 99.8,
    errorRate: 0.2,
    throughput: 1500
  }
};

// Mock services
jest.mock('../../src/services/statsService', () => ({
  getSystemStats: jest.fn().mockResolvedValue(mockStats),
  getHistoricalData: jest.fn().mockResolvedValue([
    { date: '2025-07-30', users: 1200, projects: 430 },
    { date: '2025-07-31', users: 1250, projects: 450 }
  ])
}));

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} />
  ),
  Bar: ({ data, options }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} />
  ),
  Doughnut: ({ data, options }) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)} />
  )
}));

describe('SystemStats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders system statistics correctly', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument(); // Total users
      expect(screen.getByText('450')).toBeInTheDocument(); // Total projects
      expect(screen.getByText('45.2%')).toBeInTheDocument(); // CPU usage
      expect(screen.getByText('68.7%')).toBeInTheDocument(); // Memory usage
    });
  });

  test('displays growth indicators', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      expect(screen.getByText('+12.5%')).toBeInTheDocument(); // User growth
      expect(screen.getByText('+8.3%')).toBeInTheDocument(); // Project growth
    });
  });

  test('shows performance metrics', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      expect(screen.getByText('125ms')).toBeInTheDocument(); // Avg response time
      expect(screen.getByText('99.8%')).toBeInTheDocument(); // Success rate
      expect(screen.getByText('1,500')).toBeInTheDocument(); // Throughput
    });
  });

  test('renders charts for data visualization', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  test('updates stats in real-time', async () => {
    const statsService = require('../../src/services/statsService');
    const { rerender } = render(<SystemStats />);
    
    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });
    
    // Mock updated stats
    const updatedStats = { ...mockStats, users: { ...mockStats.users, total: 1275 } };
    statsService.getSystemStats.mockResolvedValue(updatedStats);
    
    // Trigger refresh
    fireEvent.click(screen.getByTestId('refresh-stats-btn'));
    
    await waitFor(() => {
      expect(screen.getByText('1,275')).toBeInTheDocument();
    });
  });

  test('handles time range selection', async () => {
    const statsService = require('../../src/services/statsService');
    render(<SystemStats />);
    
    const timeRangeSelect = screen.getByTestId('time-range-select');
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } });
    
    await waitFor(() => {
      expect(statsService.getHistoricalData).toHaveBeenCalledWith('7d');
    });
  });

  test('displays system health indicators', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      // CPU health (< 50% is good)
      expect(screen.getByTestId('cpu-health')).toHaveClass('health-good');
      
      // Memory health (< 70% is good)
      expect(screen.getByTestId('memory-health')).toHaveClass('health-good');
      
      // Disk health (< 80% is good)
      expect(screen.getByTestId('disk-health')).toHaveClass('health-good');
    });
  });

  test('shows alerts for critical metrics', async () => {
    const criticalStats = {
      ...mockStats,
      system: { ...mockStats.system, cpu: 95.5, memory: 89.2 },
      performance: { ...mockStats.performance, errorRate: 5.2, successRate: 94.8 }
    };
    
    jest.doMock('../../src/services/statsService', () => ({
      getSystemStats: jest.fn().mockResolvedValue(criticalStats)
    }));
    
    const CriticalSystemStats = require('../../src/components/SystemStats').default;
    render(<CriticalSystemStats />);
    
    await waitFor(() => {
      expect(screen.getByTestId('cpu-alert')).toBeInTheDocument();
      expect(screen.getByTestId('memory-alert')).toBeInTheDocument();
      expect(screen.getByTestId('error-rate-alert')).toBeInTheDocument();
    });
  });

  test('exports stats data', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      expect(screen.getByTestId('export-stats-btn')).toBeInTheDocument();
    });
    
    // Mock file download
    const createElementSpy = jest.spyOn(document, 'createElement');
    const mockAnchor = { click: jest.fn(), href: '', download: '' };
    createElementSpy.mockReturnValue(mockAnchor);
    
    fireEvent.click(screen.getByTestId('export-stats-btn'));
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  test('handles loading state', () => {
    jest.doMock('../../src/services/statsService', () => ({
      getSystemStats: jest.fn().mockImplementation(() => new Promise(() => {}))
    }));
    
    const LoadingSystemStats = require('../../src/components/SystemStats').default;
    render(<LoadingSystemStats />);
    
    expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading system statistics/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    jest.doMock('../../src/services/statsService', () => ({
      getSystemStats: jest.fn().mockRejectedValue(new Error('Failed to load stats'))
    }));
    
    const ErrorSystemStats = require('../../src/components/SystemStats').default;
    render(<ErrorSystemStats />);
    
    await waitFor(() => {
      expect(screen.getByTestId('stats-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load stats/i)).toBeInTheDocument();
    });
  });

  test('auto-refreshes data periodically', async () => {
    const statsService = require('../../src/services/statsService');
    render(<SystemStats />);
    
    // Fast-forward time to trigger auto-refresh
    jest.advanceTimersByTime(30000); // 30 seconds
    
    await waitFor(() => {
      expect(statsService.getSystemStats).toHaveBeenCalledTimes(2);
    });
  });

  test('responsive design for mobile view', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<SystemStats />);
    
    expect(screen.getByTestId('stats-container')).toHaveClass('mobile-layout');
  });

  test('calculates uptime display correctly', async () => {
    render(<SystemStats />);
    
    await waitFor(() => {
      // 2547895 seconds = approximately 29 days, 11 hours, 51 minutes
      expect(screen.getByText(/29d 11h 51m/)).toBeInTheDocument();
    });
  });
});
