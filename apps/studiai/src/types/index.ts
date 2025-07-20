// Common types for CODAI ecosystem apps
export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// Course and Lesson types (commonly used in StudiAI)
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail?: string;
  imageUrl?: string;
  name?: string;
  price?: number;
  isFree?: boolean;
  reviews?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  isCompleted: boolean;
  resources: string[];
  name?: string;
  type?: string;
  status?: string;
  isFree?: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  file?: string;
  captions?: Record<string, any>;
  hasQuiz?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Analytics Types
export interface AdminAnalytics {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  popularCourses: any[];
  monthlyRevenue: any[];
  userGrowth: any[];
  courseEnrollments: any[];
}

// Admin Settings Types
export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  allowRegistration: boolean;
  allowSocialLogin: boolean;
  paymentProcessorEnabled: boolean;
  currencyCode: string;
  taxRate: number;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  paymentSettings: {
    stripeEnabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
  };
  socialSettings: {
    facebookUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
  };
}

// Extended Course Types
export interface CourseWithPriceProduct extends Course {
  status?: string;
  priceProduct: {
    id: string;
    prices: any[];
  };
}

// App Context Types
export interface AppContextProps {
  user: User | null;
  courses: Record<string, Course>;
  lessons: Record<string, Record<string, Lesson>>;
  reviews: Record<string, Review[]>;
  products: Product[];
  userPaidProducts: UserPaidProduct[];
  lessonProgress: Record<string, Record<string, UserLessonProgress>>;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isDark: boolean;
  colorScheme: ColorScheme;
  authLoading: boolean;

  // Modal functions
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  updateModal: (modal: Partial<ModalState>) => void;

  // Theme functions
  toggleTheme: () => void;
  handleColorSchemeChange: (scheme: ColorScheme) => void;

  // Data functions
  getCourseLessons: (courseId: string) => Promise<void>;
  getCourseReviews: (courseId: string) => Promise<void>;
  saveLessonProgress: (courseId: string, lessonId: string, progress: UserLessonProgress) => Promise<boolean>;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<boolean>;

  // Admin functions
  getAllUsers: () => Promise<UserProfile[] | null>;
  assignCourseToUser: (userId: string, courseId: string) => Promise<boolean>;
  getAdminAnalytics: () => Promise<AdminAnalytics | null>;
  getAdminSettings: () => Promise<AdminSettings | null>;
}

// Lesson Progress Types
export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  progress: number;
  lastUpdated: Date;
}

// Modal State Type
export interface ModalState {
  isOpen: boolean;
  type: string;
  props?: any;
}

// Color Scheme Type
export type ColorScheme = 'modern-purple' | 'green-neon' | 'blue-ocean' | 'brown-sunset' | 'yellow-morning' | 'red-blood' | 'pink-candy' | 'black-white';

// Cache Status Types
export type CacheStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CacheInfo {
  isOnline: boolean;
  lastSync: Date;
  pendingSync: number;
}

// UI Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface MarginType {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// Policy Types
export interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

export interface PolicySubsectionProps {
  title: string;
  children: React.ReactNode;
}

export interface PolicyListProps {
  items: string[];
}

// Profile Types
export interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

// Resource Types
export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'document' | 'link' | 'image';
  description?: string;
}

export interface LessonResource extends Resource {
  lessonId: string;
}

// User Types
export interface UserPaidProduct {
  id: string;
  productId: string;
  userId: string;
  purchaseDate: Date;
  expiryDate?: Date;
}

// Lesson Form Types
export interface LessonFormProps {
  lesson?: Lesson;
  courseId: string;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
}

export interface CourseModule {
  id: string;
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface LessonType {
  id: string;
  name: string;
  description: string;
}

// Q&A Types
export interface Question {
  id: string;
  lessonId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  isResolved: boolean;
  answers: Answer[];
  tags: string[];
  upvotes: number;
  downvotes: number;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: Date;
  isAccepted: boolean;
  upvotes: number;
  downvotes: number;
  attachments: Attachment[];
  likedBy?: string[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface QAProps {
  lessonId: string;
  courseId: string;
}

// Lesson Settings Types
export interface LessonSettingsProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
}

// Toast Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  isClosable?: boolean;
  action?: () => void;
  actionLabel?: string;
  onClose?: (id: string) => void;
}

export interface ToastProps extends Omit<Toast, 'id'> {
  onClose: (id: string) => void;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

// Re-export UserProfile from services
export type { UserProfile } from '../services/user';

// Export all specific type modules
export * from './auth';
export * from './study';
export * from './upload';
export * from './pwa';