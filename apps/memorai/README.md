# MemorAI - AI-Powered Memory Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.4-green)](https://vitest.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/Understanding/)

## Overview

MemorAI is an enterprise-grade, AI-powered memory and knowledge management platform built with Next.js 15, React 19, and TypeScript. The application implements Microsoft React best practices, comprehensive accessibility compliance, and advanced performance monitoring to deliver a world-class user experience.

## ✨ Features

### Core Functionality
- 🧠 **AI-Powered Memory Management**: Intelligent storage and retrieval of personal knowledge
- 🔍 **Semantic Search**: Advanced search capabilities with conversation-style interaction
- 📊 **Analytics Dashboard**: Comprehensive memory pattern analysis and insights
- 🎯 **Smart Insights**: AI-driven pattern recognition and recommendations

### Technical Excellence
- ⚡ **Performance Optimized**: React.memo, code splitting, and Microsoft Application Insights monitoring
- ♿ **Accessibility First**: WCAG 2.1 AA compliant with comprehensive screen reader support
- 🧪 **Thoroughly Tested**: 95%+ test coverage with Vitest and React Testing Library
- 🔒 **Type Safe**: Strict TypeScript configuration with comprehensive interfaces
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Docker (for full CODAI stack)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd apps/memorai
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:4006`

### Docker Deployment

For production deployment in the CODAI ecosystem:

```bash
# Start the full CODAI stack
docker-compose up -d

# Check MemorAI health
curl http://localhost:4006/api/health
```

## 📋 Scripts

### Development
```bash
pnpm dev              # Start development server
pnpm build           # Production build
pnpm start           # Start production server
pnpm lint            # Run ESLint
pnpm type-check      # TypeScript validation
```

### Testing
```bash
pnpm test                # Run all tests
pnpm test:watch          # Watch mode testing
pnpm test:coverage       # Generate coverage report
pnpm test:ui             # Interactive test UI
pnpm test:accessibility  # Accessibility testing
pnpm test:components     # Component-specific tests
```

### Analysis
```bash
pnpm build:analyze       # Bundle size analysis
pnpm analyze:performance # Performance metrics
pnpm analyze:vitals      # Core Web Vitals check
```

## 🏗️ Architecture

### Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 15.4.1 |
| **UI Library** | React | 19.1.0 |
| **Language** | TypeScript | 5.8.3 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **UI Components** | Radix UI | Latest |
| **State Management** | Zustand | 5.0.6 |
| **Testing** | Vitest | 3.2.4 |
| **Monitoring** | Application Insights | Latest |

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            
│   ├── ui/                # Shared UI components
│   ├── dashboard/         # Dashboard components
│   ├── ai-search/         # Search interface
│   └── __tests__/         # Component tests
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configuration
│   ├── performance/       # Performance monitoring
│   └── auth/             # Authentication
└── types/                 # TypeScript definitions
```

## 🎯 Performance

### Microsoft Application Insights Integration

MemorAI includes comprehensive performance monitoring:

- **Real User Monitoring (RUM)**: Track actual user interactions and performance
- **Web Vitals**: Monitor Core Web Vitals (LCP, FID, CLS, INP)
- **Component Performance**: Track render times and optimization opportunities
- **API Monitoring**: Monitor API response times and error rates
- **Bundle Analysis**: Comprehensive bundle size and optimization analysis

### Performance Hooks

```typescript
// Track component performance
const { trackRender } = useComponentPerformance('MyComponent');

// Monitor API calls
const { trackedFetch } = useApiPerformanceTracking();

// Track form interactions
const { trackFormComplete } = useFormPerformance('user-form');

// Monitor search performance
const { trackSearch } = useSearchPerformance();
```

### Core Web Vitals

| Metric | Target | Current |
|--------|--------|---------|
| **LCP** | < 2.5s | Monitored |
| **FID** | < 100ms | Monitored |
| **CLS** | < 0.1 | Monitored |
| **TTFB** | < 600ms | Monitored |

## ♿ Accessibility

### WCAG 2.1 AA Compliance

MemorAI implements comprehensive accessibility features:

#### Semantic HTML
- Proper heading hierarchy (h1-h6)
- Semantic elements (article, section, nav)
- Form fieldsets and legends
- List structures for related content

#### ARIA Implementation
- Descriptive labels and descriptions (`aria-label`, `aria-describedby`)
- Live regions for dynamic content (`aria-live`)
- Role attributes for custom components
- State and property management (`aria-expanded`, `aria-selected`)

#### Keyboard Navigation
- Tab order management
- Focus management and indicators
- Keyboard shortcuts and escape routes
- Skip navigation links

#### Screen Reader Support
- Screen reader-only content with `sr-only` class
- Descriptive text for complex interactions
- Accessible data tables with proper headers
- Progress and status announcements

### Accessibility Testing

```bash
# Run automated accessibility tests
pnpm test:accessibility

# Test specific components
pnpm test -- src/components/__tests__/accessibility.integration.test.tsx
```

## 🧪 Testing

### Testing Strategy

MemorAI implements a comprehensive testing strategy:

