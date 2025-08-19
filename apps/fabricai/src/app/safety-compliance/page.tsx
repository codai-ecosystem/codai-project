'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Safety Icons
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    HardHat,
    AlertTriangle,

    // Emergency Icons
    Siren,
    Phone,
    PhoneCall,
    AlertCircle,
    Zap,
    Flame,

    // Compliance Icons
    FileCheck,
    FileText,
    ClipboardCheck,
    Award,
    Stamp,
    Badge,

    // Monitoring Icons
    Eye,
    Camera,
    Monitor,
    Activity,
    Gauge,
    Thermometer,

    // Personnel Icons
    Users,
    User,
    UserCheck,
    UserX,
    HardHat as PersonnelIcon,

    // Equipment Icons
    Wrench,
    Cog,
    Settings2,
    Factory,
    Cpu,

    // Environmental Icons
    Wind,
    Droplets,
    Sun,
    Cloud,
    Zap as Lightning,

    // Status Icons
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Timer,

    // Control Icons
    Play,
    Pause,
    Square,
    RotateCcw,
    RefreshCw,
    Settings,

    // Navigation Icons
    ChevronRight,
    ChevronLeft,
    MoreVertical,
    Plus,
    Download,
    Upload,

    // Report Icons
    FileDown,
    FileUp,
    Printer,
    Share2,
    Mail,

    // Analytics Icons
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    TrendingDown,
    Target
} from 'lucide-react'

// Enhanced Safety & Compliance Interfaces
interface SafetyIncident {
    id: string
    type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security' | 'fire' | 'chemical'
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'reported' | 'investigating' | 'action_required' | 'resolved' | 'closed'

    // Basic Information
    title: string
    description: string
    location: string
    reportedBy: string
    reportedAt: string

    // Personnel Involved
    peopleInvolved: {
        name: string
        role: string
        injuryType?: string
        injurySeverity?: 'minor' | 'moderate' | 'serious' | 'critical'
    }[]

    // Investigation
    investigator?: string
    investigationStatus: 'pending' | 'in_progress' | 'completed'
    rootCause?: string
    contributingFactors: string[]

    // Actions
    immediateActions: string[]
    correctiveActions: {
        action: string
        responsible: string
        dueDate: string
        status: 'pending' | 'in_progress' | 'completed'
    }[]

    // Follow-up
    followUpRequired: boolean
    followUpDate?: string
    lessonsLearned: string[]
}

interface SafetyMetric {
    id: string
    name: string
    category: 'incidents' | 'training' | 'compliance' | 'environmental' | 'equipment'
    value: number
    unit: string
    target: number
    trend: 'improving' | 'stable' | 'declining'
    change: number

    // Time period
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    lastUpdated: string

    // Historical data
    historical: {
        date: string
        value: number
    }[]

    // Status
    status: 'excellent' | 'good' | 'warning' | 'critical'
    threshold: {
        excellent: number
        good: number
        warning: number
    }

    // Details
    description: string
    calculation: string
}

interface ComplianceRequirement {
    id: string
    standard: string // e.g., ISO 45001, OSHA, EU Machinery Directive
    category: 'safety' | 'environmental' | 'quality' | 'data_protection' | 'industry_specific'

    // Requirement Details
    title: string
    description: string
    requirements: string[]
    applicableAreas: string[]

    // Compliance Status
    status: 'compliant' | 'partial' | 'non_compliant' | 'under_review'
    compliance_percentage: number
    lastAudit: string
    nextAudit: string

    // Documentation
    documents: {
        name: string
        type: 'policy' | 'procedure' | 'record' | 'certificate' | 'report'
        status: 'current' | 'expiring' | 'expired' | 'draft'
        expiryDate?: string
        url: string
    }[]

    // Actions Required
    actionsRequired: {
        action: string
        priority: 'low' | 'medium' | 'high' | 'critical'
        responsible: string
        dueDate: string
        status: 'pending' | 'in_progress' | 'completed'
    }[]
}

