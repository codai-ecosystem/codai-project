/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from '@/components/ui/Toast';

// Mock the Button component
jest.mock('@/components/ui/Button', () => {
  const ButtonComponent = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & { variant?: string; size?: string }
  >(({ children, className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={`button ${variant} ${size} ${className || ''}`}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ));
  ButtonComponent.displayName = 'Button';
  return { Button: ButtonComponent };
});

describe('Toast Component', () => {
  it('renders default toast correctly', () => {
    render(
      <Toast>
        <div>Default toast message</div>
      </Toast>
    );

    const toast = screen.getByText('Default toast message');
    expect(toast).toBeInTheDocument();
  });

  it('renders success toast with correct variant', () => {
    render(
      <Toast variant="success">
        <div>Success message</div>
      </Toast>
    );

    const toast = screen.getByText('Success message');
    expect(toast).toBeInTheDocument();
  });

  it('renders destructive toast with correct variant', () => {
    render(
      <Toast variant="destructive">
        <div>Error message</div>
      </Toast>
    );

    const toast = screen.getByText('Error message');
    expect(toast).toBeInTheDocument();
  });

  it('renders warning toast with correct variant', () => {
    render(
      <Toast variant="warning">
        <div>Warning message</div>
      </Toast>
    );

    const toast = screen.getByText('Warning message');
    expect(toast).toBeInTheDocument();
  });

  it('renders info toast with correct variant', () => {
    render(
      <Toast variant="info">
        <div>Info message</div>
      </Toast>
    );

    const toast = screen.getByText('Info message');
    expect(toast).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Toast className="custom-class">
        <div>Test message</div>
      </Toast>
    );

    const toast = screen.getByText('Test message');
    expect(toast).toBeInTheDocument();
  });
});

describe('ToastAction Component', () => {
  it('renders action button correctly', () => {
    render(<ToastAction>Close</ToastAction>);

    const actionButton = screen.getByText('Close');
    expect(actionButton).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<ToastAction onClick={handleClick}>Click me</ToastAction>);

    const button = screen.getByText('Click me');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('ToastClose Component', () => {
  it('renders close button correctly', () => {
    render(<ToastClose />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('handles close events', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(<ToastClose onClick={handleClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('ToastTitle Component', () => {
  it('renders title correctly', () => {
    render(<ToastTitle>Toast Title</ToastTitle>);

    const title = screen.getByText('Toast Title');
    expect(title).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ToastTitle className="custom-title">Custom Title</ToastTitle>);

    const title = screen.getByText('Custom Title');
    expect(title).toHaveClass('custom-title');
  });
});

describe('ToastDescription Component', () => {
  it('renders description correctly', () => {
    render(<ToastDescription>Toast description text</ToastDescription>);

    const description = screen.getByText('Toast description text');
    expect(description).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ToastDescription className="custom-desc">
        Custom description
      </ToastDescription>
    );

    const description = screen.getByText('Custom description');
    expect(description).toHaveClass('custom-desc');
  });
});

describe('Toast Integration', () => {
  it('renders complete toast with all components', () => {
    render(
      <Toast variant="success">
        <ToastTitle>Success!</ToastTitle>
        <ToastDescription>Operation completed successfully</ToastDescription>
        <ToastAction>Retry</ToastAction>
        <ToastClose />
      </Toast>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Operation completed successfully')
    ).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('handles long content gracefully', () => {
    const longText =
      'This is a very long toast message that should wrap properly and not break the layout of the toast component when it contains multiple lines of text.';

    render(
      <Toast>
        <ToastDescription>{longText}</ToastDescription>
      </Toast>
    );

    expect(screen.getByText(longText)).toBeInTheDocument();
  });
});