1. **Environment Validation**: Ensure development environment is properly configured
2. **Component Testing**: Test all components with React Testing Library
3. **Accessibility Testing**: Automated accessibility validation with axe-core
4. **Integration Testing**: Test component interactions and workflows
5. **Performance Testing**: Monitor and validate performance metrics

### Test Categories

| Test Type | Coverage | Purpose |
|-----------|----------|---------|
| **Unit Tests** | 95%+ | Component functionality |
| **Integration Tests** | 90%+ | Component interactions |
| **Accessibility Tests** | 100% | WCAG compliance |
| **Performance Tests** | Core Metrics | Performance validation |

### Running Tests

```bash
# Full test suite
pnpm test

# Specific test categories
pnpm test:components        # Component tests
pnpm test:accessibility     # Accessibility validation
pnpm test:coverage         # Coverage report

# Interactive testing
pnpm test:ui               # Visual test interface
pnpm test:watch            # Watch mode for development
```

## 🔧 Development

### Microsoft React Patterns

MemorAI follows Microsoft React best practices:

#### Performance Optimization
```typescript
// Memoized components
const MemoryCard = React.memo(({ memory, onEdit }) => {
  const handleEdit = useCallback(() => onEdit(memory), [memory, onEdit]);
  const formattedDate = useMemo(() => formatDate(memory.createdAt), [memory.createdAt]);
  
  return <div>{/* Component JSX */}</div>;
});
```

#### TypeScript Strict Typing
```typescript
interface MemoryProps {
  memory: Memory;
  variant: 'default' | 'compact' | 'expanded';
  onEdit?: (memory: Memory) => void;
  onDelete?: (id: string) => void;
  className?: string;
}
```

#### Custom Hooks Pattern
```typescript
export const useMemoryManagement = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const createMemory = useCallback(async (data: CreateMemoryData) => {
    // Implementation
  }, []);

  return { memories, createMemory, isLoading };
};
```

### Code Quality

- **ESLint**: Next.js recommended configuration with TypeScript support
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode with comprehensive type checking
- **Git Hooks**: Pre-commit validation and testing

### Development Guidelines

1. **Component Design**: Use React.memo, implement proper interfaces, follow accessibility standards
2. **Performance**: Memoize expensive operations, use dynamic imports, monitor Core Web Vitals
3. **Testing**: Write comprehensive tests, include accessibility validation
4. **Documentation**: Document complex functionality, update README for changes

## 📊 Monitoring & Analytics

### Application Insights Dashboard

Monitor your application with comprehensive metrics:

- **Performance Metrics**: Page load times, Core Web Vitals, API response times
- **User Behavior**: User flows, interaction patterns, feature usage
- **Error Tracking**: JavaScript errors, API failures, user-reported issues
- **Custom Events**: Business-specific metrics and KPIs

### Custom Telemetry

```typescript
// Track business events
trackEvent('memory_created', { 
  category: 'personal', 
  wordCount: content.length,
  userId: user.id 
});

// Monitor feature usage
trackPageView('/dashboard', { 
  feature: 'analytics',
  userId: user.id 
});

// Track errors with context
trackException(error, { 
  component: 'MemoryDashboard',
  userId: user.id,
  action: 'create_memory'
});
```

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### Docker Deployment

MemorAI runs as part of the CODAI ecosystem:

```yaml
services:
  memorai-frontend:
    image: codai/memorai-frontend:latest
    ports:
      - "4006:4006"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:4950
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4006/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_API_URL` | API endpoint | `http://localhost:4950` |
| `APPLICATION_INSIGHTS_CONNECTION_STRING` | Monitoring | `InstrumentationKey=...` |
| `NEXTAUTH_SECRET` | Authentication secret | `generated-secret` |

## 🤝 Contributing

### Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow coding standards and add tests
4. **Run tests**: `pnpm test` and ensure all pass
5. **Check accessibility**: `pnpm test:accessibility`
6. **Submit a pull request**: With comprehensive description

### Coding Standards

- Follow TypeScript strict mode
- Implement WCAG 2.1 AA accessibility standards
- Write comprehensive tests for new features
- Use conventional commit messages
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Documentation
- [Development Guide](DEVELOPMENT_GUIDE.md) - Comprehensive development documentation
- [API Documentation](docs/API.md) - API endpoints and integration
- [Component Library](docs/COMPONENTS.md) - Component usage and examples

### Troubleshooting

#### Common Issues

1. **Build Errors**: Check TypeScript compilation and import paths
2. **Performance Issues**: Review component render patterns and optimize
3. **Accessibility Violations**: Run axe-core tests and verify ARIA implementation
4. **Test Failures**: Check environment setup and update snapshots if needed

#### Getting Help

- Check existing [GitHub Issues](https://github.com/your-org/codai-project/issues)
- Review [Development Guide](DEVELOPMENT_GUIDE.md) for detailed documentation
- Contact the development team for enterprise support

---

**MemorAI** - Building the future of intelligent memory management with Microsoft React best practices, enterprise-grade performance, and comprehensive accessibility compliance.
