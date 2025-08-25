"""
RomAI Configuration Management

Environment-based configuration system following 12-factor app principles.
"""

import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    app_name: str = "RomAI AGI System"
    version: str = "2.0.0"
    environment: str = "development"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 6101
    workers: int = 1
    
    # Database
    redis_url: str = "redis://localhost:6379"
    database_url: str = "sqlite:///./romai.db"
    
    # ML Models
    model_path: str = "./models"
    max_model_memory: int = 4096  # MB
    
    # Security
    secret_key: str = "romai-secret-key-2025"
    api_key_required: bool = True
    allowed_origins: List[str] = ["*"]
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
