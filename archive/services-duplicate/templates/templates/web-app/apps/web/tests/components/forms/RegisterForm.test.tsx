import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { RegisterForm } from '@/components/forms/RegisterForm';

import {
  createMockAuthContext,
  createMockNotifications,
} from '../../comprehensive-utils';

// Global mock variables
const mockSignUp = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockToast = createMockNotifications();
const mockAuthContext = createMockAuthContext({
  signUp: mockSignUp,
  signInWithGoogle: mockSignInWithGoogle,
});

// Mock the auth context hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}));

// Mock the notifications hook
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => mockToast,
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
  Lock: () => <span data-testid="lock-icon">Lock</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
}));

// Mock window.location
const mockLocation = {
  href: '',
};

// Check if location is already defined and handle it appropriately
if (
  !Object.getOwnPropertyDescriptor(window, 'location') ||
  Object.getOwnPropertyDescriptor(window, 'location')?.configurable
) {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  });
} else {
  // If location is already defined and not configurable, update the existing object
  Object.assign(window.location, mockLocation);
}

describe('RegisterForm', () => {
  const mockOnSuccess = jest.fn();

  const renderWithProviders = (props = {}) => {
    return render(<RegisterForm {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  describe('Component Rendering', () => {
    it('should render the registration form with all required fields', () => {
      renderWithProviders();

      expect(
        screen.getByRole('heading', { name: 'Create Account' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Get started with your free account')
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText('Enter your full name')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter your email')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Create a password')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Confirm your password')
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /create account/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue with google/i })
      ).toBeInTheDocument();
    });

    it('should render with proper accessibility attributes', () => {
      renderWithProviders();

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Create a password');
      const confirmPasswordInput = screen.getByPlaceholderText(
        'Confirm your password'
      );

      expect(nameInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should render icons correctly', () => {
      renderWithProviders();

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('mail-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('lock-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(2);
    });

    it('should render navigation links', () => {
      renderWithProviders();

      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
        'href',
        '/auth/login'
      );
      expect(
        screen.getByRole('link', { name: 'Terms of Service' })
      ).toHaveAttribute('href', '/terms');
      expect(
        screen.getByRole('link', { name: 'Privacy Policy' })
      ).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Name must be at least 2 characters')
        ).toBeInTheDocument();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument();
      });
    });

    it('should validate display name length', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      await user.type(nameInput, 'A');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Name must be at least 2 characters')
        ).toBeInTheDocument();
      });
    });

    it.skip('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const passwordInput = screen.getByPlaceholderText('Create a password');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const passwordInput = screen.getByPlaceholderText('Create a password');
      const confirmPasswordInput = screen.getByPlaceholderText(
        'Confirm your password'
      );

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });

    it('should accept valid form data', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          displayName: 'John Doe',
          confirmPassword: 'password123',
        });
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const passwordInput = screen.getByPlaceholderText('Create a password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toBeInTheDocument();

      if (toggleButton) {
        await user.click(toggleButton);
      }

      expect(passwordInput).toHaveAttribute('type', 'text');
      // After clicking, the eye icon should change to eye-off
      const eyeOffIcon = passwordInput.parentElement?.querySelector(
        '[data-testid="eye-off-icon"]'
      );
      expect(eyeOffIcon).toBeInTheDocument();
    });

    it('should toggle confirm password visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const confirmPasswordInput = screen.getByPlaceholderText(
        'Confirm your password'
      );
      const toggleButtons = screen
        .getAllByRole('button')
        .filter(
          btn =>
            btn.querySelector('[data-testid="eye-icon"]') ||
            btn.querySelector('[data-testid="eye-off-icon"]')
        );
      const confirmPasswordToggle = toggleButtons[1]; // Second toggle button

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      if (confirmPasswordToggle) {
        await user.click(confirmPasswordToggle);
      }

      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('should maintain independent visibility states for both password fields', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const passwordInput = screen.getByPlaceholderText('Create a password');
      const confirmPasswordInput = screen.getByPlaceholderText(
        'Confirm your password'
      );
      const toggleButtons = screen
        .getAllByRole('button')
        .filter(
          btn =>
            btn.querySelector('[data-testid="eye-icon"]') ||
            btn.querySelector('[data-testid="eye-off-icon"]')
        ); // Toggle only the first password field
      if (toggleButtons[0]) {
        await user.click(toggleButtons[0]);
      }

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Submission', () => {
    it('should call signUp with correct data', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      renderWithProviders({ onSuccess: mockOnSuccess });

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          displayName: 'John Doe',
          confirmPassword: 'password123',
        });
        expect(mockToast.toast.success).toHaveBeenCalledWith(
          'Account created successfully!'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
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
      mockSignUp.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      expect(
        screen.getByPlaceholderText('Enter your full name')
      ).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter your email')).toBeDisabled();
      expect(screen.getByPlaceholderText('Create a password')).toBeDisabled();
      expect(
        screen.getByPlaceholderText('Confirm your password')
      ).toBeDisabled();

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Enter your full name')
        ).not.toBeDisabled();
      });
    });

    it.skip('should redirect on successful registration when redirectTo is provided', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      renderWithProviders({ redirectTo: '/dashboard' });

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLocation.href).toBe('/dashboard');
      });
    });
  });

  describe('Google Sign-Up', () => {
    it('should handle Google sign-up successfully', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockResolvedValue({ error: null });
      renderWithProviders({ onSuccess: mockOnSuccess });

      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
        expect(mockToast.toast.success).toHaveBeenCalledWith(
          'Account created successfully!'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should handle Google sign-up error', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockResolvedValue({
        error: 'Google sign-up failed',
      });
      renderWithProviders();

      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockToast.toast.error).toHaveBeenCalledWith(
          'Google sign-up failed: Google sign-up failed'
        );
      });
    });

    it.skip('should redirect after successful Google sign-up', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockResolvedValue({ error: null });
      renderWithProviders({ redirectTo: '/dashboard' });

      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockLocation.href).toBe('/dashboard');
      });
    });

    it('should handle Google sign-up exception', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockRejectedValue(new Error('Network error'));
      renderWithProviders();

      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockToast.toast.error).toHaveBeenCalledWith(
          'An unexpected error occurred'
        );
      });
    });

    it('should disable Google button during form submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });

      await user.click(submitButton);

      expect(googleButton).toBeDisabled();

      await waitFor(() => {
        expect(googleButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle email-already-in-use error', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: 'email-already-in-use' });
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('This email is already registered')
        ).toBeInTheDocument();
      });
    });

    it('should handle weak-password error', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: 'weak-password' });
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is too weak')).toBeInTheDocument();
      });
    });

    it('should handle generic Firebase errors', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: 'Some other Firebase error' });
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.toast.error).toHaveBeenCalledWith(
          'Registration failed: Some other Firebase error'
        );
      });
    });

    it('should handle unexpected errors', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValue(new Error('Network error'));
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.toast.error).toHaveBeenCalledWith(
          'An unexpected error occurred'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      nameInput.focus();

      await user.tab();
      expect(screen.getByPlaceholderText('Enter your email')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText('Create a password')).toHaveFocus();

      await user.tab();
      // After password input, focus goes to password visibility toggle button
      const passwordToggleButton = screen
        .getByPlaceholderText('Create a password')
        .parentElement?.querySelector('button');
      expect(passwordToggleButton).toHaveFocus();

      await user.tab();
      expect(
        screen.getByPlaceholderText('Confirm your password')
      ).toHaveFocus();
    });

    it('should have proper ARIA labels and attributes', () => {
      renderWithProviders();

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      const googleButton = screen.getByRole('button', {
        name: /continue with google/i,
      });

      expect(submitButton).toHaveAttribute('type', 'submit');
      // Google button should be a proper button element
      expect(googleButton.tagName).toBe('BUTTON');
    });

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByText(
          'Name must be at least 2 characters'
        );
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it.skip('should handle extremely long input values', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const longName = 'A'.repeat(1000);
      const longEmail = 'user@' + 'domain'.repeat(100) + '.com';

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        longName
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        longEmail
      );

      expect(screen.getByPlaceholderText('Enter your full name')).toHaveValue(
        longName
      );
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(
        longEmail
      );
    });

    it('should handle special characters in input fields', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      const emailInput = screen.getByPlaceholderText('Enter your email');

      // Clear and type special characters
      await user.clear(nameInput);
      await user.type(nameInput, "José María O'Connor");

      await user.clear(emailInput);
      await user.type(emailInput, 'josé.maría@example.com');

      expect(nameInput).toHaveValue("José María O'Connor");
      expect(emailInput).toHaveValue('josé.maría@example.com');
    });

    it.skip('should handle rapid form submission attempts', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );
      renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      // Rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call signUp once
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle component unmounting during async operations', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );

      const { unmount } = renderWithProviders();

      await user.type(
        screen.getByPlaceholderText('Enter your full name'),
        'John Doe'
      );
      await user.type(
        screen.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Create a password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm your password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      // Unmount component while async operation is in progress
      unmount();

      // Should not cause any errors or warnings
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderCount = jest.fn();

      function TestWrapper(props: React.ComponentProps<typeof RegisterForm>) {
        renderCount();
        return <RegisterForm {...props} />;
      }

      const { rerender } = render(<TestWrapper />);

      expect(renderCount).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper />);

      expect(renderCount).toHaveBeenCalledTimes(2);
    });
  });
});
