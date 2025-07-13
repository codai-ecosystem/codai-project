/**
 * Threat Intelligence Service
 * Real-time threat intelligence gathering and analysis
 */

import { ThreatLevel, IPReputation, ActiveThreat, ThreatIntel } from '../types/security';

export interface ThreatIntelConfig {
  sources: ThreatIntelSource[];
  updateInterval: number; // minutes
  retentionPeriod: number; // days
  confidenceThreshold: number;
  realTimeAnalysis: boolean;
}

export interface ThreatIntelSource {
  name: string;
  url: string;
  apiKey?: string;
  format: 'json' | 'xml' | 'csv';
  reliability: number; // 0-1
  updateFrequency: number; // minutes
}

export class ThreatIntelService {
  private config: ThreatIntelConfig;
  private threatData: ThreatIntel;
  private updateTimer?: NodeJS.Timeout;

  constructor(config?: Partial<ThreatIntelConfig>) {
    this.config = {
      sources: [],
      updateInterval: 30,
      retentionPeriod: 30,
      confidenceThreshold: 0.7,
      realTimeAnalysis: true,
      ...config
    };

    this.threatData = {
      ipReputations: [],
      compromisedDevices: [],
      activeThreats: [],
      behaviorAnomalies: [],
      lastUpdated: new Date()
    };

    this.startThreatIntelligenceUpdates();
  }

  /**
   * Get current threat intelligence data
   */
  getCurrentThreatIntel(): ThreatIntel {
    return this.threatData;
  }

  /**
   * Check IP reputation
   */
  async checkIPReputation(ip: string): Promise<IPReputation | null> {
    return this.threatData.ipReputations.find(rep => rep.ip === ip) || null;
  }

