// Common types for CODAI ecosystem apps
export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  processing_time?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// TalentAI specific types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience: number; // years
  education: string[];
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  salary_expectation?: {
    min: number;
    max: number;
    currency: string;
  };
  availability: 'immediate' | 'two_weeks' | 'one_month' | 'negotiable';
  created_at: Date;
  updated_at: Date;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  skills_preferred: string[];
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  location: string;
  remote_allowed: boolean;
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  benefits: string[];
  posted_at: Date;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Interview {
  id: string;
  candidate_id: string;
  job_post_id: string;
  interviewer: string;
  scheduled_at: Date;
  duration_minutes: number;
  type: 'phone' | 'video' | 'in_person' | 'technical' | 'hr';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  rating?: number; // 1-5
  feedback?: string;
  next_steps?: string;
  created_at: Date;
  updated_at: Date;
}

// PWA types
export interface PWAInstallerProps {
  onInstall?: () => void;
  onCancel?: () => void;
}

export interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
}

export interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  update: () => Promise<void>;
}

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}