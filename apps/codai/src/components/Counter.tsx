/**
 * 🔢 Counter Component - CODAI
 * Interactive counter with animations and customization options
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react'

interface CounterProps {
    initialValue?: number
    min?: number
    max?: number
    step?: number
    value?: number
    onChange?: (value: number) => void
    label?: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'minimal' | 'outlined' | 'filled'
    color?: 'indigo' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'gray'
    showControls?: boolean
    showReset?: boolean
    showTrend?: boolean
    disabled?: boolean
    loading?: boolean
    animate?: boolean
    precision?: number
    format?: 'number' | 'currency' | 'percentage'
    currency?: string
    className?: string
    onIncrement?: () => void
    onDecrement?: () => void
    onReset?: () => void
}

const Counter: React.FC<CounterProps> = ({
    initialValue = 0,
    min,
    max,
    step = 1,
    value,
    onChange,
    label,
    description,
    size = 'md',
    variant = 'default',
    color = 'indigo',
    showControls = true,
    showReset = false,
    showTrend = false,
    disabled = false,
    loading = false,
    animate = true,
    precision = 0,
    format = 'number',
    currency = 'USD',
    className = '',
    onIncrement,
    onDecrement,
    onReset
}) => {
    const [internalValue, setInternalValue] = useState(value ?? initialValue)
    const [previousValue, setPreviousValue] = useState(value ?? initialValue)
    const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral')

    useEffect(() => {
        if (value !== undefined) {
            setPreviousValue(internalValue)
            setInternalValue(value)
        }
    }, [value])

    useEffect(() => {
        if (showTrend) {
            if (internalValue > previousValue) {
                setTrend('up')
            } else if (internalValue < previousValue) {
                setTrend('down')
            } else {
                setTrend('neutral')
            }
        }
    }, [internalValue, previousValue, showTrend])

    const handleIncrement = () => {
        if (disabled || loading) return

        const newValue = internalValue + step
        if (max !== undefined && newValue > max) return

        setPreviousValue(internalValue)
        setInternalValue(newValue)
        onChange?.(newValue)
        onIncrement?.()
    }

    const handleDecrement = () => {
        if (disabled || loading) return

        const newValue = internalValue - step
        if (min !== undefined && newValue < min) return

        setPreviousValue(internalValue)
        setInternalValue(newValue)
        onChange?.(newValue)
        onDecrement?.()
    }

    const handleReset = () => {
        if (disabled || loading) return

        setPreviousValue(internalValue)
        setInternalValue(initialValue)
        onChange?.(initialValue)
        onReset?.()
    }

    const formatValue = (val: number) => {
        const formattedNumber = Number(val.toFixed(precision))

        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency
                }).format(formattedNumber)
            case 'percentage':
                return `${formattedNumber}%`
            default:
                return formattedNumber.toLocaleString()
        }
    }

    const getColorClasses = () => {
        const colors = {
            indigo: {
                bg: 'bg-indigo-600',
                hover: 'hover:bg-indigo-700',
                text: 'text-indigo-600',
                border: 'border-indigo-300',
                focus: 'focus:ring-indigo-500'
            },
            blue: {
                bg: 'bg-blue-600',
                hover: 'hover:bg-blue-700',
                text: 'text-blue-600',
                border: 'border-blue-300',
                focus: 'focus:ring-blue-500'
            },
            green: {
                bg: 'bg-green-600',
                hover: 'hover:bg-green-700',
                text: 'text-green-600',
                border: 'border-green-300',
                focus: 'focus:ring-green-500'
            },
            red: {
                bg: 'bg-red-600',
                hover: 'hover:bg-red-700',
                text: 'text-red-600',
                border: 'border-red-300',
                focus: 'focus:ring-red-500'
            },
            yellow: {
                bg: 'bg-yellow-600',
                hover: 'hover:bg-yellow-700',
                text: 'text-yellow-600',
                border: 'border-yellow-300',
                focus: 'focus:ring-yellow-500'
            },
            purple: {
                bg: 'bg-purple-600',
                hover: 'hover:bg-purple-700',
                text: 'text-purple-600',
                border: 'border-purple-300',
                focus: 'focus:ring-purple-500'
            },
            pink: {
                bg: 'bg-pink-600',
                hover: 'hover:bg-pink-700',
                text: 'text-pink-600',
                border: 'border-pink-300',
                focus: 'focus:ring-pink-500'
            },
            gray: {
                bg: 'bg-gray-600',
                hover: 'hover:bg-gray-700',
                text: 'text-gray-600',
                border: 'border-gray-300',
                focus: 'focus:ring-gray-500'
            }
        }

        return colors[color]
    }

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    button: 'h-8 w-8 text-sm',
                    value: 'text-lg font-semibold',
                    container: 'p-3'
                }
            case 'lg':
                return {
                    button: 'h-12 w-12 text-lg',
                    value: 'text-3xl font-bold',
                    container: 'p-6'
                }
            default:
                return {
                    button: 'h-10 w-10 text-base',
                    value: 'text-2xl font-bold',
                    container: 'p-4'
                }
        }
    }

    const getVariantClasses = () => {
        const colorClasses = getColorClasses()

        switch (variant) {
            case 'minimal':
                return {
                    container: 'bg-transparent',
                    button: `${colorClasses.text} hover:bg-gray-100`,
                    value: colorClasses.text
                }
            case 'outlined':
                return {
                    container: `bg-white border-2 ${colorClasses.border}`,
                    button: `${colorClasses.text} hover:bg-gray-50 border ${colorClasses.border}`,
                    value: colorClasses.text
                }
            case 'filled':
                return {
                    container: `${colorClasses.bg} text-white`,
                    button: 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white',
                    value: 'text-white'
                }
            default:
                return {
                    container: 'bg-white border border-gray-200',
                    button: `${colorClasses.bg} ${colorClasses.hover} text-white`,
                    value: 'text-gray-900'
                }
        }
    }

    const sizeClasses = getSizeClasses()
    const variantClasses = getVariantClasses()
    const colorClasses = getColorClasses()

    const canIncrement = !disabled && !loading && (max === undefined || internalValue < max)
    const canDecrement = !disabled && !loading && (min === undefined || internalValue > min)

    return (
        <div className={`inline-flex flex-col items-center space-y-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}

            <div className={`
        ${variantClasses.container} 
        ${sizeClasses.container} 
        rounded-lg shadow-sm 
        ${disabled ? 'opacity-50' : ''}
        flex items-center justify-center space-x-4
        ${loading ? 'relative' : ''}
      `}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {showControls && (
                    <motion.button
                        onClick={handleDecrement}
                        disabled={!canDecrement}
                        className={`
              ${variantClasses.button}
              ${sizeClasses.button}
              rounded-lg flex items-center justify-center
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                        whileTap={canDecrement ? { scale: 0.95 } : {}}
                    >
                        <Minus className="h-4 w-4" />
                    </motion.button>
                )}

                <div className="flex items-center space-x-2">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={internalValue}
                            className={`${sizeClasses.value} ${variantClasses.value} tabular-nums`}
                            initial={animate ? { y: 10, opacity: 0 } : {}}
                            animate={{ y: 0, opacity: 1 }}
                            exit={animate ? { y: -10, opacity: 0 } : {}}
                            transition={{ duration: 0.2 }}
                        >
                            {formatValue(internalValue)}
                        </motion.span>
                    </AnimatePresence>

                    {showTrend && trend !== 'neutral' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`
                ${trend === 'up' ? 'text-green-500' : 'text-red-500'}
              `}
                        >
                            {trend === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                        </motion.div>
                    )}
                </div>

                {showControls && (
                    <motion.button
                        onClick={handleIncrement}
                        disabled={!canIncrement}
                        className={`
              ${variantClasses.button}
              ${sizeClasses.button}
              rounded-lg flex items-center justify-center
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                        whileTap={canIncrement ? { scale: 0.95 } : {}}
                    >
                        <Plus className="h-4 w-4" />
                    </motion.button>
                )}

                {showReset && (
                    <motion.button
                        onClick={handleReset}
                        disabled={disabled || loading}
                        className={`
              ml-2 p-2 text-gray-400 hover:text-gray-600
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </motion.button>
                )}
            </div>

            {description && (
                <p className="text-xs text-gray-500 text-center max-w-xs">{description}</p>
            )}

            {(min !== undefined || max !== undefined) && (
                <div className="text-xs text-gray-400">
                    {min !== undefined && `Min: ${min}`}
                    {min !== undefined && max !== undefined && ' • '}
                    {max !== undefined && `Max: ${max}`}
                </div>
            )}
        </div>
    )
}

export default Counter
