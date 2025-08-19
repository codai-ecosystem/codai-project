/**
 * @fileoverview CODAI UI Components Library - Modern React Component System
 * @version 1.0.0
 * @author CODAI Development Team
 * 
 * Comprehensive UI component library featuring:
 * - 50+ production-ready React components
 * - TypeScript-first development with strict type safety
 * - Tailwind CSS styling with design system consistency
 * - WCAG 2.1 AA accessibility compliance
 * - Radix UI primitive foundations for reliability
 * - Framer Motion animations and micro-interactions
 * - Dark/light theme support with CSS variables
 * - Form validation with React Hook Form + Zod
 * - Data visualization components with Recharts
 * - Virtual scrolling for performance optimization
 * - Responsive design patterns and mobile-first approach
 * 
 * Component Categories:
 * - Core: Button, Input, Card, Badge, Avatar
 * - Layout: Container, Grid, Flex, Stack, Divider
 * - Navigation: Tabs, Breadcrumbs, Pagination, Menu
 * - Forms: FormField, Select, Checkbox, Radio, Switch
 * - Feedback: Toast, Dialog, Tooltip, Progress, Spinner
 * - Data Display: Table, DataGrid, Chart, Stats, Timeline
 * - Advanced: CommandPalette, DatePicker, FileUpload, CodeEditor
 */

import './styles/globals.css';
import './styles/components.css';
import './styles/animations.css';

// Core Components
export { Button, type ButtonProps } from './src/components/core/Button';
export { Input, type InputProps } from './src/components/core/Input';
export { Textarea, type TextareaProps } from './src/components/core/Textarea';
export { Card, CardHeader, CardContent, CardFooter, type CardProps } from './src/components/core/Card';
export { Badge, type BadgeProps } from './src/components/core/Badge';
export { Avatar, AvatarImage, AvatarFallback, type AvatarProps } from './src/components/core/Avatar';
export { IconButton, type IconButtonProps } from './src/components/core/IconButton';
export { Label, type LabelProps } from './src/components/core/Label';

// Layout Components  
export { Container, type ContainerProps } from './src/components/layout/Container';
export { Grid, type GridProps } from './src/components/layout/Grid';
export { Flex, type FlexProps } from './src/components/layout/Flex';
export { Stack, type StackProps } from './src/components/layout/Stack';
export { Divider, type DividerProps } from './src/components/layout/Divider';
export { Spacer, type SpacerProps } from './src/components/layout/Spacer';
export { Center, type CenterProps } from './src/components/layout/Center';
export { AspectRatio, type AspectRatioProps } from './src/components/layout/AspectRatio';

// Navigation Components
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps } from './src/components/navigation/Tabs';
export { Breadcrumbs, BreadcrumbItem, type BreadcrumbsProps } from './src/components/navigation/Breadcrumbs';
export { Pagination, type PaginationProps } from './src/components/navigation/Pagination';
export { NavigationMenu, NavigationMenuItem, type NavigationMenuProps } from './src/components/navigation/NavigationMenu';
export { Sidebar, SidebarItem, type SidebarProps } from './src/components/navigation/Sidebar';
export { TopBar, type TopBarProps } from './src/components/navigation/TopBar';

// Form Components
export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, type FormProps } from './src/components/forms/Form';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type SelectProps } from './src/components/forms/Select';
export { Checkbox, type CheckboxProps } from './src/components/forms/Checkbox';
export { RadioGroup, RadioGroupItem, type RadioGroupProps } from './src/components/forms/RadioGroup';
export { Switch, type SwitchProps } from './src/components/forms/Switch';
export { Slider, type SliderProps } from './src/components/forms/Slider';
export { DatePicker, type DatePickerProps } from './src/components/forms/DatePicker';
export { FileUpload, type FileUploadProps } from './src/components/forms/FileUpload';
export { CodeEditor, type CodeEditorProps } from './src/components/forms/CodeEditor';

// Feedback Components
export { Toast, toast, useToast, type ToastProps } from './src/components/feedback/Toast';
export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger, type DialogProps } from './src/components/feedback/Dialog';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type TooltipProps } from './src/components/feedback/Tooltip';
export { Progress, type ProgressProps } from './src/components/feedback/Progress';
export { Spinner, type SpinnerProps } from './src/components/feedback/Spinner';
export { Alert, AlertDescription, AlertTitle, type AlertProps } from './src/components/feedback/Alert';
export { Skeleton, type SkeletonProps } from './src/components/feedback/Skeleton';

// Data Display Components
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableProps } from './src/components/data-display/Table';
export { DataGrid, type DataGridProps } from './src/components/data-display/DataGrid';
export { Chart, LineChart, BarChart, PieChart, AreaChart, type ChartProps } from './src/components/data-display/Chart';
export { StatsCard, type StatsCardProps } from './src/components/data-display/StatsCard';
export { Timeline, TimelineItem, type TimelineProps } from './src/components/data-display/Timeline';
export { KPIGrid, type KPIGridProps } from './src/components/data-display/KPIGrid';
export { MetricsPanel, type MetricsPanelProps } from './src/components/data-display/MetricsPanel';

// Advanced Components
export { CommandPalette, type CommandPaletteProps } from './src/components/advanced/CommandPalette';
export { VirtualList, type VirtualListProps } from './src/components/advanced/VirtualList';
export { InfiniteScroll, type InfiniteScrollProps } from './src/components/advanced/InfiniteScroll';
export { DragAndDrop, type DragAndDropProps } from './src/components/advanced/DragAndDrop';
export { ResizablePanel, type ResizablePanelProps } from './src/components/advanced/ResizablePanel';
export { SearchBox, type SearchBoxProps } from './src/components/advanced/SearchBox';
export { NotificationCenter, type NotificationCenterProps } from './src/components/advanced/NotificationCenter';

