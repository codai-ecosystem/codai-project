// 🎨 CODAI ECOSYSTEM - SHARED UI COMPONENTS
// Reusable UI components with consistent design system

'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== BUTTON COMPONENTS ====================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500': variant === 'secondary',
            'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && !loading && icon}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

// ==================== INPUT COMPONENTS ====================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-500',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ==================== CARD COMPONENTS ====================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, hover, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl border p-6',
          glass
            ? 'bg-white/10 backdrop-blur-md border-white/20'
            : 'bg-white border-gray-200',
          hover && 'hover:shadow-lg transition-shadow duration-200',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { y: -2 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// ==================== MODAL COMPONENTS ====================

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={e => e.stopPropagation()}
              className={cn(
                'bg-white rounded-xl shadow-xl border border-gray-200 w-full',
                {
                  'max-w-sm': size === 'sm',
                  'max-w-md': size === 'md',
                  'max-w-2xl': size === 'lg',
                  'max-w-4xl': size === 'xl',
                }
              )}
            >
              {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>
              )}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ==================== LOADING COMPONENTS ====================

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  return (
    <div
      className={cn(
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        {
          'w-4 h-4': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-8 h-8': size === 'lg',
        }
      )}
    />
  )
}

export const LoadingCard: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </Card>
  )
}

// ==================== STATUS COMPONENTS ====================

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'error' | 'pending'
  children?: React.ReactNode
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-emerald-100 text-emerald-800': status === 'online',
          'bg-gray-100 text-gray-800': status === 'offline',
          'bg-red-100 text-red-800': status === 'error',
          'bg-yellow-100 text-yellow-800': status === 'pending',
        }
      )}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          {
            'bg-emerald-500': status === 'online',
            'bg-gray-500': status === 'offline',
            'bg-red-500': status === 'error',
            'bg-yellow-500': status === 'pending',
          }
        )}
      />
      {children}
    </span>
  )
}

// ==================== NAVIGATION COMPONENTS ====================

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  activeTab: string
  onChange: (tabId: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              'flex items-center gap-2',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ==================== LAYOUT COMPONENTS ====================

interface SidebarProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:static lg:z-auto"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ==================== CHART COMPONENTS ====================

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon }) => {
  return (
    <Card hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm font-medium flex items-center gap-1',
                change.type === 'increase' ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              <span>{change.type === 'increase' ? '↗' : '↘'}</span>
              {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-100 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// ==================== SPECTACULAR GLASSMORPHISM ====================

export * from './spectacular'

// ==================== UTILITY FUNCTIONS ====================

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}
