/**
 * SPECTACULAR UI FRAMEWORK - Advanced Component Library
 * World-class animations, glass morphism, and stunning visual effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

// ======================= SPECTACULAR ANIMATIONS =======================

export const spectacularAnimations = {
    // Page Transitions
    pageTransition: {
        initial: { opacity: 0, y: 50, scale: 0.95 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -50,
            scale: 1.05,
            transition: { duration: 0.3 }
        }
    },

    // Stagger Children
    staggerContainer: {
        animate: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    },

    // Card Hover Effects
    cardHover: {
        initial: {
            scale: 1,
            y: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        },
        whileHover: {
            scale: 1.03,
            y: -8,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        },
        whileTap: {
            scale: 0.98
        },
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1] as any
        }
    },

    // Floating Animation
    floating: {
        initial: { y: 0 },
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity
            }
        }
    },

    // Pulse Glow
    pulseGlow: {
        boxShadow: [
            "0 0 0 0 rgba(167, 139, 250, 0.4)",
            "0 0 0 20px rgba(167, 139, 250, 0)",
            "0 0 0 0 rgba(167, 139, 250, 0)"
        ]
    },

    // Slide In From Direction
    slideIn: (direction: 'left' | 'right' | 'top' | 'bottom') => ({
        initial: {
            x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
            y: direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0,
            opacity: 0
        },
        animate: {
            x: 0,
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    }),

    // Morphing Background
    morphingBg: {
        background: [
            "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
            "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
            "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
            "linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)",
            "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
        ]
    }
};

// ======================= GLASS MORPHISM COMPONENTS =======================

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    blur?: 'sm' | 'md' | 'lg' | 'xl';
    tint?: 'light' | 'dark' | 'purple' | 'blue' | 'green';
    border?: boolean;
    glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    blur = 'md',
    tint = 'dark',
    border = true,
    glow = false
}) => {
    const blurClasses = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl'
    };

    const tintClasses = {
        light: 'bg-white/10',
        dark: 'bg-black/20',
        purple: 'bg-purple-500/10',
        blue: 'bg-blue-500/10',
        green: 'bg-green-500/10'
    };

    const borderClass = border ? 'border border-white/20' : '';
    const glowClass = glow ? 'shadow-2xl shadow-purple-500/25' : '';

    return (
        <motion.div
            className={
                cn(
                    'rounded-2xl',
                    blurClasses[blur],
                    tintClasses[tint],
                    borderClass,
                    glowClass,
                    className
                )
            }
            {...spectacularAnimations.cardHover}
        >
            {children}
        </motion.div>
    );
};

// ======================= PARTICLE EFFECTS =======================

interface ParticleFieldProps {
    count?: number;
    color?: string;
    size?: number;
    speed?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
    count = 50,
    color = '#a855f7',
    size = 2,
    speed = 1
}) => {
    const particles = Array.from({ length: count }, (_, i) => (
        <motion.div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
                backgroundColor: color,
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
            }}
            animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
            }}
        />
    ));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" >
            {particles}
        </div>
    );
};

// ======================= SPECTACULAR BUTTON =======================

interface SpectacularButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    glow?: boolean;
    pulse?: boolean;
    className?: string;
    onClick?: () => void;
}

export const SpectacularButton: React.FC<SpectacularButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    glow = false,
    pulse = false,
    className = '',
    onClick
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        ghost: 'bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10',
        gradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
    };

    return (
        <motion.button
            className={
                cn(
                    'rounded-xl font-semibold transition-all duration-300 relative overflow-hidden',
                    variants[variant],
                    sizes[size],
                    glow && 'shadow-lg shadow-purple-500/25',
                    className
                )}
            whileHover={{
                scale: 1.05,
                boxShadow: glow ? "0 20px 40px rgba(168, 85, 247, 0.4)" : undefined
            }}
            whileTap={{ scale: 0.95 }}
            animate={pulse ? spectacularAnimations.pulseGlow : undefined}
            transition={pulse ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            } : undefined}
            onClick={onClick}
        >
            {/* Shimmer Effect */}
            < motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />

            < span className="relative z-10" > {children} </span>
        </motion.button>
    );
};

// ======================= LOADING STATES =======================

interface SpectacularLoaderProps {
    type?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'orbit';
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export const SpectacularLoader: React.FC<SpectacularLoaderProps> = ({
    type = 'spinner',
    size = 'md',
    color = '#a855f7'
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    if (type === 'spinner') {
        return (
            <motion.div
                className={cn('border-2 border-current border-t-transparent rounded-full', sizes[size])}
                style={{ borderColor: color }
                }
                animate={{ rotate: 360 }
                }
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        );
    }

    if (type === 'dots') {
        return (
            <div className="flex space-x-1" >
                {
                    [0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }
                            }
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
            </div>
        );
    }

    if (type === 'wave') {
        return (
            <div className="flex space-x-1" >
                {
                    [0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-current rounded-full"
                            style={{ backgroundColor: color }}
                            animate={{
                                height: [10, 25, 10],
                            }
                            }
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.1,
                            }}
                        />
                    ))}
            </div>
        );
    }

    if (type === 'orbit') {
        return (
            <div className={cn('relative', sizes[size])} >
                <motion.div
                    className="absolute inset-0 border-2 border-current border-t-transparent rounded-full"
                    style={{ borderColor: color }
                    }
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                < motion.div
                    className="absolute inset-2 border-2 border-current border-b-transparent rounded-full"
                    style={{ borderColor: color }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        );
    }

    return (
        <motion.div
            className={cn('rounded-full', sizes[size])}
            style={{ backgroundColor: color }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 1,
                repeat: Infinity,
            }}
        />
    );
};

// ======================= ANIMATED BACKGROUND =======================

export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-hidden" >
            {/* Animated Gradient Background */}
            < motion.div
                className="absolute inset-0 -z-10"
                animate={spectacularAnimations.morphingBg}
                transition={{
                    duration: 10,
                    ease: "linear",
                    repeat: Infinity
                }}
            />

            {/* Particle Field */}
            <ParticleField count={30} />

            {/* Grid Pattern */}
            <div className="absolute inset-0 -z-5 opacity-10" >
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }
                    }
                />
            </div>

            {/* Content */}
            <div className="relative z-10" >
                {children}
            </div>
        </div>
    );
};

// ======================= UTILITY CLASSES =======================

export const spectacularStyles = {
    gradientText: "bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent",
    glassPanel: "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl",
    neonGlow: "shadow-lg shadow-purple-500/25 border border-purple-500/30",
    shimmer: "animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent",
    floating: "animate-float",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    spin: "animate-spin",
    ping: "animate-ping"
};
