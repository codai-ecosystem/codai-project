//! Error types for CBD Engine

use thiserror::Error;

/// CBD Engine error types
#[derive(Error, Debug)]
pub enum CBDError {
    #[error("Storage error: {0}")]
    StorageError(String),
    
    #[error("Vector index error: {0}")]
    VectorIndexError(String),
    
    #[error("Transaction error: {0}")]
    TransactionError(String),
    
    #[error("Cluster error: {0}")]
    ClusterError(String),
    
    #[error("Security error: {0}")]
    SecurityError(String),
    
    #[error("Cryptography error: {0}")]
    CryptoError(String),
    
    #[error("Authentication error: {0}")]
    AuthenticationError(String),
    
    #[error("Encryption error: {0}")]
    EncryptionError(String),
    
    #[error("Audit error: {0}")]
    AuditError(String),
    
    #[error("Not implemented: {0}")]
    NotImplemented(String),
    
    #[error("Serialization error: {0}")]
    SerializationError(String),
    
    #[error("Configuration error: {0}")]
    ConfigError(String),
    
    #[error("Network error: {0}")]
    NetworkError(String),
    
    #[error("Parsing error: {0}")]
    ParsingError(String),
    
    #[error("API error: {0}")]
    ApiError(String),
    
    #[error("Request timeout: {0}")]
    TimeoutError(String),
    
    #[error("Memory operation error: {0}")]
    MemoryError(String),
    
    #[error("Context error: {0}")]
    ContextError(String),
    
    #[error("Search error: {0}")]
    SearchError(String),
    
    #[error("Fallback storage error: {0}")]
    FallbackError(String),
    
    #[error("Connection error: {0}")]
    ConnectionError(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("HTTP error: {0}")]
    HttpError(String),
    
    // Legacy error types used in memory modules
    #[error("Storage error: {0}")]
    Storage(String),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Parsing error: {0}")]
    Parsing(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("API error: {0}")]
    Api(String),
    
    #[error("Request timeout: {0}")]
    Timeout(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Internal error: {0}")]
    InternalError(String),
    
    #[error("Locking error: {0}")]
    LockingError(String),
    
    #[error("Deadlock detected: {0}")]
    DeadlockDetected(String),
    
    #[error("MVCC error: {0}")]
    MVCCError(String),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("SQLite error: {0}")]
    SqliteError(#[from] rusqlite::Error),
    
    #[error("Serde JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
    
    #[error("Reqwest error: {0}")]
    ReqwestError(#[from] reqwest::Error),
    
    #[error("UUID error: {0}")]
    UuidError(#[from] uuid::Error),
    
    #[cfg(feature = "rocksdb")]
    #[error("RocksDB error: {0}")]
    RocksDBError(#[from] rocksdb::Error),
}

impl CBDError {
    pub fn error_code(&self) -> u32 {
        match self {
            CBDError::StorageError(_) => 1001,
            CBDError::VectorIndexError(_) => 1002,
            CBDError::TransactionError(_) => 1003,
            CBDError::ClusterError(_) => 1004,
            CBDError::SecurityError(_) => 1005,
            CBDError::CryptoError(_) => 1006,
            CBDError::AuthenticationError(_) => 1007,
            CBDError::EncryptionError(_) => 1008,
            CBDError::AuditError(_) => 1009,
            CBDError::NotImplemented(_) => 1010,
            CBDError::SerializationError(_) => 1011,
            CBDError::ConfigError(_) => 1012,
            CBDError::NetworkError(_) => 1013,
            CBDError::ParsingError(_) => 1014,
            CBDError::ApiError(_) => 1015,
            CBDError::TimeoutError(_) => 1016,
            CBDError::MemoryError(_) => 1017,
            CBDError::ContextError(_) => 1018,
            CBDError::SearchError(_) => 1019,
            CBDError::FallbackError(_) => 1020,
            CBDError::ConnectionError(_) => 1021,
            CBDError::DatabaseError(_) => 1022,
            CBDError::HttpError(_) => 1023,
            CBDError::InvalidInput(_) => 1024,
            CBDError::NotFound(_) => 1025,
            CBDError::InternalError(_) => 1026,
            CBDError::LockingError(_) => 1027,
            CBDError::DeadlockDetected(_) => 1028,
            CBDError::MVCCError(_) => 1029,
            // Legacy error types
            CBDError::Storage(_) => 1030,
            CBDError::Network(_) => 1031,
            CBDError::Serialization(_) => 1032,
            CBDError::Parsing(_) => 1033,
            CBDError::Config(_) => 1034,
            CBDError::Api(_) => 1035,
            CBDError::Timeout(_) => 1036,
            CBDError::IoError(_) => 2001,
            CBDError::SqliteError(_) => 2002,
            CBDError::JsonError(_) => 2003,
            CBDError::ReqwestError(_) => 2004,
            CBDError::UuidError(_) => 2005,
            #[cfg(feature = "rocksdb")]
            CBDError::RocksDBError(_) => 2006,
        }
    }

    pub fn is_retriable(&self) -> bool {
        matches!(self, 
            CBDError::NetworkError(_) | 
            CBDError::IoError(_) |
            CBDError::InternalError(_) |
            CBDError::TimeoutError(_) |
            CBDError::ConnectionError(_) |
            // Legacy error types
            CBDError::Network(_) |
            CBDError::Timeout(_)
        )
    }
}

/// CBD Engine Result type
pub type Result<T> = std::result::Result<T, CBDError>;
