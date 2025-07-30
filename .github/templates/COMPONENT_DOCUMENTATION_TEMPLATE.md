# 📦 COMPONENT DOCUMENTATION TEMPLATE

**Component**: [COMPONENT_NAME]  
**Version**: [X.Y.Z]  
**Type**: [React Component | Hook | Service | Utility | MCP Server]  
**Category**: [UI | Logic | Data | Integration | Infrastructure]  
**Last Updated**: [Date]  
**Stability**: [Stable | Beta | Alpha | Experimental]

---

## 🎯 Component Overview

[Brief description of what this component does and its purpose in the CODAI ecosystem]

### Primary Responsibilities:
- ✅ [Responsibility 1]
- ✅ [Responsibility 2]
- ✅ [Responsibility 3]

### Key Features:
- 🚀 [Feature 1]
- ⚡ [Feature 2]
- 🔒 [Feature 3]

---

## 📖 API Documentation

### Props / Parameters

#### Required Props:
| Prop | Type | Description | Example |
|------|------|-------------|---------|
| `prop1` | `string` | [Description] | `"example value"` |
| `prop2` | `number` | [Description] | `42` |
| `prop3` | `object` | [Description] | `{ key: "value" }` |

#### Optional Props:
| Prop | Type | Default | Description | Example |
|------|------|---------|-------------|---------|
| `optionalProp1` | `boolean` | `false` | [Description] | `true` |
| `optionalProp2` | `string` | `""` | [Description] | `"optional"` |
| `optionalProp3` | `function` | `undefined` | [Description] | `() => {}` |

### TypeScript Interface:
```typescript
interface [ComponentName]Props {
  // Required props
  prop1: string;
  prop2: number;
  prop3: {
    key: string;
    value: any;
  };
  
  // Optional props
  optionalProp1?: boolean;
  optionalProp2?: string;
  optionalProp3?: () => void;
  
  // Event handlers
  onClick?: (event: MouseEvent) => void;
  onchange?: (value: string) => void;
  
  // Style props
  className?: string;
  style?: React.CSSProperties;
  
  // Children
  children?: React.ReactNode;
}
```

### Return Value / Output:
```typescript
// For React components
JSX.Element

// For hooks
interface [HookName]Return {
  state: StateType;
  actions: {
    action1: () => void;
    action2: (param: string) => Promise<void>;
  };
  utils: {
    helper1: () => boolean;
    helper2: (input: any) => ProcessedType;
  };
}

// For services
interface [ServiceName]Response {
  success: boolean;
  data?: DataType;
  error?: string;
  metadata?: {
    timestamp: string;
    version: string;
  };
}
```

---

## 💻 Usage Examples

### Basic Usage:
```tsx
import { [ComponentName] } from '@/components/[ComponentName]';

function App() {
  return (
    <[ComponentName]
      prop1="example"
      prop2={42}
      prop3={{ key: "value" }}
    />
  );
}
```

### Advanced Usage:
```tsx
import { [ComponentName] } from '@/components/[ComponentName]';
import { useState, useCallback } from 'react';

function AdvancedExample() {
  const [state, setState] = useState(initialState);
  
  const handleAction = useCallback((value: string) => {
    // Handle the action
    setState(prev => ({ ...prev, value }));
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('[ComponentName] error:', error);
    // Handle error appropriately
  }, []);

  return (
    <div className="advanced-example">
      <[ComponentName]
        prop1="advanced example"
        prop2={100}
        prop3={{
          key: "advanced",
          value: state.complexValue,
          nested: {
            option1: true,
            option2: "custom"
          }
        }}
        optionalProp1={true}
        optionalProp2="custom value"
        optionalProp3={handleAction}
        onClick={handleClick}
        onChange={handleChange}
        onError={handleError}
        className="custom-styling"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: '8px'
        }}
      >
        <CustomContent />
      </[ComponentName]>
    </div>
  );
}
```

### Hook Usage Example:
```tsx
import { use[HookName] } from '@/hooks/use[HookName]';

function ComponentUsingHook() {
  const { state, actions, utils } = use[HookName]({
    initialValue: "default",
    options: {
      autoSave: true,
      debounceMs: 300
    }
  });

  const handleSubmit = async () => {
    try {
      await actions.action2("submit data");
      console.log('Success:', state);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <p>Current state: {JSON.stringify(state)}</p>
      <button onClick={actions.action1}>
        Action 1
      </button>
      <button onClick={handleSubmit}>
        Async Action
      </button>
      {utils.helper1() && (
        <span>Helper condition met</span>
      )}
    </div>
  );
}
```

