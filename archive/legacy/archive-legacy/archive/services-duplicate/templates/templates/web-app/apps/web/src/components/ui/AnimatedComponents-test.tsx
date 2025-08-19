'use client';

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AnimatedDivProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  variants?: Variants;
}

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const AnimatedDiv = forwardRef<HTMLDivElement, AnimatedDivProps>(
  (props, ref) => {
    const { children, className, variants, ...motionProps } = props;

    const motionPropsWithVariants = variants
      ? { ...motionProps, variants }
      : motionProps;

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        {...motionPropsWithVariants}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedDiv.displayName = 'AnimatedDiv';

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>((props, ref) => {
  const {
    children,
    className,
    delay = 0,
    duration = 0.6,
    ...motionProps
  } = props;
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay,
        duration,
        ease: 'easeOut',
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

FadeIn.displayName = 'FadeIn';
