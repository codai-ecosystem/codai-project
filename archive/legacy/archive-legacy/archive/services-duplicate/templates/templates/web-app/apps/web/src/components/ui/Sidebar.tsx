'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: string;
  position?: 'left' | 'right';
  overlay?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

interface SidebarComponentProps {
  children: ReactNode;
  className?: string;
}

interface SidebarHeaderProps extends SidebarComponentProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarNavGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

interface SidebarToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  className?: string;
  isOpen?: boolean;
}

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const overlayVariants = {
  open: {
    opacity: 1,
    visibility: 'visible' as const,
  },
  closed: {
    opacity: 0,
    visibility: 'hidden' as const,
  },
};

export function Sidebar({
  isOpen,
  onClose,
  children,
  className,
  width = 'w-64',
  position = 'left',
  overlay = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}: SidebarProps): JSX.Element {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick === true) {
      onClose();
    }
  };

  const sidebarClasses = cn(
    'fixed top-0 z-50 h-full bg-background border-r shadow-lg',
    width,
    position === 'left' ? 'left-0' : 'right-0',
    className
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Overlay */}
          {overlay ? (
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={handleOverlayClick}
            />
          ) : null}

          {/* Sidebar */}
          <motion.div
            className={sidebarClasses}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

// Sidebar Header
export function SidebarHeader({
  children,
  className,
  showCloseButton = true,
  onClose,
}: SidebarHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b p-4',
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton === true && onClose ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      ) : null}
    </div>
  );
}

// Sidebar Content
export function SidebarContent({
  children,
  className,
}: SidebarComponentProps): JSX.Element {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>
      {children}
    </div>
  );
}

// Sidebar Footer
export function SidebarFooter({
  children,
  className,
}: SidebarComponentProps): JSX.Element {
  return <div className={cn('border-t p-4', className)}>{children}</div>;
}

// Sidebar Navigation
export function SidebarNav({
  children,
  className,
}: SidebarComponentProps): JSX.Element {
  return <nav className={cn('space-y-2', className)}>{children}</nav>;
}

// Sidebar Navigation Item
export function SidebarNavItem({
  children,
  className,
  isActive = false,
  href,
  onClick,
  icon: Icon,
  ...props
}: SidebarNavItemProps): JSX.Element {
  const Component = href !== undefined && href !== '' ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive === true && 'bg-accent text-accent-foreground',
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="flex-1">{children}</span>
    </Component>
  );
}

// Sidebar Navigation Group
export function SidebarNavGroup({
  title,
  children,
  className,
  defaultOpen = false,
}: SidebarNavGroupProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('space-y-1', className)}>
      {title ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {title}
        </button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-6 space-y-1">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Sidebar Toggle Button (for mobile)
export function SidebarToggle({
  onClick,
  className,
  isOpen = false,
  ...props
}: SidebarToggleProps): JSX.Element {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('h-8 w-8 p-0', className)}
      onClick={onClick}
      {...props}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      <span className="sr-only">
        {isOpen ? 'Close sidebar' : 'Open sidebar'}
      </span>
    </Button>
  );
}
