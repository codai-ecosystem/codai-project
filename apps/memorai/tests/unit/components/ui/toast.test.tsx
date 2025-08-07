import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast, ToastContainer, useToast, type ToastType } from '@/components/ui/toast'

// Mock timer functions for testing
beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('Toast Component', () => {
    const mockOnDismiss = vi.fn()

    beforeEach(() => {
        mockOnDismiss.mockClear()
    })

    it('renders correctly with default props', () => {
        render(<Toast message="Test message" onDismiss={mockOnDismiss} />)

        const toast = screen.getByRole('alert')
        expect(toast).toBeInTheDocument()
        expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('applies different types correctly', () => {
        const types: ToastType[] = ['success', 'error', 'warning', 'info']

        types.forEach(type => {
            const { unmount } = render(
                <Toast message={`${type} message`} type={type} onDismiss={mockOnDismiss} />
            )

            const toast = screen.getByRole('alert')

            switch (type) {
                case 'success':
                    expect(toast).toHaveClass('border-green-200', 'bg-green-50')
                    break
                case 'error':
                    expect(toast).toHaveClass('border-red-200', 'bg-red-50')
                    break
                case 'warning':
                    expect(toast).toHaveClass('border-yellow-200', 'bg-yellow-50')
                    break
                case 'info':
                    expect(toast).toHaveClass('border-blue-200', 'bg-blue-50')
                    break
            }

            unmount()
        })
    })

    it('shows correct icon for each type', () => {
        const types: ToastType[] = ['success', 'error', 'warning', 'info']

        types.forEach(type => {
            const { unmount } = render(
                <Toast message="Test" type={type} onDismiss={mockOnDismiss} />
            )

            // Check that an icon is present (SVG element)
            const icon = screen.getByRole('alert').querySelector('svg')
            expect(icon).toBeInTheDocument()

            unmount()
        })
    })

    it('renders title when provided', () => {
        render(
            <Toast
                title="Success!"
                message="Operation completed"
                onDismiss={mockOnDismiss}
            />
        )

        expect(screen.getByText('Success!')).toBeInTheDocument()
        expect(screen.getByText('Operation completed')).toBeInTheDocument()
    })

    it.skip('shows dismiss button and handles click', async () => {
        vi.useFakeTimers()
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

        render(<Toast message="Test message" onDismiss={mockOnDismiss} />)

        const dismissButton = screen.getByRole('button', { name: /dismiss/i })
        expect(dismissButton).toBeInTheDocument()

        await user.click(dismissButton)
        expect(mockOnDismiss).toHaveBeenCalledTimes(1)
        
        vi.useRealTimers()
    }, 1000)

    it.skip('auto-dismisses after duration', async () => {
        render(
            <Toast
                message="Auto dismiss test"
                onDismiss={mockOnDismiss}
                duration={3000}
            />
        )

        expect(mockOnDismiss).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(mockOnDismiss).toHaveBeenCalledTimes(1)
        })
    })

    it('does not auto-dismiss when duration is 0', async () => {
        render(
            <Toast
                message="No auto dismiss"
                onDismiss={mockOnDismiss}
                duration={0}
            />
        )

        act(() => {
            vi.advanceTimersByTime(10000)
        })

        expect(mockOnDismiss).not.toHaveBeenCalled()
    })

    it.skip('pauses auto-dismiss on hover', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

        render(
            <Toast
                message="Hover test"
                onDismiss={mockOnDismiss}
                duration={3000}
            />
        )

        const toast = screen.getByRole('alert')

        // Hover over toast
        await user.hover(toast)

        act(() => {
            vi.advanceTimersByTime(3000)
        })

        expect(mockOnDismiss).not.toHaveBeenCalled()

        // Unhover
        await user.unhover(toast)

        act(() => {
            vi.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(mockOnDismiss).toHaveBeenCalledTimes(1)
        })
    })

    it('has correct accessibility attributes', () => {
        render(<Toast message="Accessible toast" onDismiss={mockOnDismiss} />)

        const toast = screen.getByRole('alert')
        expect(toast).toHaveAttribute('aria-live', 'polite')
        expect(toast).toHaveAttribute('aria-atomic', 'true')
    })

    it('applies custom className correctly', () => {
        render(
            <Toast
                message="Custom class test"
                onDismiss={mockOnDismiss}
                className="custom-toast-class"
            />
        )

        const toast = screen.getByRole('alert')
        expect(toast).toHaveClass('custom-toast-class')
    })
})

