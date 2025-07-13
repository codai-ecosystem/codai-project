// TalentAI Types
export interface Message {
    id: string
    content: string
    isBot: boolean
    timestamp: Date
}

export interface Candidate {
    id: string
    name: string
    email: string
    skills: string[]
    experience: number
    rating: number
    status: 'available' | 'interviewing' | 'hired'
    resumeUrl?: string
    portfolio?: string
}

export interface JobPost {
    id: string
    title: string
    description: string
    requirements: string[]
    salaryRange: {
        min: number
        max: number
        currency: string
    }
    location: string
    remote: boolean
    type: 'full-time' | 'part-time' | 'contract'
    status: 'draft' | 'published' | 'closed'
    createdAt: Date
    updatedAt: Date
}

export interface Interview {
    id: string
    candidateId: string
    jobPostId: string
    scheduledAt: Date
    duration: number
    type: 'phone' | 'video' | 'in-person'
    status: 'scheduled' | 'completed' | 'cancelled'
    feedback?: string
    score?: number
}

export interface AIResponse {
    message: string
    suggestions?: string[]
    confidence: number
    context?: {
        role?: string
        company?: string
        requirements?: string[]
    }
}

// PWA Types
export * from './pwa';
export * from './auth';
export * from './common';
export * from './app';
export * from './api';
export * from './global';
export * from './i18n';
