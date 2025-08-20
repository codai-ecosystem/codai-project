/**
 * Intelligent Cloud Selection Engine
 * Dynamically selects optimal cloud provider for each operation
 * Based on performance, cost, latency, and availability criteria
 */

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'local';

export interface OperationCriteria {
    scale: number;
    consistency: 'strong' | 'eventual' | 'session';
    latencyRequirement: number; // milliseconds
    serverless: boolean;
    analytics: boolean;
    globalDistribution: boolean;
    aiFeatures: boolean;
    enterpriseSecurity: boolean;
    documentProcessing: boolean;
    machineLearning: boolean;
    strongConsistency: boolean;
    bigData: boolean;
    realTimeAnalytics: boolean;
    costSensitive: boolean;
}

export interface CloudScore {
    provider: CloudProvider;
    score: number;
    reasoning: string[];
    estimatedCost: number;
    estimatedLatency: number;
}

export interface CloudSelectionResult {
    selectedProvider: CloudProvider;
    scores: CloudScore[];
    confidence: number;
    reasoning: string;
}

export type CloudSelectionStrategy = 'performance' | 'cost' | 'latency' | 'availability';

export class IntelligentCloudSelector {
    private strategy: CloudSelectionStrategy;
    private costMetrics = new Map<CloudProvider, number[]>();
    private latencyMetrics = new Map<CloudProvider, number[]>();

    constructor(strategy: CloudSelectionStrategy = 'performance') {
        this.strategy = strategy;
    }

    /**
     * Select optimal cloud provider for operation
     */
    async selectOptimalCloud(
        operationType: string,
        criteria: Partial<OperationCriteria>
    ): Promise<CloudSelectionResult> {
        const fullCriteria = this.buildFullCriteria(criteria);
        const scores = await this.scoreAllClouds(operationType, fullCriteria);

        // Sort by score (descending)
        scores.sort((a, b) => b.score - a.score);

        const selectedProvider = scores[0]?.provider || 'local';
        const confidence = this.calculateConfidence(scores);

        return {
            selectedProvider,
            scores,
            confidence,
            reasoning: scores[0] ? this.generateReasoning(scores[0], fullCriteria) : 'No suitable cloud provider found'
        };
    }

    /**
     * Score all cloud providers for given criteria
     */
    private async scoreAllClouds(
        operationType: string,
        criteria: OperationCriteria
    ): Promise<CloudScore[]> {
        const providers: CloudProvider[] = ['aws', 'azure', 'gcp', 'local'];
        const scores: CloudScore[] = [];

        for (const provider of providers) {
            const score = await this.scoreCloudProvider(provider, operationType, criteria);
            scores.push(score);
        }

        return scores;
    }

    /**
     * Score individual cloud provider
     */
    private async scoreCloudProvider(
        provider: CloudProvider,
        operationType: string,
        criteria: OperationCriteria
    ): Promise<CloudScore> {
        let score = 0;
        const reasoning: string[] = [];
        let estimatedCost = 0;
        let estimatedLatency = 0;

        switch (provider) {
            case 'aws':
                score = this.scoreAWS(criteria, reasoning);
                estimatedCost = this.estimateAWSCost(operationType, criteria);
                estimatedLatency = this.estimateAWSLatency(operationType, criteria);
                break;

            case 'azure':
                score = this.scoreAzure(criteria, reasoning);
                estimatedCost = this.estimateAzureCost(operationType, criteria);
                estimatedLatency = this.estimateAzureLatency(operationType, criteria);
                break;

            case 'gcp':
                score = this.scoreGCP(criteria, reasoning);
                estimatedCost = this.estimateGCPCost(operationType, criteria);
                estimatedLatency = this.estimateGCPLatency(operationType, criteria);
                break;

            case 'local':
                score = this.scoreLocal(criteria, reasoning);
                estimatedCost = 0; // No cloud costs
                estimatedLatency = this.estimateLocalLatency(operationType, criteria);
                break;
        }

        // Apply strategy-specific adjustments
        score = this.applyStrategyWeighting(score, provider, criteria);

        return {
            provider,
            score,
            reasoning,
            estimatedCost,
            estimatedLatency
        };
    }

    /**
     * Score AWS for given criteria
     */
    private scoreAWS(criteria: OperationCriteria, reasoning: string[]): number {
        let score = 0;

        // AWS strengths
        if (criteria.scale > 1000000) {
            score += 40;
            reasoning.push('AWS excels at massive scale (DynamoDB)');
        }

        if (criteria.consistency === 'eventual') {
            score += 30;
            reasoning.push('AWS DynamoDB provides excellent eventual consistency');
        }

        if (criteria.serverless) {
            score += 25;
            reasoning.push('AWS Lambda integration is mature');
        }

        if (criteria.analytics) {
            score += 20;
            reasoning.push('AWS Redshift/Athena for analytics');
        }

        // AWS weaknesses
        if (criteria.strongConsistency) {
            score -= 10;
            reasoning.push('AWS DynamoDB limited strong consistency');
        }

        if (criteria.costSensitive) {
            score -= 15;
            reasoning.push('AWS can be expensive for small workloads');
        }

        return Math.max(0, Math.min(score, 100));
    }

