import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Mock component for testing
const TestComponent = () => {
  return (
    <div>
      <h1>Welcome to hub</h1>
      <p>This is a test component</p>
    </div>
  );
};

describe('hub Components', () => {
  it('renders test component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Welcome to hub')).toBeInTheDocument();
  });

  it('renders test description', () => {
    render(<TestComponent />);
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });
});
