import { LogOut, Menu, Settings, User } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useCallback } from 'react';

import { LanguageSwitcher } from '@/components/i18n';
import { ThemeToggle } from '@/components/theme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseEnabled } from '@/lib/env';

export function Header(): JSX.Element {
  const { user, signOut, isAuthenticated } = useAuth();
  const firebaseEnabled = isFirebaseEnabled();

  // Debug logging removed for production

  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      await signOut();
    } catch (error: unknown) {
      console.error('Sign out error:', error);
    }
  }, [signOut]);

  const handleSignOutClick = useCallback((): void => {
    void handleSignOut();
  }, [handleSignOut]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="text-lg font-semibold">METU</span>
          </Link>
        </div>{' '}
        {/* Navigation */}
        <nav role="navigation" className="hidden items-center gap-6 md:flex">
          <Link
            href="/features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Documentation
          </Link>
          <Link
            href="/examples"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Examples
          </Link>
        </nav>{' '}
        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher mode="dropdown" />

          {/* Theme Toggle */}
          <ThemeToggle mode="dropdown" />

          {/* User Menu */}
          {firebaseEnabled && isAuthenticated === true && user !== null ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  {' '}
                  <Avatar className="h-8 w-8">
                    {user.photoURL !== undefined && user.photoURL !== '' ? (
                      <AvatarImage
                        src={user.photoURL}
                        alt={
                          user.displayName !== null && user.displayName !== ''
                            ? user.displayName
                            : undefined
                        }
                      />
                    ) : null}
                    <AvatarFallback>
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOutClick}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : firebaseEnabled ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login" data-testid="header-sign-in">
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register" data-testid="header-sign-up">
                  Get Started
                </Link>
              </Button>
            </div>
          ) : null}

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
