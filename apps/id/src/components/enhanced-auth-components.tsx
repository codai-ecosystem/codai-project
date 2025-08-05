// 🎬 ID Service Animation Integration - Enhanced Authentication Flow with Micro-interactions
// Version: 2.0.0 - Week 2 Phase 2 Advanced Animations

import React, { useState, useEffect } from 'react';
import {
    AnimatedContainer,
    PageTransition,
    LoadingSpinner,
    AnimatedButton,
    AnimatedCard,
    StaggerContainer,
    AnimatedProgress,
    AnimatedNotification
} from '../../../packages/shared-ui/src/animations/animation-components';
import '../../../packages/shared-ui/src/animations/advanced-animations.css';

// =================================
// Enhanced Authentication Components
// =================================

interface AuthFormProps {
    mode: 'login' | 'register' | 'forgot';
    onSubmit?: (data: any) => void;
    isLoading?: boolean;
}

export const EnhancedAuthForm: React.FC<AuthFormProps> = ({
    mode = 'login',
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        visible: boolean;
    }>({ message: '', type: 'info', visible: false });

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({ message, type, visible: true });
    };

    const validateField = (name: string, value: string) => {
        let error = '';

        switch (name) {
            case 'email':
                if (!value) error = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email format';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                else if (value.length < 8) error = 'Password must be at least 8 characters';
                break;
            case 'confirmPassword':
                if (mode === 'register' && value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;
            case 'name':
                if (mode === 'register' && !value) error = 'Name is required';
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const fieldsToValidate = mode === 'register'
            ? ['name', 'email', 'password', 'confirmPassword']
            : mode === 'forgot'
                ? ['email']
                : ['email', 'password'];

        const isValid = fieldsToValidate.every(field =>
            validateField(field, formData[field as keyof typeof formData])
        );

        if (isValid) {
            onSubmit?.(formData);
            showNotification(
                mode === 'login' ? 'Logging in...' :
                    mode === 'register' ? 'Creating account...' :
                        'Sending reset email...',
                'info'
            );
        } else {
            showNotification('Please correct the errors below', 'error');
        }
    };

    const getFormTitle = () => {
        switch (mode) {
            case 'login': return 'Welcome Back';
            case 'register': return 'Create Account';
            case 'forgot': return 'Reset Password';
            default: return 'Authentication';
        }
    };

    const getFormDescription = () => {
        switch (mode) {
            case 'login': return 'Sign in to your account to continue';
            case 'register': return 'Join us today and get started';
            case 'forgot': return 'Enter your email to reset your password';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <AnimatedContainer animation="fadeIn" className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">🔐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{getFormTitle()}</h1>
                    <p className="text-gray-600">{getFormDescription()}</p>
                </AnimatedContainer>

                <AnimatedCard className="overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Progress Indicator for Registration */}
                        {mode === 'register' && (
                            <AnimatedContainer animation="slideDown" className="mb-6">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                    <span>Step {currentStep} of 2</span>
                                    <span>{Math.round((currentStep / 2) * 100)}% Complete</span>
                                </div>
                                <AnimatedProgress value={(currentStep / 2) * 100} height="4px" />
                            </AnimatedContainer>
                        )}

                        <StaggerContainer staggerDelay={100} className="space-y-4">
                            {/* Name Field (Register only) */}
                            {mode === 'register' && currentStep === 1 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        onBlur={(e) => validateField('name', e.target.value)}
                                        className={`input-animated w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500 input-error' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm animate-fade-in">{errors.name}</p>
                                    )}
                                </div>
                            )}

                            {/* Email Field */}
                            {(mode !== 'register' || currentStep === 2) && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        onBlur={(e) => validateField('email', e.target.value)}
                                        className={`input-animated w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500 input-error' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm animate-fade-in">{errors.email}</p>
                                    )}
                                </div>
                            )}

                            {/* Password Field */}
                            {mode !== 'forgot' && (mode !== 'register' || currentStep === 2) && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        onBlur={(e) => validateField('password', e.target.value)}
                                        className={`input-animated w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-500 input-error' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm animate-fade-in">{errors.password}</p>
                                    )}
                                </div>
                            )}

                            {/* Confirm Password Field */}
                            {mode === 'register' && currentStep === 2 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        onBlur={(e) => validateField('confirmPassword', e.target.value)}
                                        className={`input-animated w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.confirmPassword ? 'border-red-500 input-error' : 'border-gray-300'
                                            }`}
                                        placeholder="Confirm your password"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm animate-fade-in">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            )}
                        </StaggerContainer>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {mode === 'register' && currentStep === 1 ? (
                                <AnimatedButton
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => {
                                        if (validateField('name', formData.name)) {
                                            setCurrentStep(2);
                                        }
                                    }}
                                    icon="➡️"
                                >
                                    Continue
                                </AnimatedButton>
                            ) : (
                                <AnimatedButton
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    isLoading={isLoading}
                                    icon={
                                        mode === 'login' ? '🔑' :
                                            mode === 'register' ? '✨' :
                                                '📧'
                                    }
                                >
                                    {isLoading ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        mode === 'login' ? 'Sign In' :
                                            mode === 'register' ? 'Create Account' :
                                                'Send Reset Email'
                                    )}
                                </AnimatedButton>
                            )}

                            {mode === 'register' && currentStep === 2 && (
                                <AnimatedButton
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setCurrentStep(1)}
                                    icon="⬅️"
                                >
                                    Back
                                </AnimatedButton>
                            )}
                        </div>

                        {/* Additional Links */}
                        <div className="space-y-3 text-center">
                            {mode === 'login' && (
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        onClick={() => showNotification('Redirect to forgot password', 'info')}
                                    >
                                        Forgot your password?
                                    </button>
                                    <div className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                            onClick={() => showNotification('Redirect to registration', 'info')}
                                        >
                                            Sign up
                                        </button>
                                    </div>
                                </div>
                            )}

                            {mode === 'register' && (
                                <div className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                        onClick={() => showNotification('Redirect to login', 'info')}
                                    >
                                        Sign in
                                    </button>
                                </div>
                            )}

                            {mode === 'forgot' && (
                                <div className="text-sm text-gray-600">
                                    Remember your password?{' '}
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                        onClick={() => showNotification('Redirect to login', 'info')}
                                    >
                                        Sign in
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Social Login */}
                        {mode !== 'forgot' && (
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <StaggerContainer staggerDelay={100} className="mt-4 grid grid-cols-2 gap-3">
                                    <AnimatedButton
                                        variant="ghost"
                                        className="border border-gray-300"
                                        icon="🔍"
                                        onClick={() => showNotification('Google login coming soon!', 'info')}
                                    >
                                        Google
                                    </AnimatedButton>
                                    <AnimatedButton
                                        variant="ghost"
                                        className="border border-gray-300"
                                        icon="📘"
                                        onClick={() => showNotification('GitHub login coming soon!', 'info')}
                                    >
                                        GitHub
                                    </AnimatedButton>
                                </StaggerContainer>
                            </div>
                        )}
                    </form>
                </AnimatedCard>

                {/* Security Notice */}
                <AnimatedContainer animation="fadeIn" delay={500} className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        🔒 Your data is protected with enterprise-grade security
                    </p>
                </AnimatedContainer>
            </div>

            {/* Notification */}
            <AnimatedNotification
                message={notification.message}
                type={notification.type}
                isVisible={notification.visible}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
            />
        </div>
    );
};

// =================================
// Enhanced Authentication Status Component
// =================================

interface AuthStatusProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
        lastLogin?: string;
    };
    isAuthenticated?: boolean;
    onLogout?: () => void;
}

export const EnhancedAuthStatus: React.FC<AuthStatusProps> = ({
    user,
    isAuthenticated = false,
    onLogout
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    if (!isAuthenticated || !user) {
        return (
            <AnimatedContainer animation="fadeIn">
                <div className="flex items-center space-x-4">
                    <AnimatedButton variant="ghost" size="sm">
                        Sign In
                    </AnimatedButton>
                    <AnimatedButton variant="primary" size="sm">
                        Sign Up
                    </AnimatedButton>
                </div>
            </AnimatedContainer>
        );
    }

    return (
        <div className="relative">
            <AnimatedButton
                variant="ghost"
                className="flex items-center space-x-3 p-2"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </AnimatedButton>

            {showDropdown && (
                <AnimatedContainer
                    animation="fadeIn"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50"
                >
                    <div className="p-4 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.lastLogin && (
                                    <div className="text-xs text-gray-400">Last login: {user.lastLogin}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <StaggerContainer staggerDelay={50} className="p-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2">
                            <span>👤</span>
                            <span>Profile Settings</span>
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2">
                            <span>🔒</span>
                            <span>Security</span>
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2">
                            <span>⚙️</span>
                            <span>Preferences</span>
                        </button>
                        <hr className="my-2" />
                        <button
                            onClick={onLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-2"
                        >
                            <span>🚪</span>
                            <span>Sign Out</span>
                        </button>
                    </StaggerContainer>
                </AnimatedContainer>
            )}
        </div>
    );
};

export default {
    EnhancedAuthForm,
    EnhancedAuthStatus
};
