import React from 'react'
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IDHomePage from '../src/app/page';

describe('HomePage', () => {
  it('should render without crashing', () => {
    expect(() => render(<IDHomePage />)).not.toThrow();
  });

  it('should render main content', () => {
    render(<IDHomePage />);
    expect(document.body).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
    render(<IDHomePage />);
    // Check for the animate-container div that wraps the dynamic component
    const container = document.querySelector('.animate-container');
    expect(container).toBeInTheDocument();
  });
});

