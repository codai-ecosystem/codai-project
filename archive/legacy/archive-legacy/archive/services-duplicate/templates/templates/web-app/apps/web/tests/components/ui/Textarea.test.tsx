/**
 * Comprehensive test suite for Textarea component
 * Tests all props, states, resize options, accessibility, and user interactions
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Textarea } from '@/components/ui/Textarea';

describe('Textarea Component', () => {
  describe('Basic Rendering', () => {
    it('should render a basic textarea field', () => {
      render(<Textarea placeholder="Enter your message" />);

      const textarea = screen.getByPlaceholderText('Enter your message');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render with default className', () => {
      render(<Textarea placeholder="Default textarea" />);

      const textarea = screen.getByPlaceholderText('Default textarea');
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[80px]',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm'
      );
    });

    it('should apply custom className', () => {
      render(
        <Textarea className="custom-textarea" placeholder="Custom textarea" />
      );

      const textarea = screen.getByPlaceholderText('Custom textarea');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('should have proper default attributes', () => {
      render(<Textarea placeholder="Test textarea" />);

      const textarea = screen.getByPlaceholderText('Test textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Test textarea');
      expect(textarea).toHaveClass('resize-y'); // Default resize: vertical
    });
  });

  describe('Label Support', () => {
    it('should render with label', () => {
      render(<Textarea label="Message" placeholder="Enter message" />);

      const label = screen.getByText('Message');
      const textarea = screen.getByPlaceholderText('Enter message');

      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', textarea.id);
    });

    it('should generate unique ID when not provided', () => {
      const { container } = render(<Textarea label="Test Label" />);

      const textareas = container.querySelectorAll('textarea');
      expect(textareas).toHaveLength(1);
      expect(textareas[0]).toHaveAttribute('id');
      expect(textareas[0]?.id).toMatch(/^textarea-[a-z0-9]+$/);
    });

    it('should use custom ID when provided', () => {
      render(
        <Textarea
          id="custom-textarea"
          label="Custom Textarea"
          placeholder="Test"
        />
      );

      const textarea = screen.getByPlaceholderText('Test');
      const label = screen.getByText('Custom Textarea');

      expect(textarea).toHaveAttribute('id', 'custom-textarea');
      expect(label).toHaveAttribute('for', 'custom-textarea');
    });

    it('should have proper label styling', () => {
      render(<Textarea label="Styled Label" />);

      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'leading-none',
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-70'
      );
    });
  });

  describe('Description Support', () => {
    it('should render with description', () => {
      render(
        <Textarea
          placeholder="Message"
          description="Please enter your detailed message"
        />
      );

      const description = screen.getByText(
        'Please enter your detailed message'
      );
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should hide description when error is present', () => {
      render(
        <Textarea
          placeholder="Test textarea"
          description="This is helpful text"
          error="This is an error"
        />
      );

      expect(
        screen.queryByText('This is helpful text')
      ).not.toBeInTheDocument();
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });

    it('should show description when no error', () => {
      render(
        <Textarea
          placeholder="Test textarea"
          description="This is helpful text"
        />
      );

      expect(screen.getByText('This is helpful text')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(
        <Textarea placeholder="Error textarea" error="This field is required" />
      );

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-sm', 'text-destructive');
    });

    it('should apply destructive styling when error is present', () => {
      render(<Textarea placeholder="Error textarea" error="Error message" />);

      const textarea = screen.getByPlaceholderText('Error textarea');
      expect(textarea).toHaveClass(
        'border-destructive',
        'focus-visible:ring-destructive'
      );
    });

    it('should clear error styling when error is removed', () => {
      const { rerender } = render(
        <Textarea placeholder="Test textarea" error="Error message" />
      );

      let textarea = screen.getByPlaceholderText('Test textarea');
      expect(textarea).toHaveClass('border-destructive');

      rerender(<Textarea placeholder="Test textarea" />);

      textarea = screen.getByPlaceholderText('Test textarea');
      expect(textarea).not.toHaveClass('border-destructive');
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });

    it('should handle empty error string', () => {
      render(<Textarea placeholder="Empty error" error="" />);

      const textarea = screen.getByPlaceholderText('Empty error');
      expect(textarea).not.toHaveClass('border-destructive');
      // Empty string should not render an error paragraph
      const errorParagraphs = screen.queryAllByText((_content, element) => {
        return element?.className?.includes('text-destructive') || false;
      });
      expect(errorParagraphs).toHaveLength(0);
    });
  });

  describe('Resize Options', () => {
    it('should apply no resize class', () => {
      render(<Textarea placeholder="No resize" resize="none" />);

      const textarea = screen.getByPlaceholderText('No resize');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should apply both resize class', () => {
      render(<Textarea placeholder="Both resize" resize="both" />);

      const textarea = screen.getByPlaceholderText('Both resize');
      expect(textarea).toHaveClass('resize');
    });

    it('should apply horizontal resize class', () => {
      render(<Textarea placeholder="Horizontal resize" resize="horizontal" />);

      const textarea = screen.getByPlaceholderText('Horizontal resize');
      expect(textarea).toHaveClass('resize-x');
    });

    it('should apply vertical resize class (default)', () => {
      render(<Textarea placeholder="Vertical resize" resize="vertical" />);

      const textarea = screen.getByPlaceholderText('Vertical resize');
      expect(textarea).toHaveClass('resize-y');
    });

    it('should use vertical resize as default', () => {
      render(<Textarea placeholder="Default resize" />);

      const textarea = screen.getByPlaceholderText('Default resize');
      expect(textarea).toHaveClass('resize-y');
    });
  });

  describe('HTML Attributes', () => {
    it('should accept all textarea HTML attributes', () => {
      render(
        <Textarea
          placeholder="Full attributes"
          rows={10}
          cols={50}
          maxLength={500}
          disabled
          required
          readOnly
          name="message"
          wrap="soft"
        />
      );

      const textarea = screen.getByPlaceholderText('Full attributes');
      expect(textarea).toHaveAttribute('rows', '10');
      expect(textarea).toHaveAttribute('cols', '50');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toBeDisabled();
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('readonly');
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('wrap', 'soft');
    });

    it('should apply disabled styling', () => {
      render(<Textarea placeholder="Disabled textarea" disabled />);

      const textarea = screen.getByPlaceholderText('Disabled textarea');
      expect(textarea).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('should handle different input types attributes', () => {
      render(
        <Textarea
          placeholder="Styled textarea"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
        />
      );

      const textarea = screen.getByPlaceholderText('Styled textarea');
      expect(textarea).toHaveAttribute('spellcheck', 'false');
      expect(textarea).toHaveAttribute('autocomplete', 'off');
      expect(textarea).toHaveAttribute('autocorrect', 'off');
      expect(textarea).toHaveAttribute('autocapitalize', 'none');
    });
  });

  describe('User Interactions', () => {
    it('should accept user input', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Type here" />);

      const textarea = screen.getByPlaceholderText(
        'Type here'
      ) as HTMLTextAreaElement;
      await user.type(textarea, 'Hello World\nThis is a new line');

      expect(textarea.value).toBe('Hello World\nThis is a new line');
    });

    it('should call onChange when text is entered', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Textarea placeholder="On change" onChange={handleChange} />);

      const textarea = screen.getByPlaceholderText('On change');
      await user.type(textarea, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // One call per character
    });

    it('should call onFocus and onBlur', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <Textarea
          placeholder="Focus test"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

      const textarea = screen.getByPlaceholderText('Focus test');

      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      await user.tab(); // Move focus away
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', async () => {
      const user = userEvent.setup();
      const handleKeyDown = jest.fn();
      const handleKeyUp = jest.fn();

      render(
        <Textarea
          placeholder="Keyboard test"
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
      );

      const textarea = screen.getByPlaceholderText('Keyboard test');
      await user.click(textarea);
      await user.keyboard('{Enter}');

      expect(handleKeyDown).toHaveBeenCalled();
      expect(handleKeyUp).toHaveBeenCalled();
    });

    it('should handle paste events', async () => {
      const user = userEvent.setup();
      const handlePaste = jest.fn();

      render(<Textarea placeholder="Paste test" onPaste={handlePaste} />);

      const textarea = screen.getByPlaceholderText('Paste test');
      await user.click(textarea);

      // Simulate paste event
      fireEvent.paste(textarea, {
        clipboardData: {
          getData: () => 'Pasted content',
        },
      });

      expect(handlePaste).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Content Handling', () => {
    it('should handle multiline text input', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Multiline test" />);

      const textarea = screen.getByPlaceholderText(
        'Multiline test'
      ) as HTMLTextAreaElement;
      const multilineText = 'Line 1\nLine 2\nLine 3\n\nLine 5';

      await user.type(textarea, multilineText);
      expect(textarea.value).toBe(multilineText);
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Special chars" />);

      const textarea = screen.getByPlaceholderText(
        'Special chars'
      ) as HTMLTextAreaElement;

      // Focus the textarea first
      await user.click(textarea);

      // Use paste instead of type for special characters to avoid userEvent parsing issues
      await user.paste('!@#$%^&*()_+-=[]{}|;:,.<>?');

      expect(textarea.value).toBe('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should handle very long text', async () => {
      const longText = 'a'.repeat(1000);

      render(<Textarea placeholder="Long text" />);

      const textarea = screen.getByPlaceholderText(
        'Long text'
      ) as HTMLTextAreaElement;

      // Simulate paste for long text
      fireEvent.paste(textarea, {
        clipboardData: {
          getData: () => longText,
        },
      });

      fireEvent.change(textarea, { target: { value: longText } });
      expect(textarea.value).toBe(longText);
    });

    it('should handle tab characters', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Tab test" />);

      const textarea = screen.getByPlaceholderText('Tab test');
      await user.click(textarea);
      await user.type(textarea, 'Start\tMiddle\tEnd');

      expect(textarea).toHaveValue('Start\tMiddle\tEnd');
    });

    it('should handle Unicode characters', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Unicode test" />);

      const textarea = screen.getByPlaceholderText('Unicode test');
      await user.type(textarea, '🚀 Hello 世界 🌍');

      expect(textarea).toHaveValue('🚀 Hello 世界 🌍');
    });
  });

  describe('Form Integration', () => {
    it('should work with controlled input', async () => {
      const user = userEvent.setup();
      let value = '';
      const setValue = jest.fn(newValue => {
        value = newValue;
      });

      const ControlledTextarea = () => (
        <Textarea
          placeholder="Controlled"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      );

      const { rerender } = render(<ControlledTextarea />);

      const textarea = screen.getByPlaceholderText(
        'Controlled'
      ) as HTMLTextAreaElement;

      await user.type(textarea, 'test');

      // Rerender to reflect the new value
      rerender(<ControlledTextarea />);

      expect(setValue).toHaveBeenCalled();
    });

    it('should work with form submission', () => {
      const handleSubmit = jest.fn(e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        expect(formData.get('message')).toBe('Test message');
      });

      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" defaultValue="Test message" />
          <button type="submit">Submit</button>
        </form>
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should handle validation states', () => {
      render(
        <Textarea
          placeholder="Validation test"
          required
          aria-invalid="true"
          aria-describedby="error-message"
        />
      );

      const textarea = screen.getByPlaceholderText('Validation test');
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Textarea
          placeholder="Accessible textarea"
          label="Message"
          description="Enter your message here"
          error="This field is required"
        />
      );

      const textarea = screen.getByPlaceholderText('Accessible textarea');
      const label = screen.getByText('Message');
      const error = screen.getByText('This field is required');

      expect(label).toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(textarea).toHaveAccessibleName('Message');
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Focus management" />);

      const textarea = screen.getByPlaceholderText('Focus management');

      await user.tab();
      expect(textarea).toHaveFocus();

      await user.tab();
      expect(textarea).not.toHaveFocus();
    });

    it('should support screen reader navigation', () => {
      render(
        <Textarea
          placeholder="Screen reader test"
          label="Description"
          description="Provide a detailed description"
          aria-describedby="help-text"
        />
      );

      const textarea = screen.getByPlaceholderText('Screen reader test');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should handle disabled state for accessibility', () => {
      render(
        <Textarea
          label="Disabled Label"
          placeholder="Disabled textarea"
          disabled
        />
      );

      const label = screen.getByText('Disabled Label');
      expect(label).toHaveClass(
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-70'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values gracefully', () => {
      render(
        <Textarea placeholder="Empty value" value="" onChange={() => {}} />
      );

      const textarea = screen.getByPlaceholderText('Empty value');
      expect(textarea).toHaveValue('');
    });

    it('should handle null and undefined values', () => {
      render(
        <Textarea
          placeholder="Null value"
          value={undefined}
          onChange={() => {}}
        />
      );

      const textarea = screen.getByPlaceholderText('Null value');
      expect(textarea).toBeInTheDocument();
    });

    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Textarea placeholder="Rapid changes" />);

      for (let i = 0; i < 10; i++) {
        rerender(<Textarea placeholder="Rapid changes" key={i} />);
      }

      const textarea = screen.getByPlaceholderText('Rapid changes');
      await user.type(textarea, 'test');

      expect(textarea).toHaveValue('test');
    });

    it('should handle different min-height values', () => {
      render(
        <Textarea className="min-h-[200px]" placeholder="Custom height" />
      );

      const textarea = screen.getByPlaceholderText('Custom height');
      expect(textarea).toHaveClass('min-h-[200px]');
    });

    it('should handle component with all props', () => {
      render(
        <Textarea
          id="complete-textarea"
          label="Complete Textarea"
          placeholder="Enter text here"
          description="This textarea has all props"
          error="Example error message"
          resize="both"
          className="custom-class"
          maxLength={100}
          rows={5}
          cols={40}
          required
          disabled={false}
        />
      );

      const textarea = screen.getByPlaceholderText('Enter text here');
      const label = screen.getByText('Complete Textarea');
      const error = screen.getByText('Example error message');

      expect(textarea).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(textarea).toHaveClass('custom-class', 'resize');
      expect(textarea).toHaveAttribute('maxlength', '100');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestTextarea = React.memo(
        (props: React.ComponentProps<typeof Textarea>) => {
          renderSpy();
          return <Textarea {...props} />;
        }
      );
      TestTextarea.displayName = 'TestTextarea';

      const { rerender } = render(
        <TestTextarea placeholder="Performance test" />
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestTextarea placeholder="Performance test" />);

      expect(renderSpy).toHaveBeenCalledTimes(1); // Should not re-render
    });

    it('should handle rapid input efficiently', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Textarea placeholder="Rapid input" onChange={handleChange} />);

      const textarea = screen.getByPlaceholderText('Rapid input');

      // Simulate rapid typing
      await user.type(textarea, 'rapid input test');

      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('rapid input test');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();

      render(<Textarea ref={ref} placeholder="Ref test" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toBe(screen.getByPlaceholderText('Ref test'));
    });

    it('should allow ref methods to be called', () => {
      const ref = React.createRef<HTMLTextAreaElement>();

      render(<Textarea ref={ref} placeholder="Ref methods" />);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.select).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should accept correct TextareaProps', () => {
      // This test ensures TypeScript compilation passes with correct props
      const validProps = {
        label: 'Valid Label',
        description: 'Valid description',
        error: 'Valid error',
        resize: 'vertical' as const,
        placeholder: 'Valid placeholder',
        rows: 5,
        cols: 40,
        maxLength: 500,
      };

      render(<Textarea {...validProps} />);

      const textarea = screen.getByPlaceholderText('Valid placeholder');
      expect(textarea).toBeInTheDocument();
    });
  });
});
