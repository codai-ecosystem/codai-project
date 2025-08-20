//! CBD Enterprise Security Framework
//! 
//! Phase 2C: Enterprise Security & Governance Implementation
//! 
//! Features:
//! - Authentication & Authorization (OAuth2, JWT, RBAC)
//! - Encryption at rest and in transit (AES-256-GCM, TLS 1.3)
//! - Audit logging and compliance tracking
//! - Key management integration
//! - Node-to-node security for distributed clusters

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::{Result, Context};

pub mod auth;
pub mod encryption;
pub mod audit;
pub mod rbac;
pub mod tls;
pub mod enterprise_security;

use auth::{AuthenticationManager, AuthToken, AuthProvider};
use encryption::{EncryptionManager, EncryptionKey};
use audit::{AuditLogger, AuditEvent};
use rbac::{RBACManager, Role, Permission};

/// Enterprise Security Manager
/// 
/// Central security orchestrator for CBD enterprise features:
/// - Authentication and authorization
/// - Data encryption and key management
/// - Audit logging and compliance
/// - Role-based access control
/// - TLS/SSL for node communications
#[derive(Clone)]
pub struct SecurityManager {
    auth_manager: Arc<AuthenticationManager>,
    encryption_manager: Arc<EncryptionManager>,
    audit_logger: Arc<AuditLogger>,
    rbac_manager: Arc<RBACManager>,
    security_config: Arc<SecurityConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// Authentication settings
    pub auth_enabled: bool,
    pub auth_providers: Vec<AuthProviderConfig>,
    pub jwt_secret: Option<String>,
    pub token_expiry_hours: u64,
    
    /// Encryption settings
    pub encryption_enabled: bool,
    pub encryption_algorithm: String,
    pub key_rotation_interval_hours: u64,
    
    /// Audit settings
    pub audit_enabled: bool,
    pub audit_events: Vec<String>,
    pub audit_retention_days: u64,
    
    /// TLS settings
    pub tls_enabled: bool,
    pub tls_cert_path: Option<String>,
    pub tls_key_path: Option<String>,
    pub mutual_tls: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthProviderConfig {
    pub provider_type: String,
    pub endpoint: String,
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Clone)]
pub struct SecurityContext {
    pub user_id: String,
    pub session_id: Uuid,
    pub roles: Vec<String>,
    pub permissions: Vec<String>,
    pub auth_timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

impl SecurityManager {
    /// Create new Security Manager with enterprise configuration
    pub async fn new(config: SecurityConfig) -> Result<Self> {
        let auth_manager = Arc::new(
            AuthenticationManager::new(&config.auth_providers).await
                .context("Failed to initialize authentication manager")?
        );
        
        let encryption_manager = Arc::new(
            EncryptionManager::new(&config.encryption_algorithm).await
                .context("Failed to initialize encryption manager")?
        );
        
        let audit_logger = Arc::new(
            AuditLogger::new(config.audit_retention_days).await
                .context("Failed to initialize audit logger")?
        );
        
        let rbac_manager = Arc::new(
            RBACManager::new().await
                .context("Failed to initialize RBAC manager")?
        );
        
        Ok(Self {
            auth_manager,
            encryption_manager,
            audit_logger,
            rbac_manager,
            security_config: Arc::new(config),
        })
    }
    
    /// Authenticate user and create security context
    pub async fn authenticate(&self, token: &str, client_info: ClientInfo) -> Result<SecurityContext> {
        if !self.security_config.auth_enabled {
            return Ok(self.create_anonymous_context());
        }
        
        // Validate authentication token
        let auth_token = self.auth_manager.validate_token(token).await
            .context("Token validation failed")?;
        
        // Get user roles and permissions
        let roles = self.rbac_manager.get_user_roles(&auth_token.user_id).await?;
        let permissions = self.rbac_manager.get_user_permissions(&auth_token.user_id).await?;
        
        // Create security context
        let context = SecurityContext {
            user_id: auth_token.user_id.clone(),
            session_id: Uuid::new_v4(),
            roles: roles.into_iter().map(|r| r.name).collect(),
            permissions: permissions.into_iter().map(|p| p.name).collect(),
            auth_timestamp: Utc::now(),
            ip_address: client_info.ip_address,
            user_agent: client_info.user_agent,
        };
        
        // Log authentication event
        self.audit_logger.log_event(AuditEvent::Authentication {
            user_id: context.user_id.clone(),
            session_id: context.session_id,
            success: true,
            ip_address: context.ip_address.clone(),
            timestamp: context.auth_timestamp,
        }).await?;
        
        Ok(context)
    }
    
    /// Authorize operation based on security context and required permissions
    pub async fn authorize(&self, context: &SecurityContext, operation: &str, resource: &str) -> Result<bool> {
        if !self.security_config.auth_enabled {
            return Ok(true);
        }
        
        let required_permissions = self.get_operation_permissions(operation, resource)?;
        let authorized = self.rbac_manager.check_permissions(&context.permissions, &required_permissions)?;
        
        // Log authorization event
        self.audit_logger.log_event(AuditEvent::Authorization {
            user_id: context.user_id.clone(),
            session_id: context.session_id,
            operation: operation.to_string(),
            resource: resource.to_string(),
            authorized,
            timestamp: Utc::now(),
        }).await?;
        
        Ok(authorized)
    }
    
