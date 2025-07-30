'use client';

import { motion } from 'framer-motion';
import type { JSX } from 'react';
import React, { type ReactNode } from 'react';

import { pageTransition, pageVariants } from '@/lib/animations';

export interface TransitionProps {
  children: ReactNode;
  className?: string;
}

// Simple page transition component
export function PageTransition(props: TransitionProps): JSX.Element {
  const { children, className } = props;
  return React.createElement(
    motion.div,
    {
      initial: 'initial',
      animate: 'in',
      exit: 'out',
      variants: pageVariants,
      transition: pageTransition,
      className,
    },
    children
  );
}

// Simple fade transition
export function FadeTransition(props: TransitionProps): JSX.Element {
  const { children, className } = props;
  return React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      className,
    },
    children
  );
}
