'use client';

import { motion } from 'framer-motion';
import type { JSX, ReactNode } from 'react';

import { pageTransition, pageVariants } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className,
}: PageTransitionProps): JSX.Element {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide transition for modal/drawer components
export function SlideTransition({
  children,
  className,
}: PageTransitionProps): JSX.Element {
  return (
    <motion.div
      initial="enter"
      animate="center"
      exit="exit"
      variants={{
        enter: { x: '100%', opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade transition for overlays
export function FadeTransition({
  children,
  className,
}: PageTransitionProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale transition for modals
export function ScaleTransition({
  children,
  className,
}: PageTransitionProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
