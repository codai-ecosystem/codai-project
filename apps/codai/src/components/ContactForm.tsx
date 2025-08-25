/**
 * 📧 ContactForm Component - CODAI
 * Comprehensive contact form with validation and submission handling
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    User,
    Mail,
    Phone,
    MessageSquare,
    Building,
    MapPin,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react'

interface ContactFormData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    company?: string
    jobTitle?: string
    location?: string
    subject: string
    message: string
    inquiryType: 'general' | 'support' | 'sales' | 'partnership' | 'feedback'
    newsletter: boolean
    agreeToTerms: boolean
}

interface ContactFormProps {
    onSubmit?: (data: ContactFormData) => Promise<void> | void
    onSuccess?: () => void
    onError?: (error: string) => void
    variant?: 'default' | 'minimal' | 'card' | 'sidebar'
    size?: 'sm' | 'md' | 'lg'
    showOptionalFields?: boolean
    showInquiryType?: boolean
    showNewsletter?: boolean
    requireTerms?: boolean
    className?: string
    submitButtonText?: string
    successMessage?: string
    loadingMessage?: string
}

const ContactForm: React.FC<ContactFormProps> = ({
    onSubmit,
    onSuccess,
    onError,
    variant = 'default',
    size = 'md',
    showOptionalFields = true,
    showInquiryType = true,
    showNewsletter = true,
    requireTerms = true,
    className = '',
    submitButtonText = 'Send Message',
    successMessage = 'Thank you! Your message has been sent successfully.',
    loadingMessage = 'Sending your message...'
}) => {
    const [formData, setFormData] = useState<ContactFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        location: '',
        subject: '',
        message: '',
        inquiryType: 'general',
        newsletter: false,
        agreeToTerms: false
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Required fields validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required'
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required'
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters long'
        }

        // Phone validation (if provided)
        if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number'
        }

        // Terms validation
        if (requireTerms && !formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            await onSubmit?.(formData)
            setIsSubmitted(true)
            onSuccess?.()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
            setSubmitError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'max-w-md',
                    input: 'px-3 py-2 text-sm',
                    button: 'px-4 py-2 text-sm',
                    spacing: 'space-y-3'
                }
            case 'lg':
                return {
                    container: 'max-w-2xl',
                    input: 'px-4 py-3 text-base',
                    button: 'px-6 py-3 text-base',
                    spacing: 'space-y-6'
                }
            default:
                return {
                    container: 'max-w-lg',
                    input: 'px-3 py-2.5 text-sm',
                    button: 'px-5 py-2.5 text-sm',
                    spacing: 'space-y-4'
                }
        }
    }

    const getVariantClasses = () => {
        switch (variant) {
            case 'minimal':
                return 'bg-transparent'
            case 'card':
                return 'bg-white rounded-xl shadow-lg border border-gray-200 p-6'
            case 'sidebar':
                return 'bg-gray-50 rounded-lg p-4'
            default:
                return 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
        }
    }

    const sizeClasses = getSizeClasses()
    const variantClasses = getVariantClasses()

    const InputField: React.FC<{
        label: string
        type?: string
        placeholder?: string
        value: string
        onChange: (value: string) => void
        error?: string
        required?: boolean
        icon?: React.ReactNode
        rows?: number
    }> = ({ label, type = 'text', placeholder, value, onChange, error, required, icon, rows }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                {rows ? (
                    <textarea
                        rows={rows}
                        className={`
              ${sizeClasses.input}
              ${icon ? 'pl-10' : ''}
              w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              transition-colors duration-200
            `}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ) : (
                    <input
                        type={type}
                        className={`
              ${sizeClasses.input}
              ${icon ? 'pl-10' : ''}
              w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              transition-colors duration-200
            `}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                </motion.p>
            )}
        </div>
    )

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${variantClasses} ${sizeClasses.container} ${className} text-center`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">{successMessage}</p>
                <button
                    onClick={() => {
                        setIsSubmitted(false)
                        setFormData({
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: '',
                            company: '',
                            jobTitle: '',
                            location: '',
                            subject: '',
                            message: '',
                            inquiryType: 'general',
                            newsletter: false,
                            agreeToTerms: false
                        })
                    }}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                    Send another message
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${variantClasses} ${sizeClasses.container} ${className}`}
        >
            <form onSubmit={handleSubmit} className={sizeClasses.spacing}>
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
                    <p className="text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="First Name"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(value) => handleInputChange('firstName', value)}
                        error={errors.firstName}
                        required
                        icon={<User className="h-5 w-5 text-gray-400" />}
                    />
                    <InputField
                        label="Last Name"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(value) => handleInputChange('lastName', value)}
                        error={errors.lastName}
                        required
                        icon={<User className="h-5 w-5 text-gray-400" />}
                    />
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(value) => handleInputChange('email', value)}
                        error={errors.email}
                        required
                        icon={<Mail className="h-5 w-5 text-gray-400" />}
                    />
                    {showOptionalFields && (
                        <InputField
                            label="Phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone || ''}
                            onChange={(value) => handleInputChange('phone', value)}
                            error={errors.phone}
                            icon={<Phone className="h-5 w-5 text-gray-400" />}
                        />
                    )}
                </div>

                {/* Optional Company Fields */}
                {showOptionalFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Company"
                            placeholder="Acme Inc."
                            value={formData.company || ''}
                            onChange={(value) => handleInputChange('company', value)}
                            icon={<Building className="h-5 w-5 text-gray-400" />}
                        />
                        <InputField
                            label="Location"
                            placeholder="New York, NY"
                            value={formData.location || ''}
                            onChange={(value) => handleInputChange('location', value)}
                            icon={<MapPin className="h-5 w-5 text-gray-400" />}
                        />
                    </div>
                )}

                {/* Inquiry Type */}
                {showInquiryType && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Inquiry Type
                        </label>
                        <select
                            className={`${sizeClasses.input} w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                            value={formData.inquiryType}
                            onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                        >
                            <option value="general">General Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="sales">Sales</option>
                            <option value="partnership">Partnership</option>
                            <option value="feedback">Feedback</option>
                        </select>
                    </div>
                )}

                {/* Subject */}
                <InputField
                    label="Subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(value) => handleInputChange('subject', value)}
                    error={errors.subject}
                    required
                />

                {/* Message */}
                <InputField
                    label="Message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(value) => handleInputChange('message', value)}
                    error={errors.message}
                    required
                    rows={4}
                    icon={<MessageSquare className="h-5 w-5 text-gray-400 mt-2" />}
                />

                {/* Checkboxes */}
                <div className="space-y-3">
                    {showNewsletter && (
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="newsletter"
                                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                checked={formData.newsletter}
                                onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                            />
                            <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                                Subscribe to our newsletter for updates and insights
                            </label>
                        </div>
                    )}

                    {requireTerms && (
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                checked={formData.agreeToTerms}
                                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                                I agree to the{' '}
                                <a href="/terms" className="text-indigo-600 hover:text-indigo-700">
                                    Terms and Conditions
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                                    Privacy Policy
                                </a>
                                <span className="text-red-500"> *</span>
                            </label>
                        </div>
                    )}
                    {errors.agreeToTerms && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-600 flex items-center"
                        >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.agreeToTerms}
                        </motion.p>
                    )}
                </div>

                {/* Submit Error */}
                <AnimatePresence>
                    {submitError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700"
                        >
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{submitError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
            ${sizeClasses.button}
            w-full bg-indigo-600 text-white font-medium rounded-lg
            hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center justify-center space-x-2
          `}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{loadingMessage}</span>
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            <span>{submitButtonText}</span>
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    )
}

export default ContactForm
