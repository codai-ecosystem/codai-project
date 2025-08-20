// CBD Engine - Compliance & Governance Module
// Enterprise compliance framework for SOC2, ISO27001, GDPR, HIPAA

pub mod frameworks;
pub mod audit_trail;
pub mod data_governance;
pub mod privacy_controls;
pub mod regulatory_reporting;

pub use frameworks::{
    ComplianceFrameworkManager,
    SOC2Framework,
    ISO27001Framework,
    GDPRFramework,
    HIPAAFramework,
    ComplianceStatus,
    ComplianceLevel,
};

pub use audit_trail::{
    ImmutableAuditTrail,
    AuditBlock,
    SignedAuditBlock,
    AuditRecord,
    AuditEvent,
    IntegrityValidator,
    AuditVerificationResult,
};

pub use data_governance::{
    DataGovernanceManager,
    GovernanceStatus,
    DataClassificationEngine,
    RetentionPolicyManager,
    DataLineageTracker,
};

pub use privacy_controls::{
    PrivacyManager,
    PrivacyStatus,
    ConsentManager,
    DataSubjectRightsHandler,
    PIAManager,
    DataSubjectRights,
    PrivacyImpactAssessment,
    PIAStatus,
};

pub use regulatory_reporting::{
    RegulatoryReportingManager,
    ReportGenerator,
    FilingManager,
    AuditReporter,
    // Note: ComplianceMetricsCollector is defined in k8s_compliance.rs
};

// Kubernetes Production Compliance Integration
pub mod k8s_compliance;

pub use k8s_compliance::{
    KubernetesComplianceValidator,
    ProductionComplianceOrchestrator,
    SecurityPolicyEnforcer,
    ComplianceMonitoringAgent,
    ComplianceMetricsCollector,
    AlertManager,
    ProductionComplianceReport,
    ComplianceValidationResult,
    ComplianceViolation,
    ComplianceRecommendation,
    ProductionComplianceStatus,
    RecommendationPriority,
    ComplianceError,
};
