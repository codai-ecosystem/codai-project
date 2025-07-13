import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AIEducationService } from '@/lib/ai-education-service';

const prisma = new PrismaClient();
const educationService = new AIEducationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const specialty = searchParams.get('specialty');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific tutoring session details
      const session = await prisma.collaborationSession.findUnique({
        where: { id: sessionId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      });

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const sessionDetails = {
        id: session.id,
        type: session.type,
        isActive: session.isActive,
        startTime: session.createdAt,
        endTime: session.isActive ? null : session.updatedAt,
        participants: session.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          image: p.user.image,
          permissions: p.permissions,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt
        })),
        duration: session.isActive ?
          Math.floor((Date.now() - session.createdAt.getTime()) / 1000 / 60) :
          Math.floor((session.updatedAt.getTime() - session.createdAt.getTime()) / 1000 / 60)
      };

      return NextResponse.json({ session: sessionDetails });
    }

    if (userId) {
      // Get user's tutoring history
      const sessions = await prisma.collaborationSession.findMany({
        where: {
          type: 'ai_tutoring',
          participants: {
            some: {
              userId
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      const tutoringHistory = sessions.map(session => ({
        id: session.id,
        startTime: session.createdAt,
        endTime: session.isActive ? null : session.updatedAt,
        isActive: session.isActive,
        duration: session.isActive ?
          Math.floor((Date.now() - session.createdAt.getTime()) / 1000 / 60) :
          Math.floor((session.updatedAt.getTime() - session.createdAt.getTime()) / 1000 / 60),
        participantCount: session.participants.length
      }));

      // Calculate tutoring statistics
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter(s => s.isActive).length;
      const totalMinutes = tutoringHistory.reduce((sum, session) => sum + session.duration, 0);
      const averageSessionLength = totalSessions > 0 ? Math.floor(totalMinutes / totalSessions) : 0;

      return NextResponse.json({
        userId,
        tutoringHistory,
        statistics: {
          totalSessions,
          activeSessions,
          totalMinutes,
          averageSessionLength,
          lastSessionDate: sessions.length > 0 ? sessions[0].createdAt : null
        }
      });
    }

    if (tutorId) {
      // Get specific tutor information
      const tutors = await educationService.getAvailableTutors();
      const tutor = tutors.find(t => t.id === tutorId);

      if (!tutor) {
        return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
      }

      // Get tutor usage statistics
      const tutorSessions = await prisma.collaborationSession.count({
        where: {
          type: 'ai_tutoring'
          // In a full implementation, we'd filter by tutorId
        }
      });

      const tutorDetails = {
        ...tutor,
        statistics: {
          totalSessions: Math.floor(tutorSessions * Math.random()), // Placeholder
          averageRating: (Math.random() * 1.5 + 3.5).toFixed(1),
          totalStudents: Math.floor(Math.random() * 500) + 100,
          successRate: Math.floor(Math.random() * 20) + 80
        },
        availability: {
          status: 'available',
          responseTime: '< 1 minute',
          languages: ['English', 'Spanish', 'French'],
          timezone: 'UTC'
        }
      };

      return NextResponse.json({ tutor: tutorDetails });
    }

    // Get all available tutors
    const tutors = await educationService.getAvailableTutors(specialty);

    // Add mock statistics to each tutor
    const tutorsWithStats = tutors.map(tutor => ({
      ...tutor,
      statistics: {
        totalSessions: Math.floor(Math.random() * 1000) + 100,
        averageRating: (Math.random() * 1.5 + 3.5).toFixed(1),
        totalStudents: Math.floor(Math.random() * 500) + 50,
        successRate: Math.floor(Math.random() * 20) + 80
      },
      availability: {
        status: Math.random() > 0.2 ? 'available' : 'busy',
        responseTime: '< 1 minute',
        currentLoad: Math.floor(Math.random() * 10)
      }
    }));

    return NextResponse.json({
      tutors: tutorsWithStats,
      totalCount: tutorsWithStats.length,
      specialties: [
        'Mathematics',
        'Computer Science',
        'Languages',
        'Science',
        'Arts & Creativity',
        'Business',
        'History',
        'Literature'
      ]
    });

  } catch (error) {
    console.error('Tutoring GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tutoring data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'start-session') {
      // Start new tutoring session
      const { userId, tutorId, topic, courseId, sessionType = 'ai_tutoring' } = data;

      if (!userId || !tutorId || !topic) {
        return NextResponse.json({
          error: 'User ID, tutor ID, and topic are required'
        }, { status: 400 });
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return NextResponse.json({
          error: 'User not found'
        }, { status: 404 });
      }

      // Verify tutor exists
      const tutors = await educationService.getAvailableTutors();
      const tutor = tutors.find(t => t.id === tutorId);

      if (!tutor) {
        return NextResponse.json({
          error: 'Tutor not found'
        }, { status: 404 });
      }

      const session = await educationService.startTutoringSession({
        userId,
        tutorId,
        topic,
        courseId
      });

      return NextResponse.json({
        message: 'Tutoring session started successfully',
        session: {
          ...session,
          tutor: {
            id: tutor.id,
            name: tutor.name,
            specialty: tutor.specialty,
            personality: tutor.personality
          },
          student: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }
      }, { status: 201 });
    }

    if (action === 'send-message') {
      // Send message in tutoring session
      const { sessionId, userId, message, messageType = 'text' } = data;

      if (!sessionId || !userId || !message) {
        return NextResponse.json({
          error: 'Session ID, user ID, and message are required'
        }, { status: 400 });
      }

      // Verify session exists and user is participant
      const session = await prisma.collaborationSession.findUnique({
        where: { id: sessionId },
        include: {
          participants: true
        }
      });

      if (!session) {
        return NextResponse.json({
          error: 'Session not found'
        }, { status: 404 });
      }

      const isParticipant = session.participants.some(p => p.userId === userId);
      if (!isParticipant) {
        return NextResponse.json({
          error: 'User is not a participant in this session'
        }, { status: 403 });
      }

      // In a real implementation, this would be stored in a messages table
      // For now, we'll just acknowledge the message
      const messageId = `msg_${Date.now()}`;

      // Generate AI tutor response (mock)
      let tutorResponse = null;
      if (messageType === 'question') {
        tutorResponse = {
          id: `msg_${Date.now() + 1}`,
          content: `That's a great question about ${message.slice(0, 20)}... Let me help you understand this concept better. [AI-generated response would go here]`,
          sender: 'tutor',
          timestamp: new Date().toISOString(),
          type: 'explanation'
        };
      }

      return NextResponse.json({
        message: 'Message sent successfully',
        messageId,
        response: tutorResponse,
        session: {
          id: sessionId,
          isActive: session.isActive
        }
      });
    }

    if (action === 'request-help') {
      // Request specific help or explanation
      const { sessionId, userId, helpType, content, difficulty = 'medium' } = data;

      if (!sessionId || !userId || !helpType || !content) {
        return NextResponse.json({
          error: 'Session ID, user ID, help type, and content are required'
        }, { status: 400 });
      }

      // Generate personalized help response
      const helpResponse = {
        id: `help_${Date.now()}`,
        type: helpType,
        content: content,
        difficulty,
        response: {
          explanation: `Here's a ${difficulty} level explanation for ${helpType}: ${content.slice(0, 30)}...`,
          examples: [
            'Example 1: Step-by-step breakdown',
            'Example 2: Visual demonstration',
            'Example 3: Practice problem'
          ],
          resources: [
            'Additional reading material',
            'Video tutorial',
            'Interactive exercise'
          ],
          nextSteps: [
            'Practice with similar problems',
            'Review related concepts',
            'Take a quiz to test understanding'
          ]
        },
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Help request processed successfully',
        helpResponse
      });
    }

    if (action === 'rate-session') {
      // Rate completed tutoring session
      const { sessionId, userId, rating, feedback, tags = [] } = data;

      if (!sessionId || !userId || rating === undefined) {
        return NextResponse.json({
          error: 'Session ID, user ID, and rating are required'
        }, { status: 400 });
      }

      if (rating < 1 || rating > 5) {
        return NextResponse.json({
          error: 'Rating must be between 1 and 5'
        }, { status: 400 });
      }

      // Verify session exists
      const session = await prisma.collaborationSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return NextResponse.json({
          error: 'Session not found'
        }, { status: 404 });
      }

      // In a real implementation, this would be stored in a session_ratings table
      const ratingData = {
        sessionId,
        userId,
        rating,
        feedback,
        tags,
        submittedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Session rated successfully',
        rating: ratingData
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Tutoring POST error:', error);
    return NextResponse.json({ error: 'Failed to process tutoring request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, ...data } = body;

    if (!sessionId) {
      return NextResponse.json({
        error: 'Session ID is required'
      }, { status: 400 });
    }

    if (action === 'end-session') {
      // End tutoring session
      const { userId, effectiveness, summary } = data;

      const session = await educationService.endTutoringSession(sessionId, effectiveness);

      return NextResponse.json({
        message: 'Tutoring session ended successfully',
        session: {
          ...session,
          summary,
          effectiveness
        }
      });
    }

    if (action === 'pause-session') {
      // Pause tutoring session
      await prisma.collaborationSession.update({
        where: { id: sessionId },
        data: {
          // In a real implementation, we'd have a paused status
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Session paused successfully',
        sessionId
      });
    }

    if (action === 'resume-session') {
      // Resume paused session
      await prisma.collaborationSession.update({
        where: { id: sessionId },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Session resumed successfully',
        sessionId
      });
    }

    if (action === 'transfer-tutor') {
      // Transfer to different tutor
      const { newTutorId, reason } = data;

      if (!newTutorId) {
        return NextResponse.json({
          error: 'New tutor ID is required'
        }, { status: 400 });
      }

      // Verify new tutor exists
      const tutors = await educationService.getAvailableTutors();
      const newTutor = tutors.find(t => t.id === newTutorId);

      if (!newTutor) {
        return NextResponse.json({
          error: 'New tutor not found'
        }, { status: 404 });
      }

      // In a real implementation, this would update the session's tutor assignment
      await prisma.collaborationSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });

      return NextResponse.json({
        message: 'Tutor transfer completed successfully',
        sessionId,
        newTutor: {
          id: newTutor.id,
          name: newTutor.name,
          specialty: newTutor.specialty
        },
        transferReason: reason
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Tutoring PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tutoring session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action');

    if (action === 'cancel-session' && sessionId) {
      // Cancel active tutoring session
      const session = await prisma.collaborationSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return NextResponse.json({
          error: 'Session not found'
        }, { status: 404 });
      }

      if (!session.isActive) {
        return NextResponse.json({
          error: 'Session is already ended'
        }, { status: 400 });
      }

      // End the session and mark participants as left
      await prisma.collaborationSession.update({
        where: { id: sessionId },
        data: { isActive: false }
      });

      await prisma.collaborationParticipant.updateMany({
        where: { sessionId },
        data: { leftAt: new Date() }
      });

      return NextResponse.json({
        message: 'Tutoring session cancelled successfully',
        sessionId
      });
    }

    if (sessionId) {
      // Delete session history (for privacy)
      await prisma.collaborationParticipant.deleteMany({
        where: { sessionId }
      });

      await prisma.collaborationSession.delete({
        where: { id: sessionId }
      });

      return NextResponse.json({
        message: 'Session history deleted successfully',
        sessionId
      });
    }

    return NextResponse.json({
      error: 'Session ID is required'
    }, { status: 400 });

  } catch (error) {
    console.error('Tutoring DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tutoring session' }, { status: 500 });
  }
}
