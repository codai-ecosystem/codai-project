/**
 * Time-Series Storage Engine - InfluxDB-compatible time-series database
 * Part of CBD Universal Database Phase 3
 */

import { EventEmitter } from 'events';

export interface TimeSeriesPoint {
    measurement: string;
    tags: Record<string, string>;
    fields: Record<string, number | string | boolean>;
    timestamp: Date;
}

export interface TimeSeriesQuery {
    measurement: string;
    startTime?: Date;
    endTime?: Date;
    tags?: Record<string, string>;
    fields?: string[];
    aggregation?: 'mean' | 'sum' | 'count' | 'min' | 'max' | 'first' | 'last';
    groupBy?: string[];
    interval?: string; // e.g., '1m', '5m', '1h', '1d'
    limit?: number;
    offset?: number;
}

export interface TimeSeriesResult {
    measurement: string;
    points: TimeSeriesPoint[];
    totalCount: number;
    executionTime: number;
}

export interface TimeSeriesStats {
    totalPoints: number;
    measurements: Map<string, number>;
    timeRange: {
        earliest: Date | null;
        latest: Date | null;
    };
    retention: {
        policies: RetentionPolicy[];
        totalSize: number;
    };
    queryLatency: {
        p50: number;
        p95: number;
        p99: number;
    };
}

export interface RetentionPolicy {
    name: string;
    duration: string; // e.g., '30d', '1y'
    measurement?: string; // optional measurement filter
    isDefault: boolean;
}

export interface MeasurementInfo {
    name: string;
    pointCount: number;
    firstPoint: Date | null;
    lastPoint: Date | null;
    tags: Set<string>;
    fields: Map<string, 'number' | 'string' | 'boolean'>;
}

export class TimeSeriesStorageEngine extends EventEmitter {
    private points = new Map<string, TimeSeriesPoint[]>();
    private measurements = new Map<string, MeasurementInfo>();
    private retentionPolicies: RetentionPolicy[] = [];
    private timeIndex = new Map<string, Map<number, Set<number>>>();
    private tagIndex = new Map<string, Map<string, Map<string, Set<number>>>>();
    private latencyMetrics: number[] = [];

    constructor() {
        super();
        
        // Default retention policy: keep data for 30 days
        this.retentionPolicies.push({
            name: 'default',
            duration: '30d',
            isDefault: true
        });

        // Start retention cleanup interval (every hour)
        setInterval(() => this.cleanupOldData(), 60 * 60 * 1000);
    }

    /**
     * Write time-series points
     */
    async writePoints(points: TimeSeriesPoint[]): Promise<void> {
        const startTime = Date.now();

        try {
            for (const point of points) {
                if (!point.measurement || !point.timestamp) {
                    throw new Error('Point must have measurement and timestamp');
                }

                // Initialize measurement if needed
                if (!this.measurements.has(point.measurement)) {
                    this.measurements.set(point.measurement, {
                        name: point.measurement,
                        pointCount: 0,
                        firstPoint: null,
                        lastPoint: null,
                        tags: new Set(),
                        fields: new Map()
                    });
                    this.points.set(point.measurement, []);
                }

                // Get measurement info and points array
                const measurementInfo = this.measurements.get(point.measurement)!;
                const pointsArray = this.points.get(point.measurement)!;

                // Add point to array
                const pointIndex = pointsArray.length;
                pointsArray.push(point);

                // Update measurement metadata
                measurementInfo.pointCount++;
                if (!measurementInfo.firstPoint || point.timestamp < measurementInfo.firstPoint) {
                    measurementInfo.firstPoint = point.timestamp;
                }
                if (!measurementInfo.lastPoint || point.timestamp > measurementInfo.lastPoint) {
                    measurementInfo.lastPoint = point.timestamp;
                }

                // Track tags
                Object.keys(point.tags).forEach(tag => measurementInfo.tags.add(tag));

                // Track field types
                Object.entries(point.fields).forEach(([field, value]) => {
                    const fieldType = typeof value as 'number' | 'string' | 'boolean';
                    measurementInfo.fields.set(field, fieldType);
                });

                // Update time index
                const timeKey = this.getTimeKey(point.timestamp);
                if (!this.timeIndex.has(point.measurement)) {
                    this.timeIndex.set(point.measurement, new Map());
                }
                const measurementTimeIndex = this.timeIndex.get(point.measurement)!;
                if (!measurementTimeIndex.has(timeKey)) {
                    measurementTimeIndex.set(timeKey, new Set());
                }
                measurementTimeIndex.get(timeKey)!.add(pointIndex);

                // Update tag index
                if (!this.tagIndex.has(point.measurement)) {
                    this.tagIndex.set(point.measurement, new Map());
                }
                const measurementTagIndex = this.tagIndex.get(point.measurement)!;

                Object.entries(point.tags).forEach(([tagKey, tagValue]) => {
                    if (!measurementTagIndex.has(tagKey)) {
                        measurementTagIndex.set(tagKey, new Map());
                    }
                    const tagValueIndex = measurementTagIndex.get(tagKey)!;
                    if (!tagValueIndex.has(tagValue)) {
                        tagValueIndex.set(tagValue, new Set());
                    }
                    tagValueIndex.get(tagValue)!.add(pointIndex);
                });
            }

            const duration = Date.now() - startTime;
            this.trackLatency(duration);

            this.emit('timeseries:written', {
                pointCount: points.length,
                measurements: [...new Set(points.map(p => p.measurement))],
                duration
            });

        } catch (error) {
            this.emit('timeseries:error', { operation: 'write', points, error });
            throw error;
        }
    }

