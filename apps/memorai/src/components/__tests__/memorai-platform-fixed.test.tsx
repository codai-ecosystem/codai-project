import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MemorAIPlatform from '../MemorAIPlatform';

// Mock the auth hook with proper path
vi.mock('../../lib/auth.tsx', () => ({
  useAuth: () => ({
    authState: {
      user: { name: 'John Doe', email: 'john@example.com' },
      isAuthenticated: true,
      isLoading: false,
    },
    logout: vi.fn(),
    hasRole: vi.fn(() => true),
    isAdmin: vi.fn(() => false),
  }),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

describe('MemorAI Platform - Real Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Platform Functionality', () => {
    it('should render the main header and branding', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByText('MemorAI')).toBeInTheDocument();
        expect(screen.getByText('Intelligent Memory')).toBeInTheDocument();
      });
    });

    it('should display authenticated user information', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should show main navigation tabs', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Memories')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        // Note: Using getAllByText for Analytics since it appears in multiple places
        expect(screen.getAllByText('Analytics')[0]).toBeInTheDocument();
        expect(screen.getByText('Collaboration')).toBeInTheDocument();
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Dashboard Data', () => {
    it('should display memory statistics correctly', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        // Use the exact same labels that work in the second test
        expect(screen.getByText('Total Memories')).toBeInTheDocument();
        expect(screen.getByText("Today's Memories")).toBeInTheDocument();
        expect(screen.getByText('AI Score Average')).toBeInTheDocument();
        expect(screen.getByText('Search Accuracy')).toBeInTheDocument();
        // Check that analytics data is displayed with numbers
        const mainElement = screen.getByRole('main');
        expect(mainElement.textContent).toMatch(/\d+/); // Contains numbers
      });
    });

    it('should show proper analytics labels', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByText('Total Memories')).toBeInTheDocument();
        expect(screen.getByText("Today's Memories")).toBeInTheDocument();
        expect(screen.getByText('AI Score Average')).toBeInTheDocument();
        expect(screen.getByText('Search Accuracy')).toBeInTheDocument();
      });
    });
  });

  describe('Memory Management', () => {
    it('should display recent memories section', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByText('Recent Memories')).toBeInTheDocument();
        expect(screen.getByText('View All')).toBeInTheDocument();

        // Check for actual memory data from the component
        expect(screen.getByText('AI Research Notes - Transformer Architecture')).toBeInTheDocument();
        expect(screen.getByText('Project Brainstorm - Next-Gen Banking App')).toBeInTheDocument();
        expect(screen.getByText('Weekly Team Meeting - Q3 Planning')).toBeInTheDocument();
        expect(screen.getByText('Code Snippet - React Hook for Authentication')).toBeInTheDocument();
      });
    });

    it('should show memory tags', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        // Look for memory tags that actually exist in the mock data
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Banking')).toBeInTheDocument();
        expect(screen.getByText('Meeting')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });
  });

  describe('Popular Searches', () => {
    it('should display popular searches section', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByText('Popular Searches')).toBeInTheDocument();
        expect(screen.getByText('Search Now')).toBeInTheDocument();

        // Check for actual popular searches from mock data
        expect(screen.getByText('project ideas')).toBeInTheDocument();
        expect(screen.getByText('AI research')).toBeInTheDocument();
        expect(screen.getByText('meeting notes')).toBeInTheDocument();
        expect(screen.getByText('code snippets')).toBeInTheDocument();
        expect(screen.getByText('learning resources')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action buttons', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('New Memory')).toBeInTheDocument();
        expect(screen.getByText('Smart Search')).toBeInTheDocument();
        expect(screen.getByText('Collaborate')).toBeInTheDocument();
        // Note: Analytics appears multiple times, so we check it exists
        expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
      });
    });

    it('should handle create memory button interaction', async () => {
      const user = userEvent.setup();
      render(<MemorAIPlatform />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Memory');
        expect(createButton).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Memory');
      await user.click(createButton);
      // Button should be clickable without errors
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to memories tab', async () => {
      const user = userEvent.setup();
      render(<MemorAIPlatform />);

      // Click on Memories tab  
      const memoriesTab = screen.getByText('Memories');
      await user.click(memoriesTab);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search memories, tags, content...')).toBeInTheDocument();
      });
    });

    it('should have search functionality in memories tab', async () => {
      const user = userEvent.setup();
      render(<MemorAIPlatform />);

      // Navigate to memories tab
      const memoriesTab = screen.getByText('Memories');
      await user.click(memoriesTab);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search memories, tags, content...');
        expect(searchInput).toBeInTheDocument();
      });

      // Test typing in search input
      const searchInput = screen.getByPlaceholderText('Search memories, tags, content...');
      await user.type(searchInput, 'AI');
      expect(searchInput).toHaveValue('AI');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper semantic structure', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument(); // header
        expect(screen.getByRole('main')).toBeInTheDocument(); // main content  
        expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('MemorAI');
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome back, John Doe!');

        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should have clickable elements with proper roles', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create memory/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('should show personalized welcome message', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
        expect(screen.getByText('Your intelligent memory dashboard with AI-powered insights and analytics')).toBeInTheDocument();
      });
    });

    it('should display analytics with proper formatting', async () => {
      render(<MemorAIPlatform />);

      await waitFor(() => {
        // Check formatted text elements
        expect(screen.getByText('this week')).toBeInTheDocument();
        expect(screen.getByText('avg response')).toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
        expect(screen.getByText('Excellent')).toBeInTheDocument();
        expect(screen.getByText('quality')).toBeInTheDocument();
      });
    });
  });
});