interface SafetyTraining {
    id: string
    title: string
    type: 'mandatory' | 'optional' | 'certification' | 'refresher' | 'emergency'
    category: 'general_safety' | 'equipment_specific' | 'emergency_response' | 'environmental' | 'regulatory'

    // Training Details
    description: string
    duration: number // hours
    format: 'classroom' | 'online' | 'practical' | 'blended'
    frequency: 'annual' | 'biannual' | 'quarterly' | 'monthly' | 'one_time'

    // Requirements
    requiredFor: string[] // roles or departments
    prerequisites: string[]
    certificationRequired: boolean
    certificationValidPeriod?: number // months

    // Scheduling
    nextScheduled: string
    instructor: string
    maxParticipants: number

    // Completion Tracking
    completionRate: number
    participantsCompleted: number
    participantsRequired: number

    // Status
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

interface EnvironmentalMonitoring {
    id: string
    parameter: string
    location: string
    sensorId: string

    // Current Reading
    currentValue: number
    unit: string
    timestamp: string

    // Limits
    safeLimit: number
    warningLimit: number
    criticalLimit: number

    // Status
    status: 'safe' | 'warning' | 'critical' | 'offline'
    alertActive: boolean

    // Historical Data
    readings: {
        timestamp: string
        value: number
    }[]

    // Calibration
    lastCalibration: string
    nextCalibration: string
    calibrationStatus: 'current' | 'due' | 'overdue'
}

interface EmergencyProcedure {
    id: string
    type: 'fire' | 'medical' | 'chemical_spill' | 'evacuation' | 'lockdown' | 'natural_disaster'
    title: string
    description: string

    // Response Steps
    steps: {
        order: number
        action: string
        responsible: string
        timeframe: string
    }[]

    // Emergency Contacts
    contacts: {
        role: string
        name: string
        phone: string
        backup?: string
    }[]

    // Equipment Required
    equipment: {
        item: string
        location: string
        quantity: number
        lastChecked: string
    }[]

    // Training Requirements
    trainingRequired: string[]
    lastDrill: string
    nextDrill: string

