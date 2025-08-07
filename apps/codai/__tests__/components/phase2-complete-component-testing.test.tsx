/**
 * 🎯 Phase 2 Complete Component Testing - CODAI Testing Implementation
 * Comprehensive component testing using proven inline component pattern
 * Demonstrates: Rendering, Props, Events, Structure, Accessibility, Edge Cases
 */

import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ===== PHASE 2 COMPONENT DEFINITIONS =====

// Simple Component with Props
const SimpleCard = ({ title, description, isActive }: {
  title: string;
  description?: string;
  isActive?: boolean;
}) => {
  return (
    <div className={`card p-4 border rounded ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-gray-600 mt-2">{description}</p>}
      {isActive && <span className="text-blue-600 text-sm">Active</span>}
    </div>
  );
};

// Interactive Component with State and Events
const Counter = ({ initialValue = 0, onValueChange }: {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    const newValue = count + 1;
    setCount(newValue);
    onValueChange?.(newValue);
  };

  const decrement = () => {
    const newValue = count - 1;
    setCount(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="counter flex items-center gap-4">
      <button
        onClick={decrement}
        className="btn-decrement px-3 py-1 bg-red-500 text-white rounded"
        aria-label="Decrease count"
      >
        -
      </button>
      <span className="count-value text-xl font-bold" data-testid="counter-value">
        {count}
      </span>
      <button
        onClick={increment}
        className="btn-increment px-3 py-1 bg-green-500 text-white rounded"
        aria-label="Increase count"
      >
        +
      </button>
    </div>
  );
};

// Form Component with Validation
const ContactForm = ({ onSubmit }: {
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded"
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="text-red-500 text-sm" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border rounded"
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="text-red-500 text-sm" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="w-full p-2 border rounded h-24"
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span id="message-error" className="text-red-500 text-sm" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="submit-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
};

// ===== PHASE 2 COMPREHENSIVE TESTS =====

describe('Phase 2 Complete Component Testing Suite', () => {

  // ===== SIMPLE COMPONENT TESTING =====
  describe('SimpleCard Component', () => {
    it('renders with basic props', () => {
      render(<SimpleCard title="Test Card" />);

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Card');
    });

    it('renders with title and description', () => {
      render(<SimpleCard title="Test Card" description="This is a test description" />);

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('applies active styling when isActive is true', () => {
      const { container } = render(<SimpleCard title="Active Card" isActive={true} />);

      const cardElement = container.querySelector('.card');
      expect(cardElement).toHaveClass('border-blue-500', 'bg-blue-50');
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('applies default styling when isActive is false', () => {
      const { container } = render(<SimpleCard title="Inactive Card" isActive={false} />);

      const cardElement = container.querySelector('.card');
      expect(cardElement).toHaveClass('border-gray-300');
      expect(cardElement).not.toHaveClass('border-blue-500', 'bg-blue-50');
      expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });

    it('has correct CSS structure', () => {
      const { container } = render(<SimpleCard title="Styled Card" />);

      const cardElement = container.querySelector('.card');
      expect(cardElement).toHaveClass('p-4', 'border', 'rounded');

      const titleElement = screen.getByRole('heading');
      expect(titleElement).toHaveClass('text-lg', 'font-semibold');
    });
  });

  // ===== INTERACTIVE COMPONENT TESTING =====
  describe('Counter Component', () => {
    it('renders with initial value', () => {
      render(<Counter initialValue={5} />);

      expect(screen.getByTestId('counter-value')).toHaveTextContent('5');
    });

    it('defaults to 0 when no initial value provided', () => {
      render(<Counter />);

      expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
    });

    it('increments count when increment button clicked', async () => {
      const user = userEvent.setup();
      render(<Counter initialValue={0} />);

      const incrementButton = screen.getByLabelText('Increase count');
      const countValue = screen.getByTestId('counter-value');

      await user.click(incrementButton);
      expect(countValue).toHaveTextContent('1');

      await user.click(incrementButton);
      expect(countValue).toHaveTextContent('2');
    });

    it('decrements count when decrement button clicked', async () => {
      const user = userEvent.setup();
      render(<Counter initialValue={5} />);

      const decrementButton = screen.getByLabelText('Decrease count');
      const countValue = screen.getByTestId('counter-value');

      await user.click(decrementButton);
      expect(countValue).toHaveTextContent('4');

      await user.click(decrementButton);
      expect(countValue).toHaveTextContent('3');
    });

    it('calls onValueChange callback when value changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Counter initialValue={0} onValueChange={onValueChange} />);

      const incrementButton = screen.getByLabelText('Increase count');
      await user.click(incrementButton);

      expect(onValueChange).toHaveBeenCalledWith(1);
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('has accessible button labels', () => {
      render(<Counter />);

      expect(screen.getByLabelText('Increase count')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrease count')).toBeInTheDocument();
    });

    it('has correct button styling', () => {
      render(<Counter />);

      const incrementButton = screen.getByLabelText('Increase count');
      const decrementButton = screen.getByLabelText('Decrease count');

      expect(incrementButton).toHaveClass('bg-green-500', 'text-white');
      expect(decrementButton).toHaveClass('bg-red-500', 'text-white');
    });
  });

  // ===== FORM COMPONENT TESTING =====
  describe('ContactForm Component', () => {
    it('renders all form fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('updates input values when user types', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Hello world');

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(messageInput).toHaveValue('Hello world');
    });

    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('calls onSubmit with form data when validation passes', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ContactForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.type(screen.getByLabelText('Message'), 'Hello world');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world'
      });
    });

    it('does not call onSubmit when validation fails', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ContactForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('has proper accessibility attributes', () => {
      render(<ContactForm />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message');

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(messageInput).toHaveAttribute('id', 'message');

      // Check for proper label associations
      expect(screen.getByText('Name')).toHaveAttribute('for', 'name');
      expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
      expect(screen.getByText('Message')).toHaveAttribute('for', 'message');
    });

    it('shows error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      const nameError = screen.getByText('Name is required');
      const emailError = screen.getByText('Email is required');
      const messageError = screen.getByText('Message is required');

      expect(nameError).toHaveAttribute('role', 'alert');
      expect(emailError).toHaveAttribute('role', 'alert');
      expect(messageError).toHaveAttribute('role', 'alert');

      expect(nameError).toHaveAttribute('id', 'name-error');
      expect(emailError).toHaveAttribute('id', 'email-error');
      expect(messageError).toHaveAttribute('id', 'message-error');
    });
  });

  // ===== EDGE CASES AND INTEGRATION TESTING =====
  describe('Component Integration and Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      render(<SimpleCard title="Test" description={undefined} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    });

    it('handles empty string props', () => {
      render(<SimpleCard title="" description="" />);

      const title = screen.getByRole('heading');
      expect(title).toHaveTextContent('');
      expect(screen.queryByText('')).toBeInTheDocument();
    });

    it('handles special characters in props', () => {
      const specialTitle = 'Test <>&"\'';
      render(<SimpleCard title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('counter handles rapid clicking', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Counter initialValue={0} onValueChange={onValueChange} />);

      const incrementButton = screen.getByLabelText('Increase count');

      // Simulate rapid clicking
      await user.click(incrementButton);
      await user.click(incrementButton);
      await user.click(incrementButton);

      expect(screen.getByTestId('counter-value')).toHaveTextContent('3');
      expect(onValueChange).toHaveBeenCalledTimes(3);
    });

    it('form handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const messageInput = screen.getByLabelText('Message');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Tab through form elements
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(messageInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});
