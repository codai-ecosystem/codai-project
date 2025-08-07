/**
 * 🧪 Basic AIInsightsDashboard Component Tests
 * Testing basic rendering and structure
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIInsightsDashboard } from '../../components/AIInsightsDashboard';

describe('AIInsightsDashboard Basic Tests', () => {
  test('renders without crashing', () => {
    const { container } = render(<AIInsightsDashboard />);
    expect(container).toBeInTheDocument();
  });

  test('renders with minimum props', () => {
    render(<AIInsightsDashboard projectId="test-project" />);
    // Just test it doesn't crash with props
    expect(true).toBe(true);
  });
});
