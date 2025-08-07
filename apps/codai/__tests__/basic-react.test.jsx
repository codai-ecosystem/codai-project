/**
 * 🧪 Very Basic React Testing - No Hooks
 * Testing just the test infrastructure
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component without hooks
const SimpleComponent = () => <div data-testid="simple-component">Hello World</div>;

describe('Basic React Testing', () => {
  test('renders simple component', () => {
    const { getByTestId } = render(<SimpleComponent />);
    expect(getByTestId('simple-component')).toBeInTheDocument();
  });

  test('renders with text content', () => {
    const { getByTestId } = render(<SimpleComponent />);
    expect(getByTestId('simple-component')).toHaveTextContent('Hello World');
  });
});
