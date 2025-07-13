/**
 * Biometric Authentication and Verification System
 * Advanced biometric security with multiple authentication factors
 */

import { BiometricData, DeviceInfo } from '../types/security';

export interface BiometricConfig {
  supportedTypes: BiometricType[];
  qualityThreshold: number;
  falseAcceptanceRate: number;
  falseRejectionRate: number;
  templateStorageEncrypted: boolean;
  antiSpoofingEnabled: boolean;
  livenessDetectionEnabled: boolean;
}

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  VOICE = 'voice',
  IRIS = 'iris',
  PALM = 'palm',
  VEIN = 'vein'
}

export interface BiometricTemplate {
  id: string;
  userId: string;
  type: BiometricType;
  template: string; // Encrypted biometric template
  quality: number;
  enrolledAt: Date;
  lastUsed: Date;
  usageCount: number;
  deviceInfo: DeviceInfo;
}

export interface BiometricVerificationResult {
  success: boolean;
  confidence: number;
  matchScore: number;
  qualityScore: number;
  livenessDetected: boolean;
  spoofingDetected: boolean;
  processingTime: number; // milliseconds
  errorMessage?: string;
}

export interface BiometricEnrollmentResult {
  success: boolean;
  templateId: string;
  quality: number;
  samples: number;
  recommendations: string[];
  errorMessage?: string;
}

export class BiometricVerifier {
  private config: BiometricConfig;
  private templates: Map<string, BiometricTemplate[]> = new Map();
  private verificationHistory: BiometricVerificationAttempt[] = [];

  constructor(config?: Partial<BiometricConfig>) {
    this.config = {
      supportedTypes: [BiometricType.FINGERPRINT, BiometricType.FACE, BiometricType.VOICE],
      qualityThreshold: 0.7,
      falseAcceptanceRate: 0.0001, // 1 in 10,000
      falseRejectionRate: 0.01,    // 1 in 100
      templateStorageEncrypted: true,
      antiSpoofingEnabled: true,
      livenessDetectionEnabled: true,
      ...config
    };
  }