### Service Integration Example:
```tsx
import { [ServiceName] } from '@/services/[ServiceName]';
import { useEffect, useState } from 'react';

function ServiceIntegrationExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await [ServiceName].fetchData({
          param1: "value1",
          param2: 42
        });
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h3>Service Data:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## 🏗️ Implementation Details

### Component Source Code:
```tsx
// src/components/[ComponentName]/[ComponentName].tsx
import React, { 
  forwardRef, 
  useImperativeHandle, 
  useCallback, 
  useMemo,
  useState,
  useEffect 
} from 'react';
import { clsx } from 'clsx';
import styles from './[ComponentName].module.css';

// Type definitions
interface [ComponentName]Props {
  // Props interface as defined above
}

interface [ComponentName]Ref {
  focus: () => void;
  getValue: () => any;
  reset: () => void;
}

// Main component implementation
export const [ComponentName] = forwardRef<[ComponentName]Ref, [ComponentName]Props>(
  (
    {
      prop1,
      prop2,
      prop3,
      optionalProp1 = false,
      optionalProp2 = "",
      optionalProp3,
      onClick,
      onChange,
      onError,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) => {
    // Internal state
    const [internalState, setInternalState] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);

    // Memoized computations
    const computedValue = useMemo(() => {
      return expensiveComputation(prop1, prop2);
    }, [prop1, prop2]);

    // Event handlers
    const handleClick = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      
      try {
        // Handle click logic
        onClick?.(event);
      } catch (error) {
        onError?.(error as Error);
      }
    }, [onClick, onError]);

    const handleChange = useCallback((value: string) => {
      setInternalState(value);
      onChange?.(value);
    }, [onChange]);

    // Side effects
    useEffect(() => {
      if (prop3.key) {
        // Handle prop3 changes
        performSideEffect(prop3);
      }
    }, [prop3]);

    // Ref implementation
    useImperativeHandle(ref, () => ({
      focus: () => {
        // Focus implementation
      },
      getValue: () => {
        return internalState;
      },
      reset: () => {
        setInternalState(initialValue);
      }
    }), [internalState]);

    // Render logic
    const componentClasses = clsx(
      styles.component,
      {
        [styles.loading]: isLoading,
        [styles.optional]: optionalProp1,
      },
      className
    );

    if (isLoading) {
      return (
        <div className={clsx(styles.component, styles.loading)}>
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div 
        className={componentClasses}
        style={style}
        onClick={handleClick}
        {...rest}
      >
        <div className={styles.header}>
          <h3>{prop1}</h3>
          {optionalProp2 && (
            <span className={styles.subtitle}>
              {optionalProp2}
            </span>
          )}
        </div>
        
        <div className={styles.content}>
          {computedValue > 0 && (
            <div className={styles.value}>
              Value: {computedValue}
            </div>
          )}
          
          {children}
        </div>

        {prop3.nested && (
          <div className={styles.footer}>
            <ComplexNestedComponent data={prop3.nested} />
          </div>
        )}
      </div>
    );
  }
);

[ComponentName].displayName = '[ComponentName]';

// Default export
export default [ComponentName];
```

### Styling Implementation:
```css
/* src/components/[ComponentName]/[ComponentName].module.css */
.component {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  font-family: var(--font-family-base);
  
  transition: all 0.2s ease-in-out;
}

.component:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.component.loading {
  opacity: 0.6;
  pointer-events: none;
}

.component.optional {
  border-style: dashed;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border-light);
}

.header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.value {
  padding: var(--spacing-xs);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-code);
}

.footer {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border-light);
}

