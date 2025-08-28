/**
 * Core Components Integration Test
 * Tests that essential components render properly with React 18.3.1 and Next.js 15.5.0
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Dashboard from '../Dashboard';
import CodaiSSODemo from '../CodaiSSODemo';
import Counter from '../Counter';

// Mock framer-motion for Vitest
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Core Components Integration Tests', () => {
  describe('Dashboard Component', () => {
    test('renders without errors with empty projects', () => {
      const { container } = render(<Dashboard projects={[]} />);
      expect(container).toBeInTheDocument();
    });

    test('displays project statistics correctly', () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project 1',
          description: 'A test project',
          status: 'active' as const,
          progress: 75,
          members: 3,
          updatedAt: new Date('2025-08-28')
        },
        {
          id: '2', 
          name: 'Test Project 2',
          description: 'Another test project',
          status: 'completed' as const,
          progress: 100,
          members: 5,
          updatedAt: new Date('2025-08-27')
        }
      ];

      render(<Dashboard projects={mockProjects} />);
      
      // Check if projects are rendered (should show project names)
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });
  });

  describe('CodaiSSODemo Component', () => {
    test('renders loading state initially', () => {
      const { container } = render(<CodaiSSODemo />);
      expect(container).toBeInTheDocument();
      
      // Should show loading or login screen initially
      const loadingText = screen.queryByText(/initializing codai platform/i);
      const loginText = screen.queryByText(/sign in to codai platform/i);
      
      expect(loadingText || loginText).toBeTruthy();
    });
  });

  describe('Counter Component', () => {
    test('renders and handles interactions', () => {
      render(<Counter />);
      
      // Find counter display (should show 0 initially)
      expect(screen.getByText('0')).toBeInTheDocument();
      
      // Find and click increment button (+ symbol)
      const incrementButton = screen.getByRole('button', { name: /plus/i });
      fireEvent.click(incrementButton);
      
      // Counter should update to 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Component Error Boundaries', () => {
    test('components handle props gracefully', () => {
      // Test Dashboard with undefined props
      const { container: dashboardContainer } = render(<Dashboard />);
      expect(dashboardContainer).toBeInTheDocument();
      
      // Test Counter with various props
      const { container: counterContainer } = render(
        <Counter initialValue={5} min={0} max={10} />
      );
      expect(counterContainer).toBeInTheDocument();
    });
  });

  describe('React 18.3.1 Compatibility', () => {
    test('components render without React hook errors', () => {
      // This test specifically validates that React hooks work properly
      // Previous issues: "Cannot read properties of null (reading 'useState')"
      
      const TestWrapper = () => {
        const [count, setCount] = React.useState(0);
        
        React.useEffect(() => {
          setCount(1);
        }, []);
        
        return (
          <div>
            <Counter initialValue={count} />
            <div data-testid="hook-counter">{count}</div>
          </div>
        );
      };
      
      render(<TestWrapper />);
      
      // Verify React hooks are working
      expect(screen.getByTestId('hook-counter')).toHaveTextContent('1');
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});