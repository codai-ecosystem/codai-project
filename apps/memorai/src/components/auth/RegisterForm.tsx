'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { responsive } from '@/lib/utils/responsive'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterFormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  submit?: string
}

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired')
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('validation.nameMinLength')
    }

    if (!formData.email) {
      newErrors.email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired')
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordMinLength')
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('validation.passwordComplexity')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsMatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Call your registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({
          submit: errorData.message || t('errors.registrationFailed')
        })
        return
      }

      // Registration successful, redirect to login
      router.push('/auth/login?message=registration-success')
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({
        submit: t('errors.registrationFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  return (
    <Card className="p-4 sm:p-6 w-full max-w-md mx-auto">
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              {t('fields.name.label')}
            </label>
            <Input
              id="name"
              type="text"
              placeholder={t('fields.name.placeholder')}
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={isLoading}
              variant={errors.name ? 'error' : 'default'}
              className={`w-full ${responsive.touchTargets.default}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {t('fields.email.label')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('fields.email.placeholder')}
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
              variant={errors.email ? 'error' : 'default'}
              className={`w-full ${responsive.touchTargets.default}`}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {t('fields.password.label')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('fields.password.placeholder')}
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                variant={errors.password ? 'error' : 'default'}
                className={`w-full pr-10 ${responsive.touchTargets.default}`}
              />
              <button
                type="button"
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${responsive.touchTargets.default}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              {t('fields.confirmPassword.label')}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('fields.confirmPassword.placeholder')}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                disabled={isLoading}
                variant={errors.confirmPassword ? 'error' : 'default'}
                className={`w-full pr-10 ${responsive.touchTargets.default}`}
              />
              <button
                type="button"
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${responsive.touchTargets.default}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className={`w-full ${responsive.touchTargets.default}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                {t('actions.creating')}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {t('actions.createAccount')}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </div>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('hasAccount')}{' '}
            <a
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t('signInLink')}
            </a>
          </p>
        </div>
      </div>
    </Card>
  )
}