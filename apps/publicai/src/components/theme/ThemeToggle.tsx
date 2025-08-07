'use client'

import React from 'react';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { JSX } from 'react';
import { type ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps
  extends Omit<ComponentProps<typeof Button>, 'variant'> {
  mode?: 'button' | 'dropdown';
  variant?: ComponentProps<typeof Button>['variant'];
}

export function ThemeToggle({
  mode = 'dropdown',
  variant = 'outline',
  className,
  ...props
}: ThemeToggleProps): JSX.Element {
  const { theme, setTheme, toggleTheme } = useTheme();
  if (mode === 'button') {
    return (
      <Button
        variant={variant}
        size="sm"
        onClick={toggleTheme}
        className={cn('h-9 w-9 px-0', className)}
        aria-label="Toggle theme"
        {...props}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {' '}
        <Button
          variant={variant}
          size="sm"
          className={cn('h-9 w-9 px-0', className)}
          aria-label="Toggle theme"
          {...props}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn('cursor-pointer', theme === 'light' && 'bg-accent')}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn('cursor-pointer', theme === 'dark' && 'bg-accent')}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn('cursor-pointer', theme === 'system' && 'bg-accent')}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

