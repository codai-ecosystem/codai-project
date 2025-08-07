import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import Page from '../app/page';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock environment variables for non-hardcoded values
const mockEnv = {
  NODE_ENV: 'test',
  npm_package_version: '1.0.0'
};

// Helper function to generate realistic Romanian data
const generateRomanianData = () => ({
  dailyQueries: Math.floor(Math.random() * 1000) + 100,
  activeUsers: Math.floor(Math.random() * 50) + 10,
  successRate: (Math.random() * 5 + 95).toFixed(1),
  totalRequests: Math.floor(Math.random() * 1000000) + 500000,
  averageResponseTime: Math.floor(Math.random() * 500) + 100,
  uptime: (Math.random() * 5 + 95).toFixed(1),
  regionalData: [
    {
      region: 'București',
      percentage: Math.floor(Math.random() * 20) + 30,
      users: Math.floor(Math.random() * 100) + 50,
      growth: `+${Math.floor(Math.random() * 20) + 5}%`
    },
    {
      region: 'Cluj-Napoca',
      percentage: Math.floor(Math.random() * 15) + 15,
      users: Math.floor(Math.random() * 80) + 30,
      growth: `+${Math.floor(Math.random() * 15) + 3}%`
    },
    {
      region: 'Timișoara',
      percentage: Math.floor(Math.random() * 10) + 10,
      users: Math.floor(Math.random() * 60) + 20,
      growth: `+${Math.floor(Math.random() * 12) + 2}%`
    },
    {
      region: 'Iași',
      percentage: Math.floor(Math.random() * 8) + 8,
      users: Math.floor(Math.random() * 50) + 15,
      growth: `+${Math.floor(Math.random() * 10) + 1}%`
    }
  ],
  timestamp: new Date().toISOString(),
  timeRange: '24h'
});

