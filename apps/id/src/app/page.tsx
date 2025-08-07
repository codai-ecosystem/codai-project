'use client'

import React from 'react';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
}

export default function IDServiceDashboard() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Refs for focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // Clear form when switching between login/register
  useEffect(() => {
    setFormData({ email: '', password: '', name: '' });
    setErrors({});
    setSuccess('');
    // Focus on first field when switching
    setTimeout(() => {
      if (!isLogin && nameRef.current) {
        nameRef.current.focus();
      } else if (emailRef.current) {
        emailRef.current.focus();
      }
    }, 100);
  }, [isLogin]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      // Stricter validation for registration
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }

    // Name validation for registration
    if (!isLogin) {
      if (!formData.name?.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField === 'name' && nameRef.current) nameRef.current.focus();
      else if (firstErrorField === 'email' && emailRef.current) emailRef.current.focus();
      else if (firstErrorField === 'password' && passwordRef.current) passwordRef.current.focus();
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await fetch(`http://localhost:4004${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${isLogin ? 'Login' : 'Registration'} failed`);
      }

      setSuccess(data.message || `${isLogin ? 'Login' : 'Registration'} successful!`);

      if (isLogin && data.token) {
        // Store token and redirect or update UI
        localStorage.setItem('auth_token', data.token);
        setFormData({ email: '', password: '', name: '' });
      } else if (!isLogin) {
        // Switch to login after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('Registration successful! Please log in.');
        }, 2000);
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  return (
    <>
      <Head>
        <title>{isLogin ? 'Login' : 'Register'} - CODAI Identity Service</title>
        <meta name="description" content={`${isLogin ? 'Sign in to' : 'Create account for'} CODAI Identity Service - Secure authentication and user management`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header role="banner" className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 16l-4 4-4-4 4-4 1.257-1.257A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                CODAI Identity
              </h1>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create your new account'}
          </p>
        </header>

        {/* Main content */}
        <main id="main-content" role="main" className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">

            {/* Success message */}
            {success && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {errors.general && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {isLogin ? 'Login Error' : 'Registration Error'}
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{errors.general}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Name field (registration only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      ref={nameRef}
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required={!isLogin}
                      value={formData.name || ''}
                      onChange={handleInputChange('name')}
                      onKeyDown={(e) => handleKeyDown(e, emailRef)}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.name
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p id="name-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.email
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    onKeyDown={(e) => handleKeyDown(e, submitRef)}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>

                  {errors.password && (
                    <p id="password-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.password}
                    </p>
                  )}

                  {!isLogin && !errors.password && (
                    <p id="password-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Must contain at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  ref={submitRef}
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                  aria-describedby={isLoading ? 'loading-status' : undefined}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? (
                    <span id="loading-status" role="status">
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </div>

              {/* Switch between login/register */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {isLogin
                    ? "Don't have an account? Create one"
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer role="contentinfo" className="mt-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            CODAI Identity Service v1.0.0 - Secure authentication and user management
          </p>
        </footer>
      </div>
    </>
  );
}
