/**
 * CBD Time-Series Database Engine - Phase 3
 * Advanced time-series database with Gorilla compression, time-based partitioning,
 * multi-resolution storage, and IoT-optimized data patterns
 * 
 * Based on Azure Data Explorer best practices and Facebook's Gorilla algorithm
 */

import { EventEmitter } from 'events';

// Core interfaces for time-series data
export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface TimeSeriesMetrics {
  metricName: string;
  points: TimeSeriesPoint[];
  labels: Record<string, string>;
  unit?: string;
  description?: string;
}

export interface TimeSeriesBucket {
  startTime: number;
  endTime: number;
  bucketSize: number; // milliseconds
  points: TimeSeriesPoint[];
  compressed: boolean;
  compressedData?: Buffer;
  compressionRatio?: number;
}

export interface TimeSeriesPartition {
  partitionKey: string;
  timeRange: { start: number; end: number };
  buckets: Map<string, TimeSeriesBucket>;
  totalPoints: number;
  compressionRatio: number;
  lastAccessed: number;
  tier: 'hot' | 'warm' | 'cold';
}

// Aggregation and analysis interfaces
export interface TimeSeriesAggregation {
  type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile' | 'rate' | 'derivative';
  window: number; // milliseconds
  percentile?: number; // for percentile aggregations
}

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MovingAverageResult {
  timestamp: number;
  sma: number; // Simple Moving Average
  ema: number; // Exponential Moving Average
  window: number;
}

// Query and analysis interfaces
export interface TimeSeriesQuery {
  metricName?: string;
  labels?: Record<string, string>;
  timeRange: { start: number; end: number };
  aggregation?: TimeSeriesAggregation;
  groupBy?: string[];
  limit?: number;
  orderBy?: 'asc' | 'desc';
  fillGaps?: boolean;
  downsample?: {
    interval: number;
    aggregation: TimeSeriesAggregation['type'];
  };
}

export interface TimeSeriesQueryResult {
  metrics: TimeSeriesMetrics[];
  totalPoints: number;
  executionTime: number;
  fromCache: boolean;
  compressionRatio?: number;
  partitionsScanned: number;
}

// Retention and lifecycle interfaces
export interface RetentionPolicy {
  name: string;
  maxAge: number; // milliseconds
  resolution: number; // data point interval in milliseconds
  aggregation?: TimeSeriesAggregation['type'];
  tier: 'hot' | 'warm' | 'cold';
}

export interface TimeSeriesEngineOptions {
  enableCompression?: boolean;
  compressionAlgorithm?: 'gorilla' | 'delta' | 'lz4';
  bucketSize?: number; // milliseconds (default: 1 hour)
  maxPartitionSize?: number; // max points per partition
  enableCaching?: boolean;
  cacheSize?: number; // max cached partitions
  defaultRetentionPolicies?: RetentionPolicy[];
  enableDownsampling?: boolean;
  enableAnalytics?: boolean;
}

// Statistical analysis interfaces
export interface TimeSeriesStatistics {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  stdDev: number;
  variance: number;
  percentiles: Record<string, number>; // p50, p95, p99 etc.
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
  anomalies: TimeSeriesPoint[];
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  score: number; // 0-1, higher means more anomalous
  expectedValue: number;
  actualValue: number;
  timestamp: number;
  method: 'statistical' | 'ml' | 'threshold';
}

/**
 * Gorilla Compression Algorithm Implementation
 * Based on Facebook's Gorilla time-series compression
 */
class GorillaCompressor {
  private static readonly TIMESTAMP_DELTA_BITS = 64;
  private static readonly VALUE_XOR_BITS = 64;

  /**
   * Compress time-series data using Gorilla algorithm
   */
  static compress(points: TimeSeriesPoint[]): Buffer {
    if (points.length === 0) return Buffer.alloc(0);

    const writer = new BitWriter();
    
    // Sort points by timestamp
    const sortedPoints = points.sort((a, b) => a.timestamp - b.timestamp);
    
    // Write header
    writer.writeUint64(sortedPoints[0].timestamp); // First timestamp
    writer.writeFloat64(sortedPoints[0].value); // First value
    
    let prevTimestamp = sortedPoints[0].timestamp;
    let prevValue = sortedPoints[0].value;
    let prevDelta = 0;
    
    for (let i = 1; i < sortedPoints.length; i++) {
      const point = sortedPoints[i];
      
      // Compress timestamp using delta-of-deltas
      const delta = point.timestamp - prevTimestamp;
      const deltaOfDelta = delta - prevDelta;
      
      this.compressTimestamp(writer, deltaOfDelta);
      
      // Compress value using XOR with previous value
      this.compressValue(writer, point.value, prevValue);
      
      prevTimestamp = point.timestamp;
      prevValue = point.value;
      prevDelta = delta;
    }
    
    return writer.toBuffer();
  }

