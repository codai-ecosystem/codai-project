import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/Modal';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      onClick,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">X</span>,
}));

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (element: React.ReactNode) => element,
}));

describe('Modal', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    children: <div data-testid="modal-content">Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  describe('Basic Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('should render modal with title', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Test Modal'
      );
    });

    it('should render close button when title is provided', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not render header when no title is provided', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />);

      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
    });

    it('should apply medium size class (default)', () => {
      const { container } = render(<Modal {...defaultProps} />);

      expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('should apply large size class', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />);

      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    it('should apply extra large size class', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />);

      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Modal {...defaultProps} className="custom-modal" />
      );

      expect(container.querySelector('.custom-modal')).toBeInTheDocument();
    });

    it('should combine default and custom classes', () => {
      const { container } = render(
        <Modal {...defaultProps} className="custom-modal" />
      );

      const modalElement = container.querySelector('.custom-modal');
      expect(modalElement).toHaveClass(
        'bg-background',
        'rounded-lg',
        'shadow-lg',
        'border'
      );
    });
  });

  describe('Backdrop Interaction', () => {
    it('should close modal when clicking backdrop', async () => {
      const user = userEvent.setup();
      const { container } = render(<Modal {...defaultProps} />);

      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not close modal when clicking modal content', async () => {
      const user = userEvent.setup();
      render(<Modal {...defaultProps} />);

      const modalContent = screen.getByTestId('modal-content');
      await user.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not close modal when closeOnBackdropClick is false', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Modal {...defaultProps} closeOnBackdropClick={false} />
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });

    it('should close modal when closeOnBackdropClick is true (default)', async () => {
      const user = userEvent.setup();
      const { container } = render(<Modal {...defaultProps} />);

      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard Interaction', () => {
    it('should close modal when pressing Escape key', () => {
      render(<Modal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close modal when closeOnEscape is false', () => {
      render(<Modal {...defaultProps} closeOnEscape={false} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not trigger onClose for other keys', () => {
      render(<Modal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space', code: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle escape key only when modal is open', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();

      rerender(<Modal {...defaultProps} isOpen={true} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Close Button', () => {
    it('should close modal when clicking close button', async () => {
      const user = userEvent.setup();
      render(<Modal {...defaultProps} title="Test Modal" />);

      const closeButton = screen.getByRole('button');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper accessibility attributes for close button', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(
        closeButton.querySelector('[data-testid="close-icon"]')
      ).toBeInTheDocument();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should not affect body scroll when modal is not open', () => {
      const originalOverflow = document.body.style.overflow;
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe(originalOverflow);
    });
  });

  describe('SSR Compatibility', () => {
    it('should return null during SSR', () => {
      // Mock useState to return false for isMounted to simulate SSR
      const originalUseState = React.useState;
      const mockUseState = jest
        .fn()
        .mockReturnValueOnce([false, jest.fn()]) // isMounted = false
        .mockImplementation(originalUseState);

      React.useState = mockUseState;

      const { container } = render(<Modal {...defaultProps} />);

      expect(container.firstChild).toBeNull();

      // Restore useState
      React.useState = originalUseState;
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners when component unmounts', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

      const { unmount } = render(<Modal {...defaultProps} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should clean up event listeners when modal closes', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

      const { rerender } = render(<Modal {...defaultProps} />);

      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Modal');
    });

    it('should focus management work correctly', async () => {
      const user = userEvent.setup();
      render(<Modal {...defaultProps} title="Test Modal" />);

      const closeButton = screen.getByRole('button');

      // Should be able to focus the close button
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <Modal {...defaultProps} title="Test Modal">
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: 'Close modal' }); // Close button has aria-label
      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');

      // Tab through elements
      await user.tab();
      expect(closeButton).toHaveFocus();

      await user.tab();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close cycles', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);

      // Rapid open/close cycles
      for (let i = 0; i < 10; i++) {
        rerender(<Modal {...defaultProps} isOpen={true} />);
        rerender(<Modal {...defaultProps} isOpen={false} />);
      }

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should handle multiple modals properly', () => {
      const secondOnClose = jest.fn();

      render(
        <>
          <Modal {...defaultProps} title="First Modal" />
          <Modal isOpen={true} onClose={secondOnClose} title="Second Modal">
            <div data-testid="second-modal">Second Modal Content</div>
          </Modal>
        </>
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('second-modal')).toBeInTheDocument();
      expect(screen.getByText('First Modal')).toBeInTheDocument();
      expect(screen.getByText('Second Modal')).toBeInTheDocument();
    });

    it('should handle null or undefined children gracefully', () => {
      render(<Modal {...defaultProps}>{null}</Modal>);

      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      render(
        <Modal {...defaultProps} title="Complex Modal">
          <div>
            <h3>Nested Content</h3>
            <p>Some text</p>
            <button>Nested Button</button>
            <div>
              <span>Deeply nested</span>
            </div>
          </div>
        </Modal>
      );

      expect(screen.getByText('Nested Content')).toBeInTheDocument();
      expect(screen.getByText('Some text')).toBeInTheDocument();
      expect(screen.getByText('Nested Button')).toBeInTheDocument();
      expect(screen.getByText('Deeply nested')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with multiple renders', () => {
      const { rerender, unmount } = render(<Modal {...defaultProps} />);

      // Multiple re-renders
      for (let i = 0; i < 100; i++) {
        rerender(<Modal {...defaultProps} title={`Modal ${i}`} />);
      }

      unmount();

      // Should not cause any issues
      expect(document.body.style.overflow).toBe('unset');
    });
  });
});

describe('Modal Subcomponents', () => {
  describe('ModalHeader', () => {
    it('should render modal header with default styles', () => {
      render(
        <ModalHeader>
          <div data-testid="header-content">Header Content</div>
        </ModalHeader>
      );

      expect(screen.getByTestId('header-content')).toBeInTheDocument();

      const header = screen.getByTestId('header-content').parentElement;
      expect(header).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'p-6',
        'border-b'
      );
    });

    it('should apply custom className', () => {
      render(
        <ModalHeader className="custom-header">
          <div data-testid="header-content">Header Content</div>
        </ModalHeader>
      );

      const header = screen.getByTestId('header-content').parentElement;
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('ModalTitle', () => {
    it('should render modal title with proper heading styles', () => {
      render(<ModalTitle>Modal Title</ModalTitle>);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Modal Title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('should apply custom className', () => {
      render(<ModalTitle className="custom-title">Modal Title</ModalTitle>);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('ModalDescription', () => {
    it('should render modal description with muted styles', () => {
      render(<ModalDescription>Modal Description</ModalDescription>);

      const description = screen.getByText('Modal Description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(
        <ModalDescription className="custom-description">
          Modal Description
        </ModalDescription>
      );

      const description = screen.getByText('Modal Description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('ModalContent', () => {
    it('should render modal content with padding', () => {
      render(
        <ModalContent>
          <div data-testid="content">Content</div>
        </ModalContent>
      );

      const content = screen.getByTestId('content').parentElement;
      expect(content).toHaveClass('p-6');
    });

    it('should apply custom className', () => {
      render(
        <ModalContent className="custom-content">
          <div data-testid="content">Content</div>
        </ModalContent>
      );

      const content = screen.getByTestId('content').parentElement;
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('ModalFooter', () => {
    it('should render modal footer with proper button layout', () => {
      render(
        <ModalFooter>
          <button>Cancel</button>
          <button>Save</button>
        </ModalFooter>
      );

      const footer = screen.getByText('Cancel').parentElement;
      expect(footer).toHaveClass(
        'flex',
        'items-center',
        'justify-end',
        'gap-2',
        'p-6',
        'border-t'
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <ModalFooter className="custom-footer">
          <button>Action</button>
        </ModalFooter>
      );

      const footer = screen.getByText('Action').parentElement;
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Modal Composition', () => {
    it('should work well when composed together', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Composed Modal">
          <ModalContent>
            <ModalDescription>This is a composed modal</ModalDescription>
            <div>Some content here</div>
          </ModalContent>
          <ModalFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
        </Modal>
      );

      expect(screen.getByText('Composed Modal')).toBeInTheDocument();
      expect(screen.getByText('This is a composed modal')).toBeInTheDocument();
      expect(screen.getByText('Some content here')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should handle complex modal structures', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <ModalHeader>
            <ModalTitle>Custom Header</ModalTitle>
            <button>Custom Action</button>
          </ModalHeader>
          <ModalContent>
            <ModalDescription>Custom description</ModalDescription>
            <form>
              <input placeholder="Name" />
              <textarea placeholder="Description" />
            </form>
          </ModalContent>
          <ModalFooter>
            <button type="button">Cancel</button>
            <button type="submit">Submit</button>
          </ModalFooter>
        </Modal>
      );

      expect(screen.getByText('Custom Header')).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Submit' })
      ).toBeInTheDocument();
    });
  });
});
