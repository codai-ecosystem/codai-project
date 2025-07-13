# GitHub Copilot Instructions for METU Template

## Project Overview

This is a modern Next.js 15 monorepo template with Firebase integration, built
using the latest web development best practices. When working on this project,
follow these guidelines to maintain consistency and quality.

## Core Principles

### Code Quality Standards

- **TypeScript First**: Always use TypeScript with strict configuration
- **No `any` Types**: Use proper type definitions for all variables, functions,
  and props
- **Component Props**: All React component props must be typed with interfaces
- **Import Organization**: Use absolute imports with path aliases
- **Barrel Exports**: Export components from index files for clean imports

### Architecture Patterns

- **Component Structure**: Use functional components with hooks
- **State Management**: Zustand for global state, useState for local state
- **Data Fetching**: React Firebase Hooks for Firebase operations
- **Form Handling**: React Hook Form with Zod validation
- **Error Handling**: Comprehensive error boundaries and try-catch blocks

### Styling Guidelines

- **Tailwind CSS**: Use Tailwind classes for all styling
- **Design System**: Follow the custom design tokens defined in
  tailwind.config.js
- **CSS Variables**: Use CSS custom properties for dynamic theming
- **BEM Methodology**: For any custom CSS classes (rare cases)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### File and Folder Conventions

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups with parentheses
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI primitives
│   ├── forms/            # Form-specific components
│   ├── layout/           # Layout components
│   ├── icons/            # SVG icons as React components
│   └── index.ts          # Barrel exports
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── providers/            # Global providers
├── services/             # Business logic and API calls
├── stores/               # Zustand stores
├── styles/               # Additional styles
└── types/                # TypeScript type definitions
```

### Naming Conventions

**Files and Folders**

- Use kebab-case for folders: `user-profile`, `auth-components`
- Use PascalCase for React components: `UserProfile.tsx`, `AuthForm.tsx`
- Use camelCase for utilities and hooks: `useAuthState.ts`, `formatDate.ts`
- Use SCREAMING_SNAKE_CASE for constants: `API_ENDPOINTS.ts`

**Components**

- Component files: `UserProfile.tsx`
- Component names: `UserProfile`
- Props interfaces: `UserProfileProps`
- Default export: component itself
- Named exports: types and utilities

**Functions and Variables**

- Use camelCase: `getUserData`, `isAuthenticated`
- Use descriptive names: `handleSubmitForm` instead of `handleSubmit`
- Boolean variables: start with `is`, `has`, `should`, `can`

### Component Development

**Component Structure Template**

```typescript
import { type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent': variant === 'outline',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
```

**Custom Hooks Template**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/types/auth';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [firebaseUser, loading, error] = useAuthState(auth);
  const [user, setUser] = useState<User | null>(null);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
      });
    } else {
      setUser(null);
    }
  }, [firebaseUser]);

  return {
    user,
    isLoading: loading,
    error: error?.message || null,
    signOut,
  };
}
```

### Firebase Integration

**Service Layer Pattern**

```typescript
// services/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthCredentials, AuthResponse } from '@/types/auth';

export class AuthService {
  static async signInWithEmail(
    credentials: AuthCredentials
  ): Promise<AuthResponse> {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return { user: result.user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async signInWithGoogle(): Promise<AuthResponse> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

### State Management with Zustand

**Store Template**

```typescript
// stores/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      setUser: user => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ user: state.user }),
    }
  )
);
```

### Form Handling

**Form Component Template**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Form } from '@/components/ui';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Handle form submission
      console.log('Form data:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Form.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input type="email" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Sign In
        </Button>
      </form>
    </Form>
  );
}
```

### Error Handling

**Error Boundary**

```typescript
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to analytics service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### Testing Guidelines

**Component Test Template**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button');
  });

  test('should render with default props', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Click me' });
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/bg-primary/);
  });

  test('should handle click events', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Click me' });
    await button.click();
    await expect(page.getByText('Button clicked!')).toBeVisible();
  });
});
```

### Performance Best Practices

1. **Lazy Loading**: Use `React.lazy()` for non-critical components
2. **Memoization**: Use `React.memo()` for expensive components
3. **Image Optimization**: Always use `next/image` component
4. **Bundle Analysis**: Regular bundle size monitoring
5. **Code Splitting**: Implement route-based code splitting

### Accessibility Requirements

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Add ARIA attributes where needed
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard
   accessible
4. **Color Contrast**: Maintain WCAG AA standards
5. **Screen Readers**: Test with screen reader software

### SEO Best Practices

1. **Meta Tags**: Include appropriate meta tags in layout
2. **Structured Data**: Implement JSON-LD schema markup
3. **Sitemap**: Generate dynamic sitemap
4. **Robots.txt**: Configure properly
5. **Open Graph**: Include OG tags for social sharing

### Security Guidelines

1. **Input Validation**: Validate all user inputs with Zod
2. **Sanitization**: Sanitize data before rendering
3. **Firebase Rules**: Implement strict Firebase security rules
4. **Environment Variables**: Never expose sensitive data
5. **CSP Headers**: Configure Content Security Policy

### Deployment Checklist

1. **Environment Variables**: Set all required env vars
2. **Build Success**: Ensure clean build without warnings
3. **Type Checking**: All TypeScript errors resolved
4. **Tests Passing**: All tests must pass
5. **Performance**: Web Vitals within acceptable ranges
6. **Accessibility**: WAVE and axe checks passing
7. **SEO**: Lighthouse SEO score > 90

## AI Assistance Guidelines

When GitHub Copilot suggests code:

1. **Review Suggestions**: Always review AI-generated code for quality and
   consistency
2. **Type Safety**: Ensure all suggestions maintain TypeScript strict mode
   compliance
3. **Best Practices**: Verify suggestions follow project conventions
4. **Performance**: Consider performance implications of suggestions
5. **Security**: Review for potential security vulnerabilities
6. **Testing**: Add appropriate tests for AI-generated code

## Common Patterns to Suggest

1. **Component Creation**: Follow the established component template
2. **Hook Development**: Use the custom hook template
3. **State Management**: Prefer Zustand for global state
4. **Form Handling**: Always use React Hook Form with Zod
5. **Error Handling**: Implement proper error boundaries
6. **Firebase Integration**: Use the service layer pattern
7. **Styling**: Prefer Tailwind utility classes
8. **Testing**: Follow Playwright testing patterns

Remember: Consistency and quality are paramount. When in doubt, follow the
established patterns in the codebase.
