"""
RomAI Configuration System
Centralized configuration for all AI services and engines
"""
import os
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class AzureOpenAIConfig:
    """Azure OpenAI configuration"""
    endpoint: str
    api_key: str
    deployment_name: str
    api_version: str = "2024-02-01"
    max_tokens: int = 4000
    temperature: float = 0.7

@dataclass
class RomAIConfig:
    """Complete RomAI system configuration"""
    # Azure OpenAI configuration
    azure_openai: AzureOpenAIConfig
    
    # System configuration
    debug: bool = True
    log_level: str = "INFO"
    max_context_length: int = 8000
    
    # Romanian-specific configuration
    romanian_regions: list = None
    cultural_knowledge_depth: str = "comprehensive"
    
    def __post_init__(self):
        if self.romanian_regions is None:
            self.romanian_regions = [
                "Transilvania", "Muntenia", "Moldova", "Oltenia", 
                "Dobrogea", "Banat", "Crișana", "Maramureș", "Bucovina"
            ]

def get_romai_config() -> RomAIConfig:
    """
    Get RomAI configuration from environment variables or defaults
    """
    # Try to get Azure OpenAI configuration from environment
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "https://swedencentral.api.cognitive.microsoft.com/")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY", "8f9d3fd033c04f5ab6b5886c15f16a2c")
    azure_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "text-embedding-3-large")
    
    # For Romanian cultural analysis, we need a chat completion model
    # Check if we have a specific chat model deployment
    chat_deployment = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "gpt-4o")
    
    azure_config = AzureOpenAIConfig(
        endpoint=azure_endpoint,
        api_key=azure_api_key,
        deployment_name=chat_deployment,  # Use chat model for cultural analysis
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        max_tokens=int(os.getenv("AZURE_OPENAI_MAX_TOKENS", "4000")),
        temperature=float(os.getenv("AZURE_OPENAI_TEMPERATURE", "0.7"))
    )
    
    config = RomAIConfig(
        azure_openai=azure_config,
        debug=os.getenv("ROMAI_DEBUG", "true").lower() == "true",
        log_level=os.getenv("ROMAI_LOG_LEVEL", "INFO"),
        max_context_length=int(os.getenv("ROMAI_MAX_CONTEXT", "8000")),
        cultural_knowledge_depth=os.getenv("ROMAI_CULTURAL_DEPTH", "comprehensive")
    )
    
    return config

# Global configuration instance
romai_config = get_romai_config()