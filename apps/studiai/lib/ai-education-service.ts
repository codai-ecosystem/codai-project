import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number; // in minutes
  isPublic: boolean;
  instructorId: string;
  enrollmentCount?: number;
  rating?: number;
  price?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  duration: number;
  resources?: string[]; // URLs or file paths
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  lessonId?: string;
  completionPercentage: number;
  timeSpent: number;
  lastAccessed: Date;
  grade?: number;
  notes?: string;
}

export interface AITutor {
  id: string;
  name: string;
  specialty: string;
  personality: 'friendly' | 'professional' | 'enthusiastic' | 'patient';
  model: string; // AI model used
  isActive: boolean;
}

export interface StudySession {
  id: string;
  userId: string;
  courseId?: string;
  tutorId?: string;
  startTime: Date;
  endTime?: Date;
  topic: string;
  type: 'solo_study' | 'ai_tutoring' | 'collaborative' | 'assessment';
  effectiveness?: number; // 1-10 scale
}

export class AIEducationService {

  /**
   * Course Management
   */
  async createCourse(data: {
    title: string;
    description: string;
    level: string;
    category: string;
    duration: number;
    instructorId: string;
    price?: number;
    isPublic?: boolean;
  }): Promise<Course> {
    // Validate instructor exists
    const instructor = await prisma.user.findUnique({
      where: { id: data.instructorId }
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    // Create course in a workspace context
    const workspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: data.instructorId,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        }
      }
    });

    if (!workspace) {
      throw new Error('Instructor must have a workspace');
    }

    const project = await prisma.project.create({
      data: {
        name: data.title,
        description: data.description,
        workspaceId: workspace.id,
        ownerId: data.instructorId,
        isPublic: data.isPublic || false
      }
    });

    const course: Course = {
      id: project.id,
      title: data.title,
      description: data.description,
      level: data.level as any,
      category: data.category,
      duration: data.duration,
      isPublic: data.isPublic || false,
      instructorId: data.instructorId,
      price: data.price,
      enrollmentCount: 0,
      rating: 0
    };

    return course;
  }

  async getCourse(courseId: string): Promise<Course | null> {
    const project = await prisma.project.findUnique({
      where: { id: courseId },
      include: {
        owner: true,
        workspace: {
          include: {
            members: true
          }
        }
      }
    });

    if (!project) return null;

    const course: Course = {
      id: project.id,
      title: project.name,
      description: project.description || '',
      level: 'intermediate', // Default for now
      category: 'General',
      duration: 60, // Default
      isPublic: project.isPublic,
      instructorId: project.ownerId,
      enrollmentCount: project.workspace.members.length
    };

    return course;
  }

  async getAllCourses(filters: {
    category?: string;
    level?: string;
    isPublic?: boolean;
    instructorId?: string;
  } = {}): Promise<Course[]> {
    const where: any = {};

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.instructorId) {
      where.ownerId = filters.instructorId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: true,
        workspace: {
          include: {
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return projects.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      level: 'intermediate' as any,
      category: 'General',
      duration: 60,
      isPublic: project.isPublic,
      instructorId: project.ownerId,
      enrollmentCount: project.workspace._count.members
    }));
  }

  /**
   * Student Enrollment and Progress
   */
  async enrollStudent(userId: string, courseId: string): Promise<boolean> {
    const course = await prisma.project.findUnique({
      where: { id: courseId },
      include: { workspace: true }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Check if already enrolled
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: course.workspaceId,
          userId
        }
      }
    });

    if (existingMember) {
      return true; // Already enrolled
    }

    // Enroll student
    await prisma.workspaceMember.create({
      data: {
        workspaceId: course.workspaceId,
        userId,
        role: 'MEMBER'
      }
    });

    return true;
  }

  async getStudentProgress(userId: string, courseId?: string): Promise<StudentProgress[]> {
    const where: any = {
      userId
    };

    if (courseId) {
      where.workspaceId = courseId; // Using workspace as course proxy
    }

    const memberships = await prisma.workspaceMember.findMany({
      where,
      include: {
        workspace: {
          include: {
            projects: true
          }
        }
      }
    });

    return memberships.map(membership => ({
      userId,
      courseId: membership.workspaceId,
      completionPercentage: Math.random() * 100, // Placeholder
      timeSpent: Math.floor(Math.random() * 300), // Placeholder in minutes
      lastAccessed: membership.joinedAt,
      grade: Math.floor(Math.random() * 100)
    }));
  }

  async updateProgress(data: {
    userId: string;
    courseId: string;
    lessonId?: string;
    completionPercentage: number;
    timeSpent: number;
    grade?: number;
    notes?: string;
  }): Promise<StudentProgress> {
    // For now, we'll store this in user preferences as metadata
    // In a full implementation, this would have its own table
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        theme: 'system'
      },
      update: {}
    });

    return {
      userId: data.userId,
      courseId: data.courseId,
      lessonId: data.lessonId,
      completionPercentage: data.completionPercentage,
      timeSpent: data.timeSpent,
      lastAccessed: new Date(),
      grade: data.grade,
      notes: data.notes
    };
  }

  /**
   * AI Tutoring System
   */
  async createAITutor(data: {
    name: string;
    specialty: string;
    personality: string;
    model: string;
  }): Promise<AITutor> {
    const tutor: AITutor = {
      id: `tutor_${Date.now()}`,
      name: data.name,
      specialty: data.specialty,
      personality: data.personality as any,
      model: data.model,
      isActive: true
    };

    return tutor;
  }

  async getAvailableTutors(specialty?: string): Promise<AITutor[]> {
    // Predefined AI tutors for different subjects
    const tutors: AITutor[] = [
      {
        id: 'tutor_math_001',
        name: 'Professor Newton',
        specialty: 'Mathematics',
        personality: 'patient',
        model: 'gpt-4',
        isActive: true
      },
      {
        id: 'tutor_cs_001',
        name: 'CodeMaster Ada',
        specialty: 'Computer Science',
        personality: 'enthusiastic',
        model: 'gpt-4-turbo',
        isActive: true
      },
      {
        id: 'tutor_lang_001',
        name: 'Linguist Elena',
        specialty: 'Languages',
        personality: 'friendly',
        model: 'gpt-4',
        isActive: true
      },
      {
        id: 'tutor_sci_001',
        name: 'Dr. Cosmos',
        specialty: 'Science',
        personality: 'professional',
        model: 'gpt-4-turbo',
        isActive: true
      },
      {
        id: 'tutor_art_001',
        name: 'Maestro Vincent',
        specialty: 'Arts & Creativity',
        personality: 'enthusiastic',
        model: 'gpt-4-vision',
        isActive: true
      }
    ];

    if (specialty) {
      return tutors.filter(tutor =>
        tutor.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    return tutors;
  }

  async startTutoringSession(data: {
    userId: string;
    tutorId: string;
    topic: string;
    courseId?: string;
  }): Promise<StudySession> {
    // Create a collaboration session for the tutoring
    const collaborationSession = await prisma.collaborationSession.create({
      data: {
        workspaceId: data.courseId || 'default_workspace',
        type: 'ai_tutoring',
        createdBy: data.userId,
        isActive: true
      }
    });

    // Add user as participant
    await prisma.collaborationParticipant.create({
      data: {
        sessionId: collaborationSession.id,
        userId: data.userId,
        permissions: 'write'
      }
    });

    const session: StudySession = {
      id: collaborationSession.id,
      userId: data.userId,
      tutorId: data.tutorId,
      courseId: data.courseId,
      startTime: new Date(),
      topic: data.topic,
      type: 'ai_tutoring'
    };

    return session;
  }

  async endTutoringSession(sessionId: string, effectiveness?: number): Promise<StudySession> {
    // Update collaboration session
    const session = await prisma.collaborationSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    // Update participant status
    await prisma.collaborationParticipant.updateMany({
      where: { sessionId },
      data: { leftAt: new Date() }
    });

    return {
      id: sessionId,
      userId: session.createdBy,
      startTime: session.createdAt,
      endTime: new Date(),
      topic: 'AI Tutoring Session',
      type: 'ai_tutoring',
      effectiveness
    };
  }

  /**
   * Assessment and Analytics
   */
  async generatePersonalizedQuiz(data: {
    userId: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
  }): Promise<{
    quizId: string;
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple_choice' | 'true_false' | 'short_answer';
      options?: string[];
      correctAnswer?: string;
      explanation?: string;
    }>;
  }> {
    // Generate AI-powered quiz questions based on topic and user's progress
    const quizId = `quiz_${Date.now()}`;

    // Sample questions (in production, these would be AI-generated)
    const sampleQuestions = [
      {
        id: `q1_${Date.now()}`,
        question: `What is the main concept of ${data.topic}?`,
        type: 'multiple_choice' as const,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `The main concept of ${data.topic} involves...`
      },
      {
        id: `q2_${Date.now()}`,
        question: `Is ${data.topic} considered fundamental in its field?`,
        type: 'true_false' as const,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `Yes, ${data.topic} is fundamental because...`
      }
    ];

    return {
      quizId,
      questions: sampleQuestions.slice(0, data.questionCount)
    };
  }

  async submitQuizAnswers(data: {
    userId: string;
    quizId: string;
    answers: Array<{
      questionId: string;
      answer: string;
    }>;
  }): Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    feedback: string[];
    recommendations: string[];
  }> {
    // Process quiz answers and provide feedback
    const correctAnswers = data.answers.length; // Simplified for demo
    const totalQuestions = data.answers.length;
    const score = Math.floor((correctAnswers / totalQuestions) * 100);

    const feedback = [
      'Great job on understanding the core concepts!',
      'Consider reviewing the advanced topics for better mastery.',
      'Your progress shows consistent improvement.'
    ];

    const recommendations = [
      'Try the advanced course on this topic',
      'Practice with more interactive exercises',
      'Join a study group for collaborative learning'
    ];

    return {
      score,
      totalQuestions,
      correctAnswers,
      feedback,
      recommendations
    };
  }

  async getStudentAnalytics(userId: string): Promise<{
    totalCoursesEnrolled: number;
    completedCourses: number;
    totalStudyTime: number; // in minutes
    averageGrade: number;
    strongSubjects: string[];
    improvementAreas: string[];
    learningStreak: number; // days
    weeklyProgress: Array<{
      week: string;
      hoursStudied: number;
      coursesCompleted: number;
    }>;
  }> {
    // Get user's course enrollments
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            projects: true
          }
        }
      }
    });

    // Calculate analytics
    const totalCoursesEnrolled = memberships.length;
    const completedCourses = Math.floor(totalCoursesEnrolled * 0.6); // Placeholder
    const totalStudyTime = Math.floor(Math.random() * 1000) + 500; // Placeholder
    const averageGrade = Math.floor(Math.random() * 30) + 70; // 70-100

    return {
      totalCoursesEnrolled,
      completedCourses,
      totalStudyTime,
      averageGrade,
      strongSubjects: ['Mathematics', 'Programming'],
      improvementAreas: ['Literature', 'History'],
      learningStreak: Math.floor(Math.random() * 30) + 1,
      weeklyProgress: [
        { week: '2024-W01', hoursStudied: 12, coursesCompleted: 1 },
        { week: '2024-W02', hoursStudied: 15, coursesCompleted: 2 },
        { week: '2024-W03', hoursStudied: 18, coursesCompleted: 1 },
        { week: '2024-W04', hoursStudied: 22, coursesCompleted: 3 }
      ]
    };
  }

  /**
   * Collaborative Learning
   */
  async createStudyGroup(data: {
    name: string;
    courseId: string;
    createdBy: string;
    maxMembers?: number;
    isPublic?: boolean;
  }): Promise<{
    groupId: string;
    inviteCode: string;
  }> {
    // Create a collaboration session for the study group
    const session = await prisma.collaborationSession.create({
      data: {
        workspaceId: data.courseId,
        type: 'collaborative_editing',
        createdBy: data.createdBy,
        isActive: true
      }
    });

    // Add creator as admin participant
    await prisma.collaborationParticipant.create({
      data: {
        sessionId: session.id,
        userId: data.createdBy,
        permissions: 'admin'
      }
    });

    return {
      groupId: session.id,
      inviteCode: `invite_${session.id.slice(-8)}`
    };
  }

  async joinStudyGroup(userId: string, inviteCode: string): Promise<boolean> {
    // Extract session ID from invite code
    const sessionId = inviteCode.replace('invite_', '');

    // Find the session
    const session = await prisma.collaborationSession.findFirst({
      where: {
        id: { contains: sessionId },
        isActive: true
      }
    });

    if (!session) {
      throw new Error('Invalid invite code or group not found');
    }

    // Add user as participant
    await prisma.collaborationParticipant.create({
      data: {
        sessionId: session.id,
        userId,
        permissions: 'write'
      }
    });

    return true;
  }

  async getActiveStudyGroups(userId: string): Promise<Array<{
    groupId: string;
    name: string;
    memberCount: number;
    topic: string;
    isActive: boolean;
  }>> {
    // Get user's active collaboration sessions
    const participations = await prisma.collaborationParticipant.findMany({
      where: {
        userId,
        leftAt: null
      },
      include: {
        session: {
          include: {
            _count: {
              select: {
                participants: true
              }
            }
          }
        }
      }
    });

    return participations
      .filter(p => p.session.type === 'collaborative_editing')
      .map(p => ({
        groupId: p.session.id,
        name: `Study Group ${p.session.id.slice(-4)}`,
        memberCount: p.session._count.participants,
        topic: 'General Study',
        isActive: p.session.isActive
      }));
  }

  /**
   * AI-Powered Recommendations
   */
  async getPersonalizedRecommendations(userId: string): Promise<{
    recommendedCourses: Course[];
    nextLessons: Array<{
      courseId: string;
      lessonTitle: string;
      estimatedTime: number;
    }>;
    studyTips: string[];
    optimalStudyTime: string;
  }> {
    // Get user's progress and preferences
    const progress = await this.getStudentProgress(userId);
    const analytics = await this.getStudentAnalytics(userId);

    // Get recommended courses (simplified)
    const allCourses = await this.getAllCourses({ isPublic: true });
    const recommendedCourses = allCourses.slice(0, 3);

    const nextLessons = progress.map(p => ({
      courseId: p.courseId,
      lessonTitle: `Next lesson in course ${p.courseId.slice(-4)}`,
      estimatedTime: Math.floor(Math.random() * 45) + 15
    }));

    const studyTips = [
      'Take regular breaks every 25 minutes (Pomodoro Technique)',
      'Review your notes before starting a new topic',
      'Join study groups for better retention',
      'Use spaced repetition for memorization',
      'Practice active recall instead of passive reading'
    ];

    // Determine optimal study time based on user activity
    const hour = new Date().getHours();
    let optimalStudyTime = 'morning (9-11 AM)';
    if (hour >= 14 && hour < 17) optimalStudyTime = 'afternoon (2-5 PM)';
    if (hour >= 19 && hour < 22) optimalStudyTime = 'evening (7-10 PM)';

    return {
      recommendedCourses,
      nextLessons,
      studyTips: studyTips.slice(0, 3),
      optimalStudyTime
    };
  }
}
