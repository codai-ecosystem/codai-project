import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AIEducationService } from '@/lib/ai-education-service';

const prisma = new PrismaClient();
const educationService = new AIEducationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const instructorId = searchParams.get('instructorId');
    const isPublic = searchParams.get('public');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (courseId) {
      // Get specific course with detailed information
      const course = await educationService.getCourse(courseId);

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      // Get additional course details
      const project = await prisma.project.findUnique({
        where: { id: courseId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          workspace: {
            include: {
              members: {
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
          }
        }
      });

      const courseDetails = {
        ...course,
        instructor: project?.owner,
        students: project?.workspace.members.map(m => m.user) || [],
        enrollmentCount: project?.workspace.members.length || 0,
        createdAt: project?.createdAt,
        updatedAt: project?.updatedAt
      };

      return NextResponse.json({ course: courseDetails });
    }

    // Get courses with filters
    const filters: any = {};

    if (category) filters.category = category;
    if (level) filters.level = level;
    if (instructorId) filters.instructorId = instructorId;
    if (isPublic !== null) filters.isPublic = isPublic === 'true';

    let courses = await educationService.getAllCourses(filters);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = courses.length;
    const offset = (page - 1) * limit;
    const paginatedCourses = courses.slice(offset, offset + limit);

    // Get additional details for each course
    const coursesWithDetails = await Promise.all(
      paginatedCourses.map(async (course) => {
        const project = await prisma.project.findUnique({
          where: { id: course.id },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            workspace: {
              include: {
                _count: {
                  select: {
                    members: true
                  }
                }
              }
            }
          }
        });

        return {
          ...course,
          instructor: project?.owner,
          enrollmentCount: project?.workspace._count.members || 0,
          createdAt: project?.createdAt,
          updatedAt: project?.updatedAt
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      },
      filters: {
        category,
        level,
        instructorId,
        isPublic: isPublic === 'true',
        search
      }
    });

  } catch (error) {
    console.error('Courses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create-course') {
      // Create new course
      const {
        title,
        description,
        level = 'intermediate',
        category = 'General',
        duration = 60,
        instructorId,
        price,
        isPublic = true,
        syllabus = [],
        prerequisites = [],
        learningObjectives = []
      } = data;

      if (!title || !description || !instructorId) {
        return NextResponse.json({
          error: 'Title, description, and instructor ID are required'
        }, { status: 400 });
      }

      // Verify instructor exists
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId }
      });

      if (!instructor) {
        return NextResponse.json({
          error: 'Instructor not found'
        }, { status: 404 });
      }

      const course = await educationService.createCourse({
        title,
        description,
        level,
        category,
        duration,
        instructorId,
        price,
        isPublic
      });

      return NextResponse.json({
        message: 'Course created successfully',
        course: {
          ...course,
          syllabus,
          prerequisites,
          learningObjectives,
          instructor: {
            id: instructor.id,
            name: instructor.name,
            email: instructor.email
          }
        }
      }, { status: 201 });
    }

    if (action === 'enroll-student') {
      // Enroll student in course
      const { userId, courseId } = data;

      if (!userId || !courseId) {
        return NextResponse.json({
          error: 'User ID and course ID are required'
        }, { status: 400 });
      }

      const success = await educationService.enrollStudent(userId, courseId);

      if (success) {
        return NextResponse.json({
          message: 'Student enrolled successfully',
          enrollment: {
            userId,
            courseId,
            enrolledAt: new Date().toISOString()
          }
        });
      } else {
        return NextResponse.json({
          error: 'Failed to enroll student'
        }, { status: 500 });
      }
    }

    if (action === 'bulk-enroll') {
      // Bulk enroll multiple students
      const { userIds, courseId } = data;

      if (!Array.isArray(userIds) || !courseId) {
        return NextResponse.json({
          error: 'User IDs array and course ID are required'
        }, { status: 400 });
      }

      const results = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          await educationService.enrollStudent(userId, courseId);
          results.push({ userId, status: 'enrolled' });
        } catch (error) {
          errors.push({
            userId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return NextResponse.json({
        message: 'Bulk enrollment completed',
        results,
        errors,
        summary: {
          total: userIds.length,
          successful: results.length,
          failed: errors.length
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Courses POST error:', error);
    return NextResponse.json({ error: 'Failed to process course request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, action, ...updateData } = body;

    if (!courseId) {
      return NextResponse.json({
        error: 'Course ID is required'
      }, { status: 400 });
    }

    if (action === 'update-course') {
      // Update course information
      const {
        title,
        description,
        level,
        category,
        duration,
        price,
        isPublic
      } = updateData;

      const updateFields: any = {};
      if (title) updateFields.name = title;
      if (description) updateFields.description = description;
      if (isPublic !== undefined) updateFields.isPublic = isPublic;

      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json({
          error: 'No valid fields to update'
        }, { status: 400 });
      }

      const updatedProject = await prisma.project.update({
        where: { id: courseId },
        data: updateFields,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Course updated successfully',
        course: {
          id: updatedProject.id,
          title: updatedProject.name,
          description: updatedProject.description || '',
          level: level || 'intermediate',
          category: category || 'General',
          duration: duration || 60,
          price,
          isPublic: updatedProject.isPublic,
          instructorId: updatedProject.ownerId,
          instructor: updatedProject.owner,
          updatedAt: updatedProject.updatedAt
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Courses PUT error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    if (action === 'unenroll' && courseId && userId) {
      // Unenroll student from course
      const course = await prisma.project.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        return NextResponse.json({
          error: 'Course not found'
        }, { status: 404 });
      }

      // Remove workspace membership
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: course.workspaceId,
            userId
          }
        }
      });

      if (membership) {
        await prisma.workspaceMember.delete({
          where: { id: membership.id }
        });
      }

      return NextResponse.json({
        message: 'Student unenrolled successfully',
        courseId,
        userId
      });
    }

    if (courseId) {
      // Delete course entirely
      const course = await prisma.project.findUnique({
        where: { id: courseId },
        include: {
          workspace: {
            include: {
              _count: {
                select: {
                  members: true
                }
              }
            }
          }
        }
      });

      if (!course) {
        return NextResponse.json({
          error: 'Course not found'
        }, { status: 404 });
      }

      // Check if course has enrolled students
      if (course.workspace._count.members > 1) { // Excluding instructor
        return NextResponse.json({
          error: 'Cannot delete course with enrolled students. Please unenroll all students first.'
        }, { status: 400 });
      }

      // Delete course project
      await prisma.project.delete({
        where: { id: courseId }
      });

      return NextResponse.json({
        message: 'Course deleted successfully',
        courseId
      });
    }

    return NextResponse.json({
      error: 'Course ID is required'
    }, { status: 400 });

  } catch (error) {
    console.error('Courses DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}