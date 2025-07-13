/**
 * Comprehensive test suite for Input component
 * Tests all variants, sizes, states, accessibility, and user interactions
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Eye, Mail, Search } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render a basic input field', () => {
      render(<Input placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with custom type', () => {
      render(<Input type="email" placeholder="Enter email" />);

      const input = screen.getByPlaceholderText('Enter email');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render with default variant and size classes', () => {
      render(<Input placeholder="Test input" />);

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveClass('h-10'); // default size
      expect(input).toHaveClass('border-input'); // default variant
    });

    it('should apply custom className', () => {
      render(<Input placeholder="Test input" className="custom-class" />);

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveClass('custom-class');
    });

    it('should generate unique IDs when not provided', () => {
      render(
        <div>
          <Input placeholder="Input 1" />
          <Input placeholder="Input 2" />
        </div>
      );

      const input1 = screen.getByPlaceholderText('Input 1');
      const input2 = screen.getByPlaceholderText('Input 2');

      expect(input1.id).toBeTruthy();
      expect(input2.id).toBeTruthy();
      expect(input1.id).not.toBe(input2.id);
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<Input placeholder="Default variant" variant="default" />);

      const input = screen.getByPlaceholderText('Default variant');
      expect(input).toHaveClass('border-input');
    });

    it('should apply destructive variant styles', () => {
      render(<Input placeholder="Destructive variant" variant="destructive" />);

      const input = screen.getByPlaceholderText('Destructive variant');
      expect(input).toHaveClass('border-destructive');
      expect(input).toHaveClass('focus-visible:ring-destructive');
    });

    it('should apply success variant styles', () => {
      render(<Input placeholder="Success variant" variant="success" />);

      const input = screen.getByPlaceholderText('Success variant');
      expect(input).toHaveClass('border-success');
      expect(input).toHaveClass('focus-visible:ring-success');
    });

    it('should apply warning variant styles', () => {
      render(<Input placeholder="Warning variant" variant="warning" />);

      const input = screen.getByPlaceholderText('Warning variant');
      expect(input).toHaveClass('border-warning');
      expect(input).toHaveClass('focus-visible:ring-warning');
    });

    it('should override variant to destructive when error is present', () => {
      render(
        <Input
          placeholder="Error input"
          variant="success"
          error="This field has an error"
        />
      );

      const input = screen.getByPlaceholderText('Error input');
      expect(input).toHaveClass('border-destructive');
      expect(input).not.toHaveClass('border-success');
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      render(<Input placeholder="Default size" inputSize="default" />);

      const input = screen.getByPlaceholderText('Default size');
      expect(input).toHaveClass('h-10');
    });

    it('should apply small size styles', () => {
      render(<Input placeholder="Small size" inputSize="sm" />);

      const input = screen.getByPlaceholderText('Small size');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('text-xs');
    });

    it('should apply large size styles', () => {
      render(<Input placeholder="Large size" inputSize="lg" />);

      const input = screen.getByPlaceholderText('Large size');
      expect(input).toHaveClass('h-11');
    });
  });

  describe('Label and Description', () => {
    it('should render with label', () => {
      render(<Input label="Email Address" placeholder="Enter email" />);

      const label = screen.getByText('Email Address');
      const input = screen.getByPlaceholderText('Enter email');

      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('should render with description', () => {
      render(
        <Input placeholder="Username" description="Choose a unique username" />
      );

      const description = screen.getByText('Choose a unique username');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should use custom ID when provided', () => {
      render(
        <Input id="custom-input" label="Custom Input" placeholder="Test" />
      );

      const input = screen.getByPlaceholderText('Test');
      const label = screen.getByText('Custom Input');

      expect(input).toHaveAttribute('id', 'custom-input');
      expect(label).toHaveAttribute('for', 'custom-input');
    });

    it('should hide description when error is present', () => {
      render(
        <Input
          placeholder="Test input"
          description="This is helpful text"
          error="This is an error"
        />
      );

      expect(
        screen.queryByText('This is helpful text')
      ).not.toBeInTheDocument();
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(
        <Input placeholder="Error input" error="This field is required" />
      );

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-destructive');
    });

    it('should apply destructive styling when error is present', () => {
      render(<Input placeholder="Error input" error="Error message" />);

      const input = screen.getByPlaceholderText('Error input');
      expect(input).toHaveClass('border-destructive');
    });

    it('should clear error styling when error is removed', () => {
      const { rerender } = render(
        <Input placeholder="Test input" error="Error message" />
      );

      let input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveClass('border-destructive');

      rerender(<Input placeholder="Test input" />);

      input = screen.getByPlaceholderText('Test input');
      expect(input).not.toHaveClass('border-destructive');
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render with left icon', () => {
      render(
        <Input
          placeholder="Search"
          leftIcon={<Search data-testid="search-icon" />}
        />
      );

      const icon = screen.getByTestId('search-icon');
      const input = screen.getByPlaceholderText('Search');

      expect(icon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10');
    });

    it('should render with right icon', () => {
      render(
        <Input
          placeholder="Password"
          rightIcon={<Eye data-testid="eye-icon" />}
        />
      );

      const icon = screen.getByTestId('eye-icon');
      const input = screen.getByPlaceholderText('Password');

      expect(icon).toBeInTheDocument();
      expect(input).toHaveClass('pr-10');
    });

    it('should render with both left and right icons', () => {
      render(
        <Input
          placeholder="Email"
          leftIcon={<Mail data-testid="mail-icon" />}
          rightIcon={<Eye data-testid="eye-icon" />}
        />
      );

      const leftIcon = screen.getByTestId('mail-icon');
      const rightIcon = screen.getByTestId('eye-icon');
      const input = screen.getByPlaceholderText('Email');

      expect(leftIcon).toBeInTheDocument();
      expect(rightIcon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10');
      expect(input).toHaveClass('pr-10');
    });

    it('should position icons correctly', () => {
      render(
        <Input
          placeholder="Test"
          leftIcon={<Mail data-testid="left-icon" />}
          rightIcon={<Eye data-testid="right-icon" />}
        />
      );

      const leftIcon = screen.getByTestId('left-icon');
      const rightIcon = screen.getByTestId('right-icon');

      expect(leftIcon.parentElement).toHaveClass('absolute', 'left-3');
      expect(rightIcon.parentElement).toHaveClass('absolute', 'right-3');
    });
  });

  describe('User Interactions', () => {
    it('should accept user input', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Type here" />);

      const input = screen.getByPlaceholderText(
        'Type here'
      ) as HTMLInputElement;
      await user.type(input, 'Hello World');

      expect(input.value).toBe('Hello World');
    });

    it('should call onChange handler', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input placeholder="Type here" onChange={handleChange} />);

      const input = screen.getByPlaceholderText('Type here');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
    });

    it('should call onFocus and onBlur handlers', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <Input
          placeholder="Focus test"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

      const input = screen.getByPlaceholderText('Focus test');

      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();

      await user.tab(); // Move focus away
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should handle key events', async () => {
      const user = userEvent.setup();
      const handleKeyDown = jest.fn();
      render(<Input placeholder="Key test" onKeyDown={handleKeyDown} />);

      const input = screen.getByPlaceholderText('Key test');
      await user.type(input, 'a');

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input placeholder="Disabled input" disabled />);

      const input = screen.getByPlaceholderText(
        'Disabled input'
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(input).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Disabled input" disabled />);

      const input = screen.getByPlaceholderText(
        'Disabled input'
      ) as HTMLInputElement;
      await user.type(input, 'test');

      expect(input.value).toBe('');
    });

    it('should disable label when input is disabled', () => {
      render(
        <Input label="Disabled Label" placeholder="Disabled input" disabled />
      );

      const label = screen.getByText('Disabled Label');
      expect(label).toHaveClass(
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-70'
      );
    });
  });

  describe('Form Integration', () => {
    it('should work with controlled input', async () => {
      const user = userEvent.setup();
      let value = '';
      const setValue = jest.fn(newValue => {
        value = newValue;
      });

      const ControlledInput = () => (
        <Input
          placeholder="Controlled"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      );

      const { rerender } = render(<ControlledInput />);

      const input = screen.getByPlaceholderText(
        'Controlled'
      ) as HTMLInputElement;

      await user.type(input, 'test');

      // Rerender to reflect the new value
      rerender(<ControlledInput />);

      expect(setValue).toHaveBeenCalled();
    });

    it('should support defaultValue', () => {
      render(<Input placeholder="Default value" defaultValue="Initial text" />);

      const input = screen.getByPlaceholderText(
        'Default value'
      ) as HTMLInputElement;
      expect(input.value).toBe('Initial text');
    });

    it('should support form attributes', () => {
      render(
        <Input
          placeholder="Form input"
          name="test-input"
          required
          autoComplete="email"
          autoFocus
        />
      );

      const input = screen.getByPlaceholderText('Form input');
      expect(input).toHaveAttribute('name', 'test-input');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveFocus(); // autoFocus
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Input
          placeholder="Accessible input"
          aria-label="Accessible input field"
          aria-describedby="helper-text"
        />
      );

      const input = screen.getByPlaceholderText('Accessible input');
      expect(input).toHaveAttribute('aria-label', 'Accessible input field');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('should associate label with input correctly', () => {
      render(<Input label="Username" placeholder="Enter username" />);

      const label = screen.getByText('Username');
      const input = screen.getByPlaceholderText('Enter username');

      expect(label.getAttribute('for')).toBe(input.id);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Keyboard test" />);

      const input = screen.getByPlaceholderText('Keyboard test');

      // Should be focusable with keyboard
      await user.tab();
      expect(input).toHaveFocus();

      // Should accept keyboard input
      await user.keyboard('Hello');
      expect(input).toHaveValue('Hello');
    });

    it('should support screen readers with proper semantics', () => {
      render(
        <Input
          label="Email"
          placeholder="Enter your email"
          description="We'll never share your email"
          error="Please enter a valid email"
        />
      );

      const input = screen.getByPlaceholderText('Enter your email');
      const label = screen.getByText('Email');
      const error = screen.getByText('Please enter a valid email');

      expect(label).toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(input).toHaveAccessibleName('Email');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestInput = React.memo(
        (props: React.ComponentProps<typeof Input>) => {
          renderSpy();
          return <Input {...props} />;
        }
      );
      TestInput.displayName = 'TestInput';

      const { rerender } = render(<TestInput placeholder="Performance test" />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestInput placeholder="Performance test" />);

      expect(renderSpy).toHaveBeenCalledTimes(1); // Should not re-render
    });

    it('should handle rapid typing efficiently', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Input placeholder="Rapid typing" onChange={handleChange} />);

      const input = screen.getByPlaceholderText('Rapid typing');

      // Simulate rapid typing
      await user.type(input, 'rapid typing test');

      // userEvent may trigger onChange slightly differently, so we check for at least 17 calls
      expect(handleChange).toHaveBeenCalledTimes(17);
      expect(input).toHaveValue('rapid typing test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      render(<Input placeholder="Empty value" value="" />);

      const input = screen.getByPlaceholderText(
        'Empty value'
      ) as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle null/undefined values gracefully', () => {
      expect(() => {
        render(
          <Input
            placeholder="Null test"
            value={undefined as unknown as string}
          />
        );
      }).not.toThrow();
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Special chars" />);

      const input = screen.getByPlaceholderText(
        'Special chars'
      ) as HTMLInputElement;
      await user.type(input, '!@#$%^&*()');

      expect(input.value).toBe('!@#$%^&*()');
    });

    it('should handle very long text input', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(1000);

      render(<Input placeholder="Long text" />);

      const input = screen.getByPlaceholderText(
        'Long text'
      ) as HTMLInputElement;

      // Paste long text
      await user.click(input);
      await user.keyboard(`{Control>}a{/Control}{Control>}v{/Control}`);

      // Simulate paste event
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => longText,
        },
      });
    });
  });

  describe('Interactive Icon Functionality', () => {
    it('should handle clickable right icon', async () => {
      const user = userEvent.setup();
      const handleIconClick = jest.fn();

      render(
        <Input
          placeholder="Password"
          rightIcon={
            <button
              onClick={handleIconClick}
              data-testid="toggle-button"
              aria-label="Toggle password visibility"
            >
              <Eye />
            </button>
          }
        />
      );

      const toggleButton = screen.getByTestId('toggle-button');
      await user.click(toggleButton);

      expect(handleIconClick).toHaveBeenCalled();
    });

    it('should maintain focus on input when icon is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Input
          placeholder="Password"
          rightIcon={
            <button
              data-testid="icon-button"
              aria-label="Action button"
              onMouseDown={e => e.preventDefault()} // Prevent focus change
            >
              <Eye />
            </button>
          }
        />
      );

      const input = screen.getByPlaceholderText('Password');
      const iconButton = screen.getByTestId('icon-button');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.click(iconButton);
      // Input should still be focused after icon click due to preventDefault on mousedown
      expect(input).toHaveFocus();
    });
  });
});
