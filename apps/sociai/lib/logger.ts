/**
 * SociAI LogAI Integration
 * Advanced logging system for the AI Social Platform
 */

import { LogAIClient } from '@codai/logai-sdk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface SociAILogOptions {
  module?: string
  operation?: string
  userId?: string
  postId?: string
  commentId?: string
  groupId?: string
  eventId?: string
  messageId?: string
  sessionId?: string
  context?: Record<string, any>
  tags?: string[]
}

class SociAILogger {
  private client: LogAIClient

  constructor() {
    this.client = new LogAIClient({
      baseUrl: 'http://localhost:4032/api',
      apiKey: process.env.LOGAI_API_KEY || 'default-key',
      service: 'sociai'
    })
  }

  // Core logging method
  async log(level: LogLevel, message: string, metadata: any = {}, options: SociAILogOptions = {}) {
    try {
      await this.client.log(level, message, {
        service: 'sociai',
        timestamp: new Date().toISOString(),
        ...metadata,
        context: {
          module: options.module || 'unknown',
          operation: options.operation || 'unknown',
          userId: options.userId,
          sessionId: options.sessionId,
          ...options.context
        },
        tags: ['sociai', 'social-platform', ...(options.tags || [])]
      }, options)
    } catch (error) {
      console.error('SociAI Logger Error:', error)
    }
  }

