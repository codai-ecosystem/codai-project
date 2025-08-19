/**
 * 🎨 SimpleCard Component - CODAI
 * Versatile card component for data display and interaction
 */
import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface SimpleCardProps {
    title?: string
    subtitle?: string
    value?: string | number
    description?: string
    icon?: LucideIcon
    iconColor?: string
    iconBgColor?: string
    className?: string
    children?: React.ReactNode
    onClick?: () => void
    href?: string
    variant?: 'default' | 'stats' | 'feature' | 'action' | 'minimal'
    size?: 'sm' | 'md' | 'lg'
    hover?: boolean
    loading?: boolean
    selected?: boolean
    disabled?: boolean
    gradient?: boolean
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    border?: boolean
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const SimpleCard: React.FC<SimpleCardProps> = ({
    title,
    subtitle,
    value,
    description,
    icon: Icon,
    iconColor = 'text-indigo-600',
    iconBgColor = 'bg-indigo-100',
    className = '',
    children,
    onClick,
    href,
    variant = 'default',
    size = 'md',
    hover = true,
    loading = false,
    selected = false,
    disabled = false,
    gradient = false,
    shadow = 'sm',
    border = true,
    rounded = 'lg'
}) => {
    const Component = href ? motion.a : motion.div

    const getVariantStyles = () => {
        switch (variant) {
            case 'stats':
                return 'bg-white'
            case 'feature':
                return gradient
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50'
                    : 'bg-white'
            case 'action':
                return 'bg-white hover:bg-gray-50'
            case 'minimal':
                return 'bg-transparent'
            default:
                return 'bg-white'
        }
    }

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'p-3'
            case 'lg':
                return 'p-8'
            default:
                return 'p-6'
        }
    }

    const getShadowStyles = () => {
        switch (shadow) {
            case 'none':
                return ''
            case 'sm':
                return 'shadow-sm'
            case 'md':
                return 'shadow-md'
            case 'lg':
                return 'shadow-lg'
            default:
                return 'shadow-sm'
        }
    }

    const getRoundedStyles = () => {
        switch (rounded) {
            case 'none':
                return ''
            case 'sm':
                return 'rounded-sm'
            case 'md':
                return 'rounded-md'
            case 'lg':
                return 'rounded-lg'
            case 'xl':
                return 'rounded-xl'
            case 'full':
                return 'rounded-full'
            default:
                return 'rounded-lg'
        }
    }

    const baseStyles = `
    ${getVariantStyles()}
    ${getSizeStyles()}
    ${getShadowStyles()}
    ${getRoundedStyles()}
    ${border ? 'border border-gray-200' : ''}
    ${selected ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${hover && !disabled ? 'hover:shadow-md transition-all duration-200' : ''}
    ${onClick || href ? 'cursor-pointer' : ''}
    relative overflow-hidden
  `

    const handleClick = () => {
        if (!disabled && onClick) {
            onClick()
        }
    }

    const LoadingSpinner = () => (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    )

    return (
        <Component
            href={href}
            onClick={handleClick}
            className={`${baseStyles} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover && !disabled ? { y: -2 } : {}}
            whileTap={onClick && !disabled ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
        >
            {loading && <LoadingSpinner />}

            {/* Stats Variant */}
            {variant === 'stats' && (
                <div className="flex items-center">
                    {Icon && (
                        <div className={`h-12 w-12 ${iconBgColor} rounded-lg flex items-center justify-center mr-4`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                    )}
                    <div className="flex-1">
                        {subtitle && (
                            <p className="text-sm font-medium text-gray-600">{subtitle}</p>
                        )}
                        {value && (
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                        )}
                        {title && (
                            <p className="text-sm text-gray-500">{title}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Feature Variant */}
            {variant === 'feature' && (
                <div className="text-center">
                    {Icon && (
                        <div className={`h-16 w-16 ${iconBgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                            <Icon className={`h-8 w-8 ${iconColor}`} />
                        </div>
                    )}
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    )}
                    {description && (
                        <p className="text-gray-600 text-sm">{description}</p>
                    )}
                </div>
            )}

            {/* Action Variant */}
            {variant === 'action' && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {Icon && (
                            <div className={`h-10 w-10 ${iconBgColor} rounded-lg flex items-center justify-center mr-3`}>
                                <Icon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                        )}
                        <div>
                            {title && (
                                <h4 className="font-medium text-gray-900">{title}</h4>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-600">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {value && (
                        <span className="text-lg font-semibold text-gray-900">{value}</span>
                    )}
                </div>
            )}

            {/* Minimal Variant */}
            {variant === 'minimal' && (
                <div>
                    {title && (
                        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
                    )}
                    {description && (
                        <p className="text-sm text-gray-600">{description}</p>
                    )}
                    {value && (
                        <p className="text-lg font-semibold text-gray-900 mt-2">{value}</p>
                    )}
                </div>
            )}

            {/* Default Variant */}
            {variant === 'default' && (
                <div>
                    {Icon && (
                        <div className={`h-12 w-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-4`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                    )}
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
                    )}
                    {value && (
                        <p className="text-2xl font-bold text-indigo-600 mb-2">{value}</p>
                    )}
                    {description && (
                        <p className="text-sm text-gray-600">{description}</p>
                    )}
                </div>
            )}

            {/* Custom Children */}
            {children && !title && !subtitle && !value && !description && (
                <div>{children}</div>
            )}

            {/* Children with content */}
            {children && (title || subtitle || value || description) && (
                <div className="mt-4">{children}</div>
            )}
        </Component>
    )
}

export default SimpleCard
