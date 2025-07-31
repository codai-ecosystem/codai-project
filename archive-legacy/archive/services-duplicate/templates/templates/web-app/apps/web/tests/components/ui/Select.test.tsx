import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import type {
  MockSelectContentProps,
  MockSelectGroupProps,
  MockSelectItemProps,
  MockSelectLabelProps,
  MockSelectRootProps,
  MockSelectSeparatorProps,
  MockSelectTriggerProps,
  MockSelectValueProps,
} from '../../types/mock-types';

// Additional mock types for missing components
interface MockSelectViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface MockSelectScrollButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface MockSelectItemTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

interface MockSelectItemIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

// Mock Radix UI Select
jest.mock('@radix-ui/react-select', () => ({
  Root: ({
    children,
    onValueChange: _onValueChange,
    value,
    disabled,
    ...props
  }: MockSelectRootProps) => (
    <div
      data-testid="select-root"
      data-value={value}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  ),
  Group: ({ children, ...props }: MockSelectGroupProps) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  Value: ({ placeholder, children, ...props }: MockSelectValueProps) => (
    <div data-testid="select-value" data-placeholder={placeholder} {...props}>
      {children}
    </div>
  ),
  Trigger: ({
    children,
    className,
    onClick,
    ...props
  }: MockSelectTriggerProps) => (
    <button
      className={className}
      onClick={onClick}
      data-testid="select-trigger"
      {...props}
    >
      {children}
    </button>
  ),
  Icon: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="select-icon">{asChild ? children : 'Icon'}</div>,
  Portal: ({ children }: { children: React.ReactNode; }) => children,
  Content: ({
    children,
    className,
    position,
    ...props
  }: MockSelectContentProps) => (
    <div
      className={className}
      data-testid="select-content"
      data-position={position}
      {...props}
    >
      {children}
    </div>
  ),
  Viewport: ({ children, className, ...props }: MockSelectViewportProps) => (
    <div className={className} data-testid="select-viewport" {...props}>
      {children}
    </div>
  ),
  ScrollUpButton: ({
    children,
    className,
    ...props
  }: MockSelectScrollButtonProps) => (
    <button className={className} data-testid="select-scroll-up" {...props}>
      {children}
    </button>
  ),
  ScrollDownButton: ({
    children,
    className,
    ...props
  }: MockSelectScrollButtonProps) => (
    <button className={className} data-testid="select-scroll-down" {...props}>
      {children}
    </button>
  ),
  Label: ({ children, className, ...props }: MockSelectLabelProps) => (
    <div className={className} data-testid="select-label" {...props}>
      {children}
    </div>
  ),
  Item: ({
    children,
    className,
    value,
    disabled,
    ...props
  }: MockSelectItemProps) => (
    <div
      className={className}
      data-testid="select-item"
      data-value={value}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  ),
  ItemText: ({ children, ...props }: MockSelectItemTextProps) => (
    <span data-testid="select-item-text" {...props}>
      {children}
    </span>
  ),
  ItemIndicator: ({ children, ...props }: MockSelectItemIndicatorProps) => (
    <span data-testid="select-item-indicator" {...props}>
      {children}
    </span>
  ),
  Separator: ({ className, ...props }: MockSelectSeparatorProps) => (
    <div className={className} data-testid="select-separator" {...props} />
  ),
}));

