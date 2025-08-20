/*!
 * CBD Enterprise Security Manager
 * Enterprise-grade authentication, authorization, and encryption
 */

use cbd_core::{AuthProvider, Credentials, AuthResult, User, Permission};
use anyhow::{Result, Context};
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use std::time::{Duration, SystemTime};

/// Enterprise security manager
pub struct EnterpriseSecurityManager {
    config: SecurityConfig,
    auth_providers: std::collections::HashMap<String, Arc<dyn AuthProvider + Send + Sync>>,
    session_manager: Arc<SessionManager>,
    encryption_manager: Arc<EncryptionManager>,
    audit_logger: Arc<AuditLogger>,
    rate_limiter: Arc<RateLimiter>,
}

/// Security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub authentication: AuthenticationConfig,
    pub authorization: AuthorizationConfig,
    pub encryption: EncryptionConfig,
    pub audit: AuditConfig,
    pub rate_limiting: RateLimitingConfig,
}

/// Authentication configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationConfig {
    pub providers: Vec<AuthProviderConfig>,
    pub session_timeout_minutes: u64,
    pub max_sessions_per_user: usize,
    pub require_mfa: bool,
    pub password_policy: PasswordPolicy,
}

/// Authorization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorizationConfig {
    pub enable_rbac: bool,
    pub enable_abac: bool,
    pub default_permissions: Vec<String>,
    pub admin_roles: Vec<String>,
    pub resource_permissions: std::collections::HashMap<String, Vec<String>>,
}

/// Encryption configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionConfig {
    pub algorithm: String,
    pub key_rotation_days: u64,
    pub enable_hardware_security: bool,
    pub tls_version: String,
    pub cipher_suites: Vec<String>,
}

/// Audit configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditConfig {
    pub enable_audit_logging: bool,
    pub log_all_operations: bool,
    pub retention_days: u64,
    pub log_format: String,
    pub destinations: Vec<String>,
}

/// Rate limiting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitingConfig {
    pub enable_rate_limiting: bool,
    pub requests_per_minute: u32,
    pub burst_size: u32,
    pub block_duration_minutes: u64,
}

/// Authentication provider configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthProviderConfig {
    pub name: String,
    pub provider_type: String,
    pub enabled: bool,
    pub settings: std::collections::HashMap<String, String>,
}

/// Password policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordPolicy {
    pub min_length: usize,
    pub require_uppercase: bool,
    pub require_lowercase: bool,
    pub require_digits: bool,
    pub require_special_chars: bool,
    pub max_age_days: u64,
    pub history_count: usize,
}

/// Session manager
pub struct SessionManager {
    sessions: Arc<RwLock<std::collections::HashMap<String, Session>>>,
    config: AuthenticationConfig,
}

/// User session
#[derive(Debug, Clone)]
struct Session {
    id: String,
    user_id: Uuid,
    user: User,
    created_at: SystemTime,
    last_accessed: SystemTime,
    expires_at: SystemTime,
    ip_address: Option<String>,
    user_agent: Option<String>,
}

/// Encryption manager
pub struct EncryptionManager {
    config: EncryptionConfig,
    active_key: Vec<u8>,
    old_keys: Vec<Vec<u8>>,
}

/// Audit logger
pub struct AuditLogger {
    config: AuditConfig,
    log_buffer: Arc<RwLock<Vec<AuditLogEntry>>>,
}

/// Audit log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
struct AuditLogEntry {
    timestamp: SystemTime,
    user_id: Option<Uuid>,
    session_id: Option<String>,
    operation: String,
    resource: String,
    result: AuditResult,
    ip_address: Option<String>,
    user_agent: Option<String>,
    details: std::collections::HashMap<String, String>,
}

/// Audit result
#[derive(Debug, Clone, Serialize, Deserialize)]
enum AuditResult {
    Success,
    Failure(String),
    Denied(String),
}

/// Rate limiter
pub struct RateLimiter {
    config: RateLimitingConfig,
    buckets: Arc<RwLock<std::collections::HashMap<String, TokenBucket>>>,
}

/// Token bucket for rate limiting
#[derive(Debug, Clone)]
struct TokenBucket {
    tokens: f64,
    last_refill: SystemTime,
    capacity: f64,
    refill_rate: f64,
}