    /**
     * Query time-series data
     */
    async query(query: TimeSeriesQuery): Promise<TimeSeriesResult> {
        const startTime = Date.now();

        try {
            const { measurement, startTime: queryStartTime, endTime: queryEndTime, tags, fields, aggregation, groupBy, interval, limit = 1000, offset = 0 } = query;

            if (!this.points.has(measurement)) {
                return {
                    measurement,
                    points: [],
                    totalCount: 0,
                    executionTime: Date.now() - startTime
                };
            }

            const pointsArray = this.points.get(measurement)!;
            let candidateIndices = new Set<number>();

            // Use time index for efficient querying
            if (queryStartTime || queryEndTime) {
                const measurementTimeIndex = this.timeIndex.get(measurement);
                if (measurementTimeIndex) {
                    for (const [timeKey, indices] of measurementTimeIndex) {
                        const time = new Date(timeKey);
                        if ((!queryStartTime || time >= queryStartTime) && 
                            (!queryEndTime || time <= queryEndTime)) {
                            indices.forEach(idx => candidateIndices.add(idx));
                        }
                    }
                } else {
                    // Fallback to full scan
                    for (let i = 0; i < pointsArray.length; i++) {
                        candidateIndices.add(i);
                    }
                }
            } else {
                // No time filtering - include all points
                for (let i = 0; i < pointsArray.length; i++) {
                    candidateIndices.add(i);
                }
            }

            // Use tag index for efficient tag filtering
            if (tags && Object.keys(tags).length > 0) {
                const measurementTagIndex = this.tagIndex.get(measurement);
                if (measurementTagIndex) {
                    for (const [tagKey, tagValue] of Object.entries(tags)) {
                        const tagValueIndex = measurementTagIndex.get(tagKey);
                        if (tagValueIndex && tagValueIndex.has(tagValue)) {
                            const valueSet = tagValueIndex.get(tagValue)!;
                            // Intersect with current candidates
                            candidateIndices = new Set([...candidateIndices].filter(x => valueSet.has(x)));
                        } else {
                            // Tag value not found - no results
                            candidateIndices.clear();
                            break;
                        }
                    }
                }
            }

            // Get actual points and apply fine-grained time filtering
            let filteredPoints = Array.from(candidateIndices)
                .map(idx => pointsArray[idx])
                .filter((point): point is TimeSeriesPoint => {
                    if (!point) return false;
                    if (queryStartTime && point.timestamp < queryStartTime) return false;
                    if (queryEndTime && point.timestamp > queryEndTime) return false;
                    return true;
                });

            // Sort by timestamp
            filteredPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            const totalCount = filteredPoints.length;

            // Apply aggregation and grouping
            if (aggregation || groupBy || interval) {
                filteredPoints = this.applyAggregation(filteredPoints, aggregation, groupBy, interval);
            }

            // Apply field selection
            if (fields && fields.length > 0) {
                filteredPoints = filteredPoints.map(point => ({
                    ...point,
                    fields: Object.fromEntries(
                        Object.entries(point.fields).filter(([key]) => fields.includes(key))
                    )
                }));
            }

            // Apply pagination
            if (offset > 0) {
                filteredPoints = filteredPoints.slice(offset);
            }
            if (limit) {
                filteredPoints = filteredPoints.slice(0, limit);
            }

            const duration = Date.now() - startTime;
            this.trackLatency(duration);

            this.emit('timeseries:queried', {
                measurement,
                resultCount: filteredPoints.length,
                totalCount,
                duration
            });

            return {
                measurement,
                points: filteredPoints,
                totalCount,
                executionTime: duration
            };

        } catch (error) {
            this.emit('timeseries:error', { operation: 'query', query, error });
            throw error;
        }
    }