// Layout Presets
export { DashboardLayout, type DashboardLayoutProps } from './src/layouts/DashboardLayout';
export { AuthLayout, type AuthLayoutProps } from './src/layouts/AuthLayout';
export { LandingLayout, type LandingLayoutProps } from './src/layouts/LandingLayout';
export { AdminLayout, type AdminLayoutProps } from './src/layouts/AdminLayout';

// Hooks
export { useTheme, type ThemeContextType } from './src/hooks/useTheme';
export { useBreakpoint, type BreakpointHook } from './src/hooks/useBreakpoint';
export { useLocalStorage, type LocalStorageHook } from './src/hooks/useLocalStorage';
export { useDebounce, type DebounceHook } from './src/hooks/useDebounce';
export { useClickOutside, type ClickOutsideHook } from './src/hooks/useClickOutside';
export { useKeyboard, type KeyboardHook } from './src/hooks/useKeyboard';
export { useMediaQuery, type MediaQueryHook } from './src/hooks/useMediaQuery';
export { usePagination, type PaginationHook } from './src/hooks/usePagination';
export { useForm, type FormHook } from './src/hooks/useForm';
export { useAsync, type AsyncHook } from './src/hooks/useAsync';

// Utilities
export { cn, type ClassNameValue } from './src/utils/className';
export { formatters, type FormatterUtils } from './src/utils/formatters';
export { validators, type ValidatorUtils } from './src/utils/validators';
export { animations, type AnimationUtils } from './src/utils/animations';
export { accessibility, type A11yUtils } from './src/utils/accessibility';

// Types
export type {
  ComponentSize,
  ComponentVariant,
  ComponentColor,
  ThemeMode,
  ResponsiveValue,
  SpacingValue,
  BorderRadius,
  BoxShadow,
  Breakpoint
} from './src/types/components';

export type {
  FormFieldType,
  ValidationRule,
  FormState,
  FieldError,
  FormConfig
} from './src/types/forms';

export type {
  ChartData,
  ChartConfig,
  ChartType,
  DataPoint,
  ChartTheme
} from './src/types/charts';

// Theme Provider
export { ThemeProvider, type ThemeProviderProps } from './src/providers/ThemeProvider';
export { TooltipProvider } from './src/providers/TooltipProvider';
export { FormProvider, type FormProviderProps } from './src/providers/FormProvider';

// Constants
export {
  COMPONENT_SIZES,
  COMPONENT_VARIANTS,
  COMPONENT_COLORS,
  BREAKPOINTS,
  SPACING_SCALE,
  TYPOGRAPHY_SCALE,
  COLOR_PALETTE,
  ANIMATION_DURATIONS,
  Z_INDEX_SCALE,
  BORDER_RADIUS_SCALE,
  BOX_SHADOW_SCALE
} from './src/constants/design-tokens';

export {
  ACCESSIBILITY_ROLES,
  ARIA_LABELS,
  KEYBOARD_SHORTCUTS,
  FOCUS_MANAGEMENT,
  SCREEN_READER_ANNOUNCEMENTS
} from './src/constants/accessibility';

// Component Factory (Advanced)
export { createComponent, type ComponentFactory } from './src/factory/createComponent';
export { withTheme, type WithThemeProps } from './src/hocs/withTheme';
export { withAccessibility, type WithA11yProps } from './src/hocs/withAccessibility';
export { withAnimation, type WithAnimationProps } from './src/hocs/withAnimation';

/**
 * Global component configuration and defaults
 */
export const UI_CONFIG = {
  name: '@codai/ui-components',
  version: '1.0.0',
  defaultTheme: 'light',
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  animations: {
    enabled: true,
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  accessibility: {
    focusRing: true,
    reducedMotion: 'auto',
    announcements: true
  },
  components: {
    button: {
      defaultSize: 'md',
      defaultVariant: 'primary'
    },
    input: {
      defaultSize: 'md',
      autoComplete: true
    },
    card: {
      defaultElevation: 'sm',
      defaultRadius: 'md'
    }
  }
} as const;

/**
 * Performance optimization utilities
 */
export const PERFORMANCE = {
  lazyLoading: true,
  virtualScrolling: true,
  memoization: true,
  bundleSplitting: true,
  treeshaking: true
} as const;

/**
 * Development and debugging utilities
 */
export const DEV_TOOLS = {
  componentInspector: process.env.NODE_ENV === 'development',
  performanceProfiler: process.env.NODE_ENV === 'development',
  accessibilityAuditor: process.env.NODE_ENV === 'development',
  themeVisualizer: process.env.NODE_ENV === 'development'
} as const;

/**
 * Component library metadata and manifest
 */
export const COMPONENT_MANIFEST = {
  totalComponents: 50,
  categories: {
    core: 8,
    layout: 8,
    navigation: 6,
    forms: 9,
    feedback: 7,
    dataDisplay: 7,
    advanced: 7,
    layouts: 4
  },
  features: {
    typescript: true,
    accessibility: 'WCAG 2.1 AA',
    responsive: true,
    darkMode: true,
    animations: true,
    testing: true,
    storybook: true,
    documentation: true
  },
  browser_support: {
    chrome: '>=90',
    firefox: '>=88',
    safari: '>=14',
    edge: '>=90'
  }
} as const;