    // Status
    status: 'active' | 'under_review' | 'draft'
    lastUpdated: string
}

export default function SafetyCompliance() {
    // Safety & Compliance State
    const [selectedView, setSelectedView] = useState<'overview' | 'incidents' | 'compliance' | 'training' | 'monitoring' | 'emergency'>('overview')
    const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [selectedIncidentType, setSelectedIncidentType] = useState<'all' | 'injury' | 'near_miss' | 'property_damage'>('all')

    // Safety Metrics Data
    const [safetyMetrics] = useState<SafetyMetric[]>([
        {
            id: 'lost_time_incidents',
            name: 'Lost Time Incident Rate',
            category: 'incidents',
            value: 0.8,
            unit: 'per 200k hours',
            target: 1.0,
            trend: 'improving',
            change: -15.2,
            period: 'yearly',
            lastUpdated: '2025-08-09T06:00:00Z',
            historical: [
                { date: '2025-01', value: 1.2 },
                { date: '2025-02', value: 1.1 },
                { date: '2025-03', value: 0.9 },
                { date: '2025-04', value: 0.8 },
                { date: '2025-05', value: 0.7 },
                { date: '2025-06', value: 0.8 },
                { date: '2025-07', value: 0.8 },
                { date: '2025-08', value: 0.8 }
            ],
            status: 'excellent',
            threshold: { excellent: 1.0, good: 1.5, warning: 2.0 },
            description: 'Number of lost time incidents per 200,000 work hours',
            calculation: '(Number of Lost Time Incidents × 200,000) / Total Work Hours'
        },
        {
            id: 'training_completion',
            name: 'Safety Training Completion',
            category: 'training',
            value: 96.4,
            unit: '%',
            target: 98.0,
            trend: 'stable',
            change: 1.2,
            period: 'monthly',
            lastUpdated: '2025-08-09T06:00:00Z',
            historical: [
                { date: '2025-01', value: 94.2 },
                { date: '2025-02', value: 95.1 },
                { date: '2025-03', value: 96.8 },
                { date: '2025-04', value: 97.2 },
                { date: '2025-05', value: 96.1 },
                { date: '2025-06', value: 95.8 },
                { date: '2025-07', value: 95.2 },
                { date: '2025-08', value: 96.4 }
            ],
            status: 'good',
            threshold: { excellent: 98, good: 95, warning: 90 },
            description: 'Percentage of required safety training completed by due date',
            calculation: '(Completed Training Sessions / Required Training Sessions) × 100'
        },
        {
            id: 'compliance_score',
            name: 'Regulatory Compliance Score',
            category: 'compliance',
            value: 94.8,
            unit: '%',
            target: 100.0,
            trend: 'improving',
            change: 2.3,
            period: 'monthly',
            lastUpdated: '2025-08-09T06:00:00Z',
            historical: [
                { date: '2025-01', value: 91.5 },
                { date: '2025-02', value: 92.1 },
                { date: '2025-03', value: 93.2 },
                { date: '2025-04', value: 94.1 },
                { date: '2025-05', value: 93.8 },
                { date: '2025-06', value: 94.2 },
                { date: '2025-07', value: 92.5 },
                { date: '2025-08', value: 94.8 }
            ],
            status: 'good',
            threshold: { excellent: 98, good: 90, warning: 80 },
            description: 'Overall compliance with regulatory requirements',
            calculation: '(Compliant Requirements / Total Requirements) × 100'
        },
        {
            id: 'environmental_score',
            name: 'Environmental Compliance',
            category: 'environmental',
            value: 98.2,
            unit: '%',
            target: 99.0,
            trend: 'stable',
            change: 0.5,
            period: 'monthly',
            lastUpdated: '2025-08-09T06:00:00Z',
            historical: [
                { date: '2025-01', value: 97.8 },
                { date: '2025-02', value: 98.1 },
                { date: '2025-03', value: 98.4 },
                { date: '2025-04', value: 98.0 },
                { date: '2025-05', value: 97.9 },
                { date: '2025-06', value: 98.3 },
                { date: '2025-07', value: 97.7 },
                { date: '2025-08', value: 98.2 }
            ],
            status: 'good',
            threshold: { excellent: 99, good: 95, warning: 90 },
            description: 'Compliance with environmental regulations and standards',
            calculation: 'Weighted average of environmental monitoring parameters within limits'
        }
    ])

    // Safety Incidents Data
    const [safetyIncidents] = useState<SafetyIncident[]>([
        {
            id: 'inc-001',
            type: 'near_miss',
            severity: 'medium',
            status: 'investigating',
            title: 'Near miss - Conveyor belt safety guard',
            description: 'Worker noticed loose safety guard on conveyor belt Line C during routine maintenance',
            location: 'Packaging Line C - Station 3',
            reportedBy: 'Andrei Popescu',
            reportedAt: '2025-08-08T14:30:00Z',
            peopleInvolved: [
                { name: 'Andrei Popescu', role: 'Maintenance Technician' },
                { name: 'Maria Ionescu', role: 'Line Supervisor' }
            ],
            investigator: 'Ioana Radu',
            investigationStatus: 'in_progress',
            contributingFactors: ['Vibration loosening bolts', 'Maintenance schedule gap'],
            immediateActions: [
                'Stopped conveyor belt immediately',
                'Secured safety guard with temporary fix',
                'Isolated area until permanent repair'
            ],
            correctiveActions: [
                {
                    action: 'Replace all safety guard bolts with thread-locking compound',
                    responsible: 'Maintenance Team',
                    dueDate: '2025-08-12T00:00:00Z',
                    status: 'in_progress'
                },
                {
                    action: 'Update maintenance checklist to include safety guard inspection',
                    responsible: 'Safety Manager',
                    dueDate: '2025-08-15T00:00:00Z',
                    status: 'pending'
                }
            ],
            followUpRequired: true,
            followUpDate: '2025-08-20T00:00:00Z',
            lessonsLearned: []
        },
        {
            id: 'inc-002',
            type: 'injury',
            severity: 'low',
            status: 'resolved',
            title: 'Minor cut - Assembly Line A',
            description: 'Worker sustained minor cut on hand while handling sharp edge component',
            location: 'Assembly Line A - Station 1',
            reportedBy: 'Gabriel Neagu',
            reportedAt: '2025-08-07T10:15:00Z',
            peopleInvolved: [
                {
                    name: 'Gabriel Neagu',
                    role: 'Assembly Operator',
                    injuryType: 'Cut on left hand palm',
                    injurySeverity: 'minor'
                }
            ],
            investigator: 'Safety Manager',
            investigationStatus: 'completed',
            rootCause: 'Sharp edge on component not properly deburred',
            contributingFactors: ['Quality control oversight', 'Worker not wearing cut-resistant gloves'],
            immediateActions: [
                'First aid administered immediately',
                'Worker sent to medical facility for evaluation',
                'Area inspected for additional hazards'
            ],
            correctiveActions: [
                {
                    action: 'Improve quality control for sharp edges',
                    responsible: 'Quality Team',
                    dueDate: '2025-08-10T00:00:00Z',
                    status: 'completed'
                },
                {
                    action: 'Mandate cut-resistant gloves for all assembly workers',
                    responsible: 'Safety Manager',
                    dueDate: '2025-08-09T00:00:00Z',
                    status: 'completed'
                }
            ],
            followUpRequired: false,
            lessonsLearned: [
                'All sharp components must pass enhanced quality inspection',
                'PPE compliance monitoring needs improvement'
            ]
        }
    ])

    // Compliance Requirements Data
    const [complianceRequirements] = useState<ComplianceRequirement[]>([
        {
            id: 'iso-45001',
            standard: 'ISO 45001:2018',
            category: 'safety',
            title: 'Occupational Health and Safety Management System',
            description: 'International standard for occupational health and safety management systems',
            requirements: [
                'Establish OH&S policy and objectives',
                'Identify hazards and assess risks',
                'Implement controls and emergency procedures',
                'Monitor and measure OH&S performance',
                'Conduct internal audits and management reviews'
            ],
            applicableAreas: ['All manufacturing areas', 'Maintenance workshops', 'Quality control'],
            status: 'compliant',
            compliance_percentage: 94.8,
            lastAudit: '2025-06-15T00:00:00Z',
            nextAudit: '2025-12-15T00:00:00Z',
            documents: [
                {
                    name: 'OH&S Policy Manual',
                    type: 'policy',
                    status: 'current',
                    url: '/docs/ohs-policy.pdf'
                },
                {
                    name: 'Risk Assessment Procedures',
                    type: 'procedure',
                    status: 'current',
                    url: '/docs/risk-assessment.pdf'
                },
                {
                    name: 'ISO 45001 Certificate',
                    type: 'certificate',
                    status: 'current',
                    expiryDate: '2026-06-15T00:00:00Z',
                    url: '/docs/iso45001-cert.pdf'
                }
            ],
            actionsRequired: [
                {
                    action: 'Update emergency response procedures',
                    priority: 'medium',
                    responsible: 'Safety Manager',
                    dueDate: '2025-09-01T00:00:00Z',
                    status: 'in_progress'
                }
            ]
        },
        {
            id: 'eu-machinery',
            standard: 'EU Machinery Directive 2006/42/EC',
            category: 'safety',
            title: 'Machinery Safety Directive',
            description: 'EU directive for machinery safety requirements and CE marking',
            requirements: [
                'Perform risk assessment for all machinery',
                'Implement safety measures and protective devices',
                'Provide safety instructions and training',
                'Maintain technical documentation',
                'Ensure CE marking compliance'
            ],
            applicableAreas: ['Production equipment', 'Material handling systems', 'Maintenance tools'],
            status: 'compliant',
            compliance_percentage: 96.2,
            lastAudit: '2025-04-20T00:00:00Z',
            nextAudit: '2025-10-20T00:00:00Z',
            documents: [
                {
                    name: 'Machinery Risk Assessments',
                    type: 'record',
                    status: 'current',
                    url: '/docs/machinery-risk.pdf'
                },
                {
                    name: 'CE Declaration of Conformity',
                    type: 'certificate',
                    status: 'current',
                    url: '/docs/ce-declaration.pdf'
                }
            ],
            actionsRequired: []
        }
    ])

    // Safety Training Data
    const [safetyTraining] = useState<SafetyTraining[]>([
        {
            id: 'train-001',
            title: 'General Safety Orientation',
            type: 'mandatory',
            category: 'general_safety',
            description: 'Comprehensive safety orientation for all new employees',
            duration: 4,
            format: 'blended',
            frequency: 'one_time',
            requiredFor: ['All employees'],
            prerequisites: [],
            certificationRequired: true,
            certificationValidPeriod: 12,
            nextScheduled: '2025-08-15T09:00:00Z',
            instructor: 'Safety Manager',
            maxParticipants: 20,
            completionRate: 96.4,
            participantsCompleted: 187,
            participantsRequired: 194,
            status: 'scheduled'
        },
        {
            id: 'train-002',
            title: 'Emergency Response Procedures',
            type: 'mandatory',
            category: 'emergency_response',
            description: 'Training on fire evacuation, medical emergencies, and emergency procedures',
            duration: 2,
            format: 'practical',
            frequency: 'annual',
            requiredFor: ['All employees'],
            prerequisites: ['General Safety Orientation'],
            certificationRequired: true,
            certificationValidPeriod: 12,
            nextScheduled: '2025-08-20T14:00:00Z',
            instructor: 'Emergency Response Team',
            maxParticipants: 50,
            completionRate: 94.8,
            participantsCompleted: 184,
            participantsRequired: 194,
            status: 'scheduled'
        },
        {
            id: 'train-003',
            title: 'Machinery Safety and Lockout/Tagout',
            type: 'mandatory',
            category: 'equipment_specific',
            description: 'Safe operation of machinery and lockout/tagout procedures',
            duration: 3,
            format: 'practical',
            frequency: 'annual',
            requiredFor: ['Production operators', 'Maintenance staff'],
            prerequisites: ['General Safety Orientation'],
            certificationRequired: true,
            certificationValidPeriod: 12,
            nextScheduled: '2025-08-25T08:00:00Z',
            instructor: 'Lead Maintenance Technician',
            maxParticipants: 15,
            completionRate: 98.2,
            participantsCompleted: 108,
            participantsRequired: 110,
            status: 'scheduled'
        }
    ])

    // Environmental Monitoring Data
    const [environmentalMonitoring] = useState<EnvironmentalMonitoring[]>([
        {
            id: 'env-001',
            parameter: 'Air Quality (PM2.5)',
            location: 'Production Floor - Zone A',
            sensorId: 'AQ-001',
            currentValue: 12.3,
            unit: 'μg/m³',
            timestamp: '2025-08-09T10:00:00Z',
            safeLimit: 25,
            warningLimit: 20,
            criticalLimit: 35,
            status: 'safe',
            alertActive: false,
            readings: [
                { timestamp: '2025-08-09T06:00:00Z', value: 11.8 },
                { timestamp: '2025-08-09T07:00:00Z', value: 12.1 },
                { timestamp: '2025-08-09T08:00:00Z', value: 12.5 },
                { timestamp: '2025-08-09T09:00:00Z', value: 12.2 },
                { timestamp: '2025-08-09T10:00:00Z', value: 12.3 }
            ],
            lastCalibration: '2025-07-15T00:00:00Z',
            nextCalibration: '2025-09-15T00:00:00Z',
            calibrationStatus: 'current'
        },
        {
            id: 'env-002',
            parameter: 'Noise Level',
            location: 'Production Floor - Zone B',
            sensorId: 'NL-002',
            currentValue: 82.4,
            unit: 'dB(A)',
            timestamp: '2025-08-09T10:00:00Z',
            safeLimit: 85,
            warningLimit: 80,
            criticalLimit: 90,
            status: 'warning',
            alertActive: true,
            readings: [
                { timestamp: '2025-08-09T06:00:00Z', value: 78.2 },
                { timestamp: '2025-08-09T07:00:00Z', value: 81.5 },
                { timestamp: '2025-08-09T08:00:00Z', value: 83.1 },
                { timestamp: '2025-08-09T09:00:00Z', value: 82.8 },
                { timestamp: '2025-08-09T10:00:00Z', value: 82.4 }
            ],
            lastCalibration: '2025-07-20T00:00:00Z',
            nextCalibration: '2025-09-20T00:00:00Z',
            calibrationStatus: 'current'
        },
        {
            id: 'env-003',
            parameter: 'Temperature',
            location: 'Storage Area - Chemical Storage',
            sensorId: 'TEMP-003',
            currentValue: 22.1,
            unit: '°C',
            timestamp: '2025-08-09T10:00:00Z',
            safeLimit: 25,
            warningLimit: 23,
            criticalLimit: 30,
            status: 'safe',
            alertActive: false,
            readings: [
                { timestamp: '2025-08-09T06:00:00Z', value: 21.8 },
                { timestamp: '2025-08-09T07:00:00Z', value: 22.0 },
                { timestamp: '2025-08-09T08:00:00Z', value: 22.3 },
                { timestamp: '2025-08-09T09:00:00Z', value: 22.2 },
                { timestamp: '2025-08-09T10:00:00Z', value: 22.1 }
            ],
            lastCalibration: '2025-08-01T00:00:00Z',
            nextCalibration: '2025-10-01T00:00:00Z',
            calibrationStatus: 'current'
        }
    ])

    // Emergency Procedures Data
    const [emergencyProcedures] = useState<EmergencyProcedure[]>([
        {
            id: 'emergency-fire',
            type: 'fire',
            title: 'Fire Emergency Response',
            description: 'Comprehensive fire emergency response and evacuation procedures',
            steps: [
                { order: 1, action: 'Sound fire alarm immediately', responsible: 'Anyone discovering fire', timeframe: '0-30 seconds' },
                { order: 2, action: 'Call emergency services (112)', responsible: 'Security/Management', timeframe: '0-1 minute' },
                { order: 3, action: 'Initiate evacuation procedures', responsible: 'Floor Wardens', timeframe: '1-2 minutes' },
                { order: 4, action: 'Shut down equipment safely', responsible: 'Operators', timeframe: '1-3 minutes' },
                { order: 5, action: 'Account for all personnel at assembly point', responsible: 'Floor Wardens', timeframe: '5-10 minutes' }
            ],
            contacts: [
                { role: 'Emergency Services', name: 'Fire Department', phone: '112' },
                { role: 'Plant Manager', name: 'Ion Popescu', phone: '+40 21 123 4567', backup: '+40 21 123 4568' },
                { role: 'Safety Manager', name: 'Maria Radu', phone: '+40 21 123 4569' },
                { role: 'Security', name: 'Security Desk', phone: '+40 21 123 4570' }
            ],
            equipment: [
                { item: 'Fire Extinguishers', location: 'Each production area', quantity: 12, lastChecked: '2025-08-01T00:00:00Z' },
                { item: 'Emergency Exit Signs', location: 'All exit routes', quantity: 25, lastChecked: '2025-08-01T00:00:00Z' },
                { item: 'Fire Blankets', location: 'Kitchen and chemical areas', quantity: 4, lastChecked: '2025-08-01T00:00:00Z' }
            ],
            trainingRequired: ['Fire Warden Training', 'Emergency Response Procedures'],
            lastDrill: '2025-07-15T00:00:00Z',
            nextDrill: '2025-10-15T00:00:00Z',
            status: 'active',
            lastUpdated: '2025-08-01T00:00:00Z'
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                // Simulate real-time environmental monitoring updates
                // In production, this would connect to actual sensor data
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [realTimeMode])

    // Navigation tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: Shield },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
        { id: 'compliance', label: 'Compliance', icon: FileCheck },
        { id: 'training', label: 'Training', icon: Users },
        { id: 'monitoring', label: 'Monitoring', icon: Eye },
        { id: 'emergency', label: 'Emergency', icon: Siren }
    ]

    // Get status color and icon
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'excellent': return { color: 'text-green-600 bg-green-100', icon: CheckCircle2, label: 'Excellent' }
            case 'good': return { color: 'text-blue-600 bg-blue-100', icon: ShieldCheck, label: 'Good' }
            case 'warning': return { color: 'text-yellow-600 bg-yellow-100', icon: ShieldAlert, label: 'Warning' }
            case 'critical': return { color: 'text-red-600 bg-red-100', icon: ShieldX, label: 'Critical' }
            default: return { color: 'text-gray-600 bg-gray-100', icon: Shield, label: 'Unknown' }
        }
    }