    /**
     * Apply data retention policies
     */
    private async cleanupOldData(): Promise<void> {
        let totalDeletedPoints = 0;

        for (const policy of this.retentionPolicies) {
            if (!policy || !policy.duration) continue;

            const now = new Date();
            const retentionMs = this.parseDuration(policy.duration);
            const cutoffTime = new Date(now.getTime() - retentionMs);

            for (const [measurement, points] of this.points) {
                if (policy.measurement && policy.measurement !== measurement) continue;
                
                const originalLength = points.length;

                // Remove old points
                const newPoints = points.filter(point => point.timestamp >= cutoffTime);
                this.points.set(measurement, newPoints);

                const deletedCount = originalLength - newPoints.length;
                totalDeletedPoints += deletedCount;

                if (deletedCount > 0) {
                    // Update measurement metadata
                    const measurementInfo = this.measurements.get(measurement)!;
                    measurementInfo.pointCount = newPoints.length;

                    if (newPoints.length > 0) {
                        measurementInfo.firstPoint = newPoints[0]!.timestamp;
                        measurementInfo.lastPoint = newPoints[newPoints.length - 1]!.timestamp;
                    } else {
                        measurementInfo.firstPoint = null;
                        measurementInfo.lastPoint = null;
                    }

                    // Rebuild indexes for this measurement
                    this.rebuildIndexes(measurement);
                }
            }
        }

        if (totalDeletedPoints > 0) {
            this.emit('timeseries:retention', {
                deletedPoints: totalDeletedPoints,
                timestamp: new Date()
            });
        }
    }

    /**
     * Delete data points
     */
    async deletePoints(measurement: string, startTime?: Date, endTime?: Date, tags?: Record<string, string>): Promise<number> {
        if (!this.points.has(measurement)) {
            return 0;
        }

        const points = this.points.get(measurement)!;
        const originalLength = points.length;

        // Filter points to keep (opposite of deletion criteria)
        const filteredPoints = points.filter(point => {
            // Time-based deletion
            if (startTime && point.timestamp >= startTime && (!endTime || point.timestamp <= endTime)) {
                if (tags && Object.keys(tags).length > 0) {
                    // Check if all tags match
                    const matches = Object.entries(tags).every(([key, value]) => point.tags[key] === value);
                    if (matches) return false; // This point should be deleted
                } else if (!tags || Object.keys(tags).length === 0) {
                    return false; // Delete all points in time range
                }
            }
            return true; // Keep this point
        });

        this.points.set(measurement, filteredPoints);
        const deletedCount = originalLength - filteredPoints.length;

        if (deletedCount > 0) {
            // Update measurement metadata
            const measurementInfo = this.measurements.get(measurement)!;
            measurementInfo.pointCount = filteredPoints.length;

            if (filteredPoints.length > 0) {
                measurementInfo.firstPoint = filteredPoints[0]!.timestamp;
                measurementInfo.lastPoint = filteredPoints[filteredPoints.length - 1]!.timestamp;
            } else {
                measurementInfo.firstPoint = null;
                measurementInfo.lastPoint = null;
            }

            // Rebuild indexes for this measurement
            this.rebuildIndexes(measurement);

            this.emit('timeseries:deleted', {
                measurement,
                deletedCount,
                remainingCount: filteredPoints.length
            });
        }

        return deletedCount;
    }

    /**
     * Get database statistics
     */
    async getStats(): Promise<TimeSeriesStats> {
        const totalPoints = Array.from(this.points.values()).reduce((sum, points) => sum + points.length, 0);
        const measurements = new Map<string, number>();

        for (const [measurement, points] of this.points) {
            measurements.set(measurement, points.length);
        }

        let earliest: Date | null = null;
        let latest: Date | null = null;

        for (const measurementInfo of this.measurements.values()) {
            if (measurementInfo.firstPoint && (!earliest || measurementInfo.firstPoint < earliest)) {
                earliest = measurementInfo.firstPoint;
            }
            if (measurementInfo.lastPoint && (!latest || measurementInfo.lastPoint > latest)) {
                latest = measurementInfo.lastPoint;
            }
        }

        // Calculate latency percentiles
        const sortedLatencies = this.latencyMetrics.slice().sort((a, b) => a - b);
        const p50 = this.getPercentile(sortedLatencies, 50);
        const p95 = this.getPercentile(sortedLatencies, 95);
        const p99 = this.getPercentile(sortedLatencies, 99);

        return {
            totalPoints,
            measurements,
            timeRange: { earliest, latest },
            retention: {
                policies: this.retentionPolicies.slice(),
                totalSize: this.estimateStorageSize()
            },
            queryLatency: { p50, p95, p99 }
        };
    }

