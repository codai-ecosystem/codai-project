import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AIEducationService } from '@/lib/ai-education-service';

const prisma = new PrismaClient();
const educationService = new AIEducationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'quiz';
    const status = searchParams.get('status');
    const includeAnswers = searchParams.get('includeAnswers') === 'true';

    if (assessmentId) {
      // Get specific assessment
      const assessment = await getAssessmentById(assessmentId, includeAnswers);

      if (!assessment) {
        return NextResponse.json({
          error: 'Assessment not found'
        }, { status: 404 });
      }

      return NextResponse.json(assessment);
    }

    if (courseId) {
      // Get assessments for specific course
      const assessments = await getAssessmentsByCourse(courseId, { type, status });

      return NextResponse.json({
        courseId,
        assessments,
        total: assessments.length
      });
    }

    if (userId) {
      // Get user's assessment history
      const userAssessments = await getUserAssessments(userId, { courseId, type, status });

      return NextResponse.json({
        userId,
        assessments: userAssessments,
        total: userAssessments.length
      });
    }

    // Get all assessments with filters
    const allAssessments = await getAllAssessments({ type, status });

    return NextResponse.json({
      assessments: allAssessments,
      total: allAssessments.length
    });

  } catch (error) {
    console.error('Assessments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create-assessment') {
      // Create new assessment
      const {
        courseId,
        title,
        description,
        type = 'quiz',
        questions = [],
        timeLimit,
        passingScore = 70,
        maxAttempts = 3,
        settings = {}
      } = data;

      if (!courseId || !title || questions.length === 0) {
        return NextResponse.json({
          error: 'Course ID, title, and questions are required'
        }, { status: 400 });
      }

      // Validate questions format
      const validatedQuestions = questions.map((q: any, index: number) => {
        if (!q.question || !q.type || !q.options) {
          throw new Error(`Invalid question format at index ${index}`);
        }
        return {
          id: `q_${Date.now()}_${index}`,
          question: q.question,
          type: q.type, // 'multiple-choice', 'true-false', 'short-answer', 'essay'
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: q.points || 1,
          difficulty: q.difficulty || 'medium'
        };
      });

      const assessment = {
        id: `assessment_${Date.now()}`,
        courseId,
        title,
        description: description || '',
        type,
        questions: validatedQuestions,
        timeLimit: timeLimit || null, // minutes
        passingScore,
        maxAttempts,
        settings: {
          shuffleQuestions: settings.shuffleQuestions || false,
          shuffleOptions: settings.shuffleOptions || false,
          showCorrectAnswers: settings.showCorrectAnswers || true,
          allowReview: settings.allowReview || true,
          ...settings
        },
        totalPoints: validatedQuestions.reduce((sum: number, q: any) => sum + q.points, 0),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Assessment created successfully',
        assessment
      }, { status: 201 });
    }

    if (action === 'submit-assessment') {
      // Submit assessment attempt
      const {
        assessmentId,
        userId,
        answers,
        timeSpent,
        completedAt
      } = data;

      if (!assessmentId || !userId || !answers) {
        return NextResponse.json({
          error: 'Assessment ID, user ID, and answers are required'
        }, { status: 400 });
      }

      // Get assessment details
      const assessment = await getAssessmentById(assessmentId, true);
      if (!assessment) {
        return NextResponse.json({
          error: 'Assessment not found'
        }, { status: 404 });
      }

      // Grade the assessment
      const gradingResult = await gradeAssessment(assessment, answers);

      const submission = {
        id: `submission_${Date.now()}`,
        assessmentId,
        userId,
        answers,
        score: gradingResult.score,
        percentage: gradingResult.percentage,
        isPassing: gradingResult.percentage >= assessment.passingScore,
        timeSpent: timeSpent || 0,
        feedback: gradingResult.feedback,
        detailedResults: gradingResult.details,
        submittedAt: completedAt || new Date().toISOString(),
        gradedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Assessment submitted successfully',
        submission,
        results: gradingResult
      });
    }

    if (action === 'start-assessment') {
      // Start assessment attempt
      const { assessmentId, userId } = data;

      if (!assessmentId || !userId) {
        return NextResponse.json({
          error: 'Assessment ID and user ID are required'
        }, { status: 400 });
      }

      const assessment = await getAssessmentById(assessmentId, false);
      if (!assessment) {
        return NextResponse.json({
          error: 'Assessment not found'
        }, { status: 404 });
      }

      // Check if user has exceeded max attempts
      const previousAttempts = await getUserAssessmentAttempts(userId, assessmentId);
      if (previousAttempts.length >= assessment.maxAttempts) {
        return NextResponse.json({
          error: `Maximum attempts (${assessment.maxAttempts}) exceeded`
        }, { status: 403 });
      }

      const attempt = {
        id: `attempt_${Date.now()}`,
        assessmentId,
        userId,
        attemptNumber: previousAttempts.length + 1,
        startedAt: new Date().toISOString(),
        expiresAt: assessment.timeLimit ?
          new Date(Date.now() + assessment.timeLimit * 60 * 1000).toISOString() : null,
        status: 'in-progress'
      };

      // Return assessment without correct answers
      const assessmentForUser = {
        ...assessment,
        questions: assessment.questions.map((q: any) => ({
          ...q,
          correctAnswer: undefined,
          explanation: undefined
        }))
      };

      return NextResponse.json({
        message: 'Assessment started successfully',
        attempt,
        assessment: assessmentForUser
      });
    }

    if (action === 'generate-ai-assessment') {
      // Generate AI-powered assessment
      const {
        courseId,
        topic,
        difficulty = 'medium',
        questionCount = 10,
        questionTypes = ['multiple-choice']
      } = data;

      if (!courseId || !topic) {
        return NextResponse.json({
          error: 'Course ID and topic are required'
        }, { status: 400 });
      }

      const aiGeneratedQuestions = await generateAIQuestions(topic, {
        difficulty,
        count: questionCount,
        types: questionTypes
      });

      const assessment = {
        id: `ai_assessment_${Date.now()}`,
        courseId,
        title: `AI Generated Assessment: ${topic}`,
        description: `Auto-generated ${difficulty} level assessment covering ${topic}`,
        type: 'ai-generated',
        questions: aiGeneratedQuestions,
        timeLimit: questionCount * 2, // 2 minutes per question
        passingScore: 70,
        maxAttempts: 3,
        settings: {
          shuffleQuestions: true,
          shuffleOptions: true,
          showCorrectAnswers: true,
          allowReview: true
        },
        totalPoints: aiGeneratedQuestions.length,
        isActive: true,
        aiGenerated: true,
        generationMetadata: {
          topic,
          difficulty,
          questionCount,
          questionTypes,
          generatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'AI assessment generated successfully',
        assessment
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Assessments POST error:', error);
    return NextResponse.json({ error: 'Failed to process assessment request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, action, ...data } = body;

    if (!assessmentId) {
      return NextResponse.json({
        error: 'Assessment ID is required'
      }, { status: 400 });
    }

    if (action === 'update-assessment') {
      // Update assessment details
      const updates = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Assessment updated successfully',
        assessmentId,
        updates
      });
    }

    if (action === 'publish-assessment') {
      // Publish/unpublish assessment
      const { isActive = true } = data;

      return NextResponse.json({
        message: `Assessment ${isActive ? 'published' : 'unpublished'} successfully`,
        assessmentId,
        isActive
      });
    }

    if (action === 'update-settings') {
      // Update assessment settings
      const { settings } = data;

      return NextResponse.json({
        message: 'Assessment settings updated successfully',
        assessmentId,
        settings
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Assessments PUT error:', error);
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json({
        error: 'Assessment ID is required'
      }, { status: 400 });
    }

    // In a real implementation, this would soft-delete the assessment
    const deletedAt = new Date().toISOString();

    return NextResponse.json({
      message: 'Assessment deleted successfully',
      assessmentId,
      deletedAt
    });

  } catch (error) {
    console.error('Assessments DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
  }
}

// Helper functions
async function getAssessmentById(id: string, includeAnswers: boolean = false) {
  // Mock assessment data - in real implementation, this would query the database
  const mockAssessment = {
    id,
    courseId: 'course_math_101',
    title: 'Mathematics Fundamentals Quiz',
    description: 'Test your understanding of basic mathematical concepts',
    type: 'quiz',
    questions: [
      {
        id: 'q1',
        question: 'What is 2 + 2?',
        type: 'multiple-choice',
        options: ['3', '4', '5', '6'],
        correctAnswer: includeAnswers ? '4' : undefined,
        explanation: includeAnswers ? 'Basic addition: 2 + 2 = 4' : undefined,
        points: 1,
        difficulty: 'easy'
      },
      {
        id: 'q2',
        question: 'Is the square root of 16 equal to 4?',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: includeAnswers ? 'True' : undefined,
        explanation: includeAnswers ? '√16 = 4 because 4² = 16' : undefined,
        points: 1,
        difficulty: 'easy'
      }
    ],
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      allowReview: true
    },
    totalPoints: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  };

  return mockAssessment;
}

async function getAssessmentsByCourse(courseId: string, filters: any) {
  // Mock implementation
  return [
    {
      id: 'assessment_1',
      title: 'Unit 1 Quiz',
      type: filters.type || 'quiz',
      totalPoints: 10,
      passingScore: 70,
      isActive: true
    },
    {
      id: 'assessment_2',
      title: 'Midterm Exam',
      type: 'exam',
      totalPoints: 100,
      passingScore: 75,
      isActive: true
    }
  ];
}

async function getUserAssessments(userId: string, filters: any) {
  // Mock implementation
  return [
    {
      id: 'submission_1',
      assessmentId: 'assessment_1',
      assessmentTitle: 'Unit 1 Quiz',
      score: 8,
      totalPoints: 10,
      percentage: 80,
      isPassing: true,
      submittedAt: '2024-01-15T10:00:00.000Z'
    }
  ];
}

async function getAllAssessments(filters: any) {
  // Mock implementation
  return [
    {
      id: 'assessment_1',
      courseId: 'course_math_101',
      title: 'Mathematics Quiz',
      type: filters.type || 'quiz',
      totalPoints: 10,
      isActive: true
    }
  ];
}

async function getUserAssessmentAttempts(userId: string, assessmentId: string) {
  // Mock implementation - return previous attempts
  return [
    {
      id: 'attempt_1',
      attemptNumber: 1,
      score: 6,
      percentage: 60,
      submittedAt: '2024-01-14T10:00:00.000Z'
    }
  ];
}

async function gradeAssessment(assessment: any, answers: any) {
  let correctAnswers = 0;
  let totalPoints = 0;
  const details: any[] = [];

  assessment.questions.forEach((question: any, index: number) => {
    const userAnswer = answers[question.id] || answers[index];
    const isCorrect = userAnswer === question.correctAnswer;

    if (isCorrect) {
      correctAnswers += question.points;
    }
    totalPoints += question.points;

    details.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      maxPoints: question.points,
      explanation: question.explanation
    });
  });

  const percentage = totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0;

  return {
    score: correctAnswers,
    totalPoints,
    percentage,
    details,
    feedback: generateFeedback(percentage, assessment.passingScore)
  };
}

function generateFeedback(percentage: number, passingScore: number) {
  if (percentage >= 90) {
    return 'Excellent work! You have a strong understanding of the material.';
  } else if (percentage >= passingScore) {
    return 'Good job! You passed the assessment. Consider reviewing the topics you missed.';
  } else {
    return 'You did not pass this assessment. Please review the material and try again.';
  }
}

async function generateAIQuestions(topic: string, options: any) {
  // Mock AI question generation
  const questionTemplates = [
    {
      question: `What is the primary concept in ${topic}?`,
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: `The primary concept in ${topic} is...`,
      points: 1,
      difficulty: options.difficulty
    },
    {
      question: `True or False: ${topic} is an important subject to master.`,
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: `Yes, ${topic} is indeed important because...`,
      points: 1,
      difficulty: options.difficulty
    }
  ];

  // Generate the requested number of questions
  const questions = [];
  for (let i = 0; i < options.count; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    questions.push({
      ...template,
      id: `ai_q_${Date.now()}_${i}`,
      question: template.question.replace(/\${topic}/g, topic)
    });
  }

  return questions;
}
