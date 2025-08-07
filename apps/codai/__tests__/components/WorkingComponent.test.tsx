/**
 * 🧪 WorkingComponent Test - Phase 2 Import Test
 * Testing if a new component file works with imports
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkingComponent from '../../src/components/WorkingComponent';

describe('WorkingComponent Test', () => {
  it('renders with title prop', () => {
    render(<WorkingComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(<WorkingComponent title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(<WorkingComponent title="Test" />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveClass('p-4');
  });
});
