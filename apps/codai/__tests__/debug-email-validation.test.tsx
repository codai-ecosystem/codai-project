// Debug test to check email validation logic
import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { useState } from 'react'

describe('Email Validation Debug', () => {
    test('debug email validation logic', () => {
        const validateEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        }

        // Test the regex directly
        expect(validateEmail('valid@example.com')).toBe(true)
        expect(validateEmail('invalid-email')).toBe(false)
        expect(validateEmail('')).toBe(false)
        expect(validateEmail('test@')).toBe(false)
        expect(validateEmail('@test.com')).toBe(false)
    })

    test('debug form submission with invalid email', async () => {
        // Copy the exact ContactForm logic
        const DebugContactForm = ({ onSubmit }) => {
            const [formData, setFormData] = useState({ name: '', email: '', message: '' })
            const [errors, setErrors] = useState({})

            console.log('Current errors state:', errors)

            const validateEmail = (email) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            }

            const handleInputChange = (e) => {
                const { name, value } = e.target
                console.log(`Input change: ${name} = "${value}"`)
                setFormData(prev => ({ ...prev, [name]: value }))
                if (errors[name]) {
                    setErrors(prev => ({ ...prev, [name]: '' }))
                }
                console.log('Current errors state:', errors)
            }

            const handleSubmit = (e) => {
                e.preventDefault()
                console.log('About to submit form directly')

                const newErrors = {}
                console.log('Form submitted with data:', formData)

                if (!formData.name.trim()) newErrors.name = 'Name is required'
                if (!formData.email.trim()) newErrors.email = 'Email is required'
                else if (!validateEmail(formData.email)) {
                    console.log(`Validating email "${formData.email}":`, validateEmail(formData.email))
                    newErrors.email = 'Invalid email format'
                }
                if (!formData.message.trim()) newErrors.message = 'Message is required'

                console.log('Validation errors:', newErrors)
                setErrors(newErrors)

                if (Object.keys(newErrors).length === 0 && onSubmit) {
                    onSubmit(formData)
                }
                console.log('Submitted form directly')
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

        render(<DebugContactForm />)
        console.log('Initial form state')

        const nameInput = screen.getByLabelText('Name:')
        const emailInput = screen.getByLabelText('Email:')
        const messageInput = screen.getByLabelText('Message:')
        const submitBtn = screen.getByRole('button', { name: 'Submit' })

        await act(async () => {
            fireEvent.change(nameInput, { target: { value: 'John Doe' } })
            fireEvent.change(messageInput, { target: { value: 'Test message' } })
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        })

        console.log('After filling form')
        console.log('About to click submit button')

        await act(async () => {
            fireEvent.click(submitBtn)
        })

        console.log('Clicked submit button')
        console.log('After submitting form')

        // Debug: print the DOM
        console.log('DOM after submit:', document.body.innerHTML)

        // Try to find the email error
        const emailError = screen.queryByTestId('email-error')
        console.log('Email error by test id:', emailError)

        const allErrors = screen.queryAllByText('Invalid email format')
        console.log('All errors by text:', allErrors)

        const errorElements = document.querySelectorAll('.error')
        console.log('All error elements by class:', errorElements)

        expect(emailError).toBeInTheDocument()
    })
})
