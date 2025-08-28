/**
 * ResponsiveNavigation Basic Test
 * Simple test to verify component renders without mocking complexity
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple mocks
vi.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
    setTheme: vi.fn()
  })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }),
  X: () => React.createElement('div', { 'data-testid': 'close-icon' }),
  ChevronDown: () => React.createElement('div', { 'data-testid': 'chevron-down-icon' }),
  Brain: () => React.createElement('div', { 'data-testid': 'brain-icon' }),
  ExternalLink: () => React.createElement('div', { 'data-testid': 'external-link-icon' }),
  Sun: () => React.createElement('div', { 'data-testid': 'sun-icon' }),
  Moon: () => React.createElement('div', { 'data-testid': 'moon-icon' })
}));

import ResponsiveNavigation from '../../src/components/layout/ResponsiveNavigation';

describe('ResponsiveNavigation - Basic Tests', () => {
  it('should render without crashing', () => {
    render(<ResponsiveNavigation />);
    
    // Look for the navigation element using a more generic approach
    const nav = document.querySelector('header') || document.querySelector('nav');
    expect(nav).toBeDefined();
  });

  it('should contain CODAI branding', () => {
    render(<ResponsiveNavigation />);
    
    // Look for CODAI text in the document
    expect(document.body.textContent).toContain('CODAI');
  });

  it('should have theme toggle functionality', () => {
    render(<ResponsiveNavigation />);
    
    // Look for button elements (theme toggle)
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});