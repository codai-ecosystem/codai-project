import { Variants, Transition } from 'framer-motion';

// Proper Framer Motion type definitions
export const pageTransition: Transition = {
    type: 'spring' as const,
    ease: 'easeInOut',
    duration: 0.3,
};

export const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 200,
            damping: 20
        }
    },
    exit: {
        y: -20,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            duration: 0.3,
            bounce: 0.3
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 20,
        transition: { duration: 0.2 }
    }
};

export const sidebarVariants: Variants = {
    open: {
        x: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30
        }
    },
    closed: {
        x: '-100%',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30
        }
    }
};
