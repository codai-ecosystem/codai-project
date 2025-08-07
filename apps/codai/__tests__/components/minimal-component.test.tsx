/**
 * 🧪 Minimal Component Test - Debugging React Rendering Issue
 * Creating the simplest possible React component test to isolate the problem
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Define the minimal component inline
const MinimalComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>;
};

describe('Minimal Component Test', () => {
  it('renders minimal component', () => {
    render(<MinimalComponent text="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders div element', () => {
    const { container } = render(<MinimalComponent text="Test" />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Test');
  });
});