    /**
     * Score Azure for given criteria
     */
    private scoreAzure(criteria: OperationCriteria, reasoning: string[]): number {
        let score = 0;

        // Azure strengths
        if (criteria.globalDistribution) {
            score += 35;
            reasoning.push('Azure Cosmos DB excellent global distribution');
        }

        if (criteria.aiFeatures) {
            score += 30;
            reasoning.push('Azure Cognitive Services integration');
        }

        if (criteria.enterpriseSecurity) {
            score += 25;
            reasoning.push('Azure Active Directory enterprise integration');
        }

        if (criteria.documentProcessing) {
            score += 20;
            reasoning.push('Azure Form Recognizer capabilities');
        }

        // Multi-model support
        if (criteria.consistency === 'strong' || criteria.consistency === 'session') {
            score += 15;
            reasoning.push('Azure Cosmos DB flexible consistency models');
        }

        return Math.max(0, Math.min(score, 100));
    }

    /**
     * Score GCP for given criteria
     */
    private scoreGCP(criteria: OperationCriteria, reasoning: string[]): number {
        let score = 0;

        // GCP strengths
        if (criteria.machineLearning) {
            score += 40;
            reasoning.push('GCP Vertex AI superior ML integration');
        }

        if (criteria.strongConsistency) {
            score += 35;
            reasoning.push('Google Spanner global strong consistency');
        }

        if (criteria.bigData) {
            score += 25;
            reasoning.push('GCP BigQuery for big data analytics');
        }

        if (criteria.realTimeAnalytics) {
            score += 20;
            reasoning.push('GCP Pub/Sub real-time processing');
        }

        if (criteria.costSensitive) {
            score += 15;
            reasoning.push('GCP competitive pricing');
        }

        return Math.max(0, Math.min(score, 100));
    }

    /**
     * Score local deployment
     */
    private scoreLocal(criteria: OperationCriteria, reasoning: string[]): number {
        let score = 50; // Base score for local deployment

        // Local advantages
        if (criteria.latencyRequirement < 10) {
            score += 30;
            reasoning.push('Local deployment provides minimal latency');
        }

        if (criteria.costSensitive) {
            score += 20;
            reasoning.push('No cloud costs for local deployment');
        }

        // Local disadvantages
        if (criteria.globalDistribution) {
            score -= 40;
            reasoning.push('Local deployment lacks global distribution');
        }

        if (criteria.scale > 100000) {
            score -= 30;
            reasoning.push('Local deployment may not scale to requirements');
        }

        if (criteria.aiFeatures) {
            score -= 20;
            reasoning.push('Limited AI capabilities in local deployment');
        }

        return Math.max(0, Math.min(score, 100));
    }

    /**
     * Apply strategy-specific weighting
     */
    private applyStrategyWeighting(
        baseScore: number,
        provider: CloudProvider,
        _criteria: OperationCriteria
    ): number {
        let adjustedScore = baseScore;

        switch (this.strategy) {
            case 'cost':
                if (provider === 'local') adjustedScore *= 1.5;
                if (provider === 'gcp') adjustedScore *= 1.2;
                if (provider === 'aws') adjustedScore *= 0.8;
                break;

            case 'latency':
                if (provider === 'local') adjustedScore *= 1.3;
                // Adjust based on historical latency metrics
                const avgLatency = this.getAverageLatency(provider);
                if (avgLatency < 50) adjustedScore *= 1.2;
                if (avgLatency > 200) adjustedScore *= 0.8;
                break;

            case 'availability':
                if (provider === 'aws') adjustedScore *= 1.1;
                if (provider === 'azure') adjustedScore *= 1.1;
                if (provider === 'gcp') adjustedScore *= 1.05;
                break;

            case 'performance':
            default:
                // Performance-first scoring (no additional adjustments)
                break;
        }

        return Math.max(0, Math.min(adjustedScore, 100));
    }

    /**
     * Build full criteria with defaults
     */
    private buildFullCriteria(partial: Partial<OperationCriteria>): OperationCriteria {
        return {
            scale: partial.scale || 1000,
            consistency: partial.consistency || 'eventual',
            latencyRequirement: partial.latencyRequirement || 100,
            serverless: partial.serverless || false,
            analytics: partial.analytics || false,
            globalDistribution: partial.globalDistribution || false,
            aiFeatures: partial.aiFeatures || false,
            enterpriseSecurity: partial.enterpriseSecurity || false,
            documentProcessing: partial.documentProcessing || false,
            machineLearning: partial.machineLearning || false,
            strongConsistency: partial.strongConsistency || false,
            bigData: partial.bigData || false,
            realTimeAnalytics: partial.realTimeAnalytics || false,
            costSensitive: partial.costSensitive || false
        };
    }

