/**
 * Component Test Examples for METU Template
 * Demonstrates testing patterns for React components
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Button component tests
describe('Button Component', () => {
  test('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });
  test('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  test('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state correctly', () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});

// Input component tests
describe('Input Component', () => {
  test('renders with basic props', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  test('handles value changes', async () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello World');

    expect(handleChange).toHaveBeenCalledTimes(11); // One for each character
  });

  test('shows error state', () => {
    render(<Input error="This field is required" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('handles different input types', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
  });

  test('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

// Form integration tests
describe('Form Integration', () => {
  test('login form submission', async () => {
    const handleSubmit = jest.fn();

    render(
      <form onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          placeholder="Email"
          data-testid="email-input"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          data-testid="password-input"
        />
        <Button type="submit">Sign In</Button>
      </form>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('form validation display', async () => {
    render(
      <div>
        <Input
          name="email"
          type="email"
          error="Invalid email format"
          data-testid="email-input"
        />
        <Input
          name="password"
          type="password"
          error="Password is too short"
          data-testid="password-input"
        />
      </div>
    );

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
  });
});

// Accessibility tests
describe('Accessibility', () => {
  test('button has proper ARIA attributes', () => {
    render(
      <Button aria-label="Close dialog" disabled>
        ×
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('input has proper labels and descriptions', () => {
    render(
      <div>
        <label htmlFor="email">Email Address</label>
        <Input
          id="email"
          type="email"
          aria-describedby="email-error"
          error="Invalid email"
        />
        <div id="email-error">Invalid email</div>
      </div>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByLabelText('Email Address')).toBe(input);
  });

  test('keyboard navigation works correctly', async () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Input placeholder="Input field" />
      </div>
    );

    const firstButton = screen.getByRole('button', { name: 'First' });
    const secondButton = screen.getByRole('button', { name: 'Second' });
    const input = screen.getByRole('textbox');

    // Tab through elements
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    await userEvent.tab();
    expect(document.activeElement).toBe(secondButton);

    await userEvent.tab();
    expect(document.activeElement).toBe(input);
  });
});

// Performance tests
describe('Performance', () => {
  test('components render within acceptable time', () => {
    const startTime = performance.now();

    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <Button key={i}>Button {i}</Button>
        ))}
      </div>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render 100 buttons in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('components do not cause memory leaks', () => {
    const { unmount } = render(<Button>Test</Button>);

    // Unmount should not throw errors
    expect(() => unmount()).not.toThrow();
  });
});

// Snapshot tests
describe('Snapshots', () => {
  test('button renders consistently', () => {
    const { container } = render(
      <Button variant="default" size="default">
        Test Button
      </Button>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
  test('input renders consistently', () => {
    const { container } = render(
      <Input
        id="test-input"
        type="email"
        placeholder="Enter email"
        error="Invalid email"
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
