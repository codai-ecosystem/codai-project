# METU Template - Technical Specification

## Overview

METU Template is a production-ready, enterprise-grade Next.js 15 monorepo
template designed for rapid application development. It combines modern web
technologies with comprehensive tooling to provide developers with a robust
foundation for building scalable applications.

## Architecture

### Monorepo Structure

The template uses **pnpm workspaces** with **Turbo** for optimized build and
development workflows:

- **apps/web**: Main Next.js 15 application
- **packages/**: Shared configurations and utilities
- **tools/**: Development and build tools

### Technology Stack

#### Frontend Framework

- **Next.js 15** with App Router architecture
- **React 19** with latest concurrent features
- **TypeScript 5.4+** with strict configuration
- **Turbopack** for lightning-fast development builds

#### Styling & UI

- **Tailwind CSS v3** with custom design system
- **CSS Variables** for dynamic theming
- **Framer Motion** for animations and transitions
- **Custom UI Components** built from scratch
- **Dark/Light Mode** with system preference detection

#### State Management

- **Zustand** for global state with persistence
- **React Context** for feature-specific state
- **React Hook Form** with Zod validation for forms

#### Backend Services

- **Firebase Authentication** (Email/Password, Google OAuth)
- **Firestore** for document-based data storage
- **Realtime Database** for low-latency synchronization
- **Cloud Storage** for file uploads with security rules
- **Cloud Messaging** for push notifications
- **Analytics** for comprehensive user tracking
- **Remote Config** for feature flags and A/B testing

## Features

### Authentication & Security

#### Multi-Provider Authentication

- **Email/Password** registration and login
- **Google OAuth** with one-click sign-in
- **Password Reset** functionality
- **Email Verification** for enhanced security
- **Protected Routes** with automatic redirects

#### Security Features

- **Firebase Security Rules** for database and storage
- **Input Validation** with Zod schemas
- **CSRF Protection** built into Next.js
- **Content Security Policy** headers
- **Environment Variable Protection**

### User Interface

#### Design System

- **Custom Color Palette** with CSS variables
- **Typography Scale** with web-safe fonts
- **Spacing System** based on 8px grid
- **Component Library** with consistent styling
- **Responsive Breakpoints** for all devices

#### Accessibility

- **WCAG 2.1 AA Compliance**
- **ARIA Labels** for screen readers
- **Keyboard Navigation** support
- **Focus Management** and indicators
- **Color Contrast** verification

#### Animations

- **Page Transitions** with Framer Motion
- **Component Animations** for user feedback
- **Loading States** with skeletons
- **Micro-interactions** for enhanced UX
- **Performance-Optimized** animations

### Internationalization

#### Multi-Language Support

- **English** (default locale)
- **Romanian** with complete translations
- **Dynamic Language Switching** without page reload
- **Browser Language Detection** with fallbacks
- **Type-Safe Translations** with TypeScript

#### Implementation

- **i18next** for translation management
- **Namespace Organization** for feature-based translations
- **Interpolation Support** for dynamic content
- **Pluralization Rules** for proper grammar
- **Date/Number Formatting** per locale

### Progressive Web App

#### PWA Features

- **Service Worker** for offline functionality
- **Web App Manifest** for native-like experience
- **Installable** on mobile and desktop
- **Push Notifications** with FCM integration
- **Background Sync** for offline actions

#### Caching Strategy

- **Static Assets** cached indefinitely
- **API Responses** with cache-first strategy
- **Offline Fallbacks** for critical pages
- **Update Notifications** for new versions

### Development Experience

#### Code Quality

- **Strict TypeScript** with zero-any policy
- **ESLint** with custom rules and auto-fix
- **Prettier** for consistent formatting
- **Husky** git hooks for pre-commit checks
- **Conventional Commits** for semantic versioning

#### Testing

- **Playwright** for end-to-end testing
- **Vitest** for backend unit and integration testing with **real data**
- **Component Testing** with React Testing Library
- **Real Firebase Integration** testing (no mocking in backend tests)
- **Visual Regression** testing capabilities
- **Test Coverage** reporting with real service integration
- **CI/CD Integration** ready

#### Performance

- **Bundle Analysis** with size tracking
- **Code Splitting** automatic with Next.js
- **Image Optimization** with next/image
- **Lazy Loading** for non-critical components
- **Web Vitals** monitoring

## Configuration

### Environment Variables

The template supports comprehensive environment configuration:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Application Settings
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=

# Third-Party Integrations
RESEND_API_KEY=
NEXT_PUBLIC_ANALYTICS_ID=

# Development Settings
NODE_ENV=
NEXT_PUBLIC_DEBUG=
```

### Firebase Services Configuration

#### Authentication

- **Email/Password Provider** enabled
- **Google OAuth Provider** configured
- **Email Verification** enabled
- **Password Reset** configured

#### Firestore Database

- **Security Rules** for user data protection
- **Indexes** for query optimization
- **Collection Structure** defined
- **Real-time Subscriptions** configured

#### Cloud Storage

- **Security Rules** for file access control
- **CORS Configuration** for web uploads
- **File Size Limits** and type restrictions
- **Automatic Cleanup** for orphaned files

#### Cloud Messaging

- **Web Push Notifications** configured
- **FCM Service Worker** implemented
- **Notification Permissions** handling
- **Background Message** processing

## File Structure

### Component Organization

```
src/components/
├── ui/                 # Base UI primitives
│   ├── Button.tsx     # Button with variants
│   ├── Input.tsx      # Form input components
│   ├── Card.tsx       # Card container
│   └── index.ts       # Barrel exports
├── forms/             # Form-specific components
│   ├── LoginForm.tsx  # Authentication forms
│   └── ContactForm.tsx
├── layout/            # Layout components
│   ├── Header.tsx     # Main navigation
│   ├── Footer.tsx     # Site footer
│   └── Sidebar.tsx    # Navigation sidebar
└── icons/             # SVG icon components
    ├── ChevronIcon.tsx
    └── UserIcon.tsx
```

### Service Layer

```
src/services/
├── auth.ts           # Authentication service
├── database.ts       # Database operations
├── storage.ts        # File upload service
├── notifications.ts  # Push notifications
└── analytics.ts      # Event tracking
```

### State Management

```
src/stores/
├── auth.ts          # Authentication state
├── theme.ts         # Theme preferences
├── notifications.ts # Notification state
└── index.ts         # Store exports
```

### Type Definitions

```
src/types/
├── auth.ts          # Authentication types
├── database.ts      # Database schema types
├── api.ts           # API response types
├── common.ts        # Shared utility types
└── index.ts         # Type exports
```

## Customization Guide

### Theme Customization

#### Color System

The template uses a sophisticated color system with CSS variables:

```css
:root {
  --color-primary-50: 239 246 255;
  --color-primary-500: 59 130 246;
  --color-primary-900: 30 58 138;
}

[data-theme='dark'] {
  --color-primary-50: 30 58 138;
  --color-primary-500: 147 197 253;
  --color-primary-900: 239 246 255;
}
```

#### Typography

Font configuration in `tailwind.config.ts`:

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  // ... responsive font sizes
}
```

### Component Extension

#### Creating New Components

1. **Create Component File**: Follow naming conventions
2. **Define Props Interface**: Use TypeScript for type safety
3. **Implement Component**: Use composition patterns
4. **Add to Barrel Export**: Include in index.ts
5. **Write Tests**: Add Playwright tests
6. **Document Usage**: Add to Storybook (if available)

#### Component Template

```typescript
import { type ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CustomComponentProps extends ComponentProps<'div'> {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const CustomComponent = forwardRef<
  HTMLDivElement,
  CustomComponentProps
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'base-styles',
        {
          'variant-styles': variant === 'primary',
          'size-styles': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
});

CustomComponent.displayName = 'CustomComponent';
```

### Adding New Features

#### Database Integration

1. **Define Schema**: Create TypeScript interfaces
2. **Add Service Methods**: Implement CRUD operations
3. **Create Security Rules**: Firebase security configuration
4. **Add State Management**: Zustand store integration
5. **Implement UI**: Components for data interaction

#### API Routes

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Handle authenticated request

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

## Deployment

### Vercel (Recommended)

#### Prerequisites

- Vercel account
- GitHub repository
- Environment variables configured

#### Deployment Steps

1. **Connect Repository**: Link GitHub repo to Vercel
2. **Configure Environment**: Add environment variables
3. **Deploy**: Automatic deployment on push to main
4. **Custom Domain**: Configure DNS settings

#### Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### Firebase Hosting

#### Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy --only hosting
```

#### Configuration

```json
// firebase.json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Performance Optimization

### Bundle Optimization

#### Code Splitting

- **Route-based Splitting**: Automatic with App Router
- **Component-based Splitting**: React.lazy() for large components
- **Dynamic Imports**: For third-party libraries

#### Bundle Analysis

```bash
# Analyze bundle size
pnpm analyze

# Check for duplicate dependencies
npx duplicate-package-checker

# Visualize bundle composition
npx webpack-bundle-analyzer .next/static/chunks/
```

### Runtime Performance

#### Image Optimization

- **next/image Component**: Automatic optimization
- **WebP/AVIF Support**: Modern image formats
- **Lazy Loading**: Intersection Observer API
- **Responsive Images**: Multiple sizes generated

#### Caching Strategy

- **Static Generation**: ISG for dynamic content
- **API Route Caching**: Edge caching with Vercel
- **Client-side Caching**: SWR for data fetching
- **Service Worker**: Offline-first approach

## Security Considerations

### Firebase Security

#### Authentication Security

- **Token Validation**: Server-side verification
- **Role-based Access**: Custom claims implementation
- **Session Management**: Secure token refresh
- **Rate Limiting**: API endpoint protection

#### Database Security

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    match /public/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Application Security

#### Input Validation

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

// Validate input
const result = userSchema.safeParse(inputData);
if (!result.success) {
  throw new Error('Invalid input');
}
```

#### Content Security Policy

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self' https://*.firebase.googleapis.com",
    ].join('; '),
  },
];
```

## Monitoring & Analytics

### Performance Monitoring

#### Web Vitals

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Custom Metrics**: Business-specific measurements
- **Real User Monitoring**: Production performance data
- **Error Tracking**: Client-side error reporting

#### Implementation

```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### User Analytics

#### Event Tracking

```typescript
// services/analytics.ts
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export const trackEvent = (eventName: string, parameters?: object) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// Usage
trackEvent('page_view', { page_title: 'Dashboard' });
trackEvent('button_click', { button_name: 'Sign Up' });
```

## Maintenance & Updates

### Dependency Management

#### Update Strategy

- **Monthly Updates**: Patch and minor version updates
- **Quarterly Reviews**: Major version considerations
- **Security Updates**: Immediate application of security patches
- **Breaking Changes**: Careful evaluation and testing

#### Update Process

```bash
# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Update specific package
pnpm update package-name

# Run tests after updates
pnpm test
```

### Code Quality Maintenance

#### Automated Checks

- **Pre-commit Hooks**: Code formatting and linting
- **CI/CD Pipeline**: Automated testing and deployment
- **Code Coverage**: Minimum coverage requirements
- **Type Coverage**: TypeScript strict mode compliance

#### Manual Reviews

- **Code Reviews**: Pull request requirements
- **Architecture Reviews**: Quarterly architecture assessments
- **Performance Reviews**: Regular performance audits
- **Security Reviews**: Annual security assessments

---

This technical specification provides a comprehensive overview of the METU
Template architecture, features, and implementation details. For getting
started, refer to the main [README.md](README.md) file. │ ├── components/ │ └──
deployment/ └── .github/ # GitHub configuration ├── workflows/ ├──
ISSUE_TEMPLATE/ ├── PULL_REQUEST_TEMPLATE.md └── copilot-instructions.md

````

## Technology Stack

### Core Framework

- **Next.js 15**: Latest features including App Router, Server Components, and React 19 support
- **React 19**: Latest React features with improved performance and developer experience
- **TypeScript 5.3+**: Strict configuration with comprehensive type safety

### Styling & UI

- **Tailwind CSS v3**: Utility-first CSS framework with custom design system
- **Framer Motion**: Production-ready motion library for React
- **CSS Modules**: Scoped styling for component-specific styles
- **PostCSS**: CSS processing with autoprefixer and custom plugins

### State Management

- **Zustand**: Lightweight state management for global state
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation

### Firebase Integration

- **Firebase Auth**: Authentication with multiple providers
- **Firestore**: NoSQL document database
- **Realtime Database**: Real-time data synchronization
- **Cloud Storage**: File upload and management
- **Cloud Messaging**: Push notifications
- **Analytics**: User behavior tracking
- **Remote Config**: Feature flags and configuration

### Development Tools

- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates
- **lint-staged**: Run linters on staged files
- **TypeScript**: Static type checking

### Testing

- **Playwright**: End-to-end testing with browser automation
- **Vitest**: Backend unit and integration testing
- **Real Data Testing**: Backend tests use actual Firebase services instead of mocks for authentic integration testing
- **Test Isolation**: Automatic cleanup and unique identifiers prevent test interference
- **Fallback Testing**: Tests can run with warnings when Firebase credentials are not available, allowing development without immediate setup
- **High Coverage**: Maintains 80%+ test coverage with meaningful real-world scenarios

### Build & Deployment

- **pnpm**: Fast, efficient package management
- **Vercel**: Optimized Next.js deployment
- **Firebase Hosting**: Alternative hosting option
- **GitHub Actions**: CI/CD pipelines

## Key Features Implementation

### Authentication System

- Multi-provider authentication (Email/Password, Google OAuth)
- Protected routes with HOCs and middleware
- Persistent sessions with automatic refresh
- Role-based access control ready

### Theming System

- CSS custom properties for dynamic theming
- System preference detection
- Smooth transitions between themes
- Accessibility-compliant color schemes

### Internationalization

- Runtime language switching without page reload
- Namespaced translations for better organization
- Browser language detection
- SEO-friendly URL structure (optional)

### Performance Optimizations

- Automatic code splitting with Next.js
- Image optimization with next/image
- Font optimization with next/font
- Lazy loading for non-critical components
- Service worker for caching

### Security Implementation

- Content Security Policy (CSP) headers
- Input validation with Zod schemas
- XSS protection
- CSRF protection
- Secure headers configuration

### Accessibility Features

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## Development Workflow

### Git Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: Individual feature branches
- **hotfix/\***: Critical bug fixes

### Commit Convention

```

type(scope): description

Examples: feat(auth): add Google OAuth integration fix(ui): resolve button color
contrast issue docs(readme): update installation instructions

```

### Code Review Process

1. Feature branch creation
2. Implementation with tests
3. Pull request with template
4. Automated checks (lint, type, test)
5. Peer review
6. Merge to develop
7. Deploy to staging
8. Merge to main
9. Deploy to production

### Quality Gates

- TypeScript compilation without errors
- ESLint passing with no warnings
- Prettier formatting compliance
- All tests passing
- Bundle size within limits
- Accessibility audit passing

## Deployment Strategy

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Live application

### CI/CD Pipeline

1. **On Pull Request**:

   - Install dependencies
   - Run type checking
   - Run linting
   - Run tests
   - Build application
   - Deploy preview (Vercel)

2. **On Main Branch**:
   - All PR checks
   - Deploy to production
   - Update documentation
   - Create release notes

### Monitoring & Analytics

- Firebase Analytics for user behavior
- Web Vitals monitoring
- Error tracking with custom implementation
- Performance monitoring
- Uptime monitoring

## Performance Benchmarks

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

### Optimization Strategies

- Critical CSS inlining
- Resource hints (preload, prefetch)
- Image optimization and WebP format
- Font subsetting and preloading
- Service worker caching
- Bundle splitting and lazy loading

## Security Considerations

### Data Protection

- Personal data encryption
- Secure data transmission (HTTPS)
- Regular security audits
- GDPR compliance ready
- Data retention policies

### Authentication Security

- Password strength requirements
- Rate limiting for auth attempts
- Session management
- Secure cookie configuration
- Multi-factor authentication ready

### Application Security

- Input sanitization
- Output encoding
- SQL injection prevention (via Firebase)
- XSS protection
- CSRF tokens
- Secure headers

## Maintenance & Updates

### Dependency Management

- Monthly dependency updates
- Security vulnerability scanning
- Breaking change assessment
- Automated testing after updates

### Documentation Maintenance

- API documentation updates
- Component documentation
- Architecture decision records
- Change logs

### Monitoring & Alerts

- Error rate monitoring
- Performance degradation alerts
- Security vulnerability alerts
- Uptime monitoring

## Future Roadmap

### Short Term (3 months)

- Enhanced testing coverage
- Additional UI components
- More authentication providers
- Advanced analytics

### Medium Term (6 months)

- Micro-frontend architecture
- Advanced caching strategies
- Offline-first capabilities
- Multi-tenant support

### Long Term (12 months)

- AI/ML integrations
- Advanced personalization
- Real-time collaboration features
- Mobile app template

---

This template represents the culmination of modern web development best practices, providing a solid foundation for building scalable, maintainable, and performant applications.

## Testing Strategy

### Real Data Testing Philosophy

The METU Template employs a **real data testing** approach for backend services, ensuring tests reflect actual production behavior without mocking critical integrations.

#### Backend Testing (Real Services)

- **Firebase Integration**: Tests use actual Firebase Authentication and Firestore
- **No Mocking**: All Firebase Admin SDK calls use real services
- **Test Project Isolation**: Separate Firebase test project prevents production interference
- **Automatic Cleanup**: Test data is automatically removed after each test run
- **Fallback Behavior**: Tests gracefully handle missing credentials during development

#### Test Environment Setup

1. **Test Firebase Project**:
   - Create dedicated Firebase project for testing
   - Enable Authentication, Firestore, and required services
   - Generate service account credentials for test environment

2. **Environment Configuration**:
   ```bash
   # .env.test - Real Firebase test project credentials
   FIREBASE_PROJECT_ID=your-test-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@test-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```

3. **Test Data Management**:
   - Each test creates unique test users and data
   - Automatic cleanup prevents data accumulation
   - Tests run in isolation without affecting each other

#### Frontend Testing (Component/E2E)

- **Playwright**: End-to-end testing with real browser automation
- **React Testing Library**: Component testing with user interaction simulation
- **Visual Regression**: Screenshot comparison for UI consistency
- **Accessibility Testing**: Automated a11y checks

#### Benefits of Real Data Testing

1. **Authentic Integration Testing**: Catches real-world integration issues
2. **Production Parity**: Tests mirror actual production behavior
3. **Service Validation**: Ensures Firebase services are properly configured
4. **Error Handling**: Tests real error conditions from Firebase services
5. **Performance Insights**: Reveals actual service response times and behaviors

#### Test Coverage Standards

- **Backend Routes**: 100% coverage of all API endpoints with real Firebase calls
- **Authentication**: Full JWT verification and Firebase Auth integration testing
- **Data Operations**: Real Firestore read/write operations with proper validation
- **Error Scenarios**: Real Firebase error responses and handling
- **Environment Configuration**: Validation of all required environment variables
````
