import * as vscode from 'vscode';
import { PredictionContext, PredictionResult } from './predictiveEngine';
import { LoggerService } from './loggerService';

/**
 * Prediction Learning Service
 * Implements machine learning-like capabilities to improve prediction accuracy
 * by learning from user patterns, feedback, and code evolution.
 */
export class PredictionLearningService {
	private logger: LoggerService;
	private userPatterns: Map<string, UserPattern>;
	private predictionHistory: PredictionHistory[];
	private learningData: LearningData;
	private feedbackWeights: FeedbackWeights;

	constructor() {
		this.logger = LoggerService.getInstance();
		this.userPatterns = new Map();
		this.predictionHistory = [];
		this.learningData = {
			commonPatterns: new Map(),
			errorPatterns: new Map(),
			fixPatterns: new Map(),
			codeEvolution: []
		};
		this.feedbackWeights = {
			accepted: 1.2,
			dismissed: 0.8,
			fixed: 1.5,
			ignored: 0.5
		};
	}

	public async initialize(context: vscode.ExtensionContext): Promise<void> {
		await this.loadLearningData(context);
		this.logger.info('PredictionLearningService', 'Initialized prediction learning service');
	}

	/**
	 * Rank predictions based on user patterns and historical data
	 */
	public async rankPredictions(predictions: PredictionResult[], context: PredictionContext): Promise<PredictionResult[]> {
		try {
			const rankedPredictions = predictions.map(prediction => {
				const adjustedConfidence = this.adjustConfidenceBasedOnLearning(prediction, context);
				return { ...prediction, confidence: adjustedConfidence };
			});

			// Sort by adjusted confidence and severity
			return rankedPredictions.sort((a, b) => {
				const severityWeight = this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity);
				const confidenceWeight = b.confidence - a.confidence;
				return severityWeight * 2 + confidenceWeight;
			});
		} catch (error) {
			this.logger.error('PredictionLearningService', `Error ranking predictions: ${error}`);
			return predictions;
		}
	}

	/**
	 * Predict future issues based on patterns and trends
	 */
	public async predictFutureIssues(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];

		try {
			// Analyze code evolution patterns
			const evolutionPredictions = await this.predictBasedOnEvolution(context);
			predictions.push(...evolutionPredictions);

			// Analyze user patterns
			const patternPredictions = await this.predictBasedOnUserPatterns(context);
			predictions.push(...patternPredictions);

			// Analyze similar files
			const similarityPredictions = await this.predictBasedOnSimilarity(context);
			predictions.push(...similarityPredictions);

			return predictions.filter(p => (p.confidence || 0) > 0.7);
		} catch (error) {
			this.logger.error('PredictionLearningService', `Error predicting future issues: ${error}`);
			return [];
		}
	}

	/**
	 * Record user feedback on predictions
	 */
	public async recordFeedback(predictionId: string, feedback: 'accepted' | 'dismissed' | 'fixed' | 'ignored'): Promise<void> {
		try {
			const historyEntry = this.predictionHistory.find(h => h.id === predictionId);
			if (historyEntry) {
				historyEntry.feedback = feedback;
				historyEntry.feedbackTime = Date.now();

				// Update learning patterns based on feedback
				await this.updateLearningPatterns(historyEntry, feedback);
			}
		} catch (error) {
			this.logger.error('PredictionLearningService', `Error recording feedback: ${error}`);
		}
	}

	/**
	 * Record save events for learning
	 */
	public async recordSaveEvent(document: vscode.TextDocument, predictions: PredictionResult[]): Promise<void> {
		try {
			const saveEvent: SaveEvent = {
				timestamp: Date.now(),
				fileName: document.fileName,
				language: document.languageId,
				fileSize: document.getText().length,
				lineCount: document.lineCount,
				predictions: predictions.length,
				issues: predictions.filter(p => p.type === 'bug').length
			};

			this.learningData.codeEvolution.push(saveEvent);

			// Keep only recent events (last 1000)
			if (this.learningData.codeEvolution.length > 1000) {
				this.learningData.codeEvolution = this.learningData.codeEvolution.slice(-1000);
			}

			// Learn from save patterns
			await this.learnFromSavePatterns(saveEvent, predictions);
		} catch (error) {
			this.logger.error('PredictionLearningService', `Error recording save event: ${error}`);
		}
	}

	/**
	 * Learn from user coding patterns
	 */
	public async learnFromUserBehavior(context: PredictionContext, action: string): Promise<void> {
		try {
			const pattern = this.extractUserPattern(context, action);
			const key = `${context.language}_${action}`;

			if (this.userPatterns.has(key)) {
				const existing = this.userPatterns.get(key)!;
				existing.frequency++;
				existing.lastSeen = Date.now();
				existing.contexts.push(this.serializeContext(context));
			} else {
				this.userPatterns.set(key, {
					action,
					language: context.language,
					frequency: 1,
					firstSeen: Date.now(),
					lastSeen: Date.now(),
					contexts: [this.serializeContext(context)],
					effectiveness: 0.5 // neutral start
				});
			}
		} catch (error) {
			this.logger.error('PredictionLearningService', `Error learning from user behavior: ${error}`);
		}
	}

	// Private learning methods
	private adjustConfidenceBasedOnLearning(prediction: PredictionResult, context: PredictionContext): number {
		let adjustedConfidence = prediction.confidence || 0.5;
		const category = prediction.category || 'general';

		// Adjust based on category effectiveness
		const categoryPattern = this.learningData.commonPatterns.get(category);
		if (categoryPattern) {
			const effectiveness = categoryPattern.successRate;
			adjustedConfidence *= (0.5 + effectiveness * 0.5); // Scale between 0.5 and 1.0
		}

		// Adjust based on language-specific patterns
		const languageKey = `${context.language}_${category}`;
		const languagePattern = this.userPatterns.get(languageKey);
		if (languagePattern) {
			const langMultiplier = Math.min(1.5, 1 + (languagePattern.effectiveness - 0.5));
			adjustedConfidence *= langMultiplier;
		}

		// Adjust based on file context similarity
		const similarityScore = this.calculateContextSimilarity(context);
		adjustedConfidence *= (0.8 + similarityScore * 0.4); // Scale between 0.8 and 1.2

		return Math.min(1.0, Math.max(0.1, adjustedConfidence));
	}

	private async predictBasedOnEvolution(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];

		// Analyze recent save events for patterns
		const recentEvents = this.learningData.codeEvolution.slice(-50);
		const filePattern = recentEvents.filter(e => e.fileName.endsWith(context.document.fileName.split('.').pop() || ''));

		if (filePattern.length > 2) {
			const avgIssues = filePattern.reduce((sum, e) => sum + e.issues, 0) / filePattern.length;

			if (avgIssues > 2) {
				predictions.push({
					type: 'suggestion',
					severity: 'medium',
					message: 'This file type has shown frequent issues recently. Consider extra review.',
					line: 0,
					fix: 'Pay special attention to common patterns that have caused issues',
					confidence: 0.75,
					category: 'historical-pattern'
				});
			}
		}

		return predictions;
	}

	private async predictBasedOnUserPatterns(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];

		// Look for patterns user commonly struggles with
		for (const [key, pattern] of this.userPatterns) {
			if (pattern.language === context.language && pattern.effectiveness < 0.4) {
				predictions.push({
					type: 'suggestion',
					severity: 'low',
					message: `You've had challenges with ${pattern.action} in ${pattern.language} files`,
					line: 0,
					fix: 'Consider reviewing best practices for this pattern',
					confidence: 0.6 + (0.5 - pattern.effectiveness),
					category: 'user-pattern'
				});
			}
		}

		return predictions;
	}

	private async predictBasedOnSimilarity(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];

		// Find similar contexts in history
		const similarContexts = this.findSimilarContexts(context);

		for (const similar of similarContexts) {
			if (similar.commonIssues.length > 0) {
				const mostCommon = similar.commonIssues[0];
				predictions.push({
					type: 'suggestion',
					severity: 'low',
					message: `Similar files often have ${mostCommon.category} issues`,
					line: 0,
					fix: mostCommon.commonFix,
					confidence: similar.similarity * 0.8,
					category: 'similarity-based'
				});
			}
		}

		return predictions;
	}

	private async updateLearningPatterns(historyEntry: PredictionHistory, feedback: string): Promise<void> {
		const weight = this.feedbackWeights[feedback as keyof FeedbackWeights];

		// Update category effectiveness
		const categoryPattern = this.learningData.commonPatterns.get(historyEntry.category);
		if (categoryPattern) {
			const newSuccessRate = (categoryPattern.successRate * categoryPattern.totalPredictions + weight) /
				(categoryPattern.totalPredictions + 1);
			categoryPattern.successRate = newSuccessRate;
			categoryPattern.totalPredictions++;
		} else {
			this.learningData.commonPatterns.set(historyEntry.category, {
				category: historyEntry.category,
				successRate: weight,
				totalPredictions: 1,
				commonFixes: [historyEntry.fix || '']
			});
		}

		// Update user pattern effectiveness
		const userPatternKey = `${historyEntry.language}_${historyEntry.category}`;
		const userPattern = this.userPatterns.get(userPatternKey);
		if (userPattern) {
			userPattern.effectiveness = (userPattern.effectiveness + weight) / 2;
		}
	}

	private async learnFromSavePatterns(saveEvent: SaveEvent, predictions: PredictionResult[]): Promise<void> {		// Learn which predictions were likely addressed by the save
		for (const prediction of predictions) {
			if (prediction.type === 'bug' || prediction.severity === 'high') {
				// Track if this type of issue gets fixed quickly
				const category = prediction.category || 'general';
				const pattern = this.learningData.errorPatterns.get(category);
				if (pattern) {
					pattern.frequency++;
				} else {
					this.learningData.errorPatterns.set(category, {
						category: category,
						frequency: 1,
						averageFixTime: 0,
						commonSolutions: []
					});
				}
			}
		}
	}

	private extractUserPattern(context: PredictionContext, action: string): string {
		// Extract meaningful pattern from context and action
		return `${context.language}_${action}_${context.fileSize > 1000 ? 'large' : 'small'}`;
	}

	private serializeContext(context: PredictionContext): string {
		return JSON.stringify({
			language: context.language,
			fileSize: context.fileSize,
			lineCount: context.lineCount,
			fileName: context.document.fileName.split('/').pop()
		});
	}

	private calculateContextSimilarity(context: PredictionContext): number {
		// Calculate similarity to historical contexts
		let totalSimilarity = 0;
		let count = 0;

		for (const [, pattern] of this.userPatterns) {
			if (pattern.language === context.language) {
				const similarity = this.calculatePatternSimilarity(context, pattern);
				totalSimilarity += similarity;
				count++;
			}
		}

		return count > 0 ? totalSimilarity / count : 0.5;
	}

	private calculatePatternSimilarity(context: PredictionContext, pattern: UserPattern): number {
		// Simple similarity calculation
		let similarity = 0;

		// Language match
		if (pattern.language === context.language) {
			similarity += 0.5;
		}

		// File size similarity
		const avgFileSize = pattern.contexts.length > 0 ?
			pattern.contexts.reduce((sum, ctx) => {
				const parsed = JSON.parse(ctx);
				return sum + parsed.fileSize;
			}, 0) / pattern.contexts.length : 0;

		const sizeDiff = Math.abs(context.fileSize - avgFileSize);
		const sizeScore = Math.max(0, 1 - sizeDiff / Math.max(context.fileSize, avgFileSize, 1));
		similarity += sizeScore * 0.3;

		// Effectiveness bonus
		similarity += pattern.effectiveness * 0.2;

		return Math.min(1, similarity);
	}

	private findSimilarContexts(context: PredictionContext): Array<{
		similarity: number;
		commonIssues: Array<{ category: string; commonFix: string }>;
	}> {
		// Simplified implementation - in a real system, this would use more sophisticated similarity algorithms
		const similar = [];

		for (const [category, pattern] of this.learningData.commonPatterns) {
			if (pattern.successRate < 0.7) { // Patterns that commonly have issues
				similar.push({
					similarity: 0.6 + Math.random() * 0.3, // Simplified similarity
					commonIssues: [{
						category,
						commonFix: pattern.commonFixes[0] || 'Review and fix'
					}]
				});
			}
		}

		return similar.slice(0, 3); // Return top 3 similar contexts
	}

	private getSeverityWeight(severity: string): number {
		switch (severity) {
			case 'critical': return 4;
			case 'high': return 3;
			case 'medium': return 2;
			case 'low': return 1;
			default: return 1;
		}
	}

	private async loadLearningData(context: vscode.ExtensionContext): Promise<void> {
		try {
			// In a real implementation, this would load from persistent storage
			// For now, we'll initialize with empty data
			this.logger.debug('PredictionLearningService', 'Learning data loaded from storage');
		} catch (error) {
			this.logger.warn('PredictionLearningService', 'Could not load learning data, starting fresh');
		}
	}
}

// Interfaces for learning data structures

interface UserPattern {
	action: string;
	language: string;
	frequency: number;
	firstSeen: number;
	lastSeen: number;
	contexts: string[];
	effectiveness: number;
}

interface PredictionHistory {
	id: string;
	timestamp: number;
	category: string;
	language: string;
	confidence: number;
	feedback?: string;
	feedbackTime?: number;
	fix?: string;
}

interface LearningData {
	commonPatterns: Map<string, {
		category: string;
		successRate: number;
		totalPredictions: number;
		commonFixes: string[];
	}>;
	errorPatterns: Map<string, {
		category: string;
		frequency: number;
		averageFixTime: number;
		commonSolutions: string[];
	}>;
	fixPatterns: Map<string, {
		issue: string;
		fix: string;
		successRate: number;
	}>;
	codeEvolution: SaveEvent[];
}

interface SaveEvent {
	timestamp: number;
	fileName: string;
	language: string;
	fileSize: number;
	lineCount: number;
	predictions: number;
	issues: number;
}

interface FeedbackWeights {
	accepted: number;
	dismissed: number;
	fixed: number;
	ignored: number;
}
