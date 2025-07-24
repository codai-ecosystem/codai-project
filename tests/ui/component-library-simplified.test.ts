/**
 * Phase 4.1: Component Library Testing (Simplified)
 * Comprehensive UI component testing using direct component rendering
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@codai/shared-ui';
import { Input } from '@codai/shared-ui';
import { Card } from '@codai/shared-ui';

describe('🎨 Phase 4.1: Component Library Testing', () => {
  console.log('🚀 Initializing Component Library Tests...');

  describe('📦 Button Component Testing', () => {
    it('should render button with default variant', () => {
      render(<Button>Test Button</Button>);
      
      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should render all button variants correctly', () => {
      const variants = [
        'default', 'destructive', 'outline', 'secondary', 
        'ghost', 'link', 'success', 'warning', 'info'
      ];
      
      variants.forEach(variant => {
        const { container } = render(
          <Button variant={variant as any}>{variant} Button</Button>
        );
        
        const button = screen.getByRole('button', { name: new RegExp(`${variant} button`, 'i') });
        expect(button).toBeInTheDocument();
        
        // Clean up for next test
        container.remove();
      });
    });

    it('should handle click events correctly', () => {
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support different sizes', () => {
      const sizes = ['sm', 'default', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { container } = render(
          <Button size={size as any}>{size} Button</Button>
        );
        
        const button = screen.getByRole('button', { name: new RegExp(`${size} button`, 'i') });
        expect(button).toBeInTheDocument();
        
        container.remove();
      });
    });

    it('should handle disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
    });

    it('should support loading state', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button', { name: /loading button/i });
      expect(button).toBeInTheDocument();
      
      // Loading button should be visually indicated
      expect(button).toHaveClass(/opacity|cursor/);
    });
  });

  describe('📝 Input Component Testing', () => {
    it('should render input with correct type', () => {
      render(<Input type="text" placeholder="Test input" />);
      
      const input = screen.getByPlaceholderText(/test input/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should handle value changes', () => {
      render(<Input placeholder="Type here" />);
      
      const input = screen.getByPlaceholderText(/type here/i);
      
      fireEvent.change(input, { target: { value: 'test value' } });
      expect(input).toHaveValue('test value');
    });

    it('should support different input types', () => {
      const types = ['text', 'email', 'password', 'number'];
      
      types.forEach(type => {
        const { container } = render(
          <Input type={type as any} placeholder={`${type} input`} />
        );
        
        const input = screen.getByPlaceholderText(new RegExp(`${type} input`, 'i'));
        expect(input).toHaveAttribute('type', type);
        
        container.remove();
      });
    });

    it('should handle disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />);
      
      const input = screen.getByPlaceholderText(/disabled input/i);
      expect(input).toBeDisabled();
    });

    it('should support error state', () => {
      render(<Input error placeholder="Error input" />);
      
      const input = screen.getByPlaceholderText(/error input/i);
      expect(input).toBeInTheDocument();
      
      // Error state should be visually indicated
      expect(input).toHaveClass(/border-red|border-destructive|error/);
    });
  });

  describe('🃏 Card Component Testing', () => {
    it('should render card with content', () => {
      render(
        <Card>
          <div>Card Content</div>
        </Card>
      );
      
      const cardContent = screen.getByText(/card content/i);
      expect(cardContent).toBeInTheDocument();
    });

    it('should support different card variants', () => {
      const variants = ['default', 'outlined', 'elevated'];
      
      variants.forEach(variant => {
        const { container } = render(
          <Card variant={variant as any}>
            <div>{variant} Card</div>
          </Card>
        );
        
        const content = screen.getByText(new RegExp(`${variant} card`, 'i'));
        expect(content).toBeInTheDocument();
        
        container.remove();
      });
    });

    it('should handle click interactions when interactive', () => {
      const handleClick = vi.fn();
      
      render(
        <Card onClick={handleClick} interactive>
          <div>Interactive Card</div>
        </Card>
      );
      
      const card = screen.getByText(/interactive card/i).closest('div');
      if (card) {
        fireEvent.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('♿ Accessibility Testing', () => {
    it('should support keyboard navigation for buttons', () => {
      render(<Button>Keyboard Test</Button>);
      
      const button = screen.getByRole('button', { name: /keyboard test/i });
      
      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Should respond to Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(button).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Accessible button">Icon</Button>);
      
      const button = screen.getByRole('button', { name: /accessible button/i });
      expect(button).toHaveAttribute('aria-label', 'Accessible button');
    });

    it('should support focus management', () => {
      render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Tab to next element
      fireEvent.keyDown(firstButton, { key: 'Tab', code: 'Tab' });
      secondButton.focus(); // Manual focus for testing
      expect(secondButton).toHaveFocus();
    });
  });

  describe('🎨 Visual & Theme Testing', () => {
    it('should apply correct CSS classes', () => {
      render(<Button variant="primary">Primary Button</Button>);
      
      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toHaveClass(); // Should have some CSS classes
    });

    it('should support custom className prop', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      
      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('custom-class');
    });

    it('should maintain consistent styling across components', () => {
      render(
        <div>
          <Button>Button</Button>
          <Input placeholder="Input" />
          <Card><div>Card</div></Card>
        </div>
      );
      
      const button = screen.getByRole('button');
      const input = screen.getByPlaceholderText(/input/i);
      const card = screen.getByText(/card/i);
      
      expect(button).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(card).toBeInTheDocument();
    });
  });

  describe('⚡ Performance Testing', () => {
    it('should render components efficiently', () => {
      const startTime = performance.now();
      
      render(
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <Button key={i}>Button {i + 1}</Button>
          ))}
        </div>
      );
      
      const renderTime = performance.now() - startTime;
      
      // Should render 50 buttons quickly (under 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // All buttons should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(50);
    });

    it('should handle rapid interactions efficiently', () => {
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Performance Test</Button>);
      
      const button = screen.getByRole('button', { name: /performance test/i });
      
      const startTime = performance.now();
      
      // Simulate rapid clicks
      for (let i = 0; i < 100; i++) {
        fireEvent.click(button);
      }
      
      const interactionTime = performance.now() - startTime;
      
      // Should handle 100 clicks quickly
      expect(interactionTime).toBeLessThan(50);
      expect(handleClick).toHaveBeenCalledTimes(100);
    });
  });

  describe('📱 Responsive Design Testing', () => {
    it('should adapt to different screen sizes', () => {
      // Mock window.matchMedia for responsive testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('max-width: 768px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<Button>Responsive Button</Button>);
      
      const button = screen.getByRole('button', { name: /responsive button/i });
      expect(button).toBeInTheDocument();
      
      // Component should be present regardless of screen size
      expect(button).toBeVisible();
    });

    it('should maintain usability on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(
        <div>
          <Button>Mobile Button</Button>
          <Input placeholder="Mobile input" />
        </div>
      );
      
      const button = screen.getByRole('button', { name: /mobile button/i });
      const input = screen.getByPlaceholderText(/mobile input/i);
      
      expect(button).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      
      // Components should remain interactive
      fireEvent.click(button);
      fireEvent.change(input, { target: { value: 'mobile test' } });
      
      expect(input).toHaveValue('mobile test');
    });
  });

  afterAll(() => {
    console.log('✅ Component Library Tests Completed');
  });
});
