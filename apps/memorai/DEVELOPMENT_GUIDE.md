# MemorAI Development Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Patterns](#architecture--patterns)
3. [Component Documentation](#component-documentation)
4. [Performance Monitoring](#performance-monitoring)
5. [Accessibility Compliance](#accessibility-compliance)
6. [Testing Strategy](#testing-strategy)
7. [Development Workflow](#development-workflow)
8. [Build & Deployment](#build--deployment)

## Project Overview

MemorAI is an AI-powered memory and knowledge management platform built with Next.js 15.4.1, React 19.1.0, and TypeScript 5.8.3. The application follows Microsoft React best practices and enterprise-grade development standards.

### Technology Stack

- **Frontend**: Next.js 15.4.1 with React 19.1.0
- **Language**: TypeScript 5.8.3 with strict typing
- **Styling**: Tailwind CSS 3.4.17 with Radix UI components
- **State Management**: Zustand 5.0.6
- **Authentication**: NextAuth 5.0.0-beta.25
- **Testing**: Vitest 3.2.4 with React Testing Library
- **Performance**: Microsoft Application Insights with Real User Monitoring
- **Accessibility**: WCAG 2.1 AA compliance with axe-core testing

## Architecture & Patterns

### Microsoft React Best Practices

The application implements comprehensive Microsoft React patterns:

#### 1. Performance Optimization
- **React.memo**: All components are memoized to prevent unnecessary re-renders
- **useCallback**: Event handlers are memoized to maintain referential equality
- **useMemo**: Expensive calculations are memoized to improve performance
- **Dynamic Imports**: Large components are dynamically imported for code splitting

```typescript
// Example: Memoized component with optimized hooks
const MemoryDashboard = React.memo(() => {
  const memoizedData = useMemo(() => 
    processMemoryData(memories), [memories]
  );

  const handleMemoryUpdate = useCallback((memory: Memory) => {
    updateMemory(memory.id, memory);
  }, [updateMemory]);

  return <div>{/* Component JSX */}</div>;
});
```

#### 2. TypeScript Strict Typing
- Discriminated unions for component variants
- Comprehensive interface definitions
- Strict null checks and proper error handling
- Generic types for reusable components

```typescript
interface MemoryCardProps {
  memory: Memory;
  variant: 'default' | 'compact' | 'expanded';
  onEdit?: (memory: Memory) => void;
  onDelete?: (id: string) => void;
  className?: string;
}
```

#### 3. Custom Hooks Pattern
- Separation of business logic from UI components
- Reusable state management and side effects
- SSR-safe implementations

```typescript
// Custom hook for AI search functionality
export const useAISearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const search = useCallback(async (query: string) => {
    // Implementation
  }, []);

  return { search, isLoading, results };
};
```

### Component Architecture

#### Modular Design
- Components are organized by feature and responsibility
- Shared UI components in `/components/ui`
- Feature-specific components in `/components/feature-name`
- Page components in `/app` following Next.js 13+ app router

#### Component Structure
```
src/
├── components/
│   ├── ui/              # Shared UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── ai-search/       # AI search components
│   └── __tests__/       # Component tests
├── lib/                 # Utilities and configuration
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Component Documentation

### Core Components

#### MemoryDashboard
**Purpose**: Main dashboard interface with analytics, management, and insights
**Location**: `/components/dashboard/MemoryDashboard.tsx`

**Features**:
- Dynamic component loading for performance
- Comprehensive error boundaries
- Real-time data updates
- Accessible navigation and interaction

**Props**:
```typescript
interface MemoryDashboardProps {
  className?: string;
  initialMemories?: Memory[];
  onMemoryUpdate?: (memory: Memory) => void;
}
```

**Usage**:
```tsx
<MemoryDashboard 
  initialMemories={memories}
  onMemoryUpdate={handleUpdate}
  className="custom-dashboard"
/>
```

#### AISearchInterface
**Purpose**: AI-powered search interface with conversation-style interaction
**Location**: `/components/AISearchInterface.tsx`

**Features**:
- Modular component architecture
- Real-time search suggestions
- Conversation history management
- Accessibility-compliant search experience

**Subcomponents**:
- `SearchInput`: Optimized search input with WCAG compliance
- `ConversationView`: Message display with proper accessibility
- `SearchHeader`: Header controls with keyboard navigation

#### MemoryAnalytics
**Purpose**: Data visualization and analytics for memory patterns
**Location**: `/components/dashboard/MemoryAnalytics.tsx`

**Features**:
- Interactive charts with Recharts
- Screen reader accessible data tables
- Comprehensive ARIA labeling
- Responsive design patterns

#### MemoryManagement
**Purpose**: Core memory CRUD operations and management
**Location**: `/components/dashboard/MemoryManagement.tsx`

**Features**:
- Semantic HTML structure with fieldset/legend
- Accessible form controls
- ARIA live regions for dynamic content
- Comprehensive keyboard navigation

#### AIInsights
**Purpose**: AI-powered insights and pattern recognition
**Location**: `/components/dashboard/AIInsights.tsx`

**Features**:
- Pattern detection and visualization
- Confidence indicators with accessibility
- Semantic article structure
- Loading states with ARIA live regions

## Performance Monitoring

### Microsoft Application Insights Integration

The application includes comprehensive performance monitoring using Microsoft Application Insights:

#### Real User Monitoring (RUM)
- Page load performance tracking
- User interaction monitoring
- Error and exception tracking
- Custom event logging

#### Web Vitals Tracking
- Core Web Vitals metrics (LCP, FID, CLS)
- First Contentful Paint (FCP)
- Time to First Byte (TTFB)
- Interaction to Next Paint (INP)

#### Component Performance Tracking
- Render time monitoring
- State update performance
- Hook execution timing
- API call performance

### Performance Hooks

#### usePerformance
General performance monitoring hook:
```typescript
const { trackEvent, trackPageView, trackException } = usePerformance();

// Track custom events
trackEvent('memory_created', { category: 'personal', size: 'large' });

// Track page views
trackPageView('/dashboard', { userId: user.id });

// Track exceptions
trackException(error, { component: 'MemoryDashboard' });
```

#### useApiPerformanceTracking
API performance monitoring:
```typescript
const { trackedFetch } = useApiPerformanceTracking();

// Automatically tracks API performance
const response = await trackedFetch('/api/memories', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### useComponentPerformance
Component render performance:
```typescript
const { trackRender } = useComponentPerformance('MemoryDashboard');

useEffect(() => {
  trackRender();
}, [trackRender]);
```

#### useFormPerformance
Form interaction tracking:
```typescript
const { trackFormStart, trackFormComplete, trackFieldInteraction } = 
  useFormPerformance('memory-form');

const handleSubmit = async (data) => {
  await trackFormComplete(data);
  // Form submission logic
};
```

#### useSearchPerformance
Search operation optimization:
```typescript
const { trackSearch, trackSearchResult } = useSearchPerformance();

const handleSearch = async (query: string) => {
  const results = await trackSearch(query, async () => {
    return await searchAPI(query);
  });
  
  trackSearchResult(query, results.length);
  return results;
};
```

### Bundle Analysis

Comprehensive bundle analysis tools are available:

```bash
# Analyze bundle size and composition
npm run analyze:bundle

# Generate performance report
npm run analyze:performance

# Monitor build performance
npm run analyze:build

# Check Core Web Vitals
npm run analyze:vitals
```

## Accessibility Compliance

### WCAG 2.1 AA Standards

All components implement comprehensive accessibility features:

#### Semantic HTML
- Proper heading hierarchy (h1-h6)
- Semantic elements (article, section, nav)
- Form fieldsets and legends
- List structures for related content

#### ARIA Implementation
- Descriptive labels and descriptions
- Live regions for dynamic content
- Role attributes for custom components
- State and property management

#### Keyboard Navigation
- Tab order management
- Focus management and indicators
- Keyboard shortcuts and escape routes
- Skip navigation links

#### Screen Reader Support
- Screen reader-only content with `sr-only` class
- Descriptive text for complex interactions
- Accessible data tables with headers
- Progress and status announcements

### Accessibility Testing

Automated accessibility testing with axe-core:

```bash
# Run accessibility tests
npm run test:accessibility

# Run specific accessibility test suites
npm run test -- src/components/__tests__/accessibility.integration.test.tsx
```

Example accessibility test:
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

test('MemoryDashboard should be accessible', async () => {
  const { container } = render(<MemoryDashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Testing Strategy

### Testing Framework
- **Vitest**: Primary testing framework with fast execution
- **React Testing Library**: Component testing with user-centric approach
- **axe-core**: Accessibility testing and validation
- **Happy DOM**: Lightweight DOM environment

### Test Categories

#### 1. Environment Tests
Validate development environment setup:
```bash
npm run test src/components/__tests__/environment.test.tsx
```

#### 2. Component Tests
Comprehensive component testing following Microsoft patterns:
```bash
npm run test:components
```

#### 3. Accessibility Integration Tests
Automated accessibility validation:
```bash
npm run test:accessibility
```

#### 4. MCP Server Compliance Tests
Microsoft MCP 2025-03-26 specification compliance:
```bash
npm run test:mcp
```

### Test Structure

Tests are organized by category:
```
src/components/__tests__/
├── setup.ts                           # Test configuration
├── environment.test.tsx               # Environment validation
├── AISearchInterface.microsoft.test.tsx  # Component tests
├── MemoryDashboard.clean.test.tsx     # Dashboard tests
└── accessibility.integration.test.tsx # Accessibility tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run test UI
npm run test:ui

# Run specific test suites
npm run test:components
npm run test:accessibility
```

## Development Workflow

### Getting Started

1. **Clone and Setup**:
   ```bash
   git clone <repository>
   cd apps/memorai
   pnpm install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env.local`
   - Configure environment variables
   - Set up database connections

3. **Development Server**:
   ```bash
   npm run dev
   # Server runs on http://localhost:4006
   ```

### Code Standards

#### TypeScript Configuration
- Strict mode enabled
- No implicit any types
- Proper null checks
- Comprehensive type definitions

#### ESLint & Prettier
- Next.js recommended configuration
- TypeScript-aware linting
- Automatic code formatting
- Import optimization

#### Git Workflow
- Feature branches for new development
- Comprehensive commit messages
- Pull request reviews required
- Automated CI/CD pipeline

### Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Start production server

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode testing
npm run test:coverage   # Coverage reports
npm run test:ui         # Test UI interface

# Code Quality
npm run lint            # ESLint checking
npm run type-check      # TypeScript validation

# Analysis
npm run build:analyze   # Bundle analysis
```

## Build & Deployment

### Production Build

The application is optimized for production deployment:

#### Webpack Optimization
- Tree-shaking for unused code removal
- Code splitting with dynamic imports
- Chunk splitting for optimal caching
- Compression and minification

#### Build Configuration
```javascript
// next.config.ts
const config = {
  webpack: (config) => {
    // Tree-shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };
    
    // Chunk splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    
    return config;
  },
};
```

### Docker Deployment

The application runs in Docker as part of the CODAI ecosystem:

#### Service Configuration
- Port 4006 for MemorAI frontend
- Health checks and monitoring
- Integration with CODAI services
- Load balancing and scaling

#### Health Monitoring
```bash
# Check service health
docker ps --filter name=codai-memorai-frontend
curl http://localhost:4006/api/health
```

### Performance Monitoring in Production

#### Application Insights Configuration
- Real User Monitoring enabled
- Custom telemetry tracking
- Performance baseline monitoring
- Error tracking and alerting

#### Monitoring Dashboard
Access comprehensive performance metrics:
- Page load times and Core Web Vitals
- User interaction patterns
- API response times
- Error rates and exceptions

## Best Practices Summary

### Development Guidelines

1. **Component Design**:
   - Use React.memo for all components
   - Implement proper TypeScript interfaces
   - Follow accessibility standards
   - Include comprehensive testing

2. **Performance Optimization**:
   - Memoize expensive calculations
   - Implement dynamic imports
   - Monitor Core Web Vitals
   - Optimize bundle size

3. **Accessibility First**:
   - Semantic HTML structure
   - ARIA labels and descriptions
   - Keyboard navigation support
   - Screen reader compatibility

4. **Testing Strategy**:
   - Write tests for all components
   - Include accessibility testing
   - Maintain high test coverage
   - Use realistic testing scenarios

5. **Code Quality**:
   - Follow TypeScript strict mode
   - Use ESLint and Prettier
   - Write descriptive commit messages
   - Document complex functionality

### Troubleshooting

#### Common Issues

1. **Build Errors**:
   - Check TypeScript compilation
   - Verify import paths
   - Ensure proper type definitions

2. **Performance Issues**:
   - Review Component render patterns
   - Check for memory leaks
   - Optimize expensive operations

3. **Accessibility Violations**:
   - Run axe-core tests
   - Verify ARIA implementation
   - Test keyboard navigation

4. **Test Failures**:
   - Check test environment setup
   - Verify component mocking
   - Update snapshots if needed

#### Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Microsoft Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/javascript)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)

---

This development guide provides comprehensive documentation for maintaining and extending the MemorAI application following Microsoft best practices and enterprise development standards.