'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
// import { useTranslation } from '@codai/translations'
import { useI18n } from '../../i18n'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface SignupFormProps {
    onSubmit?: (data: SignupData) => void | Promise<void>
    onSigninClick?: () => void
    isLoading?: boolean
    error?: string
    className?: string
    showSocialSignup?: boolean
    requireTermsAcceptance?: boolean
}

interface SignupData {
    name: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms?: boolean
}

export function SignupForm({
    onSubmit,
    onSigninClick,
    isLoading = false,
    error,
    className,
    showSocialSignup = true,
    requireTermsAcceptance = true
}: SignupFormProps) {
    const { t } = useI18n()

    const [formData, setFormData] = useState<SignupData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Partial<SignupData>>({})

    const validateForm = (): boolean => {
        const errors: Partial<SignupData> = {}

        if (!formData.name.trim()) {
            errors.name = t('validation.required')
        }

        if (!formData.email) {
            errors.email = t('auth.emailRequired')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = t('auth.invalidEmail')
        }

        if (!formData.password) {
            errors.password = t('auth.passwordRequired')
        } else if (formData.password.length < 8) {
            errors.password = t('auth.passwordTooShort')
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = t('auth.passwordMismatch')
        }

        if (requireTermsAcceptance && !formData.acceptTerms) {
            errors.acceptTerms = t('validation.required') as any
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            await onSubmit?.(formData)
        } catch (error) {
            console.error('Signup error:', error)
        }
    }

    const handleInputChange = (field: keyof SignupData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm"
                >
                    {error}
                </motion.div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                    {t('common.name', 'Name')}
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            fieldErrors.name ? "border-red-500" : "border-white/20 focus:border-blue-500"
                        )}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                    />
                </div>
                {fieldErrors.name && (
                    <p className="text-red-400 text-sm">{fieldErrors.name}</p>
                )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    {t('auth.email')}
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            fieldErrors.email ? "border-red-500" : "border-white/20 focus:border-blue-500"
                        )}
                        placeholder={t('auth.email')}
                        disabled={isLoading}
                    />
                </div>
                {fieldErrors.email && (
                    <p className="text-red-400 text-sm">{fieldErrors.email}</p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    {t('auth.password')}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            fieldErrors.password ? "border-red-500" : "border-white/20 focus:border-blue-500"
                        )}
                        placeholder={t('auth.password')}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {fieldErrors.password && (
                    <p className="text-red-400 text-sm">{fieldErrors.password}</p>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                    {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                            fieldErrors.confirmPassword ? "border-red-500" : "border-white/20 focus:border-blue-500"
                        )}
                        placeholder={t('auth.confirmPassword')}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {fieldErrors.confirmPassword && (
                    <p className="text-red-400 text-sm">{fieldErrors.confirmPassword}</p>
                )}
            </div>

            {/* Terms & Conditions */}
            {requireTermsAcceptance && (
                <div className="space-y-2">
                    <label className="flex items-start text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                            className={cn(
                                "mt-1 mr-3 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500",
                                fieldErrors.acceptTerms ? "border-red-500" : ""
                            )}
                            disabled={isLoading}
                        />
                        <span>
                            I agree to the{' '}
                            <a href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Privacy Policy
                            </a>
                        </span>
                    </label>
                    {fieldErrors.acceptTerms && (
                        <p className="text-red-400 text-sm">{fieldErrors.acceptTerms}</p>
                    )}
                </div>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t('common.loading')}
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        {t('auth.signUp')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                )}
            </Button>

            {/* Social Signup */}
            {showSocialSignup && (
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-slate-400">
                                {t('auth.orContinueWith')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </Button>
                    </div>
                </div>
            )}

            {/* Sign In Link */}
            {onSigninClick && (
                <div className="text-center">
                    <span className="text-slate-400 text-sm">
                        {t('auth.alreadyHaveAccount')}{' '}
                        <button
                            type="button"
                            onClick={onSigninClick}
                            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            {t('auth.signIn')}
                        </button>
                    </span>
                </div>
            )}
        </form>
    )
}

export default SignupForm
