/**
 * 🧪 TestComponent Simple Test - Phase 2 Fix
 * Simple test to get TestComponent working step by step
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestComponent from '../../src/components/TestComponent';

describe('TestComponent Simple Test', () => {
  it('renders with title prop', () => {
    render(<TestComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(<TestComponent title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(<TestComponent title="Test" />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveClass('p-4');
  });
});