  // User Management Logging
  async logUserRegistration(userId: string, userData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'User registration completed', {
      event: 'user_registration',
      userId,
      userData: {
        username: userData.username,
        email: userData.email,
        profile_type: userData.profileType,
        verification_status: userData.verificationStatus
      },
      social_metrics: {
        initial_connections: 0,
        profile_completion: userData.profileCompletion || 0
      }
    }, { ...options, module: 'user-management', operation: 'register' })
  }

  async logUserLogin(userId: string, loginData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'User login successful', {
      event: 'user_login',
      userId,
      login_method: loginData.method,
      device_info: loginData.deviceInfo,
      location: loginData.location,
      social_activity: {
        last_active: loginData.lastActive,
        unread_notifications: loginData.unreadNotifications,
        pending_friend_requests: loginData.pendingRequests
      }
    }, { ...options, module: 'authentication', operation: 'login' })
  }

  async logUserProfileUpdate(userId: string, updates: any, options: SociAILogOptions = {}) {
    await this.log('info', 'User profile updated', {
      event: 'profile_update',
      userId,
      updates: {
        fields_changed: updates.fieldsChanged,
        privacy_settings: updates.privacySettings,
        profile_visibility: updates.profileVisibility
      },
      social_impact: {
        connection_count: updates.connectionCount,
        profile_views: updates.profileViews
      }
    }, { ...options, module: 'profile-management', operation: 'update' })
  }

  // Content Management Logging
  async logPostCreation(postId: string, postData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'New post created', {
      event: 'post_creation',
      postId,
      userId: postData.authorId,
      content_type: postData.type,
      content_metadata: {
        text_length: postData.textLength,
        media_count: postData.mediaCount,
        hashtags: postData.hashtags,
        mentions: postData.mentions,
        privacy_level: postData.privacyLevel
      },
      engagement_tracking: {
        initial_reach: 0,
        predicted_engagement: postData.predictedEngagement
      }
    }, { ...options, module: 'content-management', operation: 'create-post', postId })
  }

  async logPostEngagement(postId: string, engagementData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Post engagement activity', {
      event: 'post_engagement',
      postId,
      userId: engagementData.userId,
      engagement_type: engagementData.type, // like, share, comment, save
      engagement_metrics: {
        total_likes: engagementData.totalLikes,
        total_shares: engagementData.totalShares,
        total_comments: engagementData.totalComments,
        reach: engagementData.reach,
        engagement_rate: engagementData.engagementRate
      },
      viral_metrics: {
        sharing_velocity: engagementData.sharingVelocity,
        trending_score: engagementData.trendingScore
      }
    }, { ...options, module: 'engagement-tracking', operation: engagementData.type, postId })
  }

  async logCommentActivity(commentId: string, commentData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Comment activity logged', {
      event: 'comment_activity',
      commentId,
      postId: commentData.postId,
      userId: commentData.authorId,
      comment_metadata: {
        text_length: commentData.textLength,
        reply_to: commentData.replyTo,
        mentions: commentData.mentions,
        sentiment: commentData.sentiment
      },
      moderation: {
        auto_moderated: commentData.autoModerated,
        flagged: commentData.flagged,
        approval_status: commentData.approvalStatus
      }
    }, { ...options, module: 'comments', operation: 'comment', commentId, postId: commentData.postId })
  }

  // Social Network Logging
  async logConnectionRequest(requestData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Connection request processed', {
      event: 'connection_request',
      requester_id: requestData.requesterId,
      target_id: requestData.targetId,
      request_type: requestData.type, // friend, follow, connect
      mutual_connections: requestData.mutualConnections,
      connection_strength: requestData.connectionStrength,
      network_effect: {
        network_size_impact: requestData.networkSizeImpact,
        recommendation_weight: requestData.recommendationWeight
      }
    }, { ...options, module: 'social-network', operation: 'connection-request' })
  }

  async logGroupActivity(groupId: string, activityData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Group activity recorded', {
      event: 'group_activity',
      groupId,
      userId: activityData.userId,
      activity_type: activityData.type, // join, leave, post, moderate
      group_metrics: {
        member_count: activityData.memberCount,
        activity_level: activityData.activityLevel,
        engagement_score: activityData.engagementScore
      },
      community_health: {
        toxicity_score: activityData.toxicityScore,
        diversity_index: activityData.diversityIndex,
        growth_rate: activityData.growthRate
      }
    }, { ...options, module: 'groups', operation: activityData.type, groupId })
  }

  // Messaging and Communication
  async logDirectMessage(messageId: string, messageData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Direct message sent', {
      event: 'direct_message',
      messageId,
      sender_id: messageData.senderId,
      recipient_id: messageData.recipientId,
      message_metadata: {
        text_length: messageData.textLength,
        media_count: messageData.mediaCount,
        message_type: messageData.type,
        encryption_level: messageData.encryptionLevel
      },
      conversation_metrics: {
        conversation_id: messageData.conversationId,
        message_sequence: messageData.messageSequence,
        response_time: messageData.responseTime
      }
    }, { ...options, module: 'messaging', operation: 'send-message', messageId })
  }

  async logVideoCall(callData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Video call session', {
      event: 'video_call',
      call_id: callData.callId,
      participants: callData.participants,
      call_metrics: {
        duration: callData.duration,
        quality_score: callData.qualityScore,
        connection_stability: callData.connectionStability,
        participant_count: callData.participantCount
      },
      technical_data: {
        bandwidth_usage: callData.bandwidthUsage,
        codec_used: callData.codec,
        resolution: callData.resolution
      }
    }, { ...options, module: 'video-calls', operation: 'call-session' })
  }

  // Feed and Discovery
  async logFeedGeneration(userId: string, feedData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Personalized feed generated', {
      event: 'feed_generation',
      userId,
      feed_algorithm: feedData.algorithm,
      content_mix: {
        posts_count: feedData.postsCount,
        suggested_connections: feedData.suggestedConnections,
        trending_topics: feedData.trendingTopics,
        sponsored_content: feedData.sponsoredContent
      },
      personalization: {
        relevance_score: feedData.relevanceScore,
        diversity_score: feedData.diversityScore,
        freshness_factor: feedData.freshnessFactor
      }
    }, { ...options, module: 'feed-algorithm', operation: 'generate-feed' })
  }

  async logContentDiscovery(userId: string, discoveryData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Content discovery event', {
      event: 'content_discovery',
      userId,
      discovery_method: discoveryData.method, // search, trending, recommendation
      content_found: {
        content_type: discoveryData.contentType,
        content_id: discoveryData.contentId,
        relevance_score: discoveryData.relevanceScore
      },
      search_context: {
        query: discoveryData.query,
        filters_applied: discoveryData.filtersApplied,
        results_count: discoveryData.resultsCount
      }
    }, { ...options, module: 'discovery', operation: discoveryData.method })
  }

  // Analytics and Insights
  async logUserEngagementAnalytics(userId: string, analyticsData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'User engagement analytics', {
      event: 'engagement_analytics',
      userId,
      time_period: analyticsData.timePeriod,
      engagement_metrics: {
        posts_created: analyticsData.postsCreated,
        comments_made: analyticsData.commentsMade,
        likes_given: analyticsData.likesGiven,
        shares_made: analyticsData.sharesMade,
        time_spent: analyticsData.timeSpent
      },
      social_influence: {
        follower_growth: analyticsData.followerGrowth,
        content_reach: analyticsData.contentReach,
        influence_score: analyticsData.influenceScore
      }
    }, { ...options, module: 'analytics', operation: 'engagement-analysis' })
  }

  async logTrendingAnalysis(trendData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'Trending content analysis', {
      event: 'trending_analysis',
      trending_topics: trendData.topics,
      trend_metrics: {
        velocity: trendData.velocity,
        reach: trendData.reach,
        engagement_rate: trendData.engagementRate,
        sentiment_score: trendData.sentimentScore
      },
      geographic_spread: trendData.geographicSpread,
      demographic_breakdown: trendData.demographicBreakdown
    }, { ...options, module: 'trends', operation: 'analyze-trends' })
  }

  // Moderation and Safety
  async logContentModeration(moderationData: any, options: SociAILogOptions = {}) {
    await this.log('warn', 'Content moderation action', {
      event: 'content_moderation',
      content_id: moderationData.contentId,
      content_type: moderationData.contentType,
      moderation_action: moderationData.action, // approve, flag, remove, warn
      violation_type: moderationData.violationType,
      confidence_score: moderationData.confidenceScore,
      moderator_info: {
        type: moderationData.moderatorType, // ai, human, community
        moderator_id: moderationData.moderatorId
      },
      appeal_status: moderationData.appealStatus
    }, { ...options, module: 'moderation', operation: moderationData.action })
  }

  async logSafetyAlert(alertData: any, options: SociAILogOptions = {}) {
    await this.log('error', 'Safety alert triggered', {
      event: 'safety_alert',
      alert_type: alertData.type, // harassment, spam, inappropriate
      severity: alertData.severity,
      affected_users: alertData.affectedUsers,
      content_involved: alertData.contentInvolved,
      response_actions: alertData.responseActions,
      escalation_level: alertData.escalationLevel
    }, { ...options, module: 'safety', operation: 'alert' })
  }

  // Performance and System Logging
  async logSystemPerformance(perfData: any, options: SociAILogOptions = {}) {
    await this.log('info', 'System performance metrics', {
      event: 'system_performance',
      performance_metrics: {
        response_time: perfData.responseTime,
        concurrent_users: perfData.concurrentUsers,
        feed_generation_time: perfData.feedGenerationTime,
        search_latency: perfData.searchLatency
      },
      resource_usage: {
        cpu_usage: perfData.cpuUsage,
        memory_usage: perfData.memoryUsage,
        storage_usage: perfData.storageUsage,
        bandwidth_usage: perfData.bandwidthUsage
      }
    }, { ...options, module: 'system', operation: 'performance-monitoring' })
  }

  // Error Handling
  async logError(error: Error, context: any = {}, options: SociAILogOptions = {}) {
    await this.log('error', `SociAI Error: ${error.message}`, {
      event: 'error',
      error_details: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context
      },
      error_impact: {
        affected_feature: context.feature,
        user_impact: context.userImpact,
        recovery_action: context.recoveryAction
      }
    }, { ...options, module: 'error-handling', operation: 'log-error' })
  }
}

// Create singleton instance
const sociaiLogger = new SociAILogger()

// Export convenience functions
export const logUser = (operation: string, userId: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `User ${operation}`, data, { ...options, module: 'user-management', operation, userId })

export const logContent = (operation: string, contentId: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `Content ${operation}`, data, { ...options, module: 'content', operation, postId: contentId })

export const logSocial = (operation: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `Social ${operation}`, data, { ...options, module: 'social-network', operation })

export const logMessaging = (operation: string, messageId: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `Messaging ${operation}`, data, { ...options, module: 'messaging', operation, messageId })

export const logEngagement = (operation: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `Engagement ${operation}`, data, { ...options, module: 'engagement', operation })

export const logModeration = (operation: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('warn', `Moderation ${operation}`, data, { ...options, module: 'moderation', operation })

export const logAnalytics = (operation: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `Analytics ${operation}`, data, { ...options, module: 'analytics', operation })

export const logSystem = (operation: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('info', `System ${operation}`, data, { ...options, module: 'system', operation })

export const logPerf = (operation: string, data: any, options?: SociAILogOptions) =>
  sociaiLogger.log('debug', `Performance ${operation}`, data, { ...options, module: 'performance', operation })

export default sociaiLogger