    /**
     * Calculate confidence in selection
     */
    private calculateConfidence(scores: CloudScore[]): number {
        if (scores.length < 2) return 100;

        const highest = scores[0]?.score || 0;
        const secondHighest = scores[1]?.score || 0;
        const gap = highest - secondHighest;

        // Higher gap = higher confidence
        return Math.min(100, 50 + gap);
    }

    /**
     * Generate human-readable reasoning
     */
    private generateReasoning(topScore: CloudScore, _criteria: OperationCriteria): string {
        const reasoning = [
            `Selected ${topScore.provider.toUpperCase()} with score ${topScore.score.toFixed(1)}`,
            `Strategy: ${this.strategy}`,
            ...topScore.reasoning
        ];

        return reasoning.join('. ');
    }

    /**
     * Cost estimation methods
     */
    private estimateAWSCost(operationType: string, criteria: OperationCriteria): number {
        let cost = 0;

        // Base cost for DynamoDB
        if (operationType.includes('document') || operationType.includes('kv')) {
            cost += criteria.scale * 0.00025; // $0.25 per million requests
        }

        // Vector search with OpenSearch
        if (operationType.includes('vector')) {
            cost += 0.042 * 24 * 30; // t3.small.search instance per month
        }

        return cost;
    }

    private estimateAzureCost(operationType: string, _criteria: OperationCriteria): number {
        let cost = 0;

        // Base cost for Cosmos DB
        if (operationType.includes('document')) {
            cost += 400 * 0.008; // 400 RU/s at $0.008 per 100 RU/s per hour
        }

        // Cognitive Search for vectors
        if (operationType.includes('vector')) {
            cost += 250; // Basic tier per month
        }

        return cost;
    }

    private estimateGCPCost(operationType: string, criteria: OperationCriteria): number {
        let cost = 0;

        // Base cost for Firestore
        if (operationType.includes('document')) {
            cost += criteria.scale * 0.0000036; // $0.36 per 100K reads
        }

        // Vertex AI for vectors
        if (operationType.includes('vector')) {
            cost += 0.95 * 24 * 30; // n1-standard-1 per month
        }

        return cost;
    }

    /**
     * Latency estimation methods
     */
    private estimateAWSLatency(_operationType: string, criteria: OperationCriteria): number {
        const baseLatency = this.getAverageLatency('aws') || 50;

        if (criteria.globalDistribution) return baseLatency * 2;
        if (criteria.strongConsistency) return baseLatency * 1.5;

        return baseLatency;
    }

    private estimateAzureLatency(_operationType: string, criteria: OperationCriteria): number {
        const baseLatency = this.getAverageLatency('azure') || 45;

        if (criteria.aiFeatures) return baseLatency * 0.8; // Cognitive Services edge
        if (criteria.globalDistribution) return baseLatency * 1.2;

        return baseLatency;
    }

    private estimateGCPLatency(_operationType: string, criteria: OperationCriteria): number {
        const baseLatency = this.getAverageLatency('gcp') || 40;

        if (criteria.machineLearning) return baseLatency * 0.7; // Vertex AI optimization
        if (criteria.strongConsistency) return baseLatency * 1.3; // Spanner overhead

        return baseLatency;
    }

    private estimateLocalLatency(_operationType: string, _criteria: OperationCriteria): number {
        return 5; // Local deployment minimal latency
    }

    /**
     * Get average latency for provider
     */
    private getAverageLatency(provider: CloudProvider): number {
        const metrics = this.latencyMetrics.get(provider) || [];
        if (metrics.length === 0) return 50;

        return metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
    }

    /**
     * Record performance metrics
     */
    recordPerformanceMetric(provider: CloudProvider, latency: number, cost: number): void {
        // Record latency
        if (!this.latencyMetrics.has(provider)) {
            this.latencyMetrics.set(provider, []);
        }
        const latencies = this.latencyMetrics.get(provider)!;
        latencies.push(latency);
        if (latencies.length > 100) latencies.shift(); // Keep last 100 measurements

        // Record cost
        if (!this.costMetrics.has(provider)) {
            this.costMetrics.set(provider, []);
        }
        const costs = this.costMetrics.get(provider)!;
        costs.push(cost);
        if (costs.length > 100) costs.shift();
    }

    /**
     * Update selection strategy
     */
    setStrategy(strategy: CloudSelectionStrategy): void {
        this.strategy = strategy;
    }

    /**
     * Get current performance metrics
     */
    getMetrics(): Record<CloudProvider, { avgLatency: number; avgCost: number }> {
        const result: Record<string, { avgLatency: number; avgCost: number }> = {};

        const providers: CloudProvider[] = ['aws', 'azure', 'gcp', 'local'];

        for (const provider of providers) {
            const latencies = this.latencyMetrics.get(provider) || [];
            const costs = this.costMetrics.get(provider) || [];

            result[provider] = {
                avgLatency: latencies.length > 0 ?
                    latencies.reduce((sum, val) => sum + val, 0) / latencies.length : 0,
                avgCost: costs.length > 0 ?
                    costs.reduce((sum, val) => sum + val, 0) / costs.length : 0
            };
        }

        return result as Record<CloudProvider, { avgLatency: number; avgCost: number }>;
    }
}
