// User Behavior Analytics - Advanced user tracking, segmentation, and journey analysis
// Provides comprehensive insights into user interactions, conversion funnels, and behavioral patterns

import { EventEmitter } from 'eventemitter3';
import {
    UserBehaviorEvent,
    UserJourney,
    SegmentationCriteria,
    FunnelDefinition,
    FunnelAnalysis,
    CohortAnalysis,
    BehaviorAnalyticsConfig,
    AnalyticsConfig,
    DateRange
} from '../types';

import { createLogger } from '../utils/logger';
import { DatabaseManager } from '../storage/DatabaseManager';
import { CacheManager } from '../storage/CacheManager';

/**
 * UserBehaviorAnalyzer - Advanced user behavior tracking and analysis
 * 
 * Provides comprehensive user behavior analytics including:
 * - Event tracking and processing
 * - User journey mapping and analysis
 * - Advanced segmentation and targeting
 * - Conversion funnel analysis
 * - Cohort analysis and retention tracking
 * - Real-time behavioral insights
 * 
 * @example
 * ```typescript
 * const analyzer = new UserBehaviorAnalyzer(config);
 * await analyzer.initialize();
 * 
 * // Track user event
 * await analyzer.trackEvent({
 *   type: 'page_view',
 *   userId: 'user123',
 *   properties: { page: '/dashboard', source: 'direct' }
 * });
 * 
 * // Analyze conversion funnel
 * const funnel = await analyzer.analyzeFunnel('checkout-funnel', dateRange);
 * ```
 */
export class UserBehaviorAnalyzer extends EventEmitter {
    private config: AnalyticsConfig;
    private behaviorConfig: BehaviorAnalyticsConfig;
    private isInitialized: boolean = false;
    private logger = createLogger('UserBehaviorAnalyzer');

    // Dependencies
    private databaseManager: DatabaseManager;
    private cacheManager: CacheManager;

    // Analytics state
    private eventsBuffer: UserBehaviorEvent[] = [];
    private activeSegments: Map<string, SegmentationCriteria> = new Map();
    private activeFunnels: Map<string, FunnelDefinition> = new Map();
    private userSessions: Map<string, UserJourney> = new Map();

    // Performance tracking
    private eventsProcessed: number = 0;
    private segmentUpdates: number = 0;
    private funnelAnalyses: number = 0;

    constructor(config: AnalyticsConfig) {
        super();
        this.config = config;
        this.behaviorConfig = this.createBehaviorConfig();

        this.databaseManager = new DatabaseManager(config.storage);
        this.cacheManager = new CacheManager(config.storage);

        this.logger.info('UserBehaviorAnalyzer created');
    }

    /**
     * Initialize the user behavior analyzer
     */
    async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing UserBehaviorAnalyzer...');

            // Initialize dependencies
            await this.databaseManager.initialize();
            await this.cacheManager.initialize();

            // Load existing segments and funnels
            await this.loadSegments();
            await this.loadFunnels();

            // Setup real-time processing
            this.setupEventProcessing();

