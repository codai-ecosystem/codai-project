// Phase 2 Component Testing Suite - OPTIMIZED VERSION (React act() warnings fixed)
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { useState } from 'react'

describe('Phase 2 Complete Component Testing Suite - OPTIMIZED', () => {

  describe('SimpleCard Component', () => {
    // Component Definition
    const SimpleCard = ({ title, content, theme = 'light' }) => (
      <div className={`card ${theme}`}>
        <h3 className="card-title">{title}</h3>
        <p className="card-content">{content}</p>
      </div>
    )

    test('renders with title and content', () => {
      render(<SimpleCard title="Test Title" content="Test Content" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    test('handles different props correctly', () => {
      render(<SimpleCard title="Dynamic Title" content="Dynamic Content" theme="dark" />)
      expect(screen.getByText('Dynamic Title')).toBeInTheDocument()
      expect(screen.getByText('Dynamic Content')).toBeInTheDocument()
      expect(screen.getByText('Dynamic Title').closest('.card')).toHaveClass('dark')
    })

    test('applies default theme when not specified', () => {
      render(<SimpleCard title="Default Theme" content="Content" />)
      expect(screen.getByText('Default Theme').closest('.card')).toHaveClass('light')
    })

    test('renders with proper structure', () => {
      render(<SimpleCard title="Structure Test" content="Structure Content" />)
      const cardElement = screen.getByText('Structure Test').closest('.card')
      expect(cardElement).toBeInTheDocument()
      expect(cardElement.querySelector('.card-title')).toBeInTheDocument()
      expect(cardElement.querySelector('.card-content')).toBeInTheDocument()
    })

    test('handles empty content gracefully', () => {
      render(<SimpleCard title="Empty Content" content="" />)
      expect(screen.getByText('Empty Content')).toBeInTheDocument()
      expect(screen.getByText('')).toBeInTheDocument()
    })
  })

  describe('Counter Component', () => {
    // Component Definition with useState
    const Counter = ({ onValueChange }) => {
      const [count, setCount] = useState(0)

      const increment = () => {
        const newCount = count + 1
        setCount(newCount)
        if (onValueChange) onValueChange(newCount)
      }

      const decrement = () => {
        const newCount = count - 1
        setCount(newCount)
        if (onValueChange) onValueChange(newCount)
      }

      return (
        <div className="counter">
          <button onClick={decrement} aria-label="decrement">-</button>
          <span data-testid="count-display">{count}</span>
          <button onClick={increment} aria-label="increment">+</button>
        </div>
      )
    }

    test('renders with initial count of 0', () => {
      render(<Counter />)
      expect(screen.getByTestId('count-display')).toHaveTextContent('0')
    })

    test('increments count when increment button clicked', async () => {
      render(<Counter />)
      const incrementBtn = screen.getByLabelText('increment')

      await act(async () => {
        fireEvent.click(incrementBtn)
      })

      expect(screen.getByTestId('count-display')).toHaveTextContent('1')
    })

    test('decrements count when decrement button clicked', async () => {
      render(<Counter />)
      const decrementBtn = screen.getByLabelText('decrement')

      await act(async () => {
        fireEvent.click(decrementBtn)
      })

      expect(screen.getByTestId('count-display')).toHaveTextContent('-1')
    })

    test('calls onValueChange callback when value changes', async () => {
      const mockCallback = vi.fn()
      render(<Counter onValueChange={mockCallback} />)
      const incrementBtn = screen.getByLabelText('increment')

      await act(async () => {
        fireEvent.click(incrementBtn)
      })

      expect(mockCallback).toHaveBeenCalledWith(1)
    })

    test('handles multiple increments correctly', async () => {
      render(<Counter />)
      const incrementBtn = screen.getByLabelText('increment')

      await act(async () => {
        fireEvent.click(incrementBtn)
      })
      await act(async () => {
        fireEvent.click(incrementBtn)
      })
      await act(async () => {
        fireEvent.click(incrementBtn)
      })

      expect(screen.getByTestId('count-display')).toHaveTextContent('3')
    })
  })

  describe('ContactForm Component', () => {
    // Component Definition with form validation
    const ContactForm = ({ onSubmit }) => {
      const [formData, setFormData] = useState({ name: '', email: '', message: '' })
      const [errors, setErrors] = useState({})

      const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      }

      const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }))
        }
      }

      const handleSubmit = (e) => {
        e.preventDefault()
        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.message.trim()) newErrors.message = 'Message is required'

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0 && onSubmit) {
          onSubmit(formData)
        }
      }

      return (
        <form onSubmit={handleSubmit} className="contact-form">
          <div>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
            />
            {errors.message && <span className="error">{errors.message}</span>}
          </div>

          <button type="submit">Submit</button>
        </form>
      )
    }

    test('renders all form fields', () => {
      render(<ContactForm />)
      expect(screen.getByLabelText('Name:')).toBeInTheDocument()
      expect(screen.getByLabelText('Email:')).toBeInTheDocument()
      expect(screen.getByLabelText('Message:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    test('updates input values when user types', async () => {
      render(<ContactForm />)
      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')
      const messageInput = screen.getByLabelText('Message:')

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.change(messageInput, { target: { value: 'Hello World' } })
      })

      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(messageInput).toHaveValue('Hello World')
    })

    test('shows validation errors for empty required fields', async () => {
      render(<ContactForm />)
      const submitBtn = screen.getByRole('button', { name: 'Submit' })

      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Message is required')).toBeInTheDocument()
    })

    test('shows validation error for invalid email format', async () => {
      render(<ContactForm />)
      const emailInput = screen.getByLabelText('Email:')
      const submitBtn = screen.getByRole('button', { name: 'Submit' })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.click(submitBtn)
      })

      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })

    test('calls onSubmit with form data when validation passes', async () => {
      const mockSubmit = vi.fn()
      render(<ContactForm onSubmit={mockSubmit} />)

      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')
      const messageInput = screen.getByLabelText('Message:')
      const submitBtn = screen.getByRole('button', { name: 'Submit' })

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.change(messageInput, { target: { value: 'Hello World' } })
        fireEvent.click(submitBtn)
      })

      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello World'
      })
    })

    test('clears errors when user starts typing after validation error', async () => {
      render(<ContactForm />)
      const nameInput = screen.getByLabelText('Name:')
      const submitBtn = screen.getByRole('button', { name: 'Submit' })

      // Trigger validation error
      await act(async () => {
        fireEvent.click(submitBtn)
      })
      expect(screen.getByText('Name is required')).toBeInTheDocument()

      // Start typing to clear error
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'J' } })
      })
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })
  })

  describe('Integration Testing', () => {
    test('all components can be rendered together', () => {
      const App = () => (
        <div>
          <SimpleCard title="Test Card" content="Content" />
          <Counter onValueChange={() => { }} />
          <ContactForm onSubmit={() => { }} />
        </div>
      )

      render(<App />)

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByTestId('count-display')).toBeInTheDocument()
      expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    })

    test('components maintain independent state', async () => {
      const App = () => (
        <div>
          <Counter />
          <Counter />
        </div>
      )

      render(<App />)

      const incrementBtns = screen.getAllByLabelText('increment')

      await act(async () => {
        fireEvent.click(incrementBtns[0])
      })

      const countDisplays = screen.getAllByTestId('count-display')
      expect(countDisplays[0]).toHaveTextContent('1')
      expect(countDisplays[1]).toHaveTextContent('0')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('Counter handles rapid clicks', async () => {
      render(<Counter />)
      const incrementBtn = screen.getByLabelText('increment')

      // Rapid clicks
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          fireEvent.click(incrementBtn)
        }
      })

      expect(screen.getByTestId('count-display')).toHaveTextContent('10')
    })

    test('ContactForm handles special characters in input', async () => {
      render(<ContactForm />)
      const nameInput = screen.getByLabelText('Name:')

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'José María' } })
      })

      expect(nameInput).toHaveValue('José María')
    })

    test('SimpleCard handles very long content', () => {
      const longContent = 'This is a very long content that should be handled gracefully by the component even if it contains a lot of text and special characters like @#$%^&*()!'

      render(<SimpleCard title="Long Content Test" content={longContent} />)
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })
})
