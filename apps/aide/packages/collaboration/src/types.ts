/**
 * Real-Time Collaboration Types and Interfaces
 * Industry-leading multi-user development environment
 */

import { EventEmitter } from 'events';

// Core collaboration types
export interface CollaborationUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: UserRole;
	status: UserStatus;
	cursor?: CursorPosition;
	selection?: SelectionRange;
	permissions: Permission[];
	lastActivity: Date;
	metadata: Record<string, any>;
}

export interface WorkspaceSession {
	id: string;
	workspaceId: string;
	name: string;
	description?: string;
	ownerId: string;
	participants: CollaborationUser[];
	documents: CollaborativeDocument[];
	settings: SessionSettings;
	createdAt: Date;
	updatedAt: Date;
	status: SessionStatus;
	analytics: SessionAnalytics;
}

export interface CollaborativeDocument {
	id: string;
	path: string;
	type: DocumentType;
	content: string;
	version: number;
	operations: Operation[];
	cursors: CursorState[];
	annotations: Annotation[];
	conflicts: ConflictResolution[];
	lastModified: Date;
	checksum: string;
}

// Document-specific types for DocumentService
export interface DocumentEvent {
	id: string;
	sessionId: string;
	documentId: string;
	eventType: DocumentEventType;
	timestamp: Date;
	data: any;
}

export enum DocumentEventType {
	DOCUMENT_CREATED = 'document_created',
	DOCUMENT_UPDATED = 'document_updated',
	DOCUMENT_DELETED = 'document_deleted',
	DOCUMENT_SHARED = 'document_shared',
	DOCUMENT_FORKED = 'document_forked',
	DOCUMENT_MERGED = 'document_merged'
}

export interface DocumentMetadata {
	title: string;
	description?: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	version: number;
	tags?: string[];
	parentDocumentId?: string;
	permissions?: Record<string, 'read' | 'write' | 'admin'>;
}

// Real-time operation types
export interface Operation {
	id: string;
	type: OperationType;
	userId: string;
	documentId: string;
	position: Position;
	content?: string;
	length?: number;
	timestamp: Date;
	metadata: OperationMetadata;
}

export interface CursorPosition {
	documentId: string;
	line: number;
	column: number;
	isActive: boolean;
	timestamp: Date;
}

export interface SelectionRange {
	documentId: string;
	start: Position;
	end: Position;
	isActive: boolean;
	timestamp: Date;
}

export interface CursorState {
	userId: string;
	position: CursorPosition;
	selection?: SelectionRange;
	color: string;
	isVisible: boolean;
}

// Conflict resolution
export interface ConflictResolution {
	id: string;
	operations: Operation[];
	strategy: ConflictStrategy;
	resolution: Resolution;
	resolvedBy: string;
	timestamp: Date;
	confidence: number;
}

export interface Resolution {
	type: ResolutionType;
	finalContent: string;
	acceptedOperations: string[];
	rejectedOperations: string[];
	mergedOperations: Operation[];
}

// Permission system
export interface Permission {
	resource: string;
	action: PermissionAction;
	conditions?: PermissionCondition[];
}

export interface PermissionCondition {
	field: string;
	operator: PermissionOperator;
	value: any;
}

// Session management
export interface SessionSettings {
	maxParticipants: number;
	autoSave: boolean;
	autoSaveInterval: number;
	conflictResolution: ConflictStrategy;
	permissions: SessionPermissions;
	notifications: NotificationSettings;
	versioning: VersioningSettings;
}

export interface SessionPermissions {
	allowGuests: boolean;
	requireApproval: boolean;
	defaultRole: UserRole;
	filePermissions: FilePermissionSettings;
}

export interface NotificationSettings {
	userJoined: boolean;
	userLeft: boolean;
	fileChanged: boolean;
	conflictDetected: boolean;
	errorOccurred: boolean;
}

export interface VersioningSettings {
	enabled: boolean;
	autoCommit: boolean;
	commitInterval: number;
	maxVersions: number;
	retentionDays: number;
}

// Analytics and monitoring
export interface SessionAnalytics {
	totalEdits: number;
	totalTime: number;
	activeTime: number;
	collaborationScore: number;
	conflictRate: number;
	userContributions: UserContribution[];
	performanceMetrics: PerformanceMetrics;
}

export interface UserContribution {
	userId: string;
	edits: number;
	linesAdded: number;
	linesRemoved: number;
	time: number;
	filesModified: string[];
}

export interface PerformanceMetrics {
	avgLatency: number;
	maxLatency: number;
	operationsPerSecond: number;
	memoryUsage: number;
	cpuUsage: number;
	networkBandwidth: number;
}

// Communication and awareness
export interface CollaborationEvent {
	type: CollaborationEventType;
	userId: string;
	sessionId: string;
	data: any;
	timestamp: Date;
}