            this.isInitialized = true;
            this.logger.info('UserBehaviorAnalyzer initialization complete');

        } catch (error) {
            this.logger.error('Failed to initialize UserBehaviorAnalyzer', error);
            throw error;
        }
    }

    /**
     * Shutdown the analyzer
     */
    async shutdown(): Promise<void> {
        try {
            this.logger.info('Shutting down UserBehaviorAnalyzer...');

            // Process remaining events in buffer
            await this.flushEventBuffer();

            // Close database connections
            await this.databaseManager.close();
            await this.cacheManager.close();

            this.isInitialized = false;
            this.logger.info('UserBehaviorAnalyzer shutdown complete');

        } catch (error) {
            this.logger.error('Error during UserBehaviorAnalyzer shutdown', error);
        }
    }

    /**
     * Track a user behavior event
     */
    async trackEvent(event: UserBehaviorEvent): Promise<void> {
        try {
            this.validateInitialized();

            // Enrich event with additional context
            const enrichedEvent = await this.enrichEvent(event);

            // Add to buffer for batch processing
            this.eventsBuffer.push(enrichedEvent);

            // Update user session
            await this.updateUserSession(enrichedEvent);

            // Process segments if needed
            if (this.behaviorConfig.segmentation.realTimeUpdate) {
                await this.updateUserSegments(enrichedEvent);
            }

            // Flush buffer if it's full
            if (this.eventsBuffer.length >= this.config.realTime.batchSize) {
                await this.flushEventBuffer();
            }

            this.eventsProcessed++;
            this.logger.debug('Event tracked', {
                eventId: event.id,
                type: event.type,
                userId: event.userId
            });

        } catch (error) {
            this.logger.error('Failed to track event', error);
            throw error;
        }
    }

    /**
     * Track complete user journey
     */
    async trackUserJourney(journey: UserJourney): Promise<void> {
        try {
            this.validateInitialized();

            // Store journey in database
            await this.databaseManager.query(
                'INSERT INTO user_journeys (user_id, session_id, start_time, end_time, events, funnel, conversion, segmentation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    journey.userId,
                    journey.sessionId,
                    journey.startTime,
                    journey.endTime,
                    JSON.stringify(journey.events),
                    JSON.stringify(journey.funnel),
                    JSON.stringify(journey.conversion),
                    JSON.stringify(journey.segmentation)
                ]
            );

            // Update session cache
            this.userSessions.set(journey.sessionId, journey);

            // Process journey events for funnel analysis
            await this.processFunnelEvents(journey);

            this.logger.debug('User journey tracked', {
                userId: journey.userId,
                sessionId: journey.sessionId,
                events: journey.events.length
            });

        } catch (error) {
            this.logger.error('Failed to track user journey', error);
            throw error;
        }
    }

    /**
     * Get user segments
     */
    async getSegments(userId?: string): Promise<SegmentationCriteria[]> {
        try {
            this.validateInitialized();

            if (userId) {
                // Get segments for specific user
                const userSegments = await this.getUserSegments(userId);
                return Array.from(this.activeSegments.values()).filter(segment =>
                    userSegments.includes(segment.id)
                );
            } else {
                // Return all active segments
                return Array.from(this.activeSegments.values());
            }

        } catch (error) {
            this.logger.error('Failed to get segments', error);
            throw error;
        }
    }

    /**
     * Analyze conversion funnel
     */
    async analyzeFunnel(funnelId: string, dateRange: DateRange): Promise<FunnelAnalysis> {
        try {
            this.validateInitialized();

            const funnel = this.activeFunnels.get(funnelId);
            if (!funnel) {
                throw new Error(`Funnel not found: ${funnelId}`);
            }

            // Query funnel data from database
            const funnelData = await this.queryFunnelData(funnel, dateRange);

            // Calculate funnel metrics
            const analysis = this.calculateFunnelMetrics(funnel, funnelData);

            // Cache results
            await this.cacheManager.set(
                `funnel_analysis:${funnelId}:${dateRange.start.getTime()}-${dateRange.end.getTime()}`,
                analysis,
                3600 // 1 hour cache
            );

            this.funnelAnalyses++;
            this.logger.debug('Funnel analysis completed', {
                funnelId,
                totalUsers: analysis.totalUsers,
                conversionRate: analysis.conversionRate
            });

            return analysis;

        } catch (error) {
            this.logger.error('Failed to analyze funnel', error);
            throw error;
        }
    }

    /**
     * Get cohort analysis
     */
    async getCohortAnalysis(cohortId: string): Promise<CohortAnalysis> {
        try {
            this.validateInitialized();

            // Check cache first
            const cached = await this.cacheManager.get(`cohort_analysis:${cohortId}`);
            if (cached) {
                return cached as CohortAnalysis;
            }

            // Query cohort data
            const cohortData = await this.queryCohortData(cohortId);

            // Calculate retention matrix
            const retentionMatrix = this.calculateRetentionMatrix(cohortData);

            const analysis: CohortAnalysis = {
                cohortId,
                periods: cohortData,
                retentionMatrix,
                averageRetention: this.calculateAverageRetention(retentionMatrix)
            };

            // Cache results
            await this.cacheManager.set(`cohort_analysis:${cohortId}`, analysis, 7200); // 2 hours

            this.logger.debug('Cohort analysis completed', {
                cohortId,
                periods: analysis.periods.length,
                averageRetention: analysis.averageRetention
            });

            return analysis;

        } catch (error) {
            this.logger.error('Failed to get cohort analysis', error);
            throw error;
        }
    }

    /**
     * Create or update user segment
     */
    async createSegment(segment: SegmentationCriteria): Promise<void> {
        try {
            this.validateInitialized();

            // Validate segment criteria
            this.validateSegmentCriteria(segment);

            // Store in database
            await this.databaseManager.query(
                'INSERT OR REPLACE INTO segments (id, name, type, conditions, dynamic_update) VALUES (?, ?, ?, ?, ?)',
                [
                    segment.id,
                    segment.name,
                    segment.type,
                    JSON.stringify(segment.conditions),
                    segment.dynamicUpdate
                ]
            );

            // Update active segments
            this.activeSegments.set(segment.id, segment);

            // If dynamic update is enabled, process existing users
            if (segment.dynamicUpdate) {
                await this.processSegmentForAllUsers(segment);
            }

            this.logger.info('Segment created', {
                segmentId: segment.id,
                name: segment.name,
                type: segment.type
            });

        } catch (error) {
            this.logger.error('Failed to create segment', error);
            throw error;
        }
    }

    /**
     * Create or update funnel definition
     */
    async createFunnel(funnel: FunnelDefinition): Promise<void> {
        try {
            this.validateInitialized();

            // Validate funnel definition
            this.validateFunnelDefinition(funnel);

            // Store in database
            await this.databaseManager.query(
                'INSERT OR REPLACE INTO funnels (id, name, steps, time_window, conversion_goals) VALUES (?, ?, ?, ?, ?)',
                [
                    funnel.id,
                    funnel.name,
                    JSON.stringify(funnel.steps),
                    funnel.timeWindow,
                    JSON.stringify(funnel.conversionGoals)
                ]
            );

            // Update active funnels
            this.activeFunnels.set(funnel.id, funnel);

            this.logger.info('Funnel created', {
                funnelId: funnel.id,
                name: funnel.name,
                steps: funnel.steps.length
            });

        } catch (error) {
            this.logger.error('Failed to create funnel', error);
            throw error;
        }
    }

    /**
     * Check if analyzer is healthy
     */
    isHealthy(): boolean {
        return this.isInitialized &&
            this.databaseManager.isHealthy() &&
            this.cacheManager.isHealthy();
    }

    /**
     * Perform health check
     */
    async healthCheck(): Promise<{ healthy: boolean; details: any }> {
        try {
            const dbHealth = await this.databaseManager.healthCheck();
            const cacheHealth = await this.cacheManager.healthCheck();

            const healthy = this.isInitialized && dbHealth.healthy && cacheHealth.healthy;

            return {
                healthy,
                details: {
                    initialized: this.isInitialized,
                    eventsProcessed: this.eventsProcessed,
                    activeSegments: this.activeSegments.size,
                    activeFunnels: this.activeFunnels.size,
                    bufferSize: this.eventsBuffer.length,
                    database: dbHealth,
                    cache: cacheHealth
                }
            };
        } catch (error) {
            return {
                healthy: false,
                details: { error: error.message }
            };
        }
    }

    // ===============================
    // PRIVATE METHODS
    // ===============================

    private createBehaviorConfig(): BehaviorAnalyticsConfig {
        return {
            tracking: {
                pageViews: true,
                clicks: true,
                scrollDepth: true,
                formInteractions: true,
                heatmaps: false,
                sessionRecording: false
            },
            segmentation: {
                enabled: true,
                criteria: [],
                realTimeUpdate: true
            },
            funnelAnalysis: {
                enabled: true,
                funnels: [],
                cohortTracking: true
            }
        };
    }

    private setupEventProcessing(): void {
        // Setup periodic buffer flush
        setInterval(async () => {
            if (this.eventsBuffer.length > 0) {
                await this.flushEventBuffer();
            }
        }, this.config.realTime.flushInterval);
    }

    private async enrichEvent(event: UserBehaviorEvent): Promise<UserBehaviorEvent> {
        // Add session information
        const session = this.userSessions.get(event.sessionId);
        if (session) {
            event.properties = {
                ...event.properties,
                sessionDuration: Date.now() - session.startTime.getTime(),
                sessionEventCount: session.events.length
            };
        }

        // Add user segments
        if (event.userId) {
            const userSegments = await this.getUserSegments(event.userId);
            event.properties = {
                ...event.properties,
                userSegments
            };
        }

        return event;
    }

    private async updateUserSession(event: UserBehaviorEvent): Promise<void> {
        let session = this.userSessions.get(event.sessionId);

        if (!session) {
            // Create new session
            session = {
                userId: event.userId || '',
                sessionId: event.sessionId,
                startTime: event.timestamp,
                events: [],
                funnel: {
                    stage: '',
                    completionRate: 0,
                    dropoffPoints: []
                },
                conversion: {
                    goals: [],
                    achieved: [],
                    value: 0
                },
                segmentation: {
                    demographic: {},
                    behavioral: {},
                    psychographic: {}
                }
            };
        }

        // Add event to session
        session.events.push(event);
        session.endTime = event.timestamp;
        session.duration = event.timestamp.getTime() - session.startTime.getTime();

        // Update session cache
        this.userSessions.set(event.sessionId, session);
    }

    private async updateUserSegments(event: UserBehaviorEvent): Promise<void> {
        if (!event.userId) return;

        for (const segment of this.activeSegments.values()) {
            if (segment.dynamicUpdate) {
                const matches = await this.evaluateSegmentConditions(event.userId, segment.conditions);
                if (matches) {
                    await this.addUserToSegment(event.userId, segment.id);
                }
            }
        }

        this.segmentUpdates++;
    }

    private async flushEventBuffer(): Promise<void> {
        if (this.eventsBuffer.length === 0) return;

        try {
            // Batch insert events
            const values = this.eventsBuffer.map(event => [
                event.id,
                event.type,
                event.timestamp,
                event.userId,
                event.sessionId,
                JSON.stringify(event.properties),
                JSON.stringify(event.context),
                JSON.stringify(event.metadata)
            ]);

            await this.databaseManager.batchInsert('user_events', [
                'id', 'type', 'timestamp', 'user_id', 'session_id', 'properties', 'context', 'metadata'
            ], values);

            this.logger.debug('Event buffer flushed', { events: this.eventsBuffer.length });
            this.eventsBuffer = [];

        } catch (error) {
            this.logger.error('Failed to flush event buffer', error);
            throw error;
        }
    }

    private async loadSegments(): Promise<void> {
        const result = await this.databaseManager.query('SELECT * FROM segments');

        for (const row of result.data) {
            const segment: SegmentationCriteria = {
                id: row.id,
                name: row.name,
                type: row.type,
                conditions: JSON.parse(row.conditions),
                dynamicUpdate: row.dynamic_update
            };

            this.activeSegments.set(segment.id, segment);
        }

        this.logger.info('Segments loaded', { count: this.activeSegments.size });
    }

    private async loadFunnels(): Promise<void> {
        const result = await this.databaseManager.query('SELECT * FROM funnels');

        for (const row of result.data) {
            const funnel: FunnelDefinition = {
                id: row.id,
                name: row.name,
                steps: JSON.parse(row.steps),
                timeWindow: row.time_window,
                conversionGoals: JSON.parse(row.conversion_goals)
            };

            this.activeFunnels.set(funnel.id, funnel);
        }

        this.logger.info('Funnels loaded', { count: this.activeFunnels.size });
    }

    private async getUserSegments(userId: string): Promise<string[]> {
        const result = await this.databaseManager.query(
            'SELECT segment_id FROM user_segments WHERE user_id = ?',
            [userId]
        );

        return result.data.map(row => row.segment_id);
    }

    private async queryFunnelData(funnel: FunnelDefinition, dateRange: DateRange): Promise<any[]> {
        // This would implement the actual funnel data query logic
        // For now, return mock data structure
        return [];
    }

    private calculateFunnelMetrics(funnel: FunnelDefinition, data: any[]): FunnelAnalysis {
        // This would implement the actual funnel metrics calculation
        // For now, return mock analysis
        return {
            funnelId: funnel.id,
            totalUsers: 1000,
            steps: funnel.steps.map((step, index) => ({
                stepId: step.id,
                users: 1000 - (index * 200),
                conversionRate: (1000 - (index * 200)) / 1000,
                dropoffRate: index > 0 ? 0.2 : 0,
                averageTime: 30000 + (index * 10000)
            })),
            conversionRate: 0.6,
            dropoffRate: 0.4,
            averageTime: 120000
        };
    }

    private async queryCohortData(cohortId: string): Promise<any[]> {
        // This would implement the actual cohort data query
        return [];
    }

    private calculateRetentionMatrix(cohortData: any[]): number[][] {
        // This would implement the actual retention matrix calculation
        return [];
    }

    private calculateAverageRetention(matrix: number[][]): number {
        if (matrix.length === 0) return 0;

        const total = matrix.flat().reduce((sum, value) => sum + value, 0);
        return total / matrix.flat().length;
    }

    private validateSegmentCriteria(segment: SegmentationCriteria): void {
        if (!segment.id || !segment.name || !segment.type) {
            throw new Error('Invalid segment criteria: missing required fields');
        }

        if (!segment.conditions || segment.conditions.length === 0) {
            throw new Error('Invalid segment criteria: no conditions specified');
        }
    }

    private validateFunnelDefinition(funnel: FunnelDefinition): void {
        if (!funnel.id || !funnel.name) {
            throw new Error('Invalid funnel definition: missing required fields');
        }

        if (!funnel.steps || funnel.steps.length < 2) {
            throw new Error('Invalid funnel definition: must have at least 2 steps');
        }
    }

    private async evaluateSegmentConditions(userId: string, conditions: any[]): Promise<boolean> {
        // This would implement the actual condition evaluation logic
        return false;
    }

    private async addUserToSegment(userId: string, segmentId: string): Promise<void> {
        await this.databaseManager.query(
            'INSERT OR IGNORE INTO user_segments (user_id, segment_id, created_at) VALUES (?, ?, ?)',
            [userId, segmentId, new Date()]
        );
    }

    private async processSegmentForAllUsers(segment: SegmentationCriteria): Promise<void> {
        // This would implement processing of existing users for the new segment
        this.logger.debug('Processing segment for all users', { segmentId: segment.id });
    }

    private async processFunnelEvents(journey: UserJourney): Promise<void> {
        // This would implement funnel event processing
        this.logger.debug('Processing funnel events', {
            sessionId: journey.sessionId,
            events: journey.events.length
        });
    }

    private validateInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('UserBehaviorAnalyzer not initialized');
        }
    }
}

export default UserBehaviorAnalyzer;
