import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { useState } from 'react'

// Copy the exact ContactForm component to debug
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && onSubmit) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" data-testid="contact-form">
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
        />
        {errors.name && <span className="error" data-testid="name-error">{errors.name}</span>}
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
        {errors.email && <span className="error" data-testid="email-error">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
        />
        {errors.message && <span className="error" data-testid="message-error">{errors.message}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}

describe('Email Validation Debug', () => {
  test('debug email validation logic', () => {
    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Test the validation logic directly
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('not-an-email')).toBe(false)
    expect(validateEmail('valid@email.com')).toBe(true)
  })

  test('debug form submission with invalid email', async () => {
    let formSubmissionSpy;

    // Create component with console logs for debugging
    const DebugContactForm = ({ onSubmit }) => {
      const [formData, setFormData] = useState({ name: '', email: '', message: '' })
      const [errors, setErrors] = useState({})

      const validateEmail = (email) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        console.log(`Validating email "${email}": ${isValid}`)
        return isValid
      }

      const handleInputChange = (e) => {
        const { name, value } = e.target
        console.log(`Input change: ${name} = "${value}"`)
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }))
        }
      }

      const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted with data:', formData)

        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Invalid email format'
        }
        if (!formData.message.trim()) newErrors.message = 'Message is required'

        console.log('Validation errors:', newErrors)
        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0 && onSubmit) {
          onSubmit(formData)
        }
      }

      console.log('Current errors state:', errors)

      return (
        <form onSubmit={handleSubmit} className="contact-form" data-testid="contact-form">
          <div>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="error" data-testid="name-error">{errors.name}</span>}
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
            {errors.email && <span className="error" data-testid="email-error">{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
            />
            {errors.message && <span className="error" data-testid="message-error">{errors.message}</span>}
          </div>

          <button type="submit">Submit</button>
        </form>
      )
    }

    render(<DebugContactForm />)
    const emailInput = screen.getByLabelText('Email:')
    const nameInput = screen.getByLabelText('Name:')
    const messageInput = screen.getByLabelText('Message:')
    const submitBtn = screen.getByRole('button', { name: 'Submit' })

    console.log('Initial form state')

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(messageInput, { target: { value: 'Test message' } })
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    })

    console.log('After filling form')

    await act(async () => {
      console.log('About to click submit button')
      fireEvent.click(submitBtn)
      console.log('Clicked submit button')
    })

    // Also try submitting the form directly
    await act(async () => {
      console.log('About to submit form directly')
      fireEvent.submit(screen.getByTestId('contact-form'))
      console.log('Submitted form directly')
    })

    console.log('After submitting form')
    console.log('DOM after submit:', document.body.innerHTML)

    // Try to find error element using different selectors
    const emailErrorByTestId = screen.queryByTestId('email-error')
    const allErrors = screen.queryAllByText(/error/i)
    const allErrorElements = document.querySelectorAll('.error')

    console.log('Email error by test id:', emailErrorByTestId)
    console.log('All errors by text:', allErrors)
    console.log('All error elements by class:', allErrorElements)
  })
})
