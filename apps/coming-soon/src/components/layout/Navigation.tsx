'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ArrowUp } from 'lucide-react'
import { useScrollProgress, useScrollAnimation } from '@/hooks/useScrollAnimation'

interface NavigationProps {
    className?: string
}

interface NavItem {
    id: string
    label: string
    href: string
}

const navItems: NavItem[] = [
    { id: 'hero', label: 'Home', href: '#hero' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'ecosystem', label: 'Ecosystem', href: '#ecosystem' },
    { id: 'contact', label: 'Contact', href: '#contact' }
]

export default function Navigation({ className = '' }: NavigationProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('hero')
    const [isScrolled, setIsScrolled] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)

    const scrollProgress = useScrollProgress()
    const { elementRef, isVisible } = useScrollAnimation<HTMLElement>({
        threshold: 0,
        triggerOnce: false
    })

    // Track scroll position and active section
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY
            setIsScrolled(scrollY > 50)
            setShowScrollTop(scrollY > 500)

            // Find active section
            const sections = navItems.map(item => ({
                id: item.id,
                element: document.getElementById(item.id),
                offset: 0
            }))

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i]
                if (section.element) {
                    const rect = section.element.getBoundingClientRect()
                    if (rect.top <= 100) {
                        setActiveSection(section.id)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (href: string) => {
        const targetId = href.replace('#', '')
        const element = document.getElementById(targetId)

        if (element) {
            const offsetTop = element.offsetTop - 80 // Account for fixed nav height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            })
        }

        setIsMobileMenuOpen(false)
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-black/50 backdrop-blur-sm z-50">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 transition-all duration-300 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Main Navigation */}
            <nav
                ref={elementRef}
                className={`
          fixed top-1 left-1/2 transform -translate-x-1/2 z-40
          transition-all duration-500 ease-out
          ${isScrolled
                        ? 'bg-black/80 backdrop-blur-md border-white/20 shadow-2xl shadow-black/50'
                        : 'bg-white/10 backdrop-blur-sm border-white/10'
                    }
          border rounded-2xl px-6 py-4
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          ${className}
        `}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div
                        onClick={() => scrollToSection('#hero')}
                        className="cursor-pointer group flex items-center space-x-3"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                        <span className="text-white font-semibold text-lg hidden sm:block">CODAI</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.href)}
                                className={`
                  px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105
                  ${activeSection === item.id
                                        ? 'bg-white/20 text-white shadow-lg border border-white/30'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }
                `}
                            >
                                {item.label}
                            </button>
                        ))}

                        {/* CTA Button */}
                        <button className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                            Early Access
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                        <div className="space-y-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.href)}
                                    className={`
                    block w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300
                    ${activeSection === item.id
                                            ? 'bg-white/20 text-white border border-white/30'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }
                  `}
                                >
                                    {item.label}
                                </button>
                            ))}

                            {/* Mobile CTA */}
                            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 mt-4">
                                Early Access
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className={`
            fixed bottom-8 right-8 z-40
            w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600
            text-white rounded-full shadow-2xl shadow-blue-500/25
            hover:from-blue-700 hover:to-purple-700
            transition-all duration-300 transform hover:scale-110
            flex items-center justify-center group
            ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
          `}
                >
                    <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            )}
        </>
    )
}