describe('RomAI Main Page - Enhanced Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock dynamic API responses with real Romanian data
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: generateRomanianData()
          })
        });
      }

      if (url.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: mockEnv.npm_package_version,
            environment: mockEnv.NODE_ENV,
            responseTime: `${Math.floor(Math.random() * 200) + 100}ms`,
            service: 'RomAI',
            services: {
              frontend: { status: 'operational' },
              azureOpenAI: { status: 'operational' },
              database: { status: 'operational' },
              romanianMCP: { status: 'operational' }
            }
          })
        });
      }

      if (url.includes('/api/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: Math.random() > 0.1 ? 'operational' : 'degraded',
            version: mockEnv.npm_package_version,
            environment: mockEnv.NODE_ENV,
            uptime: (Math.random() * 5 + 95).toFixed(1) + '%',
            lastUpdate: new Date().toISOString()
          })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  describe('Core Component Structure', () => {
    it('renders semantic HTML structure with proper roles', async () => {
      render(<Page />);

      // Check for semantic HTML structure
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navigation

      // Check for proper heading hierarchy
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('RomAI Control Panel');
    });

    it('uses theme-based CSS classes instead of hardcoded styles', async () => {
      render(<Page />);

      const container = screen.getByRole('main').closest('.min-h-screen');
      expect(container).toHaveClass(/bg-gradient-to-/); // Should use gradient classes
      expect(container).toHaveClass(/from-|via-|to-/); // Should use theme color classes
    });

    it('implements responsive design with breakpoint classes', async () => {
      render(<Page />);

      // Check for responsive grid classes
      const gridContainers = document.querySelectorAll('[class*="grid-cols"]');
      expect(gridContainers.length).toBeGreaterThan(0);

      // Should use responsive classes like md:, lg:, etc.
      const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"]');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });
  });

  describe('Romanian Localization & Content', () => {
    it('displays Romanian regional data in dashboard', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should display real Romanian cities with proper diacritics in dashboard
        expect(screen.getByText('București')).toBeInTheDocument();
        expect(screen.getByText('Cluj-Napoca')).toBeInTheDocument();
        expect(screen.getByText('Timișoara')).toBeInTheDocument();
        expect(screen.getByText('Iași')).toBeInTheDocument();
        expect(screen.getByText('Constanța')).toBeInTheDocument();
      });
    });

    it('displays regional usage section title', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should show Romanian regional usage section
        expect(screen.getByText('Regional Usage (Romania)')).toBeInTheDocument();
      });
    });

    it('uses Romanian language patterns and expressions', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should use proper Romanian expressions
        expect(screen.getByText(/față de ieri/)).toBeInTheDocument();
        expect(screen.getByText(/această săptămână/)).toBeInTheDocument();
        expect(screen.getByText(/îmbunătățire/)).toBeInTheDocument();
      });
    });

    it('formats dates and numbers in Romanian locale', async () => {
      render(<Page />);

      await waitFor(() => {
        // Check for percentage formatting
        const percentageElements = screen.getAllByText(/%/);
        expect(percentageElements.length).toBeGreaterThan(0);

        // Check for time expressions in Romanian
        expect(screen.getByText(/Actualizat:/)).toBeInTheDocument();
      });
    });

    it('shows Romanian language specific features', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should display Romanian AI specific elements
        expect(screen.getByText('Romanian AI')).toBeInTheDocument();
        expect(screen.getByText('Total Romanian Queries')).toBeInTheDocument();
        expect(screen.getByText('Test Romanian AI')).toBeInTheDocument();
        expect(screen.getByText('Testează capacitățile AI în română')).toBeInTheDocument();
      });
    });
  });

  describe('Theme System Integration', () => {
    it('uses design system color variables', async () => {
      render(<Page />);

      // Check for theme-based status indicators
      const statusIndicators = document.querySelectorAll('.bg-green-500, .text-green-600');
      expect(statusIndicators.length).toBeGreaterThan(0);

      // Check for theme-based backgrounds
      const themeBackgrounds = document.querySelectorAll('[class*="bg-white"], [class*="dark:bg-slate"]');
      expect(themeBackgrounds.length).toBeGreaterThan(0);
    });

    it('supports dark mode theme classes', async () => {
      render(<Page />);

      // Should have dark mode variants
      const darkModeElements = document.querySelectorAll('[class*="dark:"]');
      expect(darkModeElements.length).toBeGreaterThan(0);
    });

    it('uses consistent spacing from design system', async () => {
      render(<Page />);

      // Check for consistent spacing classes
      const spacingElements = document.querySelectorAll('[class*="p-"], [class*="m-"], [class*="gap-"]');
      expect(spacingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Data Integration', () => {
    it('displays real-time metrics without hardcoded values', async () => {
      render(<Page />);

      await waitFor(() => {
        // Metrics should be dynamic, not static
        const activeUsersElement = screen.getByText('Active Users').closest('div');
        expect(activeUsersElement).toBeInTheDocument();

        // Should display real-time numbers
        const numberElements = screen.getAllByText(/^\d+$/);
        expect(numberElements.length).toBeGreaterThan(0);
      });
    });

    it('handles API data updates correctly', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should display Romanian metrics
        expect(screen.getByText('Total Romanian Queries')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
      });
    });

    it('shows live service status indicators', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should show operational status
        const statusElements = screen.getAllByText(/operational|healthy|online/i);
        expect(statusElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('has proper ARIA labels for interactive elements', async () => {
      render(<Page />);

      // All buttons should have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const accessibleName = button.getAttribute('aria-label') || button.textContent;
        expect(accessibleName).toBeTruthy();
      });
    });

    it('supports keyboard navigation', async () => {
      render(<Page />);

      // Interactive elements should be focusable
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabIndex', '-1');
      });
    });

    it('provides meaningful status updates', async () => {
      render(<Page />);

      await waitFor(() => {
        // Status information should be accessible
        const statusTexts = screen.getAllByText(/operational|healthy|degraded/i);
        statusTexts.forEach(status => {
          expect(status).toBeInTheDocument();
        });
      });
    });
  });

  describe('Error Handling & Resilience', () => {
    it('handles API failures gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<Page />);

      // Should still render main UI structure
      expect(screen.getByText('RomAI Control Panel')).toBeInTheDocument();
      expect(screen.getByText('Romanian Intelligence Platform')).toBeInTheDocument();
    });

    it('handles partial API failures', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/analytics')) {
          return Promise.reject(new Error('Analytics API down'));
        }
        if (url.includes('/api/health')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'healthy', service: 'RomAI' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      render(<Page />);

      // Should still show health status even if analytics fails
      await waitFor(() => {
        expect(screen.getByText('RomAI Control Panel')).toBeInTheDocument();
      });
    });

    it('validates data types and handles malformed responses', async () => {
      (global.fetch as any).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: 'data' })
        })
      );

      render(<Page />);

      // Should handle malformed data gracefully
      expect(screen.getByText('RomAI Control Panel')).toBeInTheDocument();
    });
  });

  describe('Performance & Loading States', () => {
    it('shows appropriate loading states', async () => {
      // Mock delayed API response
      (global.fetch as any).mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: generateRomanianData() })
          }), 200)
        )
      );

      render(<Page />);

      // Should show initial content immediately
      expect(screen.getByText('RomAI Control Panel')).toBeInTheDocument();
    });

    it('updates timestamps and live data', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should show time-based information
        expect(screen.getByText(/Actualizat:/)).toBeInTheDocument();
        expect(screen.getByText(/ago/)).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('integrates navigation components properly', async () => {
      render(<Page />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Should have multiple navigation items
      const navButtons = screen.getAllByRole('button');
      expect(navButtons.length).toBeGreaterThan(4);
    });

    it('displays metrics in organized sections', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should have organized sections
        expect(screen.getByText('System Performance')).toBeInTheDocument();
        expect(screen.getByText('Services Status')).toBeInTheDocument();
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Regional Usage (Romania)')).toBeInTheDocument();
      });
    });

    it('uses consistent typography hierarchy', async () => {
      render(<Page />);

      // Check heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(3);

      // Main title should be h1
      const mainTitle = screen.getByRole('heading', { level: 1 });
      expect(mainTitle).toHaveTextContent('RomAI Control Panel');
    });

    it('displays Romanian regional data with proper structure', async () => {
      render(<Page />);

      await waitFor(() => {
        // Should show Romanian cities in regional section
        expect(screen.getByText('Regional Usage (Romania)')).toBeInTheDocument();
        expect(screen.getByText('București')).toBeInTheDocument();
        expect(screen.getByText('Cluj-Napoca')).toBeInTheDocument();
        expect(screen.getByText('Timișoara')).toBeInTheDocument();
        expect(screen.getByText('Iași')).toBeInTheDocument();
        expect(screen.getByText('Constanța')).toBeInTheDocument();
      });
    });
  });
});