  /**
   * Report new threat
   */
  async reportThreat(threat: Partial<ActiveThreat>): Promise<string> {
    const threatId = `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newThreat: ActiveThreat = {
      id: threatId,
      type: threat.type || 'unknown',
      severity: threat.severity || ThreatLevel.MEDIUM,
      indicators: threat.indicators || [],
      affectedResources: threat.affectedResources || [],
      detectedAt: new Date(),
      status: 'active'
    };

    this.threatData.activeThreats.push(newThreat);

    // Trigger real-time analysis if enabled
    if (this.config.realTimeAnalysis) {
      await this.analyzeThreatImpact(newThreat);
    }

    console.log(`🚨 New threat reported: ${threatId} (${newThreat.severity})`);
    return threatId;
  }

  /**
   * Update threat status
   */
  async updateThreatStatus(threatId: string, status: 'active' | 'mitigated' | 'resolved'): Promise<boolean> {
    const threat = this.threatData.activeThreats.find(t => t.id === threatId);
    if (threat) {
      threat.status = status;
      console.log(`✅ Threat ${threatId} status updated to: ${status}`);
      return true;
    }
    return false;
  }

  /**
   * Get threats by severity
   */
  getThreatsBySeverity(severity: ThreatLevel): ActiveThreat[] {
    return this.threatData.activeThreats.filter(
      threat => threat.severity === severity && threat.status === 'active'
    );
  }

  /**
   * Start automatic threat intelligence updates
   */
  private startThreatIntelligenceUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(async () => {
      await this.updateThreatIntelligence();
    }, this.config.updateInterval * 60 * 1000);

    // Initial update
    this.updateThreatIntelligence();
  }

  /**
   * Update threat intelligence from external sources
   */
  private async updateThreatIntelligence(): Promise<void> {
    console.log('🔄 Updating threat intelligence...');

    try {
      // Update from each configured source
      for (const source of this.config.sources) {
        await this.updateFromSource(source);
      }

      // Cleanup old data
      this.cleanupOldData();

      // Update timestamp
      this.threatData.lastUpdated = new Date();

      console.log('✅ Threat intelligence updated successfully');
    } catch (error) {
      console.error('Threat intelligence update error:', error);
    }
  }

  /**
   * Update from specific threat intelligence source
   */
  private async updateFromSource(source: ThreatIntelSource): Promise<void> {
    try {
      // Simulate threat intelligence feed update
      // In real implementation, this would fetch from actual threat intel sources

      const newReputations = await this.fetchIPReputations(source);
      const newThreats = await this.fetchActiveThreats(source);

      // Merge new data with existing data
      this.mergeIPReputations(newReputations);
      this.mergeActiveThreats(newThreats);

      console.log(`📡 Updated from source: ${source.name}`);
    } catch (error) {
      console.error(`Error updating from source ${source.name}:`, error);
    }
  }

  /**
   * Simulate fetching IP reputations
   */
  private async fetchIPReputations(source: ThreatIntelSource): Promise<IPReputation[]> {
    // Simulate threat intelligence data
    return [
      {
        ip: '192.168.1.100',
        reputation: 'suspicious',
        score: 0.3,
        sources: [source.name],
        lastSeen: new Date(),
        country: 'US'
      }
    ];
  }

  /**
   * Simulate fetching active threats
   */
  private async fetchActiveThreats(source: ThreatIntelSource): Promise<ActiveThreat[]> {
    return [
      {
        id: `threat_${Date.now()}`,
        type: 'malware',
        severity: ThreatLevel.HIGH,
        indicators: ['suspicious_activity'],
        affectedResources: [],
        detectedAt: new Date(),
        status: 'active'
      }
    ];
  }

  /**
   * Merge new IP reputations with existing data
   */
  private mergeIPReputations(newReputations: IPReputation[]): void {
    for (const newRep of newReputations) {
      const existingIndex = this.threatData.ipReputations.findIndex(
        rep => rep.ip === newRep.ip
      );

      if (existingIndex >= 0) {
        // Update existing reputation
        this.threatData.ipReputations[existingIndex] = {
          ...this.threatData.ipReputations[existingIndex],
          ...newRep,
          sources: Array.from(new Set([
            ...this.threatData.ipReputations[existingIndex].sources,
            ...newRep.sources
          ]))
        };
      } else {
        // Add new reputation
        this.threatData.ipReputations.push(newRep);
      }
    }
  }

  /**
   * Merge new threats with existing data
   */
  private mergeActiveThreats(newThreats: ActiveThreat[]): void {
    for (const newThreat of newThreats) {
      const exists = this.threatData.activeThreats.some(
        threat => threat.id === newThreat.id
      );

      if (!exists) {
        this.threatData.activeThreats.push(newThreat);
      }
    }
  }

  /**
   * Clean up old threat intelligence data
   */
  private cleanupOldData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);

    // Remove old IP reputations
    this.threatData.ipReputations = this.threatData.ipReputations.filter(
      rep => rep.lastSeen > cutoffDate
    );

    // Remove resolved threats older than retention period
    this.threatData.activeThreats = this.threatData.activeThreats.filter(
      threat => threat.status === 'active' || threat.detectedAt > cutoffDate
    );
  }

  /**
   * Analyze threat impact
   */
  private async analyzeThreatImpact(threat: ActiveThreat): Promise<void> {
    // Simulate threat impact analysis
    console.log(`🔍 Analyzing impact of threat: ${threat.id}`);

    // Would implement sophisticated threat analysis here
    // - Correlate with existing threats
    // - Assess potential impact scope
    // - Generate automated responses
    // - Update risk scores for affected resources
  }

  /**
   * Get threat intelligence metrics
   */
  getThreatIntelMetrics(): ThreatIntelMetrics {
    const activeThreats = this.threatData.activeThreats.filter(t => t.status === 'active');

    return {
      totalIPReputations: this.threatData.ipReputations.length,
      maliciousIPs: this.threatData.ipReputations.filter(r => r.reputation === 'malicious').length,
      suspiciousIPs: this.threatData.ipReputations.filter(r => r.reputation === 'suspicious').length,
      activeThreats: activeThreats.length,
      criticalThreats: activeThreats.filter(t => t.severity === ThreatLevel.CRITICAL).length,
      highThreats: activeThreats.filter(t => t.severity === ThreatLevel.HIGH).length,
      compromisedDevices: this.threatData.compromisedDevices.length,
      behaviorAnomalies: this.threatData.behaviorAnomalies.length,
      lastUpdated: this.threatData.lastUpdated,
      sourcesConfigured: this.config.sources.length,
      updateInterval: this.config.updateInterval
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }
}

// Supporting interfaces
interface ThreatIntelMetrics {
  totalIPReputations: number;
  maliciousIPs: number;
  suspiciousIPs: number;
  activeThreats: number;
  criticalThreats: number;
  highThreats: number;
  compromisedDevices: number;
  behaviorAnomalies: number;
  lastUpdated: Date;
  sourcesConfigured: number;
  updateInterval: number;
}
