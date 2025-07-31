/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';

// Simplified mock for Radix UI Dialog components to prevent hanging
jest.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open }: any) => (
    <div data-testid="dialog-root" data-state={open ? 'open' : 'closed'}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: any) => (
    <div data-testid="dialog-portal">{children}</div>
  ),
  Overlay: ({ ...props }: any) => (
    <div data-testid="dialog-overlay" {...props} />
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  Close: ({ children, ...props }: any) => (
    <button data-testid="dialog-close" {...props}>
      {children}
    </button>
  ),
  Title: ({ children, ...props }: any) => (
    <h2 data-testid="dialog-title" {...props}>
      {children}
    </h2>
  ),
  Description: ({ children, ...props }: any) => (
    <p data-testid="dialog-description" {...props}>
      {children}
    </p>
  ),
}));

// Set short timeout for this test suite to prevent hanging
jest.setTimeout(5000);

describe('Dialog Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render dialog trigger', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  test('should render dialog content when provided', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>This is a test dialog</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
  });

  test('should handle interactions without hanging', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByTestId('dialog-trigger');

    // Test click interaction with timeout to prevent hanging
    await Promise.race([
      user.click(trigger),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Click interaction timed out')), 3000)
      ),
    ]);

    expect(trigger).toBeInTheDocument();
  });
});