/// OAuth2 authentication provider
pub struct OAuth2Provider {
    config: OAuth2Config,
    client: reqwest::Client,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OAuth2Config {
    client_id: String,
    client_secret: String,
    auth_url: String,
    token_url: String,
    user_info_url: String,
    scopes: Vec<String>,
}

/// JWT authentication provider
pub struct JWTProvider {
    config: JWTConfig,
    encoding_key: jsonwebtoken::EncodingKey,
    decoding_key: jsonwebtoken::DecodingKey,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct JWTConfig {
    secret: String,
    algorithm: String,
    issuer: String,
    audience: String,
    expiration_minutes: u64,
}

/// LDAP authentication provider
pub struct LDAPProvider {
    config: LDAPConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LDAPConfig {
    server_url: String,
    bind_dn: String,
    bind_password: String,
    user_base_dn: String,
    group_base_dn: String,
    user_filter: String,
    group_filter: String,
}

/// API Key authentication provider
pub struct APIKeyProvider {
    keys: Arc<RwLock<std::collections::HashMap<String, APIKeyInfo>>>,
}

#[derive(Debug, Clone)]
struct APIKeyInfo {
    key_hash: String,
    user_id: Uuid,
    scopes: Vec<String>,
    created_at: SystemTime,
    expires_at: Option<SystemTime>,
    last_used: Option<SystemTime>,
}

impl EnterpriseSecurityManager {
    /// Create new security manager
    pub fn new(config: SecurityConfig) -> Result<Self> {
        let session_manager = SessionManager::new(&config.authentication)?;
        let encryption_manager = EncryptionManager::new(&config.encryption)?;
        let audit_logger = AuditLogger::new(&config.audit)?;
        let rate_limiter = RateLimiter::new(&config.rate_limiting)?;
        
        let mut auth_providers: std::collections::HashMap<String, Arc<dyn AuthProvider + Send + Sync>> = std::collections::HashMap::new();
        
        // Initialize authentication providers
        for provider_config in &config.authentication.providers {
            if !provider_config.enabled {
                continue;
            }
            
            let provider: Arc<dyn AuthProvider + Send + Sync> = match provider_config.provider_type.as_str() {
                "oauth2" => {
                    let oauth_config = OAuth2Config::from_settings(&provider_config.settings)?;
                    Arc::new(OAuth2Provider::new(oauth_config)?)
                }
                "jwt" => {
                    let jwt_config = JWTConfig::from_settings(&provider_config.settings)?;
                    Arc::new(JWTProvider::new(jwt_config)?)
                }
                "ldap" => {
                    let ldap_config = LDAPConfig::from_settings(&provider_config.settings)?;
                    Arc::new(LDAPProvider::new(ldap_config)?)
                }
                "api_key" => {
                    Arc::new(APIKeyProvider::new()?)
                }
                _ => return Err(anyhow::anyhow!("Unknown auth provider type: {}", provider_config.provider_type)),
            };
            
            auth_providers.insert(provider_config.name.clone(), provider);
        }
        
        Ok(Self {
            config,
            auth_providers,
            session_manager: Arc::new(session_manager),
            encryption_manager: Arc::new(encryption_manager),
            audit_logger: Arc::new(audit_logger),
            rate_limiter: Arc::new(rate_limiter),
        })
    }
    
    /// Authenticate user
    pub async fn authenticate(&self, provider_name: &str, credentials: &Credentials) -> Result<AuthResult> {
        // Check rate limiting
        if let Some(limit_key) = credentials.data.get("ip_address") {
            if !self.rate_limiter.check_rate_limit(limit_key).await? {
                let entry = AuditLogEntry {
                    timestamp: SystemTime::now(),
                    user_id: None,
                    session_id: None,
                    operation: "authenticate".to_string(),
                    resource: provider_name.to_string(),
                    result: AuditResult::Denied("Rate limit exceeded".to_string()),
                    ip_address: credentials.data.get("ip_address").cloned(),
                    user_agent: credentials.data.get("user_agent").cloned(),
                    details: std::collections::HashMap::new(),
                };
                self.audit_logger.log(entry).await?;
                
                return Ok(AuthResult {
                    success: false,
                    user: None,
                    token: None,
                    expires_at: None,
                });
            }
        }
        
        // Get authentication provider
        let provider = self.auth_providers.get(provider_name)
            .ok_or_else(|| anyhow::anyhow!("Auth provider not found: {}", provider_name))?;
        
        // Authenticate
        let auth_result = provider.authenticate(credentials).await?;
        
        // Create session if authentication successful
        let final_result = if auth_result.success && auth_result.user.is_some() {
            let user = auth_result.user.unwrap();
            let session = self.session_manager.create_session(
                user.clone(),
                credentials.data.get("ip_address").cloned(),
                credentials.data.get("user_agent").cloned(),
            ).await?;
            
            AuthResult {
                success: true,
                user: Some(user),
                token: Some(session.id),
                expires_at: Some(session.expires_at),
            }
        } else {
            auth_result
        };
        
        // Audit log
        let audit_result = if final_result.success {
            AuditResult::Success
        } else {
            AuditResult::Failure("Authentication failed".to_string())
        };
        
        let entry = AuditLogEntry {
            timestamp: SystemTime::now(),
            user_id: final_result.user.as_ref().map(|u| u.id),
            session_id: final_result.token.clone(),
            operation: "authenticate".to_string(),
            resource: provider_name.to_string(),
            result: audit_result,
            ip_address: credentials.data.get("ip_address").cloned(),
            user_agent: credentials.data.get("user_agent").cloned(),
            details: std::collections::HashMap::new(),
        };
        self.audit_logger.log(entry).await?;
        
        Ok(final_result)
    }
    
