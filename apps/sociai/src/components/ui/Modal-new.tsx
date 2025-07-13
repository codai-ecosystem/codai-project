'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { JSX, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

interface ModalComponentProps {
  children: ReactNode;
  className?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.75,
    y: -50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      duration: 0.3,
      bounce: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.75,
    y: -50,
    transition: {
      duration: 0.2,
    },
  },
} as const;

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps): JSX.Element | null {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && closeOnEscape === true) {
        onClose();
      }
    };

    if (isOpen === true) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (typeof window === 'undefined') {
    return null;
  }

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (event.target === event.currentTarget && closeOnBackdropClick === true) {
      onClose();
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen === true ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className={cn(
              'relative w-full rounded-lg border bg-background shadow-lg',
              getSizeClasses(),
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            {title !== undefined ? (
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {/* Content */}
            <div className={cn('p-6', title != null && 'pt-4')}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export function ModalHeader({
  children,
  className,
}: ModalComponentProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ModalTitle({
  children,
  className,
}: ModalComponentProps): JSX.Element {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

export function ModalDescription({
  children,
  className,
}: ModalComponentProps): JSX.Element {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

export function ModalContent({
  children,
  className,
}: ModalComponentProps): JSX.Element {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function ModalFooter({
  children,
  className,
}: ModalComponentProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
