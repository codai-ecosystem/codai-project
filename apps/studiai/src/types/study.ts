export interface StudySession {
    id: string;
    title: string;
    description?: string;
    subject: string;
    duration: number; // in minutes
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
    progress: number; // 0-100
    type: 'reading' | 'practice' | 'review' | 'exam';
    materials: StudyMaterial[];
    notes: string;
    tags: string[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StudyMaterial {
    id: string;
    title: string;
    type: 'document' | 'video' | 'audio' | 'image' | 'link';
    url: string;
    size?: number;
    duration?: number; // for video/audio in seconds
    pageCount?: number; // for documents
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
}

export interface StudyPlan {
    id: string;
    title: string;
    description: string;
    subject: string;
    targetDate: Date;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    sessions: StudySession[];
    progress: number; // 0-100
    isCompleted: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StudyGoal {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string; // hours, sessions, topics, etc.
    deadline: Date;
    isCompleted: boolean;
    category: 'time' | 'content' | 'performance' | 'habit';
    userId: string;
    createdAt: Date;
}

export interface StudyStats {
    totalHours: number;
    totalSessions: number;
    averageSessionDuration: number;
    completedPlans: number;
    activeStreak: number;
    longestStreak: number;
    subjectBreakdown: Record<string, number>;
    weeklyProgress: number[];
    monthlyProgress: number[];
    achievements: string[];
}

export interface FlashCard {
    id: string;
    front: string;
    back: string;
    subject: string;
    topic: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    lastReviewed?: Date;
    nextReview?: Date;
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;
    tags: string[];
    userId: string;
    createdAt: Date;
}

export interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    options?: string[]; // for multiple choice
    correctAnswer: string | string[];
    explanation?: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    subject: string;
    topic: string;
    tags: string[];
    points: number;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    subject: string;
    questions: QuizQuestion[];
    timeLimit?: number; // in minutes
    passingScore: number; // percentage
    attempts: number;
    maxAttempts?: number;
    isPublished: boolean;
    userId: string;
    createdAt: Date;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    answers: Record<string, string | string[]>;
    score: number;
    percentage: number;
    timeSpent: number; // in seconds
    isPassed: boolean;
    startedAt: Date;
    completedAt?: Date;
}

export interface StudyNote {
    id: string;
    title: string;
    content: string;
    subject: string;
    topic: string;
    tags: string[];
    attachments: StudyMaterial[];
    isPublic: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
