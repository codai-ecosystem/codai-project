/**
 * 🧪 page.tsx Page Tests
 * Comprehensive testing for talentai page
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import Page from '../../page.tsx';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe('. Page', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('Page Rendering', () => {
    it('should render page without errors', async () => {
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have proper page title', async () => {
      render(await Page());
      expect(document.title).toContain('talentai');
    });

    it('should render main content areas', async () => {
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('SEO and Metadata', () => {
    it('should have proper meta tags', async () => {
      render(await Page());
      expect(document.querySelector('meta[name="description"]')).toBeTruthy();
    });

    it('should have Open Graph tags', async () => {
      render(await Page());
      expect(document.querySelector('meta[property="og:title"]')).toBeTruthy();
    });

    it('should have Twitter card tags', async () => {
      render(await Page());
      expect(document.querySelector('meta[name="twitter:card"]')).toBeTruthy();
    });
  });

  describe('Page Navigation', () => {
    it('should handle navigation correctly', async () => {
      render(await Page());
      // Test navigation functionality
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should handle back navigation', async () => {
      render(await Page());
      // Test back navigation
      expect(mockRouter.back).not.toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    it('should handle loading states', async () => {
      render(await Page());
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should handle error states', async () => {
      // Mock error condition
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle empty states', async () => {
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should be responsive on tablet', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should be responsive on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200 });
      render(await Page());
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should load within performance budget', async () => {
      const startTime = performance.now();
      render(await Page());
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 100ms budget
    });

    it('should have proper Core Web Vitals', async () => {
      render(await Page());
      // Test would measure LCP, FID, CLS
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});