export interface Annotation {
	id: string;
	type: AnnotationType;
	userId: string;
	documentId: string;
	position: Position;
	content: string;
	resolved: boolean;
	replies: AnnotationReply[];
	createdAt: Date;
	updatedAt: Date;
}

export interface AnnotationReply {
	id: string;
	userId: string;
	content: string;
	timestamp: Date;
}

// Voice and video collaboration
export interface VoiceChannel {
	id: string;
	sessionId: string;
	participants: VoiceParticipant[];
	settings: VoiceSettings;
	recording?: VoiceRecording | undefined;
}

export interface VoiceParticipant {
	userId: string;
	isMuted: boolean;
	isSpeaking: boolean;
	volume: number;
	quality: ConnectionQuality;
}

export interface VideoParticipant {
	userId: string;
	isVideoEnabled: boolean;
	isScreenSharing: boolean;
	videoTrack?: MediaStreamTrack | undefined;
	screenTrack?: MediaStreamTrack | undefined;
	quality: ConnectionQuality;
}

export interface VoiceSettings {
	enabled: boolean;
	autoMute: boolean;
	noiseSuppression: boolean;
	echoCancellation: boolean;
	qualityMode: QualityMode;
}

export interface VoiceRecording {
	id: string;
	startTime: Date;
	endTime?: Date;
	duration?: number;
	participants: string[];
	transcription?: string;
	fileUrl?: string;
}

// AI-powered collaboration features
export interface CollaborationAI {
	conflictResolver: ConflictResolver;
	codeReviewer: CodeReviewer;
	suggestionEngine: SuggestionEngine;
	semanticMerger: SemanticMerger;
}

export interface ConflictResolver {
	analyzeConflict(operations: Operation[]): ConflictAnalysis;
	suggestResolution(conflict: ConflictResolution): Resolution[];
	autoResolve(conflict: ConflictResolution): Resolution | null;
}

export interface CodeReviewer {
	reviewChanges(operations: Operation[]): ReviewSuggestion[];
	detectIssues(document: CollaborativeDocument): CodeIssue[];
	suggestImprovements(content: string): Improvement[];
}

export interface SuggestionEngine {
	generateSuggestions(context: CollaborationContext): Suggestion[];
	predictNextAction(user: CollaborationUser): ActionPrediction[];
	recommendCollaborators(project: string): UserRecommendation[];
}

export interface SemanticMerger {
	mergeSemanticChanges(operations: Operation[]): MergeResult;
	detectSemanticConflicts(operations: Operation[]): SemanticConflict[];
	preserveSemanticIntegrity(content: string): boolean;
}

// Enums
export enum UserRole {
	OWNER = 'owner',
	ADMIN = 'admin',
	EDITOR = 'editor',
	VIEWER = 'viewer',
	GUEST = 'guest'
}

export enum UserStatus {
	ONLINE = 'online',
	IDLE = 'idle',
	BUSY = 'busy',
	OFFLINE = 'offline'
}

export enum DocumentType {
	CODE = 'code',
	MARKDOWN = 'markdown',
	JSON = 'json',
	CONFIG = 'config',
	BINARY = 'binary'
}

export enum OperationType {
	INSERT = 'insert',
	DELETE = 'delete',
	REPLACE = 'replace',
	MOVE = 'move',
	SELECTION = 'selection',
	CURSOR = 'cursor'
}

export enum ConflictStrategy {
	LAST_WRITE_WINS = 'last_write_wins',
	OPERATIONAL_TRANSFORM = 'operational_transform',
	THREE_WAY_MERGE = 'three_way_merge',
	AI_ASSISTED = 'ai_assisted',
	MANUAL_RESOLUTION = 'manual_resolution'
}

export enum ResolutionType {
	ACCEPT_MINE = 'accept_mine',
	ACCEPT_THEIRS = 'accept_theirs',
	MERGE_BOTH = 'merge_both',
	CUSTOM = 'custom',
	AI_GENERATED = 'ai_generated'
}

export enum SessionStatus {
	ACTIVE = 'active',
	PAUSED = 'paused',
	ENDED = 'ended',
	ERROR = 'error'
}

export enum PermissionAction {
	READ = 'read',
	WRITE = 'write',
	DELETE = 'delete',
	EXECUTE = 'execute',
	ADMIN = 'admin'
}

export enum PermissionOperator {
	EQUALS = 'equals',
	NOT_EQUALS = 'not_equals',
	CONTAINS = 'contains',
	STARTS_WITH = 'starts_with',
	ENDS_WITH = 'ends_with'
}