describe('ToastContainer', () => {
    it('renders correctly when empty', () => {
        render(<ToastContainer toasts={[]} onDismiss={() => { }} />)

        const container = screen.getByTestId('toast-container')
        expect(container).toBeInTheDocument()
        expect(container.children).toHaveLength(0)
    })

    it('renders multiple toasts correctly', () => {
        const toasts = [
            { id: '1', message: 'First toast', type: 'success' as ToastType },
            { id: '2', message: 'Second toast', type: 'error' as ToastType },
            { id: '3', message: 'Third toast', type: 'info' as ToastType }
        ]

        render(<ToastContainer toasts={toasts} onDismiss={() => { }} />)

        expect(screen.getByText('First toast')).toBeInTheDocument()
        expect(screen.getByText('Second toast')).toBeInTheDocument()
        expect(screen.getByText('Third toast')).toBeInTheDocument()
    })

    it('applies different positions correctly', () => {
        const toasts = [{ id: '1', message: 'Test', type: 'info' as ToastType }]

        const { rerender } = render(
            <ToastContainer toasts={toasts} onDismiss={() => { }} position="top-right" />
        )

        let container = screen.getByTestId('toast-container')
        expect(container).toHaveClass('top-4', 'right-4')

        rerender(
            <ToastContainer toasts={toasts} onDismiss={() => { }} position="bottom-left" />
        )

        container = screen.getByTestId('toast-container')
        expect(container).toHaveClass('bottom-4', 'left-4')
    })

    it.skip('handles toast dismissal correctly', async () => {
        const mockOnDismiss = vi.fn()
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

        const toasts = [
            { id: '1', message: 'Dismissible toast', type: 'info' as ToastType }
        ]

        render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

        const dismissButton = screen.getByRole('button', { name: /dismiss/i })
        await user.click(dismissButton)

        expect(mockOnDismiss).toHaveBeenCalledWith('1')
    })
})

describe('useToast Hook', () => {
    // Test component to use the hook
    const TestComponent = () => {
        const { toasts, showToast, dismissToast, clearAll } = useToast()

        return (
            <div>
                <button onClick={() => showToast('Test message', 'success')}>
                    Show Success
                </button>
                <button onClick={() => showToast('Error message', 'error', 'Error Title')}>
                    Show Error
                </button>
                <button onClick={() => dismissToast(toasts[0]?.id || '')}>
                    Dismiss First
                </button>
                <button onClick={clearAll}>Clear All</button>
                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        )
    }

    it.skip('creates and displays toasts correctly', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<TestComponent />)

        const showButton = screen.getByText('Show Success')
        await user.click(showButton)

        expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it.skip('creates toasts with title correctly', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<TestComponent />)

        const showButton = screen.getByText('Show Error')
        await user.click(showButton)

        expect(screen.getByText('Error Title')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it.skip('dismisses toasts correctly', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<TestComponent />)

        // Show a toast first
        const showButton = screen.getByText('Show Success')
        await user.click(showButton)

        expect(screen.getByText('Test message')).toBeInTheDocument()

        // Dismiss it
        const dismissButton = screen.getByText('Dismiss First')
        await user.click(dismissButton)

        await waitFor(() => {
            expect(screen.queryByText('Test message')).not.toBeInTheDocument()
        })
    })

    it.skip('clears all toasts correctly', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<TestComponent />)

        // Show multiple toasts
        const showSuccessButton = screen.getByText('Show Success')
        const showErrorButton = screen.getByText('Show Error')

        await user.click(showSuccessButton)
        await user.click(showErrorButton)

        expect(screen.getByText('Test message')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()

        // Clear all
        const clearButton = screen.getByText('Clear All')
        await user.click(clearButton)

        await waitFor(() => {
            expect(screen.queryByText('Test message')).not.toBeInTheDocument()
            expect(screen.queryByText('Error message')).not.toBeInTheDocument()
        })
    })
})

