'use client'

import React from 'react';

import type { JSX } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function DropdownMenuTrigger({
  asChild = false,
  children,
  className,
  onClick,
  ...props
}: DropdownMenuTriggerProps): JSX.Element {
  const context = useContext(DropdownMenuContext);
  if (context == null) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
  }

  const { open, setOpen } = context;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    onClick?.(e);
  };

  if (asChild === true) {
    // For asChild, we'll just render the children as-is for now
    // In a full implementation, you'd clone the child and add the click handler
    return <>{children}</>;
  }

  return (
    <button
      {...props}
      onClick={handleClick}
      aria-expanded={open ? 'true' : 'false'}
      aria-haspopup="true"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  forceMount?: boolean;
}

export function DropdownMenuContent({
  children,
  className,
  align = 'start',
  side = 'bottom',
  forceMount = false,
  ...props
}: DropdownMenuContentProps): JSX.Element | null {
  const context = useContext(DropdownMenuContext);
  if (context == null) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu');
  }

  const { open, contentRef } = context;

  if (!open && !forceMount) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    top: 'bottom-full mb-1',
    right: 'left-full ml-1 top-0',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1 top-0',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function DropdownMenuItem({
  asChild = false,
  children,
  className,
  onClick,
  ...props
}: DropdownMenuItemProps): JSX.Element {
  const context = useContext(DropdownMenuContext);
  if (context == null) {
    throw new Error('DropdownMenuItem must be used within a DropdownMenu');
  }

  const { setOpen } = context;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    setOpen(false);
    onClick?.(e);
  };

  if (asChild === true) {
    // For asChild, we'll just render the children as-is for now
    // In a full implementation, you'd clone the child and add the click handler
    return <>{children}</>;
  }
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      role="menuitem"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Call the click handler directly with the keyboard event
          handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps): JSX.Element {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  );
}

interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DropdownMenuLabel({
  children,
  className,
  ...props
}: DropdownMenuLabelProps): JSX.Element {
  return (
    <div
      className={cn('px-2 py-1.5 text-sm font-semibold', className)}
      {...props}
    >
      {children}
    </div>
  );
}

