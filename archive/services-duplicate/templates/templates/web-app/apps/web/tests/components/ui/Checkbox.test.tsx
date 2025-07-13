/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from '@/components/ui/Checkbox';

// Simplified mock for Radix UI Checkbox to prevent hanging
jest.mock('@radix-ui/react-checkbox', () => ({
  Root: ({ children, checked, onCheckedChange, ...props }: any) => (
    <button
      data-testid="checkbox-root"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {children}
    </button>
  ),
  Indicator: ({ children }: any) => (
    <span data-testid="checkbox-indicator">{children}</span>
  ),
}));

// Set short timeout for this test suite to prevent hanging
jest.setTimeout(5000);

describe('Checkbox Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render checkbox', async () => {
    render(<Checkbox />);

    expect(screen.getByTestId('checkbox-root')).toBeInTheDocument();
  });

  test('should handle checked state', async () => {
    const handleChange = jest.fn();

    render(<Checkbox checked={true} onCheckedChange={handleChange} />);

    const checkbox = screen.getByTestId('checkbox-root');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  test('should handle click interactions without hanging', async () => {
    const handleChange = jest.fn();

    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByTestId('checkbox-root');

    // Test click interaction with timeout to prevent hanging
    await Promise.race([
      user.click(checkbox),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Click interaction timed out')), 3000)
      ),
    ]);

    expect(handleChange).toHaveBeenCalled();
  });

  test('should apply custom className', async () => {
    render(<Checkbox className="custom-checkbox" />);

    expect(screen.getByTestId('checkbox-root')).toHaveClass('custom-checkbox');
  });
});