export enum CollaborationEventType {
	USER_JOINED = 'user_joined',
	USER_LEFT = 'user_left',
	DOCUMENT_OPENED = 'document_opened',
	DOCUMENT_CLOSED = 'document_closed',
	OPERATION_APPLIED = 'operation_applied',
	CONFLICT_DETECTED = 'conflict_detected',
	CONFLICT_RESOLVED = 'conflict_resolved',
	CURSOR_MOVED = 'cursor_moved',
	SELECTION_CHANGED = 'selection_changed',
	ANNOTATION_ADDED = 'annotation_added',
	VOICE_JOINED = 'voice_joined',
	VOICE_LEFT = 'voice_left'
}

export enum AnnotationType {
	COMMENT = 'comment',
	SUGGESTION = 'suggestion',
	BUG = 'bug',
	TODO = 'todo',
	QUESTION = 'question'
}

export enum ConnectionQuality {
	EXCELLENT = 'excellent',
	GOOD = 'good',
	FAIR = 'fair',
	POOR = 'poor'
}

export enum QualityMode {
	HIGH = 'high',
	MEDIUM = 'medium',
	LOW = 'low',
	AUTO = 'auto'
}

// Utility types
export interface Position {
	line: number;
	column: number;
}

export interface OperationMetadata {
	source: string;
	intentHash?: string;
	contextHash?: string;
	userAgent?: string;
	timestamp: Date;
}

export interface FilePermissionSettings {
	[key: string]: PermissionAction[];
}

export interface CollaborationContext {
	sessionId: string;
	userId: string;
	documentId: string;
	currentContent: string;
	recentOperations: Operation[];
	activeUsers: CollaborationUser[];
}

export interface ConflictAnalysis {
	severity: number;
	type: string;
	affectedLines: number[];
	suggestions: string[];
	autoResolvable: boolean;
}

export interface ReviewSuggestion {
	type: string;
	severity: number;
	message: string;
	position: Position;
	suggestion?: string;
}

export interface CodeIssue {
	type: string;
	severity: number;
	message: string;
	position: Position;
	fixable: boolean;
}

export interface Improvement {
	type: string;
	description: string;
	position: Position;
	newCode: string;
	confidence: number;
}

export interface Suggestion {
	type: string;
	content: string;
	confidence: number;
	context: string;
}

export interface ActionPrediction {
	action: string;
	probability: number;
	context: string;
	suggestion?: string;
}

export interface UserRecommendation {
	userId: string;
	reason: string;
	confidence: number;
	skills: string[];
}

export interface MergeResult {
	success: boolean;
	content: string;
	conflicts: SemanticConflict[];
	warnings: string[];
}

export interface SemanticConflict {
	type: string;
	description: string;
	severity: number;
	position: Position;
	suggestions: string[];
}

// Session Management Types for SessionManager
export interface CollaborationSession {
	id: string;
	name: string;
	type: SessionType;
	ownerId: string;
	participants: string[];
	maxParticipants: number;
	state: SessionState;
	createdAt: Date;
	lastActivity: Date;
	settings: {
		allowAnonymous: boolean;
		enableVoice: boolean;
		enableVideo: boolean;
		enableScreenShare: boolean;
		recordSession: boolean;
		[key: string]: any;
	};
	metadata: Record<string, any>;
}

export interface SessionUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: UserRole;
	permissions?: Permission[];
}

export interface SessionConfig {
	name: string;
	type: SessionType;
	ownerId: string;
	maxParticipants?: number;
	allowAnonymous?: boolean;
	enableVoice?: boolean;
	enableVideo?: boolean;
	enableScreenShare?: boolean;
	recordSession?: boolean;
	settings?: Record<string, any>;
	metadata?: Record<string, any>;
}

export interface UserPresence {
	userId: string;
	sessionId: string;
	status: 'online' | 'idle' | 'busy' | 'offline';
	lastSeen: Date;
	cursor: CursorPosition | null;
	selection: SelectionRange | null;
	metadata: Record<string, any>;
}

export interface SessionEvent {
	type: SessionEventType;
	sessionId: string;
	userId: string | null;
	timestamp: Date;
	data: Record<string, any>;
}

export enum SessionState {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	PAUSED = 'paused',
	CLOSED = 'closed'
}

export enum SessionType {
	DEVELOPMENT = 'development',
	CODE_REVIEW = 'code_review',
	PAIR_PROGRAMMING = 'pair_programming',
	TEAM_MEETING = 'team_meeting',
	TRAINING = 'training',
	PRESENTATION = 'presentation'
}

export enum SessionEventType {
	USER_JOINED = 'user_joined',
	USER_LEFT = 'user_left',
	PRESENCE_UPDATED = 'presence_updated',
	SESSION_CLOSED = 'session_closed',
	SETTINGS_UPDATED = 'settings_updated',
	MESSAGE_SENT = 'message_sent',
	DOCUMENT_CHANGED = 'document_changed',
	VOICE_STATE_CHANGED = 'voice_state_changed'
}