    /// Authorize user for resource and action
    pub async fn authorize(&self, session_token: &str, resource: &str, action: &str) -> Result<bool> {
        // Get session
        let session = self.session_manager.get_session(session_token).await?
            .ok_or_else(|| anyhow::anyhow!("Invalid session token"))?;
        
        // Check if session is still valid
        if session.expires_at < SystemTime::now() {
            return Ok(false);
        }
        
        // Role-based authorization
        if self.config.authorization.enable_rbac {
            for role in &session.user.roles {
                if self.config.authorization.admin_roles.contains(role) {
                    return Ok(true); // Admin has access to everything
                }
            }
            
            // Check resource-specific permissions
            if let Some(allowed_actions) = self.config.authorization.resource_permissions.get(resource) {
                if allowed_actions.contains(&action.to_string()) || allowed_actions.contains(&"*".to_string()) {
                    return Ok(true);
                }
            }
        }
        
        // Permission-based authorization
        for permission in &session.user.permissions {
            if permission.resource == resource || permission.resource == "*" {
                if permission.actions.contains(&action.to_string()) || permission.actions.contains(&"*".to_string()) {
                    return Ok(true);
                }
            }
        }
        
        // Audit unauthorized access attempt
        let entry = AuditLogEntry {
            timestamp: SystemTime::now(),
            user_id: Some(session.user.id),
            session_id: Some(session_token.to_string()),
            operation: action.to_string(),
            resource: resource.to_string(),
            result: AuditResult::Denied("Insufficient permissions".to_string()),
            ip_address: session.ip_address.clone(),
            user_agent: session.user_agent.clone(),
            details: std::collections::HashMap::new(),
        };
        self.audit_logger.log(entry).await?;
        
        Ok(false)
    }
    
    /// Encrypt data
    pub async fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        self.encryption_manager.encrypt(data).await
    }
    
    /// Decrypt data
    pub async fn decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>> {
        self.encryption_manager.decrypt(encrypted_data).await
    }
    
    /// Get user from session
    pub async fn get_user_from_session(&self, session_token: &str) -> Result<Option<User>> {
        if let Some(session) = self.session_manager.get_session(session_token).await? {
            if session.expires_at > SystemTime::now() {
                Ok(Some(session.user))
            } else {
                Ok(None)
            }
        } else {
            Ok(None)
        }
    }
    
    /// Logout user
    pub async fn logout(&self, session_token: &str) -> Result<()> {
        self.session_manager.destroy_session(session_token).await
    }
}

impl SessionManager {
    fn new(config: &AuthenticationConfig) -> Result<Self> {
        Ok(Self {
            sessions: Arc::new(RwLock::new(std::collections::HashMap::new())),
            config: config.clone(),
        })
    }
    
    async fn create_session(&self, user: User, ip_address: Option<String>, user_agent: Option<String>) -> Result<Session> {
        let session_id = Uuid::new_v4().to_string();
        let now = SystemTime::now();
        let expires_at = now + Duration::from_secs(self.config.session_timeout_minutes * 60);
        
        let session = Session {
            id: session_id,
            user_id: user.id,
            user,
            created_at: now,
            last_accessed: now,
            expires_at,
            ip_address,
            user_agent,
        };
        
        self.sessions.write().await.insert(session.id.clone(), session.clone());
        Ok(session)
    }
    
