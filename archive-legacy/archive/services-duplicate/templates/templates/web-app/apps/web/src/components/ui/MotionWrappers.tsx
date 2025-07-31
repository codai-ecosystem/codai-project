'use client';

import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

import { pageVariants, pageTransition } from '@/lib/animations';

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
}

// Page transition wrapper
export const PageTransition = forwardRef<
  HTMLDivElement,
  MotionWrapperProps & MotionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
PageTransition.displayName = 'PageTransition';

// Fade transition wrapper
export const FadeTransition = forwardRef<
  HTMLDivElement,
  MotionWrapperProps & MotionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
FadeTransition.displayName = 'FadeTransition';

// Scale transition wrapper for modals
export const ScaleTransition = forwardRef<
  HTMLDivElement,
  MotionWrapperProps & MotionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
ScaleTransition.displayName = 'ScaleTransition';

// Slide transition for drawers/sidebars
export const SlideTransition = forwardRef<
  HTMLDivElement,
  MotionWrapperProps &
    MotionProps & { direction?: 'left' | 'right' | 'up' | 'down' }
>(({ children, className, direction = 'right', ...props }, ref) => {
  const slideVariants = {
    hidden: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={slideVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
SlideTransition.displayName = 'SlideTransition';

// Stagger children animation
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  MotionWrapperProps & MotionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
StaggerContainer.displayName = 'StaggerContainer';

// Stagger item (child component)
export const StaggerItem = forwardRef<
  HTMLDivElement,
  MotionWrapperProps & MotionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});
StaggerItem.displayName = 'StaggerItem';
