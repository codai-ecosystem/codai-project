/**
 * Security Types and Interfaces for Zero Trust Architecture
 */

export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SecurityEventType {
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  THREAT_DETECTED = 'THREAT_DETECTED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  BIOMETRIC_VERIFIED = 'BIOMETRIC_VERIFIED',
  DEVICE_COMPROMISED = 'DEVICE_COMPROMISED',
  BEHAVIORAL_ANOMALY = 'BEHAVIORAL_ANOMALY',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION'
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enforcementLevel: 'strict' | 'moderate' | 'permissive';
  applicableTo: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'challenge' | 'monitor';
  priority: number;
  parameters: Record<string, any>;
}

export interface SecurityEvent {
  id?: string;
  type: SecurityEventType;
  userId: string;
  deviceId?: string;
  sessionId?: string;
  resource?: string;
  riskScore?: number;
  threatLevel?: ThreatLevel;
  details?: Record<string, any>;
  timestamp: Date;
  location?: GeolocationPosition;
  clientIP?: string;
  userAgent?: string;
  conditions?: number;
}

export interface AccessRequest {
  userId: string;
  resource: Resource;
  action: string;
  credentials: Credentials;
  deviceId: string;
  sessionId: string;
  clientIP: string;
  userAgent: string;
  timestamp: Date;
  riskLevel: ThreatLevel;
  biometricData?: BiometricData;
  mfaToken?: string;
  clientCertificate?: Certificate;
  context?: Record<string, any>;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  requiredPermissions: Permission[];
  geofencing?: GeofenceConfig;
  accessPatterns?: AccessPattern[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  expiresAt?: Date;
  grantedBy: string;
  grantedAt: Date;
}

export interface PermissionCondition {
  type: string;
  value: any;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
}

export interface Credentials {
  type: 'password' | 'token' | 'certificate' | 'biometric' | 'oauth';
  value: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  VOICE = 'voice',
  IRIS = 'iris',
  PALM = 'palm'
}

export interface BiometricData {
  type: BiometricType;
  data: string; // Base64 encoded biometric data
  quality: number; // 0-1 quality score
  timestamp: Date;
  deviceInfo: DeviceInfo;
}

export interface Certificate {
  data: string;
  type: 'x509' | 'pkcs12';
  issuer: string;
  subject: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
}

export interface BehaviorPattern {
  userId: string;
  patternType: 'typing' | 'mouse' | 'navigation' | 'temporal' | 'access';
  pattern: Record<string, any>;
  confidence: number;
  sampleSize: number;
  lastUpdated: Date;
  validUntil: Date;
}

export interface ThreatIntel {
  ipReputations: IPReputation[];
  compromisedDevices: string[];
  activeThreats: ActiveThreat[];
  behaviorAnomalies: BehaviorAnomaly[];
  lastUpdated: Date;
}

export interface IPReputation {
  ip: string;
  reputation: 'good' | 'suspicious' | 'malicious';
  score: number;
  sources: string[];
  lastSeen: Date;
  country?: string;
  asn?: string;
}

export interface ActiveThreat {
  id: string;
  type: string;
  severity: ThreatLevel;
  indicators: string[];
  affectedResources: string[];
  detectedAt: Date;
  status: 'active' | 'mitigated' | 'resolved';
}

export interface BehaviorAnomaly {
  userId: string;
  anomalyType: string;
  score: number;
  details: Record<string, any>;
  detectedAt: Date;
  status: 'investigating' | 'confirmed' | 'false_positive';
}

export interface DeviceInfo {
  id: string;
  type: 'mobile' | 'desktop' | 'tablet' | 'iot';
  os: string;
  osVersion: string;
  browser?: string;
  browserVersion?: string;
  registered: boolean;
  compromised: boolean;
  jailbroken: boolean;
  rooted: boolean;
  osOutdated: boolean;
  lastSeen: Date;
  trustScore: number;
  registeredBy: string;
  registeredAt: Date;
}

export interface GeofenceConfig {
  enabled: boolean;
  allowedRegions: GeographicRegion[];
  deniedRegions: GeographicRegion[];
  timeBasedRestrictions?: TimeRestriction[];
}

export interface GeographicRegion {
  type: 'country' | 'state' | 'city' | 'coordinates' | 'radius';
  value: string | GeographicCoordinates;
  name: string;
}

export interface GeographicCoordinates {
  latitude: number;
  longitude: number;
  radius?: number; // in meters
}

export interface TimeRestriction {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  days: number[];    // 0-6 (Sunday-Saturday)
  timezone: string;
}

export interface AccessPattern {
  userId: string;
  resourceId: string;
  pattern: {
    frequentTimes: number[]; // Hours of day (0-23)
    frequentDays: number[];  // Days of week (0-6)
    avgSessionDuration: number; // Minutes
    commonLocations: string[];
    commonDevices: string[];
  };
  confidence: number;
  lastUpdated: Date;
}

export interface SecurityMetricsSnapshot {
  timestamp: Date;
  activeUsers: number;
  activeSessions: number;
  threatLevel: ThreatLevel;
  securityEvents: SecurityEventSummary;
  riskDistribution: RiskDistribution;
  complianceScore: number;
}

export interface SecurityEventSummary {
  total: number;
  accessGranted: number;
  accessDenied: number;
  threatsDetected: number;
  anomaliesDetected: number;
  lastHour: number;
  lastDay: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// Utility types
export type SecurityLevel = 'minimal' | 'standard' | 'enhanced' | 'maximum';
export type EncryptionLevel = 'standard' | 'quantum' | 'post-quantum';
export type AuthenticationMethod = 'password' | 'mfa' | 'biometric' | 'certificate' | 'oauth';
export type MonitoringLevel = 'low' | 'medium' | 'high' | 'critical';

// Configuration interfaces
export interface SecurityConfiguration {
  zeroTrust: ZeroTrustConfiguration;
  encryption: EncryptionConfiguration;
  authentication: AuthenticationConfiguration;
  monitoring: MonitoringConfiguration;
  compliance: ComplianceConfiguration;
}

export interface ZeroTrustConfiguration {
  enabled: boolean;
  strictMode: boolean;
  continuousVerification: boolean;
  riskThreshold: number;
  sessionTimeout: number;
  deviceTrustRequired: boolean;
}

export interface EncryptionConfiguration {
  level: EncryptionLevel;
  algorithms: string[];
  keyRotationInterval: number;
  quantumResistant: boolean;
}

export interface AuthenticationConfiguration {
  methods: AuthenticationMethod[];
  mfaRequired: boolean;
  biometricRequired: boolean;
  passwordPolicy: PasswordPolicy;
  sessionManagement: SessionManagement;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  historyCount: number;
}

export interface SessionManagement {
  maxConcurrentSessions: number;
  idleTimeout: number; // minutes
  absoluteTimeout: number; // minutes
  requireReauth: boolean;
}

export interface MonitoringConfiguration {
  realTimeAnalysis: boolean;
  behaviorTracking: boolean;
  threatIntelligence: boolean;
  anomalyDetection: boolean;
  auditLogging: boolean;
  retentionPeriod: number; // days
}

export interface ComplianceConfiguration {
  frameworks: string[]; // GDPR, HIPAA, SOX, PCI-DSS, etc.
  auditingEnabled: boolean;
  dataRetention: number; // days
  encryptionRequired: boolean;
  accessLogging: boolean;
}