    async fn get_session(&self, session_id: &str) -> Result<Option<Session>> {
        let mut sessions = self.sessions.write().await;
        
        if let Some(session) = sessions.get_mut(session_id) {
            // Update last accessed time
            session.last_accessed = SystemTime::now();
            Ok(Some(session.clone()))
        } else {
            Ok(None)
        }
    }
    
    async fn destroy_session(&self, session_id: &str) -> Result<()> {
        self.sessions.write().await.remove(session_id);
        Ok(())
    }
}

impl EncryptionManager {
    fn new(config: &EncryptionConfig) -> Result<Self> {
        // Generate encryption key
        let mut key = vec![0u8; 32];
        use ring::rand::{SystemRandom, SecureRandom};
        let rng = SystemRandom::new();
        rng.fill(&mut key).map_err(|_| anyhow::anyhow!("Failed to generate encryption key"))?;
        
        Ok(Self {
            config: config.clone(),
            active_key: key,
            old_keys: Vec::new(),
        })
    }
    
    async fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        use ring::aead::{Aad, BoundKey, Nonce, NonceSequence, SealingKey, UnboundKey, AES_256_GCM, NONCE_LEN};
        
        let mut nonce_bytes = vec![0u8; NONCE_LEN];
        use ring::rand::{SystemRandom, SecureRandom};
        let rng = SystemRandom::new();
        rng.fill(&mut nonce_bytes).map_err(|_| anyhow::anyhow!("Failed to generate nonce"))?;
        
        let unbound_key = UnboundKey::new(&AES_256_GCM, &self.active_key)
            .map_err(|_| anyhow::anyhow!("Invalid encryption key"))?;
        let nonce = Nonce::try_assume_unique_for_key(&nonce_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid nonce"))?;
        let mut sealing_key = SealingKey::new(unbound_key, OneNonceSequence(Some(nonce)));
        
        let mut in_out = data.to_vec();
        sealing_key.seal_in_place_append_tag(Aad::empty(), &mut in_out)
            .map_err(|_| anyhow::anyhow!("Encryption failed"))?;
        
        // Prepend nonce to encrypted data
        let mut result = nonce_bytes;
        result.extend_from_slice(&in_out);
        
        Ok(result)
    }
    
    async fn decrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        use ring::aead::{Aad, BoundKey, Nonce, OpeningKey, UnboundKey, AES_256_GCM, NONCE_LEN};
        
        if data.len() < NONCE_LEN {
            return Err(anyhow::anyhow!("Invalid encrypted data length"));
        }
        
        let (nonce_bytes, encrypted_data) = data.split_at(NONCE_LEN);
        
        // Try with active key first
        if let Ok(result) = self.decrypt_with_key(&self.active_key, nonce_bytes, encrypted_data) {
            return Ok(result);
        }
        
        // Try with old keys for key rotation
        for old_key in &self.old_keys {
            if let Ok(result) = self.decrypt_with_key(old_key, nonce_bytes, encrypted_data) {
                return Ok(result);
            }
        }
        
        Err(anyhow::anyhow!("Decryption failed with all available keys"))
    }
    
    fn decrypt_with_key(&self, key: &[u8], nonce_bytes: &[u8], encrypted_data: &[u8]) -> Result<Vec<u8>> {
        use ring::aead::{Aad, BoundKey, Nonce, OpeningKey, UnboundKey, AES_256_GCM};
        
        let unbound_key = UnboundKey::new(&AES_256_GCM, key)
            .map_err(|_| anyhow::anyhow!("Invalid encryption key"))?;
        let nonce = Nonce::try_assume_unique_for_key(nonce_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid nonce"))?;
        let mut opening_key = OpeningKey::new(unbound_key, OneNonceSequence(Some(nonce)));
        
        let mut in_out = encrypted_data.to_vec();
        let decrypted_data = opening_key.open_in_place(Aad::empty(), &mut in_out)
            .map_err(|_| anyhow::anyhow!("Decryption failed"))?;
        
        Ok(decrypted_data.to_vec())
    }
}

impl AuditLogger {
    fn new(config: &AuditConfig) -> Result<Self> {
        Ok(Self {
            config: config.clone(),
            log_buffer: Arc::new(RwLock::new(Vec::new())),
        })
    }
    
