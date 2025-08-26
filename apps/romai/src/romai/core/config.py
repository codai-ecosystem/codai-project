"""
Configuration management for RomAI system.

Centralized configuration handling with environment variable support
and validation.
"""

import os
from typing import Any, Dict, Optional
from dataclasses import dataclass, field


@dataclass
class DatabaseConfig:
    """Database configuration."""
    host: str = "localhost"
    port: int = 5432
    database: str = "romai"
    username: str = "romai_user"
    password: str = ""
    
    @classmethod
    def from_env(cls) -> "DatabaseConfig":
        """Create config from environment variables."""
        return cls(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "5432")),
            database=os.getenv("DB_NAME", "romai"),
            username=os.getenv("DB_USER", "romai_user"),
            password=os.getenv("DB_PASSWORD", "")
        )


@dataclass
class MLConfig:
    """Machine learning configuration."""
    model_cache_dir: str = "./.cache/models"
    max_context_length: int = 32768
    batch_size: int = 32
    device: str = "auto"  # "cpu", "cuda", "mps", or "auto"
    
    @classmethod
    def from_env(cls) -> "MLConfig":
        """Create config from environment variables."""
        return cls(
            model_cache_dir=os.getenv("MODEL_CACHE_DIR", "./.cache/models"),
            max_context_length=int(os.getenv("MAX_CONTEXT_LENGTH", "32768")),
            batch_size=int(os.getenv("BATCH_SIZE", "32")),
            device=os.getenv("ML_DEVICE", "auto")
        )


@dataclass
class ServerConfig:
    """Server configuration."""
    host: str = "0.0.0.0"
    port: int = 6101
    workers: int = 1
    debug: bool = False
    cors_enabled: bool = True
    
    @classmethod
    def from_env(cls) -> "ServerConfig":
        """Create config from environment variables."""
        return cls(
            host=os.getenv("SERVER_HOST", "0.0.0.0"),
            port=int(os.getenv("SERVER_PORT", "6101")),
            workers=int(os.getenv("SERVER_WORKERS", "1")),
            debug=os.getenv("DEBUG", "false").lower() == "true",
            cors_enabled=os.getenv("CORS_ENABLED", "true").lower() == "true"
        )


@dataclass
class RomAIConfig:
    """Main RomAI system configuration."""
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    ml: MLConfig = field(default_factory=MLConfig)
    server: ServerConfig = field(default_factory=ServerConfig)
    
    # Engine-specific settings
    enable_cultural_context: bool = True
    enable_romanian_processing: bool = True
    log_level: str = "INFO"
    
    # Performance settings
    max_concurrent_requests: int = 10
    request_timeout: float = 30.0
    cache_enabled: bool = True
    
    def __post_init__(self):
        """Post-initialization validation."""
        self._validate_config()
    
    def _validate_config(self):
        """Validate configuration values."""
        if self.server.port < 1 or self.server.port > 65535:
            raise ValueError(f"Invalid port: {self.server.port}")
            
        if self.ml.max_context_length < 1:
            raise ValueError(f"Invalid max_context_length: {self.ml.max_context_length}")
            
        if self.request_timeout <= 0:
            raise ValueError(f"Invalid request_timeout: {self.request_timeout}")
    
    @classmethod
    def from_env(cls) -> "RomAIConfig":
        """Create complete config from environment variables."""
        return cls(
            database=DatabaseConfig.from_env(),
            ml=MLConfig.from_env(),
            server=ServerConfig.from_env(),
            enable_cultural_context=os.getenv("ENABLE_CULTURAL_CONTEXT", "true").lower() == "true",
            enable_romanian_processing=os.getenv("ENABLE_ROMANIAN_PROCESSING", "true").lower() == "true",
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            max_concurrent_requests=int(os.getenv("MAX_CONCURRENT_REQUESTS", "10")),
            request_timeout=float(os.getenv("REQUEST_TIMEOUT", "30.0")),
            cache_enabled=os.getenv("CACHE_ENABLED", "true").lower() == "true"
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "database": {
                "host": self.database.host,
                "port": self.database.port,
                "database": self.database.database,
                "username": self.database.username,
            },
            "ml": {
                "model_cache_dir": self.ml.model_cache_dir,
                "max_context_length": self.ml.max_context_length,
                "batch_size": self.ml.batch_size,
                "device": self.ml.device,
            },
            "server": {
                "host": self.server.host,
                "port": self.server.port,
                "workers": self.server.workers,
                "debug": self.server.debug,
                "cors_enabled": self.server.cors_enabled,
            },
            "features": {
                "enable_cultural_context": self.enable_cultural_context,
                "enable_romanian_processing": self.enable_romanian_processing,
            },
            "performance": {
                "max_concurrent_requests": self.max_concurrent_requests,
                "request_timeout": self.request_timeout,
                "cache_enabled": self.cache_enabled,
            }
        }


# Global config instance
config = RomAIConfig.from_env()