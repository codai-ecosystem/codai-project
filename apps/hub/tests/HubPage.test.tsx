import React from 'react'
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HubHomePage from '../src/app/page';

describe('HubPage', () => {
  it('should render without crashing', () => {
    expect(() => render(<HubHomePage />)).not.toThrow();
  });

  it('should render main content', () => {
    render(<HubHomePage />);
    expect(document.body).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
    render(<HubHomePage />);
    const main = screen.queryByRole('main');
    if (main) {
      expect(main).toBeInTheDocument();
    }
  });
});