    /**
     * Apply aggregation to points
     */
    private applyAggregation(
        points: TimeSeriesPoint[], 
        aggregation?: string, 
        groupBy?: string[], 
        interval?: string
    ): TimeSeriesPoint[] {
        if (!aggregation && !groupBy && !interval) {
            return points;
        }

        // Group points
        const groups = new Map<string, TimeSeriesPoint[]>();

        for (const point of points) {
            let groupKey = '';

            // Group by specified tag values
            if (groupBy && groupBy.length > 0) {
                const groupValues = groupBy.map(tag => `${tag}:${point.tags[tag] || 'null'}`);
                groupKey = groupValues.join('|');
            }

            // Add time-based grouping
            if (interval) {
                const timeKey = this.getIntervalKey(point.timestamp, interval);
                groupKey = groupKey ? `${groupKey}|time:${timeKey}` : `time:${timeKey}`;
            }

            if (!groupKey) {
                groupKey = 'all';
            }

            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(point);
        }

        // Apply aggregation to each group
        const aggregatedPoints: TimeSeriesPoint[] = [];

        for (const [groupKey, groupPoints] of groups) {
            if (groupPoints.length === 0) continue;

            const firstPoint = groupPoints[0];
            if (!firstPoint) continue;
            
            const aggregatedFields: Record<string, number | string | boolean> = {};

            // Extract time from group key if interval is used
            let timestamp = firstPoint.timestamp;
            if (interval) {
                const timeMatch = groupKey.match(/time:(\d+)/);
                if (timeMatch && timeMatch[1]) {
                    timestamp = new Date(parseInt(timeMatch[1]));
                }
            }

            // Initialize aggregated fields from first point
            for (const fieldName of Object.keys(firstPoint.fields)) {
                const values = groupPoints
                    .map(p => p.fields[fieldName])
                    .filter(v => typeof v === 'number') as number[];

                if (values.length === 0) {
                    const fieldValue = firstPoint.fields[fieldName];
                    if (fieldValue !== undefined) {
                        aggregatedFields[fieldName] = fieldValue;
                    }
                    continue;
                }

                switch (aggregation) {
                    case 'mean':
                        const sum = values.reduce((acc, val) => acc + val, 0);
                        aggregatedFields[fieldName] = sum / values.length;
                        break;
                    case 'sum':
                        aggregatedFields[fieldName] = values.reduce((acc, val) => acc + val, 0);
                        break;
                    case 'count':
                        aggregatedFields[fieldName] = values.length;
                        break;
                    case 'min':
                        aggregatedFields[fieldName] = Math.min(...values);
                        break;
                    case 'max':
                        aggregatedFields[fieldName] = Math.max(...values);
                        break;
                    case 'first':
                        const firstValue = values[0];
                        if (firstValue !== undefined) {
                            aggregatedFields[fieldName] = firstValue;
                        }
                        break;
                    case 'last':
                        const lastValue = values[values.length - 1];
                        if (lastValue !== undefined) {
                            aggregatedFields[fieldName] = lastValue;
                        }
                        break;
                    default:
                        const defaultValue = firstPoint.fields[fieldName];
                        if (defaultValue !== undefined) {
                            aggregatedFields[fieldName] = defaultValue;
                        }
                        break;
                }
            }

            aggregatedPoints.push({
                measurement: firstPoint.measurement,
                tags: firstPoint.tags,
                fields: aggregatedFields,
                timestamp
            });
        }

        return aggregatedPoints;
    }

    /**
     * Parse duration string to milliseconds
     */
    private parseDuration(duration: string): number {
        const match = duration.match(/^(\d+)([smhdwy])$/);
        if (!match || !match[1] || !match[2]) {
            throw new Error(`Invalid duration format: ${duration}`);
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        const multipliers: Record<string, number> = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000,
            'w': 7 * 24 * 60 * 60 * 1000,
            'y': 365 * 24 * 60 * 60 * 1000
        };

        const multiplier = multipliers[unit];
        if (multiplier === undefined) {
            throw new Error(`Unknown time unit: ${unit}`);
        }

        return value * multiplier;
    }