  /**
   * Enroll new biometric template
   */
  async enrollBiometric(
    userId: string,
    biometricData: BiometricData,
    deviceInfo: DeviceInfo
  ): Promise<BiometricEnrollmentResult> {
    try {
      const startTime = Date.now();

      // Validate biometric type is supported
      if (!this.config.supportedTypes.includes(biometricData.type)) {
        return {
          success: false,
          templateId: '',
          quality: 0,
          samples: 0,
          recommendations: [],
          errorMessage: `Biometric type ${biometricData.type} is not supported`
        };
      }

      // Check quality threshold
      if (biometricData.quality < this.config.qualityThreshold) {
        return {
          success: false,
          templateId: '',
          quality: biometricData.quality,
          samples: 0,
          recommendations: [
            'Improve lighting conditions',
            'Clean the sensor',
            'Position correctly',
            'Hold steady during capture'
          ],
          errorMessage: `Biometric quality ${biometricData.quality} below threshold ${this.config.qualityThreshold}`
        };
      }

      // Perform liveness detection
      if (this.config.livenessDetectionEnabled) {
        const livenessResult = await this.performLivenessDetection(biometricData);
        if (!livenessResult.isLive) {
          return {
            success: false,
            templateId: '',
            quality: biometricData.quality,
            samples: 0,
            recommendations: ['Ensure you are present during capture'],
            errorMessage: 'Liveness detection failed'
          };
        }
      }

      // Generate biometric template
      const template = await this.generateBiometricTemplate(biometricData);
      const templateId = this.generateTemplateId();

      // Encrypt template if required
      const encryptedTemplate = this.config.templateStorageEncrypted
        ? await this.encryptTemplate(template)
        : template;

      // Store template
      const biometricTemplate: BiometricTemplate = {
        id: templateId,
        userId,
        type: biometricData.type,
        template: encryptedTemplate,
        quality: biometricData.quality,
        enrolledAt: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        deviceInfo
      };

      // Add to user's templates
      const userTemplates = this.templates.get(userId) || [];
      userTemplates.push(biometricTemplate);
      this.templates.set(userId, userTemplates);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Biometric enrolled: ${biometricData.type} for user ${userId} (${processingTime}ms)`);

      return {
        success: true,
        templateId,
        quality: biometricData.quality,
        samples: 1,
        recommendations: ['Biometric successfully enrolled'],
        errorMessage: undefined
      };

    } catch (error) {
      console.error('Biometric enrollment error:', error);
      return {
        success: false,
        templateId: '',
        quality: 0,
        samples: 0,
        recommendations: ['Please try again'],
        errorMessage: `Enrollment failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Verify biometric against enrolled templates
   */
  async verify(biometricData: BiometricData, userId: string): Promise<BiometricVerificationResult> {
    const startTime = Date.now();

    try {
      // Get user's enrolled templates
      const userTemplates = this.templates.get(userId) || [];
      const matchingTypeTemplates = userTemplates.filter(t => t.type === biometricData.type);

      if (matchingTypeTemplates.length === 0) {
        return this.createFailureResult(startTime, 'No enrolled templates found for this biometric type');
      }

      // Check quality threshold
      if (biometricData.quality < this.config.qualityThreshold) {
        return this.createFailureResult(startTime, 'Biometric quality below threshold');
      }

      // Perform anti-spoofing detection
      if (this.config.antiSpoofingEnabled) {
        const spoofingResult = await this.performAntiSpoofingDetection(biometricData);
        if (spoofingResult.spoofingDetected) {
          this.logSecurityEvent('SPOOFING_DETECTED', userId, biometricData.type);
          return this.createFailureResult(startTime, 'Spoofing attempt detected', true);
        }
      }

      // Perform liveness detection
      let livenessDetected = true;
      if (this.config.livenessDetectionEnabled) {
        const livenessResult = await this.performLivenessDetection(biometricData);
        livenessDetected = livenessResult.isLive;
        if (!livenessDetected) {
          return this.createFailureResult(startTime, 'Liveness detection failed');
        }
      }

      // Generate template for comparison
      const candidateTemplate = await this.generateBiometricTemplate(biometricData);

      // Find best match among enrolled templates
      let bestMatch = { score: 0, template: null as BiometricTemplate | null };

      for (const enrolledTemplate of matchingTypeTemplates) {
        const decryptedTemplate = this.config.templateStorageEncrypted
          ? await this.decryptTemplate(enrolledTemplate.template)
          : enrolledTemplate.template;

        const matchScore = await this.compareTemplates(candidateTemplate, decryptedTemplate, biometricData.type);

        if (matchScore > bestMatch.score) {
          bestMatch = { score: matchScore, template: enrolledTemplate };
        }
      }

      // Determine if verification successful
      const threshold = this.getVerificationThreshold(biometricData.type);
      const success = bestMatch.score >= threshold;

      if (success && bestMatch.template) {
        // Update template usage
        bestMatch.template.lastUsed = new Date();
        bestMatch.template.usageCount++;
      }

      // Log verification attempt
      this.logVerificationAttempt({
        userId,
        biometricType: biometricData.type,
        success,
        matchScore: bestMatch.score,
        quality: biometricData.quality,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
        deviceInfo: biometricData.deviceInfo
      });

      const processingTime = Date.now() - startTime;

      return {
        success,
        confidence: this.calculateConfidence(bestMatch.score, biometricData.quality),
        matchScore: bestMatch.score,
        qualityScore: biometricData.quality,
        livenessDetected,
        spoofingDetected: false,
        processingTime,
        errorMessage: success ? undefined : 'Biometric verification failed'
      };

    } catch (error) {
      console.error('Biometric verification error:', error);
      return this.createFailureResult(startTime, `Verification error: ${(error as Error).message}`);
    }
  }

  /**
   * Get biometric verification metrics
   */
  getBiometricMetrics(): BiometricMetrics {
    const totalAttempts = this.verificationHistory.length;
    const successfulAttempts = this.verificationHistory.filter(a => a.success).length;
    const recentAttempts = this.verificationHistory.filter(
      a => Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    const averageProcessingTime = totalAttempts > 0
      ? this.verificationHistory.reduce((sum, a) => sum + a.processingTime, 0) / totalAttempts
      : 0;

    const typeDistribution = this.calculateTypeDistribution();
    const qualityDistribution = this.calculateQualityDistribution();

    return {
      totalTemplates: Array.from(this.templates.values()).flat().length,
      totalUsers: this.templates.size,
      totalAttempts,
      successfulAttempts,
      successRate: totalAttempts > 0 ? successfulAttempts / totalAttempts : 0,
      recentAttempts,
      averageProcessingTime,
      supportedTypes: this.config.supportedTypes,
      qualityThreshold: this.config.qualityThreshold,
      typeDistribution,
      qualityDistribution,
      securityFeatures: {
        antiSpoofingEnabled: this.config.antiSpoofingEnabled,
        livenessDetectionEnabled: this.config.livenessDetectionEnabled,
        templateEncryption: this.config.templateStorageEncrypted
      }
    };
  }

  // Private methods

  private async performLivenessDetection(biometricData: BiometricData): Promise<{ isLive: boolean; confidence: number }> {
    // Simulate liveness detection
    // In real implementation, this would use advanced algorithms for each biometric type

    switch (biometricData.type) {
      case BiometricType.FACE:
        return await this.performFaceLivenessDetection(biometricData);
      case BiometricType.FINGERPRINT:
        return await this.performFingerprintLivenessDetection(biometricData);
      case BiometricType.VOICE:
        return await this.performVoiceLivenessDetection(biometricData);
      default:
        return { isLive: true, confidence: 0.8 };
    }
  }

  private async performAntiSpoofingDetection(biometricData: BiometricData): Promise<{ spoofingDetected: boolean; confidence: number }> {
    // Simulate anti-spoofing detection
    // Real implementation would analyze biometric data for spoofing attempts

    // Check for common spoofing indicators
    const spoofingScore = Math.random(); // Simulate spoofing detection
    const threshold = 0.1; // Low threshold for high security

    return {
      spoofingDetected: spoofingScore < threshold,
      confidence: 1 - spoofingScore
    };
  }

  private async generateBiometricTemplate(biometricData: BiometricData): Promise<string> {
    // Simulate template generation
    // Real implementation would extract features and create template
    const hash = await this.hashBiometricData(biometricData.data);
    return `template_${biometricData.type}_${hash}`;
  }

  private async compareTemplates(template1: string, template2: string, type: BiometricType): Promise<number> {
    // Simulate template matching
    // Real implementation would use sophisticated matching algorithms

    if (template1 === template2) return 1.0;

    // Calculate similarity based on string similarity (simplified)
    const similarity = this.calculateStringSimilarity(template1, template2);

    // Apply type-specific matching logic
    switch (type) {
      case BiometricType.FINGERPRINT:
        return Math.max(0, similarity * 1.1 - 0.1); // Fingerprints tend to be more reliable
      case BiometricType.FACE:
        return Math.max(0, similarity * 0.9 + 0.05); // Face recognition can be less precise
      case BiometricType.VOICE:
        return Math.max(0, similarity * 0.8 + 0.1); // Voice can vary
      default:
        return similarity;
    }
  }

  private getVerificationThreshold(type: BiometricType): number {
    switch (type) {
      case BiometricType.FINGERPRINT: return 0.8;
      case BiometricType.FACE: return 0.75;
      case BiometricType.VOICE: return 0.7;
      case BiometricType.IRIS: return 0.9;
      case BiometricType.PALM: return 0.85;
      default: return 0.8;
    }
  }

  private calculateConfidence(matchScore: number, qualityScore: number): number {
    return (matchScore * 0.7 + qualityScore * 0.3);
  }

  private createFailureResult(
    startTime: number,
    message: string,
    spoofingDetected: boolean = false
  ): BiometricVerificationResult {
    return {
      success: false,
      confidence: 0,
      matchScore: 0,
      qualityScore: 0,
      livenessDetected: !spoofingDetected,
      spoofingDetected,
      processingTime: Date.now() - startTime,
      errorMessage: message
    };
  }

  private async encryptTemplate(template: string): Promise<string> {
    // Simulate template encryption
    return Buffer.from(template).toString('base64');
  }

  private async decryptTemplate(encryptedTemplate: string): Promise<string> {
    // Simulate template decryption
    return Buffer.from(encryptedTemplate, 'base64').toString();
  }

  private async hashBiometricData(data: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.calculateLevenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async performFaceLivenessDetection(biometricData: BiometricData): Promise<{ isLive: boolean; confidence: number }> {
    // Simulate face liveness detection (eye movement, expression, etc.)
    return { isLive: Math.random() > 0.1, confidence: 0.9 };
  }

  private async performFingerprintLivenessDetection(biometricData: BiometricData): Promise<{ isLive: boolean; confidence: number }> {
    // Simulate fingerprint liveness detection (pulse, temperature, etc.)
    return { isLive: Math.random() > 0.05, confidence: 0.95 };
  }

  private async performVoiceLivenessDetection(biometricData: BiometricData): Promise<{ isLive: boolean; confidence: number }> {
    // Simulate voice liveness detection (challenge-response, etc.)
    return { isLive: Math.random() > 0.15, confidence: 0.85 };
  }

  private generateTemplateId(): string {
    return `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logVerificationAttempt(attempt: BiometricVerificationAttempt): void {
    this.verificationHistory.push(attempt);

    // Keep only recent attempts (last 30 days)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.verificationHistory = this.verificationHistory.filter(
      a => a.timestamp.getTime() > cutoff
    );
  }

  private logSecurityEvent(event: string, userId: string, biometricType: BiometricType): void {
    console.warn(`🚨 Security Event: ${event} - User: ${userId}, Type: ${biometricType}`);
  }

  private calculateTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    const allTemplates = Array.from(this.templates.values()).flat();

    for (const template of allTemplates) {
      distribution[template.type] = (distribution[template.type] || 0) + 1;
    }

    return distribution;
  }

  private calculateQualityDistribution(): { high: number; medium: number; low: number } {
    const allTemplates = Array.from(this.templates.values()).flat();
    const distribution = { high: 0, medium: 0, low: 0 };

    for (const template of allTemplates) {
      if (template.quality >= 0.8) distribution.high++;
      else if (template.quality >= 0.6) distribution.medium++;
      else distribution.low++;
    }

    return distribution;
  }
}

// Supporting interfaces
interface BiometricVerificationAttempt {
  userId: string;
  biometricType: BiometricType;
  success: boolean;
  matchScore: number;
  quality: number;
  timestamp: Date;
  processingTime: number;
  deviceInfo: DeviceInfo;
}

interface BiometricMetrics {
  totalTemplates: number;
  totalUsers: number;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
  recentAttempts: number;
  averageProcessingTime: number;
  supportedTypes: BiometricType[];
  qualityThreshold: number;
  typeDistribution: Record<string, number>;
  qualityDistribution: { high: number; medium: number; low: number };
  securityFeatures: {
    antiSpoofingEnabled: boolean;
    livenessDetectionEnabled: boolean;
    templateEncryption: boolean;
  };
}