    // Get trend icon and color
    const getTrendInfo = (trend: string) => {
        switch (trend) {
            case 'improving': return { icon: TrendingUp, color: 'text-green-600' }
            case 'declining': return { icon: TrendingDown, color: 'text-red-600' }
            default: return { icon: Activity, color: 'text-gray-600' }
        }
    }

    // Get incident severity color
    const getIncidentSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'low': return 'bg-green-100 text-green-800 border-green-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    // Calculate summary metrics
    const totalIncidents = safetyIncidents.length
    const openIncidents = safetyIncidents.filter(inc => inc.status !== 'closed').length
    const criticalIncidents = safetyIncidents.filter(inc => inc.severity === 'critical').length
    const averageComplianceScore = complianceRequirements.length > 0
        ? complianceRequirements.reduce((sum, req) => sum + req.compliance_percentage, 0) / complianceRequirements.length
        : 0
    const trainingCompletion = safetyTraining.length > 0
        ? safetyTraining.reduce((sum, training) => sum + training.completionRate, 0) / safetyTraining.length
        : 0
    const environmentalAlerts = environmentalMonitoring.filter(env => env.alertActive).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Safety & Compliance
                            </h1>
                            <p className="text-gray-600 mt-2">Workplace safety monitoring and regulatory compliance management</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedTimeframe}
                                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                                className="bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>

                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {realTimeMode ? 'Live Monitoring' : 'Static Data'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setRealTimeMode(!realTimeMode)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <Eye className={`w-4 h-4 ${realTimeMode ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 mb-6">
                    <div className="flex space-x-1 p-1">
                        {navigationTabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${selectedView === tab.id
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Overview Dashboard */}
                {selectedView === 'overview' && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Safety KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {safetyMetrics.map((metric, index) => {
                                const statusInfo = getStatusInfo(metric.status)
                                const trendInfo = getTrendInfo(metric.trend)
                                const StatusIcon = statusInfo.icon
                                const TrendIcon = trendInfo.icon

                                return (
                                    <motion.div
                                        key={metric.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-orange-800 font-semibold text-sm">{metric.name}</h3>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                <span>{statusInfo.label}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end space-x-2 mb-3">
                                            <p className="text-3xl font-bold text-orange-900">
                                                {metric.value.toFixed(1)}{metric.unit}
                                            </p>
                                            <div className={`flex items-center space-x-1 text-sm ${trendInfo.color}`}>
                                                <TrendIcon className="w-4 h-4" />
                                                <span>{Math.abs(metric.change).toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Target: {metric.target}{metric.unit}</span>
                                                <span className="font-medium">
                                                    {metric.value <= metric.target
                                                        ? `${((1 - (metric.value / metric.target)) * 100).toFixed(0)}% below target`
                                                        : `${(((metric.value / metric.target) - 1) * 100).toFixed(0)}% above target`
                                                    }
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${Math.min(
                                                            metric.value <= metric.target
                                                                ? ((metric.target - metric.value) / metric.target) * 100 + 50
                                                                : Math.max(100 - ((metric.value - metric.target) / metric.target) * 50, 20),
                                                            100
                                                        )}%`
                                                    }}
                                                    transition={{ duration: 1, delay: index * 0.2 }}
                                                    className={`h-2 rounded-full ${metric.status === 'excellent' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                            metric.status === 'good' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                                                metric.status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Safety Overview Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Incidents */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Safety Incidents</h3>
                                <div className="space-y-4">
                                    {safetyIncidents.slice(0, 3).map((incident, index) => (
                                        <motion.div
                                            key={incident.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">{incident.title}</h4>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getIncidentSeverityColor(incident.severity)}`}>
                                                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-600 mb-3">{incident.location}</p>

                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="text-gray-600">Type:</span>
                                                    <p className="font-semibold capitalize">{incident.type.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Status:</span>
                                                    <p className="font-semibold capitalize">{incident.status.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Reported by:</span>
                                                    <p className="font-semibold">{incident.reportedBy}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Date:</span>
                                                    <p className="font-semibold">
                                                        {new Date(incident.reportedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {incident.status === 'investigating' && (
                                                <div className="mt-3 flex items-center space-x-2 text-xs">
                                                    <Clock className="w-3 h-3 text-blue-500" />
                                                    <span className="text-blue-600 font-medium">Investigation in progress</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Compliance Status */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                                <div className="space-y-4">
                                    {complianceRequirements.slice(0, 2).map((compliance, index) => (
                                        <motion.div
                                            key={compliance.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900 text-sm">{compliance.standard}</h4>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${compliance.status === 'compliant' ? 'bg-green-100 text-green-700' :
                                                        compliance.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {compliance.status.charAt(0).toUpperCase() + compliance.status.slice(1)}
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-600 mb-3">{compliance.title}</p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Compliance Score</span>
                                                    <span className="font-medium">{compliance.compliance_percentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${compliance.compliance_percentage}%` }}
                                                        transition={{ duration: 1, delay: index * 0.2 }}
                                                        className={`h-2 rounded-full ${compliance.compliance_percentage >= 95 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                                compliance.compliance_percentage >= 85 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="text-gray-600">Last Audit:</span>
                                                    <p className="font-semibold">
                                                        {new Date(compliance.lastAudit).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Next Audit:</span>
                                                    <p className="font-semibold">
                                                        {new Date(compliance.nextAudit).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Environmental Monitoring */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Monitoring</h3>
                                <div className="space-y-4">
                                    {environmentalMonitoring.slice(0, 3).map((env, index) => (
                                        <motion.div
                                            key={env.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900 text-sm">{env.parameter}</h4>
                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${env.status === 'safe' ? 'bg-green-100 text-green-700' :
                                                        env.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                            env.status === 'critical' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {env.alertActive && <AlertTriangle className="w-3 h-3" />}
                                                    <span>{env.status.charAt(0).toUpperCase() + env.status.slice(1)}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-600 mb-3">{env.location}</p>

                                            <div className="text-center mb-3">
                                                <p className="text-2xl font-bold text-orange-900">
                                                    {env.currentValue} {env.unit}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Limit: {env.safeLimit} {env.unit}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Status</span>
                                                    <span className="font-medium">
                                                        {env.currentValue <= env.safeLimit ? 'Within Limits' : 'Above Limit'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((env.currentValue / env.safeLimit) * 100, 100)}%` }}
                                                        transition={{ duration: 1, delay: index * 0.2 }}
                                                        className={`h-2 rounded-full ${env.currentValue <= env.safeLimit ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                                env.currentValue <= env.warningLimit ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other views placeholder */}
                {(['incidents', 'compliance', 'training', 'monitoring', 'emergency'].includes(selectedView)) && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-200/50 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Management
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedView} management features and detailed monitoring will be implemented here.
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg inline-block">
                            Coming Soon: {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Deep Management
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
