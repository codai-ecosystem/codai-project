//! Authentication Module
//! 
//! Handles user authentication through multiple providers:
//! - OAuth2 (Google, GitHub, Azure AD)
//! - JWT tokens
//! - API keys
//! - mTLS certificates

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use anyhow::{Result, Context, anyhow};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

use crate::security::AuthProviderConfig;

#[derive(Debug, Clone)]
pub struct AuthenticationManager {
    providers: Arc<RwLock<HashMap<String, AuthProvider>>>,
    active_sessions: Arc<RwLock<HashMap<Uuid, AuthSession>>>,
    jwt_secret: String,
}

#[derive(Debug, Clone)]
pub enum AuthProvider {
    OAuth2 {
        client_id: String,
        client_secret: String,
        auth_url: String,
        token_url: String,
    },
    JWT {
        secret: String,
        algorithm: Algorithm,
    },
    ApiKey {
        keys: HashMap<String, ApiKeyInfo>,
    },
    MTLS {
        ca_cert_path: String,
        verify_client: bool,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthToken {
    pub token_id: Uuid,
    pub user_id: String,
    pub issued_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub scope: Vec<String>,
    pub provider: String,
}

#[derive(Debug, Clone)]
pub struct AuthSession {
    pub session_id: Uuid,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ApiKeyInfo {
    pub key_id: String,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub permissions: Vec<String>,
    pub rate_limit: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,    // user_id
    pub exp: i64,       // expiration timestamp
    pub iat: i64,       // issued at timestamp
    pub jti: String,    // token ID
    pub scope: Vec<String>,
}

impl AuthenticationManager {
    pub async fn new(provider_configs: &[AuthProviderConfig]) -> Result<Self> {
        let mut providers = HashMap::new();
        
        // Initialize providers based on configuration
        for config in provider_configs {
            let provider = match config.provider_type.as_str() {
                "oauth2" => AuthProvider::OAuth2 {
                    client_id: config.client_id.clone(),
                    client_secret: config.client_secret.clone(),
                    auth_url: format!("{}/auth", config.endpoint),
                    token_url: format!("{}/token", config.endpoint),
                },
                "jwt" => AuthProvider::JWT {
                    secret: config.client_secret.clone(),
                    algorithm: Algorithm::HS256,
                },
                "apikey" => AuthProvider::ApiKey {
                    keys: HashMap::new(),
                },
                "mtls" => AuthProvider::MTLS {
                    ca_cert_path: config.endpoint.clone(),
                    verify_client: true,
                },
                _ => return Err(anyhow!("Unsupported auth provider type: {}", config.provider_type)),
            };
            
            providers.insert(config.provider_type.clone(), provider);
        }
        
        // Default JWT secret if none provided
        let jwt_secret = providers.get("jwt")
            .and_then(|p| if let AuthProvider::JWT { secret, .. } = p { Some(secret.clone()) } else { None })
            .unwrap_or_else(|| "cbd_default_secret_change_in_production".to_string());
        
        Ok(Self {
            providers: Arc::new(RwLock::new(providers)),
            active_sessions: Arc::new(RwLock::new(HashMap::new())),
            jwt_secret,
        })
    }
    
    /// Validate authentication token (JWT, API key, etc.)
    pub async fn validate_token(&self, token: &str) -> Result<AuthToken> {
        // Try JWT validation first
        if let Ok(auth_token) = self.validate_jwt_token(token).await {
            return Ok(auth_token);
        }
        
        // Try API key validation
        if let Ok(auth_token) = self.validate_api_key(token).await {
            return Ok(auth_token);
        }
        
        Err(anyhow!("Invalid authentication token"))
    }
    
    /// Generate JWT token for authenticated user
    pub async fn generate_jwt_token(&self, user_id: &str, scope: Vec<String>) -> Result<String> {
        let now = Utc::now();
        let expires_at = now + Duration::hours(24);
        
        let claims = JwtClaims {
            sub: user_id.to_string(),
            exp: expires_at.timestamp(),
            iat: now.timestamp(),
            jti: Uuid::new_v4().to_string(),
            scope,
        };
        
        let header = Header::new(Algorithm::HS256);
        let encoding_key = EncodingKey::from_secret(self.jwt_secret.as_ref());
        
        encode(&header, &claims, &encoding_key)
            .context("Failed to encode JWT token")
    }
    
    /// Create API key for user
    pub async fn create_api_key(&self, user_id: &str, permissions: Vec<String>, expires_in_days: Option<u32>) -> Result<String> {
        let api_key = format!("cbd_{}", Uuid::new_v4().simple());
        let expires_at = expires_in_days.map(|days| Utc::now() + Duration::days(days as i64));
        
        let key_info = ApiKeyInfo {
            key_id: api_key.clone(),
            user_id: user_id.to_string(),
            created_at: Utc::now(),
            expires_at,
            permissions,
            rate_limit: Some(1000), // Default: 1000 requests per hour
        };
        
        let mut providers = self.providers.write().await;
        if let Some(AuthProvider::ApiKey { keys }) = providers.get_mut("apikey") {
            keys.insert(api_key.clone(), key_info);
        } else {
            let mut keys = HashMap::new();
            keys.insert(api_key.clone(), key_info);
            providers.insert("apikey".to_string(), AuthProvider::ApiKey { keys });
        }
        
        Ok(api_key)
    }
    
    /// Revoke API key
    pub async fn revoke_api_key(&self, api_key: &str) -> Result<()> {
        let mut providers = self.providers.write().await;
        if let Some(AuthProvider::ApiKey { keys }) = providers.get_mut("apikey") {
            keys.remove(api_key);
        }
        Ok(())
    }
    
    /// OAuth2 authentication flow initiation
    pub async fn initiate_oauth2_flow(&self, provider_type: &str, redirect_uri: &str) -> Result<String> {
        let providers = self.providers.read().await;
        if let Some(AuthProvider::OAuth2 { client_id, auth_url, .. }) = providers.get(provider_type) {
            let state = Uuid::new_v4().to_string();
            let auth_url = format!(
                "{}?client_id={}&redirect_uri={}&response_type=code&state={}&scope=openid email profile",
                auth_url, client_id, redirect_uri, state
            );
            Ok(auth_url)
        } else {
            Err(anyhow!("OAuth2 provider not configured: {}", provider_type))
        }
    }
    
    /// Handle OAuth2 callback and exchange code for token
    pub async fn handle_oauth2_callback(&self, provider_type: &str, code: &str) -> Result<AuthToken> {
        let providers = self.providers.read().await;
        if let Some(AuthProvider::OAuth2 { client_id, client_secret, token_url, .. }) = providers.get(provider_type) {
            // Exchange authorization code for access token
            // This is a simplified implementation - in production, you'd use a proper OAuth2 client
            let user_id = format!("oauth2_user_{}", &Uuid::new_v4().simple().to_string()[..8]);
            
            let auth_token = AuthToken {
                token_id: Uuid::new_v4(),
                user_id,
                issued_at: Utc::now(),
                expires_at: Utc::now() + Duration::hours(24),
                scope: vec!["read".to_string(), "write".to_string()],
                provider: provider_type.to_string(),
            };
            
            Ok(auth_token)
        } else {
            Err(anyhow!("OAuth2 provider not configured: {}", provider_type))
        }
    }
    
    /// Create user session
    pub async fn create_session(&self, user_id: &str, client_info: Option<(String, String)>) -> Result<Uuid> {
        let session_id = Uuid::new_v4();
        let (ip_address, user_agent) = client_info.unzip();
        
        let session = AuthSession {
            session_id,
            user_id: user_id.to_string(),
            created_at: Utc::now(),
            last_activity: Utc::now(),
            expires_at: Utc::now() + Duration::hours(24),
            ip_address,
            user_agent,
        };
        
        let mut sessions = self.active_sessions.write().await;
        sessions.insert(session_id, session);
        
        Ok(session_id)
    }
    
    /// Validate session and update last activity
    pub async fn validate_session(&self, session_id: Uuid) -> Result<String> {
        let mut sessions = self.active_sessions.write().await;
        if let Some(session) = sessions.get_mut(&session_id) {
            if session.expires_at > Utc::now() {
                session.last_activity = Utc::now();
                Ok(session.user_id.clone())
            } else {
                sessions.remove(&session_id);
                Err(anyhow!("Session expired"))
            }
        } else {
            Err(anyhow!("Invalid session"))
        }
    }
    
    /// Terminate user session
    pub async fn terminate_session(&self, session_id: Uuid) -> Result<()> {
        let mut sessions = self.active_sessions.write().await;
        sessions.remove(&session_id);
        Ok(())
    }
    
    /// Get count of active sessions
    pub async fn get_active_sessions_count(&self) -> Result<u64> {
        let sessions = self.active_sessions.read().await;
        let now = Utc::now();
        let active_count = sessions
            .values()
            .filter(|session| session.expires_at > now)
            .count() as u64;
        Ok(active_count)
    }
    
    /// Cleanup expired sessions
    pub async fn cleanup_expired_sessions(&self) -> Result<u32> {
        let mut sessions = self.active_sessions.write().await;
        let now = Utc::now();
        let initial_count = sessions.len();
        
        sessions.retain(|_, session| session.expires_at > now);
        
        Ok((initial_count - sessions.len()) as u32)
    }
    
    async fn validate_jwt_token(&self, token: &str) -> Result<AuthToken> {
        let decoding_key = DecodingKey::from_secret(self.jwt_secret.as_ref());
        let validation = Validation::new(Algorithm::HS256);
        
        let token_data = decode::<JwtClaims>(token, &decoding_key, &validation)
            .context("Failed to decode JWT token")?;
        
        let claims = token_data.claims;
        let expires_at = DateTime::from_timestamp(claims.exp, 0)
            .ok_or_else(|| anyhow!("Invalid expiration timestamp"))?;
        
        if expires_at <= Utc::now() {
            return Err(anyhow!("Token expired"));
        }
        
        Ok(AuthToken {
            token_id: Uuid::parse_str(&claims.jti)
                .context("Invalid token ID")?,
            user_id: claims.sub,
            issued_at: DateTime::from_timestamp(claims.iat, 0)
                .ok_or_else(|| anyhow!("Invalid issued at timestamp"))?,
            expires_at,
            scope: claims.scope,
            provider: "jwt".to_string(),
        })
    }
    
    async fn validate_api_key(&self, api_key: &str) -> Result<AuthToken> {
        let providers = self.providers.read().await;
        if let Some(AuthProvider::ApiKey { keys }) = providers.get("apikey") {
            if let Some(key_info) = keys.get(api_key) {
                // Check if key is expired
                if let Some(expires_at) = key_info.expires_at {
                    if expires_at <= Utc::now() {
                        return Err(anyhow!("API key expired"));
                    }
                }
                
                Ok(AuthToken {
                    token_id: Uuid::new_v4(),
                    user_id: key_info.user_id.clone(),
                    issued_at: key_info.created_at,
                    expires_at: key_info.expires_at.unwrap_or(Utc::now() + Duration::days(365)),
                    scope: key_info.permissions.clone(),
                    provider: "apikey".to_string(),
                })
            } else {
                Err(anyhow!("Invalid API key"))
            }
        } else {
            Err(anyhow!("API key authentication not configured"))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;
    
    #[tokio::test]
    async fn test_jwt_token_generation_and_validation() {
        let auth_manager = AuthenticationManager::new(&[]).await.unwrap();
        
        // Generate token
        let token = auth_manager.generate_jwt_token("test_user", vec!["read".to_string()]).await.unwrap();
        
        // Validate token
        let auth_token = auth_manager.validate_token(&token).await.unwrap();
        assert_eq!(auth_token.user_id, "test_user");
        assert!(auth_token.scope.contains(&"read".to_string()));
    }
    
    #[tokio::test]
    async fn test_api_key_creation_and_validation() {
        let auth_manager = AuthenticationManager::new(&[]).await.unwrap();
        
        // Create API key
        let api_key = auth_manager.create_api_key("test_user", vec!["write".to_string()], Some(30)).await.unwrap();
        
        // Validate API key
        let auth_token = auth_manager.validate_token(&api_key).await.unwrap();
        assert_eq!(auth_token.user_id, "test_user");
        assert!(auth_token.scope.contains(&"write".to_string()));
    }
    
    #[tokio::test]
    async fn test_session_management() {
        let auth_manager = AuthenticationManager::new(&[]).await.unwrap();
        
        // Create session
        let session_id = auth_manager.create_session("test_user", None).await.unwrap();
        
        // Validate session
        let user_id = auth_manager.validate_session(session_id).await.unwrap();
        assert_eq!(user_id, "test_user");
        
        // Terminate session
        auth_manager.terminate_session(session_id).await.unwrap();
        
        // Session should be invalid now
        let result = auth_manager.validate_session(session_id).await;
        assert!(result.is_err());
    }
}
