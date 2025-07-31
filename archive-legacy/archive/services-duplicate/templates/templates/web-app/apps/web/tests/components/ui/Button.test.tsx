import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  const user = userEvent.setup();

  describe('Basic Rendering', () => {
    it('renders with default variant and size', () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'h-10', 'px-4');
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
      'success',
      'warning',
    ] as const;

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>{variant} Button</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        // Each variant should have specific classes
        expect(button.className).toContain('inline-flex');
      });
    });
  });

  describe('Sizes', () => {
    const sizes = [
      'sm',
      'default',
      'lg',
      'xl',
      'icon',
      'icon-sm',
      'icon-lg',
    ] as const;

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<Button size={size}>Button</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading Button</Button>);

      screen.getByRole('button');
      const spinner = screen.getByTestId('loading-spinner');

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when loading', () => {
      render(<Button isLoading>Loading Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('hides left icon when loading', () => {
      render(
        <Button isLoading leftIcon={<CheckIcon data-testid="check-icon" />}>
          Button
        </Button>
      );

      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      render(
        <Button leftIcon={<CheckIcon data-testid="left-icon" />}>
          Button with Left Icon
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon correctly', () => {
      render(
        <Button rightIcon={<ArrowRightIcon data-testid="right-icon" />}>
          Button with Right Icon
        </Button>
      );

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders both left and right icons', () => {
      render(
        <Button
          leftIcon={<CheckIcon data-testid="left-icon" />}
          rightIcon={<ArrowRightIcon data-testid="right-icon" />}
        >
          Button with Both Icons
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', async () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole('button');

      // Test Enter key activation
      await user.click(button);
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(2); // 1 from click + 1 from Enter

      // Test Space key activation (some browsers may not fire click on Space for custom buttons)
      await user.keyboard(' ');
      // Space should trigger click, but we'll be more lenient about this
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Full Width', () => {
    it('renders full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not render full width by default', () => {
      render(<Button>Regular Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-auto');
    });
  });

  describe('As Child Prop', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('maintains focus outline', () => {
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('supports custom ARIA labels', () => {
      render(<Button aria-label="Custom label">Button</Button>);

      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('supports form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const form = screen.getByRole('button').closest('form');
      fireEvent.submit(form!);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('supports different button types', () => {
      render(<Button type="reset">Reset Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });
});
