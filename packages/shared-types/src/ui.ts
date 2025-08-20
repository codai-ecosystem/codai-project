// UI Component Types for CODAI Ecosystem
import { ReactNode } from 'react';

// Base UI Types
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  badge?: string | number;
  children?: NavigationItem[];
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
  isActive?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  content?: ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  value?: any;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: FormOption[];
  validation?: FormValidation;
  help?: string;
  prefix?: string;
  suffix?: string;
  mask?: string;
}

export interface FormOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}

export interface FormValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | boolean;
}

export interface FormError {
  field: string;
  message: string;
}

// Table Types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => ReactNode;
  type?: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'badge' | 'actions';
}

export interface TableFilter {
  key: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: FormOption[];
  value?: any;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Modal Types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

// Card Types
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: CardAction[];
  variant?: 'default' | 'outline' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  loading?: boolean;
}

export interface CardAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// Button Types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Alert Types
export interface AlertProps extends BaseComponentProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'custom';
  title: string;
  subtitle?: string;
  position: WidgetPosition;
  config: WidgetConfig;
  data?: any;
  loading?: boolean;
  error?: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetConfig {
  refreshInterval?: number;
  dataSource?: string;
  filters?: Record<string, any>;
  options?: Record<string, any>;
}

// Chart Types
export interface ChartProps extends BaseComponentProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
  width?: number;
  height?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  legend?: {
    display?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  scales?: {
    x?: ChartScale;
    y?: ChartScale;
  };
  plugins?: Record<string, any>;
}

export interface ChartScale {
  display?: boolean;
  title?: {
    display?: boolean;
    text?: string;
  };
  min?: number;
  max?: number;
  ticks?: {
    stepSize?: number;
    callback?: (value: any) => string;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retry?: () => void;
}

// Theme Types
export interface Theme {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    success: ColorPalette;
    warning: ColorPalette;
    error: ColorPalette;
    neutral: ColorPalette;
  };
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  breakpoints: Breakpoints;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface Typography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
}

export interface Spacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Animation Types
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Search Types
export interface SearchProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  debounceMs?: number;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  category?: string;
  onClick?: () => void;
}

// File Upload Types
export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onUpload: (files: File[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  error?: string;
  uploadedAt: Date;
}