    async fn log(&self, entry: AuditLogEntry) -> Result<()> {
        if !self.config.enable_audit_logging {
            return Ok(());
        }
        
        // Add to buffer
        self.log_buffer.write().await.push(entry.clone());
        
        // Log to configured destinations
        for destination in &self.config.destinations {
            match destination.as_str() {
                "console" => {
                    tracing::info!("AUDIT: {}", serde_json::to_string(&entry)?);
                }
                "file" => {
                    // TODO: Implement file logging
                }
                "syslog" => {
                    // TODO: Implement syslog logging
                }
                "elasticsearch" => {
                    // TODO: Implement Elasticsearch logging
                }
                _ => {
                    tracing::warn!("Unknown audit destination: {}", destination);
                }
            }
        }
        
        Ok(())
    }
}

impl RateLimiter {
    fn new(config: &RateLimitingConfig) -> Result<Self> {
        Ok(Self {
            config: config.clone(),
            buckets: Arc::new(RwLock::new(std::collections::HashMap::new())),
        })
    }
    
    async fn check_rate_limit(&self, key: &str) -> Result<bool> {
        if !self.config.enable_rate_limiting {
            return Ok(true);
        }
        
        let mut buckets = self.buckets.write().await;
        let bucket = buckets.entry(key.to_string()).or_insert_with(|| {
            TokenBucket {
                tokens: self.config.requests_per_minute as f64,
                last_refill: SystemTime::now(),
                capacity: self.config.requests_per_minute as f64,
                refill_rate: self.config.requests_per_minute as f64 / 60.0, // per second
            }
        });
        
        // Refill tokens
        let now = SystemTime::now();
        let elapsed = now.duration_since(bucket.last_refill).unwrap_or_default().as_secs_f64();
        bucket.tokens = (bucket.tokens + elapsed * bucket.refill_rate).min(bucket.capacity);
        bucket.last_refill = now;
        
        // Check if request is allowed
        if bucket.tokens >= 1.0 {
            bucket.tokens -= 1.0;
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

// Placeholder implementations for auth providers
impl OAuth2Provider {
    fn new(config: OAuth2Config) -> Result<Self> {
        Ok(Self {
            config,
            client: reqwest::Client::new(),
        })
    }
}

#[async_trait::async_trait]
impl AuthProvider for OAuth2Provider {
    async fn authenticate(&self, _credentials: &Credentials) -> Result<AuthResult> {
        // TODO: Implement OAuth2 authentication
        Ok(AuthResult {
            success: false,
            user: None,
            token: None,
            expires_at: None,
        })
    }
    
    async fn authorize(&self, _user: &User, _resource: &str, _action: &str) -> Result<bool> {
        Ok(false)
    }
}

impl JWTProvider {
    fn new(config: JWTConfig) -> Result<Self> {
        let encoding_key = jsonwebtoken::EncodingKey::from_secret(config.secret.as_bytes());
        let decoding_key = jsonwebtoken::DecodingKey::from_secret(config.secret.as_bytes());
        
        Ok(Self {
            config,
            encoding_key,
            decoding_key,
        })
    }
}

#[async_trait::async_trait]
impl AuthProvider for JWTProvider {
    async fn authenticate(&self, _credentials: &Credentials) -> Result<AuthResult> {
        // TODO: Implement JWT authentication
        Ok(AuthResult {
            success: false,
            user: None,
            token: None,
            expires_at: None,
        })
    }
    
    async fn authorize(&self, _user: &User, _resource: &str, _action: &str) -> Result<bool> {
        Ok(false)
    }
}

impl LDAPProvider {
    fn new(config: LDAPConfig) -> Result<Self> {
        Ok(Self { config })
    }
}

#[async_trait::async_trait]
impl AuthProvider for LDAPProvider {
    async fn authenticate(&self, _credentials: &Credentials) -> Result<AuthResult> {
        // TODO: Implement LDAP authentication
        Ok(AuthResult {
            success: false,
            user: None,
            token: None,
            expires_at: None,
        })
    }
    
    async fn authorize(&self, _user: &User, _resource: &str, _action: &str) -> Result<bool> {
        Ok(false)
    }
}

impl APIKeyProvider {
    fn new() -> Result<Self> {
        Ok(Self {
            keys: Arc::new(RwLock::new(std::collections::HashMap::new())),
        })
    }
}

#[async_trait::async_trait]
impl AuthProvider for APIKeyProvider {
    async fn authenticate(&self, _credentials: &Credentials) -> Result<AuthResult> {
        // TODO: Implement API key authentication
        Ok(AuthResult {
            success: false,
            user: None,
            token: None,
            expires_at: None,
        })
    }
    
    async fn authorize(&self, _user: &User, _resource: &str, _action: &str) -> Result<bool> {
        Ok(false)
    }
}

// Helper implementations
impl OAuth2Config {
    fn from_settings(settings: &std::collections::HashMap<String, String>) -> Result<Self> {
        Ok(Self {
            client_id: settings.get("client_id").cloned().unwrap_or_default(),
            client_secret: settings.get("client_secret").cloned().unwrap_or_default(),
            auth_url: settings.get("auth_url").cloned().unwrap_or_default(),
            token_url: settings.get("token_url").cloned().unwrap_or_default(),
            user_info_url: settings.get("user_info_url").cloned().unwrap_or_default(),
            scopes: settings.get("scopes").map(|s| s.split(',').map(|s| s.trim().to_string()).collect()).unwrap_or_default(),
        })
    }
}

impl JWTConfig {
    fn from_settings(settings: &std::collections::HashMap<String, String>) -> Result<Self> {
        Ok(Self {
            secret: settings.get("secret").cloned().unwrap_or_default(),
            algorithm: settings.get("algorithm").cloned().unwrap_or("HS256".to_string()),
            issuer: settings.get("issuer").cloned().unwrap_or_default(),
            audience: settings.get("audience").cloned().unwrap_or_default(),
            expiration_minutes: settings.get("expiration_minutes").and_then(|s| s.parse().ok()).unwrap_or(60),
        })
    }
}

impl LDAPConfig {
    fn from_settings(settings: &std::collections::HashMap<String, String>) -> Result<Self> {
        Ok(Self {
            server_url: settings.get("server_url").cloned().unwrap_or_default(),
            bind_dn: settings.get("bind_dn").cloned().unwrap_or_default(),
            bind_password: settings.get("bind_password").cloned().unwrap_or_default(),
            user_base_dn: settings.get("user_base_dn").cloned().unwrap_or_default(),
            group_base_dn: settings.get("group_base_dn").cloned().unwrap_or_default(),
            user_filter: settings.get("user_filter").cloned().unwrap_or_default(),
            group_filter: settings.get("group_filter").cloned().unwrap_or_default(),
        })
    }
}

struct OneNonceSequence(Option<ring::aead::Nonce>);

impl ring::aead::NonceSequence for OneNonceSequence {
    fn advance(&mut self) -> Result<ring::aead::Nonce, ring::error::Unspecified> {
        self.0.take().ok_or(ring::error::Unspecified)
    }
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            authentication: AuthenticationConfig::default(),
            authorization: AuthorizationConfig::default(),
            encryption: EncryptionConfig::default(),
            audit: AuditConfig::default(),
            rate_limiting: RateLimitingConfig::default(),
        }
    }
}

impl Default for AuthenticationConfig {
    fn default() -> Self {
        Self {
            providers: vec![],
            session_timeout_minutes: 60,
            max_sessions_per_user: 5,
            require_mfa: false,
            password_policy: PasswordPolicy::default(),
        }
    }
}

impl Default for AuthorizationConfig {
    fn default() -> Self {
        Self {
            enable_rbac: true,
            enable_abac: false,
            default_permissions: vec!["read".to_string()],
            admin_roles: vec!["admin".to_string(), "superuser".to_string()],
            resource_permissions: std::collections::HashMap::new(),
        }
    }
}

impl Default for EncryptionConfig {
    fn default() -> Self {
        Self {
            algorithm: "AES-256-GCM".to_string(),
            key_rotation_days: 90,
            enable_hardware_security: false,
            tls_version: "1.3".to_string(),
            cipher_suites: vec![
                "TLS_AES_256_GCM_SHA384".to_string(),
                "TLS_CHACHA20_POLY1305_SHA256".to_string(),
            ],
        }
    }
}

impl Default for AuditConfig {
    fn default() -> Self {
        Self {
            enable_audit_logging: true,
            log_all_operations: true,
            retention_days: 365,
            log_format: "json".to_string(),
            destinations: vec!["console".to_string()],
        }
    }
}

impl Default for RateLimitingConfig {
    fn default() -> Self {
        Self {
            enable_rate_limiting: true,
            requests_per_minute: 100,
            burst_size: 20,
            block_duration_minutes: 15,
        }
    }
}

impl Default for PasswordPolicy {
    fn default() -> Self {
        Self {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_digits: true,
            require_special_chars: true,
            max_age_days: 90,
            history_count: 5,
        }
    }
}
