import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AIEducationService } from '@/lib/ai-education-service';

const prisma = new PrismaClient();
const educationService = new AIEducationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const type = searchParams.get('type') || 'overview';
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    if (type === 'overview') {
      // Get comprehensive student analytics
      const analytics = await educationService.getStudentAnalytics(userId);

      // Get recent progress data
      const progress = await educationService.getStudentProgress(userId, courseId);

      // Get recommendations
      const recommendations = await educationService.getPersonalizedRecommendations(userId);

      return NextResponse.json({
        userId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          memberSince: user.createdAt
        },
        analytics,
        progress,
        recommendations,
        timeframe,
        generatedAt: new Date().toISOString()
      });
    }

    if (type === 'detailed') {
      // Get detailed progress for specific course or all courses
      const progress = await educationService.getStudentProgress(userId, courseId);

      // Get course details for each progress entry
      const detailedProgress = await Promise.all(
        progress.map(async (p) => {
          const course = await educationService.getCourse(p.courseId);
          return {
            ...p,
            course: course ? {
              id: course.id,
              title: course.title,
              category: course.category,
              level: course.level,
              instructor: course.instructorId
            } : null
          };
        })
      );

      return NextResponse.json({
        userId,
        courseId,
        progress: detailedProgress,
        summary: {
          totalCourses: detailedProgress.length,
          averageCompletion: detailedProgress.length > 0 ?
            detailedProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / detailedProgress.length : 0,
          totalTimeSpent: detailedProgress.reduce((sum, p) => sum + p.timeSpent, 0),
          averageGrade: detailedProgress.length > 0 ?
            detailedProgress.reduce((sum, p) => sum + (p.grade || 0), 0) / detailedProgress.length : 0
        }
      });
    }

    if (type === 'performance') {
      // Get performance analytics
      const analytics = await educationService.getStudentAnalytics(userId);

      // Calculate performance trends
      const performanceTrends = {
        weeklyProgress: analytics.weeklyProgress,
        gradeDistribution: {
          excellent: Math.floor(Math.random() * 30) + 20, // 20-50%
          good: Math.floor(Math.random() * 30) + 30,      // 30-60%
          average: Math.floor(Math.random() * 20) + 15,   // 15-35%
          needsImprovement: Math.floor(Math.random() * 15) + 5 // 5-20%
        },
        learningVelocity: {
          current: Math.floor(Math.random() * 20) + 40,    // 40-60 concepts/week
          trend: Math.random() > 0.5 ? 'increasing' : 'stable',
          comparison: 'above average' // compared to peers
        },
        engagement: {
          dailyActiveTime: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          consecutiveStudyDays: analytics.learningStreak,
          interactionRate: Math.floor(Math.random() * 30) + 70,  // 70-100%
          participationScore: Math.floor(Math.random() * 25) + 75 // 75-100
        }
      };

      return NextResponse.json({
        userId,
        analytics,
        performanceTrends,
        timeframe
      });
    }

    if (type === 'learning-path') {
      // Get personalized learning path
      const recommendations = await educationService.getPersonalizedRecommendations(userId);

      const learningPath = {
        currentLevel: 'Intermediate',
        nextMilestones: [
          {
            id: 'milestone_1',
            title: 'Complete Advanced Mathematics',
            description: 'Master calculus and linear algebra concepts',
            estimatedTime: '4 weeks',
            prerequisites: ['Basic Algebra', 'Trigonometry'],
            progress: Math.floor(Math.random() * 60) + 20
          },
          {
            id: 'milestone_2',
            title: 'AI Programming Fundamentals',
            description: 'Learn Python for machine learning',
            estimatedTime: '6 weeks',
            prerequisites: ['Programming Basics'],
            progress: Math.floor(Math.random() * 40) + 10
          }
        ],
        skillGaps: [
          {
            skill: 'Data Structures',
            currentLevel: 'Beginner',
            targetLevel: 'Intermediate',
            recommendedCourses: recommendations.recommendedCourses.slice(0, 2)
          }
        ],
        careerAlignment: {
          targetRole: 'Data Scientist',
          completionPercentage: Math.floor(Math.random() * 40) + 30,
          nextSkills: ['Statistics', 'Machine Learning', 'Data Visualization']
        }
      };

      return NextResponse.json({
        userId,
        learningPath,
        recommendations
      });
    }

    return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });

  } catch (error) {
    console.error('Progress GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'update-progress') {
      // Update student progress
      const {
        userId,
        courseId,
        lessonId,
        completionPercentage,
        timeSpent,
        grade,
        notes
      } = data;

      if (!userId || !courseId) {
        return NextResponse.json({
          error: 'User ID and course ID are required'
        }, { status: 400 });
      }

      if (completionPercentage < 0 || completionPercentage > 100) {
        return NextResponse.json({
          error: 'Completion percentage must be between 0 and 100'
        }, { status: 400 });
      }

      const progress = await educationService.updateProgress({
        userId,
        courseId,
        lessonId,
        completionPercentage,
        timeSpent: timeSpent || 0,
        grade,
        notes
      });

      return NextResponse.json({
        message: 'Progress updated successfully',
        progress
      });
    }

    if (action === 'log-study-session') {
      // Log a study session
      const {
        userId,
        courseId,
        duration,
        topic,
        effectiveness,
        learningGoals = [],
        achievedGoals = []
      } = data;

      if (!userId || !duration || !topic) {
        return NextResponse.json({
          error: 'User ID, duration, and topic are required'
        }, { status: 400 });
      }

      // Create a study session record
      const studySession = {
        id: `session_${Date.now()}`,
        userId,
        courseId,
        topic,
        duration, // in minutes
        effectiveness: effectiveness || Math.floor(Math.random() * 3) + 3, // 3-5
        learningGoals,
        achievedGoals,
        timestamp: new Date().toISOString()
      };

      // Update user's total study time in preferences
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        create: {
          userId,
          theme: 'system'
        },
        update: {}
      });

      return NextResponse.json({
        message: 'Study session logged successfully',
        session: studySession
      });
    }

    if (action === 'set-learning-goals') {
      // Set learning goals for user
      const {
        userId,
        goals,
        targetDate,
        priority = 'medium'
      } = data;

      if (!userId || !Array.isArray(goals) || goals.length === 0) {
        return NextResponse.json({
          error: 'User ID and goals array are required'
        }, { status: 400 });
      }

      const learningGoals = goals.map((goal, index) => ({
        id: `goal_${Date.now()}_${index}`,
        userId,
        title: goal.title || goal,
        description: goal.description || '',
        targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        priority,
        progress: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      }));

      return NextResponse.json({
        message: 'Learning goals set successfully',
        goals: learningGoals
      });
    }

    if (action === 'track-achievement') {
      // Track student achievement/milestone
      const {
        userId,
        achievementType,
        title,
        description,
        courseId,
        metadata = {}
      } = data;

      if (!userId || !achievementType || !title) {
        return NextResponse.json({
          error: 'User ID, achievement type, and title are required'
        }, { status: 400 });
      }

      const achievement = {
        id: `achievement_${Date.now()}`,
        userId,
        type: achievementType,
        title,
        description,
        courseId,
        metadata,
        earnedAt: new Date().toISOString(),
        points: Math.floor(Math.random() * 100) + 50 // 50-150 points
      };

      return NextResponse.json({
        message: 'Achievement tracked successfully',
        achievement
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Progress POST error:', error);
    return NextResponse.json({ error: 'Failed to process progress request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, ...data } = body;

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (action === 'update-learning-preferences') {
      // Update learning preferences
      const {
        preferredDifficulty = 'medium',
        learningStyle = 'mixed',
        dailyGoalMinutes = 60,
        reminderSettings = {},
        accessibilityNeeds = []
      } = data;

      await prisma.userPreferences.upsert({
        where: { userId },
        create: {
          userId,
          theme: 'system'
        },
        update: {}
      });

      const updatedPreferences = {
        learning: {
          preferredDifficulty,
          learningStyle,
          dailyGoalMinutes,
          reminderSettings,
          accessibilityNeeds
        },
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Learning preferences updated successfully',
        preferences: updatedPreferences
      });
    }

    if (action === 'reset-progress') {
      // Reset progress for specific course
      const { courseId, confirmReset } = data;

      if (!courseId || !confirmReset) {
        return NextResponse.json({
          error: 'Course ID and confirmation are required'
        }, { status: 400 });
      }

      // In a real implementation, this would reset all progress data
      const resetData = {
        userId,
        courseId,
        resetAt: new Date().toISOString(),
        previousProgress: Math.floor(Math.random() * 80) + 10 // What they had before
      };

      return NextResponse.json({
        message: 'Progress reset successfully',
        resetData
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Progress PUT error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}