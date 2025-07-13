import React from 'react'

interface SkipLinkProps {
    href: string
    children: React.ReactNode
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
    return (
        <a
            href={href}
            className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
            {children}
        </a>
    )
}

export const SkipLinks: React.FC = () => {
    return (
        <div className="skip-links">
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <SkipLink href="#navigation">Skip to navigation</SkipLink>
            <SkipLink href="#features">Skip to features</SkipLink>
        </div>
    )
}
