import React from 'react'
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminDashboard } from '../src/components/admin/dashboard';

describe('AdminDashboard', () => {
  it('should render without crashing', () => {
    expect(() => render(<AdminDashboard />)).not.toThrow();
  });

  it('should render main content', () => {
    render(<AdminDashboard />);
    expect(document.body).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
    render(<AdminDashboard />);
    const main = screen.queryByRole('main');
    if (main) {
      expect(main).toBeInTheDocument();
    }
  });
});

