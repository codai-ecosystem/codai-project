# CODAI UI Components Library

A comprehensive, production-ready React component library built for the CODAI ecosystem. Features modern design patterns, accessibility compliance, and developer-friendly APIs.

## 🚀 Features

- **50+ Production-Ready Components** - Complete component library covering all UI needs
- **TypeScript-First** - Full type safety with intelligent IntelliSense
- **Accessibility Compliant** - WCAG 2.1 AA standards with screen reader support
- **Design System** - Consistent spacing, typography, and color tokens
- **Dark/Light Themes** - Built-in theme switching with CSS variables
- **Responsive Design** - Mobile-first approach with breakpoint utilities
- **Animation Support** - Framer Motion integration with performance optimization
- **Form Validation** - React Hook Form + Zod integration
- **Data Visualization** - Chart components with Recharts
- **Developer Experience** - Storybook stories, comprehensive documentation

## 📦 Installation

```bash
# Install the package
pnpm add @codai/ui-components

# Install peer dependencies
pnpm add react react-dom

# Install additional dependencies for full functionality
pnpm add @radix-ui/react-slot framer-motion clsx class-variance-authority
```

## 🎯 Quick Start

```tsx
import { Button, Input, Card } from '@codai/ui-components';
import '@codai/ui-components/styles';

function App() {
  return (
    <Card>
      <h1>Welcome to CODAI UI</h1>
      <Input placeholder="Enter your name..." />
      <Button variant="primary" size="lg">
        Get Started
      </Button>
    </Card>
  );
}
```

## 🎨 Theme Setup

```tsx
// app.tsx
import { ThemeProvider } from '@codai/ui-components';
import '@codai/ui-components/styles';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="codai-ui-theme">
      <YourApp />
    </ThemeProvider>
  );
}
```

## 📚 Component Categories

### Core Components
Essential building blocks for any application:
- **Button** - Primary actions with variants and states
- **Input** - Form inputs with validation and accessibility
- **Card** - Content containers with elevation
- **Badge** - Status indicators and labels
- **Avatar** - User profile images with fallbacks

### Layout Components
Structure and organization utilities:
- **Container** - Responsive content wrapper
- **Grid** - CSS Grid layouts with responsive breakpoints
- **Flex** - Flexbox layouts with gap and alignment
- **Stack** - Vertical and horizontal stacking
- **Divider** - Visual content separation

### Navigation Components
User flow and wayfinding:
- **Tabs** - Content organization and switching
- **Breadcrumbs** - Hierarchical navigation
- **Pagination** - Large dataset navigation
- **Sidebar** - Application navigation
- **NavigationMenu** - Complex menu structures

### Form Components
Data input and validation:
- **Form** - Form wrapper with validation context
- **Select** - Dropdown selections with search
- **Checkbox** - Boolean input with states
- **RadioGroup** - Single-choice selections
- **Switch** - Toggle controls
- **DatePicker** - Date and time selection
- **FileUpload** - File input with drag-and-drop

### Feedback Components
User communication and status:
- **Toast** - Temporary notifications
- **Dialog** - Modal dialogs and confirmations
- **Tooltip** - Contextual help and information
- **Progress** - Task completion indicators
- **Spinner** - Loading states and animations
- **Alert** - Important messages and warnings

### Data Display Components
Information presentation:
- **Table** - Tabular data with sorting and filtering
- **DataGrid** - Advanced data tables with virtualization
- **Chart** - Data visualization with multiple chart types
- **StatsCard** - Metric displays with trends
- **Timeline** - Chronological information display
- **KPIGrid** - Key performance indicator layouts

### Advanced Components
Complex interactions and specialized use cases:
- **CommandPalette** - Keyboard-driven actions
- **VirtualList** - Performance-optimized large lists
- **InfiniteScroll** - Continuous content loading
- **DragAndDrop** - Interactive content manipulation
- **SearchBox** - Enhanced search with filters
- **NotificationCenter** - Centralized message management

## 🎛️ Customization

### CSS Variables
All components use CSS custom properties for theming:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  /* ... more variables */
}
```

### Component Variants
Most components support multiple variants:

```tsx
<Button variant="primary" size="lg" />
<Button variant="secondary" size="md" />
<Button variant="outline" size="sm" />
<Button variant="ghost" size="icon" />
```

### Custom Styling
Components accept className props for custom styling:

```tsx
<Button 
  className="bg-gradient-to-r from-purple-500 to-pink-500"
  variant="primary"
>
  Custom Gradient Button
</Button>
```

## ♿ Accessibility

All components are built with accessibility in mind:

- **WCAG 2.1 AA Compliance** - Meets international accessibility standards
- **Screen Reader Support** - Proper ARIA labels and descriptions
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Management** - Visible focus indicators and logical tab order
- **Color Contrast** - Sufficient contrast ratios for all text
- **Reduced Motion** - Respects user motion preferences

```tsx
<Button
  aria-label="Save document"
  aria-describedby="save-help"
  disabled={!isValid}
>
  Save
</Button>
```

## 📱 Responsive Design

Components are mobile-first and responsive:

```tsx
<Container size={{ base: 'sm', md: 'lg', xl: '2xl' }}>
  <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
    <Card>Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols</Card>
  </Grid>
</Container>
```

## 🎬 Animation Support

Built-in animations with Framer Motion:

```tsx
<Button
  animated={true}
  motionProps={{
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }}
>
  Animated Button
</Button>
```

## 📋 Form Integration

Seamless integration with React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <Form {...form}>
      <FormField
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

## 📊 Data Visualization

Rich chart components for data presentation:

```tsx
<Chart
  type="line"
  data={salesData}
  config={{
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))"
    },
    revenue: {
      label: "Revenue", 
      color: "hsl(var(--chart-2))"
    }
  }}
  className="h-[400px]"
/>
```

## 🧪 Testing

Components are thoroughly tested and provide testing utilities:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@codai/ui-components';

test('button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## 📖 Storybook

Comprehensive component documentation and playground:

```bash
# Run Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Type checking
pnpm type-check

# Lint code
pnpm lint

# Build library
pnpm build
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct.

## 📞 Support

- Documentation: [CODAI UI Docs](https://ui.codai.dev)
- Issues: [GitHub Issues](https://github.com/codai/ui-components/issues)
- Discussions: [GitHub Discussions](https://github.com/codai/ui-components/discussions)

---

Built with ❤️ by the CODAI team
