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
    AuditEntry,
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
    ReportingStatus,
    ReportGenerator,
    FilingManager,
    AuditReporter,
    ComplianceReport,
    ReportType,
    RegulatoryFiling,
    FilingStatus,
};
