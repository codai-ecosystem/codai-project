'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { GoogleIcon } from '../icons/GoogleIcon'
import { responsive } from '@/lib/utils/responsive'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormErrors {
  email?: string
  password?: string
  submit?: string
}

export function LoginForm() {
  const t = useTranslations('auth.login')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {}

    if (!formData.email) {
      newErrors.email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired')
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordMinLength')
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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({
          submit: t('errors.invalidCredentials')
        })
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        submit: t('errors.loginFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Google login error:', error)
      setErrors({
        submit: t('errors.googleLoginFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData) => (
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
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${responsive.touchTargets.small}`}
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
            className={`w-full ${responsive.touchTargets.large}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                {t('actions.signingIn')}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {t('actions.signIn')}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </div>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('divider')}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`w-full ${responsive.touchTargets.large}`}
        >
          <GoogleIcon className="w-4 h-4 mr-2" />
          {t('actions.signInWithGoogle')}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <a
              href="/auth/register"
              className={`font-medium text-primary hover:text-primary/80 transition-colors ${responsive.touchTargets.small}`}
            >
              {t('signUpLink')}
            </a>
          </p>
        </div>
      </div>
    </Card>
  )
}