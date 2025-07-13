import React, { createContext, useContext, useState } from 'react'

interface HighContrastContextType {
    isHighContrast: boolean
    toggleHighContrast: () => void
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined)

export const useHighContrast = () => {
    const context = useContext(HighContrastContext)
    if (!context) {
        throw new Error('useHighContrast must be used within a HighContrastProvider')
    }
    return context
}

interface HighContrastProviderProps {
    children: React.ReactNode
}

export const HighContrastProvider: React.FC<HighContrastProviderProps> = ({ children }) => {
    const [isHighContrast, setIsHighContrast] = useState(false)

    const toggleHighContrast = () => {
        setIsHighContrast(!isHighContrast)
        if (!isHighContrast) {
            document.documentElement.classList.add('high-contrast')
        } else {
            document.documentElement.classList.remove('high-contrast')
        }
    }

    return (
        <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast }}>
            {children}
        </HighContrastContext.Provider>
    )
}

export const HighContrastToggle: React.FC = () => {
    const { isHighContrast, toggleHighContrast } = useHighContrast()

    return (
        <button
            onClick={toggleHighContrast}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
            title={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>
        </button>
    )
}