  /**
   * Decompress Gorilla-compressed data
   */
  static decompress(compressedData: Buffer): TimeSeriesPoint[] {
    if (compressedData.length === 0) return [];

    const reader = new BitReader(compressedData);
    const points: TimeSeriesPoint[] = [];
    
    // Read header
    const firstTimestamp = reader.readUint64();
    const firstValue = reader.readFloat64();
    
    points.push({
      timestamp: firstTimestamp,
      value: firstValue
    });
    
    let prevTimestamp = firstTimestamp;
    let prevValue = firstValue;
    let prevDelta = 0;
    
    try {
      while (!reader.isEnd()) {
        // Decompress timestamp
        const deltaOfDelta = this.decompressTimestamp(reader);
        const delta = deltaOfDelta + prevDelta;
        const timestamp = prevTimestamp + delta;
        
        // Decompress value
        const value = this.decompressValue(reader, prevValue);
        
        points.push({ timestamp, value });
        
        prevTimestamp = timestamp;
        prevValue = value;
        prevDelta = delta;
      }
    } catch (error) {
      // End of stream reached
    }
    
    return points;
  }

  private static compressTimestamp(writer: BitWriter, deltaOfDelta: number): void {
    if (deltaOfDelta === 0) {
      writer.writeBit(0); // Single bit for no change
    } else if (deltaOfDelta >= -63 && deltaOfDelta <= 64) {
      writer.writeBit(1);
      writer.writeBit(0);
      writer.writeBits(deltaOfDelta + 63, 7); // 7-bit representation
    } else if (deltaOfDelta >= -255 && deltaOfDelta <= 256) {
      writer.writeBit(1);
      writer.writeBit(1);
      writer.writeBit(0);
      writer.writeBits(deltaOfDelta + 255, 9); // 9-bit representation
    } else {
      writer.writeBit(1);
      writer.writeBit(1);
      writer.writeBit(1);
      writer.writeUint64(deltaOfDelta); // Full 64-bit representation
    }
  }

  private static decompressTimestamp(reader: BitReader): number {
    if (reader.readBit() === 0) {
      return 0; // No change
    }
    
    if (reader.readBit() === 0) {
      return reader.readBits(7) - 63; // 7-bit representation
    }
    
    if (reader.readBit() === 0) {
      return reader.readBits(9) - 255; // 9-bit representation
    }
    
    return reader.readUint64(); // Full 64-bit representation
  }

  private static compressValue(writer: BitWriter, value: number, prevValue: number): void {
    const valueBuffer = Buffer.allocUnsafe(8);
    const prevValueBuffer = Buffer.allocUnsafe(8);
    
    valueBuffer.writeDoubleLE(value, 0);
    prevValueBuffer.writeDoubleLE(prevValue, 0);
    
    let xorResult = 0n;
    for (let i = 0; i < 8; i++) {
      xorResult |= BigInt(valueBuffer[i] ^ prevValueBuffer[i]) << BigInt(i * 8);
    }
    
    if (xorResult === 0n) {
      writer.writeBit(0); // Values are identical
      return;
    }
    
    writer.writeBit(1); // Values differ
    
    // Find leading and trailing zeros
    const leadingZeros = this.countLeadingZeros(xorResult);
    const trailingZeros = this.countTrailingZeros(xorResult);
    const meaningfulBits = 64 - leadingZeros - trailingZeros;
    
    if (meaningfulBits <= 32) {
      writer.writeBit(0); // Use compact representation
      writer.writeBits(leadingZeros, 6); // 6 bits for leading zeros (0-63)
      writer.writeBits(meaningfulBits, 6); // 6 bits for meaningful bits (1-64)
      writer.writeBits(Number(xorResult >> BigInt(trailingZeros)), meaningfulBits);
    } else {
      writer.writeBit(1); // Use full representation
      writer.writeBigUint64(xorResult);
    }
  }

  private static decompressValue(reader: BitReader, prevValue: number): number {
    if (reader.readBit() === 0) {
      return prevValue; // Values are identical
    }
    
    let xorResult: bigint;
    
    if (reader.readBit() === 0) {
      // Compact representation
      const leadingZeros = reader.readBits(6);
      const meaningfulBits = reader.readBits(6);
      const trailingZeros = 64 - leadingZeros - meaningfulBits;
      
      const meaningfulValue = BigInt(reader.readBits(meaningfulBits));
      xorResult = meaningfulValue << BigInt(trailingZeros);
    } else {
      // Full representation
      xorResult = reader.readBigUint64();
    }
    
    // XOR with previous value to get current value
    const prevValueBuffer = Buffer.allocUnsafe(8);
    prevValueBuffer.writeDoubleLE(prevValue, 0);
    
    const valueBuffer = Buffer.allocUnsafe(8);
    for (let i = 0; i < 8; i++) {
      const xorByte = Number((xorResult >> BigInt(i * 8)) & 0xFFn);
      valueBuffer[i] = prevValueBuffer[i] ^ xorByte;
    }
    
    return valueBuffer.readDoubleLE(0);
  }

