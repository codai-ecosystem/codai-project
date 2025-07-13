import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'active';

    if (groupId) {
      // Get specific study group details
      const group = await getStudyGroupById(groupId);

      if (!group) {
        return NextResponse.json({
          error: 'Study group not found'
        }, { status: 404 });
      }

      // Get group members and activities
      const members = await getGroupMembers(groupId);
      const activities = await getGroupActivities(groupId);
      const schedule = await getGroupSchedule(groupId);

      return NextResponse.json({
        group,
        members,
        activities,
        schedule
      });
    }

    if (userId) {
      // Get user's study groups
      const userGroups = await getUserStudyGroups(userId, { courseId, status });

      return NextResponse.json({
        userId,
        groups: userGroups,
        total: userGroups.length
      });
    }

    if (courseId) {
      // Get study groups for specific course
      const courseGroups = await getCourseStudyGroups(courseId, { type, status });

      return NextResponse.json({
        courseId,
        groups: courseGroups,
        total: courseGroups.length
      });
    }

    // Get all public study groups
    const publicGroups = await getPublicStudyGroups({ type, status });

    return NextResponse.json({
      groups: publicGroups,
      total: publicGroups.length
    });

  } catch (error) {
    console.error('Study Groups GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch study groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create-group') {
      // Create new study group
      const {
        name,
        description,
        courseId,
        creatorId,
        maxMembers = 10,
        isPublic = true,
        tags = [],
        studyGoals = [],
        meetingPreferences = {}
      } = data;

      if (!name || !creatorId) {
        return NextResponse.json({
          error: 'Group name and creator ID are required'
        }, { status: 400 });
      }

      // Verify creator exists
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        select: { id: true, name: true, email: true }
      });

      if (!creator) {
        return NextResponse.json({
          error: 'Creator not found'
        }, { status: 404 });
      }

      const studyGroup = {
        id: `group_${Date.now()}`,
        name,
        description: description || '',
        courseId,
        creatorId,
        maxMembers,
        currentMembers: 1, // Creator is first member
        isPublic,
        tags,
        studyGoals,
        meetingPreferences: {
          frequency: meetingPreferences.frequency || 'weekly',
          duration: meetingPreferences.duration || 60, // minutes
          preferredDays: meetingPreferences.preferredDays || ['monday', 'wednesday'],
          preferredTimes: meetingPreferences.preferredTimes || ['18:00'],
          timezone: meetingPreferences.timezone || 'UTC',
          platform: meetingPreferences.platform || 'discord',
          ...meetingPreferences
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Auto-join creator as admin
      await joinStudyGroup(studyGroup.id, creatorId, 'admin');

      return NextResponse.json({
        message: 'Study group created successfully',
        group: studyGroup
      }, { status: 201 });
    }

    if (action === 'join-group') {
      // Join study group
      const { groupId, userId, joinMessage } = data;

      if (!groupId || !userId) {
        return NextResponse.json({
          error: 'Group ID and user ID are required'
        }, { status: 400 });
      }

      const group = await getStudyGroupById(groupId);
      if (!group) {
        return NextResponse.json({
          error: 'Study group not found'
        }, { status: 404 });
      }

      if (group.currentMembers >= group.maxMembers) {
        return NextResponse.json({
          error: 'Study group is full'
        }, { status: 409 });
      }

      // Check if user is already a member
      const existingMember = await getGroupMembership(groupId, userId);
      if (existingMember) {
        return NextResponse.json({
          error: 'User is already a member of this group'
        }, { status: 409 });
      }

      const membership = await joinStudyGroup(groupId, userId, 'member', joinMessage);

      return NextResponse.json({
        message: 'Successfully joined study group',
        membership
      });
    }

    if (action === 'create-study-session') {
      // Create study session for group
      const {
        groupId,
        organizerId,
        title,
        description,
        scheduledAt,
        duration = 60,
        topic,
        sessionType = 'study',
        isRecurring = false,
        recurringPattern = null
      } = data;

      if (!groupId || !organizerId || !title || !scheduledAt) {
        return NextResponse.json({
          error: 'Group ID, organizer ID, title, and scheduled time are required'
        }, { status: 400 });
      }

      // Verify organizer is group member
      const membership = await getGroupMembership(groupId, organizerId);
      if (!membership) {
        return NextResponse.json({
          error: 'Organizer must be a group member'
        }, { status: 403 });
      }

      const studySession = {
        id: `session_${Date.now()}`,
        groupId,
        organizerId,
        title,
        description: description || '',
        topic,
        sessionType, // 'study', 'review', 'discussion', 'exam-prep'
        scheduledAt,
        duration,
        status: 'scheduled',
        attendees: [organizerId],
        materials: [],
        notes: '',
        recording: null,
        isRecurring,
        recurringPattern,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Study session created successfully',
        session: studySession
      });
    }

    if (action === 'share-resource') {
      // Share learning resource with group
      const {
        groupId,
        userId,
        resourceType, // 'file', 'link', 'note', 'video'
        title,
        content,
        url,
        tags = [],
        description
      } = data;

      if (!groupId || !userId || !resourceType || !title) {
        return NextResponse.json({
          error: 'Group ID, user ID, resource type, and title are required'
        }, { status: 400 });
      }

      // Verify user is group member
      const membership = await getGroupMembership(groupId, userId);
      if (!membership) {
        return NextResponse.json({
          error: 'User must be a group member to share resources'
        }, { status: 403 });
      }

      const resource = {
        id: `resource_${Date.now()}`,
        groupId,
        sharedBy: userId,
        type: resourceType,
        title,
        description: description || '',
        content,
        url,
        tags,
        downloadCount: 0,
        likes: 0,
        comments: [],
        sharedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Resource shared successfully',
        resource
      });
    }

    if (action === 'create-discussion') {
      // Create group discussion topic
      const {
        groupId,
        userId,
        topic,
        category = 'general',
        isPinned = false,
        tags = []
      } = data;

      if (!groupId || !userId || !topic) {
        return NextResponse.json({
          error: 'Group ID, user ID, and topic are required'
        }, { status: 400 });
      }

      // Verify user is group member
      const membership = await getGroupMembership(groupId, userId);
      if (!membership) {
        return NextResponse.json({
          error: 'User must be a group member to create discussions'
        }, { status: 403 });
      }

      const discussion = {
        id: `discussion_${Date.now()}`,
        groupId,
        createdBy: userId,
        topic,
        category,
        isPinned,
        tags,
        posts: [],
        participants: [userId],
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Discussion created successfully',
        discussion
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Study Groups POST error:', error);
    return NextResponse.json({ error: 'Failed to process study group request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, action, userId, ...data } = body;

    if (!groupId || !userId) {
      return NextResponse.json({
        error: 'Group ID and user ID are required'
      }, { status: 400 });
    }

    if (action === 'update-group') {
      // Update group settings (admin only)
      const membership = await getGroupMembership(groupId, userId);
      if (!membership || membership.role !== 'admin') {
        return NextResponse.json({
          error: 'Only group admins can update group settings'
        }, { status: 403 });
      }

      const updates = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Group updated successfully',
        groupId,
        updates
      });
    }

    if (action === 'update-role') {
      // Update member role (admin only)
      const { targetUserId, newRole } = data;

      if (!targetUserId || !newRole) {
        return NextResponse.json({
          error: 'Target user ID and new role are required'
        }, { status: 400 });
      }

      const membership = await getGroupMembership(groupId, userId);
      if (!membership || membership.role !== 'admin') {
        return NextResponse.json({
          error: 'Only group admins can update member roles'
        }, { status: 403 });
      }

      if (!['member', 'moderator', 'admin'].includes(newRole)) {
        return NextResponse.json({
          error: 'Invalid role specified'
        }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Member role updated successfully',
        targetUserId,
        newRole
      });
    }

    if (action === 'join-session') {
      // Join study session
      const { sessionId } = data;

      if (!sessionId) {
        return NextResponse.json({
          error: 'Session ID is required'
        }, { status: 400 });
      }

      // Verify user is group member
      const membership = await getGroupMembership(groupId, userId);
      if (!membership) {
        return NextResponse.json({
          error: 'User must be a group member to join sessions'
        }, { status: 403 });
      }

      return NextResponse.json({
        message: 'Successfully joined study session',
        sessionId,
        userId,
        joinedAt: new Date().toISOString()
      });
    }

    if (action === 'update-preferences') {
      // Update user's group preferences
      const {
        notifications = {},
        availability = {},
        studyPreferences = {}
      } = data;

      const preferences = {
        notifications: {
          newMembers: notifications.newMembers !== false,
          newSessions: notifications.newSessions !== false,
          newDiscussions: notifications.newDiscussions !== false,
          studyReminders: notifications.studyReminders !== false,
          ...notifications
        },
        availability: {
          timezone: availability.timezone || 'UTC',
          preferredDays: availability.preferredDays || [],
          preferredTimes: availability.preferredTimes || [],
          ...availability
        },
        studyPreferences: {
          learningStyle: studyPreferences.learningStyle || 'mixed',
          subjects: studyPreferences.subjects || [],
          goals: studyPreferences.goals || [],
          ...studyPreferences
        },
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Preferences updated successfully',
        userId,
        groupId,
        preferences
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Study Groups PUT error:', error);
    return NextResponse.json({ error: 'Failed to update study group' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'leave';

    if (!groupId || !userId) {
      return NextResponse.json({
        error: 'Group ID and user ID are required'
      }, { status: 400 });
    }

    if (action === 'leave') {
      // Leave study group
      const membership = await getGroupMembership(groupId, userId);
      if (!membership) {
        return NextResponse.json({
          error: 'User is not a member of this group'
        }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Successfully left study group',
        groupId,
        userId,
        leftAt: new Date().toISOString()
      });
    }

    if (action === 'remove-member') {
      // Remove member (admin only)
      const targetUserId = searchParams.get('targetUserId');

      if (!targetUserId) {
        return NextResponse.json({
          error: 'Target user ID is required'
        }, { status: 400 });
      }

      const membership = await getGroupMembership(groupId, userId);
      if (!membership || membership.role !== 'admin') {
        return NextResponse.json({
          error: 'Only group admins can remove members'
        }, { status: 403 });
      }

      return NextResponse.json({
        message: 'Member removed successfully',
        groupId,
        removedUserId: targetUserId,
        removedBy: userId,
        removedAt: new Date().toISOString()
      });
    }

    if (action === 'delete-group') {
      // Delete study group (creator only)
      const group = await getStudyGroupById(groupId);
      if (!group) {
        return NextResponse.json({
          error: 'Study group not found'
        }, { status: 404 });
      }

      if (group.creatorId !== userId) {
        return NextResponse.json({
          error: 'Only the group creator can delete the group'
        }, { status: 403 });
      }

      return NextResponse.json({
        message: 'Study group deleted successfully',
        groupId,
        deletedBy: userId,
        deletedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Study Groups DELETE error:', error);
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 });
  }
}

// Helper functions
async function getStudyGroupById(id: string) {
  // Mock implementation
  return {
    id,
    name: 'Advanced Mathematics Study Group',
    description: 'A collaborative group for students studying advanced mathematics topics',
    courseId: 'course_math_advanced',
    creatorId: 'user_creator',
    maxMembers: 15,
    currentMembers: 8,
    isPublic: true,
    tags: ['mathematics', 'calculus', 'algebra'],
    studyGoals: [
      'Master differential equations',
      'Understand linear algebra concepts',
      'Prepare for final exam'
    ],
    meetingPreferences: {
      frequency: 'weekly',
      duration: 90,
      preferredDays: ['tuesday', 'thursday'],
      preferredTimes: ['19:00'],
      timezone: 'UTC',
      platform: 'zoom'
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  };
}

async function getGroupMembers(groupId: string) {
  // Mock implementation
  return [
    {
      id: 'member_1',
      userId: 'user_creator',
      groupId,
      role: 'admin',
      joinedAt: '2024-01-01T00:00:00.000Z',
      user: {
        id: 'user_creator',
        name: 'John Smith',
        email: 'john@example.com'
      }
    },
    {
      id: 'member_2',
      userId: 'user_2',
      groupId,
      role: 'member',
      joinedAt: '2024-01-02T00:00:00.000Z',
      user: {
        id: 'user_2',
        name: 'Jane Doe',
        email: 'jane@example.com'
      }
    }
  ];
}

async function getGroupActivities(groupId: string) {
  // Mock implementation
  return [
    {
      id: 'activity_1',
      type: 'member_joined',
      userId: 'user_2',
      groupId,
      data: { userName: 'Jane Doe' },
      timestamp: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 'activity_2',
      type: 'session_created',
      userId: 'user_creator',
      groupId,
      data: { sessionTitle: 'Calculus Review Session' },
      timestamp: '2024-01-03T00:00:00.000Z'
    }
  ];
}

async function getGroupSchedule(groupId: string) {
  // Mock implementation
  return [
    {
      id: 'session_1',
      title: 'Weekly Study Session',
      scheduledAt: '2024-01-20T19:00:00.000Z',
      duration: 90,
      type: 'study'
    },
    {
      id: 'session_2',
      title: 'Exam Preparation',
      scheduledAt: '2024-01-22T19:00:00.000Z',
      duration: 120,
      type: 'exam-prep'
    }
  ];
}

async function getUserStudyGroups(userId: string, filters: any) {
  // Mock implementation
  return [
    {
      id: 'group_1',
      name: 'Advanced Mathematics Study Group',
      courseId: 'course_math_advanced',
      role: 'admin',
      memberCount: 8,
      nextSession: '2024-01-20T19:00:00.000Z'
    }
  ];
}

async function getCourseStudyGroups(courseId: string, filters: any) {
  // Mock implementation
  return [
    {
      id: 'group_1',
      name: 'Course Study Group 1',
      memberCount: 8,
      maxMembers: 15,
      isPublic: true
    }
  ];
}

async function getPublicStudyGroups(filters: any) {
  // Mock implementation
  return [
    {
      id: 'group_public_1',
      name: 'Public Mathematics Group',
      memberCount: 12,
      maxMembers: 20,
      tags: ['mathematics', 'public']
    }
  ];
}

async function getGroupMembership(groupId: string, userId: string) {
  // Mock implementation
  return {
    id: 'membership_1',
    userId,
    groupId,
    role: 'member',
    joinedAt: '2024-01-01T00:00:00.000Z'
  };
}

async function joinStudyGroup(groupId: string, userId: string, role: string = 'member', message?: string) {
  // Mock implementation
  return {
    id: `membership_${Date.now()}`,
    userId,
    groupId,
    role,
    joinMessage: message,
    joinedAt: new Date().toISOString()
  };
}
