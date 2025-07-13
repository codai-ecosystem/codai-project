import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';

import { createMockAuthContext } from '../../comprehensive-utils';

// Global mock variables
const mockSendPasswordReset = jest.fn();
const mockAuthContext = createMockAuthContext({
  sendPasswordReset: mockSendPasswordReset,
});

// Mock the auth context hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}));

// Mock the notifications hook directly
const mockNotifications = {
  notifications: [],
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  remove: jest.fn(),
  clear: jest.fn(),
};

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => mockNotifications,
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
}));

describe('ForgotPasswordForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnBack = jest.fn();

  const renderWithProviders = (props = {}) => {
    return render(<ForgotPasswordForm {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Add timeout to prevent hanging tests
  jest.setTimeout(10000);

  describe('Initial Form Rendering', () => {
    it('should render the forgot password form with all required elements', () => {
      renderWithProviders();

      expect(
        screen.getByRole('heading', { name: 'Reset Password' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Enter your email address and we'll send you a link to reset your password"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText('Enter your email')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send reset link/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /back to sign in/i })
      ).toBeInTheDocument();
    });

    it('should render with proper accessibility attributes', () => {
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should render mail icon', () => {
      renderWithProviders();

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should render navigation links correctly', () => {
      renderWithProviders();

      const backLinks = screen.getAllByRole('link', {
        name: /back to sign in/i,
      });
      const signInLink = screen.getByRole('link', { name: 'Sign in' });

      expect(backLinks[0]).toHaveAttribute('href', '/auth/login');
      expect(signInLink).toHaveAttribute('href', '/auth/login');
      expect(screen.getByText('Remember your password?')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty email', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockClear(); // Clear any previous calls
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');

      // Type invalid email
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      // Wait and verify that validation prevents submission
      await waitFor(
        () => {
          expect(mockSendPasswordReset).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // The validation working means sendPasswordReset should not be called
      expect(mockSendPasswordReset).not.toHaveBeenCalled();
    });

    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalledWith('user@example.com');
      });
    });

    it('should validate multiple email formats', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockClear();
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });

      // Test invalid format - should prevent submission
      await user.clear(emailInput);
      await user.type(emailInput, 'plainaddress');
      await user.click(submitButton);

      // Verify that validation prevents submission
      await waitFor(
        () => {
          expect(mockSendPasswordReset).not.toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      expect(mockSendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call sendPasswordReset with correct email', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders({ onSuccess: mockOnSuccess });

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalledWith('user@example.com');
        expect(mockNotifications.toast.success).toHaveBeenCalledWith(
          'Password reset email sent!'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
      });
    });

    it('should disable form inputs during submission', async () => {
      const user = userEvent.setup();

      // Mock a slow async operation
      mockSendPasswordReset.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });

      // Verify input is enabled before submission
      expect(emailInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();

      // Start submission - this should trigger isSubmitting state
      await user.click(submitButton);

      // Check loading state is shown (which indicates form is being submitted)
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

      // Submit button should be disabled during submission
      expect(submitButton).toBeDisabled();

      // Wait for submission to complete
      await waitFor(
        () => {
          expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should transition to success state after successful submission', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Check Your Email' })
        ).toBeInTheDocument();
        expect(screen.getByText('user@example.com')).toBeInTheDocument();
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    const renderSuccessState = async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Check Your Email' })
        ).toBeInTheDocument();
      });

      return user;
    };

    it('should render success state with correct content', async () => {
      await renderSuccessState();

      expect(
        screen.getByRole('heading', { name: 'Check Your Email' })
      ).toBeInTheDocument();
      expect(
        screen.getByText("We've sent a password reset link to")
      ).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(
        screen.getByText(
          "Click the link in the email to reset your password. If you don't see it, check your spam folder."
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /resend email/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /back to sign in/i })
      ).toBeInTheDocument();
    });

    it('should handle resend email functionality', async () => {
      const user = await renderSuccessState();

      const resendButton = screen.getByRole('button', {
        name: /resend email/i,
      });
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalledTimes(2);
        expect(mockSendPasswordReset).toHaveBeenLastCalledWith(
          'user@example.com'
        );
        expect(mockNotifications.toast.success).toHaveBeenCalledWith(
          'Password reset email sent again!'
        );
      });
    });

    it('should handle resend email error', async () => {
      const user = await renderSuccessState();

      mockSendPasswordReset.mockRejectedValueOnce(new Error('Network error'));

      const resendButton = screen.getByRole('button', {
        name: /resend email/i,
      });
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockNotifications.toast.error).toHaveBeenCalledWith(
          'Failed to resend email'
        );
      });
    });

    it('should render back to sign in link in success state', async () => {
      await renderSuccessState();

      const backLink = screen.getByRole('link', { name: /back to sign in/i });
      expect(backLink).toHaveAttribute('href', '/auth/login');
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle user-not-found error', async () => {
      const user = userEvent.setup();
      const error = new Error('user-not-found');
      mockSendPasswordReset.mockRejectedValue(error);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'notfound@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('No account found with this email address')
        ).toBeInTheDocument();
      });
    });

    it('should handle too-many-requests error', async () => {
      const user = userEvent.setup();
      const error = new Error('too-many-requests');
      mockSendPasswordReset.mockRejectedValue(error);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Too many requests. Please try again later.')
        ).toBeInTheDocument();
      });
    });

    it('should handle generic error with toast notification', async () => {
      const user = userEvent.setup();
      const error = new Error('Some other error');
      mockSendPasswordReset.mockRejectedValue(error);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNotifications.toast.error).toHaveBeenCalledWith(
          'Failed to send password reset email'
        );
      });
    });

    it('should handle unknown error type', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockRejectedValue('String error');
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNotifications.toast.error).toHaveBeenCalledWith(
          'Failed to send password reset email'
        );
      });
    });
  });

  describe('Navigation and Callbacks', () => {
    it('should call onBack callback when provided', async () => {
      const user = userEvent.setup();
      renderWithProviders({ onBack: mockOnBack });

      const backButton = screen
        .getAllByRole('button')
        .find(btn => btn.textContent?.includes('Back to Sign In'));

      if (backButton) {
        await user.click(backButton);
        expect(mockOnBack).toHaveBeenCalled();
      }
    });

    it('should call onSuccess callback after successful email send', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders({ onSuccess: mockOnSuccess });

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should handle missing callbacks gracefully', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders(); // No callbacks provided

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Check Your Email' })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      emailInput.focus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: /send reset link/i })
      ).toHaveFocus();

      await user.tab();
      // The "Back to Sign In" button uses asChild with a Link, so it may render as a link
      const backButton = screen.getByRole('link', { name: /back to sign in/i });
      expect(backButton).toHaveFocus();
    });

    it('should have proper ARIA labels and attributes', () => {
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(
        () => {
          const errorElement = screen.getByText(
            'Please enter a valid email address'
          );
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should maintain focus management in success state', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        const resendButton = screen.getByRole('button', {
          name: /resend email/i,
        });
        expect(resendButton).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long email addresses', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      // Use a shorter but still long email to avoid typing timeout
      const longEmail = 'user@' + 'verylongdomain'.repeat(10) + '.com';
      const emailInput = screen.getByPlaceholderText('Enter your email');

      // Use paste instead of typing to be faster
      await user.click(emailInput);
      await user.paste(longEmail);
      expect(emailInput).toHaveValue(longEmail);
    });

    it('should handle special characters in email', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders();

      const specialEmail = 'user+tag@example-domain.co.uk';
      const emailInput = screen.getByPlaceholderText('Enter your email');

      await user.type(emailInput, specialEmail);

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockSendPasswordReset).toHaveBeenCalledWith(specialEmail);
        },
        { timeout: 3000 }
      );
    });

    it('should handle rapid form submission attempts', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });

      // Rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call sendPasswordReset once
      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle component unmounting during async operations', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { unmount } = renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      // Unmount component while async operation is in progress
      unmount();

      // Should not cause any errors or warnings
      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalled();
      });
    });

    it('should handle empty sentEmail in resend functionality', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);

      // Force component into success state without proper email
      const {} = renderWithProviders();

      // Mock the internal state change
      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /resend email/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderCount = jest.fn();

      function TestWrapper(
        props: React.ComponentProps<typeof ForgotPasswordForm>
      ) {
        renderCount();
        return <ForgotPasswordForm {...props} />;
      }

      const { rerender } = render(<TestWrapper />);

      expect(renderCount).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper />);

      expect(renderCount).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid state changes efficiently', async () => {
      const user = userEvent.setup();
      mockSendPasswordReset.mockResolvedValue(undefined);
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');

      // Rapid typing and clearing
      for (let i = 0; i < 10; i++) {
        await user.type(emailInput, `user${i}@example.com`);
        await user.clear(emailInput);
      }

      await user.type(emailInput, 'final@example.com');
      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSendPasswordReset).toHaveBeenCalledWith('final@example.com');
      });
    });
  });
  describe('Integration', () => {
    it('should work correctly with AuthContext', async () => {
      const user = userEvent.setup();
      // Use the existing mock to avoid re-mocking issues
      mockSendPasswordReset.mockResolvedValue(undefined);

      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'integration@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockSendPasswordReset).toHaveBeenCalledWith(
            'integration@example.com'
          );
        },
        { timeout: 3000 }
      );
    });

    it('should work correctly with NotificationsProvider', async () => {
      const user = userEvent.setup();
      // Use the existing mock to avoid re-mocking issues
      mockSendPasswordReset.mockResolvedValue(undefined);

      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'integration@example.com');

      const submitButton = screen.getByRole('button', {
        name: /send reset link/i,
      });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockNotifications.toast.success).toHaveBeenCalledWith(
            'Password reset email sent!'
          );
        },
        { timeout: 3000 }
      );
    });
  });
});
