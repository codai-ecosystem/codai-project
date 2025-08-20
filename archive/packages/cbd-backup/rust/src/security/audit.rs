//! Audit Logging Module
//! 
//! Comprehensive audit trail for security and compliance:
//! - Immutable audit logs with digital signatures
//! - Structured event logging (authentication, authorization, data access)
//! - Compliance reporting (SOC2, HIPAA, GDPR)
//! - Real-time security monitoring and alerting

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::{Result, Context};
use sha2::{Sha256, Digest};

#[derive(Debug, Clone)]
pub struct AuditLogger {
    events: Arc<RwLock<Vec<AuditLogEntry>>>,
    retention_days: u64,
    signing_key: [u8; 32],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogEntry {
    pub id: Uuid,
    pub event: AuditEvent,
    pub timestamp: DateTime<Utc>,
    pub signature: String,
    pub hash_chain: Option<String>,
    pub metadata: AuditMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEvent {
    Authentication {
        user_id: String,
        session_id: Uuid,
        success: bool,
        ip_address: Option<String>,
        timestamp: DateTime<Utc>,
    },
    Authorization {
        user_id: String,
        session_id: Uuid,
        operation: String,
        resource: String,
        authorized: bool,
        timestamp: DateTime<Utc>,
    },
    DataAccess {
        user_id: String,
        operation: String,
        resource: String,
        record_count: Option<u64>,
        query: Option<String>,
        timestamp: DateTime<Utc>,
    },
    AdminAction {
        action: String,
        target: String,
        admin_user: String,
        timestamp: DateTime<Utc>,
    },
    SecurityViolation {
        violation_type: String,
        description: String,
        user_id: Option<String>,
        ip_address: Option<String>,
        severity: SecuritySeverity,
        timestamp: DateTime<Utc>,
    },
    SystemEvent {
        event_type: String,
        description: String,
        component: String,
        severity: SystemSeverity,
        timestamp: DateTime<Utc>,
    },
    ComplianceEvent {
        compliance_type: ComplianceType,
        action: String,
        user_id: Option<String>,
        data_category: Option<String>,
        timestamp: DateTime<Utc>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditMetadata {
    pub correlation_id: Option<Uuid>,
    pub request_id: Option<String>,
    pub user_agent: Option<String>,
    pub source_ip: Option<String>,
    pub geo_location: Option<String>,
    pub additional_context: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecuritySeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceType {
    GDPR,
    HIPAA,
    SOC2,
    PCI_DSS,
    Custom(String),
}

#[derive(Debug, Clone, Serialize)]
pub struct AuditReport {
    pub report_id: Uuid,
    pub generated_at: DateTime<Utc>,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub total_events: u64,
    pub events_by_type: HashMap<String, u64>,
    pub security_violations: u64,
    pub failed_authentications: u64,
    pub unauthorized_access_attempts: u64,
    pub compliance_events: HashMap<String, u64>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SecurityMetrics {
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub total_events: u64,
    pub authentication_success_rate: f64,
    pub authorization_success_rate: f64,
    pub security_violations_by_severity: HashMap<String, u64>,
    pub top_accessed_resources: Vec<(String, u64)>,
    pub user_activity_summary: HashMap<String, u64>,
}

impl AuditLogger {
    pub async fn new(retention_days: u64) -> Result<Self> {
        // Generate signing key for audit log integrity
        let signing_key = Self::generate_signing_key();
        
        Ok(Self {
            events: Arc::new(RwLock::new(Vec::new())),
            retention_days,
            signing_key,
        })
    }
    
    /// Log an audit event
    pub async fn log_event(&self, event: AuditEvent) -> Result<Uuid> {
        let entry_id = Uuid::new_v4();
        let timestamp = Utc::now();
        
        // Create metadata
        let metadata = AuditMetadata {
            correlation_id: Some(Uuid::new_v4()),
            request_id: None,
            user_agent: None,
            source_ip: None,
            geo_location: None,
            additional_context: HashMap::new(),
        };
        
        // Create entry
        let mut entry = AuditLogEntry {
            id: entry_id,
            event: event.clone(),
            timestamp,
            signature: String::new(),
            hash_chain: None,
            metadata,
        };
        
        // Calculate signature and hash chain
        self.sign_entry(&mut entry).await?;
        
        // Store event
        let mut events = self.events.write().await;
        events.push(entry);
        
        Ok(entry_id)
    }
    
    /// Log authentication event
    pub async fn log_authentication(
        &self,
        user_id: &str,
        session_id: Uuid,
        success: bool,
        ip_address: Option<String>,
    ) -> Result<Uuid> {
        let event = AuditEvent::Authentication {
            user_id: user_id.to_string(),
            session_id,
            success,
            ip_address,
            timestamp: Utc::now(),
        };
        
        self.log_event(event).await
    }
    
    /// Log data access event
    pub async fn log_data_access(
        &self,
        user_id: &str,
        operation: &str,
        resource: &str,
        record_count: Option<u64>,
        query: Option<String>,
    ) -> Result<Uuid> {
        let event = AuditEvent::DataAccess {
            user_id: user_id.to_string(),
            operation: operation.to_string(),
            resource: resource.to_string(),
            record_count,
            query,
            timestamp: Utc::now(),
        };
        
        self.log_event(event).await
    }
    
    /// Log security violation
    pub async fn log_security_violation(
        &self,
        violation_type: &str,
        description: &str,
        user_id: Option<String>,
        ip_address: Option<String>,
        severity: SecuritySeverity,
    ) -> Result<Uuid> {
        let event = AuditEvent::SecurityViolation {
            violation_type: violation_type.to_string(),
            description: description.to_string(),
            user_id,
            ip_address,
            severity,
            timestamp: Utc::now(),
        };
        
        self.log_event(event).await
    }
    
    /// Log compliance event
    pub async fn log_compliance_event(
        &self,
        compliance_type: ComplianceType,
        action: &str,
        user_id: Option<String>,
        data_category: Option<String>,
    ) -> Result<Uuid> {
        let event = AuditEvent::ComplianceEvent {
            compliance_type,
            action: action.to_string(),
            user_id,
            data_category,
            timestamp: Utc::now(),
        };
        
        self.log_event(event).await
    }
    
    /// Search audit events
    pub async fn search_events(
        &self,
        start_time: Option<DateTime<Utc>>,
        end_time: Option<DateTime<Utc>>,
        event_type: Option<String>,
        user_id: Option<String>,
        limit: Option<usize>,
    ) -> Result<Vec<AuditLogEntry>> {
        let events = self.events.read().await;
        
        let filtered_events: Vec<AuditLogEntry> = events
            .iter()
            .filter(|entry| {
                // Filter by time range
                if let Some(start) = start_time {
                    if entry.timestamp < start {
                        return false;
                    }
                }
                if let Some(end) = end_time {
                    if entry.timestamp > end {
                        return false;
                    }
                }
                
                // Filter by event type
                if let Some(ref event_type_filter) = event_type {
                    let entry_type = match &entry.event {
                        AuditEvent::Authentication { .. } => "Authentication",
                        AuditEvent::Authorization { .. } => "Authorization",
                        AuditEvent::DataAccess { .. } => "DataAccess",
                        AuditEvent::AdminAction { .. } => "AdminAction",
                        AuditEvent::SecurityViolation { .. } => "SecurityViolation",
                        AuditEvent::SystemEvent { .. } => "SystemEvent",
                        AuditEvent::ComplianceEvent { .. } => "ComplianceEvent",
                    };
                    if entry_type != event_type_filter {
                        return false;
                    }
                }
                
                // Filter by user ID
                if let Some(ref user_filter) = user_id {
                    let entry_user = match &entry.event {
                        AuditEvent::Authentication { user_id, .. } => Some(user_id),
                        AuditEvent::Authorization { user_id, .. } => Some(user_id),
                        AuditEvent::DataAccess { user_id, .. } => Some(user_id),
                        AuditEvent::AdminAction { admin_user, .. } => Some(admin_user),
                        AuditEvent::SecurityViolation { user_id, .. } => user_id.as_ref(),
                        AuditEvent::ComplianceEvent { user_id, .. } => user_id.as_ref(),
                        _ => None,
                    };
                    if entry_user != Some(user_filter) {
                        return false;
                    }
                }
                
                true
            })
            .take(limit.unwrap_or(1000))
            .cloned()
            .collect();
        
        Ok(filtered_events)
    }
    
    /// Generate audit report
    pub async fn generate_report(
        &self,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
    ) -> Result<AuditReport> {
        let events = self.search_events(Some(start_time), Some(end_time), None, None, None).await?;
        
        let mut events_by_type = HashMap::new();
        let mut compliance_events = HashMap::new();
        let mut security_violations = 0;
        let mut failed_authentications = 0;
        let mut unauthorized_access_attempts = 0;
        
        for event in &events {
            let event_type = match &event.event {
                AuditEvent::Authentication { success, .. } => {
                    if !success {
                        failed_authentications += 1;
                    }
                    "Authentication"
                }
                AuditEvent::Authorization { authorized, .. } => {
                    if !authorized {
                        unauthorized_access_attempts += 1;
                    }
                    "Authorization"
                }
                AuditEvent::DataAccess { .. } => "DataAccess",
                AuditEvent::AdminAction { .. } => "AdminAction",
                AuditEvent::SecurityViolation { .. } => {
                    security_violations += 1;
                    "SecurityViolation"
                }
                AuditEvent::SystemEvent { .. } => "SystemEvent",
                AuditEvent::ComplianceEvent { compliance_type, .. } => {
                    let compliance_name = match compliance_type {
                        ComplianceType::GDPR => "GDPR",
                        ComplianceType::HIPAA => "HIPAA",
                        ComplianceType::SOC2 => "SOC2",
                        ComplianceType::PCI_DSS => "PCI_DSS",
                        ComplianceType::Custom(name) => name,
                    };
                    *compliance_events.entry(compliance_name.to_string()).or_insert(0) += 1;
                    "ComplianceEvent"
                }
            };
            
            *events_by_type.entry(event_type.to_string()).or_insert(0) += 1;
        }
        
        Ok(AuditReport {
            report_id: Uuid::new_v4(),
            generated_at: Utc::now(),
            period_start: start_time,
            period_end: end_time,
            total_events: events.len() as u64,
            events_by_type,
            security_violations,
            failed_authentications,
            unauthorized_access_attempts,
            compliance_events,
        })
    }
    
    /// Get security metrics for monitoring
    pub async fn get_security_metrics(&self, hours: i64) -> Result<SecurityMetrics> {
        let end_time = Utc::now();
        let start_time = end_time - chrono::Duration::hours(hours);
        
        let events = self.search_events(Some(start_time), Some(end_time), None, None, None).await?;
        
        let mut total_auth = 0;
        let mut successful_auth = 0;
        let mut total_authz = 0;
        let mut successful_authz = 0;
        let mut violations_by_severity = HashMap::new();
        let mut resource_access = HashMap::new();
        let mut user_activity = HashMap::new();
        
        for event in &events {
            match &event.event {
                AuditEvent::Authentication { user_id, success, .. } => {
                    total_auth += 1;
                    if *success {
                        successful_auth += 1;
                    }
                    *user_activity.entry(user_id.clone()).or_insert(0) += 1;
                }
                AuditEvent::Authorization { user_id, authorized, .. } => {
                    total_authz += 1;
                    if *authorized {
                        successful_authz += 1;
                    }
                    *user_activity.entry(user_id.clone()).or_insert(0) += 1;
                }
                AuditEvent::DataAccess { user_id, resource, .. } => {
                    *resource_access.entry(resource.clone()).or_insert(0) += 1;
                    *user_activity.entry(user_id.clone()).or_insert(0) += 1;
                }
                AuditEvent::SecurityViolation { severity, .. } => {
                    let severity_name = match severity {
                        SecuritySeverity::Low => "Low",
                        SecuritySeverity::Medium => "Medium",
                        SecuritySeverity::High => "High",
                        SecuritySeverity::Critical => "Critical",
                    };
                    *violations_by_severity.entry(severity_name.to_string()).or_insert(0) += 1;
                }
                _ => {}
            }
        }
        
        let auth_success_rate = if total_auth > 0 {
            (successful_auth as f64) / (total_auth as f64)
        } else {
            1.0
        };
        
        let authz_success_rate = if total_authz > 0 {
            (successful_authz as f64) / (total_authz as f64)
        } else {
            1.0
        };
        
        // Top 10 accessed resources
        let mut top_resources: Vec<_> = resource_access.into_iter().collect();
        top_resources.sort_by(|a, b| b.1.cmp(&a.1));
        top_resources.truncate(10);
        
        Ok(SecurityMetrics {
            period_start: start_time,
            period_end: end_time,
            total_events: events.len() as u64,
            authentication_success_rate: auth_success_rate,
            authorization_success_rate: authz_success_rate,
            security_violations_by_severity: violations_by_severity,
            top_accessed_resources: top_resources,
            user_activity_summary: user_activity,
        })
    }
    
    /// Get count of failed authentication attempts
    pub async fn get_failed_auth_count(&self, hours: i64) -> Result<u64> {
        let end_time = Utc::now();
        let start_time = end_time - chrono::Duration::hours(hours);
        
        let events = self.search_events(Some(start_time), Some(end_time), None, None, None).await?;
        
        let failed_count = events
            .iter()
            .filter(|entry| {
                matches!(&entry.event, AuditEvent::Authentication { success: false, .. })
            })
            .count() as u64;
        
        Ok(failed_count)
    }
    
    /// Get count of total events in time period
    pub async fn get_events_count(&self, hours: i64) -> Result<u64> {
        let end_time = Utc::now();
        let start_time = end_time - chrono::Duration::hours(hours);
        
        let events = self.search_events(Some(start_time), Some(end_time), None, None, None).await?;
        Ok(events.len() as u64)
    }
    
    /// Get count of security violations
    pub async fn get_violations_count(&self, hours: i64) -> Result<u64> {
        let end_time = Utc::now();
        let start_time = end_time - chrono::Duration::hours(hours);
        
        let events = self.search_events(Some(start_time), Some(end_time), None, None, None).await?;
        
        let violation_count = events
            .iter()
            .filter(|entry| {
                matches!(&entry.event, AuditEvent::SecurityViolation { .. })
            })
            .count() as u64;
        
        Ok(violation_count)
    }
    
    /// Verify audit log integrity
    pub async fn verify_integrity(&self) -> Result<bool> {
        let events = self.events.read().await;
        
        let mut previous_hash = None;
        for entry in events.iter() {
            let calculated_signature = self.calculate_signature(entry, previous_hash.as_deref())?;
            if calculated_signature != entry.signature {
                return Ok(false);
            }
            previous_hash = Some(entry.signature.clone());
        }
        
        Ok(true)
    }
    
    /// Cleanup old audit events based on retention policy
    pub async fn cleanup_old_events(&self) -> Result<u32> {
        let cutoff_time = Utc::now() - chrono::Duration::days(self.retention_days as i64);
        let mut events = self.events.write().await;
        
        let initial_count = events.len();
        events.retain(|entry| entry.timestamp > cutoff_time);
        
        Ok((initial_count - events.len()) as u32)
    }
    
    fn generate_signing_key() -> [u8; 32] {
        use rand::RngCore;
        let mut key = [0u8; 32];
        rand::rngs::OsRng.fill_bytes(&mut key);
        key
    }
    
    async fn sign_entry(&self, entry: &mut AuditLogEntry) -> Result<()> {
        let previous_hash = {
            let events = self.events.read().await;
            events.last().map(|e| e.signature.clone())
        };
        
        let signature = self.calculate_signature(entry, previous_hash.as_deref())?;
        entry.signature = signature;
        entry.hash_chain = previous_hash;
        
        Ok(())
    }
    
    fn calculate_signature(&self, entry: &AuditLogEntry, previous_hash: Option<&str>) -> Result<String> {
        let mut hasher = Sha256::new();
        
        // Hash entry data
        let entry_data = serde_json::to_string(&entry.event)
            .context("Failed to serialize event")?;
        hasher.update(entry_data.as_bytes());
        hasher.update(entry.timestamp.to_rfc3339().as_bytes());
        hasher.update(&self.signing_key);
        
        // Include previous hash for chaining
        if let Some(prev_hash) = previous_hash {
            hasher.update(prev_hash.as_bytes());
        }
        
        Ok(hex::encode(hasher.finalize()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;
    
    #[tokio::test]
    async fn test_audit_logging() {
        let logger = AuditLogger::new(365).await.unwrap();
        
        // Log authentication event
        let event_id = logger.log_authentication("test_user", Uuid::new_v4(), true, Some("127.0.0.1".to_string())).await.unwrap();
        assert!(!event_id.is_nil());
        
        // Search events
        let events = logger.search_events(None, None, Some("Authentication".to_string()), Some("test_user".to_string()), None).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0].event, AuditEvent::Authentication { .. }));
    }
    
    #[tokio::test]
    async fn test_audit_report_generation() {
        let logger = AuditLogger::new(365).await.unwrap();
        
        // Log some events
        logger.log_authentication("user1", Uuid::new_v4(), true, None).await.unwrap();
        logger.log_authentication("user2", Uuid::new_v4(), false, None).await.unwrap();
        
        // Generate report
        let start_time = Utc::now() - chrono::Duration::hours(1);
        let end_time = Utc::now();
        let report = logger.generate_report(start_time, end_time).await.unwrap();
        
        assert_eq!(report.total_events, 2);
        assert_eq!(report.failed_authentications, 1);
    }
    
    #[tokio::test]
    async fn test_audit_log_integrity() {
        let logger = AuditLogger::new(365).await.unwrap();
        
        // Log multiple events to test chaining
        logger.log_authentication("user1", Uuid::new_v4(), true, None).await.unwrap();
        logger.log_data_access("user1", "read", "vectors", Some(10), None).await.unwrap();
        
        // Verify integrity
        let integrity_check = logger.verify_integrity().await.unwrap();
        assert!(integrity_check);
    }
}