/* Responsive design */
@media (max-width: 768px) {
  .component {
    padding: var(--spacing-sm);
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .component {
    background-color: var(--color-background-dark);
    border-color: var(--color-border-dark);
  }
  
  .header h3 {
    color: var(--color-text-primary-dark);
  }
  
  .subtitle {
    color: var(--color-text-secondary-dark);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .component {
    border-width: 2px;
    border-color: var(--color-border-high-contrast);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
  }
}
```

---

## 🧪 Testing Examples

### Unit Tests:
```tsx
// src/components/[ComponentName]/[ComponentName].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { [ComponentName] } from './[ComponentName]';

describe('[ComponentName]', () => {
  const defaultProps = {
    prop1: 'test value',
    prop2: 42,
    prop3: { key: 'test', value: 'data' }
  };

  it('renders with required props', () => {
    render(<[ComponentName] {...defaultProps} />);
    
    expect(screen.getByText('test value')).toBeInTheDocument();
    expect(screen.getByText('Value: 42')).toBeInTheDocument();
  });

  it('handles optional props correctly', () => {
    render(
      <[ComponentName] 
        {...defaultProps}
        optionalProp1={true}
        optionalProp2="optional text"
      />
    );
    
    const component = screen.getByRole('button');
    expect(component).toHaveClass('optional');
    expect(screen.getByText('optional text')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(
      <[ComponentName] 
        {...defaultProps}
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles error states correctly', async () => {
    const handleError = vi.fn();
    const handleClick = vi.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    render(
      <[ComponentName] 
        {...defaultProps}
        onClick={handleClick}
        onError={handleError}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error'
        })
      );
    });
  });

  it('applies custom className and style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(
      <[ComponentName] 
        {...defaultProps}
        className="custom-class"
        style={customStyle}
      />
    );
    
    const component = screen.getByRole('button');
    expect(component).toHaveClass('custom-class');
    expect(component).toHaveStyle('background-color: red');
  });

  it('renders children correctly', () => {
    render(
      <[ComponentName] {...defaultProps}>
        <span data-testid="child">Child content</span>
      </[ComponentName]>
    );
    
    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<[ComponentName]Ref>();
    render(<[ComponentName] {...defaultProps} ref={ref} />);
    
    expect(ref.current).toHaveProperty('focus');
    expect(ref.current).toHaveProperty('getValue');
    expect(ref.current).toHaveProperty('reset');
    
    // Test ref methods
    expect(typeof ref.current?.focus).toBe('function');
    expect(typeof ref.current?.getValue).toBe('function');
    expect(typeof ref.current?.reset).toBe('function');
  });

  it('handles loading state', () => {
    // Test loading state implementation
    // This depends on your specific loading logic
  });

  it('handles accessibility correctly', () => {
    render(<[ComponentName] {...defaultProps} />);
    
    const component = screen.getByRole('button');
    expect(component).toBeVisible();
    expect(component).not.toHaveAttribute('aria-hidden');
    
    // Test keyboard navigation
    component.focus();
    expect(component).toHaveFocus();
  });
});
```

### Integration Tests:
```tsx
// src/components/[ComponentName]/[ComponentName].integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { [ComponentName] } from './[ComponentName]';
import { TestProvider } from '../../test/TestProvider';

describe('[ComponentName] Integration', () => {
  it('integrates with external services', async () => {
    const mockService = vi.mocked(externalService);
    mockService.fetchData.mockResolvedValue({
      success: true,
      data: { result: 'success' }
    });

    render(
      <TestProvider>
        <[ComponentName]
          prop1="integration test"
          prop2={100}
          prop3={{ key: 'integration', value: 'test' }}
        />
      </TestProvider>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockService.fetchData).toHaveBeenCalledWith({
        param: 'integration test'
      });
    });

    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('handles real API interactions', async () => {
    // Integration test with actual API calls
    // Use test environment or mock server
  });
});
```

### Storybook Stories:
```tsx
// src/components/[ComponentName]/[ComponentName].stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { [ComponentName] } from './[ComponentName]';

const meta: Meta<typeof [ComponentName]> = {
  title: 'Components/[ComponentName]',
  component: [ComponentName],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile component for [component description]',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    prop1: {
      control: 'text',
      description: 'Primary prop description',
    },
    prop2: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Numeric prop description',
    },
    optionalProp1: {
      control: 'boolean',
      description: 'Optional boolean prop',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop1: 'Default Example',
    prop2: 42,
    prop3: { key: 'default', value: 'example' },
  },
};

export const WithOptionalProps: Story = {
  args: {
    prop1: 'With Optional Props',
    prop2: 75,
    prop3: { key: 'optional', value: 'example' },
    optionalProp1: true,
    optionalProp2: 'Optional text',
  },
};

export const Loading: Story = {
  args: {
    prop1: 'Loading State',
    prop2: 25,
    prop3: { key: 'loading', value: 'example' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Component in loading state',
      },
    },
  },
};

