"""
RomAI Configuration Management
==============================

Centralized configuration management for the RomAI AGI system.
"""

import os
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class RomAIConfig:
    """Central configuration for RomAI AGI system"""
    
    # Core system settings
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    
    # Model settings
    model_name: str = "romai-agi-v1"
    model_version: str = "1.0.0"
    max_sequence_length: int = 8192
    embedding_dimension: int = 1024
    
    # Romanian cultural settings
    default_region: str = "Muntenia"
    cultural_weight: float = 0.95
    authenticity_threshold: float = 0.9
    
    # Performance settings
    batch_size: int = 32
    num_workers: int = 4
    device: str = "cuda"
    mixed_precision: bool = True
    
    # Paths
    model_path: str = "data/models"
    data_path: str = "data/datasets"
    cache_path: str = "data/cache"
    log_path: str = "logs"
    
    # API settings
    api_host: str = "localhost"
    api_port: int = 8000
    api_workers: int = 1
    
    # Additional settings
    extra_config: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_file(cls, config_path: str) -> "RomAIConfig":
        """Load configuration from JSON file"""
        if not os.path.exists(config_path):
            return cls()
        
        with open(config_path, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        
        return cls(**config_data)
    
    @classmethod
    def from_env(cls) -> "RomAIConfig":
        """Load configuration from environment variables"""
        config = cls()
        
        # Override with environment variables if they exist
        config.environment = os.getenv("ROMAI_ENV", config.environment)
        config.debug = os.getenv("ROMAI_DEBUG", str(config.debug)).lower() == "true"
        config.log_level = os.getenv("ROMAI_LOG_LEVEL", config.log_level)
        config.device = os.getenv("ROMAI_DEVICE", config.device)
        config.api_host = os.getenv("ROMAI_API_HOST", config.api_host)
        config.api_port = int(os.getenv("ROMAI_API_PORT", str(config.api_port)))
        
        return config
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return {
            "environment": self.environment,
            "debug": self.debug,
            "log_level": self.log_level,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "max_sequence_length": self.max_sequence_length,
            "embedding_dimension": self.embedding_dimension,
            "default_region": self.default_region,
            "cultural_weight": self.cultural_weight,
            "authenticity_threshold": self.authenticity_threshold,
            "batch_size": self.batch_size,
            "num_workers": self.num_workers,
            "device": self.device,
            "mixed_precision": self.mixed_precision,
            "model_path": self.model_path,
            "data_path": self.data_path,
            "cache_path": self.cache_path,
            "log_path": self.log_path,
            "api_host": self.api_host,
            "api_port": self.api_port,
            "api_workers": self.api_workers,
            **self.extra_config
        }
    
    def save(self, config_path: str):
        """Save configuration to JSON file"""
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)


# Global configuration instance
_config: Optional[RomAIConfig] = None


def get_config() -> RomAIConfig:
    """Get the global configuration instance"""
    global _config
    if _config is None:
        _config = RomAIConfig.from_env()
    return _config


def set_config(config: RomAIConfig):
    """Set the global configuration instance"""
    global _config
    _config = config
