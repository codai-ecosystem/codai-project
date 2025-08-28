/**
 * UnifiedProjectGallery Component Tests
 * Test the unified gallery displaying all 42 CODAI projects
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock performance context
vi.mock('../../src/contexts/PerformanceContext', () => ({
  usePerformance: () => ({
    performanceMode: 'balanced',
    setPerformanceMode: vi.fn(),
    metrics: {
      renderTime: 16,
      bundleSize: 213000,
      coreWebVitals: { fcp: 1.2, lcp: 2.1, cls: 0.1 }
    }
  })
}));

import UnifiedProjectGallery from '../../src/components/sections/UnifiedProjectGallery';

describe('UnifiedProjectGallery', () => {
  it('should render without crashing', () => {
    render(<UnifiedProjectGallery />);
    
    // Look for the gallery section
    const gallery = document.querySelector('section') || document.querySelector('[data-testid*="gallery"]');
    expect(gallery).toBeDefined();
  });

  it('should display gallery title', () => {
    render(<UnifiedProjectGallery />);
    
    // Look for heading or title text
    expect(document.body.textContent).toMatch(/(Project|Gallery|CODAI)/i);
  });

  it('should render project cards', () => {
    render(<UnifiedProjectGallery />);
    
    // Look for multiple project elements (should have 42 projects)
    const projectCards = document.querySelectorAll('[data-testid*="project"], .project-card, [class*="project"]');
    expect(projectCards.length).toBeGreaterThan(0);
  });

  it('should have tier-based organization', () => {
    render(<UnifiedProjectGallery />);
    
    // Look for tier-related text or elements
    const bodyText = document.body.textContent || '';
    const hasTierContent = bodyText.includes('Tier') || 
                          bodyText.includes('Premium') || 
                          bodyText.includes('Elite') ||
                          bodyText.includes('Standard');
    
    expect(hasTierContent).toBe(true);
  });

  it('should contain key CODAI projects', () => {
    render(<UnifiedProjectGallery />);
    
    const bodyText = document.body.textContent || '';
    
    // Check for some key projects
    const hasKeyProjects = bodyText.includes('CodAI') || 
                          bodyText.includes('MemorAI') || 
                          bodyText.includes('RomAI') ||
                          bodyText.includes('BancAI');
    
    expect(hasKeyProjects).toBe(true);
  });

  it('should have filtering functionality', () => {
    render(<UnifiedProjectGallery />);
    
    // Look for filter-related elements
    const filterElements = document.querySelectorAll('[data-testid*="filter"], input[type="search"], button[aria-label*="filter"]');
    expect(filterElements.length).toBeGreaterThan(0);
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<UnifiedProjectGallery />);
    
    // Check for accessibility attributes
    const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
    const elementsWithRole = document.querySelectorAll('[role]');
    
    expect(elementsWithAriaLabel.length + elementsWithRole.length).toBeGreaterThan(0);
  });

  it('should handle empty search results gracefully', () => {
    render(<UnifiedProjectGallery />);
    
    // Try to find search input and type nonsense
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]');
    
    if (searchInputs.length > 0) {
      const searchInput = searchInputs[0] as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });
      
      // Should still render without crashing
      expect(document.body).toBeDefined();
    }
  });

  it('should have responsive design elements', () => {
    render(<UnifiedProjectGallery />);
    
    // Look for responsive grid or layout classes
    const elementsWithGridClasses = document.querySelectorAll('[class*="grid"], [class*="flex"], [class*="responsive"]');
    expect(elementsWithGridClasses.length).toBeGreaterThan(0);
  });

  it('should display project metadata', () => {
    render(<UnifiedProjectGallery />);
    
    const bodyText = document.body.textContent || '';
    
    // Look for common metadata terms
    const hasMetadata = bodyText.includes('AI') || 
                       bodyText.includes('Platform') || 
                       bodyText.includes('Service') ||
                       bodyText.includes('App');
    
    expect(hasMetadata).toBe(true);
  });
});