export const WithChildren: Story = {
  args: {
    prop1: 'With Children',
    prop2: 60,
    prop3: { key: 'children', value: 'example' },
  },
  render: (args) => (
    <[ComponentName] {...args}>
      <div style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
        Child content example
      </div>
    </[ComponentName]>
  ),
};

export const Interactive: Story = {
  args: {
    prop1: 'Interactive Example',
    prop2: 80,
    prop3: { key: 'interactive', value: 'example' },
    onClick: () => alert('Clicked!'),
    onChange: (value: string) => console.log('Changed:', value),
  },
};
```

---

## 🔧 Configuration & Customization

### Theme Customization:
```css
/* CSS Custom Properties for theming */
:root {
  /* Component-specific variables */
  --[component-name]-background: var(--color-background);
  --[component-name]-border: var(--color-border);
  --[component-name]-text: var(--color-text-primary);
  --[component-name]-hover: var(--color-background-hover);
  
  /* Size variations */
  --[component-name]-size-sm: 2rem;
  --[component-name]-size-md: 3rem;
  --[component-name]-size-lg: 4rem;
  
  /* Spacing */
  --[component-name]-padding: var(--spacing-md);
  --[component-name]-margin: var(--spacing-sm);
}

/* Dark theme overrides */
[data-theme="dark"] {
  --[component-name]-background: var(--color-background-dark);
  --[component-name]-border: var(--color-border-dark);
  --[component-name]-text: var(--color-text-primary-dark);
}
```

### Props Configuration:
```tsx
// Configuration interface for advanced use cases
interface [ComponentName]Config {
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  animation?: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  accessibility?: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    role?: string;
  };
  performance?: {
    lazyLoad: boolean;
    virtualizeList: boolean;
    debounceMs: number;
  };
}

// Extended component with configuration
export const Configurable[ComponentName]: React.FC<
  [ComponentName]Props & { config?: [ComponentName]Config }
> = ({ config, ...props }) => {
  const mergedConfig = {
    theme: 'auto',
    size: 'md',
    variant: 'primary',
    animation: { enabled: true, duration: 200, easing: 'ease-in-out' },
    accessibility: {},
    performance: { lazyLoad: false, virtualizeList: false, debounceMs: 300 },
    ...config
  };

  return <[ComponentName] {...props} config={mergedConfig} />;
};
```

---

## 🔄 State Management

### Internal State:
```tsx
// Internal state management patterns
interface ComponentState {
  isLoading: boolean;
  hasError: boolean;
  data: DataType | null;
  userInteractions: {
    clicks: number;
    lastAction: string;
    timestamp: number;
  };
}

const useComponentState = (initialData?: DataType) => {
  const [state, setState] = useState<ComponentState>({
    isLoading: false,
    hasError: false,
    data: initialData || null,
    userInteractions: {
      clicks: 0,
      lastAction: 'none',
      timestamp: Date.now()
    }
  });

  const updateState = useCallback((updates: Partial<ComponentState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      userInteractions: {
        ...prev.userInteractions,
        ...updates.userInteractions
      }
    }));
  }, []);

  return { state, updateState };
};
```

### External State Integration:
```tsx
// Integration with external state management
import { useSelector, useDispatch } from 'react-redux';
import { useAtom } from 'jotai';
import { useStore } from 'zustand';

// Redux integration
const useReduxIntegration = () => {
  const data = useSelector((state: RootState) => state.[componentName]);
  const dispatch = useDispatch();

  return {
    data,
    actions: {
      update: (payload: any) => dispatch(update[ComponentName](payload)),
      reset: () => dispatch(reset[ComponentName]())
    }
  };
};

// Jotai integration
const [componentName]Atom = atom(defaultValue);

const useJotaiIntegration = () => {
  const [value, setValue] = useAtom([componentName]Atom);
  return { value, setValue };
};

// Zustand integration
interface [ComponentName]Store {
  data: DataType;
  actions: {
    updateData: (data: DataType) => void;
    resetData: () => void;
  };
}

const use[ComponentName]Store = create<[ComponentName]Store>((set) => ({
  data: initialData,
  actions: {
    updateData: (data) => set({ data }),
    resetData: () => set({ data: initialData })
  }
}));
```

---

## ⚡ Performance Considerations

### Optimization Techniques:
```tsx
// Performance optimization examples
import { memo, useMemo, useCallback, lazy, Suspense } from 'react';