  private static countLeadingZeros(value: bigint): number {
    let count = 0;
    for (let i = 63; i >= 0; i--) {
      if ((value & (1n << BigInt(i))) === 0n) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private static countTrailingZeros(value: bigint): number {
    let count = 0;
    for (let i = 0; i < 64; i++) {
      if ((value & (1n << BigInt(i))) === 0n) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
}

/**
 * Helper classes for bit-level operations
 */
class BitWriter {
  private buffer: number[] = [];
  private currentByte = 0;
  private bitPosition = 0;

  writeBit(bit: number): void {
    if (bit) {
      this.currentByte |= (1 << (7 - this.bitPosition));
    }
    
    this.bitPosition++;
    if (this.bitPosition === 8) {
      this.buffer.push(this.currentByte);
      this.currentByte = 0;
      this.bitPosition = 0;
    }
  }

  writeBits(value: number, bits: number): void {
    for (let i = bits - 1; i >= 0; i--) {
      this.writeBit((value >> i) & 1);
    }
  }

  writeUint64(value: number): void {
    // Handle negative values by using two's complement representation
    let bigValue = BigInt(value);
    if (bigValue < 0) {
      bigValue = BigInt(0x10000000000000000) + bigValue; // Convert to unsigned representation
    }
    
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigUInt64LE(bigValue, 0);
    
    for (let i = 0; i < 8; i++) {
      this.writeBits(buffer[i], 8);
    }
  }

  writeBigUint64(value: bigint): void {
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigUInt64LE(value, 0);
    
    for (let i = 0; i < 8; i++) {
      this.writeBits(buffer[i], 8);
    }
  }

  writeFloat64(value: number): void {
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeDoubleLE(value, 0);
    
    for (let i = 0; i < 8; i++) {
      this.writeBits(buffer[i], 8);
    }
  }

  toBuffer(): Buffer {
    if (this.bitPosition > 0) {
      this.buffer.push(this.currentByte);
    }
    return Buffer.from(this.buffer);
  }
}

class BitReader {
  private buffer: Buffer;
  private bytePosition = 0;
  private bitPosition = 0;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  readBit(): number {
    if (this.isEnd()) return 0;
    
    const bit = (this.buffer[this.bytePosition] >> (7 - this.bitPosition)) & 1;
    
    this.bitPosition++;
    if (this.bitPosition === 8) {
      this.bytePosition++;
      this.bitPosition = 0;
    }
    
    return bit;
  }

  readBits(bits: number): number {
    let value = 0;
    for (let i = 0; i < bits; i++) {
      value = (value << 1) | this.readBit();
    }
    return value;
  }

  readUint64(): number {
    const bytes = [];
    for (let i = 0; i < 8; i++) {
      bytes.push(this.readBits(8));
    }
    
    const buffer = Buffer.from(bytes);
    const bigValue = buffer.readBigUInt64LE(0);
    
    // Convert back from unsigned to signed if necessary
    if (bigValue >= 0x8000000000000000n) {
      return Number(bigValue - BigInt(0x10000000000000000));
    }
    
    return Number(bigValue);
  }

  readBigUint64(): bigint {
    const bytes = [];
    for (let i = 0; i < 8; i++) {
      bytes.push(this.readBits(8));
    }
    
    const buffer = Buffer.from(bytes);
    return buffer.readBigUInt64LE(0);
  }

  readFloat64(): number {
    const bytes = [];
    for (let i = 0; i < 8; i++) {
      bytes.push(this.readBits(8));
    }
    
    const buffer = Buffer.from(bytes);
    return buffer.readDoubleLE(0);
  }

  isEnd(): boolean {
    return this.bytePosition >= this.buffer.length;
  }
}

/**
 * Main Time-Series Database Engine
 */
export class CBDTimeSeriesEngine extends EventEmitter {
  private partitions = new Map<string, TimeSeriesPartition>();
  private retentionPolicies = new Map<string, RetentionPolicy>();
  private cache = new Map<string, TimeSeriesQueryResult>();
  private compressionStats = new Map<string, { original: number; compressed: number; ratio: number }>();
  
  private readonly options: Required<TimeSeriesEngineOptions>;

  constructor(options: TimeSeriesEngineOptions = {}) {
    super();
    
    this.options = {
      enableCompression: options.enableCompression ?? true,
      compressionAlgorithm: options.compressionAlgorithm ?? 'gorilla',
      bucketSize: options.bucketSize ?? 60 * 60 * 1000, // 1 hour default
      maxPartitionSize: options.maxPartitionSize ?? 1000000, // 1M points per partition
      enableCaching: options.enableCaching ?? true,
      cacheSize: options.cacheSize ?? 100, // 100 cached query results
      defaultRetentionPolicies: options.defaultRetentionPolicies ?? this.createDefaultRetentionPolicies(),
      enableDownsampling: options.enableDownsampling ?? true,
      enableAnalytics: options.enableAnalytics ?? true
    };

    // Initialize default retention policies
    this.setupDefaultRetentionPolicies();
  }

  /**
   * Ingest time-series data points
   */
  async ingestPoints(metricName: string, points: TimeSeriesPoint[], labels: Record<string, string> = {}): Promise<void> {
    const startTime = performance.now();
    
    // Create partition key from metric name and labels
    const partitionKey = this.createPartitionKey(metricName, labels);
    
    // Get or create partition
    let partition = this.partitions.get(partitionKey);
    if (!partition) {
      partition = this.createPartition(partitionKey, points);
      this.partitions.set(partitionKey, partition);
    }

    // Sort points by timestamp
    const sortedPoints = points.sort((a, b) => a.timestamp - b.timestamp);
    
    // Distribute points into time buckets
    for (const point of sortedPoints) {
      const bucketKey = this.getBucketKey(point.timestamp);
      
      let bucket = partition.buckets.get(bucketKey);
      if (!bucket) {
        bucket = this.createBucket(point.timestamp);
        partition.buckets.set(bucketKey, bucket);
      }
      
      bucket.points.push(point);
      partition.totalPoints++;
    }

    // Compress buckets if enabled and they exceed threshold
    if (this.options.enableCompression) {
      await this.compressBuckets(partition);
    }

    // Update partition metadata
    partition.lastAccessed = Date.now();
    
    // Emit ingestion event
    const executionTime = performance.now() - startTime;
    this.emit('dataIngested', {
      metricName,
      pointsIngested: points.length,
      partitionKey,
      executionTime
    });

    // Apply retention policies
    await this.applyRetentionPolicies();
  }

  /**
   * Query time-series data
   */
  async query(query: TimeSeriesQuery): Promise<TimeSeriesQueryResult> {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = this.createCacheKey(query);
    if (this.options.enableCaching && this.cache.has(cacheKey)) {
      const cachedResult = this.cache.get(cacheKey)!;
      cachedResult.fromCache = true;
      cachedResult.executionTime = performance.now() - startTime;
      return cachedResult;
    }

    const result: TimeSeriesQueryResult = {
      metrics: [],
      totalPoints: 0,
      executionTime: 0,
      fromCache: false,
      partitionsScanned: 0
    };

    // Find matching partitions
    const matchingPartitions = this.findMatchingPartitions(query);
    result.partitionsScanned = matchingPartitions.length;

    // Process each matching partition
    for (const partition of matchingPartitions) {
      const partitionMetrics = await this.queryPartition(partition, query);
      result.metrics.push(...partitionMetrics);
      result.totalPoints += partitionMetrics.reduce((sum, m) => sum + m.points.length, 0);
    }

    // Apply aggregations and transformations
    if (query.aggregation) {
      result.metrics = await this.applyAggregation(result.metrics, query.aggregation);
    }

    if (query.downsample) {
      result.metrics = await this.downsample(result.metrics, query.downsample);
    }

    if (query.fillGaps) {
      result.metrics = await this.fillGaps(result.metrics, query.timeRange);
    }

    // Apply ordering and limiting
    if (query.orderBy) {
      result.metrics.forEach(metric => {
        metric.points.sort((a, b) => 
          query.orderBy === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
        );
      });
    }

    if (query.limit) {
      result.metrics.forEach(metric => {
        metric.points = metric.points.slice(0, query.limit);
      });
    }

    // Calculate execution time and cache result
    result.executionTime = performance.now() - startTime;
    
    if (this.options.enableCaching) {
      this.cacheResult(cacheKey, result);
    }

    this.emit('queryExecuted', {
      query,
      result,
      executionTime: result.executionTime
    });

    return result;
  }

  /**
   * Calculate OHLC (Open, High, Low, Close) data
   */
  async calculateOHLC(metricName: string, interval: number, timeRange: { start: number; end: number }): Promise<OHLCData[]> {
    const query: TimeSeriesQuery = {
      metricName,
      timeRange,
      downsample: {
        interval,
        aggregation: 'avg' // We'll calculate OHLC manually
      }
    };

    const result = await this.query(query);
    const ohlcData: OHLCData[] = [];

    for (const metric of result.metrics) {
      const buckets = this.groupPointsByInterval(metric.points, interval);
      
      for (const [bucketStart, points] of buckets) {
        if (points.length === 0) continue;

        const values = points.map(p => p.value).sort((a, b) => a - b);
        const ohlc: OHLCData = {
          timestamp: bucketStart,
          open: points[0].value,
          high: Math.max(...values),
          low: Math.min(...values),
          close: points[points.length - 1].value,
          volume: points.length
        };

        ohlcData.push(ohlc);
      }
    }

    return ohlcData.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate moving averages
   */
  async calculateMovingAverage(metricName: string, window: number, timeRange: { start: number; end: number }): Promise<MovingAverageResult[]> {
    const query: TimeSeriesQuery = {
      metricName,
      timeRange,
      orderBy: 'asc'
    };

    const result = await this.query(query);
    const results: MovingAverageResult[] = [];

    for (const metric of result.metrics) {
      const points = metric.points;
      
      for (let i = window - 1; i < points.length; i++) {
        const windowPoints = points.slice(i - window + 1, i + 1);
        
        // Simple Moving Average
        const sma = windowPoints.reduce((sum, p) => sum + p.value, 0) / window;
        
        // Exponential Moving Average (2/(window+1) smoothing factor)
        const alpha = 2 / (window + 1);
        let ema = windowPoints[0].value;
        for (let j = 1; j < windowPoints.length; j++) {
          ema = alpha * windowPoints[j].value + (1 - alpha) * ema;
        }

        results.push({
          timestamp: points[i].timestamp,
          sma,
          ema,
          window
        });
      }
    }

    return results;
  }

  /**
   * Perform statistical analysis on time-series data
   */
  async analyzeStatistics(metricName: string, timeRange: { start: number; end: number }): Promise<TimeSeriesStatistics> {
    if (!this.options.enableAnalytics) {
      throw new Error('Analytics not enabled');
    }

    const query: TimeSeriesQuery = {
      metricName,
      timeRange
    };

    const result = await this.query(query);
    const allPoints = result.metrics.flatMap(m => m.points);
    
    if (allPoints.length === 0) {
      throw new Error('No data points found for analysis');
    }

    const values = allPoints.map(p => p.value);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate variance and standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Calculate percentiles
    const sortedValues = [...values].sort((a, b) => a - b);
    const percentiles: Record<string, number> = {
      p50: this.percentile(sortedValues, 50),
      p95: this.percentile(sortedValues, 95),
      p99: this.percentile(sortedValues, 99)
    };

    // Trend analysis (simple linear regression)
    const trend = this.calculateTrend(allPoints);
    
    // Seasonality detection (simplified)
    const seasonality = this.detectSeasonality(allPoints);
    
    // Anomaly detection
    const anomalies = this.detectAnomalies(allPoints, average, stdDev);

    return {
      count,
      sum,
      average,
      min,
      max,
      stdDev,
      variance,
      percentiles,
      trend,
      seasonality,
      anomalies
    };
  }

  /**
   * Set up retention policies
   */
  async setRetentionPolicy(policy: RetentionPolicy): Promise<void> {
    this.retentionPolicies.set(policy.name, policy);
    
    this.emit('retentionPolicySet', {
      policy,
      timestamp: Date.now()
    });
  }

  /**
   * Get engine statistics
   */
  async getEngineStats(): Promise<{
    partitions: number;
    totalPoints: number;
    compressionRatio: number;
    cacheHits: number;
    cacheMisses: number;
    memoryUsage: number;
    queriesExecuted: number;
  }> {
    const totalPoints = Array.from(this.partitions.values())
      .reduce((sum, partition) => sum + partition.totalPoints, 0);

    const totalCompressed = Array.from(this.compressionStats.values())
      .reduce((sum, stat) => sum + stat.compressed, 0);
    
    const totalOriginal = Array.from(this.compressionStats.values())
      .reduce((sum, stat) => sum + stat.original, 0);

    const compressionRatio = totalOriginal > 0 ? totalOriginal / totalCompressed : 1;

    return {
      partitions: this.partitions.size,
      totalPoints,
      compressionRatio,
      cacheHits: 0, // TODO: Implement cache hit tracking
      cacheMisses: 0, // TODO: Implement cache miss tracking  
      memoryUsage: process.memoryUsage().heapUsed,
      queriesExecuted: 0 // TODO: Implement query tracking
    };
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.partitions.clear();
    this.cache.clear();
    this.compressionStats.clear();
    
    this.emit('dataCleared', {
      timestamp: Date.now()
    });
  }

  // Private helper methods

  private createPartitionKey(metricName: string, labels: Record<string, string>): string {
    const labelsString = Object.keys(labels)
      .sort()
      .map(key => `${key}=${labels[key]}`)
      .join(',');
    return `${metricName}|${labelsString}`;
  }

  private createPartition(key: string, points: TimeSeriesPoint[]): TimeSeriesPartition {
    const timeRange = {
      start: Math.min(...points.map(p => p.timestamp)),
      end: Math.max(...points.map(p => p.timestamp))
    };

    return {
      partitionKey: key,
      timeRange,
      buckets: new Map(),
      totalPoints: 0,
      compressionRatio: 1.0,
      lastAccessed: Date.now(),
      tier: 'hot'
    };
  }

  private getBucketKey(timestamp: number): string {
    const bucketStart = Math.floor(timestamp / this.options.bucketSize) * this.options.bucketSize;
    return bucketStart.toString();
  }

  private createBucket(timestamp: number): TimeSeriesBucket {
    const bucketStart = Math.floor(timestamp / this.options.bucketSize) * this.options.bucketSize;
    const bucketEnd = bucketStart + this.options.bucketSize;

    return {
      startTime: bucketStart,
      endTime: bucketEnd,
      bucketSize: this.options.bucketSize,
      points: [],
      compressed: false
    };
  }

  private async compressBuckets(partition: TimeSeriesPartition): Promise<void> {
    for (const [bucketKey, bucket] of partition.buckets) {
      if (!bucket.compressed && bucket.points.length > 10) { // Compress buckets with >10 points
        const originalSize = bucket.points.length * 16; // Rough estimate: 8 bytes timestamp + 8 bytes value
        
        if (this.options.compressionAlgorithm === 'gorilla') {
          bucket.compressedData = GorillaCompressor.compress(bucket.points);
          bucket.compressed = true;
          bucket.compressionRatio = originalSize / bucket.compressedData.length;
          
          // Update compression stats
          this.compressionStats.set(bucketKey, {
            original: originalSize,
            compressed: bucket.compressedData.length,
            ratio: bucket.compressionRatio
          });

          // Clear uncompressed points to save memory
          bucket.points = [];
        }
      }
    }
  }

  private createCacheKey(query: TimeSeriesQuery): string {
    return JSON.stringify({
      metricName: query.metricName,
      labels: query.labels,
      timeRange: query.timeRange,
      aggregation: query.aggregation,
      downsample: query.downsample
    });
  }

  private findMatchingPartitions(query: TimeSeriesQuery): TimeSeriesPartition[] {
    const matchingPartitions: TimeSeriesPartition[] = [];

    for (const partition of this.partitions.values()) {
      // Check if partition key matches query criteria
      if (query.metricName && !partition.partitionKey.startsWith(query.metricName)) {
        continue;
      }

      // Check time range overlap
      if (partition.timeRange.end < query.timeRange.start || 
          partition.timeRange.start > query.timeRange.end) {
        continue;
      }

      matchingPartitions.push(partition);
    }

    return matchingPartitions;
  }

  private async queryPartition(partition: TimeSeriesPartition, query: TimeSeriesQuery): Promise<TimeSeriesMetrics[]> {
    const metrics: TimeSeriesMetrics[] = [];
    const allPoints: TimeSeriesPoint[] = [];

    // Collect points from relevant buckets
    for (const [bucketKey, bucket] of partition.buckets) {
      // Check if bucket overlaps with query time range
      if (bucket.endTime < query.timeRange.start || bucket.startTime > query.timeRange.end) {
        continue;
      }

      let bucketPoints: TimeSeriesPoint[];
      
      if (bucket.compressed && bucket.compressedData) {
        // Decompress data
        bucketPoints = GorillaCompressor.decompress(bucket.compressedData);
      } else {
        bucketPoints = bucket.points;
      }

      // Filter points within time range
      const filteredPoints = bucketPoints.filter(
        point => point.timestamp >= query.timeRange.start && point.timestamp <= query.timeRange.end
      );

      allPoints.push(...filteredPoints);
    }

    // Create metrics object
    if (allPoints.length > 0) {
      metrics.push({
        metricName: query.metricName || 'unknown',
        points: allPoints.sort((a, b) => a.timestamp - b.timestamp),
        labels: query.labels || {}
      });
    }

    return metrics;
  }

  private async applyAggregation(metrics: TimeSeriesMetrics[], aggregation: TimeSeriesAggregation): Promise<TimeSeriesMetrics[]> {
    const aggregatedMetrics: TimeSeriesMetrics[] = [];

    for (const metric of metrics) {
      const buckets = this.groupPointsByInterval(metric.points, aggregation.window);
      const aggregatedPoints: TimeSeriesPoint[] = [];

      for (const [bucketStart, points] of buckets) {
        if (points.length === 0) continue;

        let aggregatedValue: number;

        switch (aggregation.type) {
          case 'sum':
            aggregatedValue = points.reduce((sum, p) => sum + p.value, 0);
            break;
          case 'avg':
            aggregatedValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
            break;
          case 'min':
            aggregatedValue = Math.min(...points.map(p => p.value));
            break;
          case 'max':
            aggregatedValue = Math.max(...points.map(p => p.value));
            break;
          case 'count':
            aggregatedValue = points.length;
            break;
          case 'percentile':
            const sortedValues = points.map(p => p.value).sort((a, b) => a - b);
            aggregatedValue = this.percentile(sortedValues, aggregation.percentile || 95);
            break;
          case 'rate':
            // Calculate rate of change per second
            if (points.length < 2) {
              aggregatedValue = 0;
            } else {
              const firstPoint = points[0];
              const lastPoint = points[points.length - 1];
              const timeDiff = (lastPoint.timestamp - firstPoint.timestamp) / 1000; // Convert to seconds
              const valueDiff = lastPoint.value - firstPoint.value;
              aggregatedValue = timeDiff > 0 ? valueDiff / timeDiff : 0;
            }
            break;
          case 'derivative':
            // Simple derivative calculation
            if (points.length < 2) {
              aggregatedValue = 0;
            } else {
              const sortedPoints = points.sort((a, b) => a.timestamp - b.timestamp);
              let derivative = 0;
              for (let i = 1; i < sortedPoints.length; i++) {
                const timeDiff = (sortedPoints[i].timestamp - sortedPoints[i-1].timestamp) / 1000;
                const valueDiff = sortedPoints[i].value - sortedPoints[i-1].value;
                derivative += timeDiff > 0 ? valueDiff / timeDiff : 0;
              }
              aggregatedValue = derivative / (sortedPoints.length - 1);
            }
            break;
          default:
            aggregatedValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
        }

        aggregatedPoints.push({
          timestamp: bucketStart,
          value: aggregatedValue
        });
      }

      aggregatedMetrics.push({
        ...metric,
        points: aggregatedPoints
      });
    }

    return aggregatedMetrics;
  }

  private async downsample(metrics: TimeSeriesMetrics[], downsample: NonNullable<TimeSeriesQuery['downsample']>): Promise<TimeSeriesMetrics[]> {
    return this.applyAggregation(metrics, {
      type: downsample.aggregation,
      window: downsample.interval
    });
  }

  private async fillGaps(metrics: TimeSeriesMetrics[], timeRange: { start: number; end: number }): Promise<TimeSeriesMetrics[]> {
    const filledMetrics: TimeSeriesMetrics[] = [];

    for (const metric of metrics) {
      const points = [...metric.points].sort((a, b) => a.timestamp - b.timestamp);
      const filledPoints: TimeSeriesPoint[] = [];

      if (points.length === 0) {
        filledMetrics.push(metric);
        continue;
      }

      // Calculate average interval from the data
      let totalInterval = 0;
      for (let i = 1; i < points.length; i++) {
        totalInterval += points[i].timestamp - points[i - 1].timestamp;
      }
      const avgInterval = points.length > 1 ? totalInterval / (points.length - 1) : this.options.bucketSize;
      const gapThreshold = avgInterval * 2.5; // Consider gaps > 2.5x average interval

      // Fill gaps between points
      for (let i = 0; i < points.length - 1; i++) {
        filledPoints.push(points[i]);

        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        const gap = nextPoint.timestamp - currentPoint.timestamp;

        // If gap is larger than threshold, fill it
        if (gap > gapThreshold) {
          const steps = Math.floor(gap / avgInterval);
          
          for (let step = 1; step < steps; step++) {
            const interpolatedTimestamp = currentPoint.timestamp + (step * avgInterval);
            
            // Stop if we would go beyond the next point
            if (interpolatedTimestamp >= nextPoint.timestamp) break;
            
            // Linear interpolation
            const ratio = (interpolatedTimestamp - currentPoint.timestamp) / (nextPoint.timestamp - currentPoint.timestamp);
            const interpolatedValue = currentPoint.value + (nextPoint.value - currentPoint.value) * ratio;
            
            filledPoints.push({
              timestamp: interpolatedTimestamp,
              value: interpolatedValue,
              tags: { ...currentPoint.tags, interpolated: 'true' }
            });
          }
        }
      }

      // Add the last point
      if (points.length > 0) {
        filledPoints.push(points[points.length - 1]);
      }

      filledMetrics.push({
        ...metric,
        points: filledPoints
      });
    }

    return filledMetrics;
  }

  private cacheResult(cacheKey: string, result: TimeSeriesQueryResult): void {
    if (this.cache.size >= this.options.cacheSize) {
      // Remove oldest cache entries (simple LRU implementation)
      const keysToDelete = Array.from(this.cache.keys()).slice(0, this.cache.size - this.options.cacheSize + 1);
      keysToDelete.forEach(key => this.cache.delete(key));
    }

    // Create a deep copy to avoid reference issues
    const cachedResult: TimeSeriesQueryResult = {
      metrics: result.metrics.map(metric => ({
        ...metric,
        points: metric.points.map(point => ({ ...point }))
      })),
      totalPoints: result.totalPoints,
      executionTime: result.executionTime,
      fromCache: false, // Will be set to true when retrieved
      compressionRatio: result.compressionRatio,
      partitionsScanned: result.partitionsScanned
    };

    this.cache.set(cacheKey, cachedResult);
  }

  private groupPointsByInterval(points: TimeSeriesPoint[], interval: number): Map<number, TimeSeriesPoint[]> {
    const buckets = new Map<number, TimeSeriesPoint[]>();

    for (const point of points) {
      // Use floor to align to interval boundaries consistently
      const bucketStart = Math.floor(point.timestamp / interval) * interval;
      
      if (!buckets.has(bucketStart)) {
        buckets.set(bucketStart, []);
      }
      
      buckets.get(bucketStart)!.push(point);
    }

    return buckets;
  }

  private percentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedValues[lower];
    }
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private calculateTrend(points: TimeSeriesPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (points.length < 2) return 'stable';

    // Simple linear regression to determine trend
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.timestamp, 0);
    const sumY = points.reduce((sum, p) => sum + p.value, 0);
    const sumXY = points.reduce((sum, p) => sum + p.timestamp * p.value, 0);
    const sumXX = points.reduce((sum, p) => sum + p.timestamp * p.timestamp, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (Math.abs(slope) < 0.001) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private detectSeasonality(points: TimeSeriesPoint[]): boolean {
    if (points.length < 50) return false; // Need sufficient data for seasonality detection
    
    // Simplified seasonality detection using autocorrelation
    const values = points.map(p => p.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate various lag periods based on data frequency
    const totalTimeSpan = points[points.length - 1].timestamp - points[0].timestamp;
    const avgInterval = totalTimeSpan / (points.length - 1);
    
    // Check for patterns at different scales
    const lagPeriods = [
      Math.floor((60 * 1000) / avgInterval),        // 1-minute cycle
      Math.floor((60 * 60 * 1000) / avgInterval),   // 1-hour cycle
      Math.floor((24 * 60 * 60 * 1000) / avgInterval), // 24-hour cycle
      Math.floor((7 * 24 * 60 * 60 * 1000) / avgInterval) // Weekly cycle
    ].filter(lag => lag > 0 && lag < points.length / 3);
    
    let maxAutocorrelation = 0;
    
    for (const lag of lagPeriods) {
      const autocorr = this.calculateAutocorrelation(values, mean, lag);
      maxAutocorrelation = Math.max(maxAutocorrelation, Math.abs(autocorr));
    }
    
    // If any autocorrelation is strong (>0.3), consider it seasonal
    return maxAutocorrelation > 0.3;
  }

  private calculateAutocorrelation(values: number[], mean: number, lag: number): number {
    if (lag >= values.length) return 0;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < values.length - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectAnomalies(points: TimeSeriesPoint[], mean: number, stdDev: number): TimeSeriesPoint[] {
    const threshold = 3 * stdDev; // 3-sigma rule
    const anomalies: TimeSeriesPoint[] = [];

    for (const point of points) {
      if (Math.abs(point.value - mean) > threshold) {
        anomalies.push({
          ...point,
          tags: { 
            ...point.tags, 
            anomaly: 'statistical', 
            score: (Math.abs(point.value - mean) / threshold).toString()
          }
        });
      }
    }

    return anomalies;
  }

  private createDefaultRetentionPolicies(): RetentionPolicy[] {
    return [
      {
        name: 'raw_data',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        resolution: 1000, // 1 second
        tier: 'hot'
      },
      {
        name: 'minutely',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        resolution: 60 * 1000, // 1 minute
        aggregation: 'avg',
        tier: 'warm'
      },
      {
        name: 'hourly',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        resolution: 60 * 60 * 1000, // 1 hour
        aggregation: 'avg',
        tier: 'cold'
      }
    ];
  }

  private setupDefaultRetentionPolicies(): void {
    for (const policy of this.options.defaultRetentionPolicies) {
      this.retentionPolicies.set(policy.name, policy);
    }
  }

  private async applyRetentionPolicies(): Promise<void> {
    const now = Date.now();
    
    for (const [policyName, policy] of this.retentionPolicies) {
      const cutoffTime = now - policy.maxAge;
      
      // Remove expired partitions
      for (const [partitionKey, partition] of this.partitions) {
        if (partition.timeRange.end < cutoffTime) {
          this.partitions.delete(partitionKey);
          this.emit('partitionExpired', {
            partitionKey,
            policy: policyName,
            timestamp: now
          });
        }
      }
    }
  }
}