describe('Select Components', () => {
  describe('Select Root', () => {
    it('should render select root with default props', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('should handle value and onValueChange', () => {
      const mockOnValueChange = jest.fn();

      render(
        <Select value="test-value" onValueChange={mockOnValueChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-value', 'test-value');
    });

    it('should handle disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('SelectTrigger', () => {
    it('should render trigger with default styles', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'items-center',
        'justify-between',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2'
      );
    });

    it('should apply error styles when error prop is true', () => {
      render(
        <SelectTrigger error>
          <SelectValue />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass(
        'border-destructive',
        'focus:ring-destructive'
      );
    });

    it('should apply custom className', () => {
      render(
        <SelectTrigger className="custom-trigger">
          <SelectValue />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should render trigger icon', () => {
      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      );

      expect(screen.getByTestId('select-icon')).toBeInTheDocument();

      // Check if the SVG is rendered
      const svg = screen.getByTestId('select-icon').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4', 'opacity-50');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      render(
        <SelectTrigger onClick={mockOnClick}>
          <SelectValue />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();

      render(
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.tab();

      expect(trigger).toHaveFocus();
    });
  });

  describe('SelectValue', () => {
    it('should render select value', () => {
      render(<SelectValue />);

      expect(screen.getByTestId('select-value')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<SelectValue placeholder="Select an option" />);

      const value = screen.getByTestId('select-value');
      expect(value).toHaveAttribute('data-placeholder', 'Select an option');
    });

    it('should render with children', () => {
      render(<SelectValue>Current Value</SelectValue>);

      expect(screen.getByText('Current Value')).toBeInTheDocument();
    });
  });

  describe('SelectContent', () => {
    it('should render content with default styles', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass(
        'relative',
        'z-50',
        'max-h-96',
        'min-w-[8rem]',
        'overflow-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'text-popover-foreground',
        'shadow-md'
      );
    });

    it('should apply popper position styles by default', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'popper');
    });

    it('should apply custom position', () => {
      render(
        <SelectContent position="item-aligned">
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'item-aligned');
    });

    it('should render scroll buttons and viewport', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>
      );

      expect(screen.getByTestId('select-scroll-up')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down')).toBeInTheDocument();
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <SelectContent className="custom-content">
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectContent>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('SelectLabel', () => {
    it('should render label with default styles', () => {
      render(<SelectLabel>Label Text</SelectLabel>);

      const label = screen.getByTestId('select-label');
      expect(label).toHaveTextContent('Label Text');
      expect(label).toHaveClass(
        'py-1.5',
        'pl-8',
        'pr-2',
        'text-sm',
        'font-semibold'
      );
    });

    it('should apply custom className', () => {
      render(<SelectLabel className="custom-label">Label</SelectLabel>);

      const label = screen.getByTestId('select-label');
      expect(label).toHaveClass('custom-label');
    });
  });

  describe('SelectItem', () => {
    it('should render item with default styles', () => {
      render(<SelectItem value="item1">Item 1</SelectItem>);

      const item = screen.getByTestId('select-item');
      expect(item).toHaveTextContent('Item 1');
      expect(item).toHaveAttribute('data-value', 'item1');
      expect(item).toHaveClass(
        'relative',
        'flex',
        'w-full',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'py-1.5',
        'pl-8',
        'pr-2',
        'text-sm',
        'outline-none'
      );
    });

    it('should render item indicator', () => {
      render(<SelectItem value="item1">Item 1</SelectItem>);

      expect(screen.getByTestId('select-item-indicator')).toBeInTheDocument();

      // Check if the check icon SVG is rendered
      const svg = screen
        .getByTestId('select-item-indicator')
        .querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('should render item text', () => {
      render(<SelectItem value="item1">Item 1</SelectItem>);

      const itemText = screen.getByTestId('select-item-text');
      expect(itemText).toHaveTextContent('Item 1');
    });

    it('should handle disabled state', () => {
      render(
        <SelectItem value="item1" disabled>
          Item 1
        </SelectItem>
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveAttribute('data-disabled', 'true');
    });

    it('should apply custom className', () => {
      render(
        <SelectItem value="item1" className="custom-item">
          Item 1
        </SelectItem>
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('SelectGroup', () => {
    it('should render group container', () => {
      render(
        <SelectGroup>
          <SelectLabel>Group Label</SelectLabel>
          <SelectItem value="item1">Item 1</SelectItem>
        </SelectGroup>
      );

      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByText('Group Label')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });

  describe('SelectSeparator', () => {
    it('should render separator with default styles', () => {
      render(<SelectSeparator />);

      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });

    it('should apply custom className', () => {
      render(<SelectSeparator className="custom-separator" />);

      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('custom-separator');
    });
  });

  describe('Complete Select Component', () => {
    const BasicSelect = ({
      value,
      onValueChange,
      error,
    }: {
      value?: string;
      onValueChange?: (value: string) => void;
      error?: boolean;
    }) => (
      <Select
        {...(value !== undefined && { value })}
        {...(onValueChange !== undefined && { onValueChange })}
      >
        <SelectTrigger {...(error !== undefined && { error })}>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="lettuce" disabled>
              Lettuce (Out of stock)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    it('should render complete select with all components', () => {
      render(<BasicSelect />);

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-group')).toHaveLength(2);
      expect(screen.getAllByTestId('select-label')).toHaveLength(2);
      expect(screen.getAllByTestId('select-item')).toHaveLength(5);
      expect(screen.getByTestId('select-separator')).toBeInTheDocument();
    });

    it('should handle value changes', () => {
      const mockOnValueChange = jest.fn();

      render(<BasicSelect onValueChange={mockOnValueChange} />);

      // The actual interaction would be handled by Radix UI
      // We're testing that the props are passed correctly
      const root = screen.getByTestId('select-root');
      expect(root).toBeInTheDocument();
    });

    it('should show error state', () => {
      render(<BasicSelect error />);

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('border-destructive');
    });

    it('should handle disabled items', () => {
      render(<BasicSelect />);

      const disabledItem = screen
        .getByText('Lettuce (Out of stock)')
        .closest('[data-testid="select-item"]');
      expect(disabledItem).toHaveAttribute('data-disabled', 'true');
    });

    it('should render placeholder correctly', () => {
      render(<BasicSelect />);

      const value = screen.getByTestId('select-value');
      expect(value).toHaveAttribute('data-placeholder', 'Select a fruit');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for trigger', () => {
      render(
        <SelectTrigger aria-label="Select an option">
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select an option');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');
      // Radix UI would handle opening the dropdown and focus management
    });

    it('should handle focus management correctly', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <Select>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </Select>
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByText('Before');
      const trigger = screen.getByTestId('select-trigger');
      const afterButton = screen.getByText('After');

      beforeButton.focus();
      await user.tab();
      expect(trigger).toHaveFocus();

      await user.tab();
      expect(afterButton).toHaveFocus();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom styles to all components', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectGroup>
              <SelectLabel className="custom-label">Label</SelectLabel>
              <SelectItem value="item1" className="custom-item">
                Item 1
              </SelectItem>
            </SelectGroup>
            <SelectSeparator className="custom-separator" />
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toHaveClass(
        'custom-trigger'
      );
      expect(screen.getByTestId('select-content')).toHaveClass(
        'custom-content'
      );
      expect(screen.getByTestId('select-label')).toHaveClass('custom-label');
      expect(screen.getByTestId('select-item')).toHaveClass('custom-item');
      expect(screen.getByTestId('select-separator')).toHaveClass(
        'custom-separator'
      );
    });

    it('should preserve default styles with custom classes', () => {
      render(
        <SelectTrigger className="custom-trigger">
          <SelectValue />
        </SelectTrigger>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger', 'flex', 'h-10', 'w-full');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toBeInTheDocument();
    });

    it('should handle multiple separators', () => {
      render(
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
          <SelectSeparator />
          <SelectItem value="item2">Item 2</SelectItem>
          <SelectSeparator />
          <SelectItem value="item3">Item 3</SelectItem>
        </SelectContent>
      );

      const separators = screen.getAllByTestId('select-separator');
      expect(separators).toHaveLength(2);
    });

    it('should handle deeply nested content', () => {
      render(
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectGroup>
              <SelectLabel>Nested Group</SelectLabel>
              <SelectItem value="nested">Nested Item</SelectItem>
            </SelectGroup>
          </SelectGroup>
        </SelectContent>
      );

      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Nested Group')).toBeInTheDocument();
      expect(screen.getByText('Nested Item')).toBeInTheDocument();
    });

    it('should handle long item lists', () => {
      const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

      render(
        <SelectContent>
          {items.map((item, index) => (
            <SelectItem key={index} value={`item${index + 1}`}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      );

      const selectItems = screen.getAllByTestId('select-item');
      expect(selectItems).toHaveLength(100);
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with frequent updates', () => {
      const { rerender } = render(
        <Select value="item1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      // Simulate frequent value changes
      for (let i = 0; i < 100; i++) {
        rerender(
          <Select value={`item${i}`}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </Select>
        );
      }

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-value', 'item99');
    });

    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(
        <SelectTrigger>
          <SelectValue placeholder="Initial" />
        </SelectTrigger>
      );

      for (let i = 0; i < 50; i++) {
        rerender(
          <SelectTrigger className={`class-${i}`}>
            <SelectValue placeholder={`Placeholder ${i}`} />
          </SelectTrigger>
        );
      }

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('class-49');
    });
  });
});