    /// Encrypt data before storage
    pub async fn encrypt_data(&self, data: &[u8], key_id: &str) -> Result<Vec<u8>> {
        if !self.security_config.encryption_enabled {
            return Ok(data.to_vec());
        }
        
        self.encryption_manager.encrypt(data, key_id).await
            .context("Data encryption failed")
    }
    
    /// Decrypt data after retrieval
    pub async fn decrypt_data(&self, encrypted_data: &[u8], key_id: &str) -> Result<Vec<u8>> {
        if !self.security_config.encryption_enabled {
            return Ok(encrypted_data.to_vec());
        }
        
        self.encryption_manager.decrypt(encrypted_data, key_id).await
            .context("Data decryption failed")
    }
    
    /// Log security event for audit trail
    pub async fn log_security_event(&self, event: AuditEvent) -> Result<()> {
        if !self.security_config.audit_enabled {
            return Ok(());
        }
        
        self.audit_logger.log_event(event).await
            .context("Failed to log security event")
            .map(|_| ()) // Ignore the UUID return value
    }
    
    /// Create role with permissions
    pub async fn create_role(&self, name: String, permissions: Vec<String>) -> Result<Role> {
        let role = self.rbac_manager.create_role(name, permissions).await?;
        
        self.audit_logger.log_event(AuditEvent::AdminAction {
            action: "create_role".to_string(),
            target: role.name.clone(),
            admin_user: "system".to_string(),
            timestamp: Utc::now(),
        }).await?;
        
        Ok(role)
    }
    
    /// Assign role to user
    pub async fn assign_user_role(&self, user_id: &str, role_name: &str) -> Result<()> {
        self.rbac_manager.assign_user_role(user_id, role_name).await?;
        
        self.audit_logger.log_event(AuditEvent::AdminAction {
            action: "assign_role".to_string(),
            target: format!("user:{} role:{}", user_id, role_name),
            admin_user: "system".to_string(),
            timestamp: Utc::now(),
        }).await?;
        
        Ok(())
    }
    
    /// Get security metrics for monitoring
    pub async fn get_security_metrics(&self) -> Result<SecurityMetrics> {
        Ok(SecurityMetrics {
            active_sessions: self.auth_manager.get_active_sessions_count().await?,
            failed_auth_attempts: self.audit_logger.get_failed_auth_count(24).await?, // last 24 hours
            encryption_key_rotations: self.encryption_manager.get_key_rotation_count().await?,
            audit_events_count: self.audit_logger.get_events_count(24).await?, // last 24 hours
            security_violations: self.audit_logger.get_violations_count(24).await?, // last 24 hours
        })
    }
    
    fn create_anonymous_context(&self) -> SecurityContext {
        SecurityContext {
            user_id: "anonymous".to_string(),
            session_id: Uuid::new_v4(),
            roles: vec!["anonymous".to_string()],
            permissions: vec!["read".to_string()],
            auth_timestamp: Utc::now(),
            ip_address: None,
            user_agent: None,
        }
    }
    
    fn get_operation_permissions(&self, operation: &str, resource: &str) -> Result<Vec<String>> {
        let permissions = match (operation, resource) {
            ("read", "vectors") => vec!["vectors:read".to_string()],
            ("write", "vectors") => vec!["vectors:write".to_string()],
            ("delete", "vectors") => vec!["vectors:delete".to_string()],
            ("admin", _) => vec!["admin:all".to_string()],
            ("search", "vectors") => vec!["vectors:search".to_string()],
            ("cluster", "manage") => vec!["cluster:manage".to_string()],
            _ => vec!["default:access".to_string()],
        };
        
        Ok(permissions)
    }
}

#[derive(Debug, Clone)]
pub struct ClientInfo {
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SecurityMetrics {
    pub active_sessions: u64,
    pub failed_auth_attempts: u64,
    pub encryption_key_rotations: u64,
    pub audit_events_count: u64,
    pub security_violations: u64,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            auth_enabled: true,
            auth_providers: vec![],
            jwt_secret: None,
            token_expiry_hours: 24,
            encryption_enabled: true,
            encryption_algorithm: "AES-256-GCM".to_string(),
            key_rotation_interval_hours: 168, // 1 week
            audit_enabled: true,
            audit_events: vec![
                "authentication".to_string(),
                "authorization".to_string(),
                "data_access".to_string(),
                "admin_action".to_string(),
            ],
            audit_retention_days: 365, // 1 year
            tls_enabled: true,
            tls_cert_path: None,
            tls_key_path: None,
            mutual_tls: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;
    
    #[tokio::test]
    async fn test_security_manager_creation() {
        let config = SecurityConfig::default();
        let security_manager = SecurityManager::new(config).await;
        assert!(security_manager.is_ok());
    }
    
    #[tokio::test]
    async fn test_anonymous_authentication_disabled() {
        let mut config = SecurityConfig::default();
        config.auth_enabled = false;
        
        let security_manager = SecurityManager::new(config).await.unwrap();
        let client_info = ClientInfo {
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("test-client".to_string()),
        };
        
        let context = security_manager.authenticate("invalid_token", client_info).await.unwrap();
        assert_eq!(context.user_id, "anonymous");
        assert!(context.roles.contains(&"anonymous".to_string()));
    }
}
