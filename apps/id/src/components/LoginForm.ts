'use client'

import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void
  onSignUp?: () => void
  isLoading?: boolean
  error?: string
}

export default function LoginForm({
  onSubmit,
  onSignUp,
  isLoading = false,
  error
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    // Email validation
    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Sanitize inputs to prevent XSS
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedPassword = password

    onSubmit?.({
      email: sanitizedEmail,
      password: sanitizedPassword
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Prevent basic XSS attempts
    if (value.includes('<script>') || value.includes('javascript:')) {
      return
    }
    setEmail(value)
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Prevent basic XSS attempts
    if (value.includes('<script>') || value.includes('javascript:')) {
      return
    }
    setPassword(value)
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }))
    }
  }

  return (
    <div className= "w-full max-w-md mx-auto bg-white p-8 rounded-lg border shadow-sm" >
    <div className="text-center mb-8" >
      <h1 className="text-2xl font-bold text-gray-800 mb-2" > Welcome Back </h1>
        < p className = "text-gray-600" > Sign in to your account </p>
          </div>

  {
    error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" >
        <p className="text-red-600 text-sm" role = "alert" > { error } </p>
          </div>
      )
  }

  <form onSubmit={ handleSubmit } className = "space-y-6" noValidate >
    <div>
    <label htmlFor="email" className = "block text-sm font-medium text-gray-700 mb-2" >
      Email Address
        </label>
        < input
  id = "email"
  type = "email"
  value = { email }
  onChange = { handleEmailChange }
  className = {`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-codai-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
    }`
}
placeholder = "Enter your email"
disabled = { isLoading }
autoComplete = "email"
aria - describedby={ validationErrors.email ? "email-error" : undefined }
aria - invalid={ !!validationErrors.email }
          />
{
  validationErrors.email && (
    <p id="email-error" className = "mt-1 text-sm text-red-600" role = "alert" >
      { validationErrors.email }
      </p>
          )
}
</div>

  < div >
  <label htmlFor="password" className = "block text-sm font-medium text-gray-700 mb-2" >
    Password
    </label>
    < div className = "relative" >
      <input
              id="password"
type = { showPassword? 'text': 'password' }
value = { password }
onChange = { handlePasswordChange }
className = {`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-codai-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
  }`}
placeholder = "Enter your password"
disabled = { isLoading }
autoComplete = "current-password"
aria - describedby={ validationErrors.password ? "password-error" : undefined }
aria - invalid={ !!validationErrors.password }
            />
  < button
type = "button"
onClick = {() => setShowPassword(!showPassword)}
className = "absolute inset-y-0 right-0 pr-3 flex items-center"
disabled = { isLoading }
aria - label={ showPassword ? 'Hide password' : 'Show password' }
            >
  {
    showPassword?(
                <EyeOff className = "h-5 w-5 text-gray-400" />
              ): (
        <Eye className = "h-5 w-5 text-gray-400" />
              )}
</button>
  </div>
{
  validationErrors.password && (
    <p id="password-error" className = "mt-1 text-sm text-red-600" role = "alert" >
      { validationErrors.password }
      </p>
          )
}
</div>

  < button
type = "submit"
disabled = { isLoading }
className = "w-full bg-codai-600 hover:bg-codai-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
  >
  {
    isLoading?(
            <div className = "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ): (
        <LogIn className = "mr-2 h-5 w-5" />
          )}
{ isLoading ? 'Signing in...' : 'Sign In' }
</button>
  </form>

  < div className = "mt-6 text-center" >
    <p className="text-gray-600" >
      Don't have an account?{' '}
        < button
type = "button"
onClick = { onSignUp }
className = "text-codai-600 hover:text-codai-700 font-medium"
disabled = { isLoading }
  >
  Sign up
    </button>
    </p>
    </div>
    </div>
  )
}
