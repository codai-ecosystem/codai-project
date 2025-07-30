import { ReactNode } from 'react'

interface ButtonProps {
    children: ReactNode
    onClick?: () => void
    className?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'outline'
}

export function Button({ children, onClick, className = '', size = 'md', variant = 'default' }: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'

    const sizeClasses = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 py-2 px-4',
        lg: 'h-11 px-8'
    }

    const variantClasses = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
    }

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    )
}