// Memoization
export const Optimized[ComponentName] = memo([ComponentName], (prevProps, nextProps) => {
  // Custom comparison logic
  return (
    prevProps.prop1 === nextProps.prop1 &&
    prevProps.prop2 === nextProps.prop2 &&
    JSON.stringify(prevProps.prop3) === JSON.stringify(nextProps.prop3)
  );
});

// Lazy loading for heavy components
const Heavy[ComponentName] = lazy(() => import('./Heavy[ComponentName]'));

export const LazyLoaded[ComponentName]: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<ComponentSkeleton />}>
      <Heavy[ComponentName] {...props} />
    </Suspense>
  );
};

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window';

export const Virtualized[ComponentName]: React.FC<{
  items: Array<ItemType>;
  itemHeight: number;
  height: number;
}> = ({ items, itemHeight, height }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <[ComponentName] {...items[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Bundle Size Optimization:
```tsx
// Tree shaking and code splitting
export { [ComponentName] } from './[ComponentName]';
export type { [ComponentName]Props, [ComponentName]Ref } from './[ComponentName]';

// Conditional imports
export const [ComponentName]WithFeatures = lazy(() =>
  import('./[ComponentName]WithFeatures').then(module => ({
    default: module.[ComponentName]WithFeatures
  }))
);

// Feature flags for optional functionality
interface FeatureFlags {
  enableAdvancedFeatures: boolean;
  enableAnalytics: boolean;
  enableExperimentalUI: boolean;
}

export const Feature[ComponentName]: React.FC<
  [ComponentName]Props & { features?: FeatureFlags }
> = ({ features, ...props }) => {
  const {
    enableAdvancedFeatures = false,
    enableAnalytics = false,
    enableExperimentalUI = false
  } = features || {};

  return (
    <[ComponentName] {...props}>
      {enableAdvancedFeatures && <AdvancedFeatures />}
      {enableAnalytics && <AnalyticsProvider />}
      {enableExperimentalUI && <ExperimentalUI />}
    </[ComponentName]>
  );
};
```

---

## ♿ Accessibility

### ARIA Implementation:
```tsx
// Accessibility-focused implementation
export const Accessible[ComponentName]: React.FC<[ComponentName]Props> = ({
  ariaLabel,
  ariaDescribedBy,
  role = 'button',
  ...props
}) => {
  const componentId = useId();
  const descriptionId = `${componentId}-description`;

  return (
    <>
      <[ComponentName]
        {...props}
        id={componentId}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy || descriptionId}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            props.onClick?.(event as any);
          }
        }}
      />
      {!ariaDescribedBy && (
        <div id={descriptionId} className="sr-only">
          {generateAccessibleDescription(props)}
        </div>
      )}
    </>
  );
};

// Screen reader support
const generateAccessibleDescription = (props: [ComponentName]Props): string => {
  return `Interactive element with value ${props.prop1}, 
          state ${props.prop2}, 
          ${props.optionalProp1 ? 'enabled' : 'disabled'}`;
};
```

### Keyboard Navigation:
```tsx
// Enhanced keyboard navigation
const useKeyboardNavigation = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Activate component
        break;
      case 'Escape':
        // Close/cancel action
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Navigate vertically
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        // Navigate horizontally
        event.preventDefault();
        break;
      case 'Home':
        // Go to first item
        event.preventDefault();
        break;
      case 'End':
        // Go to last item
        event.preventDefault();
        break;
    }
  }, []);

  return { handleKeyDown };
};
```

---

## 🔧 Troubleshooting

### Common Issues:

#### Issue: Component not rendering
**Symptoms**: Component returns null or undefined
**Possible Causes**:
- Missing required props
- Invalid prop types
- Conditional rendering logic errors

**Solutions**:
```tsx
// Add prop validation
const validateProps = (props: [ComponentName]Props): boolean => {
  if (!props.prop1 || typeof props.prop1 !== 'string') {
    console.error('[ComponentName]: prop1 is required and must be a string');
    return false;
  }
  
  if (props.prop2 < 0) {
    console.error('[ComponentName]: prop2 must be a positive number');
    return false;
  }
  
  return true;
};

// Add error boundary
export const SafeComponentName: React.FC<[ComponentName]Props> = (props) => {
  if (!validateProps(props)) {
    return <ErrorFallback error="Invalid props provided" />;
  }
  
  return <[ComponentName] {...props} />;
};
```

#### Issue: Performance problems
**Symptoms**: Slow rendering, high memory usage
**Solutions**:
- Implement memoization
- Use React.memo for expensive renders
- Optimize prop comparisons
- Implement virtualization for large datasets

#### Issue: Styling conflicts
**Symptoms**: CSS not applying correctly
**Solutions**:
- Use CSS Modules or styled-components for scoped styles
- Increase CSS specificity
- Check for conflicting global styles
- Use CSS-in-JS solutions

### Debug Mode:
```tsx
// Development debugging utilities
interface DebugInfo {
  renderCount: number;
  propChanges: Record<string, any>;
  performanceMetrics: {
    lastRender: number;
    averageRenderTime: number;
  };
}

export const Debug[ComponentName]: React.FC<
  [ComponentName]Props & { debug?: boolean }
> = ({ debug, ...props }) => {
  const debugInfo = useRef<DebugInfo>({
    renderCount: 0,
    propChanges: {},
    performanceMetrics: {
      lastRender: 0,
      averageRenderTime: 0
    }
  });

  useEffect(() => {
    if (debug) {
      debugInfo.current.renderCount++;
      console.log('[ComponentName] Debug Info:', debugInfo.current);
    }
  });

  if (debug) {
    return (
      <div>
        <div style={{ 
          background: 'yellow', 
          padding: '0.5rem', 
          fontSize: '0.8rem' 
        }}>
          DEBUG: Render #{debugInfo.current.renderCount}
        </div>
        <[ComponentName] {...props} />
      </div>
    );
  }

  return <[ComponentName] {...props} />;
};
```

---

## 🔄 Changelog

### Version History:

#### v2.1.0 (Latest)
- ✅ Added support for custom themes
- ✅ Improved accessibility features
- ✅ Performance optimizations
- ✅ New optional props: `optionalProp3`
- 🐛 Fixed memory leak in cleanup function
- 📚 Updated documentation with new examples

#### v2.0.0
- 💥 BREAKING: Changed prop2 from string to number
- ✅ Complete TypeScript rewrite
- ✅ Added ref forwarding
- ✅ Improved error handling
- ✅ Added Storybook stories

#### v1.2.1
- 🐛 Fixed CSS specificity issues
- 🐛 Resolved keyboard navigation bugs
- 📚 Added integration test examples

#### v1.2.0
- ✅ Added loading state support
- ✅ Implemented error boundaries
- ✅ Added prop validation
- 📚 Comprehensive documentation update

#### v1.1.0
- ✅ Added optional prop support
- ✅ Improved styling system
- ✅ Added unit tests
- 📚 Added usage examples

#### v1.0.0
- 🎉 Initial stable release
- ✅ Core functionality implemented
- ✅ Basic prop support
- ✅ CSS Module styling

---

## 📋 Component Checklist

### Development Checklist:
- [ ] Component implements required props interface
- [ ] TypeScript types are properly defined
- [ ] Component is properly memoized for performance
- [ ] Error handling is implemented
- [ ] Accessibility features are included
- [ ] Responsive design is implemented
- [ ] Dark mode support is added
- [ ] Animation/transitions are smooth
- [ ] Loading states are handled
- [ ] Edge cases are covered

### Testing Checklist:
- [ ] Unit tests cover all props and interactions
- [ ] Integration tests verify external dependencies
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass
- [ ] Performance benchmarks are met
- [ ] Error scenarios are tested
- [ ] Edge cases are covered
- [ ] Browser compatibility is verified

### Documentation Checklist:
- [ ] API documentation is complete
- [ ] Usage examples are provided
- [ ] TypeScript interfaces are documented
- [ ] Storybook stories are created
- [ ] Accessibility guidelines are documented
- [ ] Performance considerations are noted
- [ ] Troubleshooting guide is included
- [ ] Changelog is maintained

---

## 🤝 Contributing

### Development Setup:
```bash
# Clone the repository
git clone [repository-url]
cd [project-name]

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Contribution Guidelines:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/component-enhancement`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request with detailed description

### Code Review Checklist:
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Performance impact is considered
- [ ] Accessibility requirements are met
- [ ] Browser compatibility is maintained

---

**Status**: 📋 TEMPLATE - Ready for Implementation  
**Template Version**: 1.0.0  
**Created**: July 22, 2025  
**Component Types**: React, Hook, Service, Utility, MCP Server  
**Next Review**: [Schedule review date]

*This template provides comprehensive component documentation for the CODAI ecosystem. Customize sections based on your specific component type and requirements.*
