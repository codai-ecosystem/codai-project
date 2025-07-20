'use client';

import { motion, type Variants } from 'framer-motion';
import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  animate?: boolean;
  fullHeight?: boolean;
  centered?: boolean;
  as?: 'section' | 'div' | 'article' | 'main' | 'aside' | 'header' | 'footer';
};

export function Section({
  id,
  children,
  className,
  animate = true,
  fullHeight = false,
  centered = false,
  as: Component = 'section',
}: SectionProps): JSX.Element {
  // If animations are disabled, render a regular section
  if (animate === false) {
    return (
      <Component
        id={id}
        className={cn(
          'w-full px-4 py-12 md:px-6 lg:px-8',
          fullHeight === true && 'min-h-screen',
          centered === true && 'flex flex-col items-center justify-center',
          className
        )}
      >
        {children}
      </Component>
    );
  }

  return (
    <motion.div
      id={id}
      className={cn(
        'w-full px-4 py-12 md:px-6 lg:px-8',
        fullHeight === true && 'min-h-screen',
        centered === true && 'flex flex-col items-center justify-center',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );
}

// Container component with max width for content
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={cn('mx-auto w-full max-w-7xl', className)}>{children}</div>
  );
}

// SectionTitle component with animations
export function SectionTitle({
  title,
  subtitle,
  centered = false,
  className,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <motion.div
      className={cn('mb-12', centered === true && 'text-center', className)}
      variants={itemVariants}
    >
      <h2 className="mb-3 text-3xl font-bold md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle !== undefined && subtitle !== '' ? (
        <p className="mt-4 max-w-3xl text-xl text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}

// SectionContent component with animations
export function SectionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <motion.div className={cn('w-full', className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// Grid component with responsive columns
export function Grid({
  children,
  columns = 3,
  gap = 'default',
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'small' | 'default' | 'large';
  className?: string;
}): JSX.Element {
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-4',
    default: 'gap-6',
    large: 'gap-8',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid w-full',
        gapClasses[gap],
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

// GridItem component with animations
export function GridItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <motion.div className={cn('w-full', className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