    /**
     * Get time key for indexing (rounded to minute)
     */
    private getTimeKey(timestamp: Date): number {
        return Math.floor(timestamp.getTime() / (60 * 1000)) * (60 * 1000);
    }

    /**
     * Get interval key for time-based grouping
     */
    private getIntervalKey(timestamp: Date, interval: string): number {
        const intervalMs = this.parseDuration(interval);
        return Math.floor(timestamp.getTime() / intervalMs) * intervalMs;
    }

    /**
     * Rebuild indexes for a measurement
     */
    private rebuildIndexes(measurement: string): void {
        const points = this.points.get(measurement);
        if (!points) return;

        // Clear existing indexes
        this.timeIndex.delete(measurement);
        this.tagIndex.delete(measurement);

        // Rebuild time index
        const measurementTimeIndex = new Map<number, Set<number>>();
        this.timeIndex.set(measurement, measurementTimeIndex);

        // Rebuild tag index
        const measurementTagIndex = new Map<string, Map<string, Set<number>>>();
        this.tagIndex.set(measurement, measurementTagIndex);

        points.forEach((point, index) => {
            // Time index
            const timeKey = this.getTimeKey(point.timestamp);
            if (!measurementTimeIndex.has(timeKey)) {
                measurementTimeIndex.set(timeKey, new Set());
            }
            measurementTimeIndex.get(timeKey)!.add(index);

            // Tag index
            Object.entries(point.tags).forEach(([tagKey, tagValue]) => {
                if (!measurementTagIndex.has(tagKey)) {
                    measurementTagIndex.set(tagKey, new Map());
                }
                const tagValueIndex = measurementTagIndex.get(tagKey)!;
                if (!tagValueIndex.has(tagValue)) {
                    tagValueIndex.set(tagValue, new Set());
                }
                tagValueIndex.get(tagValue)!.add(index);
            });
        });
    }

    /**
     * Track query latency
     */
    private trackLatency(duration: number): void {
        this.latencyMetrics.push(duration);
        
        // Keep only last 1000 measurements
        if (this.latencyMetrics.length > 1000) {
            this.latencyMetrics = this.latencyMetrics.slice(-1000);
        }
    }

    /**
     * Calculate percentile from sorted array
     */
    private getPercentile(sortedArray: number[], percentile: number): number {
        if (sortedArray.length === 0) return 0;
        
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        const safeIndex = Math.max(0, Math.min(index, sortedArray.length - 1));
        return sortedArray[safeIndex] || 0;
    }

    /**
     * Estimate storage size in bytes
     */
    private estimateStorageSize(): number {
        let totalSize = 0;
        
        for (const points of this.points.values()) {
            for (const point of points) {
                // Rough estimation: JSON serialization size
                totalSize += JSON.stringify(point).length * 2; // UTF-16 encoding
            }
        }
        
        return totalSize;
    }

    /**
     * Add or update retention policy
     */
    addRetentionPolicy(policy: RetentionPolicy): void {
        const existingIndex = this.retentionPolicies.findIndex(p => p.name === policy.name);
        
        if (existingIndex >= 0) {
            this.retentionPolicies[existingIndex] = policy;
        } else {
            this.retentionPolicies.push(policy);
        }

        this.emit('timeseries:retention_policy', {
            action: existingIndex >= 0 ? 'updated' : 'added',
            policy
        });
    }

    /**
     * Remove retention policy
     */
    removeRetentionPolicy(name: string): boolean {
        const index = this.retentionPolicies.findIndex(p => p.name === name);
        
        if (index >= 0) {
            const policy = this.retentionPolicies[index];
            this.retentionPolicies.splice(index, 1);
            
            this.emit('timeseries:retention_policy', {
                action: 'removed',
                policy
            });
            
            return true;
        }
        
        return false;
    }

    /**
     * List all measurements
     */
    getMeasurements(): MeasurementInfo[] {
        return Array.from(this.measurements.values());
    }

    /**
     * Drop a measurement (delete all data)
     */
    async dropMeasurement(measurement: string): Promise<boolean> {
        if (!this.points.has(measurement)) {
            return false;
        }

        const pointCount = this.points.get(measurement)!.length;
        
        this.points.delete(measurement);
        this.measurements.delete(measurement);
        this.timeIndex.delete(measurement);
        this.tagIndex.delete(measurement);

        this.emit('timeseries:measurement_dropped', {
            measurement,
            deletedPoints: pointCount
        });

        return true;
    }
}
